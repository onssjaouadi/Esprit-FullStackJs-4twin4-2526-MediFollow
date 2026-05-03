"use client";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardList,
  Users,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getCoordinatorDashboardOverview } from "@/lib/actions/coordinator.actions";

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      const res = await getCoordinatorDashboardOverview();
      if (res.success && res.data) {
        setData(res.data);
        setLoadError(null);
      } else {
        setLoadError(res.error ?? "Impossible de charger le tableau de bord.");
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        {loadError ?? "Impossible de charger le tableau de bord."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50/80 to-white dark:from-blue-950/30 dark:to-black">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Espace coordinateur
          </p>
          <h1 className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
            Conformité du suivi post-hospitalisation
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Supervisez les protocoles, les entrées quotidiennes, les
            questionnaires et les alertes pour tous les patients.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Users className="size-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {data.assignedCount}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Patients suivis
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className="size-8 text-amber-600" />
              <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
                {data.missingVitalToday}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-amber-800/80 dark:text-amber-200/80">
              Sans constantes aujourd&apos;hui
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Activity className="size-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {data.openAlerts}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Alertes ouvertes
            </p>
            <p className="text-xs text-gray-400">
              {data.acknowledgedAlerts} en cours (acquittées)
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <TrendingUp className="size-8 text-emerald-600" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {data.avgCompliance}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Conformité moyenne (7 j.)
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Patients et conformité
              </h2>
              <Link
                href="/dashboard/coordinator/patients"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Tout voir
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.patients.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-500">
                  Aucun patient disponible.
                </p>
              ) : (
                data.patients.slice(0, 8).map((p: any) => (
                  <Link
                    key={p.patientId}
                    href={`/dashboard/coordinator/patients/${p.patientId}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {p.user?.firstName} {p.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.medicalRecordNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {p.missingVitalToday ? (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                          Entrée manquante
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          A jour
                        </span>
                      )}
                      <span className="text-sm font-black text-gray-900 dark:text-white w-12 text-right">
                        {p.overallScore}%
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="size-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Actions rapides
                </h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/dashboard/coordinator/ai-assistant"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <Brain className="size-4" />
                    Assistant IA d'analyse
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/patients"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Vérifier les patients en retard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/alerts"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Suivre les alertes médecins
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/reminders"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Historique des rappels
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/coordinator/guide"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Aider les patients à remplir leurs données
                  </Link>
                </li>
              </ul>
            </div>
            {data.unresolvedFlags > 0 && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 p-5">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                  {data.unresolvedFlags} signalement(s) ouvert(s)
                </p>
                <Link
                  href="/dashboard/coordinator/reviews"
                  className="mt-2 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Traiter les revues →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
