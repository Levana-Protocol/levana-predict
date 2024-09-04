use std::cell::RefCell;

use cosmwasm_std::Addr;
use cw_multi_test::{error::AnyResult, App, AppResponse, ContractWrapper, Executor};
use proptest::prelude::*;

use crate::{execute::to_stored_outcome, prelude::*};

struct Predict {
    app: RefCell<App>,
    contract: Addr,
    admin: Addr,
    arbitrator: Addr,
    house: Addr,
    id: MarketId,
    better: Addr,
}

const DENOM: &str = "satoshi";

impl Predict {
    fn new() -> Self {
        let admin = Addr::unchecked("admin");
        let arbitrator = Addr::unchecked("arbitrator");
        let house = Addr::unchecked("house");
        let better = Addr::unchecked("better");
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
            router
                .bank
                .init_balance(
                    storage,
                    &better,
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
            app: RefCell::new(app),
            admin,
            contract,
            arbitrator,
            house,
            id: MarketId(1),
            better,
        }
    }

    fn execute(
        &self,
        sender: &Addr,
        msg: &ExecuteMsg,
        funds: Option<u64>,
    ) -> AnyResult<AppResponse> {
        let helper = |funds| {
            self.app.borrow_mut().execute_contract(
                sender.clone(),
                self.contract.clone(),
                msg,
                funds,
            )
        };
        match funds {
            Some(funds) => helper(&[Coin {
                denom: DENOM.to_owned(),
                amount: funds.into(),
            }]),
            None => helper(&[]),
        }
    }

    fn set_winner(&self, sender: &Addr, outcome: u8) -> AnyResult<AppResponse> {
        self.execute(
            sender,
            &ExecuteMsg::SetWinner {
                id: self.id,
                outcome: outcome.into(),
            },
            None,
        )
    }

    fn jump_days(&self, days: u64) {
        self.app.borrow_mut().update_block(|b| {
            b.height += days * 100;
            b.time = b.time.plus_days(days);
        })
    }

    fn query_balance(&self, addr: &Addr) -> StdResult<Uint128> {
        let Coin { denom, amount } = self.app.borrow().wrap().query_balance(addr, DENOM)?;
        assert_eq!(denom, DENOM);
        Ok(amount)
    }

    fn place_bet(&self, sender: &Addr, outcome: u8, funds: u64) -> AnyResult<AppResponse> {
        self.execute(
            sender,
            &ExecuteMsg::Deposit {
                id: self.id,
                outcome: outcome.into(),
            },
            Some(funds),
        )
    }

    fn query<T: serde::de::DeserializeOwned>(&self, msg: &QueryMsg) -> StdResult<T> {
        self.app
            .borrow()
            .wrap()
            .query_wasm_smart(&self.contract, msg)
    }

    fn query_tokens(&self, better: &Addr, outcome: u8) -> StdResult<Token> {
        let PositionsResp { outcomes } = self.query(&QueryMsg::Positions {
            id: self.id,
            addr: better.to_string(),
        })?;
        outcomes
            .get(usize::from(outcome))
            .copied()
            .ok_or_else(|| StdError::GenericErr {
                msg: "Invalid outcome ID provided to query_tokens".to_owned(),
            })
    }

    fn withdraw(&self, addr: &Addr, outcome: u8, tokens: Token) -> AnyResult<AppResponse> {
        self.execute(
            addr,
            &ExecuteMsg::Withdraw {
                id: self.id,
                outcome: outcome.into(),
                tokens,
            },
            None,
        )
    }

    fn collect(&self, addr: &Addr) -> AnyResult<AppResponse> {
        self.execute(addr, &ExecuteMsg::Collect { id: self.id }, None)
    }

    fn query_wallet_count(&self) -> StdResult<(u32, Vec<u32>)> {
        let resp = self.query::<MarketResp>(&QueryMsg::Market { id: self.id })?;
        Ok((
            resp.total_wallets,
            resp.outcomes.iter().map(|o| o.wallets).collect(),
        ))
    }
}

