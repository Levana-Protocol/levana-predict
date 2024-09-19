use cosmwasm_std::Uint256;

use crate::prelude::*;

#[must_use]
pub struct AddLiquidity {
    pub lp: LpShare,
    pub returned_to_user: Vec<Token>,
    pub added_to_pool: Vec<Token>,
}

impl AddLiquidity {
    pub fn assign_to(
        self,
        storage: &mut dyn Storage,
        market: &mut StoredMarket,
        sender: &Addr,
    ) -> Result<()> {
        assert_eq!(market.outcomes.len(), self.returned_to_user.len());
        let AddLiquidity {
            lp,
            returned_to_user,
            added_to_pool: _,
        } = self;
        let mut share_info = ShareInfo::load(storage, market, sender)?
            .unwrap_or_else(|| ShareInfo::new(market.outcomes.len()));
        share_info.shares += lp;

        let mut had_tokens = false;
        let mut has_tokens = false;

        for (outcome, tokens_mut) in share_info.outcomes.iter_mut().enumerate() {
            let to_add = returned_to_user[outcome];
            if tokens_mut.is_zero() {
                if !to_add.is_zero() {
                    market.outcomes[outcome].wallets += 1;
                }
            } else {
                had_tokens = true;
            }
            *tokens_mut += to_add;
            if !tokens_mut.is_zero() {
                has_tokens = true;
            }
        }

        if !had_tokens && has_tokens {
            market.total_wallets += 1;
        }
        share_info.save(storage, market, sender)?;
        Ok(())
    }
}

#[must_use]
pub struct Buy {
    pub lp: LpShare,
    /// We only ever return the selected token, not a vec of other tokens
    pub tokens: Token,
}

#[must_use]
pub struct Sell {
    /// Funds the user will receive for the sale
    pub funds: Collateral,
    /// Any tokens returned to the user from this sale
    pub returned: Vec<Token>,
}

impl StoredMarket {
    /// Adds liquidity to the market without changing prices of assets.
    pub fn add_liquidity(&mut self, funds: Collateral) -> AddLiquidity {
        self.pool_size += funds;

        let pool_weight = self.outcomes.iter().map(|o| o.pool_tokens).max().unwrap();

        let mut added_to_pool = Vec::new();
        let mut returned = Vec::new();

        for outcome in self.outcomes.iter_mut() {
            let for_pool = Token(funds.0 * outcome.pool_tokens.0 / pool_weight.0);
            outcome.pool_tokens += for_pool;
            added_to_pool.push(for_pool);
            returned.push(Token(funds.0) - for_pool);
        }

        let new_shares = LpShare(funds.0 * self.lp_shares.0 / pool_weight.0);
        self.lp_shares += new_shares;

        AddLiquidity {
            lp: new_shares,
            returned_to_user: returned,
            added_to_pool,
        }
    }

    /// Place a bet on the given outcome.
    ///
    /// Returns the number of tokens purchased
    pub fn buy(
        &mut self,
        selected_outcome: OutcomeId,
        funds: Collateral,
        liquidity: Decimal256,
    ) -> Result<Buy> {
        // Used to sanity check that the selected_outcome is valid
        self.get_outcome(selected_outcome)?;

        // Start by providing the appropriate liquidity portion to the pool.
        let liquidity_funds =
            Collateral((Decimal256::from_ratio(funds.0, 1u8) * liquidity).to_uint_floor());
        let AddLiquidity {
            lp,
            returned_to_user: mut pending_tokens,
            added_to_pool: _,
        } = self.add_liquidity(liquidity_funds);

        // Now we can add the remaining funds to the pool and mint an appropriate number of tokens.
        let funds = funds - liquidity_funds;
        self.pool_size += funds;
        pending_tokens
            .iter_mut()
            .for_each(|token| *token += Token(funds.0));

        // We'll take back all of our desired outcome tokens, so pull that out of pending.
        let mut returned = pending_tokens[selected_outcome.usize()];
        pending_tokens[selected_outcome.usize()] = Token::zero();

        // At this point, we haven't violated our invariants. Calculate the
        // current invariant and the product of non-selected outcomes, updating pool totals
        // along the way.
        let mut product_others = Uint256::one();
        let mut invariant = Uint256::one();

        for (outcome_idx, outcome) in self.outcomes.iter_mut().enumerate() {
            // Calculate the invariant _before_ adding more tokens.
            invariant *= outcome.pool_tokens.0;

            outcome.pool_tokens += pending_tokens[outcome_idx];

            if outcome.id != selected_outcome {
                product_others *= outcome.pool_tokens.0;
            }
        }

        let pool_selected = Token(invariant / product_others);

        let outcome = self.get_outcome_mut(selected_outcome)?;
        returned += outcome.pool_tokens - pool_selected;
        outcome.pool_tokens = pool_selected;

        Ok(Buy {
            lp,
            tokens: returned,
        })
    }

