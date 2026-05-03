"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { reviewVitalRecord } from "@/lib/actions/vital.actions";

interface VitalReviewFormProps {
  vitalRecord: any;
  doctorId: string;
  alertId: string;
  onReviewComplete?: () => void;
}

export default function VitalReviewForm({
  vitalRecord,
  doctorId,
  alertId,
  onReviewComplete,
}: VitalReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(vitalRecord.status || "NORMAL");
  const [reviewNotes, setReviewNotes] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await reviewVitalRecord(
        vitalRecord.id,
        doctorId,
        reviewNotes,
        (status as "NORMAL" | "A_VERIFIER" | "CRITIQUE") || undefined
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: "✅ Examen du vital enregistré avec succès!",
        });
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        onReviewComplete?.();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de l'enregistrement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Une erreur est survenue lors de l'enregistrement",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (vitalRecord.reviewStatus === "REVIEWED") {
    return (
      <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-500/20 rounded-lg shadow-sm sticky top-20 overflow-hidden">
        <div className="px-6 py-4 bg-green-50 dark:bg-green-500/10 border-b border-green-200 dark:border-green-500/20">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Vital examiné
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {vitalRecord.reviewedAt && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Date d'examen
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {new Date(vitalRecord.reviewedAt).toLocaleString("fr-FR")}
              </p>
            </div>
          )}
          {vitalRecord.reviewedBy && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Examiné par
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                Dr. {vitalRecord.reviewedBy.firstName}{" "}
                {vitalRecord.reviewedBy.lastName}
              </p>
            </div>
          )}
          {vitalRecord.reviewNotes && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Commentaires
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                {vitalRecord.reviewNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm sticky top-20 overflow-hidden">
      <div className="px-6 py-4 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
          Examiner le vital
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Status Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Statut du vital
          </label>
          <div className="space-y-2">
            {/* NORMAL */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                status === "NORMAL"
                  ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                  : "border-green-200 dark:border-green-500/20 hover:border-green-400 dark:hover:border-green-500/50"
              }`}
            >
              <input
                type="radio"
                name="vitalStatus"
                value="NORMAL"
                checked={status === "NORMAL"}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  🟢 Normal
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Signes vitaux stables
                </p>
              </div>
            </label>

            {/* À VÉRIFIER */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                status === "A_VERIFIER"
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                  : "border-orange-200 dark:border-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/50"
              }`}
            >
              <input
                type="radio"
                name="vitalStatus"
                value="A_VERIFIER"
                checked={status === "A_VERIFIER"}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  🟡 À vérifier
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Investigation requise
                </p>
              </div>
            </label>

            {/* CRITIQUE */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                status === "CRITIQUE"
                  ? "border-red-500 bg-red-50 dark:bg-red-500/10"
                  : "border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-500/50"
              }`}
            >
              <input
                type="radio"
                name="vitalStatus"
                value="CRITIQUE"
                checked={status === "CRITIQUE"}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  🔴 Critique
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Intervention urgente
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Review Comments */}
        <div>
          <label
            htmlFor="reviewNotes"
            className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
          >
            Commentaires
            <span className="font-normal text-gray-500 dark:text-gray-400">
              {" "}
              (optionnel)
            </span>
          </label>
          <textarea
            id="reviewNotes"
            name="reviewNotes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Observations, recommandations..."
          ></textarea>
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Valider l'évaluation
            </>
          )}
        </button>

        {/* Info Message */}
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">ℹ️ Info:</span> Votre évaluation
            sera sauvegardée et visible dans le dossier du patient.
          </p>
        </div>
      </form>
    </div>
  );
}
