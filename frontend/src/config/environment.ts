import { match } from 'ts-pattern'

import ntrnLogo from '@assets/tokens/ntrn-logo.svg'

export type Environment = "mainnet" | "testnet"

export const ENV: Environment = match(window.location.host)
  .returnType<Environment>()
  .with("predict.levana.finance", () => "mainnet")
  .with("predict.staff.levana.exchange", () => "mainnet")
  .otherwise(() => "testnet")

export const IS_TESTNET = ENV === "testnet"

export const CONTRACT_ADDRESS = IS_TESTNET ? "neutron1cvdx6qpfetavhjejuf2e5lpzyslautwehrgc9uv04zj9vc7v468qsx22wk" : ""
export const QUERIER_ADDRESS = IS_TESTNET ? "https://querier-testnet.levana.finance" : "https://querier-mainnet.levana.finance"
export const INDEXER_ADDRESS = IS_TESTNET ? "https://indexer-testnet.levana.finance" : "https://indexer-mainnet.levana.finance"

export const NTRN_DENOM = "untrn"
export const NTRN_CONFIG = {
  icon: ntrnLogo,
  symbol: "NTRN",
  exponent: 6,
  pythId: "a8e6517966a52cb1df864b2764f3629fde3f21d2b640b5c572fcd654cbccd65e",
}
