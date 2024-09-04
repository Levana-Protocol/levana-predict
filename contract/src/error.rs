use std::num::TryFromIntError;

use cosmwasm_std::{ConversionOverflowError, OverflowError};

use crate::prelude::*;

pub type Result<T, E = Error> = std::result::Result<T, E>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Std(#[from] StdError),
    #[error(transparent)]
    ConversionOverflow(#[from] ConversionOverflowError),
    #[error(transparent)]
    Overflow(#[from] OverflowError),
    #[error(transparent)]
    TryFromInt(#[from] TryFromIntError),
    #[error(
        "Multiple assets provided, this contract only supports 0 or 1 assets attached per message"
    )]
    MultipleAssetsProvided,
    #[error("Message requires no funds, but {amount}{denom} was provided.")]
    UnexpectedFunds { denom: String, amount: Uint128 },
    #[error("Incorrect funds denomination. Received {amount}{actual_denom}, but {required_denom} is expected.")]
    IncorrectFundsDenom {
        actual_denom: String,
        amount: Uint128,
        required_denom: String,
    },
    #[error("No funds provided, but this method requires sending {denom}")]
    MissingRequiredFunds { denom: String },
    #[error("The sender address is not the admin of the contract")]
    Unauthorized,
    #[error("Incorrect funds specified per outcome. Total provided: {provided}. Total specified: {specified}.")]
    IncorrectFundsPerOutcome {
        provided: Collateral,
        specified: Collateral,
    },
    #[error("Deposit stop date ({deposit_stop_date}) is before the withdrawal stop date ({withdrawal_stop_date})")]
    DepositStopDateBeforeWithdrawalStop {
        withdrawal_stop_date: Timestamp,
        deposit_stop_date: Timestamp,
    },
    #[error("Withdrawal stop date ({withdrawal_stop_date}) is in the past. Current time: {now}.")]
    WithdrawalStopDateInPast {
        now: Timestamp,
        withdrawal_stop_date: Timestamp,
    },
    #[error("Market not found: {}", id.0)]
    MarketNotFound { id: MarketId },
    #[error("No positions found for sending wallet address on market {id}")]
    NoPositionsOnMarket { id: MarketId },
    #[error("No tokens found for sending wallet address on market {id}, outcome {outcome}")]
    NoTokensFound { id: MarketId, outcome: OutcomeId },
    #[error("Insufficient tokens on market {id}, outcome {outcome}. Requested: {requested}. Available: {available}.")]
    InsufficientTokens {
        id: MarketId,
        outcome: OutcomeId,
        requested: Token,
        available: Token,
    },
    #[error("Withdrawals for market {id} have been stopped. Stop time: {withdrawal_stop_date}. Current time: {now}.")]
    WithdrawalsStopped {
        id: MarketId,
        now: Timestamp,
        withdrawal_stop_date: Timestamp,
    },
    #[error("Deposits for market {id} have been stopped. Stop time: {deposit_stop_date}. Current time: {now}.")]
    DepositsStopped {
        id: MarketId,
        now: Timestamp,
        deposit_stop_date: Timestamp,
    },
    #[error("The market {id} is still active. Time is currently {now}, and deposits will be stopped at {deposit_stop_date}.")]
    MarketStillActive {
        id: MarketId,
        now: Timestamp,
        deposit_stop_date: Timestamp,
    },
    #[error(
        "Invalid outcome {outcome} specified for market {id}. Total outcome count: {outcome_count}."
    )]
    InvalidOutcome {
        id: MarketId,
        /// Use a String to avoid trying to serialize a usize or convert to a u32
        outcome_count: String,
        outcome: OutcomeId,
    },
    #[error("Winner already set for market {id}")]
    WinnerAlreadySet { id: MarketId },
    #[error("No winner set for market {id}")]
    NoWinnerSet { id: MarketId },
    #[error("You already claimed winnings for market {id}")]
    AlreadyClaimedWinnings { id: MarketId },
    #[error("No appointed admin set")]
    NoAppointedAdmin {},
    #[error("You are not the appointed admin")]
    NotAppointedAdmin {},
    #[error("Too many outcomes specified, we found index {idx}. {source}")]
    TooManyOutcomes {
        idx: String,
        source: std::num::TryFromIntError,
    },
    #[error("Supported only 2 outcomes, received {total_outcomes}")]
    UnsupportedOutcomes { total_outcomes: usize },
}
