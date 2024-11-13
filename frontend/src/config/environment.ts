import { match } from "ts-pattern"

export type Environment = "mainnet" | "testnet"

export const ENV: Environment = match(window.location.host)
  .returnType<Environment>()
  .with("predict.levana.finance", () => "mainnet")
  .otherwise(() => "mainnet")

export const IS_TESTNET = ENV === "testnet"

export const CONTRACT_ADDRESS = IS_TESTNET
  ? "neutron17d3z82pkjn37fazkkay2p76cty2ele7zp27gas29ju6x8s5awzysjcuaec"
  : "neutron14r4gqjhnuxzwcmypjle9grlksvjeyyy0mrw0965rdz5v3v5wcv6qjf8w55"

export const QUERIER_ADDRESS = IS_TESTNET
  ? "https://querier-testnet.levana.finance"
  : "https://querier-mainnet.levana.finance"

export const INDEXER_ADDRESS = IS_TESTNET
  ? "https://indexer-testnet.levana.finance"
  : "https://indexer-mainnet.levana.finance"
