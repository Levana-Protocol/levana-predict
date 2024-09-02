use std::{fmt::Display, ops::AddAssign};

use cosmwasm_std::OverflowError;
use cw_storage_plus::{Key, KeyDeserialize, Prefixer, PrimaryKey};

use crate::prelude::*;

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug, Copy, PartialEq, Eq)]
pub struct Collateral(pub Uint128);
impl Collateral {
    pub(crate) fn zero() -> Self {
        Collateral(Uint128::zero())
    }

    pub(crate) fn checked_sub(&self, rhs: Collateral) -> Result<Self, OverflowError> {
        self.0.checked_sub(rhs.0).map(Collateral)
    }
}

impl AddAssign for Collateral {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
    }
}

impl Display for Collateral {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

#[derive(
    Clone, Serialize, Deserialize, JsonSchema, Debug, Copy, PartialEq, Eq, PartialOrd, Ord,
)]
pub struct Token(pub Decimal256);

impl Display for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl Token {
    pub fn zero() -> Self {
        Token(Decimal256::zero())
    }
}

impl AddAssign for Token {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
    }
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug, Copy)]
pub struct MarketId(pub u32);

impl Display for MarketId {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl MarketId {
    pub fn one() -> Self {
        MarketId(1)
    }

    pub fn next(self) -> Self {
        MarketId(self.0 + 1)
    }
}

impl<'a> PrimaryKey<'a> for MarketId {
    type Prefix = ();
    type SubPrefix = ();
    type Suffix = MarketId;
    type SuperSuffix = MarketId;

    #[inline]
    fn key(&self) -> Vec<Key> {
        PrimaryKey::key(&self.0)
    }
}

impl KeyDeserialize for MarketId {
    type Output = Self;

    #[inline]
    fn from_vec(value: Vec<u8>) -> StdResult<Self::Output> {
        <u32 as KeyDeserialize>::from_vec(value).map(Self)
    }
}

impl<'a> Prefixer<'a> for MarketId {
    #[inline]
    fn prefix(&self) -> Vec<Key> {
        <u32 as Prefixer>::prefix(&self.0)
    }
}

#[derive(
    Clone, Serialize, Deserialize, JsonSchema, Debug, Copy, PartialEq, Eq, PartialOrd, Ord,
)]
pub struct OutcomeId(pub u8);

impl Display for OutcomeId {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}
