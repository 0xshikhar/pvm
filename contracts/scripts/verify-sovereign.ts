import { ethers, network } from "hardhat";
import { createHash } from "crypto";

const HUB_PARA_ID = 1000;

const PARACHAINS: Record<string, { id: number; name: string; minBalance: string; explorer: string }> = {
  HYDRATION: {
    id: 2034,
    name: "Hydration",
    minBalance: "1",
    explorer: "https://hydration.subscan.io",
  },
  MOONBEAM: {
    id: 2004,
    name: "Moonbeam",
    minBalance: "1.5",
    explorer: "https://moonbase.subscan.io",
  },
  ACALA: {
    id: 2000,
    name: "Acala",
    minBalance: "1",
    explorer: "https://acala.subscan.io",
  },
};

function deriveSovereignAccount(contractAddress: string, paraId: number): string {
  const siblingContext = "SiblingChain";
  const paraIdBytes = Buffer.alloc(4);
  paraIdBytes.writeUInt32BE(HUB_PARA_ID, 0);
  const accountKey20 = "AccountKey20";
  const contractBytes = Buffer.from(contractAddress.slice(2), "hex");

  const data = Buffer.concat([
    Buffer.from(siblingContext),
    paraIdBytes,
    Buffer.from(accountKey20),
    contractBytes,
  ]);

  const hash = createHash("blake2b256").update(data).digest();
  return "0x" + hash.toString("hex");
}

async function checkBalance(address: string, chain: string): Promise<{ balance: bigint; formatted: string }> {
  try {
    const balance = await ethers.provider.getBalance(address);
    return { balance, formatted: ethers.formatEther(balance) };
  } catch (error) {
    console.error(`  Error checking ${chain} balance:`, (error as Error).message);
    return { balance: 0n, formatted: "Error" };
  }
}

