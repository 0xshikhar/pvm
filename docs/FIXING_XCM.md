# Fixing XCM for PolkaBasket

## Current Issue: XCM Messages Are Failing

Based on transaction `0xbd91dff1...`, XCM is failing with these events:
- ❌ `XCMMessageFailed` - XCM dispatch is failing
- ❌ `DeploymentFailed` - Funds not reaching parachains

## Root Cause Analysis

The transaction succeeds locally (tokens minted) but XCM to parachains fails. This happens because:

1. **XCM Precompile**: Available but may not be fully functional on Paseo
2. **Sovereign Accounts**: Not funded on target chains (Hydration, Moonbeam, Acala)
3. **Missing XCM Fees**: No PAS to pay for cross-chain execution

## Step-by-Step Fix

### Step 1: Run XCM Test to Diagnose

```bash
cd contracts
npm run test:xcm-deposit
```

This will:
- Deposit 1 PAS
- Parse all XCM events
- Show exactly which messages failed
- Give you specific fix recommendations

### Step 2: Fund Sovereign Accounts (CRITICAL)

Each target parachain needs a funded sovereign account to receive XCM messages:

```bash
# Set your deployed BasketManager address
export BASKET_MANAGER_ADDRESS=0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2

# Fund all sovereign accounts with 5 PAS each for XCM fees
npm run fund:sovereign
```

**Sovereign Account Addresses:**
| Chain | Para ID | Sovereign Account |
|-------|---------|------------------|
| Hydration | 2034 | `0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa` |
| Moonbeam | 2004 | `0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa` |
| Acala | 2000 | `0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa` |

> **Note**: Currently using keccak256 derivation. For production, should use proper blake2b-256.

### Step 3: Verify XCM Precompile

Check if the XCM precompile has actual code:

```bash
cast code 0x00000000000000000000000000000000000a0000 \
  --rpc-url https://eth-rpc-testnet.polkadot.io
```

**Expected**: Should return bytecode (not `0x`)

**If empty**, the XCM precompile is not deployed on Paseo. You have two options:

#### Option A: Deploy Custom XCM Precompile (Advanced)

```bash
# Deploy the XCM precompile contract
npm run deploy:xcm-precompile

# Update BasketManager to use it
cast send $BASKET_MANAGER_ADDRESS \
  --rpc-url https://eth-rpc-testnet.polkadot.io \
  --gas-price 1000000000000 \
  --private-key $PRIVATE_KEY \
  --legacy \
  "setXCMPrecompile(address)" <DEPLOYED_PRECOMPILE_ADDRESS>
```

#### Option B: Use Local-Only Mode (Fallback)

If XCM is not available, the contract gracefully falls back to local-only mode:
- Funds stay on Asset Hub
- Basket tokens still minted 1:1
- No cross-chain deployment (limited functionality)

### Step 4: Enable/Verify XCM in BasketManager

```bash
# Check current status
cast call $BASKET_MANAGER_ADDRESS "xcmEnabled()" \
  --rpc-url https://eth-rpc-testnet.polkadot.io

# Should return: true

# If false, enable it:
cast send $BASKET_MANAGER_ADDRESS \
  --rpc-url https://eth-rpc-testnet.polkadot.io \
  --gas-price 1000000000000 \
  --private-key $PRIVATE_KEY \
  --legacy \
  "setXCMEnabled(bool)" true
```

### Step 5: Test Again

After funding sovereign accounts:

```bash
npm run test:xcm-deposit
```

**Success Criteria:**
- ✅ `XCMMessageSent` events (not `XCMMessageFailed`)
- ✅ `DeploymentDispatched` events (not `DeploymentFailed`)
- ✅ Message hashes that can be tracked

### Step 6: Verify Cross-Chain Delivery

Wait 1-2 minutes for XCM execution, then verify:

**Check Target Chain Explorers:**
- Hydration: `https://hydration.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa`
- Moonbeam: `https://moonbase.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa`
- Acala: `https://acala.subscan.io/account/0x98b71d9da7f556addb143b901cc911867242e374f27f89d24b693974723e20aa`

**Expected**: Balance increased on each chain

## Console Logging Reference

When you make a deposit, check browser console for:

