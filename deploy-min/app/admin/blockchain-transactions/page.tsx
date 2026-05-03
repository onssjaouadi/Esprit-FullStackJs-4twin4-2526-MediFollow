"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  RefreshCw,
  Wallet,
  Lock,
  Unlock,
  Eye,
  AlertCircle,
  Zap,
  BarChart3,
  Users,
  TrendingUp,
  Filter,
  Download,
} from "lucide-react";
import {
  getBlockchainTransactions,
  getBlockchainStatsEnriched,
  getBlockchainHistoryStats,
  exportBlockchainTransactions,
} from "@/lib/actions/blockchain-explorer.actions";
import { BlockchainTransactionsList } from "@/components/auditor/BlockchainTransactionsList";

export default function AdminBlockchainPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPage, selectedAction, dateFrom, dateTo]);

  useEffect(() => {
    loadStats();
    loadHistoryStats();
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const filters: any = { dateFrom: undefined, dateTo: undefined };

      if (selectedAction) {
        filters.action = selectedAction;
      }

      if (dateFrom) {
        filters.dateFrom = new Date(dateFrom);
      }

      if (dateTo) {
        const date = new Date(dateTo);
        date.setHours(23, 59, 59, 999);
        filters.dateTo = date;
      }

      const result = await getBlockchainTransactions(skip, pageSize, filters);

      if (result.success) {
        setTransactions(result.transactions);
        setTotalPages(result.pages);
      } else {
        setTransactions([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error loading blockchain transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStats() {
    try {
      const result = await getBlockchainStatsEnriched();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading blockchain stats:", error);
    }
  }

  async function loadHistoryStats() {
    try {
      const result = await getBlockchainHistoryStats(12);
      if (result.success) {
        setMonthlyStats(result.monthlyStats);
      }
    } catch (error) {
      console.error("Error loading history stats:", error);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const result = await exportBlockchainTransactions({
        action: selectedAction,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo
          ? new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
          : undefined,
      });

      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `blockchain-admin-export-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting transactions:", error);
    } finally {
      setIsExporting(false);
    }
  }

  const actionOptions = [
    { value: "", label: "Toutes les actions" },
    { value: "BLOCKCHAIN_GRANT_ACCESS", label: "Accès accordé" },
    { value: "BLOCKCHAIN_REVOKE_ACCESS", label: "Accès révoqué" },
    { value: "BLOCKCHAIN_ACCESS_VERIFY", label: "Vérification d'accès" },
    { value: "BLOCKCHAIN_LOG_ACCESS", label: "Accès enregistré" },
    { value: "WALLET_CREATED", label: "Portefeuille créé" },
    { value: "BLOCKCHAIN_ERROR", label: "Erreur blockchain" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ⚡ Gestion Blockchain
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Administration complète des transactions blockchain et des
            portefeuilles Aptos
          </p>
        </div>
        <button
          onClick={() => {
            loadData();
            loadStats();
            loadHistoryStats();
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Admin Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard
            icon={Unlock}
            label="Accès Accordés"
            value={stats.totalGrants}
            subtext="Grants actifs"
            color="green"
          />
          <AdminStatCard
            icon={Lock}
            label="Accès Révoqués"
            value={stats.totalRevokes}
            subtext="Revokes"
            color="red"
          />
          <AdminStatCard
            icon={Wallet}
            label="Portefeuilles"
            value={stats.totalWalletCreations}
            subtext="Wallets créés"
            color="indigo"
          />
          <AdminStatCard
            icon={Eye}
            label="Vérifications"
            value={stats.totalVerifications}
            subtext="Checks"
            color="blue"
          />
          <AdminStatCard
            icon={AlertCircle}
            label="Erreurs"
            value={stats.totalErrors}
            subtext={`${stats.successRate}% succès`}
            color="orange"
          />
        </div>
      )}

      {/* Network Stats */}
      {stats?.lastAptosDetails && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg shadow border border-indigo-200 dark:border-indigo-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              🌐 État du Réseau Aptos
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
              Connecté
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Gaz Utilisé
              </p>
              <p className="text-xl font-mono font-bold text-indigo-900 dark:text-indigo-100">
                {stats.lastAptosDetails.gasUsed}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Gaz Max
              </p>
              <p className="text-xl font-mono font-bold text-indigo-900 dark:text-indigo-100">
                {stats.lastAptosDetails.maxGas}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Price/Unit
              </p>
              <p className="text-xl font-mono font-bold text-indigo-900 dark:text-indigo-100">
                {stats.lastAptosDetails.gasPrice}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Statut
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.lastAptosDetails.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            <h2 className="font-medium text-gray-900 dark:text-white">
              Filtres Avancés
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filtrer par action"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Du
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Date de début"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Au
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Date de fin"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Export Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                &nbsp;
              </label>
              <button
                onClick={handleExport}
                disabled={isExporting || transactions.length === 0}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} />
                {isExporting ? "Export..." : "Exporter"}
              </button>
            </div>

            {/* Clear Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                &nbsp;
              </label>
              {(selectedAction || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setSelectedAction("");
                    setDateFrom("");
                    setDateTo("");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <BlockchainTransactionsList
          transactions={transactions}
          isLoading={isLoading}
          onRefresh={loadData}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Précédent
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
              }
              if (pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Monthly Analytics */}
      {monthlyStats && monthlyStats.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            📋 Tendances Mensuelles (12 mois)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                    Mois
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Accordés
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Révoqués
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Portefeuilles
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Erreurs
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((month) => (
                  <tr
                    key={month.month}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {month.month}
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-semibold">
                      {month.grants}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-semibold">
                      {month.revokes}
                    </td>
                    <td className="px-4 py-3 text-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      {month.wallets}
                    </td>
                    <td className="px-4 py-3 text-center text-orange-600 dark:text-orange-400 font-semibold">
                      {month.errors}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white font-bold">
                      {month.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Info */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          💼 <strong>Accès Administrateur :</strong> Vue complète du système
          blockchain. Vous pouvez monitorer toutes les transactions, vérifier
          l'intégrité du réseau Aptos, et gérer les portefeuilles utilisateurs.
        </p>
      </div>
    </div>
  );
}

interface AdminStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  subtext: string;
  color: string;
}

function AdminStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: AdminStatCardProps) {
  const colorClasses = {
    green:
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    red: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtext}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
