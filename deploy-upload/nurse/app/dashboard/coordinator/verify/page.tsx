"use client";

import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Activity,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getIncompleteVitalEntries } from "@/lib/actions/coordinator.actions";

export default function VerifyEntriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [incompleteEntries, setIncompleteEntries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }

      const result = await getIncompleteVitalEntries();
      if (result.success && result.data) {
        setIncompleteEntries(result.data);
      }
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return incompleteEntries;

    const query = searchQuery.toLowerCase();
    return incompleteEntries.filter((entry) => {
      const patientName = entry.patient?.user
        ? `${entry.patient.user.firstName} ${entry.patient.user.lastName}`.toLowerCase()
        : "";
      return patientName.includes(query);
    });
  }, [incompleteEntries, searchQuery]);

  const getMissingFields = (entry: any) => {
    const fields = [];
    if (!entry.systolicBP) fields.push("Tension systolique");
    if (!entry.diastolicBP) fields.push("Tension diastolique");
    if (!entry.heartRate) fields.push("Fréquence cardiaque");
    if (!entry.temperature) fields.push("Température");
    if (!entry.oxygenSaturation) fields.push("Saturation O₂");
    return fields;
  };

  const getCompletenessPercentage = (entry: any) => {
    const totalFields = 5; // systolicBP, diastolicBP, heartRate, temperature, oxygenSaturation
    const filledFields = [
      entry.systolicBP,
      entry.diastolicBP,
      entry.heartRate,
      entry.temperature,
      entry.oxygenSaturation,
    ].filter(Boolean).length;
    return Math.round((filledFields / totalFields) * 100);
  };

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
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vérification des entrées
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vérifiez l'exhaustivité des données soumises par les patients
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entrées incomplètes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incompleteEntries.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Derniers 7 jours
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incompleteEntries.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Taux de complétion moyen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incompleteEntries.length > 0
                    ? Math.round(
                        incompleteEntries.reduce(
                          (sum, entry) => sum + getCompletenessPercentage(entry),
                          0
                        ) / incompleteEntries.length
                      )
                    : 100}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par nom de patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              {searchQuery ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune entrée correspondante
                </p>
              ) : (
                <>
                  <CheckCircle
                    className="mx-auto text-green-600 dark:text-green-400 mb-4"
                    size={48}
                  />
                  <p className="text-gray-500 dark:text-gray-400">
                    Toutes les entrées récentes sont complètes
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const missingFields = getMissingFields(entry);
              const completeness = getCompletenessPercentage(entry);
              const patientName = entry.patient?.user
                ? `${entry.patient.user.firstName} ${entry.patient.user.lastName}`
                : "Patient inconnu";

              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {completeness >= 80 ? (
                          <AlertCircle className="text-yellow-600" size={24} />
                        ) : (
                          <XCircle className="text-red-600" size={24} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/dashboard/coordinator/compliance/${entry.patient?.id}`}
                            className="font-semibold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {patientName}
                          </Link>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              completeness >= 80
                                ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {completeness}% complet
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              Date:{" "}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {new Date(entry.recordedAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          {entry.enteredByRole && (
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Entré par:{" "}
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {entry.enteredByRole === "NURSE"
                                  ? "Infirmier(ère)"
                                  : "Patient"}
                              </span>
                            </div>
                          )}

                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              MRN:{" "}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {entry.patient?.medicalRecordNumber}
                            </span>
                          </div>
                        </div>

                        {/* Present Values */}
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Données présentes:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.systolicBP && entry.diastolicBP && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded">
                                ✓ Tension: {entry.systolicBP}/{entry.diastolicBP}
                              </span>
                            )}
                            {entry.heartRate && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded">
                                ✓ FC: {entry.heartRate} bpm
                              </span>
                            )}
                            {entry.temperature && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded">
                                ✓ Temp: {entry.temperature}°C
                              </span>
                            )}
                            {entry.oxygenSaturation && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded">
                                ✓ SpO₂: {entry.oxygenSaturation}%
                              </span>
                            )}
                            {entry.weight && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded">
                                ✓ Poids: {entry.weight} kg
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Missing Fields */}
                        {missingFields.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                              Champs manquants:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {missingFields.map((field, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs rounded"
                                >
                                  ✗ {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/dashboard/coordinator/compliance/${entry.patient?.id}`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        Voir patient
                      </Link>
                      <Link
                        href="/dashboard/coordinator/communications"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                      >
                        Contacter
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">À propos de la vérification</p>
              <p>
                Cette page affiche les entrées des 7 derniers jours qui sont
                incomplètes. Une entrée est considérée comme incomplète si elle ne
                contient pas tous les signes vitaux essentiels (tension artérielle,
                fréquence cardiaque, température, saturation en oxygène). Contactez
                les patients concernés pour compléter leurs données.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
