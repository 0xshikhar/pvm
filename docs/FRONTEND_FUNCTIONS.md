# TeleBasket Frontend Functions

Complete listing of all frontend functions integrated with XCM-based multichain infrastructure.

---

## Core Hooks

### 1. useBasketManager (`src/hooks/useBasketManager.ts`)

Main hook for contract interactions with XCM support.

#### Read Functions
| Function | Signature | Purpose |
|----------|-----------|---------|
| `getNextBasketId()` | `async (): Promise<bigint>` | Get next available basket ID |
| `getBasket(basketId)` | `async (basketId: bigint): Promise<Basket \| null>` | Get basket details including allocations |
| `getBasketInfo(basketId)` | `async (basketId: bigint): Promise<BasketInfo \| null>` | Get formatted basket info with chain names |
| `getBasketNAV(basketId)` | `async (basketId: bigint): Promise<bigint>` | Get total value locked in basket |

#### Write Functions (with XCM)
| Function | Signature | Purpose | XCM Integration |
|----------|-----------|---------|-----------------|
| `deposit(walletClient, basketId, amountDOT)` | `async (walletClient, basketId: bigint, amountDOT: string \| number): Promise<string>` | Deposit PAS into basket | ✅ Triggers `_executeDeployment` which dispatches XCM to parachains |
| `withdraw(walletClient, basketId, tokenAmount)` | `async (walletClient, basketId: bigint, tokenAmount: bigint): Promise<string>` | Withdraw basket tokens | ✅ Triggers `_dispatchXCMWithdraw` for cross-chain withdrawal |
| `rebalance(walletClient, basketId)` | `async (walletClient, basketId: bigint): Promise<string>` | Rebalance basket weights | ✅ Calls PVM engine via `rebalanceBasket` selector |

#### State
| Property | Type | Description |
|----------|------|-------------|
| `isLoading` | `boolean` | Transaction in progress |
| `error` | `string \| null` | Error message from last operation |
| `isConfigured` | `boolean` | Whether BasketManager address is set |

---

### 2. useXCMStatus (`src/hooks/useXCMStatus.ts`)

Hook for tracking cross-chain message status.

| Function | Signature | Purpose |
|----------|-----------|---------|
| `addMessage(message)` | `(message: Omit<XCMMessage, "id" \| "timestamp" \| "status">) => string` | Add new XCM message to tracking |
| `updateMessageStatus(id, status, txHash?)` | `(id: string, status: XCMMessageStatus, txHash?: string) => void` | Update message status (pending/confirmed/failed) |
| `removeMessage(id)` | `(id: string) => void` | Remove message from tracking |
| `clearMessages()` | `() => void` | Clear all tracked messages |
| `getMessagesByStatus(status)` | `(status: XCMMessageStatus) => XCMMessage[]` | Get messages by status |
| `getPendingMessages()` | `() => XCMMessage[]` | Get all pending messages |
| `getConfirmedMessages()` | `() => XCMMessage[]` | Get all confirmed messages |
| `getFailedMessages()` | `() => XCMMessage[]` | Get all failed messages |

#### State
| Property | Type | Description |
|----------|------|-------------|
| `messages` | `XCMMessage[]` | All tracked XCM messages |
| `isPolling` | `boolean` | Whether actively polling for updates |
| `pendingCount` | `number` | Number of pending messages |
| `confirmedCount` | `number` | Number of confirmed messages |
| `failedCount` | `number` | Number of failed messages |

---

### 3. usePVMEngine (`src/hooks/usePVMEngine.ts`)

Hook for Rust PVM engine integration.

| Function | Signature | Purpose |
|----------|-----------|---------|
| `optimizeAllocation(weights, paraIds)` | `async (weights: number[], paraIds: number[]): Promise<number[]>` | Get optimized allocation weights from PVM |
| `rebalanceBasket(weights, totalDeposited, paraIds)` | `async (weights: number[], totalDeposited: bigint, paraIds: number[]): Promise<number[]>` | Get rebalanced weights from PVM |
| `getPoolYields(paraIds)` | `async (paraIds: number[]): Promise<number[]>` | Get yield data for parachain pools |
| `getVolatility(paraIds)` | `async (paraIds: number[]): Promise<number[]>` | Get volatility data for risk assessment |

---

### 4. useBasketToken (`src/hooks/useBasketToken.ts`)

Hook for basket token ERC-20 interactions.

| Function | Signature | Purpose |
|----------|-----------|---------|
| `getTokenInfo()` | `async (): Promise<TokenInfo \| null>` | Get token metadata (name, symbol, decimals, supply) |
| `getBalance(address)` | `async (address: string): Promise<bigint>` | Get token balance for address |
| `getAllowance(owner, spender)` | `async (owner: string, spender: string): Promise<bigint>` | Get token allowance |

