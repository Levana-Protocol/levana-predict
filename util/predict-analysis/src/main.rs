//! Implementation of: <https://docs.gnosis.io/conditionaltokens/docs/introduction3/>
mod types;

use std::{collections::HashMap, fmt::Display};

use cosmwasm_std::Decimal256;
use types::{Collateral, Token};

#[derive(Debug)]
struct Pool {
    /// Stickiness parameter, what percentage of tokens we pretend are in the pool
    stickiness: Decimal256,
    /// Funds up for grabs
    funds: Collateral,
    /// Total tokens per outcome
    total_tokens: Vec<Token>,
    /// Tokens per holder
    tokens_per_holder: HashMap<String, Vec<Token>>,
}

impl Pool {
    fn calc_invariant(&self) -> Decimal256 {
        let mut invariant = Decimal256::one();
        for tokens in &self.total_tokens {
            invariant *= tokens.0;
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
        let mut tokens_per_holder = HashMap::new();
        tokens_per_holder.insert("House".to_owned(), tokens.clone());
        let pool = Pool {
            stickiness: "0.8".parse().unwrap(),
            funds,
            total_tokens: tokens,
            tokens_per_holder,
        };
        pool.print_outcomes();
        pool
    }

    fn buy(&mut self, owner: impl Into<String>, funds: Collateral, outcome: usize) -> Token {
        // We want to pretend as if all the tokens are in the liquidity pool, even though
        // they aren't. Since we won't be able to change the number of tokens held by others,
        // we instead determine what portion of the tokens this owner would have acquired
        // under those circumstances, and then make sure they end up with that proportion.
        let owner = owner.into();

        // Track the prize pool size before and after this deposit.
        let old_funds = self.funds;
        let new_funds = self.funds + funds;
        self.funds = new_funds;

        // yes1 = stickiness * orig
        // poolportion = funds1 / funds2
        // yes2 = yes1 / poolportion
        // tempminted = yes2 - yes1
        // share = tempminted / (orig + tempminted)
        // total = orig + minted
        // minted = share * total
        // minted = share * (orig + minted)
        // minted * (1 - share) = share * orig
        // minted = (share * orig) / (1 - share)

        // Assume that the outcome we're voting on is "yes" for all comments.

        // How many yes tokens we pretend were in the starting pool.
        let yes1 = self.total_tokens[outcome] * self.stickiness;

        // If we simply scaled up the number of yes tokens based on the
        // funds increase, how many tokens would be in the pool?
        let yes2 = yes1 * (new_funds / old_funds);

        // And therefore, how many yes tokens did we mint?
        let minted = yes2 - yes1;

        self.total_tokens[outcome] += minted;
        *self.get_better_mut(&owner, outcome) += minted;

        println!("{owner} purchased {minted} on {outcome} with {funds}");
        self.print_outcomes();

        minted
    }

    fn get_better_mut(&mut self, owner: impl Into<String>, outcome: usize) -> &mut Token {
        self.tokens_per_holder
            .entry(owner.into())
            .or_insert_with(|| {
                std::iter::repeat(Token::zero())
                    .take(self.total_tokens.len())
                    .collect()
            })
            .get_mut(outcome)
            .unwrap()
    }

    fn sell(&mut self, owner: impl Into<String>, tokens: Token, outcome: usize) -> Collateral {
        let owner = owner.into();

        *self.get_better_mut(&owner, outcome) -= tokens;

        let old_tokens = self.total_tokens[outcome];
        self.total_tokens[outcome] -= tokens;
        let scale = if self.total_tokens.len() == 2 {
            (self.total_tokens[outcome] / old_tokens).sqrt()
        } else {
            unimplemented!("Only support 2 outcomes");
        };

        let old_funds = self.funds;
        self.funds *= scale;
        let returned = old_funds - self.funds;

        println!("{owner} sold {tokens} on {outcome} and received {returned}");
        self.print_outcomes();
        returned
    }

    fn winnings_for(&self, outcome: usize, tokens: Token) -> Collateral {
        self.funds * (tokens / self.total_tokens[outcome])
    }

    fn print_outcomes(&self) {
        println!("{self}");
        for outcome in 0..self.total_tokens.len() {
            println!("Results for outcome {outcome}");
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
    let mut pool = Pool::new(&["5".parse().unwrap(), "5".parse().unwrap()]);
    let received_yes = pool.buy("Alice", Collateral("10".parse().unwrap()), 0);
    return;
    pool.buy("Bob", Collateral("10".parse().unwrap()), 0);
    pool.sell("Alice", received_yes, 0);
}
