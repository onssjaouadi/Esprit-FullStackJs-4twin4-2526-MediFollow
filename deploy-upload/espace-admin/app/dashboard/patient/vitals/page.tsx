"use client";

import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { createVitalRecord } from "@/lib/actions/vital.actions";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

      // Create FormData
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const result = await createVitalRecord(patient.id, form);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/patient");
        }, 1500);
      } else {
        setError(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50">
            <Save className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Enregistré !</h2>
          <p className="mt-2 text-gray-600">
            Vos signes vitaux ont été enregistrés avec succès
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/patient"
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Enregistrer les signes vitaux
              </h1>
              <p className="mt-2 text-gray-600">
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
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-8"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Systolic BP */}
            <div>
              <label
                htmlFor="systolicBP"
                className="block text-sm font-medium text-gray-700"
              >
                Tension systolique (mmHg)
              </label>
              <input
                type="number"
                id="systolicBP"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-400 focus:outline-none transition-colors"
                placeholder="120"
                step="1"
                min="50"
                max="250"
              />
            </div>

            {/* Diastolic BP */}
            <div>
              <label
                htmlFor="diastolicBP"
                className="block text-sm font-medium text-gray-700"
              >
                Tension diastolique (mmHg)
              </label>
              <input
                type="number"
                id="diastolicBP"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="80"
                step="1"
                min="30"
                max="150"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label
                htmlFor="heartRate"
                className="block text-sm font-medium text-gray-700"
              >
                Fréquence cardiaque (bpm)
              </label>
              <input
                type="number"
                id="heartRate"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="70"
                step="1"
                min="30"
                max="200"
              />
            </div>

            {/* Temperature */}
            <div>
              <label
                htmlFor="temperature"
                className="block text-sm font-medium text-gray-700"
              >
                Température (°C)
              </label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="36.5"
                step="0.1"
                min="34"
                max="42"
              />
            </div>

            {/* Oxygen Saturation */}
            <div>
              <label
                htmlFor="oxygenSaturation"
                className="block text-sm font-medium text-gray-700"
              >
                SpO2 (%)
              </label>
              <input
                type="number"
                id="oxygenSaturation"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="98"
                step="1"
                min="70"
                max="100"
              />
            </div>

            {/* Weight */}
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700"
              >
                Poids (kg) - Optionnel
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="70"
                step="0.1"
                min="30"
                max="300"
              />
            </div>

            {/* Recorded At */}
            <div className="md:col-span-2">
              <label
                htmlFor="recordedAt"
                className="block text-sm font-medium text-gray-700"
              >
                Date et heure de la mesure
              </label>
              <input
                type="datetime-local"
                id="recordedAt"
                name="recordedAt"
                value={formData.recordedAt}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Ajoutez des notes sur votre état général, symptômes, etc."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Enregistrer
                </>
              )}
            </button>
            <Link
              href="/dashboard/patient"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 flex items-center justify-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
