use cosmwasm_std::Addr;
use cw_multi_test::{error::AnyResult, App, AppResponse, ContractWrapper, Executor};
use proptest::prelude::*;

use crate::{execute::to_stored_outcome, prelude::*};

struct Predict {
    app: App,
    contract: Addr,
    admin: Addr,
    arbitrator: Addr,
    house: Addr,
    id: MarketId,
}

const DENOM: &str = "satoshi";

impl Predict {
    fn new() -> Self {
        let admin = Addr::unchecked("admin");
        let arbitrator = Addr::unchecked("arbitrator");
        let house = Addr::unchecked("house");
        let mut app = App::new(|router, _, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &admin,
                    vec![Coin {
                        denom: DENOM.to_owned(),
                        amount: 1_000_000_000u32.into(),
                    }],
                )
                .unwrap();
        });
        let wrapper = Box::new(ContractWrapper::new(
            crate::execute,
            crate::instantiate,
            crate::query,
        ));
        let id = app.store_code(wrapper);
        let contract = app
            .instantiate_contract(
                id,
                admin.clone(),
                &InstantiateMsg {
                    admin: admin.clone().into_string(),
                },
                &[],
                "predict",
                None,
            )
            .unwrap();
        let params = AddMarketParams {
            title: "Test market".to_owned(),
            description: "Test description".to_owned(),
            arbitrator: arbitrator.clone().into_string(),
            outcomes: vec![
                OutcomeDef {
                    label: "Yes".to_owned(),
                    initial_amount: Collateral(100u16.into()),
                },
                OutcomeDef {
                    label: "No".to_owned(),
                    initial_amount: Collateral(900u16.into()),
                },
            ],
            denom: DENOM.to_owned(),
            deposit_fee: "0.01".parse().unwrap(),
            withdrawal_fee: "0.01".parse().unwrap(),
            withdrawal_stop_date: app.block_info().time.plus_days(1),
            deposit_stop_date: app.block_info().time.plus_days(2),
            house: house.clone().into_string(),
        };
        app.execute_contract(
            admin.clone(),
            contract.clone(),
            &ExecuteMsg::AddMarket {
                params: params.into(),
            },
            &[Coin {
                denom: DENOM.to_owned(),
                amount: 1000u16.into(),
            }],
        )
        .unwrap();
        Predict {
            app,
            admin,
            contract,
            arbitrator,
            house,
            id: MarketId(1),
        }
    }

    fn execute(
        &mut self,
        sender: &Addr,
        msg: &ExecuteMsg,
        funds: Option<u64>,
    ) -> AnyResult<AppResponse> {
        let mut helper = |funds| {
            self.app
                .execute_contract(sender.clone(), self.contract.clone(), msg, funds)
        };
        match funds {
            Some(funds) => helper(&[Coin {
                denom: DENOM.to_owned(),
                amount: funds.into(),
            }]),
            None => helper(&[]),
        }
    }
}

#[test]
fn sanity() {
    let mut app = Predict::new();
    app.app.update_block(|b| {
        b.height += 200;
        b.time = b.time.plus_days(3);
    });
    let id = app.id;
    let admin = app.admin.clone();
    app.execute(
        &admin,
        &ExecuteMsg::SetWinner {
            id,
            outcome: OutcomeId(1),
        },
        None,
    )
    .unwrap_err();
    let arb = app.arbitrator.clone();

    app.execute(
        &arb,
        &ExecuteMsg::SetWinner {
            id,
            outcome: OutcomeId(1),
        },
        None,
    )
    .unwrap();

    let Coin {
        denom: _,
        amount: amount_after,
    } = app
        .app
        .wrap()
        .query_balance(app.house.clone(), DENOM)
        .unwrap();
    assert_eq!(Uint128::from(1000u16), amount_after);
}

proptest! {
#[test]
fn test_cpmm_buy_sell(pool_one in 1..1000u32, pool_two in 1..1000u32, buy in 2..50u32) {
    let pool_one_collateral = Collateral(pool_one.into());
    let pool_two_collateral = Collateral(pool_two.into());

    let buy = pool_one_collateral * Decimal256::from_ratio(1u32, buy);
    let buy = buy.unwrap();

    let pool_one = OutcomeDef {
        label: "Yes".to_owned(),
        initial_amount: pool_one_collateral,
    };
    let pool_two = OutcomeDef {
        label: "No".to_owned(),
        initial_amount: pool_two_collateral,
    };
    let outcomes = vec![pool_one, pool_two];
    let (outcomes, total) = to_stored_outcome(outcomes);
    let mut original_variant = Decimal256::one();
    for outcome in &outcomes {
        original_variant *= outcome.pool_tokens.0;
    }

    let ts = Timestamp::from_nanos(1_000_000_202);

    let mut stored = StoredMarket {
        id: MarketId::one(),
        title: "ATOM_USDT".to_owned(),
        description: "Some desc".to_owned(),
        arbitrator: Addr::unchecked("arbitrator"),
        outcomes,
        denom: DENOM.to_owned(),
        deposit_fee: "0.01".parse().unwrap(),
        withdrawal_fee: "0.01".parse().unwrap(),
        pool_size: total,
        deposit_stop_date: ts.plus_days(2),
        withdrawal_stop_date: ts.plus_days(1),
        winner: None,
        house: Addr::unchecked("house"),
    };
    let yes_id = OutcomeId(1);
    let yes_tokens = stored.buy(yes_id, buy).unwrap();
    let _funds = stored.sell(yes_id, yes_tokens).unwrap();

    let mut new_variant = Decimal256::one();
    for outcome in &stored.outcomes {
        new_variant *= outcome.pool_tokens.0;
    }

    let diff = original_variant.abs_diff(new_variant);

    assert!(diff < Decimal256::from_ratio(1u32, 10u32));
}
}
