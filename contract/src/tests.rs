use std::cell::RefCell;

use cosmwasm_std::Addr;
use cw_multi_test::{error::AnyResult, App, AppResponse, ContractWrapper, Executor};

use crate::prelude::*;

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

    fn set_winner(&self, sender: &Addr, outcome: OutcomeId) -> AnyResult<AppResponse> {
        self.execute(
            sender,
            &ExecuteMsg::SetWinner {
                id: self.id,
                outcome,
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

    fn place_bet(&self, sender: &Addr, outcome: OutcomeId, funds: u64) -> AnyResult<AppResponse> {
        self.execute(
            sender,
            &ExecuteMsg::Deposit {
                id: self.id,
                outcome,
            },
            Some(funds),
        )
    }

    fn query_tokens(&self, better: &Addr, outcome: OutcomeId) -> StdResult<Token> {
        let PositionsResp { outcomes } = self.app.borrow().wrap().query_wasm_smart(
            &self.contract,
            &QueryMsg::Positions {
                id: self.id,
                addr: better.to_string(),
            },
        )?;
        Ok(outcomes.get(usize::from(outcome.0 - 1)).copied().unwrap())
    }

    fn withdraw(&self, addr: &Addr, outcome: OutcomeId, tokens: Token) -> AnyResult<AppResponse> {
        self.execute(
            addr,
            &ExecuteMsg::Withdraw {
                id: self.id,
                outcome,
                tokens,
            },
            None,
        )
    }

    fn collect(&self, addr: &Addr) -> AnyResult<AppResponse> {
        self.execute(addr, &ExecuteMsg::Collect { id: self.id }, None)
    }
}

#[test]
fn sanity() {
    let app = Predict::new();
    app.jump_days(3);
    app.set_winner(&app.admin, OutcomeId(1)).unwrap_err();

    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap();

    let amount_after = app.query_balance(&app.house).unwrap();
    assert_eq!(Uint128::from(1000u16), amount_after);
}

#[test]
fn losing_bet() {
    let app = Predict::new();

    // No funds
    app.place_bet(&app.arbitrator, OutcomeId(2), 1_000)
        .unwrap_err();

    app.place_bet(&app.better, OutcomeId(2), 1_000).unwrap();

    app.jump_days(3);

    let better_before = app.query_balance(&app.better).unwrap();
    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap();
    let better_after = app.query_balance(&app.better).unwrap();

    assert_eq!(better_before, better_after);

    let house_after = app.query_balance(&app.house).unwrap();
    assert_eq!(Uint128::from(2000u16), house_after);
}

#[test]
fn withdrawal_leaves_money() {
    let app = Predict::new();

    // No funds
    app.place_bet(&app.arbitrator, OutcomeId(2), 1_000)
        .unwrap_err();

    let better_before = app.query_balance(&app.better).unwrap();
    let tokens1 = app.query_tokens(&app.better, OutcomeId(2)).unwrap();
    assert_eq!(tokens1, Token::zero());
    app.place_bet(&app.better, OutcomeId(2), 1_000).unwrap();
    let tokens2 = app.query_tokens(&app.better, OutcomeId(2)).unwrap();
    assert_ne!(tokens2, Token::zero());
    app.withdraw(&app.better, OutcomeId(2), tokens2 + tokens2)
        .unwrap_err();
    app.withdraw(&app.better, OutcomeId(2), tokens2).unwrap();
    let tokens3 = app.query_tokens(&app.better, OutcomeId(2)).unwrap();
    assert_eq!(tokens3, Token::zero());
    let better_after = app.query_balance(&app.better).unwrap();

    // Make sure we left money behind for fees
    assert!(better_before > better_after);

    app.jump_days(3);

    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap();
    let better_final = app.query_balance(&app.better).unwrap();

    assert_eq!(better_after, better_final);

    let house_after = app.query_balance(&app.house).unwrap();
    assert_eq!(
        Uint128::from(1000u16) + better_before - better_after,
        house_after
    );
}

#[test]
fn winning_bet() {
    let app = Predict::new();

    app.place_bet(&app.better, OutcomeId(1), 1_000).unwrap();

    app.jump_days(3);

    let better_before = app.query_balance(&app.better).unwrap();
    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap();

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

    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap_err();

    app.place_bet(&app.better, OutcomeId(1), 1000).unwrap();
    app.withdraw(
        &app.better,
        OutcomeId(1),
        app.query_tokens(&app.better, OutcomeId(1)).unwrap(),
    )
    .unwrap();
    app.collect(&app.better).unwrap_err();

    // Withdrawals paused but deposits are active
    app.jump_days(1);
    app.place_bet(&app.better, OutcomeId(1), 1000).unwrap();
    app.withdraw(
        &app.better,
        OutcomeId(1),
        app.query_tokens(&app.better, OutcomeId(1)).unwrap(),
    )
    .unwrap_err();
    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap_err();
    app.collect(&app.better).unwrap_err();

    // Deposits paused too
    app.jump_days(1);
    app.place_bet(&app.better, OutcomeId(1), 1000).unwrap_err();
    app.withdraw(
        &app.better,
        OutcomeId(1),
        app.query_tokens(&app.better, OutcomeId(1)).unwrap(),
    )
    .unwrap_err();
    app.set_winner(&app.arbitrator, OutcomeId(1)).unwrap();
    app.collect(&app.better).unwrap();
}
