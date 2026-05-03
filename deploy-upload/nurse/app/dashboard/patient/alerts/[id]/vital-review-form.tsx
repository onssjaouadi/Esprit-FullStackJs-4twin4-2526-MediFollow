"use client";

import { useState, useEffect } from "react";
import { getLatestVitalRecord } from "@/lib/actions/vital.actions";
import { reviewVitalRecord } from "@/lib/actions/vital.actions";

interface VitalReviewFormProps {
  alertId: string;
  vitalRecordId?: string;
  patientId: string;
  onReviewComplete?: () => void;
}

export default function VitalReviewForm({
  alertId,
  vitalRecordId: initialVitalRecordId,
  patientId,
  onReviewComplete,
}: VitalReviewFormProps) {
  const [vitalRecordId, setVitalRecordId] = useState<string | undefined>(
    initialVitalRecordId
  );
  const [status, setStatus] = useState<"NORMAL" | "A_VERIFIER" | "CRITIQUE">(
    "NORMAL"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);

  useEffect(() => {
    // If no vitalRecordId provided, fetch the latest one
    if (!vitalRecordId) {
      fetchLatestVital();
    }
  }, []);

  const fetchLatestVital = async () => {
    try {
      const result = await getLatestVitalRecord(patientId);
      if (result && result.id) {
        setVitalRecordId(result.id);
      }
    } catch (error) {
      console.error("Error fetching vital record:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vitalRecordId) {
      setMessage({
        type: "error",
        text: "⚠️ No vital record found. Please submit a vital record first.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await reviewVitalRecord(
        vitalRecordId,
        patientId,
        notes,
        status
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: "✅ Status updated successfully!",
        });
        setIsReviewed(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to update status",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isReviewed) {
    return (
      <div className="sticky top-20 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 via-emerald-800/10 to-emerald-900/20 backdrop-blur-xl p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h3 className="text-lg font-bold text-emerald-400 mb-2">
            Status Updated
          </h3>
          <p className="text-emerald-200 text-sm">
            Your vital record status has been successfully recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-20 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 via-slate-900/40 to-blue-900/20 backdrop-blur-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Select Status</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selection */}
        <div className="space-y-3">
          {[
            {
              value: "NORMAL",
              label: "🟢 Normal",
              description: "All vital signs are normal",
            },
            {
              value: "A_VERIFIER",
              label: "🟡 À vérifier",
              description: "Requires verification",
            },
            {
              value: "CRITIQUE",
              label: "🔴 Critique",
              description: "Critical attention needed",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">{option.label}</div>
                <div className="text-xs text-gray-400">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional notes..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        {/* Message */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-3 font-semibold text-white hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}
