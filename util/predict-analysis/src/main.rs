//! Implementation of: <https://docs.gnosis.io/conditionaltokens/docs/introduction3/>
mod types;

use std::{collections::HashMap, fmt::Display};

use cosmwasm_std::Decimal256;
use types::{Collateral, Token};

#[derive(Debug)]
struct Pool {
    /// Funds up for grabs
    funds: Collateral,
    /// Pool tokens per outcome
    pool_tokens: Vec<Token>,
    /// Total tokens per outcome
    total_tokens: Vec<Token>,
    /// Tokens per holder
    tokens_per_holder: HashMap<String, Vec<Token>>,
}

impl Pool {
    fn calc_invariant(&self) -> Decimal256 {
        let mut invariant = Decimal256::one();
        for token in &self.pool_tokens {
            invariant *= token.0;
        }
        invariant
    }

    fn new(deposits: &[Decimal256]) -> Self {
        println!("Starting new scenario, initial deposits: {deposits:?}");
        let mut funds = Collateral(Decimal256::zero());
        let mut tokens = vec![];
        let mut invariant = Decimal256::one();
        for deposit in deposits {
            funds.0 += deposit;
            tokens.push(Token(*deposit));
            invariant *= deposit;
        }
        let pool = Pool {
            funds,
            pool_tokens: tokens.clone(),
            total_tokens: tokens,
            tokens_per_holder: HashMap::new(),
        };
        pool.print_outcomes();
        pool
    }

    fn buy(&mut self, owner: impl Into<String>, funds: Collateral, outcome: usize) -> Token {
        let owner = owner.into();

        let invariant_before = self.calc_invariant();
        self.add_liquidity_inner(funds);
        let invariant_after = self.calc_invariant();

        let portion_returned = Decimal256::one() - invariant_before / invariant_after;
        let returned = self.pool_tokens[outcome] * portion_returned;
        self.pool_tokens[outcome] -= returned;
        println!("{owner} purchased {returned} on {outcome} with {funds}");
        *self.get_better_mut(owner, outcome) += returned;
        self.print_outcomes();
        returned
    }

    fn get_better_mut(&mut self, owner: impl Into<String>, outcome: usize) -> &mut Token {
        self.tokens_per_holder
            .entry(owner.into())
            .or_insert_with(|| {
                std::iter::repeat(Token::zero())
                    .take(self.pool_tokens.len())
                    .collect()
            })
            .get_mut(outcome)
            .unwrap()
    }

    fn sell(&mut self, owner: impl Into<String>, tokens: Token, outcome: usize) -> Collateral {
        let owner = owner.into();

        let invariant_before = self.calc_invariant();
        *self.get_better_mut(&owner, outcome) -= tokens;
        self.pool_tokens[outcome] += tokens;
        let invariant_after = self.calc_invariant();

        let scale = if self.pool_tokens.len() == 2 {
            (invariant_before / invariant_after).sqrt()
        } else {
            unimplemented!("Don't support other than 2 outcomes");
        };

        let total_before = self.total_tokens[outcome];
        for (outcome, pool_tokens) in self.pool_tokens.iter_mut().enumerate() {
            let pool_before = *pool_tokens;
            *pool_tokens *= scale;
            self.total_tokens[outcome] = pool_before - *pool_tokens;
        }
        let total_after = self.total_tokens[outcome];
        let returned = self.funds * ((total_before - total_after) / total_before);
        self.funds -= returned;
        println!("{owner} sold {tokens} on {outcome} and received {returned}");
        self.print_outcomes();
        returned
    }

    fn add_liquidity_inner(&mut self, funds: Collateral) {
        let old_funds = self.funds;
        self.funds += funds;
        let scale = self.funds / old_funds;
        for (outcome, total) in self.total_tokens.iter_mut().enumerate() {
            let old_total = *total;
            *total *= scale;
            self.pool_tokens[outcome] += *total - old_total;
        }
    }

    fn add_liquidity(&mut self, funds: Collateral) {
        println!("Added {funds} to the liquidity pool");
        self.add_liquidity_inner(funds);
        self.print_outcomes();
    }

    fn winnings_for(&self, outcome: usize, tokens: Token) -> Collateral {
        self.funds * (tokens / self.total_tokens[outcome])
    }

    fn print_outcomes(&self) {
        println!("{self}");
        for outcome in 0..self.pool_tokens.len() {
            println!("Results for outcome {outcome}");
            let pool = self.pool_tokens[outcome];
            let collateral = self.winnings_for(outcome, pool);
            println!("Liquidity pool wins {collateral} from {pool}");
            for (better, tokens) in &self.tokens_per_holder {
                let tokens = tokens[outcome];
                let collateral = self.winnings_for(outcome, tokens);
                println!("{better} wins {collateral} from {tokens}");
            }
        }
        println!("\n\n");
    }
}

impl Display for Pool {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        writeln!(f, "\n=== Begin pool description ===")?;
        writeln!(f, "Prize pool: {}", self.funds)?;
        write!(f, "Total tokens: ")?;
        for tokens in &self.total_tokens {
            write!(f, "{tokens}, ")?;
        }
        write!(f, "\nLiquidity pool: ")?;
        for tokens in &self.pool_tokens {
            write!(f, "{tokens}, ")?;
        }
        for (better, tokens) in &self.tokens_per_holder {
            write!(f, "\n{better}: ")?;
            for tokens in tokens {
                write!(f, "{tokens}, ")?;
            }
        }
        writeln!(f, "\n=== End   pool description ===")?;
        Ok(())
    }
}

fn main() {
    let mut pool = Pool::new(&["2.5".parse().unwrap(), "2.5".parse().unwrap()]);
    pool.add_liquidity(Collateral("5".parse().unwrap()));
    let received_yes = pool.buy("Alice", Collateral("10".parse().unwrap()), 0);
    pool.buy("Bob", Collateral("10".parse().unwrap()), 0);
    pool.sell("Alice", received_yes, 0);
}
