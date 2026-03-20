import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const privateKey = process.env.PRIVATE_KEY || "";
const accounts = /^0x[0-9a-fA-F]{64}$/.test(privateKey) ? [privateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "berlin",
    },
  },
  paths: {
    root: ".",
    sources: "contracts/contracts",
    tests: "contracts/test",
  },
  networks: {
    paseo: {
      url: process.env.VITE_RPC_URL || "https://eth-rpc-testnet.polkadot.io",
      chainId: 420420417,
      accounts,
    },
    polkadotHub: {
      url: process.env.VITE_RPC_URL || "https://eth-rpc-testnet.polkadot.io",
      chainId: 420420417,
      accounts,
    },
    chopsticks: {
      url: "http://localhost:8545",
      chainId: 420420417,
      accounts,
    },
  },
};

export default config;
