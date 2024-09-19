# Selling/withdrawing collateral

The smart contracts implement an execute method called `withdraw`, which allows you to send back some outcome tokens in exchange for collateral. The implementation is not intuitive, and this document explains how it works.

Note that this implementation only works for markets with two outcomes. This document will talk about a yes/no market, where the user is trying to exchange their Yes tokens for collateral.

## Overall goal

Predictions markets allow you to mint 1 Yes and 1 No token for each 1 collateral sent in. This makes sense, because the promise of these tokens is that either the Yes or No token will be redeemable for a collateral token at the end. For the same reason, 1 Yes and 1 No token can be exchanged for 1 collateral token.

However, you can't redeem only Yes tokens for collateral on their own, since this would mean some of the No tokens still in existence would have no collateral backing them. We could, in theory, have separate liquidity pools to allow Yes and No tokens to be exchanged directly for collateral, but this would introduce more complexity, require more liquidity to maintain, and introduces possibilities for price divergence.

Instead, our goal is to swap some of our Yes tokens for No tokens, ending up with an equivalent number of Yes and No tokens. Then these two sets of tokens can be redeemed (aka burned) for collateral. The trick of the math is figuring out how many tokens to swap. But in short, here's what the steps are:

1. User calls the `withdraw` method, providing a certain number of Yes tokens. Call this number `sent_yes`.
2. The contract swaps a certain number of Yes tokens for No tokens. Call this `sold_yes` and `purchased_no`, respectively.
3. After swapping those Yes tokens, we're left with `sent_yes - sold_yes` Yes tokens available for burning. We want to make sure `send_yes - sold_yes` is equal to `purchased_no`.
4. Since we have the same number of Yes and No tokens available, burn them in exchange for the same number of collateral tokens, and send those back to the user.

OK, with the procedure described, let's dive into the math.

## The math

Definitions:

* `sent_yes`: number of yes tokens the user wants to get rid of in exchange for collateral
* `sold_yes`: number of yes tokens swapped out for no tokens
* `purchased_no`: number of no tokens received from swapping `sold_yes`
* `pool_yes`: number of yes tokens in the liquidity pool at the beginning of this process
* `pool_no`: number of no tokens in the liquidity pool at the beginning of this process

We have the following equality from our goals:

```
sent_yes - sold_yes = purchased_no
```

And based on the Constant Product Market Maker (CPMM) rules, we need to ensure that the liquidity pool maintains its product invariant before and after the trade of tokens. Or, as an equality:

```
pool_yes * pool_no = (pool_yes + sold_yes) * (pool_no - purchased_no)
```

We can rearrange the first equality to:

```
sold_yes = sent_yes - purchased_no
```

And then we can substitute into the second equality:

```
pool_yes * pool_no = (pool_yes + sent_yes - purchased_no) * (pool_no - purchased_no)
```

`pool_yes`, `pool_no`, and `sent_yes` are all known values, so the only value we need to solve for is `purchased_no`. To make the equations slightly easier to read, let's define a new variable representing the temporary, unbalanced size of the Yes pool after the sent tokens are added:

```
temp_pool_yes = pool_yes + sent_yes
```

And subtituting that in:

```
pool_yes * pool_no = (temp_pool_yes - purchased_no) * (pool_no - purchased_no)
```

If we multiply out that equation and move everything to one side, we get:

```
purchased_no^2 + (-temp_pool_yes - pool_no) * purchased_no + (temp_pool_yes * pool_no - pool_yes * pool_no) = 0
```

Using our definition of `temp_pool_yes` above, we can simplify one part of the expression:

```
temp_pool_yes * pool_no - pool_yes * pool_no
  = pool_no * (temp_pool_yes - pool_yes)
  = pool_no * (pool_yes + sent_yes - pool_yes)
  = pool_no * sent_yes
```

Simplifying our equation to:

```
purchased_no^2 + (-temp_pool_yes - pool_no) * purchased_no + pool_no * sent_yes = 0
```

This is a quadratic equation, and can be solved using the quadratic formula, specifically:

```
a = 1
b = -temp_pool_yes - pool_no
c = pool_no * sent_yes

purchased_no = (-b - sqrt(b^2 - 4ac)) / 2a
```

And this is the algorithm implemented in the smart contract. There's only one extra complication in the contract: integral arithmetic. Since all tokens are stored as integers instead of real numbers or even decimal values, we don't necessarily end up with exactly the same number of yes and no tokens at the end. The contract performs the swap, returns collateral equal to the smaller of the yes or no token count, and assigns the remaining tokens (dust) to the house user who opened the market.