async function main() {
  const basketManagerAddress = process.env.BASKET_MANAGER_ADDRESS;

  if (!basketManagerAddress) {
    console.error("Set BASKET_MANAGER_ADDRESS in .env or as environment variable");
    console.error("Usage: BASKET_MANAGER_ADDRESS=0x... npx hardhat run scripts/verify-sovereign.ts");
    process.exit(1);
  }

  console.log("=".repeat(70));
  console.log("Sovereign Account Verification");
  console.log("=".repeat(70));
  console.log("\nNetwork:", network.name);
  console.log("BasketManager:", basketManagerAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Checked by:", deployer.address);

  console.log("\n" + "-".repeat(70));
  console.log("Sovereign Accounts");
  console.log("-".repeat(70));

  const accounts: Record<string, { address: string; balance: string; status: string; needsFunding: boolean }> = {};

  for (const [name, chain] of Object.entries(PARACHAINS)) {
    const sovereignAddress = deriveSovereignAccount(basketManagerAddress, chain.id);
    const { formatted: balance, balance: balanceBn } = await checkBalance(sovereignAddress, name);
    const minBalance = ethers.parseEther(chain.minBalance);
    const needsFunding = balanceBn < minBalance;

    accounts[name] = {
      address: sovereignAddress,
      balance,
      status: needsFunding ? "NEEDS FUNDING" : "OK",
      needsFunding,
    };

    const statusColor = needsFunding ? "\x1b[33m" : "\x1b[32m";
    const reset = "\x1b[0m";

    console.log(`\n${name} (Para ${chain.id}):`);
    console.log(`  Address:     ${sovereignAddress}`);
    console.log(`  Balance:     ${balance} PAS`);
    console.log(`  Min Required: ${chain.minBalance} PAS`);
    console.log(`  Status:       ${statusColor}${accounts[name].status}${reset}`);
    console.log(`  Explorer:     ${chain.explorer}/account/${sovereignAddress}`);
  }

  console.log("\n" + "-".repeat(70));
  console.log("XCM Precompile Status");
  console.log("-".repeat(70));

  const xcmPrecompile = "0x0000000000000000000000000000000000000800";
  const xcmCode = await ethers.provider.getCode(xcmPrecompile);
  const hasXCM = xcmCode && xcmCode !== "0x";

  console.log("\nXCM Precompile:", xcmPrecompile);
  console.log("Status:", hasXCM ? "\x1b[32mDEPLOYED\x1b[0m" : "\x1b[31mNOT DEPLOYED\x1b[0m");
  if (hasXCM) {
    console.log("Code size:", xcmCode.length, "bytes");
  }

  console.log("\n" + "-".repeat(70));
  console.log("BasketManager Status");
  console.log("-".repeat(70));

  const managerCode = await ethers.provider.getCode(basketManagerAddress);
  console.log("\nBasketManager:", basketManagerAddress);
  console.log("Code deployed:", managerCode !== "0x" ? "\x1b[32mYES\x1b[0m" : "\x1b[31mNO\x1b[0m");

  if (managerCode !== "0x") {
    const BasketManager = await ethers.getContractAt("BasketManager", basketManagerAddress);
    const xcmEnabled = await BasketManager.xcmEnabled();
    const xcmConfigured = await BasketManager.xcmPrecompile();

    console.log("XCM Enabled:", xcmEnabled ? "\x1b[32mYES\x1b[0m" : "\x1b[33mNO\x1b[0m");
    console.log("XCM Precompile:", xcmConfigured);

    const nextBasketId = await BasketManager.nextBasketId();
    console.log("Total Baskets:", nextBasketId.toString());

    if (nextBasketId > 0n) {
      console.log("\nBaskets:");
      for (let i = 0; i < nextBasketId; i++) {
        const basket = await BasketManager.getBasket(i);
        console.log(`  [${i}] ${basket.name}`);
        console.log(`      Token: ${basket.token}`);
        console.log(`      Active: ${basket.active}`);
        console.log(`      Deposited: ${ethers.formatEther(basket.totalDeposited)} PAS`);
        console.log(`      Allocations: ${basket.allocations.length}`);
        for (const alloc of basket.allocations) {
          console.log(`        - Para ${alloc.paraId}: ${alloc.weightBps / 100}%`);
        }
      }
    }
  }

  console.log("\n" + "-".repeat(70));
  console.log("Summary");
  console.log("-".repeat(70));

  const allFunded = Object.values(accounts).every((a) => !a.needsFunding);
  const readyForXCM = hasXCM && allFunded;

  if (readyForXCM) {
    console.log("\n\x1b[32m✓ READY FOR MULTICHAIN OPERATIONS\x1b[0m");
    console.log("  - All sovereign accounts funded");
    console.log("  - XCM precompile deployed");
  } else {
    console.log("\n\x1b[33m⚠ NOT READY FOR MULTICHAIN OPERATIONS\x1b[0m");

    if (!hasXCM) {
      console.log("  - Deploy XCM precompile: npm run deploy:xcm-precompile");
    }

    const unfunded = Object.entries(accounts)
      .filter(([, a]) => a.needsFunding)
      .map(([name]) => name);

    if (unfunded.length > 0) {
      console.log(`  - Fund sovereign accounts: npm run fund:sovereign`);
      console.log(`    Missing: ${unfunded.join(", ")}`);
    }
  }

  console.log("\n" + "=".repeat(70));

  console.log("\n=== Quick Actions ===\n");

  console.log("1. Fund all sovereign accounts:");
  console.log("   cd contracts && npm run fund:sovereign\n");

  console.log("2. Deploy XCM precompile:");
  console.log("   cd contracts && npm run deploy:xcm-precompile\n");

  console.log("3. If XCM precompile deployed to different address:");
  console.log("   await basketManager.setXCMPrecompile('<address>')\n");

  console.log("4. Enable XCM:");
  console.log("   await basketManager.setXCMEnabled(true)\n");

  if (!readyForXCM) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
