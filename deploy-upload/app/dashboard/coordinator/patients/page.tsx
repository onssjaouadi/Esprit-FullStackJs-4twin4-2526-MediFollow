"use client";

import {
  Search,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Filter,
  Building2,
  Stethoscope,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getCoordinatorPatientsDetailed } from "@/lib/actions/coordinator.actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const getDaysRemainingText = (date: any) => {
  if (!date) return "Aucun";
  const dueDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "En retard";
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  return `Dans ${diffDays} j.`;
};

const getDeadlineColor = (date: any) => {
  if (!date) return "text-gray-400 dark:text-gray-600";
  const dueDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return "text-red-500 dark:text-red-400 font-bold animate-pulse";
  if (diffDays <= 1) return "text-amber-500 dark:text-amber-400 font-bold";
  return "text-blue-600 dark:text-blue-400 font-medium";
};

export default function CoordinatorPatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("search") || "";
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState(initialQ);
  const [deptFilter, setDeptFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const uniqueDepartments = useMemo(() => {
    const depts = patients.map((p) => p.department || "Général");
    return Array.from(new Set(depts)).sort();
  }, [patients]);

  const uniqueDoctors = useMemo(() => {
    const docs = patients.flatMap((p) => p.assignedDoctors || []);
    return Array.from(new Set(docs)).sort();
  }, [patients]);
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
          credentials: "include",
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
    return patients.filter((p) => {
      // 1. Search Query
      const name =
        `${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`.toLowerCase();
      const mrn = (p.medicalRecordNumber ?? "").toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      const matchesSearch =
        !q || name.includes(q) || mrn.includes(q) || email.includes(q);

      // 2. Department Filter
      const pDept = p.department || "Général";
      const matchesDept = !deptFilter || pDept === deptFilter;

      // 3. Doctor Filter
      const matchesDoctor =
        !doctorFilter || (p.assignedDoctors || []).includes(doctorFilter);

      return matchesSearch && matchesDept && matchesDoctor;
    });
  }, [patients, query, deptFilter, doctorFilter]);

  const resetFilters = () => {
    setQuery("");
    setDeptFilter("");
    setDoctorFilter("");
  };

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

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, dossier, email…"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <Filter className="size-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Filtres
              </span>
            </div>

            <div className="relative min-w-[160px]">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-8 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">Tous les services</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[160px]">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-8 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">Tous les docteurs</option>
                {uniqueDoctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>

            {(query || deptFilter || doctorFilter) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
              >
                <X className="size-4" />
                Réinitialiser
              </button>
            )}
          </div>
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
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">
                  Département
                </th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">
                  Docteur(s)
                </th>
                <th className="px-4 py-3 font-semibold">Conformité</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Questionnaires (7j)
                </th>
                <th className="px-4 py-3 font-semibold">Échéance</th>
                <th className="px-4 py-3 font-semibold">Aujourd&apos;hui</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
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
                        {p.user?.firstName || "Patient supprimé"}{" "}
                        {p.user?.lastName || ""}
                      </p>
                      <p className="text-xs text-gray-500 md:hidden">
                        {p.medicalRecordNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-300">
                      {p.medicalRecordNumber || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {p.department || "Général"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex flex-col gap-0.5 max-w-[150px]">
                        {p.assignedDoctors && p.assignedDoctors.length > 0 ? (
                          p.assignedDoctors.map((doc: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs text-gray-600 dark:text-gray-400 truncate"
                            >
                              Dr. {doc}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Non assigné
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
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
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium">
                          ✓ {p.compliance?.questionnaireResolved7d ?? 0}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ⏳ {p.compliance?.questionnairePending7d ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span
                          className={`text-[11px] uppercase tracking-wider font-extrabold ${getDeadlineColor(p.nextDeadline)}`}
                        >
                          {getDaysRemainingText(p.nextDeadline)}
                        </span>
                        {p.nextDeadline && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-500">
                            {format(new Date(p.nextDeadline), "dd MMM", {
                              locale: fr,
                            })}
                          </span>
                        )}
                      </div>
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
