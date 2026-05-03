/**
 * Blockchain API Configuration and Constants
 * Centralized configuration for blockchain API endpoints and parameters
 */

export const BLOCKCHAIN_API = {
  // Endpoints
  ENDPOINTS: {
    TRANSACTIONS: "/api/blockchain/transactions",
    STATS: "/api/blockchain/stats",
    HISTORY: "/api/blockchain/history",
    EXPORT: "/api/blockchain/export",
  },

  // Cache durations (in seconds)
  CACHE_DURATION: {
    TRANSACTIONS: 60, // 1 minute
    STATS: 120, // 2 minutes
    HISTORY: 300, // 5 minutes
    EXPORT: 0, // No cache (files)
  },

  // Pagination
  PAGINATION: {
    DEFAULT_SKIP: 0,
    DEFAULT_TAKE: 20,
    MAX_TAKE: 100,
  },

  // History
  HISTORY: {
    DEFAULT_MONTHS: 12,
    MIN_MONTHS: 1,
    MAX_MONTHS: 60,
  },

  // Action types
  ACTIONS: {
    GRANT_ACCESS: "GRANT_ACCESS",
    REVOKE_ACCESS: "REVOKE_ACCESS",
    ACCESS_VERIFY: "ACCESS_VERIFY",
    LOG_ACCESS: "LOG_ACCESS",
    WALLET_CREATED: "WALLET_CREATED",
    ERROR: "ERROR",
  } as const,

  // Status codes
  STATUS: {
    SUCCESS: "success",
    PENDING: "pending",
    FAILED: "failed",
  } as const,
} as const;

export type BlockchainAction =
  (typeof BLOCKCHAIN_API.ACTIONS)[keyof typeof BLOCKCHAIN_API.ACTIONS];
export type BlockchainStatus =
  (typeof BLOCKCHAIN_API.STATUS)[keyof typeof BLOCKCHAIN_API.STATUS];

/**
 * Build transaction query parameters
 */
export function buildTransactionParams(options: {
  skip?: number;
  take?: number;
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): URLSearchParams {
  const params = new URLSearchParams();

  params.set(
    "skip",
    String(options.skip || BLOCKCHAIN_API.PAGINATION.DEFAULT_SKIP)
  );
  params.set(
    "take",
    String(options.take || BLOCKCHAIN_API.PAGINATION.DEFAULT_TAKE)
  );

  if (options.action) params.set("action", options.action);
  if (options.userId) params.set("userId", options.userId);
  if (options.dateFrom) params.set("dateFrom", options.dateFrom.toISOString());
  if (options.dateTo) params.set("dateTo", options.dateTo.toISOString());

  return params;
}

/**
 * Build history query parameters
 */
export function buildHistoryParams(options: {
  months?: number;
}): URLSearchParams {
  const params = new URLSearchParams();

  const months = options.months || BLOCKCHAIN_API.HISTORY.DEFAULT_MONTHS;
  params.set(
    "months",
    String(
      Math.max(
        BLOCKCHAIN_API.HISTORY.MIN_MONTHS,
        Math.min(months, BLOCKCHAIN_API.HISTORY.MAX_MONTHS)
      )
    )
  );

  return params;
}

/**
 * Build export query parameters
 */
export function buildExportParams(options: {
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): URLSearchParams {
  const params = new URLSearchParams();

  if (options.action) params.set("action", options.action);
  if (options.userId) params.set("userId", options.userId);
  if (options.dateFrom) params.set("dateFrom", options.dateFrom.toISOString());
  if (options.dateTo) params.set("dateTo", options.dateTo.toISOString());

  return params;
}

/**
 * Type-safe API response types
 */
export interface BlockchainTransaction {
  id: string;
  action: BlockchainAction;
  userId: string;
  userName: string;
  entityId: string;
  entityType: string;
  transactionHash: string;
  gasUsed?: number;
  status: string;
  createdAt: string;
}

export interface BlockchainTransactionsResponse {
  data: BlockchainTransaction[];
  total: number;
  skip: number;
  take: number;
}

export interface AptosTransactionDetails {
  hash: string;
  status: string;
  type: string;
  sender: string;
  gasUsed: number;
  maxGas: number;
  gasPrice: number;
  timestamp: number;
  version: number;
}

export interface BlockchainStats {
  totalGrants: number;
  totalRevokes: number;
  totalWallets: number;
  totalErrors: number;
  successRate: number;
  lastAptosDetails?: AptosTransactionDetails;
}

export interface MonthlyBlockchainStats {
  month: string;
  grants: number;
  revokes: number;
  verifications: number;
  wallets: number;
  errors: number;
  total: number;
}

export interface BlockchainHistoryResponse {
  monthlyStats: MonthlyBlockchainStats[];
  totals: {
    grants: number;
    revokes: number;
    verifications: number;
    wallets: number;
    errors: number;
    total: number;
  };
}
