import { useState } from "react";
import { Link } from "react-router-dom";

interface Position {
  id: bigint;
  name: string;
  symbol: string;
  deposited: string;
  tokens: string;
  value: string;
  pnl: string;
  pnlPercent: string;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: 0n,
    name: "xDOT Liquidity Basket",
    symbol: "xDOT-LIQ",
    deposited: "100.00",
    tokens: "100.00",
    value: "102.00",
    pnl: "+2.00",
    pnlPercent: "+2.00%",
  },
];

export function PortfolioPage() {
  const [positions] = useState<Position[]>(MOCK_POSITIONS);

  const totalValue = positions.reduce((acc, p) => acc + parseFloat(p.value), 0);
  const totalPnL = positions.reduce((acc, p) => acc + parseFloat(p.pnl), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio</h1>
            <p className="text-gray-400">Track your basket positions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-gray-800 rounded-2xl p-6 border border-blue-700/50">
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-3xl font-bold text-white">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total P&L</p>
            <p className={`text-3xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Positions</p>
            <p className="text-3xl font-bold text-white">{positions.length}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Avg. APY</p>
            <p className="text-3xl font-bold text-blue-400">12.4%</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Positions</h2>
          </div>
          
          {positions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">You don't have any positions yet.</p>
              <Link 
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Browse Baskets
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left text-gray-400 font-medium px-6 py-4">Basket</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Deposited</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Tokens</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Value</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">P&L</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id.toString()} className="border-t border-gray-700 hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{position.name}</p>
                          <p className="text-gray-400 text-sm">{position.symbol}</p>
                        </div>
                      </td>
                      <td className="text-right px-6 py-4 text-white">
                        {position.deposited} DOT
                      </td>
                      <td className="text-right px-6 py-4 text-white">
                        {position.tokens}
                      </td>
                      <td className="text-right px-6 py-4 text-white font-medium">
                        ${position.value}
                      </td>
                      <td className="text-right px-6 py-4">
                        <span className={parseFloat(position.pnl) >= 0 ? "text-green-400" : "text-red-400"}>
                          {position.pnl} ({position.pnlPercent})
                        </span>
                      </td>
                      <td className="text-right px-6 py-4">
                        <Link
                          to={`/basket/${position.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left text-gray-400 font-medium px-6 py-4">Type</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-4">Basket</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Amount</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Status</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Deposit", basket: "xDOT-LIQ", amount: "50.00 DOT", status: "Confirmed", time: "2 hours ago" },
                    { type: "Deposit", basket: "xDOT-LIQ", amount: "50.00 DOT", status: "Confirmed", time: "1 day ago" },
                    { type: "Rebalance", basket: "xDOT-LIQ", amount: "-", status: "Confirmed", time: "3 days ago" },
                  ].map((tx, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "Deposit" ? "bg-green-500/20 text-green-400" :
                          tx.type === "Withdraw" ? "bg-red-500/20 text-red-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{tx.basket}</td>
                      <td className="text-right px-6 py-4 text-white">{tx.amount}</td>
                      <td className="text-right px-6 py-4">
                        <span className="text-green-400">✓ {tx.status}</span>
                      </td>
                      <td className="text-right px-6 py-4 text-gray-400">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
