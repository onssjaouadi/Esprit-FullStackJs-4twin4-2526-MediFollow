"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  XCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllAlerts } from "@/lib/actions/alert.actions";
import { formatDateTime } from "@/lib/utils";

export default function DoctorAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "DOCTOR") {
        router.push("/dashboard");
        return;
      }

      const result = await getAllAlerts();

      if (result.alerts) {
        setAlerts(result.alerts);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN":
        return {
          icon: AlertCircle,
          label: "Actif",
          color: "text-red-600 bg-red-50",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
        };
      case "ACKNOWLEDGED":
        return {
          icon: Clock,
          label: "Acquittée",
          color: "text-yellow-600 bg-yellow-50",
          badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
        };
      case "RESOLVED":
        return {
          icon: CheckCircle,
          label: "Résolue",
          color: "text-green-600 bg-green-50",
          badgeColor: "bg-green-100 text-green-700 border-green-200",
        };
      default:
        return {
          icon: AlertCircle,
          label: "En attente",
          color: "text-gray-600 bg-gray-50",
          badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const filteredAlerts = alerts
    .filter((alert) =>
      filter === "all"
        ? true
        : filter === "open"
          ? alert.status === "OPEN"
          : filter === "acknowledged"
            ? alert.status === "ACKNOWLEDGED"
            : alert.status === "RESOLVED"
    )
    .filter(
      (alert) =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alertType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (alert.patient?.user &&
          `${alert.patient.user.firstName} ${alert.patient.user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );

  const openCount = alerts.filter((a) => a.status === "OPEN").length;
  const totalCount = alerts.length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Search Bar - YouTube Style */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher une alerte, patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
                {totalCount} alertes
              </span>
              {openCount > 0 && (
                <span className="rounded-full bg-red-50 px-3 py-1.5 font-medium text-red-700">
                  {openCount} actives
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alertes patients</h1>
          <p className="mt-2 text-gray-600">
            Gérez et consultez les alertes de vos patients
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "all"
                ? "border-gray-900 bg-gray-100 text-gray-900"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "open"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <AlertCircle size={16} />
            Actives
          </button>
          <button
            onClick={() => setFilter("acknowledged")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "acknowledged"
                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Clock size={16} />
            Acquittées
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "resolved"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CheckCircle size={16} />
            Résolues
          </button>
        </div>

        {/* Alerts List - YouTube Style */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-900">
                Aucune alerte
              </h3>
              <p className="mt-2 text-gray-600">
                {filter === "all"
                  ? "Tous vos patients sont stables ! Aucune alerte pour le moment."
                  : "Aucune alerte ne correspond à ce filtre."}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const statusConfig = getStatusConfig(alert.status);
              const StatusIcon = statusConfig.icon;
              const patientName =
                alert.patient?.user &&
                `${alert.patient.user.firstName} ${alert.patient.user.lastName}`;

              return (
                <Link
                  key={alert.id}
                  href={`/dashboard/doctor/alerts/${alert.id}`}
                >
                  <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-lg ${statusConfig.color} flex items-center justify-center`}
                      >
                        <StatusIcon size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {alert.alertType === "VITAL"
                                ? "Alerte Signes Vitaux"
                                : alert.alertType === "SYMPTOM"
                                  ? "Alerte Symptôme"
                                  : "Alerte Système"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </p>
                            {patientName && (
                              <p className="text-xs text-gray-500 mt-1 font-medium">
                                Patient: {patientName}
                                {alert.patient?.medicalRecordNumber &&
                                  ` (MRN: ${alert.patient.medicalRecordNumber})`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span
                              className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(alert.severity)}`}
                            >
                              {alert.severity}
                            </span>
                            <span
                              className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.badgeColor}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Créée: {formatDateTime(alert.createdAt)}
                          </span>
                          {alert.acknowledgedAt && (
                            <span>
                              Acquittée: {formatDateTime(alert.acknowledgedAt)}
                            </span>
                          )}
                          {alert.resolvedAt && (
                            <span>
                              Résolue: {formatDateTime(alert.resolvedAt)}
                            </span>
                          )}
                        </div>

                        {/* Resolution */}
                        {alert.resolution && (
                          <div className="rounded-lg bg-green-50 border border-green-200 p-3 mb-3">
                            <p className="text-xs font-medium text-green-900 mb-1">
                              Résolution:
                            </p>
                            <p className="text-sm text-green-800">
                              {alert.resolution}
                            </p>
                          </div>
                        )}

                        {/* Data Details */}
                        {alert.data && (
                          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                            <p className="text-xs font-medium text-gray-900 mb-2">
                              Détails:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                              {alert.data.vitalType && (
                                <div>
                                  <span className="font-medium">Type:</span>{" "}
                                  {alert.data.vitalType}
                                </div>
                              )}
                              {alert.data.value !== undefined && (
                                <div>
                                  <span className="font-medium">Valeur:</span>{" "}
                                  {alert.data.value}
                                </div>
                              )}
                              {alert.data.threshold && (
                                <div className="col-span-2">
                                  <span className="font-medium">Seuil:</span>{" "}
                                  {alert.data.threshold.min} -{" "}
                                  {alert.data.threshold.max}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={20}
                        className="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
