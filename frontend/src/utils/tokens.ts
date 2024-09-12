import BigNumber from 'bignumber.js'

import defaultLogo from '@assets/tokens/alt.png'
import ntrnLogo from '@assets/tokens/ntrn-logo.svg'
import atomLogo from '@assets/tokens/atom-logo.svg'
import datomLogo from '@assets/tokens/datom-logo.svg'
import statomLogo from '@assets/tokens/statom-logo.svg'
import stosmoLogo from '@assets/tokens/stosmo-logo.svg'
import stdydxLogo from '@assets/tokens/stdydx-logo.svg'
import sttiaLogo from '@assets/tokens/sttia-logo.svg'
import stdymLogo from '@assets/tokens/stdym-logo.svg'
import ethLogo from '@assets/tokens/eth-logo.svg'
import btcLogo from '@assets/tokens/btc-logo.svg'
import axlLogo from '@assets/tokens/axl-logo.svg'
import osmoLogo from '@assets/tokens/osmo-logo.svg'
import seiLogo from '@assets/tokens/sei-logo.svg'
import aktLogo from '@assets/tokens/akt-logo.svg'
import injLogo from '@assets/tokens/inj-logo.svg'
import tiaLogo from '@assets/tokens/tia-logo.svg'
import stkatomLogo from '@assets/tokens/stkatom-logo.svg'
import dymLogo from '@assets/tokens/dym-logo.svg'
import usdcLogo from '@assets/tokens/usdc-logo.svg'

import { formatToSignificantDigits, unitsToValue, valueToUnits } from '@utils/number'

export const SIGNIFICANT_DIGITS = 5

export interface TokenConfig {
  icon: string,
  symbol: string,
  exponent: number,
  pythId: string | undefined,
}

export type Denom = string

export const tokenConfigs: Map<Denom, TokenConfig> = new Map([
  [
    "untrn",
    {
      icon: ntrnLogo,
      symbol: "NTRN",
      exponent: 6,
      pythId: "a8e6517966a52cb1df864b2764f3629fde3f21d2b640b5c572fcd654cbccd65e",
    },
  ],
  [
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    {
      icon: atomLogo,
      symbol: "ATOM",
      exponent: 6,
      pythId: "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
    },
  ],
  [
    "ibc/EA6E1E8BA2EB9F681C4BD12C8C81A46530A62934F2BD561B120A00F46946CE87	",
    {
      icon: datomLogo,
      symbol: "dATOM",
      exponent: 6,
      pythId: "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
    },
  ],
  [
    "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
    {
      icon: statomLogo,
      symbol: "stATOM",
      exponent: 6,
      pythId: "e58c1e39b5d79f16a1bdf707e336310dda93884270b84f40a2b01bf74d75f671",
    },
  ],
  [
    "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
    {
      icon: stosmoLogo,
      symbol: "stOSMO",
      exponent: 6,
      pythId: undefined,
    },
  ],
  [
    "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
    {
      icon: stdydxLogo,
      symbol: "stDYDX",
      exponent: 18,
      pythId: undefined,
    },
  ],
  [
    "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
    {
      icon: sttiaLogo,
      symbol: "stTIA",
      exponent: 6,
      pythId: "a4d617ccf05ffb84700b0fadff45abb4a508e122fa6fc4d7b7c478a7306aaecd",
    },
  ],
  [
    "ibc/D53E785DC9C5C2CA50CADB1EFE4DE5D0C30418BE0E9C6F2AF9F092A247E8BC22",
    {
      icon: stdymLogo,
      symbol: "stDYM",
      exponent: 18,
      pythId: undefined,
    },
  ],
  [
    "ibc/A23E590BA7E0D808706FB5085A449B3B9D6864AE4DDE7DAF936243CEBB2A3D43",
    {
      icon: ethLogo,
      symbol: "ETH",
      exponent: 18,
      pythId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    },
  ],
  [
    "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
    {
      icon: btcLogo,
      symbol: "BTC",
      exponent: 8,
      pythId: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    },
  ],
  [
    "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
    {
      icon: axlLogo,
      symbol: "AXL",
      exponent: 6,
      pythId: "60144b1d5c9e9851732ad1d9760e3485ef80be39b984f6bf60f82b28a2b7f126",
    },
  ],
  [
    "ibc/13B2C536BB057AC79D5616B8EA1B9540EC1F2170718CAFF6F0083C966FFFED0B",
    {
      icon: osmoLogo,
      symbol: "OSMO",
      exponent: 6,
      pythId: "5867f5683c757393a0670ef0f701490950fe93fdb006d181c8265a831ac0c5c6",
    },
  ],
  [
    "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
    {
      icon: seiLogo,
      symbol: "SEI",
      exponent: 6,
      pythId: "53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb",
    },
  ],
  [
    "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
    {
      icon: aktLogo,
      symbol: "AKT",
      exponent: 18,
      pythId: "4ea5bb4d2f5900cc2e97ba534240950740b4d3b89fe712a94a7304fd2fd92702",
    },
  ],
  [
    "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
    {
      icon: injLogo,
      symbol: "INJ",
      exponent: 18,
      pythId: "7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592",
    },
  ],
  [
    "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
    {
      icon: tiaLogo,
      symbol: "TIA",
      exponent: 6,
      pythId: "09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723",
    },
  ],
  [
    "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
    {
      icon: stkatomLogo,
      symbol: "stkATOM",
      exponent: 6,
      pythId: undefined,
    },
  ],
  [
    "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
    {
      icon: dymLogo,
      symbol: "DYM",
      exponent: 18,
      pythId: "a9f3b2a89c6f85a6c20a9518abde39b944e839ca49a0c92307c65974d3f14a57",
    },
  ],
  [
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
    {
      icon: usdcLogo,
      symbol: "USDC",
      exponent: 6,
      pythId: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    },
  ],
])

