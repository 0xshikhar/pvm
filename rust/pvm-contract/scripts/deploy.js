import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { readFileSync } from "fs";
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL || "wss://westend-asset-hub-rpc.polkadot.io";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY environment variable not set");
    console.log("Usage: PRIVATE_KEY=0x... node scripts/deploy.js");
    process.exit(1);
  }

  const key = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : "0x" + PRIVATE_KEY;
  const ethAddress = new ethers.Wallet(key).address;
  console.log("Ethereum address:", ethAddress);

  console.log("Connecting to:", RPC_URL);
  const provider = new WsProvider(RPC_URL);
  const api = await ApiPromise.create({ provider });

  // Create keyring with ethereum type
  const keyring = new Keyring({ type: "ethereum" });
  const deployer = keyring.addFromUri(key);
  console.log("Deployer (Polkadot):", deployer.address);

  const contractBlob = readFileSync("./contract.polkavm");
  console.log("Contract size:", contractBlob.length, "bytes");

  // Step 1: Map the account first (required for Ethereum addresses)
  console.log("\n1. Mapping account...");
  try {
    const mapTx = api.tx.revive.mapAccount(
      { Sudo: null } // dispatch through Sudo for testnet
    );
    
    await new Promise((resolve, reject) => {
      mapTx.signAndSend(deployer, ({ events, status }) => {
        console.log("  Status:", status.type);
        if (status.isInBlock || status.isFinalized) {
          for (const { event } of events) {
            if (event.section === "revive" && event.method === "AccountMapped") {
              console.log("  ✓ Account mapped:", event.data[0].toString(), "->", event.data[1].toString());
            }
          }
          resolve();
        }
      }).catch(reject);
    });
  } catch (e) {
    console.log("  Account may already be mapped, continuing...");
  }

  // Step 2: Upload the code
  console.log("\n2. Uploading code...");
  const uploadTx = api.tx.revive.uploadCode(
    { storageDepositLimit: null },
    contractBlob
  );

  let codeHash = null;
  await new Promise((resolve, reject) => {
    uploadTx.signAndSend(deployer, ({ events, status }) => {
      console.log("  Status:", status.type);
      
      if (status.isInBlock || status.isFinalized) {
        for (const { event } of events) {
          if (event.section === "revive" && event.method === "CodeStored") {
            codeHash = event.data[0].toString();
            console.log("  ✓ Code hash:", codeHash);
          }
          if (event.section === "system" && event.method === "ExtrinsicFailed") {
            console.log("  ✗ Upload failed:", event.data[0].toString());
          }
        }
        resolve();
      }
    }).catch(reject);
  });

  if (!codeHash) {
    console.error("Failed to get code hash");
    process.exit(1);
  }

  // Step 3: Instantiate the contract
  console.log("\n3. Instantiating contract...");
  const instantiateTx = api.tx.revive.instantiate(
    0,                              // value (Balance)
    { gas: 10000000000 },           // weight_limit
    null,                           // storage_deposit_limit
    codeHash,                       // code_hash
    "0x00",                         // data (constructor selector)
    null                            // salt
  );

  await new Promise((resolve, reject) => {
    instantiateTx.signAndSend(deployer, ({ events, status }) => {
      console.log("  Status:", status.type);
      
      if (status.isInBlock || status.isFinalized) {
        for (const { event } of events) {
          if (event.section === "revive" && event.method === "Instantiated") {
            console.log("  ✓ Contract address:", event.data[1].toString());
          }
          if (event.section === "system" && event.method === "ExtrinsicFailed") {
            console.log("  ✗ Instantiate failed:", event.data[0].toString());
          }
        }
        resolve();
      }
    }).catch(reject);
  });

  await api.disconnect();
  console.log("\nDone!");
}

main().catch(console.error);
