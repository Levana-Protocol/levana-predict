# List all recipes
default:
	just --list --unsorted

# Build contracts with Cosmos Docker tooling
build-contracts:
	./.ci/contracts.sh

# cargo clippy check
cargo-clippy-check:
    cd contract && cargo clippy --no-deps --locked --tests --benches --examples -- -Dwarnings

# cargo fmt check
cargo-fmt-check:
    cd contract && cargo fmt --all --check

# cargo compile
cargo-compile:
    cd contract && cargo test --no-run --locked

# cargo test
cargo-test:
    cd contract && cargo test --locked

# Check commits
check-commits:
	git fetch origin main --depth=1
	git log --pretty=format:"%ae" $(git branch --show-current)...origin/main > email
	awk -f ./.ci/commit-check.awk email
