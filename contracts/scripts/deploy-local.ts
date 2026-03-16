import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("Deploying mock contracts to local network...\n");

  // Deploy MockPVMEngine
  console.log("1. Deploying MockPVMEngine...");
  const MockPVMEngine = await ethers.getContractFactory("MockPVMEngine");
  const mockPVM = await MockPVMEngine.deploy();
  await mockPVM.waitForDeployment();
  const mockPVMAddress = await mockPVM.getAddress();
  console.log(`   MockPVMEngine deployed to: ${mockPVMAddress}`);

  // Deploy BasketManager
  console.log("\n2. Deploying BasketManager...");
  const BasketManager = await ethers.getContractFactory("BasketManager");
  const basketManager = await BasketManager.deploy();
  await basketManager.waitForDeployment();
  const basketManagerAddress = await basketManager.getAddress();
  console.log(`   BasketManager deployed to: ${basketManagerAddress}`);

  // Create a test basket
  console.log("\n3. Creating test basket...");
  const tx = await basketManager.createBasket(
    "xDOT Liquidity Basket",
    "xDOT-LIQ",
    [
      {
        paraId: 2034,
        protocol: "0x0000000000000000000000000000000000000001",
        weightBps: 4000,
        depositCall: "0x",
        withdrawCall: "0x",
      },
      {
        paraId: 2004,
        protocol: "0x0000000000000000000000000000000000000002",
        weightBps: 3000,
        depositCall: "0x",
        withdrawCall: "0x",
      },
      {
        paraId: 2000,
        protocol: "0x0000000000000000000000000000000000000003",
        weightBps: 3000,
        depositCall: "0x",
        withdrawCall: "0x",
      },
    ]
  );
  await tx.wait();
  console.log("   Basket created successfully!");

  // Get basket info
  const basket = await basketManager.getBasket(0);
  console.log(`   Basket Token: ${basket.token}`);

  // Save deployment info
  const deploymentInfo = {
    network: "hardhat",
    chainId: 31337,
    contracts: {
      MockPVMEngine: mockPVMAddress,
      BasketManager: basketManagerAddress,
      BasketToken: basket.token,
    },
    basketId: 0,
    timestamp: new Date().toISOString(),
  };

  writeFileSync(
    "./deployment-local.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✓ Deployment complete!");
  console.log("\nContract addresses:");
  console.log(`  PVM_ENGINE_ADDRESS: ${mockPVMAddress}`);
  console.log(`  BASKET_MANAGER_ADDRESS: ${basketManagerAddress}`);
  console.log(`\nUpdate your frontend .env with:`);
  console.log(`  VITE_BASKET_MANAGER_ADDRESS=${basketManagerAddress}`);
  console.log(`  VITE_PVM_ENGINE_ADDRESS=${mockPVMAddress}`);
  console.log(`  VITE_USE_MOCK_PVM=true`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
