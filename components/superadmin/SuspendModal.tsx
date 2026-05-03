"use client";

/**
 * [NEW] Suspend User Modal
 * Requires a suspension reason before proceeding.
 */

import { useState } from "react";
import { X, ShieldOff } from "lucide-react";

const SUSPENSION_REASONS = [
  "Violation of terms of service",
  "Suspicious activity",
  "Request from user",
  "Administrative review",
  "Inactivity / account cleanup",
  "Other",
];

interface Props {
  user: { id: string; firstName: string; lastName: string; role: string };
  onConfirm: (reason: string, note?: string) => void;
  onClose: () => void;
}

export default function SuspendModal({ user, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0d1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldOff size={18} />
            <h2 className="font-semibold">Suspend Account</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-slate-300">
            <strong className="text-white">
              {user.firstName} {user.lastName}
            </strong>{" "}
            will not be able to log in while suspended. They will see a clear suspension message.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Suspension reason <span className="text-red-400">*</span>
            </label>
            <select
              id="sa-suspend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="">Select a reason…</option>
              {SUSPENSION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Additional note (optional)
            </label>
            <textarea
              id="sa-suspend-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Internal note visible only to SuperAdmin…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            id="sa-suspend-confirm-btn"
            disabled={!reason}
            onClick={() => onConfirm(reason, note || undefined)}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suspend Account
          </button>
        </div>
      </div>
    </div>
  );
}
