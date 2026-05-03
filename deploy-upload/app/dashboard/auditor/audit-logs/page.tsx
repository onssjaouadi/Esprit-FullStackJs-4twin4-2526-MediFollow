"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Clock,
  User,
  Loader,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  getAuditLogs,
  getAuditStats,
  getAuditLogsActivity,
} from "@/lib/actions/auditor.actions";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  status: "success" | "failure" | "warning";
}

interface ActivityData {
  time: string;
  count: number;
}

type SortField = "timestamp" | "user" | "action" | "resource";
type SortOrder = "asc" | "desc";

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState(20);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    todayLogs: 0,
  });
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const actions = ["ALL", "CREATE", "UPDATE", "DELETE"];

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      const result = await getAuditStats();
      if (result.success) {
        setStats(result.stats);
      }
    }
    fetchStats();
  }, []);

  // Fetch activity
  useEffect(() => {
    async function fetchActivity() {
      const result = await getAuditLogsActivity();
      if (result.success) {
        setActivity(result.activity.slice(-24));
      }
    }
    fetchActivity();
  }, []);

  // Fetch logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const result = await getAuditLogs({
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchQuery || undefined,
          action: selectedAction,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          orderBy: sortField,
          sortOrder: sortOrder,
        });

        if (result.success) {
          setLogs((result.logs || []) as AuditLog[]);
          setTotalPages(result.pages || 1);
          setError(null);
        } else {
          setError(result.error || "Erreur lors du chargement des logs");
          setLogs([]);
        }
      } catch (err) {
        setError("Erreur lors du chargement des logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [
    searchQuery,
    currentPage,
    selectedAction,
    startDate,
    endDate,
    sortField,
    sortOrder,
    pageSize,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown size={16} className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const downloadCSV = () => {
    const csv = [
      ["Timestamp", "Utilisateur", "Action", "Ressource", "Détails"],
      ...logs.map((log) => [
        log.timestamp,
        log.user,
        log.action,
        log.resource,
        log.details,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const downloadJSON = () => {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  if (error && logs.length === 0 && !selectedLog) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Logs d'Audit
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Consultez tous les événements et actions du système
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total"
          value={stats.total.toString()}
          icon={<Activity size={20} className="text-violet-600" />}
          color="violet"
        />
        <StatCard
          title="Créations"
          value={stats.creates.toString()}
          icon={<Plus size={20} className="text-green-600" />}
          color="green"
        />
        <StatCard
          title="Modifications"
          value={stats.updates.toString()}
          icon={<Edit size={20} className="text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Suppressions"
          value={stats.deletes.toString()}
          icon={<Trash2 size={20} className="text-red-600" />}
          color="red"
        />
        <StatCard
          title="Aujourd'hui"
          value={stats.todayLogs.toString()}
          icon={<TrendingUp size={20} className="text-orange-600" />}
          color="orange"
        />
      </div>

      {/* Activity Chart */}
      {activity.length > 0 && <ActivityChart data={activity} />}

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher par utilisateur, action ou ressource..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
              showFilters
                ? "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter size={20} />
            <span>Filtres</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Télécharger en CSV"
            >
              <Download size={20} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={downloadJSON}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              title="Télécharger en JSON"
            >
              <Download size={20} />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'action
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action === "ALL" ? "Toutes les actions" : action}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            {(selectedAction !== "ALL" || startDate || endDate) && (
              <button
                onClick={() => {
                  setSelectedAction("ALL");
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-violet-600 dark:text-violet-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              Chargement des logs...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                  <SortHeader
                    field="timestamp"
                    label="Timestamp"
                    onSort={handleSort}
                    currentSort={sortField}
                    currentOrder={sortOrder}
                    getSortIcon={getSortIcon}
                  />
                  <SortHeader
                    field="user"
                    label="Utilisateur"
                    onSort={handleSort}
                    currentSort={sortField}
                    currentOrder={sortOrder}
                    getSortIcon={getSortIcon}
                  />
                  <SortHeader
                    field="action"
                    label="Action"
                    onSort={handleSort}
                    currentSort={sortField}
                    currentOrder={sortOrder}
                    getSortIcon={getSortIcon}
                  />
                  <SortHeader
                    field="resource"
                    label="Ressource"
                    onSort={handleSort}
                    currentSort={sortField}
                    currentOrder={sortOrder}
                    getSortIcon={getSortIcon}
                  />
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Détails
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <time dateTime={log.timestamp}>
                            {new Date(log.timestamp).toLocaleString("fr-FR")}
                          </time>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          {log.user}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`font-mono font-semibold px-3 py-1 rounded-full text-xs ${
                            log.action === "CREATE"
                              ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                              : log.action === "UPDATE"
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {log.resource}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                          <CheckCircle size={14} />
                          OK
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1 px-3 py-2 rounded text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline text-xs">
                            Détails
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Aucun log trouvé
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 space-y-4">
        {/* Page Size Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Logs par page:
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={5000}>5000</option>
              <option value={10000}>10000 (max)</option>
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: <strong>{stats.total}</strong> logs
          </p>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pageSize >= 10000
              ? `Affichage de ${Math.min(10000, stats.total)} logs (max)`
              : `Page ${currentPage} sur ${totalPages}`}
          </p>
          {pageSize < 10000 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button className="px-4 py-2 rounded-lg bg-violet-600 text-white">
                {currentPage}
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Détails du Log
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="ID" value={selectedLog.id} />
              <DetailRow
                label="Timestamp"
                value={new Date(selectedLog.timestamp).toLocaleString("fr-FR")}
              />
              <DetailRow label="Utilisateur" value={selectedLog.user} />
              <DetailRow
                label="Action"
                value={selectedLog.action}
                highlight={true}
              />
              <DetailRow label="Ressource" value={selectedLog.resource} />
              <DetailRow
                label="Détails"
                value={selectedLog.details}
                multiline={true}
              />
              <DetailRow
                label="Statut"
                value={selectedLog.status}
                highlight={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: { [key: string]: string } = {
    violet:
      "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30",
    green:
      "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30",
    blue: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30",
    red: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30",
    orange:
      "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

function SortHeader({
  field,
  label,
  onSort,
  currentSort,
  currentOrder,
  getSortIcon,
}: {
  field: SortField;
  label: string;
  onSort: (field: SortField) => void;
  currentSort: SortField;
  currentOrder: SortOrder;
  getSortIcon: (field: SortField) => React.ReactNode;
}) {
  return (
    <th
      onClick={() => onSort(field)}
      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center gap-2">
        {label}
        {getSortIcon(field)}
      </div>
    </th>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
  multiline = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 last:border-b-0">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm ${multiline ? "whitespace-pre-wrap" : ""} ${
          highlight
            ? "font-semibold text-violet-600 dark:text-violet-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ActivityChart({ data }: { data: ActivityData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const minCount = Math.min(...data.map((d) => d.count), 0);
  const avgCount = Math.round(
    data.reduce((a, b) => a + b.count, 0) / data.length
  );
  const totalCount = data.reduce((a, b) => a + b.count, 0);

  const getColor = (count: number) => {
    if (count === maxCount && count > 0) return "from-violet-600 to-violet-400";
    if (count <= avgCount * 0.5) return "from-blue-500 to-blue-400";
    if (count <= avgCount) return "from-violet-500 to-violet-400";
    return "from-violet-600 to-violet-400";
  };

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activité (24h)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Distribution des événements par heure
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              Moyenne
            </span>
            <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
              {avgCount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              Pic
            </span>
            <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
              {maxCount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              Total
            </span>
            <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {/* Chart Bars */}
        <div className="flex items-end justify-between h-48 gap-1">
          {data.map((item, idx) => {
            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const hour = new Date(item.time).getHours();
            const isCurrentHour = new Date().getHours() === hour;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center relative group"
              >
                {/* Bar with dynamic height */}
                <div
                  className={`w-full bg-gradient-to-t ${getColor(item.count)} rounded-t-lg opacity-75 hover:opacity-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative`}
                  style={
                    {
                      // eslint-disable-next-line react/no-unknown-property
                      "--bar-height": `${Math.max(8, height)}%`,
                    } as React.CSSProperties & Record<string, string>
                  }
                >
                  <div style={{ height: `${Math.max(8, height)}%` }}>
                    {/* Value label on bar */}
                    {height > 20 && (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs font-bold text-white drop-shadow-md">
                          {item.count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hour label */}
                <div className="mt-3 text-center">
                  <span
                    className={`text-xs font-medium ${
                      isCurrentHour
                        ? "text-violet-600 dark:text-violet-400 font-bold"
                        : "text-gray-500 dark:text-gray-500"
                    }`}
                  >
                    {String(hour).padStart(2, "0")}h
                  </span>
                  {isCurrentHour && (
                    <div className="inline-block w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full mt-1"></div>
                  )}
                </div>

                {/* Hover Tooltip */}
                <div className="absolute -top-14 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold">{item.count} logs</div>
                  <div className="text-gray-300">
                    {String(hour).padStart(2, "0")}:00 -{" "}
                    {String(hour + 1).padStart(2, "0")}:00
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs flex-wrap gap-4">
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded bg-gradient-to-t from-violet-600 to-violet-400"
                title="Activité normale"
              ></div>
              <span className="text-gray-600 dark:text-gray-400">
                Activité normale
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded bg-gradient-to-t from-violet-600 to-violet-400 opacity-100"
                title="Pic d'activité"
              ></div>
              <span className="text-gray-600 dark:text-gray-400">
                Pic d'activité
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-violet-600 dark:bg-violet-400"
                title="Heure actuelle"
              ></div>
              <span className="text-gray-600 dark:text-gray-400">
                Heure actuelle
              </span>
            </div>
          </div>
          <span className="text-gray-500 dark:text-gray-500">
            Dernières 24 heures
          </span>
        </div>
      </div>
    </div>
  );
}
