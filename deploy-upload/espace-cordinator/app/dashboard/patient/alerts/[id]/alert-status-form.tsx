"use client";

import { useState } from "react";
import { AlertStatus } from "@/types/medifollow.types";
import { updateAlertStatus } from "@/lib/actions/alert.actions";

interface AlertStatusFormProps {
  alertId: string;
  currentStatus: AlertStatus;
}

const statusOptions: Array<{
  value: AlertStatus;
  label: string;
  description: string;
  badge: string;
}> = [
  {
    value: AlertStatus.OPEN,
    label: "🟢 Active",
    description: "L'alerte est ouverte et en attente de suivi.",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  {
    value: AlertStatus.ACKNOWLEDGED,
    label: "🟡 Acquittée",
    description: "Le patient a pris connaissance de l'alerte.",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    value: AlertStatus.RESOLVED,
    label: "🟢 Résolue",
    description: "L'alerte est traitée et clôturée.",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
];

export default function AlertStatusForm({ alertId, currentStatus }: AlertStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const result = await updateAlertStatus(alertId, selectedStatus);
      if (result.success) {
        setMessage({ type: "success", text: "Statut mis à jour avec succès." });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: "error", text: result.error || "Échec de la mise à jour." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-20 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 via-slate-900/40 to-blue-900/20 backdrop-blur-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Mettre à jour le statut</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {statusOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                selectedStatus === option.value
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <input
                type="radio"
                name="alert-status"
                value={option.value}
                checked={selectedStatus === option.value}
                onChange={() => setSelectedStatus(option.value)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">{option.label}</div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || selectedStatus === currentStatus}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-3 font-semibold text-white hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Mise à jour..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}
