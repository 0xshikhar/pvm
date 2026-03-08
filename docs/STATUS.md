# TeleBasket Project Status

## Project Overview

**TeleBasket** is a cross-chain DeFi basket primitive for Polkadot Hub (PolkaVM). Users deposit DOT once and receive a basket token representing capital deployed across multiple parachain protocols (Hydration, Moonbeam, Acala).

---

## Implementation Status

### ✅ Completed

#### Smart Contracts (`contracts/`)

| Contract | Status | Description |
|----------|--------|-------------|
| `BasketToken.sol` | ✅ Complete | ERC-20 token with mint/burn by manager |
| `BasketManager.sol` | ✅ Complete | Core logic: createBasket, deposit, withdraw, rebalance |
| `IXCMPrecompile.sol` | ✅ Complete | XCM precompile interface |
| `IPVMEngine.sol` | ✅ Complete | PVM engine interface |
| `IBasketManager.sol` | ✅ Complete | Full interface definition |
| `MockDOT.sol` | ✅ Complete | Mock DOT for testing |
| `MockHydrationLP.sol` | ✅ Complete | Mock LP (1 DOT = 1000 LP) |
| `MockMoonbeamLending.sol` | ✅ Complete | Mock lending (5% APY) |

#### PVM Engine (`pvm-engine/`)

| Module | Status | Description |
|--------|--------|-------------|
| `allocation.rs` | ✅ Complete | Optimal allocation weights calculation |
| `rebalance.rs` | ✅ Complete | Drift detection and rebalancing |
| `risk.rs` | ✅ Complete | Risk-adjusted yield scoring |
| `lib.rs` | ✅ Complete | Entry points for PolkaVM |
| Tests | ✅ Complete | Unit tests for all modules |

#### Frontend (`src/`)

| Component | Status | Description |
|-----------|--------|-------------|
| `BasketPage.tsx` | ✅ Complete | Main basket page |
| `DepositForm.tsx` | ✅ Complete | Deposit DOT, mint tokens |
| `AllocationChart.tsx` | ✅ Complete | Pie chart of allocations |
| `XCMStatus.tsx` | ✅ Complete | XCM message status |
| `BasketCard.tsx` | ✅ Complete | Basket summary card |
| `useBasketManager.ts` | ✅ Complete | Contract interaction hook |
| `contracts.ts` | ✅ Complete | Config, ABIs, addresses |

#### Configuration

| File | Status | Description |
|------|--------|-------------|
| `hardhat.config.ts` | ✅ Complete | Hardhat config for PolkaVM |
| `package.json` | ✅ Complete | Dependencies |
| `vite.config.ts` | ✅ Complete | Vite build config |
| `tsconfig.json` | ✅ Complete | TypeScript config |

#### Scripts (`contracts/scripts/`)

| Script | Status | Description |
|--------|--------|-------------|
| `deploy.ts` | ✅ Complete | Deploy BasketManager |
| `fund-wallet.ts` | ✅ Complete | Fund test wallets |

---

### ⏳ Pending / Not Implemented

#### Smart Contracts

| Item | Priority | Description |
|------|----------|-------------|
| Unit Tests | 🔴 High | `BasketManager.test.ts` exists but needs setup |
| Integration Tests | 🔴 High | Cross-chain XCM tests |
| Mock XCM Precompile | 🟡 Medium | Mock for local testing |
| Mock PVM Engine | 🟡 Medium | Mock for local testing |

#### PVM Engine

| Item | Priority | Description |
|------|----------|-------------|
| PolkaVM Build | 🔴 High | Compile to RISC-V bytecode |
| Deployment to Testnet | 🔴 High | Deploy as precompile |
| Cargo Workspace | 🟡 Medium | Add workspace config |

#### Frontend

| Item | Priority | Description |
|------|----------|-------------|
| Wallet Connection | 🔴 High | Connect EVM wallet |
| Withdraw Form | 🔴 High | Burn tokens, withdraw |
| Rebalance Panel | 🟡 Medium | Trigger rebalance |
| Live XCM Status | 🟡 Medium | Poll XCM message status |
| Real-time Data | 🟡 Medium | WebSocket for updates |
| Navigation | 🟡 Medium | Multiple basket pages |

#### XCM Integration

| Item | Priority | Description |
|------|----------|-------------|
| XCM Message Builders | ✅ Complete | Basic structure |
| Sovereign Account Utils | 🔴 High | Derivation functions |
| Chopsticks Setup | 🔴 High | Local fork testing |
| Integration Tests | 🔴 High | End-to-end XCM flow |

#### Documentation

| Item | Priority | Description |
|------|----------|-------------|
| README.md | 🔴 High | Project setup instructions |
| Demo Video | 🔴 High | 5-min demo |
| API Documentation | 🟡 Medium | Contract API docs |

---