---

### 5. useEVMWallet (`src/hooks/useEVMWallet.ts`)

Hook for wallet connection and chain management.

| Function | Signature | Purpose |
|----------|-----------|---------|
| `connect()` | `async (): Promise<void>` | Connect wallet (MetaMask/SubWallet) |
| `disconnect()` | `() => void` | Disconnect wallet |
| `switchChain(targetChainId?)` | `async (targetChainId?: number): Promise<void>` | Switch to Paseo network |

#### State
| Property | Type | Description |
|----------|------|-------------|
| `address` | `string \| null` | Connected wallet address |
| `walletClient` | `WalletClient \| null` | Viem wallet client |
| `chainId` | `number \| null` | Current chain ID |
| `isAvailable` | `boolean` | Whether wallet provider available |
| `error` | `string \| null` | Connection error |
| `loading` | `boolean` | Connection in progress |

---

## UI Components

### 1. DepositForm (`src/components/DepositForm.tsx`)

| Function | Signature | Purpose | XCM Integration |
|----------|-----------|---------|-----------------|
| `handleDeposit()` | `async (): Promise<void>` | Execute deposit transaction | ✅ Shows per-chain XCM destinations in allocation preview |
| `handleSwitchChain()` | `async (): Promise<void>` | Switch network if on wrong chain | - |

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `basketId` | `bigint` | Target basket ID |
| `basketName` | `string` | Display name for basket |
| `allocations` | `Array<{chain: string, paraId: number, pct: number}>` | Chain allocation breakdown |

#### State
| State | Type | Description |
|-------|------|-------------|
| `amount` | `string` | User input amount |
| `txHash` | `string \| null` | Transaction hash after deposit |
| `txStatus` | `"idle" \| "pending" \| "success" \| "error"` | Transaction status |

---

### 2. WithdrawForm (`src/components/WithdrawForm.tsx`)

| Function | Signature | Purpose | XCM Integration |
|----------|-----------|---------|-----------------|
| `handleWithdraw()` | `async (): Promise<void>` | Execute withdraw transaction | ✅ Tracks XCM status per target chain, shows pending/confirmed/failed |
| `handleSwitchChain()` | `async (): Promise<void>` | Switch network if on wrong chain | - |
| `handleMax()` | `() => void` | Set amount to max balance | - |

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `basketId` | `bigint` | Target basket ID |
| `tokenSymbol` | `string` | Basket token symbol (e.g., "xDOT-LIQ") |
| `userTokenBalance` | `string` | User's basket token balance |
| `allocations` | `Array<{paraId: number, weightBps: number}>` | Target chains for withdrawal |

#### State
| State | Type | Description |
|-------|------|-------------|
| `amount` | `string` | Withdrawal amount |
| `txHash` | `string \| null` | Transaction hash |
| `txStatus` | `"idle" \| "pending" \| "success" \| "error"` | Transaction status |
| `xcmTracking` | `Array<{paraId: number, status: "pending" \| "confirmed" \| "failed"}>` | Per-chain XCM status |

---

### 3. RebalancePanel (`src/components/RebalancePanel.tsx`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `handleRebalance()` | `async (): Promise<void>` | Execute rebalance transaction |
| `fetchBasketInfo()` | `async (): Promise<void>` | Load current basket allocations |
| `fetchPVMOptimization()` | `async (): Promise<void>` | Get optimized weights from PVM |

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `basketId` | `bigint` | Target basket ID |

---

### 4. XCMStatus (`src/components/XCMStatus.tsx`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `statusIcon(status)` | `(s: string) => string` | Get icon for status (⏳/✓/✗) |
| `statusColor(status)` | `(s: string) => string` | Get CSS class for status color |
| `getExplorerUrl(msg)` | `(msg: XCMMessage) => string \| null` | Get explorer link for chain |

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `messages` | `XCMMessage[]` | XCM messages to display |
| `onClear` | `() => void` | Callback to clear messages |

---

## Context Providers

### WalletContext (`src/contexts/WalletContext.tsx`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `useWallet()` | `() => WalletContextType` | Access wallet state and functions |
| `useWalletClient()` | `() => WalletClient \| null` | Get Viem wallet client |

---

