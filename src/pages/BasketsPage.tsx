import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBasketManager } from "../hooks/useBasketManager";
import { formatUnits } from "viem";
import { APP_NATIVE_DECIMALS, APP_NATIVE_SYMBOL, PARACHAINS } from "../config/contracts";
import { DepositForm } from "../components/DepositForm";
import { WithdrawForm } from "../components/WithdrawForm";

interface BasketPreview {
  id: bigint;
  name: string;
  symbol: string;
  totalDeposited: bigint;
  active: boolean;
  allocations: Array<{ chain: string; weight: number }>;
}

const MOCK_BASKETS: (BasketPreview & { creator: string })[] = [
  {
    id: 0n,
    name: "John's Alpha Basket",
    symbol: "xDOT-LIQ",
    totalDeposited: 1250000n,
    active: true,
    creator: "John Doe",
    allocations: [
      { chain: "Hydration LP", weight: 40 },
      { chain: "Moonbeam Lending", weight: 30 },
      { chain: "Acala Staking", weight: 30 },
    ],
  },
  {
    id: 1n,
    name: "Sarah's Yield Maximizer",
    symbol: "xSTABLE",
    totalDeposited: 850000n,
    active: true,
    creator: "Sarah Connor",
    allocations: [
      { chain: "Hydration Stable", weight: 50 },
      { chain: "Moonbeam Liquid Staking", weight: 50 },
    ],
  },
  {
    id: 2n,
    name: "Mike's High Growth",
    symbol: "xRISK",
    totalDeposited: 320000n,
    active: false,
    creator: "Michael Scott",
    allocations: [
      { chain: "Moonbeam Leverage", weight: 60 },
      { chain: "Acala Leverage", weight: 40 },
    ],
  },
];

const CHAIN_COLORS: Record<string, string> = {
  "Hydration LP": "#E6007A",
  "Hydration Stable": "#E6007A",
  "Moonbeam Lending": "#53CBC9",
  "Moonbeam Liquid Staking": "#53CBC9",
  "Moonbeam Leverage": "#53CBC9",
  "Acala Staking": "#FF4B4B",
  "Acala Leverage": "#FF4B4B",
  "PAS": "#E6007A",
  "aUSD": "#FF4B4B",
  "LDOT": "#53CBC9",
  "iBTC": "#F7931A",
  "HDX": "#E6007A",
  "GLMR": "#53CBC9",
  "PDEX": "#000000",
  "CFG": "#F7BD48",
  "USDC": "#2775CA",
  "USDT": "#26A17B",
  "WBTC": "#F7931A",
  "DAI": "#F5AC37",
  "PUP": "#FFD700",
  "🌕": "#FFD700",
  "HODL": "#00FFFF",
};

const SUPPORTED_TOKENS = [
  { symbol: "PAS", name: "Paseo DOT", icon: "🟣" },
  { symbol: "aUSD", name: "Acala Dollar", icon: "💵" },
  { symbol: "LDOT", name: "Liquid DOT", icon: "💧" },
  { symbol: "iBTC", name: "Interlay BTC", icon: "₿" },
  { symbol: "HDX", name: "Hydration", icon: "💧" },
  { symbol: "GLMR", name: "Moonbeam", icon: "🌙" },
  { symbol: "PDEX", name: "Polkadex", icon: "📊" },
  { symbol: "CFG", name: "Centrifuge", icon: "⚙️" },
  { symbol: "USDC", name: "USD Coin", icon: "🪙" },
  { symbol: "USDT", name: "Tether USD", icon: "🟢" },
  { symbol: "WBTC", name: "Wrapped BTC", icon: "₿" },
  { symbol: "DAI", name: "Dai Stablecoin", icon: "🟡" },
  { symbol: "PUP", name: "PolkaPup", icon: "🐶" },
  { symbol: "🌕", name: "DOT Moon", icon: "🌕" },
  { symbol: "HODL", name: "HODL Gang", icon: "💎" },
];

