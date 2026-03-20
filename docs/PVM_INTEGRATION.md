# TeleBasket Paseo Integration (Contracts + Rust PVM + Frontend)

Last updated: 2026-03-19

## 1) Network and defaults

TeleBasket is configured to run on **Paseo / Polkadot Hub TestNet** by default:

- `VITE_NETWORK=paseo`
- `VITE_RPC_URL=https://eth-rpc-testnet.polkadot.io`
- `VITE_CHAIN_ID=420420417`
- `VITE_GAS_PRICE_GWEI=1100`

## 2) Why deposit was reverting

If `npm run health:paseo` prints `xcmEnabled/xcmPrecompile: unavailable (older deployment ABI)`, your `BasketManager` is an older deployment that still hard-reverts in `deposit()`.

The previously used address `0xa6A6dcad668470D3BfC5c73938B4558e5aad1505` shows this symptom in recent checks.

## 3) Correct integration flow

### Step A: Build/deploy Rust PVM engine (optional but recommended)

```bash
cd rust/pvm-contract
make all
export PRIVATE_KEY=0x...
export ETH_RPC_URL=https://eth-rpc-testnet.polkadot.io
make deploy
```

Take deployed address and set in root `.env`:

```bash
VITE_USE_MOCK_PVM=false
VITE_PVM_ENGINE_ADDRESS=0x...
```

### Step B: Deploy latest BasketManager on Paseo

```bash
cd contracts
npm run deploy:paseo
```

This deployment now:
- Creates basket `0` (`xDOT Liquidity Basket`)
- Configures `pvmEngine` from `VITE_PVM_ENGINE_ADDRESS` when code exists
- Disables XCM only when precompile has no code

Update root `.env` with new manager:

```bash
VITE_BASKET_MANAGER_ADDRESS=0x...
```

### Step C: Verify health and simulate

```bash
cd contracts
npm run health:paseo
npm run simulate:deposit
```

Expected:
- `nextBasketId: 1`
- `basket[0].active: true`
- no revert in `simulate:deposit`

### Step D: Run frontend

```bash
cd ..
npm run dev
```

Wallet must be on chain `420420417` (Paseo).

## 4) Runtime behavior now

- `deposit()` mints basket token and does not revert if XCM dispatch fails.
- `withdraw()` burns basket token and transfers native PAS back to user.
- `rebalance()` calls Rust PVM with selector `rebalanceBasket(bytes)` and encoded payload `(weights, totalDeposited, paraIds)`.

## 5) Fast recovery commands

```bash
cd contracts
npm run redeploy:paseo
npm run health:paseo
npm run simulate:deposit
```

If `simulate:deposit` still reverts, you are still pointing frontend/env to an old manager address.
