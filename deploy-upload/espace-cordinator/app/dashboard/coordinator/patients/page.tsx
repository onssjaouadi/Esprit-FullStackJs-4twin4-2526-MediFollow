"use client";

import {
  Search,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getCoordinatorPatientsDetailed } from "@/lib/actions/coordinator.actions";

export default function CoordinatorPatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("search") || "";
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState(initialQ);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      const res = await getCoordinatorPatientsDetailed();
      if (res.success && res.patients && res.patients.length > 0) {
        setPatients(res.patients);
        setLoadError(null);
      } else {
        // Fallback API direct (Prisma) pour éviter une liste vide en cas
        // d'échec/sérialisation côté server action.
        const fallback = await fetch("/api/coordinator/patients/all", {
          method: "GET",
          cache: "no-store",
        });
        const data = await fallback.json();
        if (fallback.ok && data?.success && Array.isArray(data?.patients)) {
          setPatients(data.patients);
          setLoadError(null);
        } else {
          setPatients([]);
          setLoadError(
            res.error ??
              data?.detail ??
              data?.error ??
              "Impossible de charger les patients."
          );
        }
      }
      setLoading(false);
    })();
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const name = `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.toLowerCase();
      const mrn = (p.medicalRecordNumber ?? "").toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      return name.includes(q) || mrn.includes(q) || email.includes(q);
    });
  }, [patients, query]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Mes patients
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Liste assignée — conformité sur 7 jours (constantes, symptômes,
          questionnaires).
        </p>

        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, dossier, email…"
            className="w-full rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-blue-400 focus:outline-none"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          {loadError && (
            <div className="px-4 py-3 border-b border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {loadError}
            </div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">
                  Dossier
                </th>
                <th className="px-4 py-3 font-semibold">Conformité</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Questionnaires (7j)
                </th>
                <th className="px-4 py-3 font-semibold">Aujourd&apos;hui</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Aucun patient trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {p.user?.firstName || "Patient supprimé"} {p.user?.lastName || ""}
                      </p>
                      <p className="text-xs text-gray-500 md:hidden">
                        {p.medicalRecordNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-300">
                      {p.medicalRecordNumber || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            style={{
                              width: `${p.compliance?.overallScore ?? 0}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {p.compliance?.overallScore ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600 dark:text-gray-300">
                      {p.compliance?.questionnaireCount7d ?? 0} / objectif 1+
                    </td>
                    <td className="px-4 py-3">
                      {p.compliance?.hasVitalToday ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="size-4" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold">
                          <AlertCircle className="size-4" /> Manquant
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/coordinator/patients/${p.id}`}
                        className="inline-flex text-blue-600 dark:text-blue-400"
                      >
                        <ChevronRight className="size-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
