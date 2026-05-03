"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Search, Clock, FileText, Loader2, Globe, Cpu,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes"; // Listening to the Somber Switch
import { getAuditLogs } from "@/lib/actions/audit.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function AdminAuditPage() {
  const router = useRouter();
  const { theme } = useTheme(); // Component now reacts to the global theme
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const groupedLogs = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const log of logs) {
      const dateLabel = new Date(log.timestamp).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groups.has(dateLabel)) {
        groups.set(dateLabel, []);
      }
      groups.get(dateLabel)?.push(log);
    }
    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  }, [logs]);

  // Initial Load & Auth
  useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      if (!user || user.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      loadData();
    }
    init();
  }, []);

  // Fetch function
  const loadData = async (query: string = "") => {
    setIsRefreshing(true);
    const data = await getAuditLogs(query);
    setLogs(data);
    setLoading(false);
    setIsRefreshing(false);
  };

  // Real-time Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) loadData(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">System Audit Log</h1>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Platform Integrity Monitor</p>
        </div>
        {isRefreshing && <Loader2 size={16} className="animate-spin text-indigo-500" />}
      </div>
        {/* Search & Stats */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
            <input
              type="text"
              placeholder="Filter by action, user, or entity type..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 pl-12 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">Live Records</p>
            <p className="text-xl font-black text-indigo-600">{logs.length}</p>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="space-y-8">
          {groupedLogs.map((group) => (
            <section key={group.date}>
              <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                {group.date}
              </div>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 h-full w-px bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-4">
                  {group.items.map((log) => (
                    <div key={log.id} className="relative rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-xl hover:shadow-indigo-50/50 dark:hover:shadow-none">
                      <div className={`absolute -left-[30px] top-8 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 ${
                        log.action.includes("DELETE")
                          ? "bg-rose-500"
                          : log.action.includes("CREATE")
                            ? "bg-emerald-500"
                            : "bg-indigo-500"
                      }`} />

                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex items-center gap-4 min-w-[200px]">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black">
                            {log.user?.firstName?.charAt(0)}{log.user?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{log.user?.firstName} {log.user?.lastName}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{log.user?.email}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-slate-900 dark:bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider">
                              {log.action}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-tighter">
                              {log.entityType}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-mono text-[12px] bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            {log.changes ? (typeof log.changes === "string" ? log.changes : JSON.stringify(log.changes, null, 2)) : "No specific data changes recorded."}
                          </p>

                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              <Globe size={12} /> {log.ipAddress || "Internal"}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                              <Cpu size={12} /> {log.userAgent || "Unknown Client"}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 ml-auto">
                              <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}

          {logs.length === 0 && !isRefreshing && (
            <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <FileText size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <h3 className="text-lg font-bold dark:text-white">Clean Slate</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">No audit logs found matching your filters.</p>
            </div>
          )}
        </div>
    </div>
  );
}