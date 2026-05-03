"use client";

import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  TrendingUp,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronRight,
  MoreVertical,
  Calendar,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getPatientAlerts } from "@/lib/actions/alert.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getVitalRecords, getVitalStats } from "@/lib/actions/vital.actions";
import { formatDateTime } from "@/lib/utils";

export default function PatientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentVitals, setRecentVitals] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      setPatient(user.patient);

      if (user.patient?.id) {
        const patientId = user.patient.id;

        // Load recent vitals
        const vitalsResult = await getVitalRecords(patientId, 10);
        if (vitalsResult.success && vitalsResult.records) {
          setRecentVitals(vitalsResult.records);
          if (vitalsResult.records.length > 0) {
            setLatestVitals(vitalsResult.records[0]);
          }
        }

        // Load stats
        const statsResult = await getVitalStats(patientId, 7);
        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats);
        }

        // Load alerts
        const alertsResult = await getPatientAlerts(patientId);
        if (alertsResult.success && alertsResult.alerts) {
          setAlerts(alertsResult.alerts);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  const getVitalStatus = (
    value: number | null | undefined,
    min: number,
    max: number
  ) => {
    if (!value) return "gray";
    if (value < min || value > max) return "red";
    if (value < min * 1.1 || value > max * 0.9) return "yellow";
    return "green";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "red":
        return "text-red-600 bg-red-50";
      case "yellow":
        return "text-yellow-600 bg-yellow-50";
      case "green":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* YouTube-style Top Bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher dans vos données médicales..."
                  className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-400 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mesures (7j)
                  </p>
                  <p className="font-semibold text-gray-900">
                    {recentVitals.length}
                  </p>
                </div>
              </div>
              {alerts.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alertes
                    </p>
                    <p className="font-semibold text-gray-900">
                      {alerts.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bonjour, {patient?.user?.firstName || "Patient"} 👋
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Suivez vos signes vitaux et restez en bonne santé
            </p>
          </div>
          <Link
            href="/dashboard/patient/vitals"
            className="hidden lg:flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            Nouvelle mesure
          </Link>
        </div>

        {/* Alert Banner */}
        {alerts.length > 0 && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {alerts.length} alerte{alerts.length > 1 ? "s" : ""} active
                  {alerts.length > 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-red-700">
                  Certaines de vos mesures nécessitent votre attention
                </p>
              </div>
              <Link
                href="/dashboard/patient/alerts"
                className="text-sm font-medium text-red-700 hover:text-red-900 flex items-center gap-1"
              >
                Voir tout
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Latest Vitals Cards - Minimal Style */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Blood Pressure */}
          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart size={20} className="text-red-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {latestVitals?.systolicBP || "--"}/
              {latestVitals?.diastolicBP || "--"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Tension artérielle
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Moy: {stats?.avgSystolicBP?.toFixed(0) || "--"}/
              {stats?.avgDiastolicBP?.toFixed(0) || "--"} mmHg
            </p>
          </div>

          {/* Heart Rate */}
          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {latestVitals?.heartRate || "--"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Fréquence cardiaque
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Moy: {stats?.avgHeartRate?.toFixed(0) || "--"} bpm
            </p>
          </div>

          {/* Temperature */}
          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Thermometer size={20} className="text-orange-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {latestVitals?.temperature || "--"}°
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Température
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Moy: {stats?.avgTemperature?.toFixed(1) || "--"}°C
            </p>
          </div>

          {/* SpO2 */}
          <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Wind size={20} className="text-green-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {latestVitals?.oxygenSaturation || "--"}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              SpO2
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Moy: {stats?.avgOxygenSaturation?.toFixed(1) || "--"}%
            </p>
          </div>
        </div>

        {/* Quick Actions - YouTube Chips Style */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <Link href="/dashboard/patient/vitals">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Plus size={16} />
              Nouvelle mesure
            </button>
          </Link>
          <Link href="/dashboard/patient/alerts">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <AlertCircle size={16} />
              Mes alertes
            </button>
          </Link>
          <Link href="/dashboard/patient/vitals/history">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <TrendingUp size={16} />
              Historique
            </button>
          </Link>
          <Link href="/dashboard/patient/vitals/history">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Calendar size={16} />
              Graphiques
            </button>
          </Link>
          <Link href="/dashboard/patient/guide">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <BookOpen size={16} />
              Guide de suivi
            </button>
          </Link>
        </div>

        {/* Recent Measurements - YouTube Video List Style */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mesures récentes
            </h2>
            <Link
              href="/dashboard/patient/vitals/history"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Voir tout
              <ChevronRight size={16} />
            </Link>
          </div>

          {recentVitals.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Clock size={32} className="text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900 mb-1">
                Aucune mesure enregistrée
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Commencez à suivre vos signes vitaux
              </p>
              <Link
                href="/dashboard/patient/vitals"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Première mesure
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentVitals.map((vital: any) => {
                const hasAbnormal =
                  vital.systolicBP > 140 ||
                  vital.systolicBP < 90 ||
                  vital.heartRate > 100 ||
                  vital.heartRate < 60 ||
                  vital.temperature > 37.5 ||
                  vital.temperature < 36 ||
                  vital.oxygenSaturation < 95;

                return (
                  <div
                    key={vital.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="px-6 py-4">
                      <div className="flex gap-4">
                        {/* Visual Indicator */}
                        <div className="flex-shrink-0">
                          <div
                            className={`h-20 w-20 rounded-xl flex items-center justify-center ${
                              hasAbnormal ? "bg-red-100" : "bg-green-100"
                            }`}
                          >
                            {hasAbnormal ? (
                              <XCircle size={32} className="text-red-600" />
                            ) : (
                              <CheckCircle
                                size={32}
                                className="text-green-600"
                              />
                            )}
                          </div>
                        </div>

                        {/* Vital Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    hasAbnormal
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {hasAbnormal ? "Anormal" : "Normal"}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  •
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateTime(vital.recordedAt)}
                                </span>
                              </div>

                              {/* Metrics Grid */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-500 text-xs">
                                    Tension
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {vital.systolicBP || "--"}/
                                    {vital.diastolicBP || "--"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">FC</p>
                                  <p className="font-semibold text-gray-900">
                                    {vital.heartRate || "--"} bpm
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Temp</p>
                                  <p className="font-semibold text-gray-900">
                                    {vital.temperature || "--"}°C
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">SpO2</p>
                                  <p className="font-semibold text-gray-900">
                                    {vital.oxygenSaturation || "--"}%
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* More Button */}
                            <button
                              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                              title="Plus d'options"
                              aria-label="Plus d'options"
                            >
                              <MoreVertical
                                size={16}
                                className="text-gray-600"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
