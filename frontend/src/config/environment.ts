import { match } from 'ts-pattern'

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
