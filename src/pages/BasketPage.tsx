import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useBasketManager, Basket } from "../hooks/useBasketManager";
import { formatEther } from "viem";

interface Allocation {
  chain: string;
  weight: number;
  color: string;
}

const BASKET_DATA: Record<string, { 
  name: string; 
  symbol: string;
  description: string;
  allocations: Allocation[];
  apy: string;
  risk: "Low" | "Medium" | "High";
}> = {
  "0": {
    name: "xDOT Liquidity Basket",
    symbol: "xDOT-LIQ",
    description: "Diversified liquidity provision across top Polkadot DeFi protocols. Earn LP fees and staking rewards.",
    allocations: [
      { chain: "Hydration LP", weight: 40, color: "#E6007A" },
      { chain: "Moonbeam Lending", weight: 30, color: "#53CBC9" },
      { chain: "Acala Staking", weight: 30, color: "#FF4B4B" },
    ],
    apy: "12.4%",
    risk: "Medium",
  },
  "1": {
    name: "Stable Yield Basket",
    symbol: "xSTABLE",
    description: "Focus on stablecoin yields with minimal impermanent loss risk.",
    allocations: [
      { chain: "Hydration Stable", weight: 50, color: "#E6007A" },
      { chain: "Moonbeam Liquid Staking", weight: 50, color: "#53CBC9" },
    ],
    apy: "8.2%",
    risk: "Low",
  },
  "2": {
    name: "High Risk Basket",
    symbol: "xRISK",
    description: "Leveraged positions for maximum yield. High risk of liquidation.",
    allocations: [
      { chain: "Moonbeam Leverage", weight: 60, color: "#53CBC9" },
      { chain: "Acala Leverage", weight: 40, color: "#FF4B4B" },
    ],
    apy: "24.8%",
    risk: "High",
  },
};

