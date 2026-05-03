"use client";

/**
 * [NEW] SuperAdmin Audit Log Page
 * Route: /superadmin/audit
 * Features: filterable table, color-coded severity, expandable rows, CSV export
 */

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  Loader2,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { superAdminGetAuditLogs, superAdminLogExport } from "@/lib/actions/superadmin.actions";

const SEVERITY_STYLES: Record<string, { row: string; badge: string }> = {
  INFO:     { row: "hover:bg-white/5",        badge: "bg-slate-700 text-slate-300" },
  WARNING:  { row: "hover:bg-amber-500/5",    badge: "bg-amber-500/20 text-amber-300" },
  CRITICAL: { row: "hover:bg-red-500/5",      badge: "bg-red-500/20 text-red-400" },
};

const ACTIONS = [
  "USER_CREATED","USER_UPDATED","USER_DELETED","USER_SUSPENDED",
  "USER_RESTORED","USER_REACTIVATED","LOGIN_SUCCESS","LOGIN_FAILED",
  "PASSWORD_RESET","PERMISSION_CHANGED","DATA_EXPORTED",
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [severity, setSeverity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const PAGE_SIZE = 50;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    startTransition(async () => {
      const result = await superAdminGetAuditLogs({
        page, pageSize: PAGE_SIZE,
        action: action || undefined,
        severity: severity || undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (result.success && result.data) {
        setLogs((result.data as any).logs ?? []);
        setTotal((result.data as any).total ?? 0);
        setTotalPages((result.data as any).totalPages ?? 1);
      }
      setLoading(false);
    });
  }, [page, action, severity, search, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchLogs, 30_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const exportCSV = async () => {
    await superAdminLogExport("AUDIT_LOG_CSV");
    if (!logs.length) return;

    const headers = ["Timestamp", "Actor", "Actor Role", "Action", "Target", "Target Role", "Severity", "IP Address", "Reason"];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.actorName,
      l.actorRole,
      l.action,
      l.targetName ?? "",
      l.targetRole ?? "",
      l.severity,
      l.ipAddress ?? "",
      l.reason ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Immutable log of all system events · {total.toLocaleString()} total entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="sa-audit-refresh"
            onClick={fetchLogs}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            id="sa-audit-export-csv"
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="sa-audit-search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search actor, target, IP…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <select
          id="sa-audit-filter-action"
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
        </select>
        <select
          id="sa-audit-filter-severity"
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
        <input
          id="sa-audit-start-date"
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
        <input
          id="sa-audit-end-date"
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden backdrop-blur">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-violet-400" />
          </div>
        ) : logs.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">No audit events found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-6" />
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-left">Actor</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Target</th>
                  <th className="px-4 py-3 text-left">Severity</th>
                  <th className="px-4 py-3 text-left">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  const styles = SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.INFO;
                  const isExpanded = expanded === log.id;
                  return (
                    <>
                      <tr
                        key={log.id}
                        id={`sa-audit-row-${log.id}`}
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                        className={`cursor-pointer transition-colors ${styles.row}`}
                      >
                        <td className="px-4 py-3 text-slate-500">
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-200 font-medium">{log.actorName}</p>
                          <p className="text-xs text-slate-500">{log.actorRole}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-violet-300">
                          {log.action}
                        </td>
                        <td className="px-4 py-3">
                          {log.targetName ? (
                            <>
                              <p className="text-slate-200">{log.targetName}</p>
                              <p className="text-xs text-slate-500">{log.targetRole}</p>
                            </>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                          {log.ipAddress ?? "—"}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${log.id}-expanded`} className="bg-white/[0.02]">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              {log.reason && (
                                <div>
                                  <p className="text-slate-500 mb-1">Reason</p>
                                  <p className="text-slate-300">{log.reason}</p>
                                </div>
                              )}
                              {log.device && (
                                <div>
                                  <p className="text-slate-500 mb-1">Device</p>
                                  <p className="text-slate-300">{log.device}</p>
                                </div>
                              )}
                              {log.changedFields && (log.changedFields as any[]).length > 0 && (
                                <div className="col-span-2">
                                  <p className="text-slate-500 mb-2">Changed Fields</p>
                                  <div className="space-y-1">
                                    {(log.changedFields as any[]).map((f: any, i: number) => (
                                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-1.5">
                                        <span className="font-mono text-violet-300">{f.field}</span>
                                        <span className="text-slate-500 line-through">{String(f.old_value ?? "—")}</span>
                                        <span className="text-slate-300">→</span>
                                        <span className="text-emerald-300">{String(f.new_value ?? "—")}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-3">
            <p className="text-xs text-slate-500">Page {page} of {totalPages} · {total.toLocaleString()} events</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/5 disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/5 disabled:opacity-30">
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
