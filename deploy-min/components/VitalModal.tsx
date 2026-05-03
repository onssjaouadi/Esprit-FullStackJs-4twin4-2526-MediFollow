"use client";

import { useState } from "react";
import { X, Heart, Activity, Thermometer, Wind, Scale } from "lucide-react";
import {
  createVitalRecord,
  updateVitalRecord,
} from "@/lib/actions/vital.actions";
import { useRouter } from "next/navigation";

interface VitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  vital?: any; // Existing vital record for editing
  mode: "create" | "edit";
}

export default function VitalModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  vital,
  mode,
}: VitalModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      let result;
      if (mode === "create") {
        result = await createVitalRecord(patientId, formData);
      } else {
        result = await updateVitalRecord(vital.id, formData);
      }

      if (result.success) {
        router.refresh();
        // Petit délai pour permettre au refresh de s'effectuer
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "Ajouter" : "Modifier"} Signes Vitaux
            </h2>
            <p className="text-sm text-gray-600 mt-1">{patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Grid 2 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fréquence Cardiaque */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4 text-red-600" />
                Fréquence Cardiaque (bpm)
              </label>
              <input
                type="number"
                name="heartRate"
                defaultValue={vital?.heartRate || ""}
                placeholder="Ex: 72"
                min="30"
                max="200"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 60-100 bpm</p>
            </div>

            {/* Tension Artérielle */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Tension Artérielle (mmHg)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="systolicBP"
                  defaultValue={vital?.systolicBP || ""}
                  placeholder="Systolique"
                  min="50"
                  max="250"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  name="diastolicBP"
                  defaultValue={vital?.diastolicBP || ""}
                  placeholder="Diastolique"
                  min="30"
                  max="150"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Normal: 90-140 / 60-90 mmHg
              </p>
            </div>

            {/* Température */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-orange-600" />
                Température (°C)
              </label>
              <input
                type="number"
                name="temperature"
                defaultValue={vital?.temperature || ""}
                placeholder="Ex: 36.5"
                step="0.1"
                min="30"
                max="45"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 36-38°C</p>
            </div>

            {/* Saturation en Oxygène */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Wind className="w-4 h-4 text-blue-600" />
                Saturation en Oxygène (%)
              </label>
              <input
                type="number"
                name="oxygenSaturation"
                defaultValue={vital?.oxygenSaturation || ""}
                placeholder="Ex: 98"
                min="50"
                max="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Normal: 95-100%</p>
            </div>

            {/* Poids */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Scale className="w-4 h-4 text-green-600" />
                Poids (kg)
              </label>
              <input
                type="number"
                name="weight"
                defaultValue={vital?.weight || ""}
                placeholder="Ex: 70.5"
                step="0.1"
                min="1"
                max="300"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes (optionnel)
              </label>
              <textarea
                name="notes"
                defaultValue={vital?.notes || ""}
                placeholder="Observations particulières..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === "create" ? "Enregistrement..." : "Modification..."}
                </>
              ) : (
                <>{mode === "create" ? "Enregistrer" : "Modifier"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
