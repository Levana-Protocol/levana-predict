use crate::prelude::*;

#[must_use]
pub enum Funds {
    NoFunds,
    Funds { denom: String, amount: Uint128 },
}

impl Funds {
    pub fn from_message_info(info: &MessageInfo) -> Result<Self> {
        let mut iter = info.funds.iter();
        let Coin { denom, amount } = match iter.next() {
            Some(coin) => coin,
            None => return Ok(Funds::NoFunds),
        };
        if iter.next().is_some() {
            Err(Error::MultipleAssetsProvided)
        } else {
            Ok(Funds::Funds {
                denom: denom.clone(),
                amount: *amount,
            })
        }
    }

    pub fn require_none(self) -> Result<()> {
        match self {
            Funds::NoFunds => Ok(()),
            Funds::Funds { denom, amount } => Err(Error::UnexpectedFunds { denom, amount }),
        }
    }

    pub fn require_funds(self, required_denom: &str) -> Result<Collateral> {
        match self {
            Funds::NoFunds => Err(Error::MissingRequiredFunds {
                denom: required_denom.to_owned(),
            }),
            Funds::Funds { denom, amount } => {
                if denom == required_denom {
                    Ok(Collateral(amount.into()))
                } else {
                    Err(Error::IncorrectFundsDenom {
                        actual_denom: denom,
                        amount,
                        required_denom: required_denom.to_owned(),
                    })
                }
            }
        }
    }
}

pub fn assert_is_admin(storage: &dyn Storage, info: &MessageInfo) -> Result<()> {
    let admin = ADMIN.load(storage)?;

    if admin == info.sender {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}
