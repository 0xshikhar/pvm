# TeleBasket PVM Engine

Rust implementation of the TeleBasket rebalancing engine for PolkaVM.

## Prerequisites

- Rust 1.86+
- polkatool (installed via `cargo install polkatool`)

## Build

```bash
# Build the contract
RUSTC_BOOTSTRAP=1 cargo +1.86.0 build -Zbuild-std=core,alloc --target ./riscv64emac-unknown-none-polkavm.json --release

# Link to create .polkavm blob
polkatool link --strip --output contract.polkavm target/riscv64emac-unknown-none-polkavm/release/contract
```

Or use the Makefile:
```bash
make all
```

## Functions

The contract exposes these functions:

1. **rebalanceBasket(bytes)** - `0xf4993018`
   - Input: encoded (uint16[] weights, uint256 totalDeposited, uint32[] paraIds)
   - Output: uint16[] newWeights

2. **optimizeAllocation(bytes)** - `0x8fa5f25c`
   - Input: encoded (uint16[] weights, uint32[] paraIds)
   - Output: uint16[] optimizedWeights

3. **getPoolYields(uint32[])** - `0x5e540e6d`
   - Input: paraIds array
   - Output: yields array (basis points)

4. **getHistoricalVolatility(uint32[])** - `0x8d12f19a`
   - Input: paraIds array
   - Output: volatility array (basis points)

## Supported Parachains

- Hydration (2034) - Yield: 12%, Volatility: 5%
- Moonbeam (2004) - Yield: 8%, Volatility: 8%
- Acala (2000) - Yield: 10%, Volatility: 10%

## Deployment

Deploy the `contract.polkavm` file to Westend Asset Hub or Paseo Asset Hub using the Polkadot.js/apps or a deployment script.
