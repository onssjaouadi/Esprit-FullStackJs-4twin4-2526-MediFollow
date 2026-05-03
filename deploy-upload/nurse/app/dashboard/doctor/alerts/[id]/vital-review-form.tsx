"use client";

import { useState } from "react";
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
          text: "✅ Vital record reviewed successfully!",
        });
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        onReviewComplete?.();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error saving review",
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
      <div className="rounded-xl backdrop-blur-xl border border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10 overflow-hidden sticky top-24">
        <div className="p-6">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            ✅ Review Validé
          </h3>
          <div className="space-y-3">
            {vitalRecord.reviewedAt && (
              <div>
                <p className="text-xs text-green-400 mb-1">Date du review</p>
                <p className="text-sm text-green-300">
                  {new Date(vitalRecord.reviewedAt).toLocaleString("fr-FR")}
                </p>
              </div>
            )}
            {vitalRecord.reviewedBy && (
              <div>
                <p className="text-xs text-green-400 mb-1">Reviewed par</p>
                <p className="text-sm text-green-300">
                  Dr. {vitalRecord.reviewedBy.firstName}{" "}
                  {vitalRecord.reviewedBy.lastName}
                </p>
              </div>
            )}
            {vitalRecord.reviewNotes && (
              <div>
                <p className="text-xs text-green-400 mb-1">Commentaires</p>
                <p className="text-sm text-green-300">
                  {vitalRecord.reviewNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl backdrop-blur-xl border border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10 overflow-hidden sticky top-24">
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> Évaluation du vital
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Selection - PROMINENT */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-4">
              Statut du vital
            </label>
            <div className="space-y-3">
              {/* NORMAL */}
              <label
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  status === "NORMAL"
                    ? "border-green-500/80 bg-green-500/20"
                    : "border-green-500/20 bg-green-500/5 hover:border-green-500/50"
                }`}
              >
                <input
                  type="radio"
                  name="vitalStatus"
                  value="NORMAL"
                  checked={status === "NORMAL"}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="flex-1">
                  <span className="text-2xl">🟢</span>
                  <span className="block text-sm font-bold text-green-300 mt-1">
                    Normal
                  </span>
                  <span className="block text-xs text-green-400">
                    Les signes vitaux sont stables
                  </span>
                </span>
              </label>

              {/* À VÉRIFIER */}
              <label
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  status === "A_VERIFIER"
                    ? "border-orange-500/80 bg-orange-500/20"
                    : "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50"
                }`}
              >
                <input
                  type="radio"
                  name="vitalStatus"
                  value="A_VERIFIER"
                  checked={status === "A_VERIFIER"}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="flex-1">
                  <span className="text-2xl">🟡</span>
                  <span className="block text-sm font-bold text-orange-300 mt-1">
                    À vérifier
                  </span>
                  <span className="block text-xs text-orange-400">
                    Valeurs anormales nécessitant investigation
                  </span>
                </span>
              </label>

              {/* CRITIQUE */}
              <label
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  status === "CRITIQUE"
                    ? "border-red-500/80 bg-red-500/20"
                    : "border-red-500/20 bg-red-500/5 hover:border-red-500/50"
                }`}
              >
                <input
                  type="radio"
                  name="vitalStatus"
                  value="CRITIQUE"
                  checked={status === "CRITIQUE"}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="flex-1">
                  <span className="text-2xl">🔴</span>
                  <span className="block text-sm font-bold text-red-300 mt-1">
                    Critique
                  </span>
                  <span className="block text-xs text-red-400">
                    Intervention urgente requise
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* Review Comments */}
          <div>
            <label
              htmlFor="reviewNotes"
              className="block text-sm font-bold text-gray-300 mb-3"
            >
              Commentaires
              <span className="font-normal text-gray-500"> (optionnel)</span>
            </label>
            <textarea
              id="reviewNotes"
              name="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Ajoutez vos observations, recommandations..."
            ></textarea>
          </div>

          {/* Status and Error Messages */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-500/50 text-green-300"
                  : "bg-red-500/20 border border-red-500/50 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <span>✅ Valider l'évaluation</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <p className="text-xs text-blue-300">
            ℹ️ Votre évaluation sera sauvegardée et visible dans le dossier du
            patient.
          </p>
        </div>
      </div>
    </div>
  );
}
