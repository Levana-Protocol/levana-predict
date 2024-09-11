use crate::prelude::*;

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
pub struct InstantiateMsg {
    pub admin: String,
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    AddMarket {
        params: Box<AddMarketParams>,
    },
    /// Place a bet on an outcome
    Deposit {
        id: MarketId,
        outcome: OutcomeId,
    },
    /// Withdraw funds bet on an outcome
    Withdraw {
        id: MarketId,
        outcome: OutcomeId,
        tokens: Token,
    },
    /// Declare the winner of a market
    SetWinner {
        id: MarketId,
        outcome: OutcomeId,
    },
    /// Collect winnings from a market
    Collect {
        id: MarketId,
    },
    /// Appoint a new admin
    AppointAdmin {
        addr: String,
    },
    /// Accept admin privileges
    AcceptAdmin {},
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub struct AddMarketParams {
    pub title: String,
    pub description: String,
    /// Wallet address. Sets the winner.
    pub arbitrator: String,
    pub outcomes: Vec<OutcomeDef>,
    /// Denom of collateral for this market.
    ///
    /// Arguably this is unnecessary, it can be picked up from submitted funds.
    /// But it's a double-check, and makes the internal code a bit tidier.
    pub denom: String,
    /// Given as a ratio, e.g. 0.01 means 1%
    pub deposit_fee: Decimal256,
    pub withdrawal_fee: Decimal256,
    pub withdrawal_stop_date: Timestamp,
    pub deposit_stop_date: Timestamp,
    /// Which wallet receives house winnings.
    pub house: String,
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub struct OutcomeDef {
    pub label: String,
    pub initial_amount: Collateral,
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    /// Returns [GlobalInfo]
    GlobalInfo {},
    /// Returns [MarketResp]
    Market { id: MarketId },
    /// Returns [PositionsResp]
    Positions { id: MarketId, addr: String },
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub struct GlobalInfo {
    pub latest_market_id: Option<MarketId>,
    pub admin: Addr,
}

pub type MarketResp = StoredMarket;

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub struct OutcomeInfo {
    pub label: String,
    pub tokens: Token,
    pub wallet_count: u32,
}

pub type PositionsResp = ShareInfo;

#[derive(Serialize, Deserialize, JsonSchema, Debug)]
pub struct MigrateMsg {}
