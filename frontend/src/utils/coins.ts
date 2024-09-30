import BigNumber from "bignumber.js"

import defaultLogo from "@assets/coins/alt.png"
import ntrnLogo from "@assets/coins/ntrn-logo.svg"
import atomLogo from "@assets/coins/atom-logo.svg"
import datomLogo from "@assets/coins/datom-logo.svg"
import statomLogo from "@assets/coins/statom-logo.svg"
import stosmoLogo from "@assets/coins/stosmo-logo.svg"
import stdydxLogo from "@assets/coins/stdydx-logo.svg"
import sttiaLogo from "@assets/coins/sttia-logo.svg"
import stdymLogo from "@assets/coins/stdym-logo.svg"
import axlLogo from "@assets/coins/axl-logo.svg"
import osmoLogo from "@assets/coins/osmo-logo.svg"
import tiaLogo from "@assets/coins/tia-logo.svg"
import stkatomLogo from "@assets/coins/stkatom-logo.svg"
import dymLogo from "@assets/coins/dym-logo.svg"
import usdcLogo from "@assets/coins/usdc-logo.svg"

import {
  formatToSignificantDigits,
  unitsToValue,
  valueToUnits,
} from "@utils/number"

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN })
export const SIGNIFICANT_DIGITS = 5

export interface CoinConfig {
  icon: string
  symbol: string
  exponent: number
  pythId: string | undefined
}

export type Denom = string

export const USDC_DENOM =
  "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81"

