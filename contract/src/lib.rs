#![deny(clippy::as_conversions)]

mod api;
mod constants;
mod cpmm;
mod error;
mod execute;
mod instantiate;
mod migrate;
mod prelude;
mod query;
mod state;
#[cfg(test)]
mod tests;
mod types;
mod util;

pub use execute::execute;
pub use instantiate::instantiate;
pub use migrate::migrate;
pub use query::query;
