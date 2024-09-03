use crate::prelude::*;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    InstantiateMsg { admin }: InstantiateMsg,
) -> Result<Response> {
    let admin = deps.api.addr_validate(&admin)?;
    ADMIN.save(deps.storage, &admin)?;

    cw2::set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    Ok(Response::new())
}
