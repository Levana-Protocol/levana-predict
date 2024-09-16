use crate::prelude::*;

#[must_use]
pub struct UnassignedLpShares(pub LpShare);
impl UnassignedLpShares {
    pub fn assign_to(
        self,
        storage: &mut dyn Storage,
        market: &StoredMarket,
        sender: &Addr,
    ) -> Result<()> {
        let mut share_info = ShareInfo::load(storage, market, sender)?
            .unwrap_or_else(|| ShareInfo::new(market.outcomes.len()));
        share_info.shares += self.0;
        share_info.save(storage, market, sender)?;
        Ok(())
    }
}

impl StoredMarket {
    /// Adds liquidity to the market without changing prices of assets.
    pub fn add_liquidity(&mut self, funds: Collateral) -> UnassignedLpShares {
        let new_total = self.pool_size + funds;
        let scale = new_total / self.pool_size;
        self.pool_size = new_total;
        for outcome in &mut self.outcomes {
            let old = outcome.pool_tokens;
            outcome.pool_tokens *= scale;
            outcome.total_tokens += outcome.pool_tokens - old;
        }
        let old_shares = self.lp_shares;
        self.lp_shares *= scale;

        UnassignedLpShares(self.lp_shares - old_shares)
    }

    /// Place a bet on the given outcome.
    ///
    /// Returns the number of tokens purchased
    pub fn buy(&mut self, selected_outcome: OutcomeId, funds: Collateral) -> Result<Token> {
        let new_funds = self.pool_size + funds;
        let mut product_others = Decimal256::one();
        let mut invariant = Decimal256::one();

        for outcome in self.outcomes.iter_mut() {
            // Calculate the invariant _before_ scaling up the token counts.
            invariant *= outcome.pool_tokens.0;

            let old_tokens = outcome.pool_tokens;
            outcome.pool_tokens *= new_funds / self.pool_size;
            outcome.total_tokens += outcome.pool_tokens - old_tokens;
            if outcome.id != selected_outcome {
                product_others *= outcome.pool_tokens.0;
            }
        }

        let pool_selected = Token(invariant / product_others);

        let outcome = self.get_outcome_mut(selected_outcome)?;
        let returned = outcome.pool_tokens - pool_selected;
        outcome.pool_tokens = pool_selected;
        self.pool_size = new_funds;

        Ok(returned)
    }

    /// Burns the given number of tokens for the given outcome.
    ///
    /// Returns the amount of liquidity freed up.
    pub fn sell(&mut self, selected_outcome: OutcomeId, tokens: Token) -> Result<Collateral> {
        let mut invariant = Decimal256::one();
        let mut product = Decimal256::one();
        for outcome in self.outcomes.iter_mut() {
            invariant *= outcome.pool_tokens.0;
            if outcome.id == selected_outcome {
                outcome.pool_tokens += tokens;
            }
            product *= outcome.pool_tokens.0;
        }

        let scale = if self.outcomes.len() == 2 {
            (invariant / product).sqrt()
        } else {
            panic!("Only supports 2 outcomes at the moment")
        };
        for outcome in &mut self.outcomes {
            let old = outcome.pool_tokens;
            outcome.pool_tokens *= scale;
            outcome.total_tokens -= old - outcome.pool_tokens;
        }
        let new_funds = (self.pool_size * scale)?;
        let returned = self.pool_size - new_funds;
        self.pool_size = new_funds;
        Ok(returned)
    }

    /// Winnings for the given number of tokens in the given winner.
    pub(crate) fn winnings_for(&self, winner: OutcomeId, tokens: Token) -> Result<Collateral> {
        let outcome = self.get_outcome(winner)?;
        (self.pool_size * (tokens / outcome.total_tokens)).map_err(Error::from)
    }
}
