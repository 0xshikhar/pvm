# TeleBasket Status (Paseo)

Last updated: 2026-03-19

## Current target

- Network: **Paseo / Polkadot Hub TestNet**
- Chain ID: `420420417`
- RPC: `https://eth-rpc-testnet.polkadot.io`

## What is fixed

- Frontend defaults to Paseo and uses legacy gas configuration for tx writes.
- `BasketManager.deposit()` no longer hard-fails when XCM dispatch is unavailable.
- `BasketManager.withdraw()` now transfers native PAS back to user.
- `BasketManager.rebalance()` now calls Rust PVM engine via `rebalanceBasket(bytes)` selector.
- Deployment scripts configure PVM engine from `.env` and auto-disable XCM only when precompile code is absent.
- Health/simulation scripts detect old ABI deployments and provide recovery instructions.

## Known operational constraint

If `.env` still points to an older manager deployment (for example `0xa6A6dcad668470D3BfC5c73938B4558e5aad1505`), deposit simulation can still revert.

Use:

```bash
cd contracts
npm run deploy:paseo
npm run health:paseo
npm run simulate:deposit
```

Then update root `.env` with the new `VITE_BASKET_MANAGER_ADDRESS`.

## Validation docs

- Integration guide: `docs/PVM_INTEGRATION.md`
- End-to-end runbook: `docs/PASEO_E2E_TESTING.md`
