"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { acknowledgeAlert, resolveAlert } from "@/lib/actions/alert.actions";

interface AlertResponsePanelProps {
  alertId: string;
  alertStatus: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  userId: string;
  onStatusChange?: () => void;
}

export default function AlertResponsePanel({
  alertId,
  alertStatus,
  userId,
  onStatusChange,
}: AlertResponsePanelProps) {
  const [status, setStatus] = useState<typeof alertStatus>(alertStatus);
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState<
    "NORMAL" | "CRITIQUE" | "A_CONVOQUER"
  >("NORMAL");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAcknowledge = async () => {
    if (status === "ACKNOWLEDGED" || status === "RESOLVED") return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await acknowledgeAlert(alertId, userId);

      if (result.success) {
        setStatus("ACKNOWLEDGED");
        setMessage({
          type: "success",
          text: "✅ Alerte reconnue avec succès",
        });
        onStatusChange?.();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la reconnaissance",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Une erreur est survenue",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "RESOLVED") return;

    setLoading(true);
    setMessage(null);

    try {
      const classificationText =
        classification === "NORMAL"
          ? " [Normal]"
          : classification === "CRITIQUE"
            ? " [Critique]"
            : " [À convoquer]";
      const finalNotes = `Classification: ${classification}\n\n${resolutionNotes}${classificationText}`;

      const result = await resolveAlert(alertId, userId, finalNotes);

      if (result.success) {
        setStatus("RESOLVED");
        setMessage({
          type: "success",
          text: "✅ Alerte résolue avec succès",
        });
        onStatusChange?.();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la résolution",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Une erreur est survenue",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-500/10 dark:to-blue-500/5 border-b border-blue-200 dark:border-blue-500/20">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
          Répondre à l'alerte
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Classifiez et résolvez cette alerte
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Status Display */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-700/50 dark:to-gray-700/30 border border-gray-200 dark:border-gray-600">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            État actuel
          </p>
          <div className="flex items-center gap-3">
            {status === "OPEN" && (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  En attente de réponse
                </span>
              </>
            )}
            {status === "ACKNOWLEDGED" && (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  Reconnu
                </span>
              </>
            )}
            {status === "RESOLVED" && (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  Résolu
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {status === "OPEN" && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAcknowledge}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  Reconnaître l'alerte
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              ↓ Ou passez à la classification et résolution
            </p>
          </div>
        )}

        {(status === "ACKNOWLEDGED" || status === "OPEN") && (
          <form onSubmit={handleResolve} className="space-y-6 pt-2">
            {/* Classification Section */}
            <div>
              <label className="flex text-sm font-bold text-gray-900 dark:text-white mb-4 items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white rounded text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Classification de l'alerte
              </label>
              <div className="space-y-2">
                {/* Normal */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    classification === "NORMAL"
                      ? "border-green-500 bg-green-50 dark:bg-green-500/15 shadow-sm"
                      : "border-green-200 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-500/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="alertClassification"
                    value="NORMAL"
                    checked={classification === "NORMAL"}
                    onChange={(e) =>
                      setClassification(
                        e.target.value as "NORMAL" | "CRITIQUE" | "A_CONVOQUER"
                      )
                    }
                    disabled={loading}
                    className="w-5 h-5 cursor-pointer mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-700 dark:text-green-300">
                      ✅ Normal
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Situation stable et bien maîtrisée
                    </p>
                  </div>
                </label>

                {/* Critique */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    classification === "CRITIQUE"
                      ? "border-red-500 bg-red-50 dark:bg-red-500/15 shadow-sm"
                      : "border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-500/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="alertClassification"
                    value="CRITIQUE"
                    checked={classification === "CRITIQUE"}
                    onChange={(e) =>
                      setClassification(
                        e.target.value as "NORMAL" | "CRITIQUE" | "A_CONVOQUER"
                      )
                    }
                    disabled={loading}
                    className="w-5 h-5 cursor-pointer mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      🔴 Critique
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Situation grave, urgent
                    </p>
                  </div>
                </label>

                {/* À convoquer */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    classification === "A_CONVOQUER"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/15 shadow-sm"
                      : "border-orange-200 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-500/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="alertClassification"
                    value="A_CONVOQUER"
                    checked={classification === "A_CONVOQUER"}
                    onChange={(e) =>
                      setClassification(
                        e.target.value as "NORMAL" | "CRITIQUE" | "A_CONVOQUER"
                      )
                    }
                    disabled={loading}
                    className="w-5 h-5 cursor-pointer mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
                      📞 À convoquer
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Le patient doit être contacté ou convoqué
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 dark:to-transparent"></div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Étape 2
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-gray-200 to-transparent dark:from-gray-700 dark:to-transparent"></div>
            </div>

            {/* Resolution Notes */}
            <div>
              <label
                htmlFor="resolutionNotes"
                className="flex text-sm font-bold text-gray-900 dark:text-white mb-3 items-center gap-2"
              >
                <span className="w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white rounded text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Notes de résolution
              </label>
              <textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                disabled={loading}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none transition-all duration-200"
                placeholder="Décrivez les actions prises, le diagnostic, le traitement prescrit, les recommandations..."
              ></textarea>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Détails importants pour le dossier médical
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !resolutionNotes.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Résolution en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Marquer comme résolu
                </>
              )}
            </button>
          </form>
        )}

        {status === "RESOLVED" && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-500/15 dark:to-green-500/5 border border-green-200 dark:border-green-500/30 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-900 dark:text-green-200">
                  ✅ Alerte résolue
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                  Cette alerte a été traitée et résolue avec succès. Le dossier
                  du patient a été mis à jour.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg text-sm font-semibold border flex items-start gap-3 transition-all duration-200 ${
              message.type === "success"
                ? "bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-500/15 dark:to-green-500/5 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200"
                : "bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-500/15 dark:to-red-500/5 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200"
            }`}
          >
            <span className="flex-shrink-0 text-lg">
              {message.type === "success" ? "✅" : "❌"}
            </span>
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
