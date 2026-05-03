"use client";

import { useState } from "react";
import { X, FlaskConical, FileText, Calendar, Building2 } from "lucide-react";
import {
  createMedicalAnalysis,
  updateMedicalAnalysis,
} from "@/lib/actions/analysis.actions";
import { useRouter } from "next/navigation";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  analysis?: any;
  mode: "create" | "edit";
}

const ANALYSIS_TYPES = [
  { value: "BLOOD_TEST", label: "Test sanguin" },
  { value: "URINE_TEST", label: "Test urinaire" },
  { value: "IMAGING_XRAY", label: "Radiographie" },
  { value: "IMAGING_CT_SCAN", label: "Scanner (CT)" },
  { value: "IMAGING_MRI", label: "IRM" },
  { value: "IMAGING_ULTRASOUND", label: "Échographie" },
  { value: "IMAGING_PET_SCAN", label: "TEP Scan" },
  { value: "ECG", label: "Électrocardiogramme (ECG)" },
  { value: "ECHOCARDIOGRAPHY", label: "Échocardiographie" },
  { value: "SPIROMETRY", label: "Spirométrie" },
  { value: "BIOPSY", label: "Biopsie" },
  { value: "CULTURE", label: "Culture" },
  { value: "OTHER", label: "Autre" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
];

export default function AnalysisModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  analysis,
  mode,
}: AnalysisModalProps) {
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
      formData.append("patientId", patientId);

      let result;
      if (mode === "create") {
        result = await createMedicalAnalysis(formData);
      } else {
        result = await updateMedicalAnalysis(analysis.id, formData);
      }

      if (result.success) {
        router.refresh();
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
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "Ajouter" : "Modifier"} Analyse Médicale
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

          {/* Type d'analyse */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              Type d'analyse *
            </label>
            <select
              name="analysisType"
              defaultValue={analysis?.analysisType || ""}
              required
              title="Type d'analyse"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un type</option>
              {ANALYSIS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid 2 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom du test */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Nom du test *
              </label>
              <input
                type="text"
                name="testName"
                defaultValue={analysis?.testName || ""}
                placeholder="Ex: Numération formule sanguine"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date de l'analyse */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Date de l'analyse
              </label>
              <input
                type="datetime-local"
                name="analysisDate"
                title="Date de l'analyse"
                defaultValue={
                  analysis?.analysisDate
                    ? new Date(analysis.analysisDate).toISOString().slice(0, 16)
                    : ""
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grid 2 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Laboratoire */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                Laboratoire / Centre médical
              </label>
              <input
                type="text"
                name="laboratory"
                defaultValue={analysis?.laboratory || ""}
                placeholder="Ex: Laboratoire Central"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Statut
              </label>
              <select
                name="status"
                defaultValue={analysis?.status || "COMPLETED"}
                title="Statut de l'analyse"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Résumé des résultats */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Résumé des résultats
            </label>
            <textarea
              name="resultSummary"
              defaultValue={analysis?.resultSummary || ""}
              rows={4}
              placeholder="Saisir les résultats principaux et observations..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Notes du médecin */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Notes du médecin
            </label>
            <textarea
              name="doctorNotes"
              defaultValue={analysis?.doctorNotes || ""}
              rows={3}
              placeholder="Interprétation, recommandations..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Résultat anormal */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isAbnormal"
              id="isAbnormal"
              defaultChecked={analysis?.isAbnormal || false}
              value="true"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="isAbnormal"
              className="text-sm font-medium text-gray-700"
            >
              Résultat anormal (nécessite un suivi)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading
                ? "Enregistrement..."
                : mode === "create"
                  ? "Créer l'analyse"
                  : "Modifier l'analyse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