export function BasketPage() {
  const { id } = useParams<{ id: string }>();
  const basketId = id ? BigInt(id) : 0n;
  const { getBasket, getBasketNAV } = useBasketManager();
  
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [basketData, setBasketData] = useState(BASKET_DATA["0"]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [userBalance, setUserBalance] = useState("0");
  const [userDeposit, setUserDeposit] = useState("0");

  useEffect(() => {
    if (id && BASKET_DATA[id]) {
      setBasketData(BASKET_DATA[id]);
    }
  }, [id]);

  const riskColors = {
    Low: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    High: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Baskets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{basketData.name}</h1>
                  <p className="text-gray-400">{basketData.symbol}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors[basketData.risk]}`}>
                    {basketData.risk} Risk
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{basketData.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">APY</p>
                  <p className="text-2xl font-bold text-green-400">{basketData.apy}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">TVL</p>
                  <p className="text-2xl font-bold text-white">$1.25M</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Token Price</p>
                  <p className="text-2xl font-bold text-white">1.02 DOT</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-3">Current Allocation</p>
                <AllocationChart allocations={basketData.allocations} />
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab("deposit")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "deposit"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "withdraw"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Withdraw
                </button>
              </div>

              {activeTab === "deposit" ? (
                <DepositForm 
                  basketId={basketId} 
                  amount={depositAmount}
                  setAmount={setDepositAmount}
                  allocations={basketData.allocations}
                />
              ) : (
                <WithdrawForm 
                  basketId={basketId}
                  amount={withdrawAmount}
                  setAmount={setWithdrawAmount}
                  userBalance={userBalance}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <UserPositionCard 
              userDeposit={userDeposit}
              tokenSymbol={basketData.symbol}
            />

            <XCMStatusCard />

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Basket Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain</span>
                  <span className="text-white">Polkadot Hub</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Protocol</span>
                  <span className="text-white">PolkaVM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token</span>
                  <span className="text-white">{basketData.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Deposit</span>
                  <span className="text-white">1 DOT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllocationChart({ allocations }: { allocations: Allocation[] }) {
  let cumulative = 0;
  
  const arcs = allocations.map((alloc) => {
    const startAngle = (cumulative / 100) * 360;
    cumulative += alloc.weight;
    const endAngle = (cumulative / 100) * 360;
    return { ...alloc, startAngle, endAngle };
  });

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={describeArc(arc.startAngle, arc.endAngle)}
            fill={arc.color}
            stroke="#1f2937"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="50" cy="50" r="20" fill="#1f2937" />
      </svg>
      <div className="flex-1 space-y-2">
        {allocations.map((alloc, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: alloc.color }}
              />
              <span className="text-gray-300">{alloc.chain}</span>
            </div>
            <span className="text-white font-medium">{alloc.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepositForm({ 
  basketId, 
  amount, 
  setAmount,
  allocations 
}: { 
  basketId: bigint;
  amount: string;
  setAmount: (v: string) => void;
  allocations: Allocation[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAmount("");
    }, 2000);
  };

  const handleMax = () => {
    setAmount("100");
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2">Amount (DOT)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleMax}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {amount && parseFloat(amount) > 0 && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <p className="text-gray-400 text-sm mb-3">Your deposit will be allocated to:</p>
          <div className="space-y-2">
            {allocations.map((alloc, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{alloc.chain}</span>
                <span className="text-white">
                  {((parseFloat(amount) * alloc.weight) / 100).toFixed(4)} DOT
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleDeposit}
        disabled={isLoading || !amount || parseFloat(amount) <= 0}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Depositing...
          </span>
        ) : (
          "Deposit DOT"
        )}
      </button>
    </div>
  );
}

function WithdrawForm({ 
  basketId, 
  amount, 
  setAmount,
  userBalance 
}: { 
  basketId: bigint;
  amount: string;
  setAmount: (v: string) => void;
  userBalance: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAmount("");
    }, 2000);
  };

  const handleMax = () => {
    setAmount(userBalance || "50");
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2">Amount (Token)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleMax}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            MAX
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Available: {userBalance || "50.00"} xDOT-LIQ
        </p>
      </div>

      {amount && parseFloat(amount) > 0 && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <p className="text-gray-400 text-sm mb-2">You will receive:</p>
          <p className="text-2xl font-bold text-white">{amount} DOT</p>
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={isLoading || !amount || parseFloat(amount) <= 0}
        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
      >
        {isLoading ? "Withdrawing..." : "Withdraw DOT"}
      </button>
    </div>
  );
}

function UserPositionCard({ userDeposit, tokenSymbol }: { userDeposit: string; tokenSymbol: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-gray-800 rounded-2xl p-6 border border-blue-700/50">
      <h3 className="text-lg font-bold text-white mb-4">Your Position</h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm">Deposited</p>
          <p className="text-2xl font-bold text-white">{userDeposit || "100.00"} DOT</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Token Balance</p>
          <p className="text-2xl font-bold text-white">{userDeposit || "100.00"} {tokenSymbol}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Value</p>
          <p className="text-2xl font-bold text-green-400">$102.00</p>
        </div>
      </div>
    </div>
  );
}

function XCMStatusCard() {
  const messages = [
    { chain: "Hydration", status: "confirmed" as const, amount: "40 DOT" },
    { chain: "Moonbeam", status: "confirmed" as const, amount: "30 DOT" },
    { chain: "Acala", status: "pending" as const, amount: "30 DOT" },
  ];

  const statusColors = {
    confirmed: "text-green-400",
    pending: "text-yellow-400",
    failed: "text-red-400",
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">XCM Status</h3>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                msg.status === "confirmed" ? "bg-green-400" :
                msg.status === "pending" ? "bg-yellow-400" : "bg-red-400"
              }`} />
              <span className="text-gray-300">{msg.chain}</span>
            </div>
            <span className={`text-sm ${statusColors[msg.status]}`}>
              {msg.status === "confirmed" ? "✓" : "⏳"} {msg.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
