# PolkaBasket

**Cross-chain DeFi basket primitive for Polkadot Hub (PolkaVM)**

PolkaBasket allows users to deposit DOT/PASE0 once and receive a basket token representing capital deployed across multiple parachain protocols (Hydration, Moonbeam, Acala). The basket automatically manages allocations via a Rust PVM engine compiled to RISC-V bytecode.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Components](#2-system-components)
3. [Frontend Flow](#3-frontend-flow)
4. [Smart Contracts](#4-smart-contracts)
5. [Rust PVM Engine](#5-rust-pvm-engine)
6. [XCM Integration](#6-xcm-integration)
7. [Network Configuration](#7-network-configuration)
8. [Quick Start](#8-quick-start)
9. [Deployment Guide](#9-deployment-guide)
10. [Testing](#10-testing)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Layer                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐  │
│  │  MetaMask   │    │  SubWallet  │    │   Polkadot.js / Talisman    │  │
│  └──────┬──────┘    └──────┬──────┘    └──────────────┬──────────────┘  │
└─────────┼──────────────────┼──────────────────────────┼──────────────────┘
          │                  │                          │
          │    EVM Wallet    │         Substrate         │
          └──────────────────┴──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Viem)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌────────────┐ │
│  │DepositForm  │  │WithdrawForm  │  │RebalancePanel │  │ XCMStatus  │ │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  └─────┬──────┘ │
│         │                │                  │                │         │
│         ▼                ▼                  ▼                ▼         │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                    useBasketManager Hook                      │       │
│  │  - deposit()  - withdraw()  - rebalance()  - getBasketNAV() │       │
│  └────────────────────────────┬─────────────────────────────────┘       │
│                               │                                           │
│  ┌────────────────────────────┴─────────────────────────────────┐       │
│  │                     WalletContext                             │       │
│  │  - useEVMWallet()  - useSubWallet()  - walletClient          │       │
│  └───────────────────────────────────────────────────────────────┘       │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ contract calls (viem)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Polkadot Hub / Paseo Testnet                         │
│                              (chainId: 420420417)                       │
│                                                                          │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────┐ │
│  │  BasketManager    │◄────────│   XCM Precompile │         │   PVM    │ │
│  │     .sol          │         │   (0x...0800)    │         │  Engine  │ │
│  │                  │         │                  │         │  (0x...09│ │
│  │  - createBasket() │         │  - sendXCM()     │         │   00)    │ │
│  │  - deposit()     │         │  - teleport()    │         │          │ │
│  │  - withdraw()    │         │                  │         │ Rust/    │ │
│  │  - rebalance()   │─────────►│                  │         │ RISC-V   │ │
│  └────────┬─────────┘         └──────────────────┘         └────┬─────┘ │
│           │                                                    │        │
│           │           ┌──────────────────┐                    │        │
│           │           │  BasketToken.sol │                    │        │
│           │           │  (ERC-20 per      │                    │        │
│           │           │   basket)         │                    │        │
│           │           └──────────────────┘                    │        │
└───────────┼───────────────────────────────────────────────────┼────────┘
            │                                                   │
            │ XCM Messages                                      │ staticcall
            ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Parachain Network                                 │
│  ┌────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│  │  Hydration │    │  Moonbeam   │    │   Acala     │                   │
│  │  (2034)    │    │   (2004)    │    │   (2000)    │                   │
│  │            │◄───│             │◄───│             │                   │
│  │  LP Deposit│    │  Lending    │    │  Staking    │                   │
│  └────────────┘    └─────────────┘    └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Components

### Frontend (`src/`)

| Component | Purpose |
|-----------|---------|
| `pages/BasketPage.tsx` | Main basket detail page with deposit/withdraw tabs |
| `components/DepositForm.tsx` | DOT deposit form with wallet integration |
| `components/WithdrawForm.tsx` | Token burn + DOT withdrawal form |
| `components/RebalancePanel.tsx` | PVM engine rebalance trigger UI |
| `components/AllocationChart.tsx` | Visual pie chart of basket allocations |
| `components/XCMStatus.tsx` | Cross-chain message status tracker |
| `hooks/useBasketManager.ts` | Contract interaction (deposit/withdraw/rebalance) |
| `hooks/useEVMWallet.ts` | MetaMask/SubWallet EVM connection |
| `hooks/usePVMEngine.ts` | Direct PVM engine read calls |
| `contexts/WalletContext.tsx` | Unified wallet state management |

### Smart Contracts (`contracts/`)

| Contract | Purpose |
|----------|---------|
| `BasketManager.sol` | Core basket logic, XCM dispatch, PVM calls |
| `BasketToken.sol` | ERC-20 token per basket (mint/burn by manager) |
| `MockXCMPrecompile.sol` | Mock XCM for local testing |
| `MockPVMEngine.sol` | Mock Rust engine for local testing |

### Rust PVM Engine (`rust/pvm-contract/`)

| Module | Purpose |
|--------|---------|
| `main.rs` | Selector-based entry points for PolkaVM |
| `optimizeAllocation()` | Calculate optimal weights from yields |
| `rebalanceBasket()` | Detect drift and compute corrective weights |
| `getYields()` | Return mock yield data per parachain |
| `getVolatility()` | Return volatility scores per parachain |

---

## 3. Frontend Flow

### Wallet Connection

```
1. User clicks "Connect Wallet"
   │
   ▼
2. useEVMWallet.connect() requests accounts from injected provider
   │
   ▼
3. createWalletClient() creates viem client with:
   - account: user's EVM address
   - chain: polkadotHubTestnet (chainId 420420417)
   - transport: custom(provider)
   │
   ▼
4. WalletContext stores walletClient for all contract calls
```

### Deposit Flow

```
1. User enters DOT amount in DepositForm
   │
   ▼
2. useBasketManager.deposit(walletClient, basketId, amount)
   │
   ├──► viem publicClient.readContract() → simulate tx
   │
   ▼
3. walletClient.writeContract() sends deposit tx
   │
   ├──► BasketManager.deposit(basketId) { value: amount }
   │
   ▼
4. Inside contract:
   ├── Mint basket tokens 1:1 with DOT amount
   ├── Update totalDeposited
   ├── Attempt XCM deployment dispatch
   └── Emit Deposited event
   │
   ▼
5. publicClient.waitForTransactionReceipt() waits for confirmation
   │
   ▼
6. UI updates with success state + explorer link
```

### Rebalance Flow

```
1. Owner/automation triggers rebalance via RebalancePanel
   │
   ▼
2. useBasketManager.rebalance(walletClient, basketId)
   │
   ▼
3. Contract.rebalance(basketId):
   ├── Encode rebalance input: (weights[], totalDeposited, paraIds[])
   ├── staticcall PVM engine at 0x...0900
   ├── Decode returned optimal weights
   └── Update allocations where drift > threshold
   │
   ▼
4. Emit Rebalanced event
```

---

## 4. Smart Contracts

### BasketManager.sol

The main protocol contract managing baskets and cross-chain deployment.

#### Key State Variables

```solidity
struct AllocationConfig {
    uint32 paraId;        // Parachain ID (2034=Hydration, 2004=Moonbeam, 2000=Acala)
    address protocol;     // Target protocol address on parachain
    uint16 weightBps;    // Allocation weight in basis points (10000 = 100%)
    bytes depositCall;    // Encoded XCM call for deposit
    bytes withdrawCall;   // Encoded XCM call for withdrawal
}

struct Basket {
    uint256 id;
    string name;
    address token;              // ERC-20 basket token
    AllocationConfig[] allocations;
    uint256 totalDeposited;     // Total DOT deposited
    bool active;
}
```

#### Key Addresses (Mainnet/Paseo)

| Address | Purpose |
|---------|---------|
| `0x0000000000000000000000000000000000000800` | XCM Precompile |
| `0x0000000000000000000000000000000000000900` | PVM Engine Precompile |

#### Core Functions

**`createBasket(name, symbol, allocations)`** - Owner only
- Validates all allocations sum to 10000 bps
- Deploys new ERC-20 basket token
- Stores basket configuration

**`deposit(basketId) payable`** - Anyone
- Requires `msg.value > 0`
- Mints basket tokens 1:1 with deposited DOT
- Calls `_executeDeployment()` for XCM dispatch
- Emits `Deposited` event

**`withdraw(basketId, tokenAmount)`** - Token holders
- Burns basket tokens
- Computes proportional DOT amount
- Attempts XCM withdraw dispatch per allocation
- Transfers native DOT back to caller
- Emits `Withdrawn` event

**`rebalance(basketId)`** - Anyone
- Calls PVM engine via staticcall
- Applies new weights if drift exceeds threshold (200 bps)
- Emits `Rebalanced` event

#### XCM Dispatch (Non-Reverting)

```solidity
function _executeDeployment(uint256 basketId, uint256 totalAmount) internal {
    Basket storage b = baskets[basketId];
    for (uint i = 0; i < b.allocations.length; i++) {
        AllocationConfig memory alloc = b.allocations[i];
        uint256 allocAmount = (totalAmount * alloc.weightBps) / 10000;
        
        bool ok = _dispatchXCMDeposit(alloc, allocAmount);
        if (ok) {
            emit DeploymentDispatched(basketId, alloc.paraId, allocAmount);
        } else {
            // Non-reverting: emit failure instead of reverting
            emit DeploymentFailed(basketId, alloc.paraId, allocAmount, "XCM unavailable");
        }
    }
}
```

#### PVM Engine Integration

```solidity
function rebalance(uint256 basketId) external {
    Basket storage b = baskets[basketId];
    
    if (pvmEngine.code.length > 0) {
        // Encode input for Rust engine
        bytes memory engineInput = _encodeRebalanceInput(b);
        
        // Staticcall to PVM engine (no state changes in engine)
        (bool success, bytes memory engineOutput) = pvmEngine.staticcall(
            abi.encodeWithSelector(IPVMEngine.rebalanceBasket.selector, engineInput)
        );
        
        if (success) {
            uint16[] memory newWeights = abi.decode(engineOutput, (uint16[]));
            
            // Apply weights where drift exceeds threshold
            for (uint i = 0; i < b.allocations.length; i++) {
                if (_absDiff(b.allocations[i].weightBps, newWeights[i]) > rebalanceThresholdBps) {
                    b.allocations[i].weightBps = newWeights[i];
                }
            }
        }
    }
    
    emit Rebalanced(basketId, block.timestamp);
}
```

### BasketToken.sol

ERC-20 token created per basket, controlled by BasketManager.

```solidity
contract BasketToken is ERC20 {
    address public manager;
    
    modifier onlyManager() {
        require(msg.sender == manager, "Not manager");
        _;
    }
    
    constructor(string memory name, string memory symbol, address _manager) {
        _mint(msg.sender, 0);  // Initialize supply
        manager = _manager;
    }
    
    function mint(address to, uint256 amount) external onlyManager {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyManager {
        _burn(from, amount);
    }
}
```

---

## 5. Rust PVM Engine

### Why Rust + PolkaVM?

PolkaVM runs RISC-V bytecode natively on Polkadot Hub:

- **Type Safety**: No integer overflow bugs in financial calculations
- **Performance**: Native execution vs interpreted EVM
- **Expressiveness**: Complex financial math easier in Rust

### Architecture (`rust/pvm-contract/src/main.rs`)

The contract uses selector-based dispatch matching Solidity's approach:

```rust
const SELECTOR_REBALANCE: [u8; 4] = [0xf4, 0x99, 0x30, 0x18];
const SELECTOR_OPTIMIZE: [u8; 4] = [0x8f, 0xa5, 0xf2, 0x5c];
const SELECTOR_YIELDS: [u8; 4] = [0x5e, 0x54, 0x0e, 0x6d];
const SELECTOR_VOLATILITY: [u8; 4] = [0x8d, 0x12, 0xf1, 0x9a];

#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn call() {
    let mut selector = [0u8; 4];
    api::call_data_copy(&mut selector, 0);

    if selector == SELECTOR_REBALANCE {
        handle_rebalance();
    } else if selector == SELECTOR_OPTIMIZE {
        handle_optimize();
    } // ... other selectors
}
```

### Hardcoded Yield Data (MVP)

```rust
const YIELD_HYDRATION: u16 = 1200;   // 12% APY
const YIELD_MOONBEAM: u16 = 800;     // 8% APY
const YIELD_ACALA: u16 = 1000;       // 10% APY

const VOL_HYDRATION: u16 = 500;      // 5% volatility
const VOL_MOONBEAM: u16 = 800;       // 8% volatility
const VOL_ACALA: u16 = 1000;         // 10% volatility
```

### Weight Optimization Algorithm

```rust
fn optimize_weights_internal(weights: &[u16], para_ids: &[u32], count: usize) -> [u16; 8] {
    let mut total_score: u32 = 0;
    let mut yields = [0u16; 8];
    let mut risk_scores = [0u16; 8];
    
    // Calculate risk-adjusted yield for each protocol
    for i in 0..count {
        let yield_bps = get_default_yield(para_ids[i]);
        let vol_bps = get_default_volatility(para_ids[i]);
        risk_scores[i] = calculate_risk_score(yield_bps, vol_bps);
        
        // Adjusted yield = weight * yield * (1 - risk_penalty)
        let adj_yield = (weights[i] as u32 * yield_bps as u32 
            * (MAX_VOL_PENALTY - risk_scores[i] as u32))
            / (MAX_VOL_PENALTY * 100);
        total_score += adj_yield;
    }
    
    // Normalize to 10000 bps total
    // ...
}
```

### Rebalance with Threshold

```rust
const REBALANCE_THRESHOLD: u16 = 200;  // 2% drift triggers rebalance

fn apply_threshold_internal(current: &[u16], target: &[u16], threshold: u16) -> [u16; 8] {
    let mut result = [0u16; 8];
    
    for i in 0..count {
        let diff = abs_diff(current[i], target[i]);
        
        // Only apply new weight if drift exceeds threshold
        result[i] = if diff > threshold { target[i] } else { current[i] };
    }
    
    result
}
```

### Building for PolkaVM

```bash
cd rust/pvm-contract

# Install polkatool
cargo install polkatool --version 0.26.0

# Build for PolkaVM RISC-V target
make all

# Deploy
export PRIVATE_KEY=0x...
export ETH_RPC_URL=https://eth-rpc-testnet.polkadot.io
make deploy
```

---

## 6. XCM Integration

### How XCM Dispatch Works

```
BasketManager.deposit()
      │
      ▼
_allocations loop
      │
      ├──► Calculate allocAmount = totalAmount * weightBps / 10000
      │
      ├──► Encode XCM message:
      │      (paraId, amount, depositCall)
      │
      └──► Call XCM precompile:
             IXCMPrecompile(xcmPrecompile).sendXCM(paraId, xcmMessage)
```

### XCM Precompile Interface

```solidity
interface IXCMPrecompile {
    function sendXCM(
        uint32 destParaId,
        bytes calldata xcmMessage
    ) external returns (bool success);
    
    function teleportAsset(
        uint32 destParaId,
        uint256 amount,
        address beneficiary
    ) external returns (bool success);
}
```

### Mock XCM Precompile

For local testing, `MockXCMPrecompile.sol` simulates XCM:

```solidity
contract MockXCMPrecompile {
    event XCMSent(uint32 indexed paraId, uint256 amount, bytes message);
    
    function sendXCM(uint32 destParaId, bytes calldata xcmMessage) 
        external 
        returns (bool) 
    {
        emit XCMSent(destParaId, 0, xcmMessage);
        return true;
    }
}
```

### Enabling/Disabling XCM

```solidity
// Owner can toggle XCM
basketManager.setXCMEnabled(false);  // Disable for testing

// XCM failures are non-reverting
// Deposit succeeds even if XCM dispatch fails
```

---

## 7. Network Configuration

### Testnet: Paseo Asset Hub

| Parameter | Value |
|-----------|-------|
| Chain ID | 420420417 |
| RPC URL | `https://eth-rpc-testnet.polkadot.io` |
| Symbol | PASE0 |
| Explorer | `https://blockscout-passet-hub.parity-testnet.parity.io` |

### Testnet: Westend Asset Hub

| Parameter | Value |
|-----------|-------|
| Chain ID | 420420417 |
| RPC URL | `https://westend-asset-hub-eth-rpc.polkadot.io` |
| Symbol | WND |
| Explorer | `https://assethub-westend.subscan.io` |

### Parachain IDs

| Parachain | ID | Purpose |
|-----------|-----|---------|
| Hydration | 2034 | LP provision |
| Moonbeam | 2004 | Lending |
| Acala | 2000 | Staking |

---

## 8. Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Rust (for PVM engine)
- MetaMask or SubWallet

### 1. Clone & Install

```bash
git clone <repo-url>
cd tele-basket
npm install
```

### 2. Environment Setup

```bash
# Copy example env
cp .env.example .env

# Edit .env with your values:
# PRIVATE_KEY=0x... (for deployment)
# VITE_BASKET_MANAGER_ADDRESS=... (after deployment)
# VITE_PVM_ENGINE_ADDRESS=... (after deployment)
```

### 3. Start Frontend

```bash
npm run dev
```

### 4. Deploy Contracts

```bash
cd contracts
npm install
npm run compile
npm run deploy:local    # Local Hardhat
# OR
npm run deploy:paseo    # Paseo testnet
```

---

## 9. Deployment Guide

### Local Hardhat

```bash
cd contracts
npm run deploy:local
```

### Paseo Testnet

```bash
# 1. Deploy PVM Engine
cd rust/pvm-contract
export PRIVATE_KEY=0x...
export ETH_RPC_URL=https://eth-rpc-testnet.polkadot.io
make deploy
# Note deployed address

# 2. Update .env
VITE_PVM_ENGINE_ADDRESS=<deployed-address>
VITE_USE_MOCK_PVM=false

# 3. Deploy BasketManager
cd ../../contracts
PRIVATE_KEY=0x... npm run deploy:paseo
# Note BasketManager address

# 4. Update .env
VITE_BASKET_MANAGER_ADDRESS=<deployed-address>

# 5. Verify
npm run health:paseo
npm run simulate:deposit
```

---

## 10. Testing

### Contract Tests

```bash
cd contracts
npm test
```

### Rust Engine Tests

```bash
cd rust/pvm-engine
cargo test
```

### Frontend (Manual)

1. Connect wallet
2. Select basket
3. Deposit DOT
4. Verify token balance
5. View XCM status

---

## Project Structure

```
tele-basket/
├── src/                           # React frontend
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── BasketsPage.tsx
│   │   ├── BasketPage.tsx         # Main basket detail
│   │   └── PortfolioPage.tsx
│   ├── components/
│   │   ├── DepositForm.tsx        # DOT deposit
│   │   ├── WithdrawForm.tsx       # Token withdrawal
│   │   ├── RebalancePanel.tsx     # PVM rebalance UI
│   │   ├── AllocationChart.tsx    # Pie chart
│   │   ├── XCMStatus.tsx         # Cross-chain status
│   │   ├── BasketCard.tsx
│   │   └── Navbar.tsx
│   ├── hooks/
│   │   ├── useBasketManager.ts    # Contract interactions
│   │   ├── useBasketToken.ts      # Token balance
│   │   ├── usePVMEngine.ts        # Direct PVM reads
│   │   ├── useXCMStatus.ts        # XCM tracking
│   │   ├── useEVMWallet.ts       # Wallet connection
│   │   └── useSubWallet.ts       # Substrate wallet
│   ├── contexts/
│   │   └── WalletContext.tsx      # Unified wallet state
│   └── config/
│       └── contracts.ts           # ABIs & addresses
│
├── contracts/                     # Solidity contracts
│   ├── contracts/
│   │   ├── BasketManager.sol     # Core protocol
│   │   ├── BasketToken.sol        # ERC-20 per basket
│   │   ├── interfaces/
│   │   │   ├── IBasketManager.sol
│   │   │   ├── IXCMPrecompile.sol
│   │   │   └── IPVMEngine.sol
│   │   └── mocks/
│   │       ├── MockXCMPrecompile.sol
│   │       ├── MockPVMEngine.sol
│   │       └── MockDOT.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── test-deploy.ts
│   ├── tasks/
│   │   └── deploy.ts              # Hardhat task
│   └── test/
│       └── BasketManager.test.ts
│
├── rust/
│   ├── pvm-contract/              # ACTIVE PolkaVM contract
│   │   ├── src/main.rs            # Entry points
│   │   ├── Cargo.toml
│   │   ├── contract.polkavm       # Compiled bytecode
│   │   └── scripts/deploy.js
│   └── pvm-engine/                 # Rust library
│       ├── src/lib.rs
│       ├── src/allocation.rs      # Weight optimization
│       ├── src/rebalance.rs       # Drift detection
│       └── src/risk.rs            # Risk scoring
│
├── docs/
│   ├── CONTRACTS.md               # Detailed contract docs
│   ├── PVM_ENGINE.md              # Rust engine docs
│   └── STATUS.md                  # Project status
│
├── README.md                      # This file
└── package.json
```

---

## Scripts Reference

### Contracts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run contract tests |
| `npm run deploy` | Deploy to local Hardhat |
| `npm run deploy:paseo` | Deploy to Paseo |
| `npm run deploy:westend` | Deploy to Westend |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |

---

## Resources

- [PolkaVM Documentation](https://docs.polkadot.com/develop/smart-contracts/)
- [XCM Documentation](https://docs.polkadot.com/develop/interoperability/xcm/)
- [Viem](https://viem.sh/)
- [Reactive DOT](https://reactivedot.dev/)
- [Polkatool](https://openguild.wtf/blog/polkadot/polkadot-introduction-to-polkatool)

---

## License

MIT
