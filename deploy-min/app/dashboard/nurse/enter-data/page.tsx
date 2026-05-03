"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAssignedPatients } from "@/lib/actions/nurse.actions";
import { createVitalRecord } from "@/lib/actions/vital.actions";
import {
  parseVitalsFromVoice,
  generateVitalReport,
} from "@/lib/actions/ai.actions";
import SubmitButton from "@/components/SubmitButton";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { VoiceEntryButton } from "@/components/nurse/VoiceEntryButton";
import { TranscriptDisplay } from "@/components/nurse/TranscriptDisplay";
import { AIReportDialog } from "@/components/nurse/AIReportDialog";

export default function NurseEnterDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedVitals, setParsedVitals] = useState<any>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    language: "en-US",
    onResult: async (result) => {
      if (result.isFinal && result.transcript) {
        setVoiceTranscript((prev) => prev + result.transcript + " ");
      }
    },
  });

  useEffect(() => {
    const fullTranscript = voiceTranscript + interimTranscript;
    setVoiceTranscript(fullTranscript);
  }, [interimTranscript]);

  async function handleParseVoice() {
    if (!voiceTranscript.trim()) return;

    setIsParsing(true);
    const parsed = await parseVitalsFromVoice(voiceTranscript);
    if (parsed.success && parsed.vitals) {
      setParsedVitals(parsed.vitals);

      // Auto-fill form fields
      const form = document.querySelector("form");
      if (form) {
        if (parsed.vitals.systolicBP) {
          (
            form.querySelector('[name="systolicBP"]') as HTMLInputElement
          ).value = parsed.vitals.systolicBP.toString();
        }
        if (parsed.vitals.diastolicBP) {
          (
            form.querySelector('[name="diastolicBP"]') as HTMLInputElement
          ).value = parsed.vitals.diastolicBP.toString();
        }
        if (parsed.vitals.heartRate) {
          (form.querySelector('[name="heartRate"]') as HTMLInputElement).value =
            parsed.vitals.heartRate.toString();
        }
        if (parsed.vitals.temperature) {
          (
            form.querySelector('[name="temperature"]') as HTMLInputElement
          ).value = parsed.vitals.temperature.toString();
        }
        if (parsed.vitals.oxygenSaturation) {
          (
            form.querySelector('[name="oxygenSaturation"]') as HTMLInputElement
          ).value = parsed.vitals.oxygenSaturation.toString();
        }
        if (parsed.vitals.weight) {
          (form.querySelector('[name="weight"]') as HTMLInputElement).value =
            parsed.vitals.weight.toString();
        }
        // Auto-fill notes with voice transcript
        const notesField = form.querySelector(
          '[name="notes"]'
        ) as HTMLTextAreaElement;
        if (notesField && voiceTranscript) {
          notesField.value = `[Voice Transcription]\n${voiceTranscript}`;
        }
      }
    }
    setIsParsing(false);
  }

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "NURSE") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const result = await getAssignedPatients(currentUser.id);
      if (result.success && result.data) {
        setPatients(result.data);
        if (result.data.length === 0) {
          setError(
            "No patients assigned to you. Please contact your administrator."
          );
        }
      } else {
        setError(result.error || "Failed to load patients. Please try again.");
        console.error("Failed to load patients:", result.error);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("An unexpected error occurred. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!selectedPatientId) {
        setError("Please select a patient");
        setSubmitting(false);
        return;
      }

      const formData = new FormData(e.currentTarget);

      const result = await createVitalRecord(
        selectedPatientId,
        formData,
        user.id,
        "NURSE"
      );

      if (result.success) {
        setSuccess("Data saved successfully!");

        // Generate AI report and show dialog BEFORE resetting form
        if (result.vitalRecord?.id) {
          try {
            setGeneratingReport(true);
            const report = await generateVitalReport(result.vitalRecord.id);
            setGeneratingReport(false);
            if (report.success && "report" in report) {
              setAiReport(report.report);
              setShowReportDialog(true);
            }
          } catch (reportError) {
            console.error("AI report generation error:", reportError);
            setGeneratingReport(false);
            // Continue even if report fails
          }
        }

        // Reset form after report generation
        if (e.currentTarget) {
          e.currentTarget.reset();
        }
        setSelectedPatientId("");
        setParsedVitals(null);
        setVoiceTranscript("");
      } else {
        setError(result.error || "Error saving data");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Error saving data");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white"></div>
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
      <div className="mb-6">
        <Link
          href="/dashboard/nurse"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Enter Data for Patient
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Enregistrez les constantes vitales au nom d'un patient
        </p>
      </div>

      {/* Error message for failed loading */}
      {error && !patients.length && (
        <div className="mx-auto max-w-4xl mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {/* Voice Entry Section */}
        {selectedPatientId && (
          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <VoiceEntryButton
                isListening={isListening}
                isParsing={isParsing}
                onStart={() => {
                  resetTranscript();
                  setVoiceTranscript("");
                  setParsedVitals(null);
                  startListening();
                }}
                onStop={async () => {
                  stopListening();
                  await handleParseVoice();
                }}
              />
              {voiceTranscript && (
                <button
                  type="button"
                  onClick={() => {
                    setVoiceTranscript("");
                    setParsedVitals(null);
                    resetTranscript();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Effacer
                </button>
              )}
            </div>

            <TranscriptDisplay
              transcript={transcript}
              interimTranscript={interimTranscript}
              parsedVitals={parsedVitals}
              isListening={isListening}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sélectionner le patient
            </h2>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
            >
              <option value="">-- Choisir un patient --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.user.firstName} {patient.user.lastName} (MRN:{" "}
                  {patient.medicalRecordNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Vital Signs Form */}
          {selectedPatientId && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                    <Activity
                      className="text-blue-600 dark:text-blue-400"
                      size={20}
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Constantes vitales
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blood Pressure */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pression artérielle systolique (mmHg)
                    </label>
                    <input
                      type="number"
                      name="systolicBP"
                      step="1"
                      min="60"
                      max="250"
                      placeholder="120"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pression artérielle diastolique (mmHg)
                    </label>
                    <input
                      type="number"
                      name="diastolicBP"
                      step="1"
                      min="40"
                      max="150"
                      placeholder="80"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  {/* Heart Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fréquence cardiaque (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate"
                      step="1"
                      min="40"
                      max="200"
                      placeholder="75"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Température (°C)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      step="0.1"
                      min="35"
                      max="42"
                      placeholder="37.0"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  {/* Oxygen Saturation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Saturation en oxygène (%)
                    </label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      step="1"
                      min="70"
                      max="100"
                      placeholder="98"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      step="0.1"
                      min="20"
                      max="300"
                      placeholder="70.0"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Notes supplémentaires..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4 text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-4">
                <SubmitButton isLoading={submitting}>
                  Enregistrer les données
                </SubmitButton>
                <Link
                  href="/dashboard/nurse"
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Annuler
                </Link>
              </div>
            </>
          )}
        </form>
      </div>

      {/* AI Report Dialog */}
      <AIReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        report={aiReport}
        title="Rapport AI - Signes Vitaux"
      />

      {/* Loading overlay for report generation */}
      {generatingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white font-medium">
              Génération du rapport AI...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyse des données en cours
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
