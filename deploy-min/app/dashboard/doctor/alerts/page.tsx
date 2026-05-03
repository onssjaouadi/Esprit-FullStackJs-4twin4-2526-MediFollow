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
import { getAlertsByDoctorSpecialty } from "@/lib/actions/alert.actions";
import { getDoctorProfile } from "@/lib/actions/doctor.actions";
import { formatDateTime } from "@/lib/utils";

export default function DoctorAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

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

      // Load doctor profile to display specialty
      const profile = await getDoctorProfile(user.id);
      setDoctorProfile(profile);

      // Load alerts filtered by doctor's specialty
      const result = await getAlertsByDoctorSpecialty(user.id);

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
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN":
        return {
          icon: AlertCircle,
          label: "Actif",
          color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/20",
          badgeColor:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
        };
      case "ACKNOWLEDGED":
        return {
          icon: Clock,
          label: "Acquittée",
          color:
            "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/20",
          badgeColor:
            "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30",
        };
      case "RESOLVED":
        return {
          icon: CheckCircle,
          label: "Résolue",
          color:
            "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/20",
          badgeColor:
            "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
        };
      default:
        return {
          icon: AlertCircle,
          label: "En attente",
          color:
            "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-500/20",
          badgeColor:
            "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30",
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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 dark:border-gray-400 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Sticky Search Bar - YouTube Style */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
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
                className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 pl-12 pr-4 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-400 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                {totalCount} alertes
              </span>
              {openCount > 0 && (
                <span className="rounded-full bg-red-50 dark:bg-red-500/20 px-3 py-1.5 font-medium text-red-700 dark:text-red-300">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alertes patients
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez et consultez les alertes de vos patients
          </p>
          {doctorProfile?.data?.specialty && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
              Spécialité:{" "}
              <span className="capitalize">{doctorProfile.data.specialty}</span>
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "all"
                ? "border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "open"
                ? "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <AlertCircle size={16} />
            Actives
          </button>
          <button
            onClick={() => setFilter("acknowledged")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "acknowledged"
                ? "border-yellow-300 dark:border-yellow-500/50 bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Clock size={16} />
            Acquittées
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "resolved"
                ? "border-green-300 dark:border-green-500/50 bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <CheckCircle size={16} />
            Résolues
          </button>
        </div>

        {/* Alerts List - YouTube Style */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Aucune alerte
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {filter === "all"
                  ? doctorProfile?.data?.specialty
                    ? `Tous vos patients (spécialité: ${doctorProfile.data.specialty}) sont stables ! Aucune alerte pour le moment.`
                    : "Tous vos patients sont stables ! Aucune alerte pour le moment."
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
                  <div className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer">
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
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {alert.alertType === "VITAL"
                                ? "Alerte Signes Vitaux"
                                : alert.alertType === "SYMPTOM"
                                  ? "Alerte Symptôme"
                                  : "Alerte Système"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.message}
                            </p>
                            {patientName && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
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
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
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
                          <div className="rounded-lg bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 p-3 mb-3">
                            <p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">
                              Résolution:
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-200">
                              {alert.resolution}
                            </p>
                          </div>
                        )}

                        {/* Data Details */}
                        {alert.data && (
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-3">
                            <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                              Détails:
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
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
