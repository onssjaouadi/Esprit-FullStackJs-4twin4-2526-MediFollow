"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MedicalQuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Hospital & Specialty
    hospital: "",
    department: "",
    specialty: "GENERAL_MEDICINE",

    // Step 2: Physical measurements
    height: "",
    weight: "",

    // Step 3: Medical background
    diabetes: false,
    hypertension: false,
    cardiacDisease: false,
    asthmaOuBpco: false,
    cancer: false,
    otherConditions: "",

    // Step 4: Current medications
    medications: [] as Array<{
      medication: string;
      dose: string;
      frequency: string;
      reason: string;
    }>,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.currentTarget as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { medication: "", dose: "", frequency: "", reason: "" },
      ],
    }));
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  async function handleSubmit() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/patient/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard/patient");
    } catch (err: any) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  const isStep1Valid = formData.hospital.trim() && formData.specialty;
  const isStep2Valid = formData.height && formData.weight;
  const isStep3Valid = true; // Optional background info
  const isStep4Valid = true; // Optional medications

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="size-8 text-red-600" />
            <h1 className="text-3xl font-black text-gray-900">
              Profil Médical
            </h1>
          </div>
          <p className="text-gray-600">
            Complétez votre profil médical pour une meilleure personnalisation
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? "bg-red-600" : "bg-gray-200 dark:bg-gray-800"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="size-5 text-red-600 shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Hospital & Specialty */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Hôpital et Service
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hôpital / Clinique *
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  placeholder="Ex: CHU de Lyon"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Département
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Ex: Cardiologie A"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Principal *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  aria-label="Service Principal"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="GENERAL_MEDICINE">Médecine Générale</option>
                  <option value="CARDIOLOGY">Cardiologie</option>
                  <option value="PULMONOLOGY">Pneumologie</option>
                  <option value="GASTROENTEROLOGY">Gastroentérologie</option>
                  <option value="NEUROLOGY">Neurologie</option>
                  <option value="ENDOCRINOLOGY">Endocrinologie</option>
                  <option value="RHEUMATOLOGY">Rhumatologie</option>
                  <option value="ONCOLOGY">Oncologie</option>
                  <option value="NEPHROLOGY">Néphrologie</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Physical measurements */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Mesures Anthropométriques
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Taille (cm) *
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="170"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poids (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="70"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                Ces informations permettront de calculer votre IMC et de
                personnaliser votre suivi.
              </div>
            </div>
          )}

          {/* Step 3: Medical background */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Antécédents Médicaux
              </h2>

              <div className="space-y-3">
                {[
                  { key: "diabetes", label: "Diabète", icon: "🩺" },
                  { key: "hypertension", label: "Hypertension", icon: "💓" },
                  {
                    key: "cardiacDisease",
                    label: "Maladie cardiaque",
                    icon: "❤️",
                  },
                  {
                    key: "asthmaOuBpco",
                    label: "Asthme / BPCO",
                    icon: "🫁",
                  },
                  { key: "cancer", label: "Antécédent de cancer", icon: "🏥" },
                ].map(({ key, label, icon }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key as keyof typeof formData] === true}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                    />
                    <span className="text-2xl">{icon}</span>
                    <span className="text-gray-900 font-medium">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Autres conditions médicales
                </label>
                <textarea
                  name="otherConditions"
                  value={formData.otherConditions}
                  onChange={handleInputChange}
                  placeholder="Décrivez ici d'autres conditions pertinentes..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          )}

          {/* Step 4: Medications */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Traitements en Cours
              </h2>

              <div className="max-h-96 overflow-y-auto space-y-4">
                {formData.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-gray-200 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Médicament {idx + 1}
                      </span>
                      <button
                        onClick={() => removeMedication(idx)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Supprimer
                      </button>
                    </div>

                    <input
                      type="text"
                      value={med.medication}
                      onChange={(e) =>
                        updateMedication(idx, "medication", e.target.value)
                      }
                      placeholder="Nom du médicament"
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) =>
                          updateMedication(idx, "dose", e.target.value)
                        }
                        placeholder="Dosage (ex: 1g)"
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) =>
                          updateMedication(idx, "frequency", e.target.value)
                        }
                        placeholder="Fréquence (ex: 3/day)"
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>

                    <input
                      type="text"
                      value={med.reason}
                      onChange={(e) =>
                        updateMedication(idx, "reason", e.target.value)
                      }
                      placeholder="Raison (optionnel)"
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addMedication}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-center font-semibold text-gray-700 hover:border-red-600 hover:text-red-600 transition-all"
              >
                + Ajouter un médicament
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-lg border-2 border-gray-300 py-3 text-center font-bold text-gray-700 hover:border-gray-400 transition-all"
              >
                Précédent
              </button>
            )}

            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)
                }
                className="flex-1 rounded-lg bg-red-600 py-3 text-center font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                Suivant <ArrowRight className="size-4" />
              </button>
            )}

            {step === 4 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 py-3 text-center font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Enregistrement..." : "Terminer"}
                <CheckCircle2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