export const coinConfigs: Map<Denom, CoinConfig> = new Map([
  [
    "untrn",
    {
      icon: ntrnLogo,
      symbol: "NTRN",
      exponent: 6,
      pythId:
        "a8e6517966a52cb1df864b2764f3629fde3f21d2b640b5c572fcd654cbccd65e",
    },
  ],
  [
    "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
    {
      icon: atomLogo,
      symbol: "ATOM",
      exponent: 6,
      pythId:
        "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
    },
  ],
  [
    "factory/neutron1k6hr0f83e7un2wjf29cspk7j69jrnskk65k3ek2nj9dztrlzpj6q00rtsa/udatom",
    {
      icon: datomLogo,
      symbol: "dATOM",
      exponent: 6,
      pythId:
        "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
    },
  ],
  [
    "ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C",
    {
      icon: statomLogo,
      symbol: "stATOM",
      exponent: 6,
      pythId:
        "e58c1e39b5d79f16a1bdf707e336310dda93884270b84f40a2b01bf74d75f671",
    },
  ],
  [
    "ibc/75249A18DEFBEFE55F83B1C70CAD234DF164F174C6BC51682EE92C2C81C18C93",
    {
      icon: stosmoLogo,
      symbol: "stOSMO",
      exponent: 6,
      pythId: undefined,
    },
  ],
  [
    "ibc/BAA1D21893B1D36865C6CA44D18F4ACF08BAD70CB6863C4722E0A61703808F77",
    {
      icon: stdydxLogo,
      symbol: "stDYDX",
      exponent: 18,
      pythId: undefined,
    },
  ],
  [
    "ibc/6569E05DEE32B339D9286A52BE33DFCEFC97267F23EF9CFDE0C055140967A9A5",
    {
      icon: sttiaLogo,
      symbol: "stTIA",
      exponent: 6,
      pythId:
        "a4d617ccf05ffb84700b0fadff45abb4a508e122fa6fc4d7b7c478a7306aaecd",
    },
  ],
  [
    "ibc/8D0C1AC5A72FB7EC187632D01BACBB68EF743CA1AF16A15C00ACBB9CF49A0070",
    {
      icon: stdymLogo,
      symbol: "stDYM",
      exponent: 18,
      pythId: undefined,
    },
  ],
  [
    "ibc/C0E66D1C81D8AAF0E6896E05190FDFBC222367148F86AC3EA679C28327A763CD",
    {
      icon: axlLogo,
      symbol: "AXL",
      exponent: 6,
      pythId:
        "60144b1d5c9e9851732ad1d9760e3485ef80be39b984f6bf60f82b28a2b7f126",
    },
  ],
  [
    "ibc/376222D6D9DAE23092E29740E56B758580935A6D77C24C2ABD57A6A78A1F3955",
    {
      icon: osmoLogo,
      symbol: "OSMO",
      exponent: 6,
      pythId:
        "5867f5683c757393a0670ef0f701490950fe93fdb006d181c8265a831ac0c5c6",
    },
  ],
  [
    "ibc/773B4D0A3CD667B2275D5A4A7A2F0909C0BA0F4059C0B9181E680DDF4965DCC7",
    {
      icon: tiaLogo,
      symbol: "TIA",
      exponent: 6,
      pythId:
        "09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723",
    },
  ],
  [
    "ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445",
    {
      icon: stkatomLogo,
      symbol: "stkATOM",
      exponent: 6,
      pythId: undefined,
    },
  ],
  [
    "ibc/4A6A46D4263F2ED3DCE9CF866FE15E6903FB5E12D87EB8BDC1B6B1A1E2D397B4",
    {
      icon: dymLogo,
      symbol: "DYM",
      exponent: 18,
      pythId:
        "a9f3b2a89c6f85a6c20a9518abde39b944e839ca49a0c92307c65974d3f14a57",
    },
  ],
  [
    USDC_DENOM,
    {
      icon: usdcLogo,
      symbol: "USDC",
      exponent: 6,
      pythId:
        "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    },
  ],
])

const getCoinConfig = (denom: Denom): CoinConfig => {
  return (
    coinConfigs.get(denom) ?? {
      icon: defaultLogo,
      symbol: denom,
      exponent: 0,
      pythId: undefined,
    }
  )
}

abstract class Asset {
  public symbol: string
  public units: BigNumber
  public exponent: number
  public maxDecimalPlaces: number

  constructor(
    symbol: string,
    units: BigNumber.Value,
    exponent: number,
    maxDecimalPlaces: number,
  ) {
    this.symbol = symbol
    this.units = BigNumber(units)
    this.exponent = exponent
    this.maxDecimalPlaces = maxDecimalPlaces
  }

  toInput(): string {
    return this.getValue().decimalPlaces(this.maxDecimalPlaces).toFixed()
  }

  toFullPrecision(withSuffix: boolean): string {
    return `${this.getValue().toFormat(this.maxDecimalPlaces)}${withSuffix ? ` ${this.symbol}` : ""}`
  }

  getValue(): BigNumber {
    return unitsToValue(this.units, this.exponent)
  }
}

class Coins extends Asset {
  public denom: Denom

  protected constructor(
    symbol: string,
    denom: Denom,
    units: BigNumber.Value,
    exponent: number,
  ) {
    super(symbol, units, exponent, exponent)
    this.denom = denom
  }

  toUsd(price: BigNumber): USD {
    return new USD(this.units.times(price).dividedBy(10 ** this.exponent))
  }

  toFormat(withSuffix: boolean): string {
    const value = unitsToValue(this.units, this.exponent)
    const formatted = formatToSignificantDigits(
      value,
      SIGNIFICANT_DIGITS,
      this.exponent,
    )
    return `${formatted}${withSuffix ? ` ${this.symbol}` : ""}`
  }

  static fromUnits(denom: Denom, units: BigNumber.Value): Coins {
    const coinConfig = getCoinConfig(denom)
    return new Coins(coinConfig.symbol, denom, units, coinConfig.exponent)
  }

  static fromValue(denom: Denom, value: BigNumber.Value): Coins {
    const coinConfig = getCoinConfig(denom)
    const units = valueToUnits(value, coinConfig.exponent)
    return Coins.fromUnits(denom, units)
  }

  minus(value: Coins): Coins {
    const newUnits = this.units.minus(value.units)
    return Coins.fromUnits(this.denom, newUnits)
  }

  times(value: BigNumber.Value): Coins {
    const newUnits = this.units.times(value)
    return Coins.fromUnits(this.denom, newUnits)
  }

  dividedBy(value: BigNumber.Value): Coins {
    const newUnits = this.units.dividedBy(value)
    return Coins.fromUnits(this.denom, newUnits)
  }
}

class USD extends Asset {
  static symbol = "USD"
  static maxDecimalPlaces = 2

  constructor(value: BigNumber.Value) {
    super(USD.symbol, value, 0, USD.maxDecimalPlaces)
  }

  toCoins(denom: Denom, coinsPrice: BigNumber): Coins {
    const coinConfig = getCoinConfig(denom)
    return Coins.fromUnits(
      denom,
      this.units.dividedBy(coinsPrice).times(10 ** coinConfig.exponent),
    )
  }

  toFormat(withSuffix: boolean): string {
    return `${this.getValue().toFormat(USD.maxDecimalPlaces)}${withSuffix ? ` ${this.symbol}` : ""}`
  }
}

export { Asset, Coins, USD, getCoinConfig }