#[test]
fn non_admin_cannot_add_market() {
    let app = Predict::new();
    let params = AddMarketParams {
        title: "Test market".to_owned(),
        description: "Test description".to_owned(),
        arbitrator: app.arbitrator.clone().to_string(),
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
        withdrawal_stop_date: app.app.borrow().block_info().time.plus_days(1),
        deposit_stop_date: app.app.borrow().block_info().time.plus_days(2),
        house: app.house.clone().into_string(),
    };
    // Better is try to add a market
    app.app
        .borrow_mut()
        .execute_contract(
            app.better.clone(),
            app.contract.clone(),
            &ExecuteMsg::AddMarket {
                params: params.into(),
            },
            &[Coin {
                denom: DENOM.to_owned(),
                amount: 1000u16.into(),
            }],
        )
        .unwrap_err();
}

#[test]
fn sanity() {
    let app = Predict::new();
    app.jump_days(3);
    let amount_before = app.query_balance(&app.house).unwrap();
    assert_eq!(Uint128::from(0u16), amount_before);

    // Admin cannot set the winner
    app.set_winner(&app.admin, 0).unwrap_err();

    // Arbitrator can set the winner
    app.set_winner(&app.arbitrator, 0).unwrap();

    let amount_after = app.query_balance(&app.house).unwrap();
    assert_eq!(Uint128::from(1000u16), amount_after);
}

#[test]
fn losing_bet() {
    let app = Predict::new();

    // Arbitrator doesn't have any funds
    app.place_bet(&app.arbitrator, 1, 1_000).unwrap_err();

    app.place_bet(&app.better, 1, 1_000).unwrap();

    app.jump_days(3);
    let better_before = app.query_balance(&app.better).unwrap();

    let house_before = app.query_balance(&app.house).unwrap();
    assert_eq!(house_before, Uint128::from(0u16));

    app.set_winner(&app.arbitrator, 0).unwrap();
    let better_after = app.query_balance(&app.better).unwrap();
    assert_eq!(better_before, better_after);

    let house_after = app.query_balance(&app.house).unwrap();
    assert_eq!(Uint128::from(2000u16), house_after);
}

#[test]
fn withdrawal_leaves_money() {
    let app = Predict::new();

    let bet_amount = 1_000u64;
    // Arbitrator doesn't have any funds
    app.place_bet(&app.arbitrator, 1, bet_amount).unwrap_err();

    let better_before = app.query_balance(&app.better).unwrap();
    let tokens1 = app.query_tokens(&app.better, 1).unwrap();
    assert_eq!(tokens1, Token::zero());
    app.place_bet(&app.better, 1, bet_amount).unwrap();
    let tokens2 = app.query_tokens(&app.better, 1).unwrap();
    assert_ne!(tokens2, Token::zero());
    app.withdraw(&app.better, 1, tokens2 + tokens2).unwrap_err();
    app.withdraw(&app.better, 1, tokens2).unwrap();
    let tokens3 = app.query_tokens(&app.better, 1).unwrap();
    assert_eq!(tokens3, Token::zero());
    let better_after = app.query_balance(&app.better).unwrap();

    // Make sure we left money behind for fees
    assert!(better_before > better_after);

    app.jump_days(3);
    app.set_winner(&app.arbitrator, 0).unwrap();
    let better_final = app.query_balance(&app.better).unwrap();

    // No change in better balance because he lost the bet (and also
    // we didn't collect yet)
    assert_eq!(better_after, better_final);

    // We try to collect and fail since we do not have any winning
    // outcome tokens
    app.collect(&app.better).unwrap_err();

    let house_after = app.query_balance(&app.house).unwrap();
    assert_eq!(
        Uint128::from(1000u16) + better_before - better_after,
        house_after
    );
}

#[test]
fn winning_bet() {
    let app = Predict::new();

    app.place_bet(&app.better, 0, 1_000).unwrap();

    app.jump_days(3);

    let better_before = app.query_balance(&app.better).unwrap();
    app.set_winner(&app.arbitrator, 0).unwrap();

    app.collect(&app.better).unwrap();
    app.collect(&app.better).unwrap_err();
    app.collect(&app.arbitrator).unwrap_err();
    let better_after = app.query_balance(&app.better).unwrap();

    assert!(better_before < better_after);

    let house_after = app.query_balance(&app.house).unwrap();
    assert!(Uint128::from(1000u16) > house_after);
}

