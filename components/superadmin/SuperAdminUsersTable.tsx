"use client";

/**
 * [NEW] SuperAdmin Users Table (shared across all role pages)
 * Features: search, filter, sort, paginate, suspend, delete, restore
 */

import { useState, useTransition, useCallback, useEffect } from "react";
import {
  Search,
  Plus,
  Loader2,
  ShieldOff,
  ShieldCheck,
  Trash2,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  superAdminSuspendUser,
  superAdminReactivateUser,
  superAdminSoftDeleteUser,
  superAdminRestoreUser,
  superAdminGetUsers,
} from "@/lib/actions/superadmin.actions";
import UserFormDrawer from "./UserFormDrawer";
import UserDetailModal from "./UserDetailModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import SuspendModal from "./SuspendModal";

const ROLE_BADGE: Record<string, string> = {
  ADMIN:       "bg-sky-500/15 text-sky-300",
  DOCTOR:      "bg-emerald-500/15 text-emerald-300",
  PATIENT:     "bg-pink-500/15 text-pink-300",
  NURSE:       "bg-amber-500/15 text-amber-300",
  COORDINATOR: "bg-indigo-500/15 text-indigo-300",
  AUDITOR:     "bg-violet-500/15 text-violet-300",
  SUPERADMIN:  "bg-fuchsia-500/15 text-fuchsia-300",
};

interface Props {
  roleFilter?: string;
  statusFilter?: "active" | "suspended" | "deleted" | "all";
  title: string;
  allowCreate?: boolean;
  createRole?: string;
}

export default function SuperAdminUsersTable({
  roleFilter,
  statusFilter: initialStatus = "all",
  title,
  allowCreate = true,
  createRole,
}: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended" | "deleted">(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);

  const PAGE_SIZE = 20;

  const fetchUsers = useCallback(() => {
    setLoading(true);
    startTransition(async () => {
      const result = await superAdminGetUsers({
        role: roleFilter,
        status,
        search,
        page,
        pageSize: PAGE_SIZE,
      });
      if (result.success && result.data) {
        setUsers((result.data as any).users ?? []);
        setTotal((result.data as any).total ?? 0);
        setTotalPages((result.data as any).totalPages ?? 1);
      }
      setLoading(false);
    });
  }, [roleFilter, status, search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSuspend = async (userId: string, reason: string, note?: string) => {
    await superAdminSuspendUser(userId, reason, note);
    setSuspendTarget(null);
    fetchUsers();
  };

  const handleReactivate = async (userId: string) => {
    await superAdminReactivateUser(userId);
    fetchUsers();
  };

  const handleDelete = async (userId: string, reason?: string) => {
    await superAdminSoftDeleteUser(userId, reason);
    setDeleteTarget(null);
    fetchUsers();
  };

  const handleRestore = async (userId: string) => {
    await superAdminRestoreUser(userId);
    fetchUsers();
  };

  const StatusBadge = ({ user }: { user: any }) => {
    if (user.isDeleted) return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">Deleted</span>;
    if (user.isSuspended) return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Suspended</span>;
    if (!user.isActive) return <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-semibold text-slate-400">Inactive</span>;
    return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Active</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {total} user{total !== 1 ? "s" : ""} total
          </p>
        </div>
        {allowCreate && (
          <button
            id="sa-add-user-btn"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30 hover:bg-violet-500 transition-colors"
          >
            <Plus size={16} />
            Add {createRole ?? "User"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="sa-user-search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div className="flex rounded-xl border border-white/10 overflow-hidden text-xs font-medium">
          {(["all", "active", "suspended", "deleted"] as const).map((s) => (
            <button
              key={s}
              id={`sa-filter-${s}`}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 capitalize transition-colors ${
                status === s
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden backdrop-blur">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-violet-400" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Last Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-500/40 to-fuchsia-600/40 flex items-center justify-center text-white text-xs font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[user.role] ?? ""}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge user={user} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("en-GB")
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`sa-view-${user.id}`}
                          onClick={() => setDetailUser(user)}
                          aria-label="View details"
                          title="View details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-violet-300 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        {!user.isDeleted && !user.isSuspended && user.role !== "SUPERADMIN" && (
                          <button
                            id={`sa-suspend-${user.id}`}
                            onClick={() => setSuspendTarget(user)}
                            aria-label="Suspend user"
                            title="Suspend"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                          >
                            <ShieldOff size={14} />
                          </button>
                        )}
                        {user.isSuspended && (
                          <button
                            id={`sa-reactivate-${user.id}`}
                            onClick={() => handleReactivate(user.id)}
                            aria-label="Reactivate user"
                            title="Reactivate"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                          >
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        {user.isDeleted ? (
                          <button
                            id={`sa-restore-${user.id}`}
                            onClick={() => handleRestore(user.id)}
                            aria-label="Restore user"
                            title="Restore"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-teal-500/10 hover:text-teal-400 transition-colors"
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : user.role !== "SUPERADMIN" ? (
                          <button
                            id={`sa-delete-${user.id}`}
                            onClick={() => setDeleteTarget(user)}
                            aria-label="Delete user"
                            title="Delete (soft)"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-3">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                title="Previous page"
                className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                title="Next page"
                className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & drawers */}
      {drawerOpen && (
        <UserFormDrawer
          role={createRole}
          onClose={() => setDrawerOpen(false)}
          onCreated={() => { setDrawerOpen(false); fetchUsers(); }}
        />
      )}
      {detailUser && (
        <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={(reason) => handleDelete(deleteTarget.id, reason)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {suspendTarget && (
        <SuspendModal
          user={suspendTarget}
          onConfirm={(reason, note) => handleSuspend(suspendTarget.id, reason, note)}
          onClose={() => setSuspendTarget(null)}
        />
      )}
    </div>
  );
}
