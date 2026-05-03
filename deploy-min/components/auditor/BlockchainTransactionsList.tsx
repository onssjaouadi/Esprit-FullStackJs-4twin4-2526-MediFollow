"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileText,
  ChevronDown,
  Check,
  AlertCircle,
  Wallet,
  Lock,
  Unlock,
  Eye,
  Download,
  Filter,
  Search,
  Zap,
  ExternalLink,
  Loader,
} from "lucide-react";
import { getAptosTransactionDetails } from "@/lib/actions/blockchain-explorer.actions";

interface BlockchainTransaction {
  id: string;
  action: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  entityId: string;
  entityType: string;
  changes: any;
}

interface BlockchainTransactionsListProps {
  transactions: BlockchainTransaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const ACTION_CONFIG = {
  BLOCKCHAIN_GRANT_ACCESS: {
    icon: Unlock,
    label: "Accès accordé",
    color: "green",
    description: "Accès blockchain accordé à un médecin",
  },
  BLOCKCHAIN_REVOKE_ACCESS: {
    icon: Lock,
    label: "Accès révoqué",
    color: "red",
    description: "Accès blockchain révoqué à un médecin",
  },
  BLOCKCHAIN_ACCESS_VERIFY: {
    icon: Eye,
    label: "Vérification d'accès",
    color: "blue",
    description: "Accès blockchain vérifié",
  },
  BLOCKCHAIN_LOG_ACCESS: {
    icon: FileText,
    label: "Accès enregistré",
    color: "purple",
    description: "Accès aux données enregistré",
  },
  WALLET_CREATED: {
    icon: Wallet,
    label: "Portefeuille créé",
    color: "indigo",
    description: "Portefeuille blockchain créé pour un utilisateur",
  },
  BLOCKCHAIN_ERROR: {
    icon: AlertCircle,
    label: "Erreur blockchain",
    color: "orange",
    description: "Erreur lors d'une opération blockchain",
  },
};

const getColorClasses = (color: string) => {
  const colors: { [key: string]: string } = {
    green:
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
  };
  return colors[color] || colors.blue;
};

export function BlockchainTransactionsList({
  transactions,
  isLoading = false,
  onRefresh,
}: BlockchainTransactionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aptosDetails, setAptosDetails] = useState<{ [key: string]: any }>({});
  const [loadingAptosId, setLoadingAptosId] = useState<string | null>(null);

  async function fetchAptosDetails(txId: string, txHash: string) {
    setLoadingAptosId(txId);
    try {
      const result = await getAptosTransactionDetails(txHash);
      if (result.success && result.transaction) {
        setAptosDetails((prev) => ({
          ...prev,
          [txId]: result.transaction,
        }));
      }
    } catch (error) {
      console.error("Error fetching Aptos details:", error);
    } finally {
      setLoadingAptosId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-violet-600"></div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Aucune transaction
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aucune transaction blockchain n'a été trouvée.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const config =
          ACTION_CONFIG[tx.action as keyof typeof ACTION_CONFIG] ||
          ACTION_CONFIG.BLOCKCHAIN_ERROR;
        const Icon = config.icon;
        const isExpanded = expandedId === tx.id;

        return (
          <div
            key={tx.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : tx.id)}
              className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div
                  className={`p-2 rounded-lg ${getColorClasses(config.color)}`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {config.label}
                    </h4>
                    {tx.changes?.transaction?.newValue?.status ===
                      "SUCCESS" && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {tx.user?.name || tx.user?.email || "Utilisateur inconnu"} •{" "}
                    {format(new Date(tx.createdAt), "PPp", { locale: fr })}
                  </p>
                </div>

                {/* Transaction Hash Preview */}
                {tx.entityId && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono max-w-xs truncate hidden md:block">
                    {tx.entityId.substring(0, 10)}...
                  </div>
                )}
              </div>

              <div className="ml-2">
                <ChevronDown
                  size={20}
                  className={`transition-transform text-gray-400 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Info */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Utilisateur
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.user?.email}
                    </p>
                  </div>

                  {/* Action */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Action
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {tx.action}
                    </p>
                  </div>

                  {/* Entity */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Type d'entité
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {tx.entityType}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Date & Heure
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(tx.createdAt), "PPpp", { locale: fr })}
                    </p>
                  </div>
                </div>

                {/* Transaction Hash */}
                {tx.entityId && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Hash de Transaction
                    </p>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                        {tx.entityId}
                      </p>
                    </div>
                  </div>
                )}

                {/* Transaction Details */}
                {tx.changes?.transaction?.newValue && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Détails de la Transaction
                    </p>
                    <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 space-y-1">
                      {Object.entries(tx.changes.transaction.newValue).map(
                        ([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              {key}:
                            </span>
                            <span className="text-gray-900 dark:text-white font-mono">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                {tx.changes?.transaction?.newValue?.status && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Statut:
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        tx.changes.transaction.newValue.status === "SUCCESS"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {tx.changes.transaction.newValue.status}
                    </span>
                  </div>
                )}

                {/* Aptos Details Section */}
                {aptosDetails[tx.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                      📊 Détails Aptos
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Statut
                          </p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white">
                            {aptosDetails[tx.id].status}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gaz utilisé
                          </p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white">
                            {aptosDetails[tx.id].gasUsed}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gaz max
                          </p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white">
                            {aptosDetails[tx.id].maxGas}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Prix du gaz
                          </p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white">
                            {aptosDetails[tx.id].gasPrice}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Sender
                        </p>
                        <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                          {aptosDetails[tx.id].sender}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aptos Verification Button */}
                {tx.entityId && (
                  <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => fetchAptosDetails(tx.id, tx.entityId)}
                      disabled={loadingAptosId === tx.id}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded font-medium text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      {loadingAptosId === tx.id ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Vérifier sur Aptos
                        </>
                      )}
                    </button>
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${tx.entityId}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                      title="Ouvrir dans l'explorateur Aptos"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
