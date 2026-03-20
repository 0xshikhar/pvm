# TeleBasket Integration Status

**Date**: 2026-03-20  
**Network**: Paseo Testnet (Chain ID: 420420417)  
**Status**: ✅ **FULLY DEPLOYED - Ready for Testing**

---

## Deployed Contracts

| Contract | Address | Status |
|----------|---------|--------|
| **BasketManager** | `0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2` | ✅ Deployed |
| **BasketToken (xDOT-LIQ)** | `0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B` | ✅ Deployed |
| **XCM Precompile** | `0x00000000000000000000000000000000000a0000` | ✅ Available (12 bytes) |
| **PVM Engine** | `0x09dDF8f56981deC60e468e2B85194102a3e2E124` | ✅ **DEPLOYED** |

---

## Environment Configuration

### Frontend `.env`
```bash
VITE_NETWORK=paseo
VITE_RPC_URL=https://eth-rpc-testnet.polkadot.io
VITE_CHAIN_ID=420420417
VITE_GAS_PRICE_GWEI=1100
VITE_BASKET_MANAGER_ADDRESS=0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2
VITE_BASKET_TOKEN_ADDRESS=0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B
VITE_XCM_PRECOMPILE_ADDRESS=0x00000000000000000000000000000000000a0000
VITE_PVM_ENGINE_ADDRESS=0x09dDF8f56981deC60e468e2B85194102a3e2E124
VITE_USE_MOCK_PVM=false
```

### Contracts `.env`
```bash
HARDHAT_NETWORK=paseo
PRIVATE_KEY=0x9b14771598f8bf44732e7fb3be561d0b59662d570a25b38f724d17fc9d0c8a40
BASKET_MANAGER_ADDRESS=0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2
PASEO_RPC_URL=wss://paseo-rpc.parity.io
PVM_ENGINE_ADDRESS=0x09dDF8f56981deC60e468e2B85194102a3e2E124
```

---

## Basket Configuration

### xDOT-LIQ Basket (ID: 0)

| Chain | Para ID | Weight | Protocol |
|-------|---------|--------|----------|
| Hydration | 2034 | 40% | 0x0000...0001 |
| Moonbeam | 2004 | 30% | 0x0000...0002 |
| Acala | 2000 | 30% | 0x0000...0003 |

**Total Deposited**: 0.0 PAS  
**Status**: Active  
**Token**: xDOT-LIQ

---

## Sovereign Accounts

These accounts control funds on remote chains:

