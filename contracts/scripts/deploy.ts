import { ethers, network, config } from "hardhat";

async function main() {
  console.log("Deploying to:", network.name);

  let deployer;
  if (network.name === "hardhat") {
    [deployer] = await ethers.getSigners();
  } else {
    const networkConfig = config.networks[network.name] as any;
    const accounts = networkConfig?.accounts as string[] | undefined;
    
    const privateKey = accounts?.[0] || process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error("Error: No private key found for network:", network.name);
      console.log("Set PRIVATE_KEY environment variable");
      process.exit(1);
    }
    const provider = ethers.getDefaultProvider(networkConfig.url as string);
    deployer = new ethers.Wallet(privateKey, provider);
  }
  
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("BasketManager", deployer);
  
  const manager = await Factory.deploy();
  
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("BasketManager deployed to:", managerAddress);

  const tx = await manager.createBasket(
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
  console.log("xDOT-LIQ basket created successfully!");
  console.log("\nUpdate your frontend config with:");
  console.log(`BASKET_MANAGER_ADDRESS = "${managerAddress}"`);
  console.log(`NETWORK = "${network.name}"`);
}

main().catch(console.error);
