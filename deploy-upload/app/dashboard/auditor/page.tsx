"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  AlertCircle,
  FileText,
  TrendingUp,
  Activity,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.actions";

interface StatCard {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: string;
}

export default function AuditorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([
    {
      icon: FileText,
      label: "Logs Totaux",
      value: "2,543",
      change: "+12% ce mois",
      color: "from-violet-500 to-violet-600",
    },
    {
      icon: AlertCircle,
      label: "Incidents",
      value: "8",
      change: "-3% ce mois",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Users,
      label: "Utilisateurs Actifs",
      value: "142",
      change: "+5% ce mois",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Activity,
      label: "Modifications",
      value: "1,247",
      change: "+8% ce mois",
      color: "from-orange-500 to-orange-600",
    },
  ]);

  useEffect(() => {
    async function checkRole() {
      const user = await getCurrentUser();
      if (!user || user.role !== "AUDITOR") {
        router.push("/login");
      }
    }
    checkRole();
  }, [router]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tableau de Bord Auditeur
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Bienvenue en tant qu'auditeur. Voici un aperçu de la sécurité du
          système.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`rounded-xl bg-gradient-to-r ${stat.color} p-3`}
                >
                  <Icon className="size-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Accès Rapide
            </h2>
            <Shield className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/auditor/audit-logs"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Consulter les Logs d'Audit
              </span>
              <span className="text-violet-600 dark:text-violet-400">→</span>
            </Link>
            <Link
              href="/dashboard/auditor/incidents"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Incidents
              </span>
              <span className="text-violet-600 dark:text-violet-400">→</span>
            </Link>
            <Link
              href="/dashboard/auditor/modifications-history"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Historique des Modifications
              </span>
              <span className="text-violet-600 dark:text-violet-400">→</span>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Rapports
            </h2>
            <BarChart3 className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/auditor/reports"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Génération de Rapports
              </span>
              <span className="text-violet-600 dark:text-violet-400">→</span>
            </Link>
            <Link
              href="/dashboard/auditor/users"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Gestion des Utilisateurs
              </span>
              <span className="text-violet-600 dark:text-violet-400">→</span>
            </Link>
            <Link
              href="/dashboard/auditor/patients"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                Liste des Patients
              </span>
              <span className="text-violet-600 dark:text-violet-400">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/20 p-6">
        <div className="flex items-start gap-4">
          <Shield className="size-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Rappel de Sécurité
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tous vos accès et actions sont enregistrés et auditées. Veuillez
              respecter les protocoles de sécurité et les politiques de
              confidentialité en vigueur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
