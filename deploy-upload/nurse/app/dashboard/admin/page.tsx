"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCog,
  Activity,
  AlertCircle,
  Shield,
  Database,
  Clock,
  CheckCircle,
  Search,
  ChevronRight,
  Settings,
  TrendingUp,
  FileText,
  BarChart3,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAlertStats } from "@/lib/actions/alert.actions";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    openAlerts: 0,
  });

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

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      // Load alert stats
      const alertStatsResult = await getAlertStats();
      if (alertStatsResult.success && alertStatsResult.stats) {
        setStats((prev: any) => ({
          ...prev,
          ...alertStatsResult.stats,
        }));
      }

      // Note: Add actual user stats API calls here
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
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Rechercher utilisateurs, alertes, journaux..."
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

           {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Utilisateurs</p>
                  <p className="font-semibold text-gray-900">
                    {stats.totalUsers || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Critiques</p>
                  <p className="font-semibold text-gray-900">
                    {stats.criticalAlerts || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Administration MediFollow 🛡️
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestion et supervision de la plateforme
          </p>
        </div>

        {/* Main Stats Grid - Minimal Style */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalUsers || 0}
            </p>
            <p className="text-sm text-gray-600">Utilisateurs inscrits</p>
          </div>

          {/* Total Patients */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Activity size={20} className="text-green-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalPatients || 0}
            </p>
            <p className="text-sm text-gray-600">Patients actifs</p>
          </div>

          {/* Total Doctors */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <UserCog size={20} className="text-purple-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalDoctors || 0}
            </p>
            <p className="text-sm text-gray-600">Médecins</p>
          </div>

          {/* Critical Alerts */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats.criticalAlerts || 0}
            </p>
            <p className="text-sm text-gray-600">Alertes critiques</p>
          </div>
        </div>

        {/* System Health - Secondary Stats */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Database Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Database size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Base de données</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle size={12} />
                Opérationnelle
              </span>
            </div>
          </div>

          {/* API Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">API</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle size={12} />
                Fonctionnelle
              </span>
            </div>
          </div>

          {/* Blockchain Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Shield size={20} className="text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Blockchain</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                <Clock size={12} />
                En attente
              </span>
            </div>
          </div>
        </div>

        {/* Alert Stats Detailed */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statistiques des alertes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAlerts || 0}
                </p>
              </div>
              <AlertCircle size={32} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50">
              <div>
                <p className="text-sm text-orange-700">Ouvertes</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.openAlerts || 0}
                </p>
              </div>
              <Clock size={32} className="text-orange-500" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
              <div>
                <p className="text-sm text-green-700">Résolues</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.resolvedAlerts || 0}
                </p>
              </div>
              <CheckCircle size={32} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions - YouTube Chips Style */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <Link href="/dashboard/admin/users">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Users size={16} />
              Utilisateurs
            </button>
          </Link>
          <Link href="/dashboard/admin/alerts">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <AlertCircle size={16} />
              Alertes
            </button>
          </Link>
          <Link href="/dashboard/admin/audit">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <FileText size={16} />
              Audit
            </button>
          </Link>
          <Link href="/dashboard/admin/blockchain">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Shield size={16} />
              Blockchain
            </button>
          </Link>
          <Link href="/dashboard/admin/analytics">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <BarChart3 size={16} />
              Analytiques
            </button>
          </Link>
          <Link href="/dashboard/admin/settings">
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Settings size={16} />
              Paramètres
            </button>
          </Link>
        </div>

        {/* Management Modules - Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Management */}
          <Link href="/dashboard/admin/users" className="group">
            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Gestion Utilisateurs
              </h3>
              <p className="text-sm text-gray-600">
                Créer et gérer les comptes
              </p>
            </div>
          </Link>

          {/* Alert Supervision */}
          <Link href="/dashboard/admin/alerts" className="group">
            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                  <AlertCircle size={24} className="text-orange-600" />
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Supervision Alertes
              </h3>
              <p className="text-sm text-gray-600">
                Surveiller toutes les alertes
              </p>
            </div>
          </Link>

          {/* Audit Log */}
          <Link href="/dashboard/admin/audit" className="group">
            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Database size={24} className="text-purple-600" />
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Journal d&apos;Audit
              </h3>
              <p className="text-sm text-gray-600">
                Historique des actions
              </p>
            </div>
          </Link>

          {/* Blockchain */}
          <Link href="/dashboard/admin/blockchain" className="group">
            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Shield size={24} className="text-green-600" />
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Blockchain</h3>
              <p className="text-sm text-gray-600">
                Preuves et vérifications
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
