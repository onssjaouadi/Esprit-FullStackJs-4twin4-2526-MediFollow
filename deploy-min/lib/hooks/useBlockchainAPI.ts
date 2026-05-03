"use client";

import { useCallback, useState } from "react";
import {
  BLOCKCHAIN_API,
  buildTransactionParams,
  buildHistoryParams,
  buildExportParams,
  type BlockchainTransactionsResponse,
  type BlockchainStats,
  type BlockchainHistoryResponse,
} from "@/lib/blockchain-api.config";

/**
 * Hook for fetching blockchain transactions
 */
export function useBlockchainTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (options?: Parameters<typeof buildTransactionParams>[0]) => {
      try {
        setLoading(true);
        setError(null);

        const params = buildTransactionParams(options || {});
        const url = `${BLOCKCHAIN_API.ENDPOINTS.TRANSACTIONS}?${params}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data: BlockchainTransactionsResponse = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetch, loading, error };
}

/**
 * Hook for fetching blockchain statistics
 */
export function useBlockchainStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(BLOCKCHAIN_API.ENDPOINTS.STATS);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: BlockchainStats = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetch, loading, error };
}

/**
 * Hook for fetching blockchain history
 */
export function useBlockchainHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (options?: Parameters<typeof buildHistoryParams>[0]) => {
      try {
        setLoading(true);
        setError(null);

        const params = buildHistoryParams(options || {});
        const url = `${BLOCKCHAIN_API.ENDPOINTS.HISTORY}?${params}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data: BlockchainHistoryResponse = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetch, loading, error };
}

/**
 * Hook for exporting blockchain transactions
 */
export function useBlockchainExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (options?: Parameters<typeof buildExportParams>[0]) => {
      try {
        setLoading(true);
        setError(null);

        const params = buildExportParams(options || {});
        const url = `${BLOCKCHAIN_API.ENDPOINTS.EXPORT}?${params}`;

        // Trigger download
        const link = document.createElement("a");
        link.href = url;
        link.click();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { download, loading, error };
}

/**
 * Combined hook for all blockchain API operations
 */
export function useBlockchainAPI() {
  const transactions = useBlockchainTransactions();
  const stats = useBlockchainStats();
  const history = useBlockchainHistory();
  const exportData = useBlockchainExport();

  return {
    transactions,
    stats,
    history,
    exportData,
  };
}
