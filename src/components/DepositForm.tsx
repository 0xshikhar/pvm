import { useState } from "react";
import { createWalletClient, http } from "viem";
import { WalletClient } from "viem";
import { useBasketManager } from "../hooks/useBasketManager";
import { polkadotHubTestnet } from "../config/contracts";

interface DepositFormProps {
  basketId: bigint;
  walletClient: WalletClient | null;
}

export function DepositForm({ basketId, walletClient }: DepositFormProps) {
  const [amount, setAmount] = useState("");
  const { deposit, isLoading, error } = useBasketManager();

  const allocation = [
    { chain: "Hydration LP", pct: 40 },
    { chain: "Moonbeam Lending", pct: 30 },
    { chain: "Acala Staking", pct: 30 },
  ];

  const handleDeposit = async () => {
    if (!walletClient || !amount) return;
    try {
      await deposit(walletClient, basketId, parseFloat(amount));
      setAmount("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Deposit DOT</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Amount (DOT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-300 mb-2">Your {amount} DOT will be deployed:</p>
            {allocation.map((a) => (
              <div key={a.chain} className="flex justify-between text-gray-400">
                <span>{a.chain}</span>
                <span>{((parseFloat(amount) * a.pct) / 100).toFixed(2)} DOT</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-400">{error}</p>}

        <button
          onClick={handleDeposit}
          disabled={isLoading || !amount || !walletClient}
          className="w-full py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Depositing..." : "Mint xDOT-LIQ Token"}
        </button>
      </div>
    </div>
  );
}
