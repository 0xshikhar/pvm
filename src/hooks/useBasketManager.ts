import { useCallback, useState } from "react";
import { createPublicClient, http, parseEther, formatEther } from "viem";
import { polkadotHubTestnet, BASKET_MANAGER_ADDRESS, BASKET_MANAGER_ABI } from "../config/contracts";

const RPC_URL = import.meta.env.VITE_RPC_URL || "https://eth-rpc-testnet.polkadot.io";

const publicClient = createPublicClient({
  chain: polkadotHubTestnet,
  transport: http(RPC_URL),
});

export interface Allocation {
  paraId: number;
  protocol: string;
  weightBps: number;
  depositCall: string;
  withdrawCall: string;
}

export interface Basket {
  id: bigint;
  name: string;
  token: string;
  allocations: Allocation[];
  totalDeposited: bigint;
  active: boolean;
}

export interface BasketInfo {
  basketId: bigint;
  name: string;
  symbol: string;
  token: string;
  totalDeposited: string;
  allocations: Array<{ paraId: number; chain: string; weight: number }>;
  active: boolean;
}

export function useBasketManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNextBasketId = useCallback(async (): Promise<bigint> => {
    try {
      const result = await publicClient.readContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "nextBasketId",
      });
      return result;
    } catch (err) {
      console.error("Error fetching nextBasketId:", err);
      return 0n;
    }
  }, []);

  const getBasket = useCallback(async (basketId: bigint): Promise<Basket | null> => {
    try {
      const result = await publicClient.readContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "getBasket",
        args: [basketId],
      });
      return result as unknown as Basket;
    } catch (err) {
      console.error("Error fetching basket:", err);
      return null;
    }
  }, []);

  const getBasketInfo = useCallback(async (basketId: bigint): Promise<BasketInfo | null> => {
    try {
      const basket = await getBasket(basketId);
      if (!basket) return null;

      const chainNames: Record<number, string> = {
        2034: "Hydration LP",
        2004: "Moonbeam Lending",
        2000: "Acala Staking",
      };

      return {
        basketId: basket.id,
        name: basket.name,
        symbol: basket.name.replace(" Basket", "").toUpperCase(),
        token: basket.token,
        totalDeposited: formatEther(basket.totalDeposited),
        allocations: basket.allocations.map((a) => ({
          paraId: Number(a.paraId),
          chain: chainNames[Number(a.paraId)] || `Para ${a.paraId}`,
          weight: Number(a.weightBps) / 100,
        })),
        active: basket.active,
      };
    } catch (err) {
      console.error("Error fetching basket info:", err);
      return null;
    }
  }, [getBasket]);

  const getBasketNAV = useCallback(async (basketId: bigint): Promise<bigint> => {
    try {
      const result = await publicClient.readContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "getBasketNAV",
        args: [basketId],
      });
      return result;
    } catch (err) {
      console.error("Error fetching basket NAV:", err);
      return 0n;
    }
  }, []);

  const deposit = useCallback(async (walletClient: unknown, basketId: bigint, amountDOT: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const wc = walletClient as { account?: { address: string }; writeContract: (params: unknown) => Promise<`0x${string}`> };
      const account = wc.account?.address as `0x${string}` | undefined;
      if (!account) {
        throw new Error("No account available");
      }
      const hash = await wc.writeContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "deposit",
        args: [basketId],
        value: parseEther(amountDOT.toString()),
        chain: polkadotHubTestnet,
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Deposit failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (walletClient: unknown, basketId: bigint, tokenAmount: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      const wc = walletClient as { account?: { address: string }; writeContract: (params: unknown) => Promise<`0x${string}`> };
      const account = wc.account?.address as `0x${string}` | undefined;
      if (!account) {
        throw new Error("No account available");
      }
      const hash = await wc.writeContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "withdraw",
        args: [basketId, tokenAmount],
        chain: polkadotHubTestnet,
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Withdraw failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rebalance = useCallback(async (walletClient: unknown, basketId: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      const wc = walletClient as { account?: { address: string }; writeContract: (params: unknown) => Promise<`0x${string}`> };
      const account = wc.account?.address as `0x${string}` | undefined;
      if (!account) {
        throw new Error("No account available");
      }
      const hash = await wc.writeContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "rebalance",
        args: [basketId],
        chain: polkadotHubTestnet,
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Rebalance failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getBasket,
    getBasketInfo,
    getBasketNAV,
    getNextBasketId,
    deposit,
    withdraw,
    rebalance,
    isLoading,
    error,
    isConfigured: Boolean(BASKET_MANAGER_ADDRESS),
  };
}