const getTokenConfig = (denom: Denom): TokenConfig => {
  return tokenConfigs.get(denom) ?? { icon: defaultLogo, symbol: denom, exponent: 0, pythId: undefined }
}

abstract class Asset {
  public symbol: string
  public units: BigNumber
  protected exponent: number
  protected maxDecimalPlaces: number

  constructor(symbol: string, units: BigNumber.Value, exponent: number, maxDecimalPlaces: number) {
    this.symbol = symbol
    this.units = BigNumber(units)
    this.exponent = exponent
    this.maxDecimalPlaces = maxDecimalPlaces
  }

  toInput(): string {
    return this.getValue().decimalPlaces(this.maxDecimalPlaces).toFixed()
  }

  getValue(): BigNumber {
    return unitsToValue(this.units, this.exponent)
  }
}

class Tokens extends Asset {
  public denom: Denom

  protected constructor(symbol: string, denom: Denom, units: BigNumber.Value, exponent: number) {
    super(symbol, units, exponent, exponent)
    this.denom = denom
  }
  toUsd(price: BigNumber): USD {
    return new USD(this.units.times(price).dividedBy(Math.pow(10, this.exponent)))
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

  toFullPrecision(withSuffix: boolean): string {
    return `${this.getValue().toFormat(this.exponent)}${withSuffix ? ` ${this.symbol}` : ""}`
  }

  static fromUnits(denom: string, units: BigNumber.Value): Tokens {
    const tokenConfig = getTokenConfig(denom)
    return new Tokens(tokenConfig.symbol, denom, units, tokenConfig.exponent)
  }

  static fromValue(denom: string, value: BigNumber.Value): Tokens {
    const tokenConfig = getTokenConfig(denom)
    const units = valueToUnits(value, tokenConfig.exponent)
    return Tokens.fromUnits(denom, units)
  }
}

class USD extends Asset {
  static symbol = "USD"
  static maxDecimalPlaces = 2

  constructor(value: BigNumber.Value) {
    super(USD.symbol, value, 0, USD.maxDecimalPlaces)
  }

  toTokens(denom: Denom, tokensPrice: BigNumber): Tokens {
    const tokenConfig = getTokenConfig(denom)
    return Tokens.fromUnits(denom, this.units.dividedBy(tokensPrice).times(Math.pow(10, tokenConfig.exponent)))
  }

  toFormat(withSuffix: boolean): string {
    return `${this.getValue().toFormat(USD.maxDecimalPlaces)}${withSuffix ? ` ${this.symbol}` : ""}`
  }
}

export { Asset, Tokens, USD, getTokenConfig }
