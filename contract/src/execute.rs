use cosmwasm_std::{BankMsg, CosmosMsg, Event};

use crate::{
    prelude::*,
    util::{assert_is_admin, Funds},
};

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> Result<Response> {
    let funds = Funds::from_message_info(&info)?;

    match msg {
        ExecuteMsg::AddMarket { params } => {
            assert_is_admin(deps.storage, &info)?;
            add_market(deps, env, *params, funds)
        }
        ExecuteMsg::Deposit { id, outcome } => deposit(deps, env, info, id, outcome, funds),
        ExecuteMsg::Withdraw {
            id,
            outcome,
            tokens,
        } => {
            funds.require_none()?;
            withdraw(deps, env, info, id, outcome, tokens)
        }
        ExecuteMsg::SetWinner { id, outcome } => {
            funds.require_none()?;
            set_winner(deps, env, info, id, outcome)
        }
        ExecuteMsg::Collect { id } => {
            funds.require_none()?;
            collect(deps, info, id)
        }
        ExecuteMsg::AppointAdmin { addr } => {
            funds.require_none()?;
            assert_is_admin(deps.storage, &info)?;
            appoint_admin(deps, addr)
        }
        ExecuteMsg::AcceptAdmin {} => {
            funds.require_none()?;
            accept_admin(deps, info)
        }
    }
}

fn add_market(
    deps: DepsMut,
    env: Env,
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

    let funds = funds.require_funds(&denom)?;
    let id = LAST_MARKET_ID
        .may_load(deps.storage)?
        .map_or_else(MarketId::one, MarketId::next);
    LAST_MARKET_ID.save(deps.storage, &id)?;
    let arbitrator = deps.api.addr_validate(&arbitrator)?;
    let mut total = Collateral::zero();
    let outcomes = outcomes
        .into_iter()
        .enumerate()
        .map(
            |(
                idx,
                OutcomeDef {
                    label,
                    initial_amount,
                },
            )| {
                total += initial_amount;
                let id = OutcomeId(u8::try_from(idx + 1).unwrap());
                let pool_tokens = Token(Decimal256::from_ratio(initial_amount.0, 1u8));
                StoredOutcome {
                    id,
                    label,
                    pool_tokens,
                    total_tokens: pool_tokens,
                }
            },
        )
        .collect();
    if total != funds {
        return Err(Error::IncorrectFundsPerOutcome {
            provided: funds,
            specified: total,
        });
    }
    MARKETS.save(
        deps.storage,
        id,
        &StoredMarket {
            id,
            title,
            description,
            arbitrator,
            outcomes,
            denom,
            deposit_fee,
            withdrawal_fee,
            pool_size: total,
            deposit_stop_date,
            withdrawal_stop_date,
            winner: None,
            house: deps.api.addr_validate(&house)?,
        },
    )?;

    Ok(Response::new()
        .add_event(Event::new("add-market").add_attribute("market-id", id.0.to_string())))
}

fn deposit(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    id: MarketId,
    outcome: OutcomeId,
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

    let funds = funds.require_funds(&market.denom)?;
    let fee = Decimal256::from_ratio(funds.0, 1u8) * market.deposit_fee;
    let fee = Collateral(Uint128::try_from(fee.to_uint_ceil())?);
    market.add_liquidity(fee);
    let funds = funds.checked_sub(fee)?;
    let tokens = market.buy(outcome, funds)?;
    MARKETS.save(deps.storage, id, &market)?;
    let mut share_info = SHARES
        .may_load(deps.storage, (id, &info.sender))?
        .unwrap_or_default();
    *share_info
        .outcomes
        .entry(outcome)
        .or_insert_with(Token::zero) += tokens;
    SHARES.save(deps.storage, (id, &info.sender), &share_info)?;
    Ok(Response::new().add_event(
        Event::new("deposit")
            .add_attribute("market-id", id.0.to_string())
            .add_attribute("outcome-id", outcome.0.to_string())
            .add_attribute("tokens", tokens.0.to_string()),
    ))
}

fn withdraw(
    deps: DepsMut,
    env: Env,
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

    let mut share_info = SHARES
        .may_load(deps.storage, (id, &info.sender))?
        .ok_or(Error::NoPositionsOnMarket { id })?;

    let user_tokens = share_info
        .outcomes
        .get_mut(&outcome)
        .ok_or(Error::NoTokensFound { id, outcome })?;

    if *user_tokens < tokens {
        return Err(Error::InsufficientTokens {
            id,
            outcome,
            requested: tokens,
            available: *user_tokens,
        });
    }

    SHARES.save(deps.storage, (id, &info.sender), &share_info)?;

    let funds = market.sell(outcome, tokens)?;

    let fee = Decimal256::from_ratio(funds.0, 1u8) * market.withdrawal_fee;
    let fee = Collateral(Uint128::try_from(fee.to_uint_ceil())?);
    market.add_liquidity(fee);
    let funds = funds.checked_sub(fee)?;
    MARKETS.save(deps.storage, id, &market)?;
    Ok(Response::new()
        .add_event(
            Event::new("deposit")
                .add_attribute("market-id", id.0.to_string())
                .add_attribute("outcome-id", outcome.0.to_string())
                .add_attribute("tokens", tokens.0.to_string()),
        )
        .add_message(CosmosMsg::Bank(BankMsg::Send {
            to_address: info.sender.into_string(),
            amount: vec![Coin {
                denom: market.denom,
                amount: funds.0,
            }],
        })))
}

fn set_winner(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    id: MarketId,
    outcome: OutcomeId,
) -> Result<Response> {
    let mut market = StoredMarket::load(deps.storage, id)?;

    if env.block.time < market.withdrawal_stop_date {
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

    let house_winnings = market.winnings_for(
        outcome,
        market.outcomes[usize::from(outcome.0 - 1)].pool_tokens,
    )?;

    Ok(Response::new()
        .add_event(
            Event::new("set-winner")
                .add_attribute("market-id", id.to_string())
                .add_attribute("outcome-id", outcome.to_string()),
        )
        .add_message(CosmosMsg::Bank(BankMsg::Send {
            to_address: market.house.into_string(),
            amount: vec![Coin {
                denom: market.denom,
                amount: house_winnings.0,
            }],
        })))
}

fn collect(deps: DepsMut, info: MessageInfo, id: MarketId) -> Result<Response> {
    let market = StoredMarket::load(deps.storage, id)?;
    let winner = market.winner.ok_or(Error::NoWinnerSet { id })?;
    let mut share_info = SHARES
        .may_load(deps.storage, (id, &info.sender))?
        .ok_or(Error::NoPositionsOnMarket { id })?;
    if share_info.claimed_winnings {
        return Err(Error::AlreadyClaimedWinnings { id });
    }
    share_info.claimed_winnings = true;
    let tokens = share_info
        .outcomes
        .get(&winner)
        .ok_or(Error::NoTokensFound {
            id,
            outcome: winner,
        })?;
    SHARES.save(deps.storage, (id, &info.sender), &share_info)?;
    let winnings = market.winnings_for(winner, *tokens)?;

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
                amount: winnings.0,
            }],
        })))
}

fn appoint_admin(deps: DepsMut, addr: String) -> Result<Response> {
    let addr = deps.api.addr_validate(&addr)?;
    APPOINTED_ADMIN.save(deps.storage, &addr)?;
    Ok(Response::new()
        .add_event(Event::new("appoint-admin").add_attribute("new-admin", addr.into_string())))
}

fn accept_admin(deps: DepsMut, info: MessageInfo) -> Result<Response> {
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