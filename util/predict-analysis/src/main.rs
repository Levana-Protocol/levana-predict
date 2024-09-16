//! Implementation of: <https://docs.gnosis.io/conditionaltokens/docs/introduction3/>
mod types;

use std::{collections::HashMap, fmt::Display};

use cosmwasm_std::Decimal256;
use types::{Collateral, LpShare, Token};

#[derive(Debug)]
struct Pool {
    /// What percentage of deposits are sent to the liquidity pool?
    pool_portion: Decimal256,
    /// Token totals per outcome
    per_outcome: Vec<PerOutcome>,
    /// Total count of liquidity pool shares
    pool_shares: LpShare,
    /// Funds up for grabs
    funds: Collateral,
    /// Tokens per holder
    per_holder: HashMap<String, PerHolder>,
}

#[derive(Debug)]
struct PerOutcome {
    total: Token,
    pool: Token,
}

#[derive(Debug)]
struct PerHolder {
    /// Liquidity pool shares
    lp_shares: LpShare,
    /// Tokens per outcome
    tokens: Vec<Token>,
}

impl Pool {
    fn calc_invariant(&self) -> Decimal256 {
        let mut invariant = Decimal256::one();
        for outcome in &self.per_outcome {
            invariant *= outcome.pool.0;
        }
        invariant
    }

    fn new(deposits: &[Decimal256]) -> Self {
        println!("Starting new scenario, initial deposits: {deposits:?}");
        let mut funds = Collateral(Decimal256::zero());
        let mut per_outcome = vec![];
        for deposit in deposits {
            funds.0 += deposit;
            let token = Token(*deposit);
            per_outcome.push(PerOutcome {
                total: token,
                pool: token,
            });
        }
        let lp_shares = LpShare(funds.0);
        let mut per_holder = HashMap::new();
        per_holder.insert(
            "House".to_owned(),
            PerHolder {
                lp_shares,
                tokens: std::iter::repeat(Token::zero())
                    .take(deposits.len())
                    .collect(),
            },
        );
        let pool = Pool {
            pool_portion: "0.2".parse().unwrap(),
            per_outcome,
            pool_shares: lp_shares,
            funds,
            per_holder,
        };
        pool.print_outcomes();
        pool
    }

    fn deposit_liquidity(&mut self, funds: Collateral) -> LpShare {
        let old_funds = self.funds;
        let new_funds = old_funds + funds;
        self.funds = new_funds;

        let old_shares = self.pool_shares;
        let new_shares = old_shares * (new_funds / old_funds);
        self.pool_shares = new_shares;

        for per_outcome in &mut self.per_outcome {
            let old_pool = per_outcome.pool;
            let new_pool = old_pool * (new_funds / old_funds);
            per_outcome.pool = new_pool;
            per_outcome.total += new_pool - old_pool;
        }

        new_shares - old_shares
    }

    fn buy(&mut self, owner: impl Into<String>, funds: Collateral, outcome: usize) -> Token {
        // First we increase the size of the liquidity pool itself.
        let to_pool = funds * self.pool_portion;
        let shares = self.deposit_liquidity(to_pool);

        // Now we purchase the desired outcome with the remaining funds
        let to_buy = funds - to_pool;
        let invariant = self.calc_invariant();

        let old_funds = self.funds;
        let new_funds = old_funds + to_buy;
        self.funds = new_funds;

        let mut product_other = Decimal256::one();

        for (this_outcome, per_outcome) in self.per_outcome.iter_mut().enumerate() {
            let old_pool = per_outcome.pool;
            let new_pool = old_pool * (new_funds / old_funds);
            per_outcome.pool = new_pool;
            per_outcome.total += new_pool - old_pool;
            if this_outcome != outcome {
                product_other *= per_outcome.pool.0;
            }
        }

        let old_pool = self.per_outcome[outcome].pool;
        let new_pool = Token(invariant / product_other);
        let returned = old_pool - new_pool;
        self.per_outcome[outcome].pool = new_pool;

        let owner = owner.into();
        let holder = self.get_better_mut(&owner);
        holder.lp_shares += shares;
        holder.tokens[outcome] += returned;

        println!("{owner} purchased {returned} on {outcome} with {funds} and {shares} LP shares");
        self.print_outcomes();

        returned
    }

