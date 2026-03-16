import { task } from "hardhat/config";

task("deploy", "Deploys BasketManager contract")
  .setAction(async (_, hre) => {
    const network = hre.network.name;
    console.log(`Deploying to network: ${network}`);
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const Factory = await hre.ethers.getContractFactory("BasketManager", deployer);
    const manager = await Factory.deploy();
    await manager.waitForDeployment();
    const managerAddress = await manager.getAddress();
    console.log("BasketManager deployed to:", managerAddress);

    const tx = await manager.createBasket(
      "xDOT Liquidity Basket",
      "xDOT-LIQ",
      [
        { paraId: 2034, protocol: "0x0000000000000000000000000000000000000001", weightBps: 4000, depositCall: "0x", withdrawCall: "0x" },
        { paraId: 2004, protocol: "0x0000000000000000000000000000000000000002", weightBps: 3000, depositCall: "0x", withdrawCall: "0x" },
        { paraId: 2000, protocol: "0x0000000000000000000000000000000000000003", weightBps: 3000, depositCall: "0x", withdrawCall: "0x" },
      ]
    );
    await tx.wait();
    console.log("xDOT-LIQ basket created!");

    console.log(`\nContract Address: ${managerAddress}`);
    console.log(`Network: ${network}`);
  });
