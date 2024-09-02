use std::collections::BTreeMap;

use crate::prelude::*;

pub const ADMIN: Item<Addr> = Item::new("admin");

pub const LAST_MARKET_ID: Item<MarketId> = Item::new("last-market-id");

pub const MARKETS: Map<MarketId, StoredMarket> = Map::new("markets");

pub const SHARES: Map<(MarketId, &Addr), ShareInfo> = Map::new("shares");

#[derive(Serialize, Deserialize)]
pub struct StoredMarket {
    pub id: MarketId,
    pub title: String,
    pub description: String,
    pub arbitrator: Addr,
    pub outcomes: Vec<StoredOutcome>,
    pub denom: String,
    pub deposit_fee: Decimal256,
    pub withdrawal_fee: Decimal256,
    pub pool_size: Collateral,
    pub deposit_stop_date: Timestamp,
    pub withdrawal_stop_date: Timestamp,
    pub winner: Option<OutcomeId>,
}

impl StoredMarket {
    pub fn load(store: &dyn Storage, id: MarketId) -> Result<Self> {
        MARKETS
            .may_load(store, id)?
            .ok_or(Error::MarketNotFound { id })
    }

    pub(crate) fn assert_valid_outcome(&self, outcome: OutcomeId) -> Result<()> {
        todo!()
    }
}

#[derive(Serialize, Deserialize)]
pub struct StoredOutcome {
    pub id: OutcomeId,
    pub label: String,
    pub tokens: Token,
}

#[derive(Serialize, Deserialize, Default)]
pub struct ShareInfo {
    pub outcomes: BTreeMap<OutcomeId, Token>,
    pub claimed_winnings: bool,
}
