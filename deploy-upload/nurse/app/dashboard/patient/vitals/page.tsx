"use client";

import {
  ArrowLeft,
  Save,
  Loader2,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Scale,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { createVitalRecord } from "@/lib/actions/vital.actions";
import { createSymptom } from "@/lib/actions/symptom.actions";
import { SYMPTOM_TYPES } from "@/lib/utils/symptom-utils";

export default function NewVitalRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    notes: "",
    recordedAt: new Date().toISOString().slice(0, 16),
  });

  const [symptomData, setSymptomData] = useState({
    symptomType: "",
    severity: "MILD" as "MILD" | "MODERATE" | "SEVERE",
    description: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "PATIENT") {
      router.push("/login");
      return;
    }

    setPatient(user.patient);
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSymptomChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setSymptomData({
      ...symptomData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSeverityChange = (severity: "MILD" | "MODERATE" | "SEVERE") => {
    setSymptomData({
      ...symptomData,
      severity,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!patient?.id) {
        setError("Patient non trouvé");
        setLoading(false);
        return;
      }

      // Create FormData for vital
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      // Create vital record
      const vitalResult = await createVitalRecord(patient.id, form);

      if (!vitalResult.success) {
        setError(vitalResult.error || "Erreur lors de l'enregistrement");
        setLoading(false);
        return;
      }

      // Create symptom if selected
      if (symptomData.symptomType) {
        const symptomResult = await createSymptom(
          patient.id,
          symptomData.symptomType,
          symptomData.severity,
          symptomData.description
        );

        if (!symptomResult.success) {
          console.warn("⚠️ Symptôme non enregistré:", symptomResult.error);
          // Continue anyway - vital was recorded
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/patient");
      }, 1500);
    } catch (err) {
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
            <Save className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enregistré !
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Vos signes vitaux ont été enregistrés avec succès
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/patient"
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Enregistrer les signes vitaux
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Remplissez les mesures que vous avez prises
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cardiovascular Section */}
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/40 p-2">
                <Heart size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Système cardiovasculaire
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Systolic BP */}
              <div>
                <label
                  htmlFor="systolicBP"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Tension systolique
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="systolicBP"
                    name="systolicBP"
                    value={formData.systolicBP}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:outline-none transition-all"
                    placeholder="120"
                    step="1"
                    min="50"
                    max="250"
                  />
                  <span className="absolute right-4 top-3 text-sm font-medium text-gray-500">
                    mmHg
                  </span>
                </div>
              </div>

              {/* Diastolic BP */}
              <div>
                <label
                  htmlFor="diastolicBP"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Tension diastolique
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="diastolicBP"
                    name="diastolicBP"
                    value={formData.diastolicBP}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:outline-none transition-all"
                    placeholder="80"
                    step="1"
                    min="30"
                    max="150"
                  />
                  <span className="absolute right-4 top-3 text-sm font-medium text-gray-500">
                    mmHg
                  </span>
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label
                  htmlFor="heartRate"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Fréquence cardiaque
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="heartRate"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:outline-none transition-all"
                    placeholder="70"
                    step="1"
                    min="30"
                    max="200"
                  />
                  <span className="absolute right-4 top-3 text-sm font-medium text-gray-500">
                    bpm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature & Respiration Section */}
          <div className="rounded-xl border border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-2">
                <Thermometer
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Température & respiration
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Temperature */}
              <div>
                <label
                  htmlFor="temperature"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Température
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="temperature"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800/50 focus:outline-none transition-all"
                    placeholder="36.5"
                    step="0.1"
                    min="34"
                    max="42"
                  />
                  <span className="absolute right-4 top-3 text-sm font-medium text-gray-500">
                    °C
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Normale: 36,5 - 37,5°C
                </p>
              </div>

              {/* Oxygen Saturation */}
              <div>
                <label
                  htmlFor="oxygenSaturation"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Saturation en oxygène
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="oxygenSaturation"
                    name="oxygenSaturation"
                    value={formData.oxygenSaturation}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800/50 focus:outline-none transition-all"
                    placeholder="98"
                    step="1"
                    min="70"
                    max="100"
                  />
                  <span className="absolute right-4 top-3 text-sm font-medium text-gray-500">
                    %
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Normale: 95 - 100%
                </p>
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div className="rounded-xl border border-green-100 dark:border-green-900/30 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
                <Scale
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Poids
              </h2>
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Poids (optionnel)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800/50 focus:outline-none transition-all"
                  placeholder="70"
                  step="0.1"
                  min="30"
                  max="300"
                />
                <span className="absolute right-4 top-3 text-sm font-medium text-gray-500">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Date & Notes Section */}
          <div className="rounded-xl border border-purple-100 dark:border-purple-900/30 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 p-2">
                <AlertCircle
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Informations supplémentaires
              </h2>
            </div>

            <div className="space-y-6">
              {/* Recorded At */}
              <div>
                <label
                  htmlFor="recordedAt"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Date et heure de la mesure
                </label>
                <input
                  type="datetime-local"
                  id="recordedAt"
                  name="recordedAt"
                  value={formData.recordedAt}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800/50 focus:outline-none transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Notes (optionnel)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800/50 focus:outline-none transition-all resize-none"
                  placeholder="Ajoutez des notes sur votre état général, modifications de médicaments, événements récents, etc."
                />
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="rounded-xl border border-red-100 dark:border-red-900/30 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2">
                <Wind size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Symptômes (optionnel)
              </h2>
            </div>

            {/* Symptom Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Avez-vous des symptômes?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SYMPTOM_TYPES.map((symptom) => (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() =>
                      setSymptomData({
                        ...symptomData,
                        symptomType:
                          symptomData.symptomType === symptom.id
                            ? ""
                            : symptom.id,
                      })
                    }
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium text-center ${
                      symptomData.symptomType === symptom.id
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-red-400 dark:hover:border-red-500"
                    }`}
                  >
                    {symptom.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom Details - Show only if symptom selected */}
            {symptomData.symptomType && (
              <div className="space-y-4 p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border border-dashed border-red-300 dark:border-red-800">
                {/* Severity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Sévérité du symptôme
                  </label>
                  <div className="flex gap-3">
                    {["MILD", "MODERATE", "SEVERE"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          handleSeverityChange(
                            level as "MILD" | "MODERATE" | "SEVERE"
                          )
                        }
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                          symptomData.severity === level
                            ? level === "MILD"
                              ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : level === "MODERATE"
                                ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                                : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                      >
                        {level === "MILD"
                          ? "Léger"
                          : level === "MODERATE"
                            ? "Modéré"
                            : "Sévère"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="symptomDescription"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description détaillée
                  </label>
                  <textarea
                    id="symptomDescription"
                    name="description"
                    value={symptomData.description}
                    onChange={handleSymptomChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800/50 focus:outline-none transition-all resize-none"
                    placeholder="Décrivez en détail votre symptôme, son évolution, ce qui l'aggrave ou l'améliore..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 px-8 py-4 font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Enregistrement en cours...
                </>
              ) : (
                <>
                  <Save size={24} />
                  Enregistrer les signes vitaux
                </>
              )}
            </button>
            <Link
              href="/dashboard/patient"
              className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 font-semibold text-gray-700 dark:text-gray-300 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
