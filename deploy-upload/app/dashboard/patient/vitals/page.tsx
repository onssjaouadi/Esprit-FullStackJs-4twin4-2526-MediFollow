"use client";

import {
  AlertCircle,
  CheckCircle2,
  Heart,
  Link,
  Loader2,
  Save,
  Scale,
  Thermometer,
  TrendingUp,
  Wind,
  Mic,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import loading from "@/app/loading";
import { SYMPTOM_TYPES } from "@/lib/utils/symptom-utils";
import { VoiceVitalsForm } from "@/components/VoiceVitalsForm";
import { Button } from "@/components/ui/button";
import { div } from "three/src/nodes/math/OperatorNode.js";
import { label } from "three/src/nodes/core/ContextNode.js";

type SpecialtySymptoms = {
  CARDIOLOGY: string[];
  PULMONOLOGY: string[];
  GASTROENTEROLOGY: string[];
  NEUROLOGY: string[];
  GENERAL_MEDICINE: string[];
  [key: string]: string[];
};

const SPECIALTY_SYMPTOMS: SpecialtySymptoms = {
  CARDIOLOGY: ["douleur thoracique", "palpitations"],
  PULMONOLOGY: ["essoufflement", "toux", "expectoration"],
  GASTROENTEROLOGY: ["nausée", "vomissements", "diarrhée"],
  NEUROLOGY: ["vertiges", "confusion"],
  GENERAL_MEDICINE: [],
  ENDOCRINOLOGY: [],
  RHEUMATOLOGY: [],
  ONCOLOGY: [],
  NEPHROLOGY: [],
  OTHER: [],
};

export default function VitalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  const [vitals, setVitals] = useState({
    temperature: "",
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    oxygenSaturation: "",
    weight: "",
    respiratoryRate: "",
  });

  const [symptoms, setSymptoms] = useState({
    fatigue: 0,
    fever: false,
    lossOfAppetite: 0,
    specialtySymptoms: {} as Record<string, any>,
    glycemia: "",
    crp: "",
    diuresis: "",
    hydration: "normal",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleVitalChange = (field: string, value: string) => {
    setVitals((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGeneralSymptomChange = (field: string, value: any) => {
    setSymptoms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialtySymptomChange = (field: string, value: any) => {
    setSymptoms((prev) => ({
      ...prev,
      specialtySymptoms: {
        ...prev.specialtySymptoms,
        [field]: value,
      },
    }));
  };

  const specialty = user?.patient?.specialty || "GENERAL_MEDICINE";
  const specialtySymptomsList = SPECIALTY_SYMPTOMS[specialty] || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/patient/vitals-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vitals: {
            temperature: vitals.temperature
              ? parseFloat(vitals.temperature)
              : null,
            heartRate: vitals.heartRate ? parseFloat(vitals.heartRate) : null,
            systolicBP: vitals.systolicBP
              ? parseFloat(vitals.systolicBP)
              : null,
            diastolicBP: vitals.diastolicBP
              ? parseFloat(vitals.diastolicBP)
              : null,
            oxygenSaturation: vitals.oxygenSaturation
              ? parseFloat(vitals.oxygenSaturation)
              : null,
            weight: vitals.weight ? parseFloat(vitals.weight) : null,
            respiratoryRate: vitals.respiratoryRate
              ? parseFloat(vitals.respiratoryRate)
              : null,
          },
          symptoms: {
            general: {
              fatigue: symptoms.fatigue,
              fever: symptoms.fever,
              lossOfAppetite: symptoms.lossOfAppetite,
            },
            specialty: symptoms.specialtySymptoms,
            advanced: {
              glycemia: symptoms.glycemia
                ? parseFloat(symptoms.glycemia)
                : null,
              crp: symptoms.crp ? parseFloat(symptoms.crp) : null,
              diuresis: symptoms.diuresis
                ? parseFloat(symptoms.diuresis)
                : null,
              hydration: symptoms.hydration,
            },
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      // Store alert, evaluation, and health status data
      if (data.alert) {
        setAlertData(data.alert);
      }
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
      if (data.healthStatus) {
        setHealthStatus(data.healthStatus);
      }

      setSuccess(true);
      // Only redirect after 3 seconds so user can see anomalies
      setTimeout(() => {
        router.push("/dashboard/patient");
      }, 3000);
    } catch (err: any) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Heart className="size-12 text-red-600 mx-auto" />
          </div>
          <p className="text-gray-600 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  // Define fields for voice form
  const voiceFields = [
    {
      name: "temperature",
      label: "Température Corporelle",
      question: "Quelle est votre température corporelle en degrés Celsius?",
      type: "number" as const,
      placeholder: "37.0",
      min: 35,
      max: 42,
      step: 0.1,
      unit: "°C",
    },
    {
      name: "heartRate",
      label: "Fréquence Cardiaque",
      question: "Quel est votre rythme cardiaque en battements par minute?",
      type: "number" as const,
      placeholder: "75",
      min: 40,
      max: 200,
      step: 1,
      unit: "bpm",
    },
    {
      name: "systolicBP",
      label: "Tension Systolique",
      question:
        "Quelle est votre tension systolique en millimètres de mercure?",
      type: "number" as const,
      placeholder: "120",
      min: 60,
      max: 200,
      step: 1,
      unit: "mmHg",
    },
    {
      name: "diastolicBP",
      label: "Tension Diastolique",
      question:
        "Quelle est votre tension diastolique en millimètres de mercure?",
      type: "number" as const,
      placeholder: "80",
      min: 40,
      max: 130,
      step: 1,
      unit: "mmHg",
    },
    {
      name: "oxygenSaturation",
      label: "Saturation en Oxygène",
      question: "Quel est votre taux de saturation en oxygène en pourcentage?",
      type: "number" as const,
      placeholder: "98",
      min: 70,
      max: 100,
      step: 0.1,
      unit: "%",
    },
    {
      name: "weight",
      label: "Poids",
      question: "Quel est votre poids en kilogrammes?",
      type: "number" as const,
      placeholder: "70",
      min: 20,
      max: 300,
      step: 0.1,
      unit: "kg",
    },
    {
      name: "respiratoryRate",
      label: "Fréquence Respiratoire",
      question: "Quel est votre nombre de respirations par minute?",
      type: "number" as const,
      placeholder: "16",
      min: 8,
      max: 60,
      step: 1,
      unit: "resp/min",
    },
  ];

  // Handle voice form submission
  const handleVoiceFormSubmit = async (voiceData: Record<string, any>) => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/patient/vitals-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vitals: {
            temperature: voiceData.temperature
              ? parseFloat(voiceData.temperature)
              : null,
            heartRate: voiceData.heartRate
              ? parseFloat(voiceData.heartRate)
              : null,
            systolicBP: voiceData.systolicBP
              ? parseFloat(voiceData.systolicBP)
              : null,
            diastolicBP: voiceData.diastolicBP
              ? parseFloat(voiceData.diastolicBP)
              : null,
            oxygenSaturation: voiceData.oxygenSaturation
              ? parseFloat(voiceData.oxygenSaturation)
              : null,
            weight: voiceData.weight ? parseFloat(voiceData.weight) : null,
            respiratoryRate: voiceData.respiratoryRate
              ? parseFloat(voiceData.respiratoryRate)
              : null,
          },
          symptoms: {
            general: {
              fatigue: 0,
              fever: false,
              lossOfAppetite: 0,
            },
            specialty: {},
            advanced: {
              glycemia: null,
              crp: null,
              diuresis: null,
              hydration: "normal",
            },
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      setSuccess(true);
      // Speak success message
      const utterance = new SpeechSynthesisUtterance(
        "Vos constantes vitales ont été enregistrées avec succès!"
      );
      utterance.lang = "fr-FR";
      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        router.push("/dashboard/patient");
      }, 3000);
    } catch (err: any) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show voice form if voice mode is enabled
  if (voiceMode) {
    return (
      <VoiceVitalsForm
        fields={voiceFields}
        onSubmit={handleVoiceFormSubmit}
        title="Saisie des Constantes Vitales par Voix"
        description="Répondez aux questions en parlant. Vous pouvez aussi passer en mode manuel."
        config={{ language: "fr-FR", rate: 1, pitch: 1 }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-8 text-red-600" />
              <h1 className="text-3xl font-black text-gray-900">
                Saisie des constantes vitales & symptômes
              </h1>
            </div>
            <Button
              onClick={() => setVoiceMode(true)}
              variant="outline"
              className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Mic className="h-4 w-4" />
              Mode Vocal
            </Button>
          </div>
          <p className="text-gray-600">
            Veuillez entrer vos mesures du jour et vos symptômes
          </p>
          {specialty !== "GENERAL_MEDICINE" && (
            <p className="text-sm text-blue-600 font-semibold mt-2">
              Formulaire personnalisé pour:{" "}
              <span className="capitalize">{specialty.toLowerCase()}</span>
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="size-5 text-red-600 shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 space-y-4">
            {/* Success Notification */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
              <CheckCircle2 className="size-5 text-green-600 shrink-0" />
              <p className="text-green-800">
                Constantes et symptômes enregistrés avec succès!
              </p>
            </div>

            {/* AI Health Status Card */}
            {healthStatus && (
              <div
                className={`rounded-lg border p-6 ${
                  healthStatus.severity === "CRITICAL"
                    ? "border-red-300 bg-red-50"
                    : healthStatus.severity === "POOR"
                      ? "border-orange-300 bg-orange-50"
                      : healthStatus.severity === "FAIR"
                        ? "border-yellow-300 bg-yellow-50"
                        : healthStatus.severity === "GOOD"
                          ? "border-blue-300 bg-blue-50"
                          : "border-green-300 bg-green-50"
                }`}
              >
                {/* Header with Severity and Classification */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      healthStatus.severity === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : healthStatus.severity === "POOR"
                          ? "bg-orange-600 text-white"
                          : healthStatus.severity === "FAIR"
                            ? "bg-yellow-600 text-white"
                            : healthStatus.severity === "GOOD"
                              ? "bg-blue-600 text-white"
                              : "bg-green-600 text-white"
                    }`}
                  >
                    {healthStatus.severity === "CRITICAL"
                      ? "🔴"
                      : healthStatus.severity === "POOR"
                        ? "🟠"
                        : healthStatus.severity === "FAIR"
                          ? "🟡"
                          : healthStatus.severity === "GOOD"
                            ? "🔵"
                            : "🟢"}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold mb-1 ${
                        healthStatus.severity === "CRITICAL"
                          ? "text-red-900"
                          : healthStatus.severity === "POOR"
                            ? "text-orange-900"
                            : healthStatus.severity === "FAIR"
                              ? "text-yellow-900"
                              : healthStatus.severity === "GOOD"
                                ? "text-blue-900"
                                : "text-green-900"
                      }`}
                    >
                      {healthStatus.classification}
                    </h3>
                    <p
                      className={`text-sm ${
                        healthStatus.severity === "CRITICAL"
                          ? "text-red-800"
                          : healthStatus.severity === "POOR"
                            ? "text-orange-800"
                            : healthStatus.severity === "FAIR"
                              ? "text-yellow-800"
                              : healthStatus.severity === "GOOD"
                                ? "text-blue-800"
                                : "text-green-800"
                      }`}
                    >
                      AI Classification:{" "}
                      <span className="font-semibold">
                        {healthStatus.severity}
                      </span>
                    </p>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="mb-4 p-3 rounded bg-white bg-opacity-50">
                  <p
                    className={`text-sm font-medium mb-2 ${
                      healthStatus.severity === "CRITICAL"
                        ? "text-red-900"
                        : healthStatus.severity === "POOR"
                          ? "text-orange-900"
                          : healthStatus.severity === "FAIR"
                            ? "text-yellow-900"
                            : healthStatus.severity === "GOOD"
                              ? "text-blue-900"
                              : "text-green-900"
                    }`}
                  >
                    📊 AI Analysis:
                  </p>
                  <p
                    className={`text-sm ${
                      healthStatus.severity === "CRITICAL"
                        ? "text-red-800"
                        : healthStatus.severity === "POOR"
                          ? "text-orange-800"
                          : healthStatus.severity === "FAIR"
                            ? "text-yellow-800"
                            : healthStatus.severity === "GOOD"
                              ? "text-blue-800"
                              : "text-green-800"
                    }`}
                  >
                    {healthStatus.insights}
                  </p>
                </div>

                {/* Risk Factors */}
                {healthStatus.riskFactors &&
                  healthStatus.riskFactors.length > 0 && (
                    <div className="mb-4">
                      <h4
                        className={`font-bold text-sm mb-2 ${
                          healthStatus.severity === "CRITICAL"
                            ? "text-red-900"
                            : healthStatus.severity === "POOR"
                              ? "text-orange-900"
                              : healthStatus.severity === "FAIR"
                                ? "text-yellow-900"
                                : healthStatus.severity === "GOOD"
                                  ? "text-blue-900"
                                  : "text-green-900"
                        }`}
                      >
                        ⚠️ Risk Factors:
                      </h4>
                      <ul className="space-y-1">
                        {healthStatus.riskFactors.map(
                          (factor: string, idx: number) => (
                            <li
                              key={idx}
                              className={`flex items-center gap-2 text-sm ${
                                healthStatus.severity === "CRITICAL"
                                  ? "text-red-800"
                                  : healthStatus.severity === "POOR"
                                    ? "text-orange-800"
                                    : healthStatus.severity === "FAIR"
                                      ? "text-yellow-800"
                                      : healthStatus.severity === "GOOD"
                                        ? "text-blue-800"
                                        : "text-green-800"
                              }`}
                            >
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  healthStatus.severity === "CRITICAL"
                                    ? "bg-red-600"
                                    : healthStatus.severity === "POOR"
                                      ? "bg-orange-600"
                                      : healthStatus.severity === "FAIR"
                                        ? "bg-yellow-600"
                                        : healthStatus.severity === "GOOD"
                                          ? "bg-blue-600"
                                          : "bg-green-600"
                                }`}
                              />
                              {factor}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Recommendations */}
                {healthStatus.recommendations &&
                  healthStatus.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4
                        className={`font-bold text-sm mb-2 ${
                          healthStatus.severity === "CRITICAL"
                            ? "text-red-900"
                            : healthStatus.severity === "POOR"
                              ? "text-orange-900"
                              : healthStatus.severity === "FAIR"
                                ? "text-yellow-900"
                                : healthStatus.severity === "GOOD"
                                  ? "text-blue-900"
                                  : "text-green-900"
                        }`}
                      >
                        💡 Recommendations:
                      </h4>
                      <ul className="space-y-1">
                        {healthStatus.recommendations.map(
                          (rec: string, idx: number) => (
                            <li
                              key={idx}
                              className={`flex items-center gap-2 text-sm ${
                                healthStatus.severity === "CRITICAL"
                                  ? "text-red-800"
                                  : healthStatus.severity === "POOR"
                                    ? "text-orange-800"
                                    : healthStatus.severity === "FAIR"
                                      ? "text-yellow-800"
                                      : healthStatus.severity === "GOOD"
                                        ? "text-blue-800"
                                        : "text-green-800"
                              }`}
                            >
                              <span className="inline-block">→</span>
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Correlations */}
                {healthStatus.correlations &&
                  healthStatus.correlations.length > 0 && (
                    <div className="mb-4">
                      <h4
                        className={`font-bold text-sm mb-2 ${
                          healthStatus.severity === "CRITICAL"
                            ? "text-red-900"
                            : healthStatus.severity === "POOR"
                              ? "text-orange-900"
                              : healthStatus.severity === "FAIR"
                                ? "text-yellow-900"
                                : healthStatus.severity === "GOOD"
                                  ? "text-blue-900"
                                  : "text-green-900"
                        }`}
                      >
                        🔗 Vital Correlations:
                      </h4>
                      <ul className="space-y-1">
                        {healthStatus.correlations.map(
                          (corr: string, idx: number) => (
                            <li
                              key={idx}
                              className={`text-sm ${
                                healthStatus.severity === "CRITICAL"
                                  ? "text-red-800"
                                  : healthStatus.severity === "POOR"
                                    ? "text-orange-800"
                                    : healthStatus.severity === "FAIR"
                                      ? "text-yellow-800"
                                      : healthStatus.severity === "GOOD"
                                        ? "text-blue-800"
                                        : "text-green-800"
                              }`}
                            >
                              • {corr}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Alert Details (if exist) */}
            {evaluation && (
              <div
                className={`rounded-lg border p-6 ${
                  evaluation.severity === "CRITICAL"
                    ? "border-red-300 bg-red-50"
                    : evaluation.severity === "WARNING"
                      ? "border-orange-300 bg-orange-50"
                      : "border-blue-300 bg-blue-50"
                }`}
              >
                {evaluation.severity === "CRITICAL" && (
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="size-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-2">
                        🚨 ALERTE CRITIQUE
                      </h3>
                      <p className="text-sm text-red-800">
                        Des anomalies critiques ont été détectées. Veuillez
                        consulter un professionnel de santé immédiatement.
                      </p>
                    </div>
                  </div>
                )}
                {evaluation.severity === "WARNING" && (
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="size-6 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold text-orange-900 mb-2">
                        ⚠️ AVERTISSEMENT
                      </h3>
                      <p className="text-sm text-orange-800">
                        Plusieurs anomalies modérées ont été détectées. Veuillez
                        surveiller votre état.
                      </p>
                    </div>
                  </div>
                )}

                {/* Critical Anomalies */}
                {evaluation.criticalAnomalies &&
                  evaluation.criticalAnomalies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-red-900 mb-2 text-sm">
                        Anomalies Critiques (
                        {evaluation.criticalAnomalies.length})
                      </h4>
                      <ul className="space-y-1">
                        {evaluation.criticalAnomalies.map(
                          (anomaly: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-red-800"
                            >
                              <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
                              {anomaly}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Moderate Anomalies */}
                {evaluation.moderateAnomalies &&
                  evaluation.moderateAnomalies.length > 0 && (
                    <div>
                      <h4
                        className={`font-bold mb-2 text-sm ${
                          evaluation.severity === "CRITICAL"
                            ? "text-red-900"
                            : evaluation.severity === "WARNING"
                              ? "text-orange-900"
                              : "text-blue-900"
                        }`}
                      >
                        Anomalies Modérées (
                        {evaluation.moderateAnomalies.length})
                      </h4>
                      <ul className="space-y-1">
                        {evaluation.moderateAnomalies.map(
                          (anomaly: string, idx: number) => (
                            <li
                              key={idx}
                              className={`flex items-center gap-2 text-sm ${
                                evaluation.severity === "CRITICAL"
                                  ? "text-red-700"
                                  : evaluation.severity === "WARNING"
                                    ? "text-orange-700"
                                    : "text-blue-700"
                              }`}
                            >
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  evaluation.severity === "CRITICAL"
                                    ? "bg-red-500"
                                    : evaluation.severity === "WARNING"
                                      ? "bg-orange-500"
                                      : "bg-blue-500"
                                }`}
                              />
                              {anomaly}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-300">
                  Redirection vers le tableau de bord dans 3 secondes...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vitals Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="size-6 text-red-600" />
              Constantes Vitales
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Température (°C){" "}
                  <span className="text-gray-500 text-xs">
                    Normal: 36.5-37.5
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) =>
                    handleVitalChange("temperature", e.target.value)
                  }
                  placeholder="37.0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fréquence cardiaque (bpm){" "}
                  <span className="text-gray-500 text-xs">Normal: 60-100</span>
                </label>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) =>
                    handleVitalChange("heartRate", e.target.value)
                  }
                  placeholder="75"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Systolic BP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tension systolique (mmHg){" "}
                  <span className="text-gray-500 text-xs">Normal: 120</span>
                </label>
                <input
                  type="number"
                  value={vitals.systolicBP}
                  onChange={(e) =>
                    handleVitalChange("systolicBP", e.target.value)
                  }
                  placeholder="120"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Diastolic BP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tension diastolique (mmHg){" "}
                  <span className="text-gray-500 text-xs">Normal: 80</span>
                </label>
                <input
                  type="number"
                  value={vitals.diastolicBP}
                  onChange={(e) =>
                    handleVitalChange("diastolicBP", e.target.value)
                  }
                  placeholder="80"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* O2 Saturation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Saturation O² (%){" "}
                  <span className="text-gray-500 text-xs">Normal: ≥95</span>
                </label>
                <input
                  type="number"
                  value={vitals.oxygenSaturation}
                  onChange={(e) =>
                    handleVitalChange("oxygenSaturation", e.target.value)
                  }
                  placeholder="98"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.weight}
                  onChange={(e) => handleVitalChange("weight", e.target.value)}
                  placeholder="70"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fréquence respiratoire (resp/min){" "}
                  <span className="text-red-600 font-bold text-xs">
                    IMPORTANT
                  </span>{" "}
                  <span className="text-gray-500 text-xs">Normal: 12-20</span>
                </label>
                <input
                  type="number"
                  value={vitals.respiratoryRate}
                  onChange={(e) =>
                    handleVitalChange("respiratoryRate", e.target.value)
                  }
                  placeholder="16"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Symptômes</h2>

            {/* General Symptoms */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Symptômes généraux
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Fatigue{" "}
                    <span className="text-gray-500 text-xs">
                      (0 = aucune, 5 = très grave)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={symptoms.fatigue}
                      onChange={(e) =>
                        handleGeneralSymptomChange(
                          "fatigue",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-red-600 min-w-fit">
                      {symptoms.fatigue}/5
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={symptoms.fever}
                    onChange={(e) =>
                      handleGeneralSymptomChange("fever", e.target.checked)
                    }
                    className="rounded border-gray-300 text-red-600 w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    Fièvre ressentie
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Perte d'appétit{" "}
                    <span className="text-gray-500 text-xs">
                      (0 = aucune, 5 = totale)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={symptoms.lossOfAppetite}
                      onChange={(e) =>
                        handleGeneralSymptomChange(
                          "lossOfAppetite",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-red-600 min-w-fit">
                      {symptoms.lossOfAppetite}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialty-Specific Symptoms */}
            {specialtySymptomsList.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Symptômes spécialisés ({specialty})
                </h3>
                <div className="space-y-4">
                  {specialty === "CARDIOLOGY" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Douleur thoracique{" "}
                          <span className="text-gray-500 text-xs">
                            (0 = aucune, 10 = insoutenable)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={symptoms.specialtySymptoms.chestPain || 0}
                            onChange={(e) =>
                              handleSpecialtySymptomChange(
                                "chestPain",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-red-600 min-w-fit">
                            {symptoms.specialtySymptoms.chestPain || 0}/10
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.palpitations || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "palpitations",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Palpitations
                        </span>
                      </label>
                    </>
                  )}

                  {specialty === "PULMONOLOGY" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Essoufflement{" "}
                          <span className="text-gray-500 text-xs">
                            (0 = aucun, 5 = grave)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={symptoms.specialtySymptoms.shortness || 0}
                            onChange={(e) =>
                              handleSpecialtySymptomChange(
                                "shortness",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-red-600 min-w-fit">
                            {symptoms.specialtySymptoms.shortness || 0}/5
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.specialtySymptoms.cough || false}
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "cough",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Toux
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.expectoration || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "expectoration",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Expectoration
                        </span>
                      </label>
                    </>
                  )}

                  {specialty === "GASTROENTEROLOGY" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Nausée{" "}
                          <span className="text-gray-500 text-xs">
                            (0 = aucune, 5 = grave)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={symptoms.specialtySymptoms.nausea || 0}
                            onChange={(e) =>
                              handleSpecialtySymptomChange(
                                "nausea",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-red-600 min-w-fit">
                            {symptoms.specialtySymptoms.nausea || 0}/5
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.specialtySymptoms.vomiting || false}
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "vomiting",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Vomissements
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.specialtySymptoms.diarrhea || false}
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "diarrhea",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Diarrhée
                        </span>
                      </label>
                    </>
                  )}

                  {specialty === "NEUROLOGY" && (
                    <>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.dizziness || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "dizziness",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Vertiges
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.confusion || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "confusion",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Confusion
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Data (Collapsible) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-4 px-0 text-lg font-bold text-gray-900 hover:text-red-600 transition-colors"
            >
              <span>📊 Données cliniques avancées (Optionnel)</span>
              <span className="text-xl">{showAdvanced ? "−" : "+"}</span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Glycémie (g/L){" "}
                    <span className="text-gray-500 text-xs">
                      Normal: 0.7-1.1
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={symptoms.glycemia}
                    onChange={(e) =>
                      setSymptoms((prev) => ({
                        ...prev,
                        glycemia: e.target.value,
                      }))
                    }
                    placeholder="0.9"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CRP (mg/L){" "}
                    <span className="text-gray-500 text-xs">Normal: &lt;5</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={symptoms.crp}
                    onChange={(e) =>
                      setSymptoms((prev) => ({ ...prev, crp: e.target.value }))
                    }
                    placeholder="2.5"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diurèse (ml/jour){" "}
                    <span className="text-gray-500 text-xs">
                      Normal: &gt;500
                    </span>
                  </label>
                  <input
                    type="number"
                    value={symptoms.diuresis}
                    onChange={(e) =>
                      setSymptoms((prev) => ({
                        ...prev,
                        diuresis: e.target.value,
                      }))
                    }
                    placeholder="1200"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hydratation
                  </label>
                  <select
                    value={symptoms.hydration}
                    onChange={(e) =>
                      setSymptoms((prev) => ({
                        ...prev,
                        hydration: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    <option value="normal">Normale</option>
                    <option value="low">Faible</option>
                    <option value="veryLow">Très faible</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-4 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2"
          >
            {submitting
              ? "Enregistrement..."
              : "Enregistrer mes constantes et symptômes"}
          </button>
        </form>
      </div>
    </div>
  );
}
