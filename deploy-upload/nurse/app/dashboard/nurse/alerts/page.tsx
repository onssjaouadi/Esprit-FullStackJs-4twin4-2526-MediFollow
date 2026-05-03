"use client";

import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getNursePatientAlerts, acknowledgeAlertAsNurse } from "@/lib/actions/nurse.actions";

export default function NurseAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "NURSE") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const result = await getNursePatientAlerts(currentUser.id);
      if (result.success && result.data) {
        setAlerts(result.data);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(alertId: string) {
    if (!user) return;

    try {
      const result = await acknowledgeAlertAsNurse(alertId, user.id);
      if (result.success) {
        // Refresh alerts
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  }

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((alert) => {
        const patientName = alert.patient?.user
          ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`.toLowerCase()
          : "";
        const message = alert.message?.toLowerCase() || "";
        return patientName.includes(query) || message.includes(query);
      });
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    return filtered;
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="text-red-600" size={20} />;
      case "HIGH":
        return <AlertTriangle className="text-orange-600" size={20} />;
      case "MEDIUM":
        return <AlertTriangle className="text-yellow-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400";
      case "ACKNOWLEDGED":
        return "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "RESOLVED":
        return "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-black min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Alert Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Alerts for your assigned patients
        </p>
      </div>

      <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.severity === "CRITICAL").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Élevées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.severity === "HIGH").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.status === "OPEN").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acknowledged</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter((a) => a.status === "ACKNOWLEDGED").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none appearance-none"
              >
                <option value="all">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-4 text-sm text-gray-900 dark:text-white focus:border-green-500 focus:outline-none appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                  ? "No matching alerts"
                  : "No active alerts"}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/dashboard/nurse/patients/${alert.patient?.id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
                        >
                          {alert.patient?.user?.firstName}{" "}
                          {alert.patient?.user?.lastName}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeClass(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(alert.createdAt).toLocaleString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span>Type: {alert.alertType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {alert.status === "OPEN" && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <Link
                      href={`/dashboard/nurse/patients/${alert.patient?.id}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                    >
                      View Patient
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Important Note</p>
              <p>
                As a nurse, you can view and acknowledge alerts, but only a doctor can resolve them.
                If an alert requires urgent medical attention, contact the attending physician immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
