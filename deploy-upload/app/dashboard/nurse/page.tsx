"use client";

import {
  Users,
  AlertCircle,
  Activity,
  ClipboardList,
  Plus,
  Search,
  Bell,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getNurseDashboardStats,
  getAssignedPatients,
  getPatientsNeedingDataEntry,
  getNursePatientAlerts,
} from "@/lib/actions/nurse.actions";
import { StatCard } from "@/components/StatCard";
import { formatDateTime } from "@/lib/utils";

export default function NurseDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [patientsNeedingData, setPatientsNeedingData] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "NURSE") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Load dashboard stats
      const statsResult = await getNurseDashboardStats(currentUser.id);
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Load patients needing data entry
      const patientsResult = await getPatientsNeedingDataEntry(currentUser.id);
      if (patientsResult.success && patientsResult.data) {
        setPatientsNeedingData(patientsResult.data);
      }

      // Load recent alerts
      const alertsResult = await getNursePatientAlerts(currentUser.id);
      if (alertsResult.success && alertsResult.data) {
        setRecentAlerts(alertsResult.data.slice(0, 5));
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
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-black min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bienvenue, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Link
            href="/dashboard/nurse/enter-data"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Entrer des données
          </Link>
        </div>
      </div>

      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            type="appointments"
            count={stats?.totalAssignedPatients || 0}
            label="Patients assignés"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={stats?.patientsNeedingDataEntry || 0}
            label="Besoin de données aujourd'hui"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={stats?.activeAlerts || 0}
            label="Alertes actives"
            icon="/assets/icons/cancelled.svg"
          />
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <Activity className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entrées aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.entriesMadeToday || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/nurse/patients"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <Users className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Mes patients
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voir tous les patients assignés
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/nurse/enter-data"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <ClipboardList className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Entrer des données
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enregistrer les constantes vitales
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/nurse/alerts"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <Bell className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Alertes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Surveiller les alertes patients
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patients Needing Data Entry */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Besoin de données aujourd'hui
              </h2>
              <Link
                href="/dashboard/nurse/patients"
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {patientsNeedingData.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucun patient n'a besoin de données aujourd'hui
                </p>
              ) : (
                patientsNeedingData.slice(0, 5).map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/dashboard/nurse/patients/${patient.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                        {patient.user.firstName.charAt(0)}
                        {patient.user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {patient.user.firstName} {patient.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          MRN: {patient.medicalRecordNumber}
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="text-gray-400" size={20} />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Alertes récentes
              </h2>
              <Link
                href="/dashboard/nurse/alerts"
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucune alerte active
                </p>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <AlertCircle
                      className={
                        alert.severity === "CRITICAL"
                          ? "text-red-600"
                          : alert.severity === "HIGH"
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }
                      size={20}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {alert.patient?.user?.firstName}{" "}
                        {alert.patient?.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString('en-US', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        {stats?.recentEntries && stats.recentEntries.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Dernières entrées
            </h2>
            <div className="space-y-3">
              {stats.recentEntries.slice(0, 5).map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="text-blue-600 dark:text-blue-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {entry.patient?.user?.firstName}{" "}
                        {entry.patient?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.recordedAt).toLocaleDateString('en-US', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      BP: {entry.systolicBP}/{entry.diastolicBP} | HR:{" "}
                      {entry.heartRate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