    /// Burns the given number of tokens for the given outcome.
    ///
    /// Returns the amount of liquidity freed up.
    ///
    /// Please see the repository's
    /// [selling/withdrawing collateral](https://github.com/Levana-Protocol/levana-predict/blob/main/docs/selling-withdrawing-collateral.md)
    /// document for more information.
    pub fn sell(&mut self, selected_outcome: OutcomeId, tokens: Token) -> Result<Sell> {
        assert!(self.outcomes.len() == 2);

        // We need to swap some of the selected outcome token for the unselected token.
        // We want the two values to be as close to each other as possible to maximize
        // the collateral we can withdraw. To do that, we use some math to determine
        // how much of the selected token to swap for unselected. Proofs provided elsewhere,
        // but if you're wondering what the a/b/c nomenclature is: we're using the qudaratic
        // equation to solve for the amount to burn.

        let unselected_outcome = match selected_outcome.usize() {
            0 => OutcomeId(1),
            1 => OutcomeId(0),
            _ => unreachable!(),
        };

        // Initial pool size of the selected and unselected tokens.
        let pool_selected = self
            .get_outcome(selected_outcome)?
            .pool_tokens
            .to_decimal256();
        let pool_unselected = self
            .get_outcome(unselected_outcome)?
            .pool_tokens
            .to_decimal256();

        // If we put all of the tokens we're trying to liquidate in the pool,
        // what would be the size?
        let new_pool_selected = pool_selected + tokens.to_decimal256();

        // Quadratic equation coefficients
        let a = Decimal256::one();
        // b is always negative, and Decimal256 only supports positive values.
        // We could pull in a different data type, but we'll just track the
        // negative version instead.
        let negb = new_pool_selected + pool_unselected;
        let c = new_pool_selected * pool_unselected - pool_selected * pool_unselected;

        // There are two roots for quadratic equations, but we always take the lower value.
        let radical = (negb * negb - Decimal256::from_ratio(4u8, 1u8) * a * c).sqrt();
        let selected_to_burn = (negb - radical) / (Decimal256::from_ratio(2u8, 1u8) * a);
        let selected_to_sell = tokens.to_decimal256() - selected_to_burn;

        // We can only sell integer values, not fractions. We want to round down the amount
        // we're going to sell.
        let selected_to_sell = selected_to_sell.to_uint_floor();
        let selected_to_burn = tokens.0 - selected_to_sell;

        // Now calculate how many unselected tokens we end up buying. This is determined
        // by respecting the CPMM invariant.
        let invariant = pool_selected * pool_unselected;
        let final_pool_selected = pool_selected + Decimal256::from_ratio(selected_to_sell, 1u8);
        let final_pool_unselected = invariant / final_pool_selected;
        let unselected_to_buy = (pool_unselected - final_pool_unselected).to_uint_floor();

        // Update the liquidity pool with token count changes.
        self.get_outcome_mut(selected_outcome)?.pool_tokens += Token(selected_to_sell);
        self.get_outcome_mut(unselected_outcome)?.pool_tokens -= Token(unselected_to_buy);

        // We'll redeem as many of these tokens as possible for collateral.
        // The remainder will be given back to the user.
        let to_redeem = selected_to_burn.min(unselected_to_buy);
        let selected_returned = Token(selected_to_burn - to_redeem);
        let unselected_returned = Token(unselected_to_buy - to_redeem);
        let returned = match selected_outcome.usize() {
            0 => vec![selected_returned, unselected_returned],
            1 => vec![unselected_returned, selected_returned],
            _ => unreachable!(),
        };

        let funds = Collateral(to_redeem);
        self.pool_size -= funds;

        Ok(Sell { funds, returned })
    }
}
