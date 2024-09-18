use cosmwasm_std::{BankMsg, CosmosMsg, Event, Uint256};

use crate::{
    cpmm::{Buy, Sell},
    prelude::*,
    util::{assert_is_admin, Funds},
};

#[entry_point]
pub fn execute(
    mut deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response> {
    sanity(deps.storage, &env);
    let funds = Funds::from_message_info(&info)?;

    let res = match msg {
        ExecuteMsg::AddMarket { params } => {
            assert_is_admin(deps.storage, &info)?;
            add_market(&mut deps, &env, *params, funds)
        }
        ExecuteMsg::Provide { id } => provide(&mut deps, &env, info, id, funds),
        ExecuteMsg::Deposit {
            id,
            outcome,
            liquidity,
        } => deposit(&mut deps, &env, info, id, outcome, funds, liquidity),
        ExecuteMsg::Withdraw {
            id,
            outcome,
            tokens,
        } => {
            funds.require_none()?;
            withdraw(&mut deps, &env, info, id, outcome, tokens)
        }
        ExecuteMsg::SetWinner { id, outcome } => {
            funds.require_none()?;
            set_winner(&mut deps, &env, info, id, outcome)
        }
        ExecuteMsg::Collect { id } => {
            funds.require_none()?;
            collect(&mut deps, info, id)
        }
        ExecuteMsg::AppointAdmin { addr } => {
            funds.require_none()?;
            assert_is_admin(deps.storage, &info)?;
            appoint_admin(&mut deps, addr)
        }
        ExecuteMsg::AcceptAdmin {} => {
            funds.require_none()?;
            accept_admin(&mut deps, info)
        }
    }?;

    sanity(deps.storage, &env);
    Ok(res)
}

pub struct InitialOutcomes {
    pub outcomes: Vec<StoredOutcome>,
    /// Tokens returned to the user
    pub returned: Vec<Token>,
}

pub(crate) fn initial_outcomes(
    outcomes: Vec<OutcomeDef>,
    funds: Collateral,
) -> Result<InitialOutcomes> {
    let mut stored_outcomes = vec![];
    let mut returned = vec![];

    for (
        idx,
        OutcomeDef {
            label,
            initial_amount,
        },
    ) in outcomes.into_iter().enumerate()
    {
        if initial_amount.is_zero() {
            return Err(Error::OutcomeWeightCannotBeZero);
        }
        if initial_amount.0 > funds.0 {
            return Err(Error::OutcomeWeightCannotExceedFunds {
                initial_amount,
                funds,
            });
        }
        let id = OutcomeId::try_from(idx)?;

        stored_outcomes.push(StoredOutcome {
            id,
            label,
            pool_tokens: initial_amount,
            wallets: if initial_amount.0 == funds.0 { 0 } else { 1 },
        });
        returned.push(Token(funds.0) - initial_amount);
    }
    Ok(InitialOutcomes {
        outcomes: stored_outcomes,
        returned,
    })
}

fn add_market(
    deps: &mut DepsMut,
    env: &Env,
    AddMarketParams {
        title,
        description,
        arbitrator,
        outcomes,
        denom,
        deposit_fee,
        withdrawal_fee,
        withdrawal_stop_date,
        deposit_stop_date,
        house,
    }: AddMarketParams,
    funds: Funds,
) -> Result<Response> {
    if env.block.time >= withdrawal_stop_date {
        return Err(Error::WithdrawalStopDateInPast {
            now: env.block.time,
            withdrawal_stop_date,
        });
    }
    if withdrawal_stop_date > deposit_stop_date {
        return Err(Error::DepositStopDateBeforeWithdrawalStop {
            withdrawal_stop_date,
            deposit_stop_date,
        });
    }

    let total_outcomes = outcomes.len();
    if !total_outcomes == 2 {
        return Err(Error::UnsupportedOutcomes { total_outcomes });
    }

    let funds = funds.require_funds(&denom)?;
    let id = LAST_MARKET_ID
        .may_load(deps.storage)?
        .map_or_else(MarketId::one, MarketId::next);
    LAST_MARKET_ID.save(deps.storage, &id)?;
    let arbitrator = deps.api.addr_validate(&arbitrator)?;
    let InitialOutcomes { outcomes, returned } = initial_outcomes(outcomes, funds)?;

    // Initial LP share value is completely arbitrary. We take the largest token
    // allocation and multiply by a million, chosen arbitrarily to avoid both overflows
    // and rounding errors.
    let lp_shares = LpShare(
        outcomes.iter().map(|x| x.pool_tokens.0).max().unwrap() * Uint256::from(1_000_000u32),
    );

    let house = deps.api.addr_validate(&house)?;

    let market = StoredMarket {
        id,
        title,
        description,
        arbitrator,
        outcomes,
        denom,
        deposit_fee,
        withdrawal_fee,
        pool_size: funds,
        deposit_stop_date,
        withdrawal_stop_date,
        winner: None,
        house,
        total_wallets: if returned.iter().any(|token| !token.is_zero()) {
            1
        } else {
            0
        },
        lp_shares,
    };
    MARKETS.save(deps.storage, id, &market)?;

    ShareInfo {
        outcomes: returned,
        shares: lp_shares,
        claimed_winnings: false,
    }
    .save(deps.storage, &market, &market.house)?;

    Ok(Response::new()
        .add_event(Event::new("add-market").add_attribute("market-id", id.0.to_string())))
}

fn deposit(
    deps: &mut DepsMut,
    env: &Env,
    info: MessageInfo,
    id: MarketId,
    outcome: OutcomeId,
    funds: Funds,
    liquidity: Decimal256,
) -> Result<Response> {
    let mut market = StoredMarket::load(deps.storage, id)?;

    if env.block.time >= market.deposit_stop_date {
        return Err(Error::DepositsStopped {
            id,
            now: env.block.time,
            deposit_stop_date: market.deposit_stop_date,
        });
    }

    let deposit_amount = funds.require_funds(&market.denom)?;
    let fee = Decimal256::from_ratio(deposit_amount.0, 1u8) * market.deposit_fee;
    let fee = Collateral(fee.to_uint_ceil());
    let house = market.house.clone();
    market
        .add_liquidity(fee)
        .assign_to(deps.storage, &mut market, &house)?;
    let funds = deposit_amount.checked_sub(fee)?;
    let Buy { lp, tokens } = market.buy(outcome, funds, liquidity)?;
    let mut share_info = ShareInfo::load(deps.storage, &market, &info.sender)?
        .unwrap_or_else(|| ShareInfo::new(market.outcomes.len()));

    assert_eq!(share_info.outcomes.len(), market.outcomes.len());

    share_info.shares += lp;

    let had_any_tokens = share_info.has_tokens();

    let outcome_tokens = share_info.get_outcome_mut(id, outcome).unwrap();
    let had_these_tokens = !outcome_tokens.is_zero();

    if !had_any_tokens {
        market.total_wallets += 1;
    }

    if !had_these_tokens {
        market.get_outcome_mut(outcome)?.wallets += 1;
    }

    *outcome_tokens += tokens;
    share_info.save(deps.storage, &market, &info.sender)?;

    MARKETS.save(deps.storage, id, &market)?;

    Ok(Response::new().add_event(
        Event::new("deposit")
            .add_attribute("market-id", id.to_string())
            .add_attribute("outcome-id", outcome.to_string())
            .add_attribute("tokens", tokens.to_string())
            .add_attribute("deposit-amount", deposit_amount.to_string())
            .add_attribute("fee", fee.to_string()),
    ))
}

fn provide(
    deps: &mut DepsMut,
    env: &Env,
    info: MessageInfo,
    id: MarketId,
    funds: Funds,
) -> Result<Response> {
    let mut market = StoredMarket::load(deps.storage, id)?;

    if env.block.time >= market.deposit_stop_date {
        return Err(Error::DepositsStopped {
            id,
            now: env.block.time,
            deposit_stop_date: market.deposit_stop_date,
        });
    }

    let deposit_amount = funds.require_funds(&market.denom)?;
    let add_liquidity = market.add_liquidity(deposit_amount);

    let res = Response::new().add_event(
        Event::new("provide")
            .add_attribute("market-id", id.to_string())
            .add_attribute("deposit-amount", deposit_amount.to_string())
            .add_attribute("shares", add_liquidity.lp.to_string())
            .add_attribute(
                "new-user-tokens",
                format!("{:?}", add_liquidity.returned_to_user),
            )
            .add_attribute(
                "new-pool-tokens",
                format!("{:?}", add_liquidity.added_to_pool),
            ),
    );

    add_liquidity.assign_to(deps.storage, &mut market, &info.sender)?;
    MARKETS.save(deps.storage, market.id, &market)?;

    Ok(res)
}

fn withdraw(
    deps: &mut DepsMut,
    env: &Env,
    info: MessageInfo,
    id: MarketId,
    outcome: OutcomeId,
    tokens: Token,
) -> Result<Response> {
    let mut market = StoredMarket::load(deps.storage, id)?;

    if env.block.time >= market.withdrawal_stop_date {
        return Err(Error::WithdrawalsStopped {
            id,
            now: env.block.time,
            withdrawal_stop_date: market.withdrawal_stop_date,
        });
    }

    let mut share_info = ShareInfo::load(deps.storage, &market, &info.sender)?
        .ok_or(Error::NoPositionsOnMarket { id })?;

    let user_tokens = share_info.get_outcome_mut(id, outcome)?;
    if user_tokens.is_zero() {
        return Err(Error::NoTokensFound { id, outcome });
    }

    if *user_tokens < tokens {
        return Err(Error::InsufficientTokens {
            id,
            outcome,
            requested: tokens,
            available: *user_tokens,
        });
    }

    *user_tokens -= tokens;

    let Sell { funds, returned } = market.sell(outcome, tokens)?;

    for (idx, returned) in returned.into_iter().enumerate() {
        share_info.outcomes[idx] += returned;
    }

    if share_info.get_outcome(&market, outcome)?.is_zero() {
        market.get_outcome_mut(outcome)?.wallets -= 1;
        if !share_info.has_tokens() {
            market.total_wallets -= 1;
        }
    }

    share_info.save(deps.storage, &market, &info.sender)?;

    let fee = Decimal256::from_ratio(funds.0, 1u8) * market.withdrawal_fee;
    let fee = Collateral(fee.to_uint_ceil());
    let house = market.house.clone();
    market
        .add_liquidity(fee)
        .assign_to(deps.storage, &mut market, &house)?;
    let funds = funds.checked_sub(fee)?;
    MARKETS.save(deps.storage, id, &market)?;
    Ok(Response::new()
        .add_event(
            Event::new("deposit")
                .add_attribute("market-id", id.to_string())
                .add_attribute("outcome-id", outcome.to_string())
                .add_attribute("tokens", tokens.to_string())
                .add_attribute("fee", fee.to_string())
                .add_attribute("withdrawal", funds.to_string()),
        )
        .add_message(CosmosMsg::Bank(BankMsg::Send {
            to_address: info.sender.into_string(),
            amount: vec![Coin {
                denom: market.denom,
                amount: funds.0.try_into()?,
            }],
        })))
}

fn set_winner(
    deps: &mut DepsMut,
    env: &Env,
    info: MessageInfo,
    id: MarketId,
    outcome: OutcomeId,
) -> Result<Response> {
    let mut market = StoredMarket::load(deps.storage, id)?;

    if env.block.time < market.deposit_stop_date {
        return Err(Error::MarketStillActive {
            id,
            now: env.block.time,
            deposit_stop_date: market.deposit_stop_date,
        });
    }

    if info.sender != market.arbitrator {
        return Err(Error::Unauthorized);
    }

    if market.winner.is_some() {
        return Err(Error::WinnerAlreadySet { id });
    }

    market.winner = Some(outcome);
    MARKETS.save(deps.storage, id, &market)?;

    // Force a check that it's a valid outcome
    market.get_outcome(outcome)?;

    Ok(Response::new().add_event(
        Event::new("set-winner")
            .add_attribute("market-id", id.to_string())
            .add_attribute("outcome-id", outcome.to_string()),
    ))
}

fn collect(deps: &mut DepsMut, info: MessageInfo, id: MarketId) -> Result<Response> {
    let market = StoredMarket::load(deps.storage, id)?;
    let winner = market.winner.ok_or(Error::NoWinnerSet { id })?;
    let mut share_info = ShareInfo::load(deps.storage, &market, &info.sender)?
        .ok_or(Error::NoPositionsOnMarket { id })?;
    if share_info.claimed_winnings {
        return Err(Error::AlreadyClaimedWinnings { id });
    }
    share_info.claimed_winnings = true;
    let tokens = share_info.get_outcome(&market, winner)?;
    if tokens.is_zero() {
        return Err(Error::NoTokensFound {
            id,
            outcome: winner,
        });
    }
    share_info.save(deps.storage, &market, &info.sender)?;
    let winnings = Collateral(tokens.0);

    Ok(Response::new()
        .add_event(
            Event::new("collect")
                .add_attribute("market-id", id.to_string())
                .add_attribute("winner", winner.to_string())
                .add_attribute("tokens", tokens.to_string()),
        )
        .add_message(CosmosMsg::Bank(BankMsg::Send {
            to_address: info.sender.into_string(),
            amount: vec![Coin {
                denom: market.denom,
                amount: winnings.0.try_into()?,
            }],
        })))
}

fn appoint_admin(deps: &mut DepsMut, addr: String) -> Result<Response> {
    let addr = deps.api.addr_validate(&addr)?;
    APPOINTED_ADMIN.save(deps.storage, &addr)?;
    Ok(Response::new()
        .add_event(Event::new("appoint-admin").add_attribute("new-admin", addr.into_string())))
}

fn accept_admin(deps: &mut DepsMut, info: MessageInfo) -> Result<Response> {
    let appointed = APPOINTED_ADMIN
        .may_load(deps.storage)?
        .ok_or(Error::NoAppointedAdmin {})?;
    if appointed != info.sender {
        return Err(Error::NotAppointedAdmin {});
    }
    APPOINTED_ADMIN.remove(deps.storage);
    ADMIN.save(deps.storage, &appointed)?;
    Ok(Response::new().add_event(Event::new("accept-admin").add_attribute("new-admin", appointed)))
}
