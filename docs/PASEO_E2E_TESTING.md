# Paseo E2E Testing Runbook

Last updated: 2026-03-19

This runbook validates the full TeleBasket stack on Paseo:

1. Solidity contracts (`contracts/`)
2. Rust PVM engine (`rust/pvm-contract/`)
3. Frontend transaction flow (`src/`)

## Prerequisites

- Wallet funded with PAS on chain `420420417`
- Root `.env` has:
  - `PRIVATE_KEY=0x...`
  - `VITE_NETWORK=paseo`
  - `VITE_RPC_URL=https://eth-rpc-testnet.polkadot.io`
  - `VITE_CHAIN_ID=420420417`
  - `VITE_GAS_PRICE_GWEI=1100`

## A. Contract health baseline

```bash
cd contracts
npm run health:paseo
```

Pass criteria:
- `BasketManager code length` > 2
- `nextBasketId` >= 1
- `basket[0].active: true`

Fail indicator:
- `xcmEnabled/xcmPrecompile/pvmEngine: unavailable (older deployment ABI)`  
  → redeploy manager (Section C).

## B. Build/deploy Rust PVM engine

```bash
cd ../rust/pvm-contract
make all
export PRIVATE_KEY=0x...
export ETH_RPC_URL=https://eth-rpc-testnet.polkadot.io
make deploy
```

Copy contract address and set in root `.env`:

```bash
VITE_USE_MOCK_PVM=false
VITE_PVM_ENGINE_ADDRESS=0x...
```

## C. Deploy latest BasketManager

```bash
cd ../../contracts
npm run deploy:paseo
```

Update root `.env` with deployed manager:

```bash
VITE_BASKET_MANAGER_ADDRESS=0x...
```

## D. Post-deploy checks

```bash
cd contracts
npm run health:paseo
npm run simulate:deposit
```

Pass criteria:
- Health script reads manager owner and basket data
- Simulation prints `Simulation success, tokensMinted: ...`

## E. Frontend checks

```bash
cd ..
npm run dev
```

Manual flow:
1. Connect wallet.
2. Confirm app asks/switches to chain `420420417`.
3. Deposit `1` PAS on `/basket/0`.
4. Confirm tx in wallet (legacy gas price path).
5. Verify success link opens `https://blockscout-testnet.polkadot.io/tx/<hash>`.
6. Verify basket token balance updates in Withdraw panel.
7. Withdraw part of position and verify PAS is returned.

## F. Failure matrix

- `execution reverted` on deposit simulation + old ABI in health:
  - `npm run redeploy:paseo`
  - update `VITE_BASKET_MANAGER_ADDRESS`
- Very large network fee warning in wallet:
  - ensure `.env` includes `VITE_GAS_PRICE_GWEI=1100`
  - restart frontend dev server
- Withdraw succeeds but no PAS received:
  - ensure deployed manager is latest (withdraw now transfers native token)

## G. Quick command sequence

```bash
cd tele-basket
npm run env:paseo
cd contracts && npm run deploy:paseo && npm run health:paseo && npm run simulate:deposit
cd ../ && npm run dev
```