export function BasketsPage() {
  useBasketManager();
  const navigate = useNavigate();
  const [baskets, setBaskets] = useState<(BasketPreview & { creator: string })[]>(MOCK_BASKETS);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);

    if (dir === "right") {
      // Show deposit modal on right swipe
      setTimeout(() => {
        setShowDepositModal(true);
        setDirection(null);
      }, 300);
      return;
    }

    // Default left swipe: move to next card
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const currentBasket = baskets[currentIndex];
  const isLast = currentIndex >= baskets.length;

  return (
    <div className="min-h-screen bg-neutral-950 pt-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Explore Baskets
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
            Swipe right to invest, left to skip. Or create your own.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-400" />
          </div>
        ) : (
          <div className="relative mx-auto h-[600px] w-full max-w-md perspective-1000">
            {!isLast ? (
              <>
                {/* Next card preview */}
                {currentIndex + 1 < baskets.length && (
                  <div className="absolute inset-0 translate-y-6 scale-95 opacity-40 blur-[2px]">
                    <BasketCard basket={baskets[currentIndex + 1]} isStatic />
                  </div>
                )}

                {/* Active card */}
                <div
                  className={`absolute inset-0 transition-all duration-300 ease-out transform ${direction === "left" ? "-translate-x-[150%] -rotate-12 opacity-0" :
                    direction === "right" ? "translate-x-[150%] rotate-12 opacity-0" :
                      "translate-x-0 rotate-0 opacity-100"
                    }`}
                >
                  <BasketCard basket={currentBasket} />
                </div>

                {/* Controls */}
                <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-8 pb-12">
                  <button
                    onClick={() => handleSwipe("left")}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-neutral-900 text-red-500 shadow-xl transition hover:bg-neutral-800 active:scale-95"
                    aria-label="Pass"
                  >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="flex h-14 w-14 mt-1 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-white shadow-xl transition hover:bg-neutral-800 active:scale-95"
                    aria-label="Create Custom"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSwipe("right")}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-neutral-900 text-emerald-400 shadow-xl transition hover:bg-neutral-800 active:scale-95"
                    aria-label="Invest"
                  >
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-neutral-900/50 p-8 text-center backdrop-blur-sm">
                <div className="mb-4 rounded-full bg-white/5 p-4 text-emerald-400">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
                <p className="mt-2 text-neutral-400">You've seen all available baskets. Try creating your own custom portfolio.</p>
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setCurrentIndex(0)}
                    className="rounded-xl border border-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="rounded-xl bg-white px-6 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
                  >
                    Create Custom
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCustomModal && (
        <CreateBasketModal
          onClose={() => setShowCustomModal(false)}
          onCreated={(newBasket) => {
            // We no longer add the custom basket to the local swiper state
            // because it needs admin approval first.
            console.log("New basket submitted for approval:", newBasket);
            setShowCustomModal(false);
            // Optionally we could show a global toast here if we had a toast system
          }}
        />
      )}
      {showDepositModal && (
        <DepositWithdrawModal
          basket={baskets[currentIndex]}
          onClose={() => {
            setShowDepositModal(false);
          }}
        />
      )}
    </div>
  );
}

