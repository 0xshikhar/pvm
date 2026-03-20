# TeleBasket Contracts + Rust PVM Integration (Paseo)

Last updated: 2026-03-20

This document explains exactly how TeleBasket integrates:
- Solidity contracts (`contracts/contracts/*.sol`)
- Rust PVM contract (`rust/pvm-contract`)
- Frontend runtime (`src/hooks/*`)

and how to make the full flow work on **Paseo (chain ID 420420417)**.

---

## 1) Components and responsibilities

## Solidity layer (`contracts/`)

### `BasketManager.sol`
Main protocol contract (`contracts/contracts/BasketManager.sol`):
- basket creation (`createBasket`)
- deposits (`deposit`) and basket token mint
- withdrawals (`withdraw`) and basket token burn
- XCM dispatch attempts (deposit/withdraw)
- PVM-driven rebalance (`rebalance`)

### `BasketToken.sol`
ERC-20 token per basket:
- deployed by manager during `createBasket`
- manager mints on deposit and burns on withdraw

### Key manager state and controls

From `contracts/contracts/BasketManager.sol`:
- `xcmPrecompile` default: `0x000...0800`
- `pvmEngine` default: `0x000...0900`
- `xcmEnabled` toggle
- owner-only setters:
  - `setXCMEnabled(bool)`
  - `setXCMPrecompile(address)`
  - `setPVMEngine(address)`

---

## Rust PVM layer (`rust/pvm-contract/`)

Rust contract entrypoint is in `rust/pvm-contract/src/main.rs`.

It exports selector-based methods:
- `0x8fa5f25c` → optimize allocation
- `0xf4993018` → rebalance basket
- `0x5e540e6d` → yields
- `0x8d12f19a` → volatility

The runtime dispatches inside `call()` by reading the first 4 bytes selector.

Build output:
- `contract.polkavm` (linked bytecode deployed to Paseo).

---

## Frontend layer (`src/`)

### `src/config/contracts.ts`
- Paseo chain config (`420420417`)
- legacy gas strategy for Paseo (`VITE_GAS_PRICE_GWEI`)
- BasketManager ABI includes:
  - `deposit`, `withdraw`, `rebalance`
  - `xcmEnabled`, `xcmPrecompile`, `pvmEngine`
  - `setXCMEnabled`, `setPVMEngine`

### `src/hooks/useBasketManager.ts`
- validates contract deployment and basket readiness
- simulates writes before sending tx
- writes **legacy-style** tx on Paseo (`type: "legacy"`, fixed gasPrice)
- exposes:
  - `deposit(walletClient, basketId, amount)`
  - `withdraw(walletClient, basketId, tokenAmount)`
  - `rebalance(walletClient, basketId)`

### `src/hooks/usePVMEngine.ts`
- optional direct frontend calls to deployed PVM address
- uses selectors and manual ABI packing for optimize/rebalance
- falls back to mock logic when `VITE_USE_MOCK_PVM=true` or no address.

---

## 2) Solidity ↔ Rust integration details

## On-chain integration path (authoritative runtime)

`BasketManager.rebalance()`:
1. Builds payload via `_encodeRebalanceInput(b)`:
   - `weights[]`
   - `totalDeposited`
   - `paraIds[]`
2. Calls PVM engine using:
   - `abi.encodeWithSelector(IPVMEngine.rebalanceBasket.selector, engineInput)`
3. If call succeeds, decodes `uint16[]` weights and updates basket allocations when drift > threshold.

This integration is implemented in `contracts/contracts/BasketManager.sol` (rebalance path and `_encodeRebalanceInput`).

## Frontend direct PVM calls (optional)

`usePVMEngine.ts` can also call the same Rust contract directly for view-like computations.
This is mainly useful for UI/preview logic; protocol-authoritative rebalance happens in manager contract.

---

## 3) Deposit / withdraw / XCM behavior on Paseo

## Deposit
- `deposit()` always mints basket tokens when basket is active and `msg.value > 0`.
- XCM dispatch is attempted allocation-by-allocation.
- If XCM precompile is absent or call fails, contract emits `DeploymentFailed` and does not revert deposit.

## Withdraw
- burns basket tokens
- computes proportional `amountOut`
- attempts XCM withdraw dispatch per allocation
- transfers native PAS back to caller in the same transaction

## Why old deployments fail

Some older manager deployments on Paseo were missing the newer ABI/runtime behavior and can still revert on `deposit` simulation.

Use the health script to detect this:
- `xcmEnabled/xcmPrecompile/pvmEngine: unavailable (older deployment ABI)`

---

## 4) End-to-end deployment flow for Paseo

Run from repo root unless stated.

### Step A — prepare environment

```bash
npm run env:paseo
```

Ensure `.env` has at least:
- `PRIVATE_KEY=0x...`
- `VITE_RPC_URL=https://eth-rpc-testnet.polkadot.io`
- `VITE_CHAIN_ID=420420417`
- `VITE_GAS_PRICE_GWEI=1100`

### Step B — build/deploy Rust PVM contract

```bash
cd rust/pvm-contract
rustup install nightly
rustup component add rust-src --toolchain nightly
rustup override set nightly
cargo install polkatool --version 0.26.0
make all
export PRIVATE_KEY=0x...
export ETH_RPC_URL=https://eth-rpc-testnet.polkadot.io
make deploy
```

Copy deployed address and update root `.env`:
- `VITE_USE_MOCK_PVM=false`
- `VITE_PVM_ENGINE_ADDRESS=0x...`

### Step C — deploy manager and create basket

```bash
cd ../../contracts
npm install
npm run compile
npm run deploy:paseo
```

`deploy:paseo` deploys manager and creates basket 0.

If you want manager to auto-wire PVM engine from env and auto-handle XCM availability in one step, use:

```bash
npm run redeploy:paseo
```

Then update root `.env`:
- `VITE_BASKET_MANAGER_ADDRESS=0x...`

### Step D — validate

```bash
npm run health:paseo
npm run simulate:deposit
```

### Step E — run frontend

```bash
cd ..
npm run dev
```

---

## 5) Operations and troubleshooting

Useful scripts from `contracts/`:

```bash
npm run health:paseo
npm run simulate:deposit
npm run check:basket
npm run check:xcm
npm run disable:xcm
```

Typical issues:

### Deposit simulation reverts with empty reason
- Usually old manager deployment.
- Fix:
  1. `npm run redeploy:paseo`
  2. Update `VITE_BASKET_MANAGER_ADDRESS`
  3. Re-run health + simulation.

### Very high or unstable fees in wallet
- Ensure legacy gas is used:
  - `.env` includes `VITE_GAS_PRICE_GWEI=1100`
  - frontend restarted after env change.

### PVM not being used
- Check:
  - `VITE_USE_MOCK_PVM=false`
  - `VITE_PVM_ENGINE_ADDRESS` points to deployed code
  - manager `pvmEngine` address (via `health:paseo` output).

---

## 6) About `rust/pvm-engine`

`rust/pvm-engine` exists as a legacy/experimental Rust workspace.

For the current TeleBasket Paseo runtime, the active contract used by manager/frontend integration is:
- `rust/pvm-contract`

You can keep `rust/pvm-engine` for research/reference, but it is not required to run the deployed flow described above.