#[test]
fn wrong_time() {
    let app = Predict::new();

    app.set_winner(&app.arbitrator, 0).unwrap_err();

    app.place_bet(&app.better, 0, 1000).unwrap();
    app.withdraw(&app.better, 0, app.query_tokens(&app.better, 0).unwrap())
        .unwrap();
    app.collect(&app.better).unwrap_err();

    // Withdrawals paused but deposits are active
    app.jump_days(1);
    app.place_bet(&app.better, 0, 1000).unwrap();
    app.withdraw(&app.better, 0, app.query_tokens(&app.better, 0).unwrap())
        .unwrap_err();
    app.set_winner(&app.arbitrator, 0).unwrap_err();
    app.collect(&app.better).unwrap_err();

    // Deposits paused too
    app.jump_days(1);
    app.place_bet(&app.better, 0, 1000).unwrap_err();
    app.withdraw(&app.better, 0, app.query_tokens(&app.better, 0).unwrap())
        .unwrap_err();
    app.set_winner(&app.arbitrator, 0).unwrap();
    app.collect(&app.better).unwrap();
}

#[test]
fn invalid_outcome_ids() {
    let app = Predict::new();

    app.place_bet(&app.better, 0, 1_000).unwrap();
    app.place_bet(&app.better, 1, 1_000).unwrap();
    app.place_bet(&app.better, 2, 1_000).unwrap_err();
    let tokens0 = app.query_tokens(&app.better, 0).unwrap();
    let tokens1 = app.query_tokens(&app.better, 1).unwrap();
    app.query_tokens(&app.better, 2).unwrap_err();
    assert_ne!(tokens0, Token::zero());
    assert_ne!(tokens1, Token::zero());
    app.withdraw(&app.better, 0, tokens0).unwrap();
    app.withdraw(&app.better, 1, tokens1).unwrap();
    app.withdraw(&app.better, 2, tokens1).unwrap_err();
    app.withdraw(&app.better, 2, Token::zero()).unwrap_err();

    app.jump_days(3);

    app.set_winner(&app.arbitrator, 2).unwrap_err();
    app.set_winner(&app.arbitrator, 0).unwrap();
}

#[test]
fn wallet_count() {
    let app = Predict::new();

    assert_eq!(app.query_wallet_count().unwrap(), (0, vec![0, 0]));

    app.place_bet(&app.better, 0, 1_000).unwrap();
    assert_eq!(app.query_wallet_count().unwrap(), (1, vec![1, 0]));

    app.place_bet(&app.better, 1, 1_000).unwrap();
    assert_eq!(app.query_wallet_count().unwrap(), (1, vec![1, 1]));

    app.place_bet(&app.admin, 0, 1_000).unwrap();
    assert_eq!(app.query_wallet_count().unwrap(), (2, vec![2, 1]));

    let tokens0 = app.query_tokens(&app.better, 0).unwrap();
    app.withdraw(&app.better, 0, tokens0).unwrap();
    assert_eq!(app.query_wallet_count().unwrap(), (2, vec![1, 1]));

    let tokens1 = app.query_tokens(&app.better, 1).unwrap();
    app.withdraw(&app.better, 1, tokens1).unwrap();
    assert_eq!(app.query_wallet_count().unwrap(), (1, vec![1, 0]));

    let tokens0 = app.query_tokens(&app.admin, 0).unwrap();
    app.withdraw(&app.admin, 0, tokens0).unwrap();
    assert_eq!(app.query_wallet_count().unwrap(), (0, vec![0, 0]));
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
    let (outcomes, total) = to_stored_outcome(outcomes).unwrap();
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
        total_wallets: 0
    };
    let yes_id = OutcomeId::from(0);
    let yes_tokens = stored.buy(yes_id, buy).unwrap();
    let mut mid_variant = Decimal256::one();
    for outcome in &stored.outcomes {
        mid_variant *= outcome.pool_tokens.0;
    }

    let _funds = stored.sell(yes_id, yes_tokens).unwrap();

    let mut new_variant = Decimal256::one();
    for outcome in &stored.outcomes {
        new_variant *= outcome.pool_tokens.0;
    }

    let diff1 = original_variant.abs_diff(new_variant);
    let diff2 = original_variant.abs_diff(mid_variant);

    assert!(diff1 < Decimal256::from_ratio(1u32, 10u32));
    assert!(diff2 < Decimal256::from_ratio(1u32, 10u32));
}
}
