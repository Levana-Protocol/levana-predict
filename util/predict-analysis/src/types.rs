use std::fmt::Display;

use cosmwasm_std::Decimal256;

#[derive(Debug, Clone, Copy)]
pub struct Collateral(pub Decimal256);
#[derive(Debug, Clone, Copy)]
pub struct Token(pub Decimal256);
impl Token {
    pub(crate) fn zero() -> Token {
        Token(Decimal256::zero())
    }
}

impl std::ops::Add for Collateral {
    type Output = Collateral;

    fn add(self, rhs: Self) -> Self::Output {
        Collateral(self.0 + rhs.0)
    }
}

impl std::ops::SubAssign for Collateral {
    fn sub_assign(&mut self, rhs: Self) {
        self.0 -= rhs.0;
    }
}

impl Display for Collateral {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}C", self.0)
    }
}

impl std::ops::AddAssign for Collateral {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
    }
}

impl Display for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}T", self.0)
    }
}

impl std::ops::MulAssign<Decimal256> for Collateral {
    fn mul_assign(&mut self, rhs: Decimal256) {
        self.0 *= rhs;
    }
}

impl std::ops::Div for Collateral {
    type Output = Decimal256;

    fn div(self, rhs: Self) -> Self::Output {
        self.0 / rhs.0
    }
}

impl std::ops::SubAssign for Token {
    fn sub_assign(&mut self, rhs: Token) {
        self.0 -= rhs.0;
    }
}

impl std::ops::Mul<Decimal256> for Token {
    type Output = Token;

    fn mul(self, rhs: Decimal256) -> Self::Output {
        Token(self.0 * rhs)
    }
}

impl std::ops::MulAssign<Decimal256> for Token {
    fn mul_assign(&mut self, rhs: Decimal256) {
        self.0 *= rhs;
    }
}

impl std::ops::Sub for Token {
    type Output = Token;

    fn sub(self, rhs: Self) -> Self::Output {
        Token(self.0 - rhs.0)
    }
}

impl std::ops::AddAssign for Token {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
    }
}

impl std::ops::Div for Token {
    type Output = Decimal256;

    fn div(self, rhs: Self) -> Self::Output {
        self.0 / rhs.0
    }
}

impl std::ops::Mul<Decimal256> for Collateral {
    type Output = Collateral;

    fn mul(self, rhs: Decimal256) -> Self::Output {
        Collateral(self.0 * rhs)
    }
}

impl std::ops::Sub for Collateral {
    type Output = Collateral;

    fn sub(self, rhs: Self) -> Self::Output {
        Collateral(self.0 - rhs.0)
    }
}