```
[useBasketManager] 🏦 Deposit initiated
[useBasketManager] 📊 Amount: 1 PAS
[useBasketManager] 👤 Account: 0x...
[useBasketManager] ✅ Simulation successful
[useBasketManager] 📡 Sending transaction...
[useBasketManager] 🔗 Transaction sent: 0x...
[useBasketManager] ✅ Transaction confirmed!
[useBasketManager] 🔍 Parsing XCM events from receipt...
[parseXCMEvents] 🔍 Parsing 8 logs
[parseXCMEvents] 📋 Log[0]: ...
[parseXCMEvents]    ⚠️ Skipping - wrong address  (ERC20 Transfer)
[parseXCMEvents] 📋 Log[1]: ...
[parseXCMEvents]    ❌ XCMMessageFailed: Para 2034  ← PROBLEM!
[parseXCMEvents] 📋 Log[2]: ...
[parseXCMEvents]    ❌ DeploymentFailed: Basket 0, Para 2034  ← PROBLEM!
[parseXCMEvents] 📋 Log[7]: ...
[parseXCMEvents]    ✅ Deposited: Basket 0, User 0x...  ← Local success
```

**If you see ❌ XCMMessageFailed**: Sovereign accounts not funded
**If you see ❌ DeploymentFailed**: XCM precompile not working
**If you see ✅ XCMMessageSent**: XCM dispatched successfully!

## Quick Commands

```bash
# Test XCM deposit (1 PAS)
cd contracts && npm run test:xcm-deposit

# Fund sovereign accounts
cd contracts && npm run fund:sovereign

# Verify deployment
cd contracts && npm run verify:sovereign

# Check XCM status of a transaction
cd contracts && npm run verify:xcm TX_HASH=<hash>

# Start frontend
npm run dev
```

## Expected Console Output (When Fixed)

```
[parseXCMEvents] ✅ XCMMessageSent: Para 2034, Amount 0.4 PAS
[parseXCMEvents]    Message Hash: 0xabc123...
[parseXCMEvents] ✅ XCMMessageSent: Para 2004, Amount 0.3 PAS
[parseXCMEvents]    Message Hash: 0xdef456...
[parseXCMEvents] ✅ XCMMessageSent: Para 2000, Amount 0.3 PAS
[parseXCMEvents]    Message Hash: 0xghi789...

📊 Success Rate: 100.0%

✅ XCM messages were dispatched. To verify delivery:
   1. Wait 1-2 minutes for XCM execution
   2. Check target chain explorers:
      Hydration: https://hydration.subscan.io/xcm/0xabc123...
      Moonbeam: https://moonbase.subscan.io/xcm/0xdef456...
      Acala: https://acala.subscan.io/xcm/0xghi789...
```

## Troubleshooting

### Issue: "Insufficient balance"
**Fix**: Get PAS from faucet: https://faucet.polkadot.io/

### Issue: "XCM precompile has no code"
**Fix**: XCM precompile not available on Paseo. Use local-only mode or deploy custom precompile.

### Issue: "DeploymentFailed - sovereign account needs funding"
**Fix**: Run `npm run fund:sovereign`

### Issue: "XCMMessageFailed - XCM dispatch failed"
**Fix**: Check XCM precompile availability:
```bash
cast code 0x00000000000000000000000000000000000a0000 \
  --rpc-url https://eth-rpc-testnet.polkadot.io
```

### Issue: Transaction reverts
**Fix**: 
1. Check if XCM is enabled: `cast call $BASKET_MANAGER_ADDRESS "xcmEnabled()"`
2. Verify BasketManager has correct XCM precompile address
3. Check if XCM precompile has code

## Current Status (2026-03-20)

| Component | Status | Notes |
|-----------|--------|-------|
| BasketManager | ✅ Deployed | 0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2 |
| BasketToken | ✅ Deployed | 0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B |
| XCM Precompile | ⚠️ Partial | Has 12 bytes but may not be functional |
| PVM Engine | ✅ Deployed | 0x09dDF8f56981deC60e468e2B85194102a3e2E124 |
| Sovereign Accounts | ❌ Not Funded | Need 5 PAS each for XCM fees |
| XCM Events | ✅ Implemented | Frontend now parses all events |

## Next Steps to Make XCM Work

1. ✅ **Done**: Added comprehensive event parsing
2. ✅ **Done**: Created CLI test script
3. 🔄 **Next**: Fund sovereign accounts on target chains
4. 🔄 **Next**: Verify XCM precompile functionality
5. 🔄 **Next**: Test end-to-end cross-chain transfer

---

**Ready to test?** Run:
```bash
cd contracts && npm run test:xcm-deposit
```
