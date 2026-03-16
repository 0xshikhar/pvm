import { ethers } from "hardhat";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://westend-asset-hub-eth-rpc.polkadot.io");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "WND");
}

main().catch(console.error);
