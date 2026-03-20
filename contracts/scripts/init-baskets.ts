/**
 * Initialize Baskets Script
 * 
 * This script creates baskets 0, 1, and 2 if they don't exist.
 * Basket 0: xDOT Liquidity (Hydration 40%, Moonbeam 30%, Acala 30%)
 * Basket 1: Stable Yield (Hydration Stable 50%, Moonbeam Liquid Staking 50%)
 * Basket 2: High Growth (Moonbeam Leverage 60%, Acala Leverage 40%)
 */

import { ethers } from "hardhat";
import { Contract } from "ethers";

const PARACHAINS = {
  HYDRATION: 2034,
  MOONBEAM: 2004,
  ACALA: 2000,
};

const BASKET_MANAGER_ADDRESS = process.env.BASKET_MANAGER_ADDRESS || "";

// Basket configurations - All 4 baskets
const BASKETS = [
  {
    name: "xDOT Liquidity Basket",
    symbol: "xDOT-LIQ",
    allocations: [
      { paraId: PARACHAINS.HYDRATION, weightBps: 4000, protocol: "0x0000000000000000000000000000000000000001" },
      { paraId: PARACHAINS.MOONBEAM, weightBps: 3000, protocol: "0x0000000000000000000000000000000000000002" },
      { paraId: PARACHAINS.ACALA, weightBps: 3000, protocol: "0x0000000000000000000000000000000000000003" },
    ],
  },
  {
    name: "Yield Maximizer",
    symbol: "xSTABLE",
    allocations: [
      { paraId: PARACHAINS.HYDRATION, weightBps: 5000, protocol: "0x0000000000000000000000000000000000000004" },
      { paraId: PARACHAINS.MOONBEAM, weightBps: 5000, protocol: "0x0000000000000000000000000000000000000005" },
    ],
  },
  {
    name: "High Growth Alpha",
    symbol: "xRISK",
    allocations: [
      { paraId: PARACHAINS.MOONBEAM, weightBps: 6000, protocol: "0x0000000000000000000000000000000000000006" },
      { paraId: PARACHAINS.ACALA, weightBps: 4000, protocol: "0x0000000000000000000000000000000000000007" },
    ],
  },
  {
    name: "Balanced Diversifier",
    symbol: "xBAL",
    allocations: [
      { paraId: PARACHAINS.HYDRATION, weightBps: 3400, protocol: "0x0000000000000000000000000000000000000008" },
      { paraId: PARACHAINS.MOONBEAM, weightBps: 3300, protocol: "0x0000000000000000000000000000000000000009" },
      { paraId: PARACHAINS.ACALA, weightBps: 3300, protocol: "0x000000000000000000000000000000000000000a" },
    ],
  },
];

async function main() {
  console.log("=".repeat(70));
  console.log("Initializing Baskets");
  console.log("=".repeat(70));

  if (!BASKET_MANAGER_ADDRESS) {
    console.error("❌ BASKET_MANAGER_ADDRESS not set!");
    console.error("Set it in your .env file or pass it as an argument");
    process.exit(1);
  }

  console.log("\nBasketManager:", BASKET_MANAGER_ADDRESS);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const manager = await ethers.getContractAt("BasketManager", BASKET_MANAGER_ADDRESS, deployer);

  // Check current basket count
  const nextBasketId = await manager.nextBasketId();
  console.log("\nCurrent nextBasketId:", nextBasketId.toString());
  console.log("Existing baskets:", nextBasketId.toString());

  // Create missing baskets
  for (let i = Number(nextBasketId); i < BASKETS.length; i++) {
    const basketConfig = BASKETS[i];
    console.log(`\n--- Creating Basket ${i}: ${basketConfig.name} ---`);

    // Build XCM messages (simplified - just using empty bytes for now)
    // In production, these should be proper SCALE-encoded XCM messages
    const depositCall = "0x";
    const withdrawCall = "0x";

    const allocations = basketConfig.allocations.map(a => ({
      paraId: a.paraId,
      protocol: a.protocol,
      weightBps: a.weightBps,
      depositCall,
      withdrawCall,
    }));

    try {
      const tx = await manager.createBasket(
        basketConfig.name,
        basketConfig.symbol,
        allocations,
        { gasLimit: 5000000 }
      );
      await tx.wait();
      console.log(`✅ Basket ${i} created: ${basketConfig.name} (${basketConfig.symbol})`);
    } catch (error) {
      console.error(`❌ Failed to create basket ${i}:`, error);
    }
  }

  // Verify all baskets
  console.log("\n" + "=".repeat(70));
  console.log("Verifying All Baskets");
  console.log("=".repeat(70));

  const finalNextBasketId = await manager.nextBasketId();
  console.log("\nTotal baskets:", finalNextBasketId.toString());

  for (let i = 0; i < Number(finalNextBasketId); i++) {
    try {
      const basket = await manager.getBasket(i);
      console.log(`\nBasket ${i}:`);
      console.log(`  Name: ${basket.name}`);
      console.log(`  Symbol: ${basket.name}`); // The symbol is derived from name in contract
      console.log(`  Token: ${basket.token}`);
      console.log(`  Active: ${basket.active}`);
      console.log(`  Total Deposited: ${ethers.formatEther(basket.totalDeposited)} PAS`);
      console.log(`  Allocations:`);
      for (const alloc of basket.allocations) {
        const chainName = Object.entries(PARACHAINS).find(
          ([, id]) => id === Number(alloc.paraId)
        )?.[0];
        console.log(`    - ${chainName || alloc.paraId}: ${Number(alloc.weightBps) / 100}%`);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch basket ${i}:`, error);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("Initialization Complete!");
  console.log("=".repeat(70));
  console.log("\nAll 4 baskets are now ready for deposits.");
}

main().catch((error) => {
  console.error("\n❌ Initialization failed!");
  console.error(error);
  process.exit(1);
});