## Quick Start

### Frontend Development

```bash
cd tele-basket
npm install
npm run dev
```

### Contract Development

```bash
cd tele-basket/contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts
```

### PVM Engine Development

```bash
cd tele-basket/pvm-engine
cargo test
# Build for PolkaVM (requires nightly):
cargo build --release --target riscv32em-unknown-none-elf -Z build-std=core,alloc
```

---

## Architecture

```
User
  │  deposit(DOT)
  ▼
┌──────────────────────────────┐
│   BasketManager.sol          │  ← Polkadot Hub (PolkaVM)
│   - createBasket()           │
│   - deposit()                │
│   - withdraw()               │
│   - rebalance()              │
└────────────┬─────────────────┘
             │ staticcall
             ▼
┌──────────────────────────────┐
│   PVM Precompile (Rust)     │
│   - optimize_allocation()    │
│   - rebalance_basket()      │
│   - risk_adjusted_yield()   │
└────────────┬─────────────────┘
             │ returns weights
             ▼
┌──────────────────────────────┐
│   XCM Executor              │
│   - teleport DOT            │
│   - execute remote calls    │
└──────┬──────────┬────────────┘
        │          │
        ▼          ▼
   Hydration    Moonbeam
   LP deposit   Lending deposit
```

---

## Testnet Configuration

| Chain | Parachain ID | RPC |
|-------|--------------|-----|
| Polkadot Hub | 1000 | `https://westend-asset-hub-eth-rpc.polkadot.io` |
| Hydration | 2034 | TBD |
| Moonbeam | 2004 | TBD |
| Acala | 2000 | TBD |

---

## Next Steps (Priority Order)

### Immediate (This Week)

1. **Run contract tests**
   ```bash
   cd tele-basket/contracts
   npm install
   npx hardhat test
   ```

2. **Set up wallet connection in frontend**
   - Add EVM wallet connection
   - Connect to testnet

3. **Add withdraw functionality**
   - Implement withdraw form
   - Test withdraw flow

### Short-term (2-3 weeks)

4. **XCM Integration**
   - Set up Chopsticks local fork
   - Test actual XCM messages

5. **Deploy to testnet**
   - Deploy contracts to Westend Asset Hub
   - Create basket on testnet

6. **Demo preparation**
   - Record demo video
   - Write README

### Long-term

7. **Production**
   - Deploy to Polkadot mainnet
   - Add real protocol integrations
   - Implement oracle for yields

---

## Known Issues / Risks

| Issue | Severity | Mitigation |
|-------|----------|-------------|
| PVM precompile interface not finalized | Medium | Use fallback to off-chain engine |
| XCM sovereign account derivation | High | Test with Chopsticks first |
| Testnet RPC availability | Medium | Use local fork |
| Frontend wallet connection | Medium | Use dot-connect |

---

## File Structure

```
tele-basket/
├── docs/                          # Documentation
│   ├── CONTRACTS.md
│   ├── PVM_ENGINE.md
│   ├── XCM_AND_FRONTEND.md
│   └── POLKABASKET_IMPLEMENTATION_PLAN.md
├── contracts/                     # Solidity contracts
│   ├── BasketManager.sol
│   ├── BasketToken.sol
│   ├── interfaces/
│   │   ├── IBasketManager.sol
│   │   ├── IXCMPrecompile.sol
│   │   └── IPVMEngine.sol
│   ├── mocks/
│   │   ├── MockDOT.sol
│   │   ├── MockHydrationLP.sol
│   │   └── MockMoonbeamLending.sol
│   ├── test/
│   │   └── BasketManager.test.ts
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── fund-wallet.ts
│   ├── hardhat.config.ts
│   └── package.json
├── pvm-engine/                    # Rust allocation engine
│   ├── Cargo.toml
│   ├── build.rs
│   └── src/
│       ├── lib.rs
│       ├── allocation.rs
│       ├── rebalance.rs
│       └── risk.rs
├── xcm/                           # XCM utilities
│   └── messages/
│       └── index.ts
├── src/                           # Frontend (React)
│   ├── App.tsx
│   ├── BasketPage.tsx
│   ├── components/
│   │   ├── DepositForm.tsx
│   │   ├── AllocationChart.tsx
│   │   ├── XCMStatus.tsx
│   │   └── BasketCard.tsx
│   ├── hooks/
│   │   └── useBasketManager.ts
│   └── config/
│       └── contracts.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Contact / Resources

- Hackathon Discord: https://discord.gg/BZWkdy5w5b
- PolkaVM Docs: https://docs.polkadot.com/develop/smart-contracts/
- XCM Docs: https://docs.polkadot.com/develop/interoperability/xcm/
- polkatool: https://openguild.wtf/blog/polkadot/polkadot-introduction-to-polkatool

---

*Last updated: March 8, 2026*
