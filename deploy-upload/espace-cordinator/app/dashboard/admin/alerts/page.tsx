"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes"; // Integrated for Somber mode
import Pusher from "pusher-js";
import AdminNotificationBell from "@/components/AdminNotificationBell";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  User,
  Calendar,
  AlertTriangle,
  Info,
} from "lucide-react";

interface Alert {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  message: string;
  createdAt: Date;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  patientId: string;
  patient?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string | null;
    };
  };
  acknowledgedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  resolvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
}

export default function AdminAlertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    const pusher = new Pusher("ba707a9085e391ba151b", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("admin-updates");
    const onNewAlert = async (payload: { title?: string; desc?: string }) => {
      setLiveMessage(payload?.desc || payload?.title || "New alert received");
      await loadAlerts();
      setTimeout(() => setLiveMessage(null), 5000);
    };

    channel.bind("new-alert", onNewAlert);

    return () => {
      channel.unbind("new-alert", onNewAlert);
      pusher.unsubscribe("admin-updates");
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchQuery, statusFilter, severityFilter, dateFrom, dateTo]);

  async function loadAlerts() {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetch("/api/alerts", { cache: "no-store" });
      const result = await response.json();
      if (result.success && result.alerts) {
        const mappedAlerts: Alert[] = result.alerts.map((alert: any) => ({
          ...alert,
          createdAt: alert.createdAt ? new Date(alert.createdAt) : new Date(),
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
        }));
        setAlerts(mappedAlerts);
        setFilteredAlerts(mappedAlerts);
      } else {
        setAlerts([]);
        setFilteredAlerts([]);
        setErrorMessage(result?.detail || result?.error || "Failed to load alerts");
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
      setAlerts([]);
      setFilteredAlerts([]);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }

  function filterAlerts() {
    let filtered = [...alerts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.message?.toLowerCase().includes(query) ||
          alert.alertType?.toLowerCase().includes(query) ||
          alert.patient?.user?.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    if (severityFilter !== "ALL") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`);
      filtered = filtered.filter((alert) => new Date(alert.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`);
      filtered = filtered.filter((alert) => new Date(alert.createdAt) <= to);
    }

    setFilteredAlerts(filtered);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSeverityFilter("ALL");
    setDateFrom("");
    setDateTo("");
  }

  // --- Helper Styling Functions ---

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "CRITICAL": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "HIGH": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "MEDIUM": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "OPEN": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "ACKNOWLEDGED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "RESOLVED": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  }

  // Icons and Labels remain consistent
  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "CRITICAL": return <AlertCircle size={14} />;
      case "HIGH": return <AlertTriangle size={14} />;
      case "MEDIUM": return <AlertCircle size={14} />;
      case "LOW": return <Info size={14} />;
      default: return <AlertCircle size={14} />;
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "OPEN": return <AlertCircle size={14} />;
      case "ACKNOWLEDGED": return <Clock size={14} />;
      case "RESOLVED": return <CheckCircle size={14} />;
      default: return null;
    }
  }

  function getSeverityLabel(severity: string) {
    const labels: Record<string, string> = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
    return labels[severity] || severity;
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = { OPEN: "Open", ACKNOWLEDGED: "Acknowledged", RESOLVED: "Resolved" };
    return labels[status] || status;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400 mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alert Supervision</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div>
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            Alert API error: {errorMessage}
          </div>
        )}
        {liveMessage && (
          <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-300">
            Admin notification: {liveMessage}
          </div>
        )}
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by message, type or email..."
              className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white"
            >
              <option value="ALL">All severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
              <Filter size={16} />
              <span>Active filters:</span>
            </div>
            {statusFilter !== "ALL" && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(statusFilter)}`}>
                {getStatusIcon(statusFilter)} Status: {getStatusLabel(statusFilter)}
              </span>
            )}
            {severityFilter !== "ALL" && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(severityFilter)}`}>
                {getSeverityIcon(severityFilter)} Severity: {getSeverityLabel(severityFilter)}
              </span>
            )}
            {(statusFilter !== "ALL" || severityFilter !== "ALL" || dateFrom || dateTo || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No alerts found</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">No alerts match the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Link key={alert.id} href={`/dashboard/admin/alerts/${alert.id}`} className="block group">
                <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md dark:hover:bg-slate-900/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {getSeverityIcon(alert.severity)} {getSeverityLabel(alert.severity)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)} {getStatusLabel(alert.status)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                        {alert.message || alert.alertType}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                        {alert.patient?.user && (
                          <span className="flex items-center gap-1"><User size={14} /> {alert.patient.user.firstName} {alert.patient.user.lastName}</span>
                        )}
                        <span className="flex items-center gap-1"><Calendar size={14} /> {alert.createdAt.toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        {alert.resolvedAt && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle size={14} /> Resolved</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 dark:text-slate-600 group-hover:text-gray-600 dark:group-hover:text-slate-400 transition-colors ml-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Summary Stats Bar */}
        <div className="mt-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div><p className="text-[10px] uppercase font-bold text-gray-500">Total</p><p className="text-xl font-black text-gray-900 dark:text-white">{alerts.length}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-orange-500">Open</p><p className="text-xl font-black text-orange-600">{alerts.filter(a => a.status === "OPEN").length}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-indigo-500">Acknowledged</p><p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{alerts.filter(a => a.status === "ACKNOWLEDGED").length}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-emerald-500">Resolved</p><p className="text-xl font-black text-emerald-600">{alerts.filter(a => a.status === "RESOLVED").length}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}