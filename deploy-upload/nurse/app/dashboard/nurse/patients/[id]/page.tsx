"use client";

import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Calendar,
  Phone,
  User,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { getVitalRecords } from "@/lib/actions/vital.actions";
import { isPatientAssignedToNurse } from "@/lib/actions/nurse.actions";
import { generatePatientReport } from "@/lib/actions/ai.actions";
import { AIReportDialog } from "@/components/nurse/AIReportDialog";

export default function NursePatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitalRecords, setVitalRecords] = useState<any[]>([]);
  const [isAssigned, setIsAssigned] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, [params.id]);

  async function loadPatientData() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "NURSE") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Check if patient is assigned to this nurse
      const assignmentResult = await isPatientAssignedToNurse(
        currentUser.id,
        params.id
      );

      if (!assignmentResult.success || !assignmentResult.data) {
        router.push("/dashboard/nurse/patients");
        return;
      }

      setIsAssigned(true);

      // Load patient data
      const patientResult = await getPatientById(params.id);
      if (patientResult) {
        setPatient(patientResult);
      }

      // Load vital records
      const vitalsResult = await getVitalRecords(params.id, 30);
      if (vitalsResult.success && vitalsResult.records) {
        setVitalRecords(vitalsResult.records);
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
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

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-500 dark:text-gray-400">Patient not found</p>
      </div>
    );
  }

  const fullName = `${patient.user.firstName} ${patient.user.lastName}`;
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const activeAlerts = patient.alerts?.filter((a: any) => a.status === "OPEN").length || 0;

  async function handleGenerateReport() {
    setGeneratingReport(true);
    const result = await generatePatientReport(params.id);
    setGeneratingReport(false);
    if (result.success && 'report' in result) {
      setAiReport(result.report);
      setShowReportDialog(true);
    } else if (!result.success && 'error' in result) {
      alert("Error generating report: " + result.error);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/dashboard/nurse/patients"
            className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline mb-4"
          >
            <ArrowLeft size={16} />
            Back to Patients
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                MRN: {patient.medicalRecordNumber}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <FileText size={18} />
                {generatingReport ? "Génération..." : "Générer Rapport AI"}
              </button>
              <Link
                href={`/dashboard/nurse/enter-data?patientId=${patient.id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Enter Data
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Alerts Banner */}
        {activeAlerts > 0 && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-300">
                  {activeAlerts} alert{activeAlerts > 1 ? "s" : ""} active
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  This patient requires immediate attention
                </p>
              </div>
              <Link
                href="/dashboard/nurse/alerts"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                View Alerts
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Patient Info Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Patient Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {age} years
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {patient.gender}
                  </p>
                </div>
              </div>

              {patient.user.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.user.phoneNumber}
                    </p>
                  </div>
                </div>
              )}

              {patient.diagnosis && (
                <div className="flex items-start gap-3">
                  <FileText className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Diagnosis</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.diagnosis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Latest Vitals Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Latest Vitals
            </h2>
            {vitalRecords.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vitalRecords[0].systolicBP && vitalRecords[0].diastolicBP && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Blood Pressure
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {vitalRecords[0].systolicBP}/{vitalRecords[0].diastolicBP}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">mmHg</p>
                  </div>
                )}

                {vitalRecords[0].heartRate && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Heart Rate
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {vitalRecords[0].heartRate}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">bpm</p>
                  </div>
                )}

                {vitalRecords[0].temperature && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Température
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {vitalRecords[0].temperature}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">°C</p>
                  </div>
                )}

                {vitalRecords[0].oxygenSaturation && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      O₂ Saturation
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {vitalRecords[0].oxygenSaturation}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">%</p>
                  </div>
                )}

                {vitalRecords[0].weight && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weight</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {vitalRecords[0].weight}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">kg</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucune donnée vitale enregistrée
              </p>
            )}
            {vitalRecords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={16} />
                  <span>
                    Dernière mise à jour:{" "}
                    {new Date(vitalRecords[0].recordedAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vital Records History */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Entry History
            </h2>
            <TrendingUp className="text-gray-400" size={20} />
          </div>

          <div className="space-y-3">
            {vitalRecords.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucun historique disponible
              </p>
            ) : (
              vitalRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <Activity className="text-blue-600 dark:text-blue-400" size={20} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(record.recordedAt).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {record.enteredByRole === "NURSE" && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            Entered by Nurse
                          </span>
                        )}
                        {record.status && record.status !== "NORMAL" && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              record.status === "CRITIQUE"
                                ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            }`}
                          >
                            {record.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        BP: {record.systolicBP || "—"}/{record.diastolicBP || "—"} |
                        FC: {record.heartRate || "—"} | Temp: {record.temperature || "—"}°C
                        | SpO₂: {record.oxygenSaturation || "—"}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {record.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        "{record.notes.substring(0, 30)}
                        {record.notes.length > 30 ? "..." : ""}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Report Dialog */}
      <AIReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        report={aiReport}
        title={`Rapport AI - ${fullName}`}
      />

      {/* Loading overlay for report generation */}
      {generatingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center max-w-md">
            <div className="size-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Génération du rapport AI complet...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyse des données vitales, historique médical et génération des recommandations
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              Utilisation de RAG pour récupérer les données complètes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
