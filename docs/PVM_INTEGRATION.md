# TeleBasket Paseo Integration (Contracts + Rust PVM + Frontend)

**Last updated:** 2026-03-20

This document covers the technical integration between Solidity contracts, the Rust PVM engine, and the frontend for TeleBasket on Paseo testnet.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [PVM Engine Interface](#2-pvm-engine-interface)
3. [Solidity ↔ Rust Communication](#3-solidity--rust-communication)
4. [Data Encoding Details](#4-data-encoding-details)
5. [Deployment Guide](#5-deployment-guide)
6. [Testing & Verification](#6-testing--verification)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Viem)                          │
│                                                                          │
│  useBasketManager.rebalance(walletClient, basketId)                      │
│         │                                                                 │
└─────────┼────────────────────────────────────────────────────────────────┘
          │ writeContract()
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  BasketManager.sol (Paseo EVM)                          │
│                                                                          │
│  PVM Engine Address: 0x0000000000000000000000000000000000000900         │
│  XCM Precompile: 0x0000000000000000000000000000000000000800             │
│                                                                          │
│  rebalance(uint256 basketId)                                             │
│       │                                                                  │
│       ├── _encodeRebalanceInput(basket)                                 │
│       │      │                                                           │
│       │      ▼                                                           │
│       │   bytes: abi.encode(weights, totalDeposited, paraIds)          │
│       │                                                                  │
│       ├── staticcall(pvmEngine, data)                                   │
│       │                                                                  │
│       └── Update allocations where drift > 200 bps                      │
└─────────────────────────┬────────────────────────────────────────────────┘
                          │ staticcall (read-only)
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 PVM Engine (RISC-V / PolkaVM)                           │
│                                                                          │
│  Deployed at: 0x...0900                                                 │
│                                                                          │
│  Functions (selector-based dispatch):                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Selector    │ Function            │ Purpose                      │   │
│  ├─────────────┼─────────────────────┼──────────────────────────────┤   │
│  │ 0x8fa5f25c  │ optimizeAllocation  │ Calculate optimal weights     │   │
│  │ 0xf4993018  │ rebalanceBasket     │ Compute rebalancing weights ← │   │
│  │ 0x5e540e6d  │ getYields           │ Return yield data             │   │
│  │ 0x8d12f19a  │ getVolatility       │ Return volatility scores      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Built with: Rust + polkatool for riscv64emac target                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Network Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | Paseo Asset Hub |
| Chain ID | 420420417 |
| RPC URL | `https://eth-rpc-testnet.polkadot.io` |
| Symbol | PASE0 |
| Block Explorer | `https://blockscout-passet-hub.parity-testnet.parity.io` |

### Precompile Addresses

| Address | Purpose |
|---------|---------|
| `0x0000000000000000000000000000000000000800` | XCM Precompile |
| `0x0000000000000000000000000000000000000900` | PVM Engine |

---

## 2. PVM Engine Interface

### IPVMEngine.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPVMEngine {
    function optimizeAllocation(bytes calldata input) external view returns (bytes memory);
    function rebalanceBasket(bytes calldata input) external view returns (bytes memory);
}
```

### Function Selectors

| Selector | Function | Description |
|----------|----------|-------------|
| `0x8fa5f25c` | `optimizeAllocation` | Calculate optimal allocation weights |
| `0xf4993018` | `rebalanceBasket` | Compute rebalancing recommendations |
| `0x5e540e6d` | `getYields` | Return mock yield data per parachain |
| `0x8d12f19a` | `getVolatility` | Return volatility scores |

### Input/Output Formats

#### `rebalanceBasket(bytes)`

**Input (ABI encoded):**
```
abi.encode(weights: uint16[], totalDeposited: uint256, paraIds: uint32[])
```

**Output (ABI encoded):**
```
abi.encode(newWeights: uint16[])
```

---

## 3. Solidity ↔ Rust Communication

### The Complete Call Path

```
User/Frontend
    │
    ▼
BasketManager.rebalance(basketId)
    │
    ▼
1. Encode Input
    │
    ├── weights = [4000, 3000, 3000]  (uint16[])
    ├── totalDeposited = 1000000000000000000  (1 PASE0 in wei)
    └── paraIds = [2034, 2004, 2000]  (uint32[])
    │
    ▼
2. Prepare Call Data
    │
    ├── function selector: 0xf4993018
    └── calldata: selector + abi.encode(input)
    │
    ▼
3. Staticcall to PVM Engine
    │
    ├── PVM reads selector from calldata[0:4]
    ├── PVM dispatches to rebalanceBasket handler
    ├── PVM decodes input parameters
    ├── PVM runs optimization algorithm
    └── PVM returns encoded output
    │
    ▼
4. Decode Result
    │
    ├── success = true/false
    ├── engineOutput = bytes
    └── newWeights = abi.decode(engineOutput, uint16[])
    │
    ▼
5. Apply New Weights
    │
    └── Update allocations where drift > threshold (200 bps)
```

### Code Implementation

```solidity
function rebalance(uint256 basketId) external {
    Basket storage b = baskets[basketId];
    
    // Check if PVM engine is deployed
    if (pvmEngine.code.length > 0) {
        // Encode input for Rust engine
        bytes memory engineInput = _encodeRebalanceInput(b);
        
        // Staticcall - no state changes in engine, won't revert transaction
        (bool success, bytes memory engineOutput) = pvmEngine.staticcall(
            abi.encodeWithSelector(IPVMEngine.rebalanceBasket.selector, engineInput)
        );
        
        if (success) {
            // Decode the weights array returned by PVM
            uint16[] memory newWeights = abi.decode(engineOutput, (uint16[]));
            
            // Apply weights where drift exceeds threshold
            for (uint i = 0; i < b.allocations.length; i++) {
                if (_absDiff(b.allocations[i].weightBps, newWeights[i]) > rebalanceThresholdBps) {
                    b.allocations[i].weightBps = newWeights[i];
                }
            }
        }
        // If engine call fails, skip rebalancing (don't revert)
    }
    
    emit Rebalanced(basketId, block.timestamp);
}

function _encodeRebalanceInput(Basket storage b) internal view returns (bytes memory) {
    uint16[] memory weights = new uint16[](b.allocations.length);
    uint32[] memory paraIds = new uint32[](b.allocations.length);
    
    for (uint i = 0; i < b.allocations.length; i++) {
        weights[i] = b.allocations[i].weightBps;
        paraIds[i] = b.allocations[i].paraId;
    }
    
    return abi.encode(weights, b.totalDeposited, paraIds);
}

function _absDiff(uint16 a, uint16 b) internal pure returns (uint16) {
    return a > b ? a - b : b - a;
}
```

### Why Staticcall?

1. **Read-only operation**: PVM engine computes weights without modifying state
2. **Non-reverting**: If PVM call fails, the transaction continues
3. **Gas efficiency**: No state proofs needed for read-only calls

---

## 4. Data Encoding Details

### Solidity ABI Encoding

```solidity
// Input encoding example
uint16[] weights = [4000, 3000, 3000];        // 3 allocations
uint256 totalDeposited = 100 ether;          // 100 PASE0
uint32[] paraIds = [2034, 2004, 2000];        // Hydration, Moonbeam, Acala

bytes memory input = abi.encode(weights, totalDeposited, paraIds);

// Resulting hex (simplified):
// 0x
// 00000000000000000000000000000000000000000000000000000000000000a0  // offset to weights
// 00000000000000000000000000000000000000000000000000000000000000e0  // offset to paraIds
// 000000000000000000000000000000000000000000000000000000056bc75e2d63100000  // 100 ether
// 0000000000000000000000000000000000000000000000000000000000000003  // weights.length = 3
// 0000000000000000000000000000000000000000000000000000000000000fa0  // 4000
// 0000000000000000000000000000000000000000000000000000000000000bb8  // 3000
// 0000000000000000000000000000000000000000000000000000000000000bb8  // 3000
// 0000000000000000000000000000000000000000000000000000000000000003  // paraIds.length = 3
// 00000000000000000000000000000000000000000000000000000000000007f2  // 2034
// 00000000000000000000000000000000000000000000000000000000000007d4  // 2004
// 00000000000000000000000000000000000000000000000000000000000007d0  // 2000
```

### Rust Decoding (uapi)

```rust
use uapi::{HostFn, HostFnImpl as api, ReturnFlags};

fn read_u32(input: &[u8], slot: usize) -> u32 {
    let offset = slot * 32 + 28;
    u32::from_be_bytes([
        input[offset],
        input[offset + 1],
        input[offset + 2],
        input[offset + 3],
    ])
}

fn read_u16(input: &[u8], slot: usize) -> u16 {
    let offset = slot * 32 + 30;
    u16::from_be_bytes([input[offset], input[offset + 1]])
}

#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn call() {
    let mut selector = [0u8; 4];
    api::call_data_copy(&mut selector, 0);

    if selector == SELECTOR_REBALANCE {
        handle_rebalance();
    }
}

fn handle_rebalance() {
    let input_len = api::call_data_size();
    if input_len < 36 {
        api::return_value(ReturnFlags::REVERT, &[]);
    }

    let mut input = [0u8; 320];
    api::call_data_copy(&mut input, 4);

    // Read array offsets
    let weights_offset = read_u32(&input, 0) as usize;
    let _total_deposited = read_u128(&input, 1);  // Skip, not needed for optimization
    let para_ids_offset = read_u32(&input, 2) as usize;

    // Read array lengths
    let weights_len = read_u32(&input, weights_offset / 32) as usize;
    let count = weights_len.min(MAX_ALLOCATIONS);

    // Read weights array
    let mut weights = [0u16; MAX_ALLOCATIONS];
    for i in 0..count {
        weights[i] = read_u16(&input, weights_offset / 32 + 1 + i);
    }

    // Read paraIds array
    let mut para_ids = [0u32; MAX_ALLOCATIONS];
    for i in 0..count {
        para_ids[i] = read_u32(&input, para_ids_offset / 32 + 1 + i);
    }

    // Compute optimized weights
    let optimized = optimize_weights_internal(&weights, &para_ids, count);
    
    // Encode and return
    let output = encode_u16_array_fixed(&optimized, count);
    api::return_value(ReturnFlags::empty(), &output[..output_len]);
}
```

### Rust Optimization Algorithm

```rust
const MAX_VOLATILITY_PENALTY: u16 = 2000;
const MIN_WEIGHT: u16 = 500;

fn optimize_weights_internal(
    weights: &[u16; 8],
    para_ids: &[u32; 8],
    count: usize,
) -> [u16; 8] {
    let mut new_weights = [0u16; 8];
    
    // Get yields and volatilities for each parachain
    let mut total_score: u32 = 0;
    let mut yields = [0u16; 8];
    let mut risk_scores = [0u16; 8];
    
    for i in 0..count {
        let yield_bps = get_default_yield(para_ids[i]);
        let vol_bps = get_default_volatility(para_ids[i]);
        
        yields[i] = yield_bps;
        risk_scores[i] = calculate_risk_score(yield_bps, vol_bps);
        
        // Risk-adjusted yield contribution
        let adj_yield = (weights[i] as u32 * yield_bps as u32 
            * (MAX_VOLATILITY_PENALTY as u32 - risk_scores[i] as u32))
            / (MAX_VOLATILITY_PENALTY * 100);
        total_score += adj_yield;
    }
    
    // Allocate weights proportional to risk-adjusted yields
    for i in 0..count {
        let adj_yield = (weights[i] as u32 * yields[i] as u32 
            * (MAX_VOLATILITY_PENALTY as u32 - risk_scores[i] as u32))
            / (MAX_VOLATILITY_PENALTY as u32 * 100);
        let weight = ((adj_yield * 10000) / total_score) as u16;
        new_weights[i] = weight.max(MIN_WEIGHT);
    }
    
    // Normalize to 10000 bps
    normalize_weights(&mut new_weights, count);
    
    new_weights
}
```

---

## 5. Deployment Guide

### Prerequisites

1. **Rust Nightly** with `riscv64emac-unknown-none-polkavm` target
2. **polkatool** v0.26.0

### Step 1: Build PVM Contract

```bash
cd rust/pvm-contract

# Install polkatool
cargo install polkatool --version 0.26.0

# Setup Rust toolchain
rustup install nightly
rustup component add rust-src --toolchain nightly
rustup target add riscv64emac-unknown-none-polkavm --toolchain nightly

# Build
cargo build --release

# Package for PolkaVM
make all
```

### Step 2: Deploy PVM Engine

```bash
# Set environment
export PRIVATE_KEY=0x...
export ETH_RPC_URL=https://eth-rpc-testnet.polkadot.io

# Deploy
cd rust/pvm-contract/scripts
node deploy-ethers.js

# Output: "PVM Engine deployed to: 0x..."
```

### Step 3: Configure Environment

Update `.env`:

```bash
VITE_USE_MOCK_PVM=false
VITE_PVM_ENGINE_ADDRESS=0x...  # From step 2
```

### Step 4: Deploy BasketManager

```bash
cd contracts
PRIVATE_KEY=0x... npm run deploy:paseo
```

Update `.env`:

```bash
VITE_BASKET_MANAGER_ADDRESS=0x...  # From deployment output
```

### Step 5: Verify

```bash
cd contracts

# Check contract health
npm run health:paseo

# Expected output:
# basketManager: 0x... (deployed address)
# nextBasketId: 1
# basket[0].active: true
# pvmEngine: 0x... (PVM address or 0x...0900)
# xcmEnabled: true/false

# Simulate deposit
npm run simulate:deposit

# Should succeed without revert
```

---

## 6. Testing & Verification

### Local Testing

```bash
cd contracts
npm test
```

### Mock PVM Engine

For local testing without deploying real Rust contract:

```solidity
// contracts/contracts/mocks/MockPVMEngine.sol
contract MockPVMEngine {
    function rebalanceBasket(bytes calldata input) 
        external 
        pure 
        returns (bytes memory) 
    {
        // Return same weights (no-op for testing)
        (uint16[] memory weights,,) = abi.decode(input, (uint16[], uint256, uint32[]));
        return abi.encode(weights);
    }
}
```

### Manual Verification

```javascript
// In Hardhat console
const manager = await ethers.getContractAt("BasketManager", MANAGER_ADDRESS);

// Check PVM is configured
const pvmEngine = await manager.pvmEngine();
console.log("PVM Engine:", pvmEngine);

// Check PVM has code
const pvmCode = await ethers.provider.getCode(pvmEngine);
console.log("PVM code length:", pvmCode.length);

// Test rebalance
const tx = await manager.rebalance(0);
const receipt = await tx.wait();
console.log("Rebalanced event:", receipt.events?.find(e => e.event === "Rebalanced"));
```

---

## 7. Troubleshooting

### PVM Call Reverts

**Symptoms:** `rebalance()` reverts

**Diagnosis:**
```bash
# Check if PVM has code
curl -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x...", "latest"],"id":1}'
```

**Solutions:**
1. Verify PVM was deployed correctly
2. Check `pvmEngine` address in BasketManager
3. Ensure PVM uses correct selector encoding

### Engine Returns Wrong Weights

**Diagnosis:**
- Add debug logging to understand input/output encoding

**Solutions:**
1. Verify Solidity's `_encodeRebalanceInput` produces correct ABI
2. Check Rust reads offsets correctly
3. Add test case with known inputs

### Staticcall Fails Silently

**Symptoms:** PVM call returns `success = false`

**Solutions:**
- Check PVM function selector matches
- Verify input encoding is correct
- Try calling PVM directly to debug

---

## Appendix: Configuration Addresses

| Environment | PVM Engine | BasketManager |
|-------------|------------|---------------|
| Local (Hardhat) | Mock or 0x...0900 | 0x... (deployed) |
| Paseo Testnet | Deployed address | 0x... (deployed) |

## References

- [PolkaVM Documentation](https://docs.polkadot.com/develop/smart-contracts/)
- [Polkatool](https://github.com/FlorianBouron/polkatool)
- [uapi crate](https://docs.rs/uapi/latest/uapi/)
- [EVM Precompile Spec](https://forum.polkadot.network/t/evm-pvm-precompile-spec/3584)
