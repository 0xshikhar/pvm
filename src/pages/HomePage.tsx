import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBasketManager, Basket } from "../hooks/useBasketManager";
import { formatEther } from "viem";

interface BasketPreview {
  id: bigint;
  name: string;
  symbol: string;
  totalDeposited: bigint;
  active: boolean;
  allocations: Array<{
    chain: string;
    weight: number;
  }>;
}

const MOCK_BASKETS: BasketPreview[] = [
  {
    id: 0n,
    name: "xDOT Liquidity Basket",
    symbol: "xDOT-LIQ",
    totalDeposited: 1250000n,
    active: true,
    allocations: [
      { chain: "Hydration LP", weight: 40 },
      { chain: "Moonbeam Lending", weight: 30 },
      { chain: "Acala Staking", weight: 30 },
    ],
  },
  {
    id: 1n,
    name: "Stable Yield Basket",
    symbol: "xSTABLE",
    totalDeposited: 850000n,
    active: true,
    allocations: [
      { chain: "Hydration Stable", weight: 50 },
      { chain: "Moonbeam Liquid Staking", weight: 50 },
    ],
  },
  {
    id: 2n,
    name: "High Risk Basket",
    symbol: "xRISK",
    totalDeposited: 320000n,
    active: false,
    allocations: [
      { chain: "Moonbeam Leverage", weight: 60 },
      { chain: "Acala Leverage", weight: 40 },
    ],
  },
];

export function HomePage() {
  const { getBasket, getBasketNAV } = useBasketManager();
  const [baskets, setBaskets] = useState<BasketPreview[]>(MOCK_BASKETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBaskets = async () => {
      setLoading(false);
    };
    loadBaskets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            TeleBasket
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cross-chain DeFi baskets. One deposit, multiple chains, 
            one unified token representing your diversified portfolio.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Available Baskets</h2>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Create Basket
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baskets.map((basket) => (
                <BasketCard key={basket.id.toString()} basket={basket} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <StatCard
            title="Total Value Locked"
            value="$2.42M"
            change="+12.5%"
            positive
          />
          <StatCard
            title="Active Baskets"
            value="2"
            change=""
            positive
          />
          <StatCard
            title="Total Depositors"
            value="1,247"
            change="+89"
            positive
          />
        </div>

        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Deposit DOT"
              description="Deposit your DOT into any basket. You receive basket tokens representing your share."
            />
            <StepCard
              number="2"
              title="Automatic Allocation"
              description="Your capital is automatically deployed across multiple parachains via XCM."
            />
            <StepCard
              number="3"
              title="Earn Yield"
              description="Earn yield from multiple DeFi protocols. Rebalance anytime for optimal returns."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BasketCard({ basket }: { basket: BasketPreview }) {
  const chainColors: Record<string, string> = {
    "Hydration LP": "#E6007A",
    "Hydration Stable": "#E6007A",
    "Moonbeam Lending": "#53CBC9",
    "Moonbeam Liquid Staking": "#53CBC9",
    "Moonbeam Leverage": "#53CBC9",
    "Acala Staking": "#FF4B4B",
    "Acala Leverage": "#FF4B4B",
  };

  return (
    <Link to={`/basket/${basket.id}`}>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10 group">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {basket.name}
            </h3>
            <p className="text-gray-400">{basket.symbol}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            basket.active 
              ? "bg-green-500/20 text-green-400" 
              : "bg-red-500/20 text-red-400"
          }`}>
            {basket.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-white">
            {Number(formatEther(basket.totalDeposited)).toLocaleString()} DOT
          </p>
          <p className="text-sm text-gray-400">TVL</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400">Allocation</p>
          <div className="flex h-2 rounded-full overflow-hidden">
            {basket.allocations.map((alloc, i) => (
              <div
                key={i}
                className="h-full"
                style={{
                  width: `${alloc.weight}%`,
                  backgroundColor: chainColors[alloc.chain] || "#6366f1",
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {basket.allocations.map((alloc, i) => (
              <span key={i} className="text-xs text-gray-400">
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: chainColors[alloc.chain] || "#6366f1" }}
                />
                {alloc.chain} {alloc.weight}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ title, value, change, positive }: { 
  title: string; 
  value: string; 
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {change && (
          <span className={`text-sm ${positive ? "text-green-400" : "text-red-400"}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { 
  number: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-xl font-bold text-white">{number}</span>
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
