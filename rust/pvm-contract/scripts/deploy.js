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
  
  // Use noInitWarn to suppress init warnings
  const api = await ApiPromise.create({ 
    provider,
    noInitWarn: true 
  });

  // Create keyring with ethereum type
  const keyring = new Keyring({ type: "ethereum", ss58Format: 0 });
  const deployer = keyring.addFromUri(key);
  console.log("Deployer (Polkadot):", deployer.address);

  const contractBlob = readFileSync("./contract.polkavm");
  console.log("Contract size:", contractBlob.length, "bytes");

  // Use instantiateWithCode to upload and instantiate in one transaction
  console.log("\nDeploying contract...");
  const instantiateTx = api.tx.revive.instantiateWithCode(
    0,                              // value (Balance)
    { gas: 10000000000 },           // weight_limit
    null,                           // storage_deposit_limit
    contractBlob,                   // code
    "0x00",                        // data (constructor selector)
    null                            // salt
  );

  await new Promise((resolve, reject) => {
    instantiateTx.signAndSend(deployer, ({ events, status }) => {
      console.log("  Status:", status.type);
      
      if (status.isInBlock || status.isFinalized) {
        for (const { event } of events) {
          console.log("  Event:", event.section + "." + event.method);
          if (event.section === "revive" && event.method === "Instantiated") {
            console.log("  ✓ Contract address:", event.data[1].toString());
          }
          if (event.section === "system" && event.method === "ExtrinsicFailed") {
            console.log("  ✗ Extrinsic failed:", JSON.stringify(event.data.toJSON()));
          }
        }
        resolve();
      }
    }).catch((err) => {
      console.error("Error:", err.message);
      reject(err);
    });
  });

  await api.disconnect();
  console.log("\nDone!");
}

main().catch(console.error);
