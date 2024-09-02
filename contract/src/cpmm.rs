use crate::prelude::*;

impl StoredMarket {
    /// Adds liquidity to the market without changing prices of assets.
    pub fn add_liquidity(&mut self, fee: Collateral) -> Result<()> {
        todo!()
    }

    /// Place a bet on the given outcome.
    ///
    /// Returns the number of tokens purchased
    pub fn buy(&mut self, outcome: OutcomeId, funds: Collateral) -> Result<Token> {
        todo!()
    }

    /// Burns the given number of tokens for the given outcome.
    ///
    /// Returns the amount of liquidity freed up.
    pub fn sell(&mut self, outcome: OutcomeId, tokens: Token) -> Result<Collateral> {
        todo!()
    }

    /// Winnings for the given number of tokens in the given winner.
    pub(crate) fn winnings_for(&self, winner: OutcomeId, tokens: Token) -> Result<Collateral> {
        todo!()
    }
}
