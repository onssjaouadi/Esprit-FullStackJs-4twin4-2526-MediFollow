"use client";

/**
 * [NEW] Delete Confirmation Modal
 * Requires user to type "DELETE [username]" before proceeding.
 */

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface Props {
  user: { id: string; firstName: string; lastName: string; role: string };
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ user, onConfirm, onClose }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const expected = `DELETE ${user.firstName} ${user.lastName}`;
  const isValid = confirmText === expected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0d1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={18} />
            <h2 className="font-semibold">Delete User</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-slate-300">
            This will <strong className="text-red-400">soft-delete</strong> the account. The user
            will be hidden from all other roles but can be restored by a SuperAdmin.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Reason (optional)
            </label>
            <input
              id="sa-delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for deletion…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Type <span className="font-mono text-red-400">{expected}</span> to confirm
            </label>
            <input
              id="sa-delete-confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              placeholder={expected}
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
            id="sa-delete-confirm-btn"
            disabled={!isValid}
            onClick={() => onConfirm(reason || undefined)}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
