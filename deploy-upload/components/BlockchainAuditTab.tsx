"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
} from "lucide-react";

interface BlockchainTransaction {
  version: string;
  hash: string;
  state_root_hash: string;
  event_root_hash: string;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: any[];
  timestamp: string;
  type: string;
}

interface BlockchainStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  transactionTypes: { [key: string]: number };
  averageGasUsed: number;
  lastUpdate: string;
}

export function BlockchainAuditTab() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(25);

  useEffect(() => {
    loadBlockchainData();
  }, [currentPage]);

  async function loadBlockchainData() {
    setLoading(true);
    try {
      // Fetch transactions
      const txResponse = await fetch(
        `/api/blockchain/aptos?action=transactions&limit=${pageSize}&offset=${currentPage * pageSize}`,
        { cache: "no-store" }
      );
      const txData = await txResponse.json();
      setTransactions(Array.isArray(txData) ? txData : []);

      // Fetch stats
      const statsResponse = await fetch(`/api/blockchain/aptos?action=stats`, {
        cache: "no-store",
      });
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      // Set empty state but don't break the UI
      setTransactions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  const successRate = stats
    ? Math.round(
        (stats.successfulTransactions / stats.totalTransactions) * 100 || 0
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="text-indigo-600" />
            Blockchain Aptos Testnet
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Account: 0x43f2e74...47f1
          </p>
        </div>
        <button
          onClick={loadBlockchainData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Transactions Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalTransactions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Réussies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {stats.successfulTransactions}
              </div>
              <p className="text-xs text-emerald-600 mt-1">{successRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Échouées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">
                {stats.failedTransactions}
              </div>
              <p className="text-xs text-rose-600 mt-1">{100 - successRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Gas Moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(stats.averageGasUsed / 1000).toFixed(1)}K
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Types Uniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.keys(stats.transactionTypes).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gas Utilisé</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">
                        {tx.version || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-xs">
                        {tx.hash?.substring(0, 16)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {tx.type || "user_transaction"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.success ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle size={16} />
                            <span className="text-sm">Succès</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-600">
                            <XCircle size={16} />
                            <span className="text-sm">Échoué</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {(parseInt(tx.gas_used || "0") / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.timestamp
                          ? format(
                              new Date(parseInt(tx.timestamp)),
                              "dd/MM HH:mm"
                            )
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Aucune transaction trouvée
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0 || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage + 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={transactions.length < pageSize || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
