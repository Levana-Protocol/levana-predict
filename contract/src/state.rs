use crate::prelude::*;

pub const ADMIN: Item<Addr> = Item::new("admin");

pub const APPOINTED_ADMIN: Item<Addr> = Item::new("appointed-admin");

pub const LAST_MARKET_ID: Item<MarketId> = Item::new("last-market-id");

pub const MARKETS: Map<MarketId, StoredMarket> = Map::new("markets");

const HOLDERS: Map<(MarketId, &Addr), ShareInfo> = Map::new("holders");

impl ShareInfo {
    pub fn load(
        store: &dyn Storage,
        market: &StoredMarket,
        addr: &Addr,
    ) -> Result<Option<ShareInfo>> {
        match HOLDERS.may_load(store, (market.id, addr))? {
            None => Ok(None),
            Some(share_info) => {
                if share_info.outcomes.len() != market.outcomes.len() {
                    unreachable!()
                } else {
                    Ok(Some(share_info))
                }
            }
        }
    }

    pub fn save(
        &self,
        store: &mut dyn Storage,
        market: &StoredMarket,
        addr: &Addr,
    ) -> StdResult<()> {
        assert_eq!(market.outcomes.len(), self.outcomes.len());
        HOLDERS.save(store, (market.id, addr), self)
    }

    pub(crate) fn get_outcome(&self, market: &StoredMarket, outcome: OutcomeId) -> Result<Token> {
        let from_tokens =
            self.outcomes
                .get(outcome.usize())
                .copied()
                .ok_or_else(|| Error::InvalidOutcome {
                    id: market.id,
                    outcome_count: self.outcomes.len().to_string(),
                    outcome,
                })?;
        let from_pool = market
            .outcomes
            .get(outcome.usize())
            .as_ref()
            .ok_or_else(|| Error::InvalidOutcome {
                id: market.id,
                outcome_count: self.outcomes.len().to_string(),
                outcome,
            })?
            .pool_tokens
            * (self.shares / market.lp_shares);
        Ok(from_tokens + from_pool)
    }

    pub(crate) fn get_outcome_mut(
        &mut self,
        id: MarketId,
        outcome: OutcomeId,
    ) -> Result<&mut Token> {
        let count = self.outcomes.len();
        self.outcomes
            .get_mut(outcome.usize())
            .ok_or_else(|| Error::InvalidOutcome {
                id,
                outcome_count: count.to_string(),
                outcome,
            })
    }

    pub(crate) fn has_tokens(&self) -> bool {
        self.outcomes.iter().any(|token| !token.is_zero())
    }
}

#[derive(Serialize, Deserialize, Debug)]
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
    pub house: Addr,
    pub total_wallets: u32,
    /// Total shares across all wallets
    pub lp_shares: LpShare,
}

impl StoredMarket {
    pub fn load(store: &dyn Storage, id: MarketId) -> Result<Self> {
        MARKETS
            .may_load(store, id)?
            .ok_or(Error::MarketNotFound { id })
    }

    pub(crate) fn get_outcome(&self, outcome: OutcomeId) -> Result<&StoredOutcome> {
        self.outcomes
            .get(outcome.usize())
            .ok_or_else(|| Error::InvalidOutcome {
                id: self.id,
                outcome_count: self.outcomes.len().to_string(),
                outcome,
            })
    }

    pub(crate) fn get_outcome_mut(&mut self, outcome: OutcomeId) -> Result<&mut StoredOutcome> {
        let count = self.outcomes.len();
        self.outcomes
            .get_mut(outcome.usize())
            .ok_or_else(|| Error::InvalidOutcome {
                id: self.id,
                outcome_count: count.to_string(),
                outcome,
            })
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StoredOutcome {
    pub id: OutcomeId,
    pub label: String,
    pub pool_tokens: Token,
    /// Count of wallets holding tokens
    pub wallets: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ShareInfo {
    pub outcomes: Vec<Token>,
    /// LP shares held by this wallet
    pub shares: LpShare,
    pub claimed_winnings: bool,
}

impl ShareInfo {
    pub fn new(outcome_count: usize) -> Self {
        ShareInfo {
            outcomes: std::iter::repeat(Token::zero())
                .take(outcome_count)
                .collect(),
            shares: LpShare::zero(),
            claimed_winnings: false,
        }
    }
}