function DepositWithdrawModal({ basket, onClose }: { basket: BasketPreview & { creator: string }; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Map preview allocations to form allocations
  const formAllocations = basket.allocations.map(a => {
    let paraId = 2034; // Default Hydration
    if (a.chain.includes("Moonbeam")) paraId = 2004;
    if (a.chain.includes("Acala")) paraId = 2000;
    return { chain: a.chain, paraId, pct: a.weight };
  });

  const withdrawAllocations = basket.allocations.map(a => {
    let paraId = 2034;
    if (a.chain.includes("Moonbeam")) paraId = 2004;
    if (a.chain.includes("Acala")) paraId = 2000;
    return { paraId, weightBps: a.weight * 100 };
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white">{basket.name}</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Manage Investment</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-2 bg-white/5 m-6 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "deposit"
              ? "bg-emerald-500 text-neutral-950 shadow-lg"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deposit
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "withdraw"
              ? "bg-red-500 text-white shadow-lg"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Withdraw
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {activeTab === "deposit" ? (
            <div className="premium-form-wrapper">
              <DepositForm
                basketId={basket.id}
                basketName={basket.symbol}
                allocations={formAllocations}
              />
            </div>
          ) : (
            <div className="premium-form-wrapper">
              <WithdrawForm
                basketId={basket.id}
                tokenSymbol={basket.symbol}
                allocations={withdrawAllocations}
                userTokenBalance="0.00" // In a real app we'd fetch balance
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
            Secure Cross-Chain Transaction via ERC-8004
          </p>
        </div>
      </div>

      <style>{`
        .premium-form-wrapper > div {
          background: transparent !important;
          padding: 0 !important;
        }
        .premium-form-wrapper h3 {
          display: none; /* Hide internal form headers */
        }
        .premium-form-wrapper input {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 1rem !important;
          padding: 1rem !important;
        }
        .premium-form-wrapper button {
          border-radius: 1rem !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-size: 0.875rem !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
function BasketCard({ basket, isStatic = false }: { basket: BasketPreview & { creator: string }; isStatic?: boolean }) {
  return (
    <div className={`h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900 p-8 shadow-2xl transition hover:border-white/20 ${!isStatic ? 'ring-1 ring-white/5' : ''}`}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white">{basket.name}</h3>
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">Yield Strategy: Moderate Risk</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/5 p-2.5 text-white">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        {/* Hardcoded Value for "Premium" feel */}
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">100</span>
          <span className="text-lg font-bold text-neutral-500">{APP_NATIVE_SYMBOL}</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Current Allocation Basis</p>

        {/* Mini Performance Chart (Static SVG) */}
        <div className="mt-6 h-20 w-full opacity-60">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 200 60">
            <path
              d="M0 50 Q 20 40, 40 45 T 80 30 T 120 35 T 160 15 L 200 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald-500"
            />
            <path
              d="M0 50 Q 20 40, 40 45 T 80 30 T 120 35 T 160 15 L 200 20 V 60 H 0 Z"
              fill="url(#gradient-green)"
              opacity="0.1"
            />
            <defs>
              <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Target APY</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">12.4%</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Total TVL</p>
            <p className="mt-1 text-xl font-bold text-white">
              {(Number(formatUnits(basket.totalDeposited, APP_NATIVE_DECIMALS))).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Allocation List */}
        <div className="mt-6 flex-grow">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">Parachain Spread</p>
          <div className="space-y-2">
            {basket.allocations.map((alloc, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CHAIN_COLORS[alloc.chain] || '#fff' }}
                  />
                  <span className="text-xs font-medium text-neutral-300 group-hover:text-white transition">{alloc.chain}</span>
                </div>
                <span className="text-xs font-bold text-white">{alloc.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {!isStatic && (
          <div className="mt-6 border-t border-white/5 pt-6 flex items-center justify-between">
            <Link
              to={`/basket/${basket.id}`}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:bg-white/10 hover:border-emerald-500/30 transition shadow-lg"
            >
              View Full Details
            </Link>

            <div className="flex flex-col items-end">
              <span className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black mb-1">Created By</span>
              <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-white hover:bg-emerald-500/20 transition">
                {basket.creator}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateBasketModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: BasketPreview) => void }) {
  const [name, setName] = useState("");
  const [allocations, setAllocations] = useState<{ chain: string; weight: number }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const totalWeight = allocations.reduce((acc, curr) => acc + curr.weight, 0);

  const toggleToken = (token: typeof SUPPORTED_TOKENS[0]) => {
    const exists = allocations.find(a => a.chain === token.symbol);
    if (exists) {
      setAllocations(allocations.filter(a => a.chain !== token.symbol));
    } else {
      if (allocations.length >= 5) return; // Limit to 5 tokens per basket for UX
      const remaining = 100 - totalWeight;
      setAllocations([...allocations, { chain: token.symbol, weight: Math.max(0, remaining) }]);
    }
  };

  const handleWeightChange = (symbol: string, val: number) => {
    setAllocations(allocations.map(a => a.chain === symbol ? { ...a, weight: val } : a));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100 || allocations.length === 0) return;

    setIsSuccess(true);
    setTimeout(() => {
    }, 2000);
  };

  const filteredTokens = SUPPORTED_TOKENS.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900 shadow-2xl">

        {isSuccess ? (
          <div className="flex flex-col items-center py-12 px-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Basket Created!</h2>
            <p className="mt-4 text-neutral-400 text-lg">
              Your strategy <span className="text-emerald-400 font-bold">"{name}"</span> has been submitted. <br />
              <span className="text-white font-medium">An admin will review and approve it shortly.</span>
            </p>
            <button
              onClick={() => {
                onCreated({
                  id: BigInt(Date.now()),
                  name: name || "Custom Basket",
                  symbol: "CUSTOM",
                  totalDeposited: 0n,
                  active: true,
                  allocations: allocations.map(a => ({ chain: a.chain, weight: a.weight })),
                });
              }}
              className="mt-10 w-full rounded-2xl bg-white py-4 text-sm font-bold text-neutral-950 transition hover:bg-neutral-200"
            >
              Continue to Baskets
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[85vh]">
            <div className="p-8 pb-4">
              <h2 className="text-3xl font-bold text-white mb-2">Design Your Strategy</h2>
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-[0.2em]">Select tokens and set allocations</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden px-8 pb-8">
              <div className="space-y-6 flex flex-col flex-grow overflow-hidden">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Strategy Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Multichain Alpha v1"
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3 text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition"
                  />
                </div>

                <div className="flex gap-6 flex-grow overflow-hidden">
                  {/* Token Selection */}
                  <div className="flex flex-col w-1/2 overflow-hidden border border-white/5 bg-white/[0.02] rounded-3xl">
                    <div className="p-4 border-b border-white/5">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search tokens..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                        />
                      </div>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {filteredTokens.map(token => {
                        const isSelected = allocations.some(a => a.chain === token.symbol);
                        return (
                          <button
                            key={token.symbol}
                            type="button"
                            onClick={() => toggleToken(token)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition ${isSelected ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{token.icon}</span>
                              <div className="text-left">
                                <p className="text-sm font-bold text-white">{token.symbol}</p>
                                <p className="text-[10px] text-neutral-500">{token.name}</p>
                              </div>
                            </div>
                            {isSelected && <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allocation Controls */}
                  <div className="flex flex-col w-1/2 overflow-hidden border border-white/5 bg-white/[0.02] rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Allocation</p>
                      <span className={`text-sm font-mono font-bold ${totalWeight === 100 ? "text-emerald-400" : "text-red-400"}`}>
                        {totalWeight}%
                      </span>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-1">
                      {allocations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <p className="text-xs text-neutral-600 font-medium">No tokens selected.<br />Select from the list to start.</p>
                        </div>
                      ) : (
                        allocations.map(alloc => (
                          <div key={alloc.chain} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{alloc.chain}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={alloc.weight}
                                  onChange={(e) => handleWeightChange(alloc.chain, parseInt(e.target.value) || 0)}
                                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-center text-white focus:outline-none"
                                />
                                <span className="text-xs text-neutral-600">%</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={alloc.weight}
                              onChange={(e) => handleWeightChange(alloc.chain, parseInt(e.target.value))}
                              className="w-full accent-emerald-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <button
                        type="submit"
                        disabled={totalWeight !== 100 || allocations.length === 0}
                        className="w-full rounded-2xl bg-white py-4 text-sm font-black text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-20 flex items-center justify-center gap-2"
                      >
                        Launch Basket
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-neutral-500 hover:text-white transition"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

