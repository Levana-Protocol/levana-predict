import { match } from 'ts-pattern'

export type Environment = "mainnet" | "testnet"

export const ENV: Environment = match(window.location.host)
  .returnType<Environment>()
  .otherwise(() => "testnet")

export const IS_TESTNET = ENV === "testnet"

export const CONTRACT_ADDRESS = IS_TESTNET ? "neutron1z78cea35fcnpdmu8nvy8k02ru7hg5phm0ydsgasjarr9956asd0syt225v" : ""
export const QUERIER_ADDRESS = IS_TESTNET ? "https://querier-testnet.levana.finance" : "https://querier-mainnet.levana.finance"
export const INDEXER_ADDRESS = IS_TESTNET ? "https://indexer-testnet.levana.finance" : "https://indexer-mainnet.levana.finance"
