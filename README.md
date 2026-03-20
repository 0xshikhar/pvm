# PolkaBasket

**The Cross-Chain DeFi Index + Social Investing Layer for Polkadot**

PolkaBasket transforms fragmented parachain liquidity into unified, social yield strategies. One deposit → diversified exposure across Hydration, Moonbeam, and Acala. Powered by XCM v4 and PolkaVM.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [Our Solution](#our-solution)
3. [Key Innovations](#key-innovations)
4. [System Architecture](#system-architecture)
5. [Live Demo](#live-demo)
6. [Testing Guide](#testing-guide)
7. [Deployment Addresses](#deployment-addresses)
8. [Quick Start](#quick-start)
9. [Future Roadmap](#future-roadmap)
10. [Team & Resources](#team--resources)

---

## The Problem

DeFi on Polkadot is powerful but fragmented. Users who want optimal yields must:

- Bridge assets manually between parachains
- Manage multiple wallets and UIs
- Monitor shifting APYs and risks in real-time
- Rebalance positions across chains constantly

**Current State of Polkadot DeFi:**

| Challenge | Impact |
|-----------|---------|
| Fragmented Liquidity | Capital trapped in individual parachains |
| Complex UX | 10+ steps to build a diversified position |
| Manual Rebalancing | Missing yield opportunities due to slow adjustments |
| No Discovery | Hard to find and compare strategies |

**Result:** Only advanced users can optimize. Retail users miss opportunities. Capital sits idle in silos.

---

## Our Solution

PolkaBasket introduces the **Basket Token** — a composable primitive that represents diversified cross-chain DeFi positions.

### How It Works

**User Journey:**

1. **Discover** — Swipe through curated baskets (stablecoin yields, high-growth alpha, balanced indices)
2. **Deposit** — Single DOT deposit activates multi-parachain deployment
3. **Receive** — Get liquid basket token representing fractional ownership
4. **Earn** — Automated rebalancing via PolkaVM maximizes risk-adjusted yield
5. **Share** — Publish custom strategies, invite friends, earn referral rewards

### Value Proposition

| For Users | For Polkadot Ecosystem |
|-----------|----------------------|
| 1-click diversified exposure | Unified liquidity layer across parachains |
| Automatic optimization | Composable primitives for other protocols |
| Social discovery & sharing | Viral growth through creator incentives |
| Lower gas costs vs manual bridging | Higher TVL retention on Asset Hub |

---

## Key Innovations

| Feature | Technology | Impact |
|---------|-----------|---------|
| **Native Cross-Chain** | XCM v4 | No bridges. Secure asynchronous execution across parachains. |
| **AI Optimization** | PolkaVM + Rust | Institutional-grade risk-adjusted allocation on-chain. |
| **Unified Exposure** | ERC-20 Basket Token | One token for diversified yield. Tradeable, collateralizable. |
| **Social Investing** | React + Web3 | Collaborative finance. Viral growth through referrals. |

### Technical Differentiation

**vs. Traditional Yield Aggregators:**
- Not limited to single chain
- Native XCM (not third-party bridges)
- On-chain optimization engine
- Non-reverting XCM (deposits always succeed)

**vs. Index Tokens:**
- Active rebalancing vs passive tracking
- Real underlying positions (not synthetic)
- Cross-chain composition
- Social sharing layer

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Baskets    │  │   Create     │  │     Portfolio        │   │
│  │   (Swipe)    │  │   Basket     │  │     Dashboard        │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼──────────────────┼─────────────────────┼───────────────┘
          │                  │                     │
          └──────────────────┴─────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SMART CONTRACT LAYER                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  BasketManager.sol                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  createBasket│  │   deposit    │  │   rebalance    │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │   │
│  │         │                 │                  │           │   │
│  │         ▼                 ▼                  ▼           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │           XCM Message Dispatcher                    │ │   │
│  │  │   Build SCALE messages → Call Precompile            │ │   │
│  │  └──────────────────────┬──────────────────────────────┘ │   │
│  └─────────────────────────┼────────────────────────────────┘   │
│                            │                                     │
│  ┌─────────────────────────┴────────────────────────────────┐   │
│  │                  BasketToken.sol (ERC-20)                │   │
│  │              Mint on deposit / Burn on withdraw          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ XCM v4 Messages
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POLKADOT RELAY CHAIN                          │
│                      (Message Routing)                           │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      HYDRATION           │    │      MOONBEAM            │
│      (Para 2034)         │    │      (Para 2004)         │
│                          │    │                          │
│  ┌──────────────────┐   │    │  ┌──────────────────┐   │
│  │   LP Pools       │   │    │  │   Lending        │   │
│  │   Omnipool       │◄──┘    │  │   Markets        │◄──┘
│  │   40% allocation │          │  │   30% allocation │
│  └──────────────────┘          │  └──────────────────┘
└──────────────────────────┘    └──────────────────────────┘
               │
               │
               ▼
┌──────────────────────────┐
│      ACALA               │
│      (Para 2000)         │
│                          │
│  ┌──────────────────┐   │
│  │   Liquid         │   │
│  │   Staking        │   │
│  │   30% allocation │   │
│  └──────────────────┘   │
└──────────────────────────┘
```

### Deposit Flow Architecture

```
Step 1: User Initiates Deposit
─────────────────────────────────
User → Frontend → Wallet Sign
Amount: 10 PAS
Basket: xDOT-LIQ (ID: 0)

Step 2: Contract Processing
─────────────────────────────────
BasketManager.deposit(0)
  ├── Validate amount > 0
  ├── Calculate allocations:
  │     Hydration: 4 PAS (40%)
  │     Moonbeam:  3 PAS (30%)
  │     Acala:     3 PAS (30%)
  ├── Mint 10 xDOT-LIQ tokens
  └── Emit Deposited event

Step 3: XCM Dispatch (Non-Reverting)
─────────────────────────────────
For each allocation:
  Build XCM message (SCALE v5)
  Call XCM Precompile
  ├─ Success: Emit DeploymentDispatched
  └─ Failure: Emit DeploymentFailed
     (Transaction continues!)

Step 4: Cross-Chain Settlement
─────────────────────────────────
XCM Executor validates message
Fees deducted from sovereign account
Assets transferred to destination
Arrive in parachain sovereign account

Step 5: User Confirmation
─────────────────────────────────
Frontend shows:
✓ Tokens minted: 10 xDOT-LIQ
✓ XCM messages sent: 3
⚠ Allocation: 40/30/30
🔗 Explorer link
```

### Rebalancing Architecture

```
Trigger: Time-based or Threshold-based
─────────────────────────────────────────

Input Collection:
├─ Current weights: [4000, 3000, 3000]
├─ Total deposited: 1,000 PAS
└─ Para IDs: [2034, 2004, 2000]
         │
         ▼
┌──────────────────────────────────────┐
│        PolkaVM Engine                │
│     (Rust RISC-V Bytecode)           │
│                                      │
│  Algorithm:                          │
│  1. Fetch yields per parachain       │
│  2. Calculate risk scores            │
│  3. Optimize for Sharpe ratio        │
│  4. Return target weights            │
└──────────────┬───────────────────────┘
               │
               ▼
Output: New weights [3500, 3500, 3000]

Drift Check:
├─ Hydration: |4000-3500| = 500 bps
├─ Moonbeam:  |3000-3500| = 500 bps  
└─ Acala:     |3000-3000| = 0 bps

Threshold: 200 bps
Action: Update Hydration and Moonbeam
```

### Social Layer Architecture

```
User Creates Custom Basket
──────────────────────────────────
1. Define strategy
   ├─ Name: "Alpha Maxi"
   ├─ Protocols: Hydration LP, Moonbeam Leverage
   └─ Weights: 60% / 40%

2. Save to localStorage
   ├─ Status: "Draft" or "Pending"
   └─ ID: local-timestamp-random

3. Appears in UI
   ├─ Listings page (with "Pending Approval" badge)
   ├─ Explore page (swipeable)
   └─ User's portfolio

4. Sharing Flow
   ├─ Generate share link
   ├─ Social platforms: Twitter, Telegram, WhatsApp
   └─ Referral tracking

5. Community Growth
   ├─ Others view shared basket
   ├─ Can deposit (if approved)
   └─ Creator earns incentives
```

---

## Live Demo

### Pre-Deployed Contracts (Paseo Testnet)

Test instantly without deploying:

| Contract | Address | Purpose |
|----------|---------|---------|
| **BasketManager** | `0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2` | Core protocol logic |
| **BasketToken** | `0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B` | xDOT-LIQ basket token |
| **XCM Precompile** | `0x00000000000000000000000000000000000a0000` | Cross-chain messaging |

**Network:** Paseo Asset Hub (Chain ID: 420420417)

### Available Baskets

| Basket ID | Name | Strategy | Allocations |
|-----------|------|----------|-------------|
| 0 | xDOT-Liquidity | Conservative | Hydration LP 40%, Moonbeam Lending 30%, Acala Staking 30% |
| 1 | Yield Maximizer | Moderate | Hydration Stable 50%, Moonbeam Liquid Staking 50% |
| 2 | High Growth Alpha | Aggressive | Moonbeam Leverage 60%, Acala Leverage 40% |
| 3 | Balanced Diversifier | Balanced | Hydration LP 34%, Moonbeam Lending 33%, Acala Staking 33% |

### 3-Minute Demo Flow

1. **Get test PAS:** https://faucet.polkadot.io/ → Select "Paseo (Asset Hub)"
2. **Open app:** Connect wallet at deployed URL
3. **Deposit:** Select "xDOT Liquidity Basket" → Deposit 5 PAS
4. **Verify:** Check token balance and XCM status
5. **Create:** Try custom basket at /create-basket
6. **Share:** Use share buttons on basket cards

⚠️ XCM is simulated on Paseo (network limitation). For real XCM, see Local Testing section.

---

## Testing Guide

### Option 1: Quick Test (Paseo Testnet)

**Prerequisites:** MetaMask/SubWallet with test PAS tokens

1. Set environment:
   ```bash
   VITE_NETWORK=paseo
   VITE_BASKET_MANAGER_ADDRESS=0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2
   VITE_XCM_MODE=testnet
   ```

2. Install and run:
   ```bash
   npm install && npm run dev
   ```

3. Open http://localhost:5173 and test deposit/withdraw

**Note:** XCM events are simulated. Funds stay on Asset Hub (safe, just not cross-chain yet).

### Option 2: Full XCM Testing (Local Chopsticks)

For real cross-chain execution:

**Requirements:**
- 3 terminal windows
- Chopsticks installed
- 16GB+ RAM recommended

**Setup Steps:**

1. **Start Asset Hub fork** (Terminal 1)
   - Forks Paseo at latest block
   - Exposes WebSocket at ws://localhost:8000

2. **Start Hydration fork** (Terminal 2)
   - Forks Hydration testnet
   - WebSocket at ws://localhost:8001

3. **Start Moonbeam fork** (Terminal 3)
   - Forks Moonbase Alpha
   - WebSocket at ws://localhost:8002

4. **Configure cross-chain**
   - Connect Asset Hub to siblings
   - Register asset mappings
   - Enable XCM channels

5. **Deploy contracts**
   - Deploy to Asset Hub fork
   - Create 4 test baskets
   - Initialize allocations

6. **Fund sovereign accounts**
   - Calculate sovereign addresses
   - Fund with 100 PAS each
   - Verify balances

7. **Configure frontend**
   - Set VITE_XCM_MODE=local
   - Update contract addresses
   - Point RPC to localhost:8000

8. **Test real XCM**
   - Deposit triggers actual cross-chain transfers
   - Verify balances on destination chains
   - Test withdrawal flows

See docs/XCM_TESTING.md for complete step-by-step walkthrough.

---

## Deployment Addresses

### Paseo Testnet (Active)

| Component | Address | Status |
|-----------|---------|--------|
| BasketManager | `0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2` | ✅ Active |
| xDOT-LIQ Token | `0xD9FEBB375aCE5226AF1AA4146988Af2BDB8A1e8B` | ✅ Active |
| PVM Engine | `0x09dDF8f56981deC60e468e2B85194102a3e2E124` | ✅ Active |

**Explorer:** https://blockscout-testnet.polkadot.io

**Verification:**
- Contract code verified on Blockscout
- All functions tested and working
- Gas optimized for Paseo conditions

### Local Development

Deploy fresh contracts:

```bash
cd contracts
npm run deploy:local    # Hardhat local
npm run deploy:paseo    # Paseo testnet
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- MetaMask or SubWallet

### Install & Run

```bash
git clone <repo-url>
cd tele-basket
npm install
npm run dev
```

Open http://localhost:5173

### Environment Configuration

Create .env file:

```bash
# For Paseo testing (pre-deployed contracts)
VITE_NETWORK=paseo
VITE_BASKET_MANAGER_ADDRESS=0x96CA4a5Cb6Cf56F378aEe426567d330f1CFDEaA2
VITE_XCM_MODE=testnet

# For local XCM testing (requires Chopsticks setup)
# VITE_XCM_MODE=local
# VITE_BASKET_MANAGER_ADDRESS=<your-deployed-address>
```

---

## Future Roadmap

### Phase 1: Core Protocol (Complete ✓)
- ✅ BasketManager with deposit/withdraw
- ✅ XCM integration framework
- ✅ 4 initial baskets deployed
- ✅ Basic frontend with deposit flow

### Phase 2: Optimization & UX (Current)
- 🔄 Real PolkaVM engine deployment
- 🔄 Automated rebalancing triggers
- 🔄 Portfolio analytics dashboard
- 🔄 Mobile-responsive UI improvements

### Phase 3: Social Layer (Q2 2026)
- 📋 On-chain basket registry for custom strategies
- 📋 Creator incentive program
- 📋 Referral tracking and rewards
- 📋 Leaderboards for top baskets

### Phase 4: Advanced Strategies (Q3 2026)
- 📋 Leveraged baskets with risk management
- 📋 Options-integrated yield strategies
- 📋 AI-managed dynamic allocation
- 📋 Integration with lending protocols

### Phase 5: Ecosystem Expansion (Q4 2026)
- 📋 Support for 10+ parachains
- 📋 Cross-chain basket tokens (XCM teleport)
- 📋 Institutional custody integration
- 📋 Governance token launch

### Technical Debt & Improvements
- 🔄 Move from MockPVM to real Rust engine
- 🔄 Implement full XCM v5 when available
- 🔄 Add comprehensive event indexing
- 🔄 Security audit and formal verification

---

## What Makes PolkaBasket Different

**Not just aggregation — social coordination:**

- Users create and share custom strategies
- Community-driven basket discovery
- Referral incentives for growing TVL
- Collaborative investing experience

**Technical differentiation:**

- Native XCM (not third-party bridges)
- On-chain Rust optimization (PolkaVM)
- Composable basket tokens
- Non-reverting XCM (deposits always succeed)

**Ecosystem value:**

- Brings liquidity to partner parachains
- Reduces fragmentation
- Creates composable primitives
- Onboards retail users with simple UX

---

## Vision

PolkaBasket aims to become Polkadot's default asset management and discovery layer — a permissionless marketplace where anyone can create, share, and invest in curated DeFi baskets.

From stablecoin indices to AI-managed alpha strategies. From individual yield farming to collaborative community investing.

**The Future We See:**

- A 16-year-old creates a "Meme Coin Basket" that goes viral
- A DAO manages treasury across 10 chains with one token
- An AI agent continuously rebalances based on market conditions
- Communities pool resources into shared strategies

**PolkaBasket — Simplifying DeFi. Unifying Polkadot. Socializing Yield.**

---

## Team & Resources

Built for the Polkadot Hackathon by OpenGuild.

**Key Documentation:**
- XCM Testing Guide: `docs/XCM_TESTING.md`
- PVM Integration: `docs/PVM_INTEGRATION.md`
- Contract Details: `docs/CONTRACTS.md`
- Architecture: `docs/ARCHITECTURE.md`

**Resources:**
- PolkaVM Docs: https://docs.polkadot.com/develop/smart-contracts/
- XCM Docs: https://docs.polkadot.com/develop/interoperability/xcm/
- Viem: https://viem.sh/

**License:** MIT
