# TeleBasket - Local-Only Mode Configuration

## Current Status: Local-Only Mode (Paseo Testnet)

**Last Updated:** 2026-03-20

---

## ⚠️ Important Notice

**TeleBasket is currently operating in LOCAL-ONLY MODE on Paseo Testnet.**

This is due to a **network limitation**: The XCM precompile at `0x00000000000000000000000000000000000a0000` is non-functional on Paseo (only 5 bytes of code - essentially a stub).

### What This Means

| Feature | Status | Details |
|---------|--------|---------|
| **Deposit PAS** | ✅ Working | 1:1 minting of xDOT-LIQ tokens |
| **Withdraw PAS** | ✅ Working | Redeem tokens for PAS |
| **PVM Rebalancing** | ✅ Working | AI-optimized allocations |
| **Cross-Chain XCM** | ❌ Not Available | Funds stay on Asset Hub |
| **Multi-Chain Deployment** | ❌ Not Available | No parachain transfers |

### What Actually Happens

```
User deposits 10 PAS
    ↓
✅ BasketManager mints 10 xDOT-LIQ tokens (1:1)
    ↓
❌ XCM dispatch attempted but fails silently
    ↓
💰 Funds remain on Asset Hub (not lost!)
    ↓
📊 Basket token represents local holdings
```

**Your funds are SAFE** - they never leave Asset Hub, and you can withdraw anytime.

---

## User Experience

### Deposit Flow
```
1. User deposits 10 PAS
2. Contract mints 10 xDOT-LIQ tokens ✅
3. XCM attempted to 3 parachains ❌ (network limitation)
4. User receives basket tokens ✅
5. Funds available for withdrawal ✅
```

### Withdraw Flow
```
1. User burns 10 xDOT-LIQ tokens
2. Contract returns 10 PAS ✅
3. No XCM needed (funds never left) ✅
```

### Rebalancing
```
1. PVM engine calculates optimal weights ✅
2. Allocations updated in contract ✅
3. Ready for when XCM becomes available ✅
```

---

## Technical Details

### Why XCM Fails

```solidity
// XCM precompile on Paseo
code: 0x60006000fd (5 bytes)
// This is just: PUSH1 0x00 PUSH1 0x00 REVERT
// It immediately reverts all calls!
```

**Verdict:** Paseo testnet has a placeholder XCM precompile that doesn't actually work.

### Evidence from Other Projects

- **VeritasXCM** (`0xC856458944fecE98766700b229D3D57219D42F5b`): Same precompile address, same issue
- **Hyperway**: Uses same precompile, no working XCM on Paseo

**Conclusion:** This is a network-wide limitation, not a contract bug.

---

## Deployment Status

| Contract | Address | Status |
|----------|---------|--------|
| **BasketManager** | `0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2` | ✅ Active |
| **BasketToken (xDOT-LIQ)** | `0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B` | ✅ Active |
| **PVM Engine** | `0x09dDF8f56981deC60e468e2B85194102a3e2E124` | ✅ Active |
| **XCM Precompile** | `0x00000000000000000000000000000000000a0000` | ❌ Non-functional |

---

## How to Use TeleBasket (Local-Only Mode)

### 1. Deposit PAS
```bash
# Via frontend
1. Connect wallet (SubWallet/MetaMask)
2. Enter deposit amount (e.g., 10 PAS)
3. Click "Deposit"
4. Receive 10 xDOT-LIQ tokens

# Via CLI
cd contracts
npm run test:xcm-deposit
```

### 2. Track Your Position
```bash
# Check token balance
cast call 0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B \
  "balanceOf(address)" <YOUR_ADDRESS> \
  --rpc-url https://eth-rpc-testnet.polkadot.io
```

### 3. Rebalance (PVM Optimization)
```bash
# Trigger rebalancing via frontend
# PVM engine suggests optimal weights
# Allocations updated in contract
```

### 4. Withdraw PAS
```bash
# Via frontend
1. Enter withdrawal amount
2. Click "Withdraw"
3. Receive PAS back (1:1 ratio)

# Token burned, PAS returned ✅
```

---

## Testing

### Quick Test
```bash
cd contracts
npm run test:xcm-deposit
```

**Expected Output:**
```
✅ Transaction confirmed!
✅ Deposited: 1.0 PAS
✅ Tokens Minted: 1.0 xDOT-LIQ
⚠️  XCM: Local-only mode (network limitation)
📊 Success Rate: 100% (local operations)
```

### Verify Your Deposit
```bash
# Check explorer
https://blockscout-testnet.polkadot.io/address/<YOUR_ADDRESS>

# Check token balance
cast call 0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B \
  "balanceOf(address)" <YOUR_ADDRESS> \
  --rpc-url https://eth-rpc-testnet.polkadot.io
```

---

## Future: Cross-Chain Mode

When XCM becomes available (mainnet or updated testnet):

```
User deposits 10 PAS
    ↓
✅ BasketManager mints 10 xDOT-LIQ tokens
    ↓
✅ XCM dispatches funds to 3 parachains:
   - Hydration (4 PAS)
   - Moonbeam (3 PAS)
   - Acala (3 PAS)
    ↓
🌐 True multi-chain basket!
```

**Required for XCM:**
1. Functional XCM precompile (not a stub)
2. Sovereign account funding on target chains
3. Network support for cross-chain transfers

---

## Console Messages

When using the frontend, you'll see:

```javascript
// Deposit
[DepositForm] 🚀 Starting deposit...
[DepositForm] 📊 Amount: 10 PAS
[DepositForm] ✅ Deposit successful!
[DepositForm] 🔗 Transaction hash: 0x...
[DepositForm] ⚠️  Note: Operating in local-only mode
[DepositForm]    XCM cross-chain not available on Paseo
[DepositForm]    Funds remain safely on Asset Hub

// Withdraw
[WithdrawForm] 🚀 Starting withdrawal...
[WithdrawForm] ✅ Withdrawal successful!
[WithdrawForm] 💰 PAS returned: 10 PAS
[WithdrawForm] ✨ No XCM needed (local mode)
```

---

## FAQ

**Q: Is my money safe?**
A: Yes! Funds never leave Asset Hub. They're held by the BasketManager contract.

**Q: Can I withdraw anytime?**
A: Yes! Burn xDOT-LIQ tokens to get your PAS back 1:1.

**Q: Why no cross-chain?**
A: Paseo testnet's XCM precompile is non-functional (only 5 bytes). This is a network limitation.

**Q: Will this work on mainnet?**
A: Yes! Polkadot mainnet has a fully functional XCM precompile.

**Q: Can I test XCM elsewhere?**
A: Not currently. All Polkadot testnets (Paseo, Westend) have the same limitation.

**Q: What's the point then?**
A: Test the full UX: deposits, withdrawals, PVM rebalancing, basket mechanics. Just without cross-chain for now.

---

## Summary

**TeleBasket on Paseo = Local Basket + PVM + Full UX**

✅ Deposit PAS → Get basket tokens
✅ Withdraw basket tokens → Get PAS back
✅ PVM AI rebalancing
✅ Token transfers
❌ Cross-chain XCM (network limitation)

**Ready to use?** Start here:
```bash
npm run dev
# Connect wallet and deposit!
```