    fn get_better_mut(&mut self, owner: impl Into<String>) -> &mut PerHolder {
        self.per_holder
            .entry(owner.into())
            .or_insert_with(|| PerHolder {
                lp_shares: LpShare::zero(),
                tokens: std::iter::repeat(Token::zero())
                    .take(self.per_outcome.len())
                    .collect(),
            })
    }

    fn sell(&mut self, owner: impl Into<String>, tokens: Token, outcome: usize) -> Collateral {
        let owner = owner.into();

        let invariant_before = self.calc_invariant();

        self.get_better_mut(&owner).tokens[outcome] -= tokens;
        self.per_outcome[outcome].pool += tokens;

        let invariant_after = self.calc_invariant();

        let scale = if self.per_outcome.len() == 2 {
            (invariant_before / invariant_after).sqrt()
        } else {
            unimplemented!()
        };

        for per_outcome in self.per_outcome.iter_mut() {
            let pool_before = per_outcome.pool;
            let pool_after = pool_before * scale;
            per_outcome.pool = pool_after;
            per_outcome.total -= pool_before - pool_after;
        }

        let funds_before = self.funds;
        let funds_after = self.funds * scale;
        self.funds = funds_after;

        let returned = funds_before - funds_after;

        println!("{owner} sold {tokens} on {outcome} and received {returned}");
        self.print_outcomes();
        returned
    }

    fn winnings_for(&self, outcome: usize, tokens: Token) -> Collateral {
        self.funds * (tokens / self.per_outcome[outcome].total)
    }

    fn print_outcomes(&self) {
        println!("{self}");
        for outcome in 0..self.per_outcome.len() {
            println!("Results for outcome {outcome}");
            for (better, per_holder) in &self.per_holder {
                let tokens = per_holder.tokens[outcome]
                    + self.per_outcome[outcome].pool * (per_holder.lp_shares / self.pool_shares);
                let collateral = self.winnings_for(outcome, tokens);
                println!("{better} wins {collateral} from {tokens}");
            }
        }
        println!("\n\n");
    }

    fn sanity(&self) {
        for (outcome, per_outcome) in self.per_outcome.iter().enumerate() {
            let mut actual_total = per_outcome.pool;
            for holder in self.per_holder.values() {
                actual_total += holder.tokens[outcome];
            }
            assert_eq!(
                actual_total, per_outcome.total,
                "Mismatched totals for outcome {outcome}, calculated {actual_total}, stored is {}",
                per_outcome.total
            );
        }
    }
}

impl Display for Pool {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.sanity();

        writeln!(f, "\n=== Begin pool description ===")?;
        writeln!(f, "Prize pool: {}", self.funds)?;
        write!(f, "Total tokens: ")?;
        for per_outcome in &self.per_outcome {
            write!(f, "{}, ", per_outcome.total)?;
        }
        write!(f, "\nPool tokens: ")?;
        for per_outcome in &self.per_outcome {
            write!(f, "{}, ", per_outcome.pool)?;
        }
        for (better, tokens) in &self.per_holder {
            write!(f, "\n{better}: ")?;
            for tokens in &tokens.tokens {
                write!(f, "{tokens}, ")?;
            }
        }
        writeln!(f, "\n=== End   pool description ===")?;
        Ok(())
    }
}

fn main() {
    let mut pool = Pool::new(&["5".parse().unwrap(), "5".parse().unwrap()]);
    let received_yes = pool.buy("Alice", Collateral("10".parse().unwrap()), 0);
    pool.buy("Bob", Collateral("10".parse().unwrap()), 0);
    pool.sell("Alice", received_yes, 0);
}
