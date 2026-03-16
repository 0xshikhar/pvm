/** Hardhat config for contracts/ (used when running from this directory) */
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@parity/hardhat-polkadot";
import "dotenv/config";
import "./tasks/deploy";

const privateKey = process.env.PRIVATE_KEY || "";
const accounts = /^0x[0-9a-fA-F]{64}$/.test(privateKey) ? [privateKey] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    paseoAssetHub: {
      url: process.env.PASEO_RPC_URL || "https://services.polkadothub-rpc.com/testnet",
      chainId: 420420417,
      accounts,
      polkadot: true,
    },
    westendAssetHub: {
      url: process.env.WESTEND_RPC_URL || "wss://westend-asset-hub-rpc.polkadot.io",
      chainId: 420420421,
      accounts,
      polkadot: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