| Chain | Address | Explorer |
|-------|---------|----------|
| Hydration (2034) | `0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa` | [View](https://hydration.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa) |
| Moonbeam (2004) | `0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa` | [View](https://moonbase.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa) |
| Acala (2000) | `0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa` | [View](https://acala.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa) |

## How to Verify XCM Actually Delivered:

### Method 1: Check Transaction Logs
1. Open: https://blockscout-testnet.polkadot.io/tx/<your-tx-hash>
2. Click "Logs" tab
3. Look for XCMMessageSent events
4. Copy the messageHash value

### Method 2: Check Target Chain Explorers
- Hydration: https://hydration.subscan.io/xcm/<message-hash>
- Moonbeam: https://moonbase.subscan.io/xcm/<message-hash>  
- Acala: https://acala.subscan.io/xcm/<message-hash>

### Method 3: Check Sovereign Account Balances
Hydration: https://hydration.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa
Moonbeam:  https://moonbase.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa
Acala:     https://acala.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa

**⚠️ Note**: Accounts need funding on each remote chain for XCM fees.

---

## PVM Engine - DEPLOYED ✅

The PVM (PolkaVM) Engine is a Rust-based optimization engine compiled to RISC-V bytecode that runs on-chain. It provides intelligent rebalancing and yield optimization for baskets.

### PVM Engine Deployment Log

```
Contract built: contract.polkavm
Size:     2945 bytes

Deploying to Polkadot Hub TestNet (chain 420420417)...
RPC: https://eth-rpc-testnet.polkadot.io
Gas price: 1000000000000 wei (1000 gwei)

blockHash            0xc3f8f84a42fec696f2c98522a535a13f9650ed3d805480659e4c8cff28103acc
blockNumber          6611512
contractAddress      0x09dDF8f56981deC60e468e2B85194102a3e2E124
gasUsed              785796
status               1 (success)
transactionHash      0x8f89bf5e38b201fd75c5b435d54dd396b8102c766e9cc594f8f9185904fd6ec9
```

### PVM Engine Functions

| Function | Selector | Input | Output |
|----------|----------|-------|--------|
| `optimizeAllocation` | `0x8fa5f25c` | `weights[], paraIds[]` | `newWeights[]` |
| `rebalanceBasket` | `0xf4993018` | `weights[], totalDeposited, paraIds[]` | `rebalancedWeights[]` |
| `getPoolYields` | `0x5e540e6d` | `paraIds[]` | `yields[]` |
| `getHistoricalVolatility` | `0x8d12f19a` | `paraIds[]` | `volatilities[]` |

### PVM Data: Supported Parachains

| Para ID | Name | Default Yield | Volatility |
|---------|------|--------------|------------|
| 2034 | Hydration | 12% APY | 5% |
| 2004 | Moonbeam | 8% APY | 8% |
| 2000 | Acala | 10% APY | 10% |

---

## Update BasketManager with PVM Address

After PVM deployment, you MUST update BasketManager to use the real PVM engine:

```bash
cd contracts

# Set environment
export PRIVATE_KEY=0x9b14771598f8bf44732e7fb3be561d0b59662d570a25b38f724d17fc9d0c8a40
export BASKET_MANAGER_ADDRESS=0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2
export PVM_ENGINE_ADDRESS=0x09dDF8f56981deC60e468e2B85194102a3e2E124

# Update PVM address using cast
cast send $BASKET_MANAGER_ADDRESS \
  --rpc-url https://eth-rpc-testnet.polkadot.io \
  --gas-price 1000000000000 \
  --private-key $PRIVATE_KEY \
  --legacy \
  "setPVMEngine(address)" $PVM_ENGINE_ADDRESS

# Verify the update
cast call $BASKET_MANAGER_ADDRESS \
  --rpc-url https://eth-rpc-testnet.polkadot.io \
  "pvmEngine()"
# Should return: 0x09dDF8f56981deC60e468e2B85194102a3e2E124
```

---

## Quick Commands

### Verify All Deployments
```bash
cd contracts
npm run verify:sovereign
```

### Fund Sovereign Accounts
```bash
cd contracts
npm run fund:sovereign
```

### Check XCM Events
```bash
cd contracts
npm run verify:xcm TX_HASH=<your-tx-hash>
```

### Start Frontend
```bash
npm run dev
```

---

## Testing Checklist

### Phase 1: Deployment ✅ COMPLETE
- [x] BasketManager deployed
- [x] BasketToken created
- [x] XCM precompile detected (0x0a0000)
- [x] **PVM Engine deployed** (0x09dDF8f56981deC60e468e2B85194102a3e2E124)
- [x] Frontend builds successfully

### Phase 2: Configuration ✅ COMPLETE
- [x] Update `.env` with PVM address
- [x] Update BasketManager with PVM address (`setPVMEngine`)
- [x] Verify PVM integration (`pvmEngine()` call)

### Phase 3: Deposit Testing
- [ ] Connect wallet (SubWallet/MetaMask)
- [ ] Deposit PAS into basket
- [ ] Verify token minting
- [ ] Check XCM messages dispatched

### Phase 4: Withdraw Testing
- [ ] Withdraw basket tokens
- [ ] Verify PAS returned
- [ ] Check XCM withdraw messages

### Phase 5: Rebalance Testing
- [ ] Trigger rebalance
- [ ] Verify PVM engine optimization
- [ ] Check allocation updates

### Phase 6: XCM Verification
- [ ] Verify funds arrived on Hydration
- [ ] Verify funds arrived on Moonbeam
- [ ] Verify funds arrived on Acala

---

## Known Issues

1. **Sovereign Derivation**: Using keccak256 instead of blake2b-256 (testnet approximation)
2. **XCM Fees**: Sovereign accounts need manual funding on remote chains
3. **All core components deployed** - Ready for end-to-end testing!

---

## Frontend Integration

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| BasketManager Hook | `src/hooks/useBasketManager.ts` | Contract interactions |
| Deposit Form | `src/components/DepositForm.tsx` | Deposit UI |
| Withdraw Form | `src/components/WithdrawForm.tsx` | Withdraw UI + XCM status |
| Rebalance Panel | `src/components/RebalancePanel.tsx` | PVM rebalance trigger |
| XCM Status | `src/components/XCMStatus.tsx` | Cross-chain status |
| Wallet Context | `src/contexts/WalletContext.tsx` | Wallet connection |

### Contract Addresses in Frontend

All addresses are read from `.env` and exported from `src/config/contracts.ts`:

```typescript
export const BASKET_MANAGER_ADDRESS = import.meta.env.VITE_BASKET_MANAGER_ADDRESS || "";
export const BASKET_TOKEN_ADDRESS = import.meta.env.VITE_BASKET_TOKEN_ADDRESS || "";
export const XCM_PRECOMPILE_ADDRESS = import.meta.env.VITE_XCM_PRECOMPILE_ADDRESS || "";
export const PVM_ENGINE_ADDRESS = import.meta.env.VITE_PVM_ENGINE_ADDRESS || "";
```

---

## XCM Implementation

### Version: XCM V5 (SCALE Encoded)

Based on VeritasXCM proven implementation:
- Precompile: `0x000...0a0000`
- Encoding: SCALE (not base64/JSON)
- Weight estimation: ✅ Implemented
- Message types: WithdrawAsset, BuyExecution, DepositAsset, ClearOrigin

### Example XCM Message (Deposit)
```
0x050c00010100013581d9cd9d91010003010100018d19c9bd0501000006...
```

This sends:
1. WithdrawAsset (pull PAS)
2. BuyExecution (pay for execution)
3. DepositAsset (deposit to sovereign)

---

## PVM Engine Architecture

```
Frontend (React)
    ↓
useBasketManager.rebalance()
    ↓
BasketManager.rebalance(basketId)
    ↓
staticcall PVM Engine (0x09dDF8f56981deC60e468e2B85194102a3e2E124)
    ↓
Rust PVM (RISC-V bytecode, 2945 bytes)
    ↓
Optimize weights based on yield/volatility
    ↓
Return new weights[]
    ↓
Update basket allocations
```

### PVM Optimization Algorithm

1. **Input**: Current weights, paraIds, total deposited
2. **Calculate**: Risk scores from yield/volatility
3. **Optimize**: Weight toward higher yield, lower risk
4. **Apply Threshold**: Only change if diff > 200 bps
5. **Output**: New weights array

---

## References

- **VeritasXCM** (Proven Implementation):
  - XcmOracle: `0xC856458944fecE98766700b229D3D57219D42F5b`
  - Proven TX: `0x9678278bccd05564458a1fc5d8069928758ddace9d5a2b431815ff5267f4d626`

- **PVM Documentation**:
  - `rust/pvm-contract/README.md`
  - `docs/PVM_INTEGRATION.md`

- **Explorer**: https://blockscout-testnet.polkadot.io
- **RPC**: https://eth-rpc-testnet.polkadot.io
- **Chain ID**: 420420417

---

## Support

For issues:
1. Check `docs/STATUS.md` for current state
2. Run `npm run verify:sovereign` to check deployment
3. Check explorer for transaction status
4. Verify `.env` has correct addresses
5. For PVM: Check `rust/pvm-contract/README.md`

---

*Last Updated: 2026-03-20*  
*🎉 ALL COMPONENTS DEPLOYED - Ready for End-to-End Testing! 🚀*
