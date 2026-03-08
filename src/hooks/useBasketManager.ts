import { useCallback, useState } from "react";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { polkadotHubTestnet, BASKET_MANAGER_ADDRESS, BASKET_MANAGER_ABI } from "../config/contracts";

const publicClient = createPublicClient({
  chain: polkadotHubTestnet,
  transport: http("https://westend-asset-hub-eth-rpc.polkadot.io"),
});

export interface AllocationConfig {
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

  const deposit = useCallback(async (walletClient: ReturnType<typeof createWalletClient>, basketId: bigint, amountDOT: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const hash = await walletClient.writeContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "deposit",
        args: [basketId],
        value: parseEther(amountDOT.toString()),
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

  const withdraw = useCallback(async (walletClient: ReturnType<typeof createWalletClient>, basketId: bigint, tokenAmount: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      const hash = await walletClient.writeContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "withdraw",
        args: [basketId, tokenAmount],
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

  const rebalance = useCallback(async (walletClient: ReturnType<typeof createWalletClient>, basketId: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      const hash = await walletClient.writeContract({
        address: BASKET_MANAGER_ADDRESS,
        abi: BASKET_MANAGER_ABI,
        functionName: "rebalance",
        args: [basketId],
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
