use crate::prelude::*;

#[entry_point]
pub fn migrate(deps: DepsMut, env: Env, _msg: MigrateMsg) -> Result<Response> {
    let current_version = cw2::get_contract_version(deps.storage)?;
    let current = current_version
        .version
        .parse::<Version>()
        .map_err(|x| StdError::generic_err(x.to_string()))?;

    let new = CONTRACT_VERSION
        .parse::<Version>()
        .map_err(|x| StdError::generic_err(x.to_string()))?;

    if current_version.contract != CONTRACT_NAME {
        return Err(StdError::generic_err(format!(
            "Contract name mismatch. Current: {}, New: {}",
            current_version.contract, CONTRACT_NAME
        ))
        .into());
    }

    if current > new {
        return Err(StdError::generic_err(format!(
            "Current contract version is newer than the new one. Current: {}, New: {}",
            current, new
        ))
        .into());
    }

    cw2::set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    sanity(deps.storage, &env);

    Ok(Response::default())
}
