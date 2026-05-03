"use client";

import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Calendar,
  Send,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getPatientComplianceStatus,
  sendReminderToPatient,
} from "@/lib/actions/coordinator.actions";

export default function CompliancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    loadCompliance();
  }, []);

  async function loadCompliance() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const result = await getPatientComplianceStatus();
      if (result.success && result.data) {
        setComplianceData(result.data);
      }
    } catch (error) {
      console.error("Error loading compliance:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReminder(patientId: string, patientName: string) {
    if (!user || sending) return;

    setSending(patientId);
    try {
      const message = `Rappel: Veuillez soumettre vos constantes vitales aujourd'hui pour votre suivi médical.`;
      const result = await sendReminderToPatient(patientId, user.id, message);

      if (result.success) {
        alert(`Rappel envoyé à ${patientName}`);
      } else {
        alert("Erreur lors de l'envoi du rappel");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Erreur lors de l'envoi du rappel");
    } finally {
      setSending(null);
    }
  }

  const filteredData = useMemo(() => {
    let filtered = complianceData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const fullName =
          `${item.patient.user.firstName} ${item.patient.user.lastName}`.toLowerCase();
        const mrn = item.patient.medicalRecordNumber.toLowerCase();
        return fullName.includes(query) || mrn.includes(query);
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [complianceData, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return {
          icon: <CheckCircle size={20} />,
          className:
            "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400",
          label: "Conforme",
        };
      case "PARTIAL":
        return {
          icon: <AlertCircle size={20} />,
          className:
            "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
          label: "Partiel",
        };
      case "NON_COMPLIANT":
        return {
          icon: <XCircle size={20} />,
          className:
            "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400",
          label: "Non-conforme",
        };
      default:
        return {
          icon: <AlertCircle size={20} />,
          className: "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400",
          label: "Inconnu",
        };
    }
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

  const compliantCount = complianceData.filter((d) => d.status === "COMPLIANT").length;
  const partialCount = complianceData.filter((d) => d.status === "PARTIAL").length;
  const nonCompliantCount = complianceData.filter((d) => d.status === "NON_COMPLIANT").length;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Suivi de conformité
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Surveillez la conformité des patients au protocole de suivi
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-gray-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complianceData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conformes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {compliantCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Partiels</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {partialCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Non-conformes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nonCompliantCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Rechercher par nom ou MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-4 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="COMPLIANT">Conformes</option>
              <option value="PARTIAL">Partiels</option>
              <option value="NON_COMPLIANT">Non-conformes</option>
            </select>
          </div>
        </div>

        {/* Compliance List */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== "all"
                  ? "Aucun patient correspondant"
                  : "Aucun patient à surveiller"}
              </p>
            </div>
          ) : (
            filteredData.map((item) => {
              const statusInfo = getStatusBadge(item.status);
              const fullName = `${item.patient.user.firstName} ${item.patient.user.lastName}`;

              return (
                <div
                  key={item.patient.id}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`mt-1 p-2 rounded-full ${statusInfo.className}`}>
                        {statusInfo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/dashboard/coordinator/compliance/${item.patient.id}`}
                            className="font-semibold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {fullName}
                          </Link>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              MRN: {item.patient.medicalRecordNumber}
                            </span>
                          </div>

                          {item.complianceRecord && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <span
                                  className={
                                    item.complianceRecord.vitalsSubmitted
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }
                                >
                                  {item.complianceRecord.vitalsSubmitted ? "✓" : "✗"} Signes
                                  vitaux
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <span
                                  className={
                                    item.complianceRecord.questionnairesCompleted
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }
                                >
                                  {item.complianceRecord.questionnairesCompleted ? "✓" : "○"}{" "}
                                  Questionnaires
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {item.patient.vitalRecords && item.patient.vitalRecords.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dernière entrée:{" "}
                            {new Date(
                              item.patient.vitalRecords[0].recordedAt
                            ).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {item.status !== "COMPLIANT" && (
                        <button
                          onClick={() => handleSendReminder(item.patient.id, fullName)}
                          disabled={sending === item.patient.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={16} />
                          {sending === item.patient.id ? "Envoi..." : "Rappel"}
                        </button>
                      )}
                      <Link
                        href={`/dashboard/coordinator/compliance/${item.patient.id}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
