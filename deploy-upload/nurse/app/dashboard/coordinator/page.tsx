"use client";

import {
  Users,
  CheckCircle,
  XCircle,
  FileQuestion,
  MessageSquare,
  Search,
  AlertCircle,
  TrendingUp,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getCoordinatorDashboardStats,
  getPatientComplianceStatus,
  getNonCompliantPatients,
} from "@/lib/actions/coordinator.actions";
import { StatCard } from "@/components/StatCard";

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [nonCompliantPatients, setNonCompliantPatients] = useState<any[]>([]);

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

      if (currentUser.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Load dashboard stats
      const statsResult = await getCoordinatorDashboardStats();
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Load non-compliant patients
      const nonCompliantResult = await getNonCompliantPatients();
      if (nonCompliantResult.success && nonCompliantResult.data) {
        setNonCompliantPatients(nonCompliantResult.data);
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord coordinateur
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Link
              href="/dashboard/coordinator/communications"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
              Envoyer un message
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            type="appointments"
            count={stats?.totalPatientsMonitored || 0}
            label="Patients surveillés"
            icon="/assets/icons/appointments.svg"
          />
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conformes aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.compliantToday || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <XCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Non-conformes aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.nonCompliantToday || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
                <FileQuestion className="text-yellow-600 dark:text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Questionnaires en attente
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.pendingQuestionnaires || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/coordinator/compliance"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Suivi de conformité
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voir l'état de conformité
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/coordinator/communications"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Communications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Envoyer rappels et conseils
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/coordinator/verify"
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                <Search className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Vérifier les entrées
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contrôler l'exhaustivité
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Non-Compliant Patients */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Patients non-conformes
              </h2>
              <Link
                href="/dashboard/coordinator/compliance"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {nonCompliantPatients.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-3" size={48} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tous les patients sont conformes aujourd'hui
                  </p>
                </div>
              ) : (
                nonCompliantPatients.slice(0, 5).map((item: any) => (
                  <Link
                    key={item.patient.id}
                    href={`/dashboard/coordinator/compliance/${item.patient.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.patient.user.firstName} {item.patient.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Statut: {item.complianceStatus}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                      Action requise
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Communications */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Communications récentes
              </h2>
              <Link
                href="/dashboard/coordinator/communications"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {!stats?.recentCommunications || stats.recentCommunications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Aucune communication récente
                </p>
              ) : (
                stats.recentCommunications.slice(0, 5).map((comm: any) => (
                  <div
                    key={comm.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <MessageSquare
                      className={
                        comm.type === "REMINDER"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }
                      size={20}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {comm.type === "REMINDER" ? "Rappel" : comm.type === "GUIDANCE" ? "Conseil" : "Suivi"}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${comm.isRead ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                          {comm.isRead ? "Lu" : "Non lu"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {comm.message.substring(0, 60)}
                        {comm.message.length > 60 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(comm.sentAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
