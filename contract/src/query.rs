use cosmwasm_std::to_json_binary;

use crate::prelude::*;

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> Result<Binary> {
    match msg {
        QueryMsg::GlobalInfo {} => to_json_binary(&global_info(deps)?),
        QueryMsg::Market { id } => to_json_binary(&market(deps, id)?),
        QueryMsg::Positions { id, addr } => to_json_binary(&positions(deps, id, addr)?),
    }
    .map_err(Error::from)
}

fn global_info(deps: Deps) -> Result<GlobalInfo> {
    Ok(GlobalInfo {
        latest_market_id: LAST_MARKET_ID.may_load(deps.storage)?,
        admin: ADMIN.load(deps.storage)?,
    })
}

fn market(deps: Deps, id: MarketId) -> Result<MarketResp> {
    StoredMarket::load(deps.storage, id)
}

fn positions(deps: Deps, id: MarketId, addr: String) -> Result<PositionsResp> {
    let addr = deps.api.addr_validate(&addr)?;
    let outcomes = SHARES
        .may_load(deps.storage, (id, &addr))?
        .unwrap_or_default()
        .outcomes;
    Ok(PositionsResp { outcomes })
}
