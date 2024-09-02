use crate::prelude::*;

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> Result<Binary> {
    let now = env.block.time;

    match msg {
        QueryMsg::GlobalInfo {} => todo!(),
        QueryMsg::Market { id } => todo!(),
        QueryMsg::Positions { id, addr } => todo!(),
    }
}
