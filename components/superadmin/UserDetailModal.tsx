"use client";

/**
 * [NEW] User Detail Modal — shows full user info + edit history + suspension history
 */

import { useState, useEffect } from "react";
import { X, Clock, ShieldOff, Edit3 } from "lucide-react";
import {
  superAdminGetUserEditHistory,
  superAdminGetSuspensionHistory,
} from "@/lib/actions/superadmin.actions";

interface Props {
  user: any;
  onClose: () => void;
}

type Tab = "details" | "edits" | "suspensions";

export default function UserDetailModal({ user, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("details");
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [suspHistory, setSuspHistory] = useState<any[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingSusp, setLoadingSusp] = useState(false);

  useEffect(() => {
    if (tab === "edits" && editHistory.length === 0) {
      setLoadingEdit(true);
      superAdminGetUserEditHistory(user.id).then((r) => {
        if (r.success) setEditHistory(r.data ?? []);
        setLoadingEdit(false);
      });
    }
    if (tab === "suspensions" && suspHistory.length === 0) {
      setLoadingSusp(true);
      superAdminGetSuspensionHistory(user.id).then((r) => {
        if (r.success) setSuspHistory(r.data ?? []);
        setLoadingSusp(false);
      });
    }
  }, [tab]);

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-200">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/40 to-fuchsia-600/40 flex items-center justify-center text-white font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h2 className="font-semibold text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 flex-shrink-0">
          {(["details", "edits", "suspensions"] as Tab[]).map((t) => (
            <button
              key={t}
              id={`sa-detail-tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-violet-500 text-violet-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "edits" ? "Edit History" : t === "suspensions" ? "Suspension History" : "Details"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "details" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" value={`${user.firstName} ${user.lastName}`} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={user.role} />
              <Field label="Phone" value={user.phoneNumber} />
              <Field label="Status" value={user.isSuspended ? "Suspended" : user.isDeleted ? "Deleted" : user.isActive ? "Active" : "Inactive"} />
              <Field label="Language" value={user.languagePreference?.toUpperCase()} />
              <Field label="Created At" value={new Date(user.createdAt).toLocaleString("en-GB")} />
              <Field label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString("en-GB") : "Never"} />
              {user.internalNotes && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Internal Notes (SuperAdmin only)</p>
                  <p className="mt-1 rounded-lg bg-violet-500/10 px-3 py-2 text-sm text-violet-200">{user.internalNotes}</p>
                </div>
              )}
              {user.suspensionReason && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Suspension Reason</p>
                  <p className="mt-1 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{user.suspensionReason}</p>
                </div>
              )}
            </div>
          )}

          {tab === "edits" && (
            loadingEdit ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
            ) : editHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No edit history yet.</p>
            ) : (
              <div className="space-y-3">
                {editHistory.map((h: any) => (
                  <div key={h.id} className="rounded-xl bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <Edit3 size={12} />
                      <span>{h.changedBy?.firstName} {h.changedBy?.lastName}</span>
                      <span>·</span>
                      <span>{new Date(h.changedAt).toLocaleString("en-GB")}</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      <span className="font-mono text-violet-300">{h.fieldName}</span>:{" "}
                      <span className="line-through text-slate-500">{h.oldValue || "—"}</span>{" "}
                      → <span className="text-emerald-300">{h.newValue || "—"}</span>
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "suspensions" && (
            loadingSusp ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
            ) : suspHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No suspension history.</p>
            ) : (
              <div className="space-y-3">
                {suspHistory.map((h: any) => (
                  <div key={h.id} className="rounded-xl bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <ShieldOff size={12} />
                      <span
                        className={
                          h.action === "SUSPENDED"
                            ? "text-amber-400 font-semibold"
                            : "text-emerald-400 font-semibold"
                        }
                      >
                        {h.action}
                      </span>
                      <span>·</span>
                      <span>{h.performedBy?.firstName} {h.performedBy?.lastName}</span>
                      <span>·</span>
                      <span>{new Date(h.performedAt).toLocaleString("en-GB")}</span>
                    </div>
                    {h.reason && <p className="text-sm text-slate-300">{h.reason}</p>}
                    {h.note && <p className="mt-1 text-xs text-slate-500">{h.note}</p>}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
