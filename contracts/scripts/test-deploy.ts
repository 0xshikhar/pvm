import { ethers } from "hardhat";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("Error: PRIVATE_KEY not set");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider("https://westend-asset-hub-eth-rpc.polkadot.io");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Deploying with:", wallet.address);

  // Deploy simple contract first - just to test
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage", wallet);
  const ss = await SimpleStorage.deploy({
    gasLimit: 500000,
  });
  
  await ss.waitForDeployment();
  console.log("SimpleStorage deployed to:", await ss.getAddress());
}

main().catch(console.error);
