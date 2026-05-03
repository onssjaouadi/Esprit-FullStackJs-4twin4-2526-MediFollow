"use client";

import { History, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getCoordinatorReminderHistory } from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

export default function CoordinatorRemindersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      const res = await getCoordinatorReminderHistory(80);
      if (res.success && res.reminders) {
        setReminders(res.reminders);
      } else {
        setError(res.error || "Impossible de charger les rappels");
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <History className="size-7 text-blue-600" />
          Historique des rappels
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Rappels manuels envoyés aux patients (canaux enregistrés).
        </p>
        <Link
          href="/dashboard/coordinator/patients"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Envoyer un rappel depuis la fiche patient
        </Link>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <ul className="mt-8 space-y-3">
          {reminders.length === 0 ? (
            <li className="text-sm text-gray-500">Aucun rappel pour l’instant.</li>
          ) : (
            reminders.map((r) => {
              if (!r.patient) {
                return (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4"
                  >
                    <div className="flex justify-between gap-2 text-xs text-gray-500">
                      <span>{r.createdAt ? formatDateTime(r.createdAt) : "Date inconnue"}</span>
                      <span className="text-amber-600 dark:text-amber-400">(Patient supprimé)</span>
                    </div>
                    <p className="mt-1 font-semibold text-amber-700 dark:text-amber-300">
                      [Données orphelines]
                    </p>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {r.message || "(Aucun message)"}
                    </p>
                  </li>
                );
              }
              const patientName = r.patient?.user
                ? `${r.patient.user.firstName || ""} ${r.patient.user.lastName || ""}`.trim()
                : "Patient inconnu";
              return (
                <li
                  key={r.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="flex justify-between gap-2 text-xs text-gray-500">
                    <span>{r.createdAt ? formatDateTime(r.createdAt) : "Date inconnue"}</span>
                    <span>{(r.channels || []).join(", ") || "Aucun canal"}</span>
                  </div>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {patientName}
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {r.message || "(Aucun message)"}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