## XCM Message Builders (`xcm/messages/index.ts`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `encodeSiblingDestination(paraId)` | `(paraId: number) => Uint8Array` | Encode XCM V5 destination for sibling parachain |
| `encodeRelayDestination()` | `() => Uint8Array` | Encode XCM V5 destination for relay chain |
| `buildWithdrawAsset(amount)` | `(amount: bigint) => Uint8Array` | Build WithdrawAsset XCM instruction |
| `buildBuyExecution(fees)` | `(fees: bigint) => Uint8Array` | Build BuyExecution XCM instruction |
| `buildDepositAsset(account)` | `(account: Uint8Array) => Uint8Array` | Build DepositAsset XCM instruction |
| `buildClearOrigin()` | `() => Uint8Array` | Build ClearOrigin XCM instruction |
| `encodeXCMV5(instructions)` | `(instructions: Uint8Array[]) => Uint8Array` | Encode XCM V5 message from instructions |
| `buildHydrationDepositXCM(amount, lpCallData, sovereignAccount)` | Build complete deposit XCM for Hydration |
| `buildMoonbeamDepositXCM(amount, lendingCallData, sovereignAccount)` | Build complete deposit XCM for Moonbeam |
| `buildAcalaDepositXCM(amount, stakingCallData, sovereignAccount)` | Build complete deposit XCM for Acala |
| `buildHydrationWithdrawXCM(amount, withdrawCallData, recipientOnHub)` | Build complete withdraw XCM for Hydration |
| `getXCMMessageForChain(chainType, action, amount, callData, sovereignAccount, recipient?)` | Get XCM message for specific chain and action |
| `xcmMessageToHex(message)` | `(message: Uint8Array) => string` | Convert XCM message to hex string |

---

## Contract ABI Integration

### BasketManager Contract Functions

#### Read Functions (via useBasketManager)
- `nextBasketId() → uint256`
- `getBasket(basketId) → Basket`
- `getBasketNAV(basketId) → uint256`
- `xcmEnabled() → bool`
- `xcmPrecompile() → address`

#### Write Functions (via useBasketManager)
- `deposit(basketId) payable → uint256 tokensMinted` ✅ XCM dispatch
- `withdraw(basketId, tokenAmount) → void` ✅ XCM withdraw
- `rebalance(basketId) → void` ✅ PVM call
- `setXCMEnabled(enabled)` (owner only)

### Events (Monitored via useXCMStatus)
- `XCMMessageSent(paraId, messageHash, amount)`
- `XCMMessageFailed(paraId, reason)`
- `DeploymentDispatched(basketId, paraId, amount)`
- `DeploymentFailed(basketId, paraId, amount, reason)`
- `Deposited(basketId, user, amount, tokensMinted)`
- `Withdrawn(basketId, user, tokensBurned, amountOut)`

---

## XCM Integration Flow

### Deposit Flow
```
User clicks Deposit
    ↓
DepositForm.handleDeposit()
    ↓
useBasketManager.deposit(walletClient, basketId, amount)
    ↓
BasketManager.deposit{value: amount}(basketId)
    ↓
_executeDeployment(basketId, amount)
    ↓
For each allocation:
    _dispatchXCMDeposit(alloc, allocAmount)
        ↓
    XCM Precompile.send(destination, message)
        ↓
Emit XCMMessageSent(paraId, hash, amount)
    ↓
Frontend receives txHash
    ↓
XCMStatus shows: ⏳ Pending on Hydration, ⏳ Pending on Moonbeam...
```

### Withdraw Flow
```
User clicks Withdraw
    ↓
WithdrawForm.handleWithdraw()
    ↓
useBasketManager.withdraw(walletClient, basketId, tokenAmount)
    ↓
BasketManager.withdraw(basketId, tokenAmount)
    ↓
For each allocation:
    _dispatchXCMWithdraw(alloc, withdrawAmount, msg.sender)
        ↓
    XCM Precompile.send(destination, message)
        ↓
Emit XCMMessageSent(paraId, hash, amount)
    ↓
Transfer native PAS back to user
    ↓
Frontend shows per-chain status:
    ✓ Confirmed on Hydration
    ✓ Confirmed on Moonbeam
    ⏳ Pending on Acala
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_BASKET_MANAGER_ADDRESS` | BasketManager contract address |
| `VITE_BASKET_TOKEN_ADDRESS` | BasketToken address (from deployment) |
| `VITE_XCM_PRECOMPILE_ADDRESS` | XCM precompile: `0x000...0a0000` |
| `VITE_PVM_ENGINE_ADDRESS` | PVM engine precompile address |
| `VITE_NETWORK` | Network name: `paseo` |
| `VITE_RPC_URL` | RPC endpoint |
| `VITE_CHAIN_ID` | Chain ID: `420420417` |

---

## Summary

✅ **All functions properly integrated:**
- Deposit with XCM dispatch to 3 parachains
- Withdraw with XCM tracking per chain
- Rebalance with PVM engine integration
- Real-time XCM status monitoring
- Proper error handling and chain switching
- Explorer links for all transactions

**Status**: Ready for testing on Paseo!
