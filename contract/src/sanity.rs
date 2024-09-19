use crate::prelude::*;

pub fn sanity(store: &dyn Storage, env: &Env) {
    for market in MARKETS.range(store, None, None, cosmwasm_std::Order::Ascending) {
        let (
            market_id,
            StoredMarket {
                id,
                title: _,
                description: _,
                arbitrator: _,
                outcomes: market_outcomes,
                denom: _,
                deposit_fee: _,
                withdrawal_fee: _,
                pool_size,
                deposit_stop_date,
                withdrawal_stop_date,
                winner,
                house,
                total_wallets,
                lp_shares,
            },
        ) = market.unwrap();

        // Basic sanity of config values
        assert_eq!(market_id, id);
        assert!(deposit_stop_date >= withdrawal_stop_date);
        assert!(winner.is_none() || deposit_stop_date <= env.block.time);

        // We always need an entry for the house
        let house = HOLDERS.load(store, (market_id, &house)).unwrap();
        assert!(!house.shares.is_zero());

        let mut computed_tokens = market_outcomes
            .iter()
            .enumerate()
            .map(|(id, outcome)| {
                assert_eq!(id, outcome.id.usize());
                outcome.pool_tokens
            })
            .collect::<Vec<_>>();
        let mut computed_shares = LpShare::zero();
        let mut computed_total_wallets = 0;
        let mut computed_wallets = std::iter::repeat(0)
            .take(market_outcomes.len())
            .collect::<Vec<_>>();

        for holder in
            HOLDERS
                .prefix(market_id)
                .range(store, None, None, cosmwasm_std::Order::Ascending)
        {
            let ShareInfo {
                outcomes,
                shares,
                claimed_winnings,
            } = holder.unwrap().1;

            assert!(!claimed_winnings || winner.is_some());
            assert_eq!(outcomes.len(), market_outcomes.len());

            let mut has_tokens = false;

            computed_shares += shares;

            for outcome in 0..outcomes.len() {
                let tokens = outcomes[outcome];
                if !tokens.is_zero() {
                    computed_tokens[outcome] += tokens;
                    computed_wallets[outcome] += 1;
                    has_tokens = true;
                }
            }

            if has_tokens || !shares.is_zero() {
                computed_total_wallets += 1;
            }
        }

        assert_eq!(computed_shares, lp_shares);
        for tokens in computed_tokens {
            assert_eq!(tokens.0, pool_size.0);
        }

        assert_eq!(computed_total_wallets, total_wallets);

        for outcome in &market_outcomes {
            assert_eq!(computed_wallets[outcome.id.usize()], outcome.wallets);
        }
    }
}
