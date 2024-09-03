use crate::prelude::*;

impl StoredMarket {
    /// Adds liquidity to the market without changing prices of assets.
    pub fn add_liquidity(&mut self, funds: Collateral) {
        let new_total = self.pool_size + funds;
        let scale = new_total / self.pool_size;
        self.pool_size = new_total;
        for outcome in &mut self.outcomes {
            let old = outcome.pool_tokens;
            outcome.pool_tokens *= scale;
            outcome.total_tokens += outcome.pool_tokens - old;
        }
    }

    /// Place a bet on the given outcome.
    ///
    /// Returns the number of tokens purchased
    pub fn buy(&mut self, selected_outcome: OutcomeId, funds: Collateral) -> Result<Token> {
        let new_funds = self.pool_size + funds;
        let mut product_others = Decimal256::one();
        let mut invariant = Decimal256::one();

        for (idx, outcome) in self.outcomes.iter_mut().enumerate() {
            let id = OutcomeId(u8::try_from(idx + 1)?);

            // Calculate the invariant _before_ scaling up the token counts.
            invariant *= outcome.pool_tokens.0;

            let old_tokens = outcome.pool_tokens;
            outcome.pool_tokens *= new_funds / self.pool_size;
            outcome.total_tokens += outcome.pool_tokens - old_tokens;
            if id != selected_outcome {
                product_others *= outcome.pool_tokens.0;
            }
        }

        let pool_selected = Token(invariant / product_others);

        let outcome = self
            .outcomes
            .get_mut(usize::from(selected_outcome.0 - 1))
            .unwrap();
        let returned = outcome.pool_tokens - pool_selected;
        outcome.pool_tokens = pool_selected;
        self.pool_size = new_funds;

        Ok(returned)
    }

    /// Burns the given number of tokens for the given outcome.
    ///
    /// Returns the amount of liquidity freed up.
    pub fn sell(&mut self, selected_outcome: OutcomeId, tokens: Token) -> Result<Collateral> {
        self.assert_valid_outcome(selected_outcome)?;

        let mut invariant = Decimal256::one();
        let mut product = Decimal256::one();
        for (idx, outcome) in self.outcomes.iter_mut().enumerate() {
            invariant *= outcome.pool_tokens.0;
            let id = OutcomeId(u8::try_from(idx + 1)?);
            if id == selected_outcome {
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
        self.assert_valid_outcome(winner)?;
        let outcome = self.outcomes.get(usize::from(winner.0 - 1)).unwrap();
        (self.pool_size * (tokens / outcome.total_tokens)).map_err(Error::from)
    }
}
