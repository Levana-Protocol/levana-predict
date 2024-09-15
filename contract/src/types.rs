use std::{
    fmt::Display,
    ops::{Add, AddAssign, Div, Mul, MulAssign, Sub, SubAssign},
};

use cosmwasm_std::{ConversionOverflowError, OverflowError};
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

impl Add for Collateral {
    type Output = Collateral;

    fn add(self, rhs: Self) -> Self::Output {
        Collateral(self.0 + rhs.0)
    }
}

impl AddAssign for Collateral {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
    }
}

impl Sub for Collateral {
    type Output = Collateral;

    fn sub(self, rhs: Self) -> Self::Output {
        Collateral(self.0 - rhs.0)
    }
}

impl Mul<Decimal256> for Collateral {
    type Output = Result<Collateral, ConversionOverflowError>;

    fn mul(self, rhs: Decimal256) -> Self::Output {
        let uint256 = (Decimal256::from_ratio(self.0, 1u8) * rhs).to_uint_floor();
        uint256.try_into().map(Collateral)
    }
}

impl Div for Collateral {
    type Output = Decimal256;

    fn div(self, rhs: Self) -> Self::Output {
        Decimal256::from_ratio(self.0, rhs.0)
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

impl Add for Token {
    type Output = Token;

    fn add(self, rhs: Self) -> Self::Output {
        Token(self.0 + rhs.0)
    }
}

impl Sub for Token {
    type Output = Token;

    fn sub(self, rhs: Self) -> Self::Output {
        Token(self.0 - rhs.0)
    }
}

impl SubAssign for Token {
    fn sub_assign(&mut self, rhs: Self) {
        self.0 -= rhs.0;
    }
}

impl Mul<Decimal256> for Token {
    type Output = Token;

    fn mul(self, rhs: Decimal256) -> Self::Output {
        Token(self.0 * rhs)
    }
}

impl MulAssign<Decimal256> for Token {
    fn mul_assign(&mut self, rhs: Decimal256) {
        self.0 *= rhs;
    }
}

impl Div for Token {
    type Output = Decimal256;

    fn div(self, rhs: Self) -> Self::Output {
        self.0 / rhs.0
    }
}

impl Display for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl Token {
    pub fn zero() -> Self {
        Token(Decimal256::zero())
    }

    pub fn is_zero(&self) -> bool {
        self.0.is_zero()
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

/// Identifier of the outcome for a market.
///
/// Outcomes are 0-indexed, and we restrict them to a u8. Yes, that means
/// we cannot support bets with 257 outcomes.
#[derive(
    Clone, Serialize, Deserialize, JsonSchema, Debug, Copy, PartialEq, Eq, PartialOrd, Ord,
)]
pub struct OutcomeId(u8);
impl OutcomeId {
    pub(crate) fn usize(&self) -> usize {
        self.0.into()
    }
}

impl Display for OutcomeId {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl From<u8> for OutcomeId {
    fn from(value: u8) -> Self {
        OutcomeId(value)
    }
}

impl TryFrom<usize> for OutcomeId {
    type Error = Error;

    fn try_from(idx: usize) -> std::result::Result<Self, Self::Error> {
        u8::try_from(idx)
            .map(Self)
            .map_err(|source| Error::TooManyOutcomes {
                idx: idx.to_string(),
                source,
            })
    }
}

#[derive(Clone, Serialize, Deserialize, JsonSchema, Debug, Copy, PartialEq, Eq)]
pub struct LpShare(pub Decimal256);
impl LpShare {
    pub(crate) fn zero() -> LpShare {
        LpShare(Decimal256::zero())
    }
}

impl Display for LpShare {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl AddAssign for LpShare {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
    }
}

impl Sub for LpShare {
    type Output = LpShare;

    fn sub(self, rhs: Self) -> Self::Output {
        LpShare(self.0 - rhs.0)
    }
}

impl Mul<Decimal256> for LpShare {
    type Output = LpShare;

    fn mul(self, rhs: Decimal256) -> Self::Output {
        LpShare(self.0 * rhs)
    }
}

impl MulAssign<Decimal256> for LpShare {
    fn mul_assign(&mut self, rhs: Decimal256) {
        self.0 *= rhs;
    }
}

impl Div for LpShare {
    type Output = Decimal256;

    fn div(self, rhs: Self) -> Self::Output {
        self.0 / rhs.0
    }
}
