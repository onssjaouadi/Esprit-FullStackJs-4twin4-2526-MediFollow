"use client";

import {
  Users,
  AlertCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bell,
  Search,
  Clock,
  MoreVertical,
  ChevronRight,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAllAlerts, getAlertStats } from "@/lib/actions/alert.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getDashboardStats } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";
import { AlertStatus } from "@/types/medifollow.types";

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      // Load alert stats
      const statsResult = await getAlertStats();
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Load comprehensive dashboard stats
      const dashStatsResult = await getDashboardStats();
      if (dashStatsResult.success && dashStatsResult.stats) {
        setDashboardStats(dashStatsResult.stats);
      }

      // Load recent alerts
      const alertsResult = await getAllAlerts(AlertStatus.OPEN);
      if (alertsResult.success && alertsResult.alerts) {
        setRecentAlerts(alertsResult.alerts.slice(0, 10));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* YouTube-style Top Bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Search Bar - Style YouTube */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher un patient, une alerte..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Stats - Enhanced with Dynamic Data */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Patients</p>
                  <p className="font-semibold text-gray-900">
                    {dashboardStats?.patients?.total || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <HeartPulse size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vitaux (7j)</p>
                  <p className="font-semibold text-gray-900">
                    {dashboardStats?.vitals?.thisWeek || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Critiques</p>
                  <p className="font-semibold text-gray-900">
                    {dashboardStats?.alerts?.critical || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats Grid - ChatGPT Style (Clean & Minimal) */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Alerts */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-blue-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.totalAlerts || 0}
            </p>
            <p className="text-sm text-gray-600">Total des alertes</p>
          </div>

          {/* Open Alerts */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.openAlerts || 0}
            </p>
            <p className="text-sm text-gray-600">Alertes ouvertes</p>
          </div>

          {/* Critical Alerts */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Activity size={20} className="text-red-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.criticalAlerts || 0}
            </p>
            <p className="text-sm text-gray-600">Alertes critiques</p>
          </div>

          {/* Resolved Alerts */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.resolvedAlerts || 0}
            </p>
            <p className="text-sm text-gray-600">Alertes résolues</p>
          </div>
        </div>

        {/* Dynamic Statistics - Patients & Vitals */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patients Statistics */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Patients</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total actifs</span>
                <span className="text-lg font-bold text-gray-900">
                  {dashboardStats?.patients?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Actifs (7j)</span>
                <span className="text-base font-semibold text-blue-600">
                  {dashboardStats?.patients?.active || 0}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Nouveaux (7j)</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{dashboardStats?.patients?.newThisWeek || 0}
                  <TrendingUp size={12} />
                </span>
              </div>
            </div>
          </div>

          {/* Vitals Statistics */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <HeartPulse size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Signes vitaux</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cette semaine</span>
                <span className="text-lg font-bold text-gray-900">
                  {dashboardStats?.vitals?.thisWeek || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aujourd&apos;hui</span>
                <span className="text-base font-semibold text-green-600">
                  {dashboardStats?.vitals?.today || 0}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Symptômes (24h)</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  {dashboardStats?.symptoms?.today || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity size={20} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taux résolution</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                      style={{
                        width: `${dashboardStats?.alerts?.resolutionRate || 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {dashboardStats?.alerts?.resolutionRate || 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Temps réponse</span>
                <span className="text-base font-semibold text-purple-600">
                  {dashboardStats?.alerts?.avgResponseTime || 0}h
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Alertes critiques</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    (dashboardStats?.alerts?.critical || 0) > 0
                      ? "text-red-600 bg-red-50"
                      : "text-green-600 bg-green-50"
                  }`}
                >
                  {dashboardStats?.alerts?.critical || 0}
                  {(dashboardStats?.alerts?.critical || 0) > 0 ? (
                    <AlertTriangle size={12} />
                  ) : (
                    <CheckCircle size={12} />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Type Distribution */}
        {dashboardStats?.bloodTypeDistribution &&
          dashboardStats.bloodTypeDistribution.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <Activity size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Distribution des groupes sanguins
                    </h3>
                    <p className="text-xs text-gray-500">
                      Répartition des patients par type sanguin
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {dashboardStats.bloodTypeDistribution.map(
                  (bt: { bloodType: string; count: number }) => (
                    <div
                      key={bt.bloodType}
                      className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <span className="text-2xl font-bold text-red-600 mb-1">
                        {bt.count}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {bt.bloodType}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Quick Navigation - YouTube Style Chips */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <Link href="/dashboard/doctor/patients">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Users size={16} />
              Patients
            </button>
          </Link>
          <Link href="/dashboard/doctor/vitals">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <HeartPulse size={16} />
              Signes vitaux
            </button>
          </Link>
          <Link href="/dashboard/doctor/analytics">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <TrendingUp size={16} />
              Analytiques
            </button>
          </Link>
          <Link href="/dashboard/doctor/reports">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Stethoscope size={16} />
              Rapports
            </button>
          </Link>
        </div>

        {/* Recent Alerts - YouTube Video List Style */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Alertes récentes
            </h2>
            <Link
              href="/dashboard/doctor/alerts"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Voir tout
              <ChevronRight size={16} />
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900 mb-1">
                Aucune alerte active
              </p>
              <p className="text-sm text-gray-500">
                Toutes les alertes sont résolues
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentAlerts.map((alert: any) => (
                <Link
                  key={alert.id}
                  href={`/dashboard/doctor/alerts/${alert.id}`}
                  className="group block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex gap-4">
                      {/* Patient Avatar - YouTube Thumbnail Style */}
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-40 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          <div className="text-3xl font-bold text-white">
                            {alert.patient?.user?.firstName?.charAt(0)}
                            {alert.patient?.user?.lastName?.charAt(0)}
                          </div>
                          {/* Severity Badge - Like YouTube Duration */}
                          <div
                            className={`absolute bottom-2 right-2 rounded px-2 py-0.5 text-xs font-bold text-white ${
                              alert.severity === "CRITICAL"
                                ? "bg-red-600"
                                : alert.severity === "HIGH"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                            }`}
                          >
                            {alert.severity}
                          </div>
                        </div>
                      </div>

                      {/* Alert Details - YouTube Video Info Style */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Alert Title */}
                            <h3 className="text-base font-medium text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {alert.message}
                            </h3>

                            {/* Patient Name */}
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm text-gray-600">
                                {alert.patient?.user
                                  ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`
                                  : "Patient inconnu"}
                              </p>
                              {alert.severity === "CRITICAL" && (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                                  <AlertCircle size={12} />
                                  Urgent
                                </span>
                              )}
                            </div>

                            {/* Meta Info - YouTube Style */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDateTime(alert.createdAt)}
                              </div>
                              <span>•</span>
                              <span className="capitalize">
                                {alert.status === "OPEN"
                                  ? "Non traité"
                                  : alert.status === "IN_PROGRESS"
                                    ? "En cours"
                                    : "Résolu"}
                              </span>
                            </div>
                          </div>

                          {/* More Options Button */}
                          <button
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                            title="Plus d'options"
                            aria-label="Plus d'options"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
