import { useCallback, useState } from "react";
import { createPublicClient, http, parseEther } from "viem";
import { polkadotHubTestnet, BASKET_MANAGER_ADDRESS, BASKET_MANAGER_ABI } from "../config/contracts";

const publicClient = createPublicClient({
  chain: polkadotHubTestnet,
  transport: http("https://westend-asset-hub-eth-rpc.polkadot.io"),
});

export interface Basket {
  id: bigint;
  name: string;
  token: string;
  totalDeposited: bigint;
  active: boolean;
}

export function useBasketManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBasket = useCallback(async (basketId: bigint): Promise<Basket | null> => {
    try {
      const result = await publicClient.readContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "getBasket",
        args: [basketId],
      });
      return result as Basket;
    } catch (err) {
      console.error("Error fetching basket:", err);
      return null;
    }
  }, []);

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
    getBasketNAV,
    deposit,
    withdraw,
    rebalance,
    isLoading,
    error,
  };
}
