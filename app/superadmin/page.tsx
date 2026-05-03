/**
 * [NEW] SuperAdmin Overview Page
 * Route: /superadmin
 * Shows: role counts, recent signups, suspended accounts, failed logins, live audit feed.
 */

import Link from "next/link";
import { getSuperAdminStats } from "@/lib/actions/superadmin.actions";
import {
  Users,
  UserCog,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  UserCheck,
  ShieldOff,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";

const ROLE_META: Record<string, { label: string; icon: any; color: string; bg: string; href: string }> = {
  ADMIN:       { label: "Admins",       icon: UserCog,       color: "text-sky-400",     bg: "bg-sky-500/10", href: "/superadmin/users/admins" },
  DOCTOR:      { label: "Doctors",      icon: Stethoscope,   color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/superadmin/users/doctors" },
  PATIENT:     { label: "Patients",     icon: HeartPulse,    color: "text-pink-400",    bg: "bg-pink-500/10", href: "/superadmin/users/patients" },
  NURSE:       { label: "Nurses",       icon: ClipboardList, color: "text-amber-400",   bg: "bg-amber-500/10", href: "/superadmin/users/nurses" },
  COORDINATOR: { label: "Coordinators", icon: UserCheck,     color: "text-indigo-400",  bg: "bg-indigo-500/10", href: "/superadmin/users/coordinators" },
  AUDITOR:     { label: "Auditors",     icon: Activity,      color: "text-violet-400",  bg: "bg-violet-500/10", href: "/superadmin/users" },
};

const SEVERITY_BADGE: Record<string, string> = {
  INFO:     "bg-slate-700 text-slate-300",
  WARNING:  "bg-amber-500/20 text-amber-300",
  CRITICAL: "bg-red-500/20 text-red-300",
};

export default async function SuperAdminOverviewPage() {
  const result = await getSuperAdminStats();
  const data = result.success ? result.data : null;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">SuperAdmin Overview</h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-time view of your entire user ecosystem.
        </p>
      </div>

      {/* Role stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <Link
            key={role}
            href={meta.href}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${meta.bg}`}>
              <meta.icon size={20} className={meta.color} />
            </div>
            <p className="mt-3 text-3xl font-bold text-white tabular-nums">
              {data?.roleStats?.[role] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-300">{meta.label}</p>
          </Link>
        ))}
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Recent signups */}
        <Link href="/superadmin/users" className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 transition-transform group-hover:scale-110">
              <TrendingUp size={20} className="text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data?.recentSignups ?? 0}
              </p>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">New users (last 7 days)</p>
            </div>
          </div>
        </Link>

        {/* Suspended accounts */}
        <Link href="/superadmin/users/deleted" className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 transition-transform group-hover:scale-110">
              <ShieldOff size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data?.suspended ?? 0}
              </p>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">Currently suspended</p>
            </div>
          </div>
        </Link>

        {/* Failed logins */}
        <Link href="/superadmin/audit" className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 transition-transform group-hover:scale-110">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data?.recentFailedLogins ?? 0}
              </p>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">Failed logins (24h)</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent audit events */}
      <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Recent Audit Events</h2>
        </div>
        <div className="divide-y divide-white/5">
          {data?.recentAuditLogs?.length ? (
            data.recentAuditLogs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    SEVERITY_BADGE[log.severity] ?? SEVERITY_BADGE.INFO
                  }`}
                >
                  {log.severity}
                </span>
                <span className="flex-1 text-sm text-slate-300 truncate">
                  <span className="font-medium text-white">{log.actorName}</span>{" "}
                  {log.action.replace(/_/g, " ").toLowerCase()}{" "}
                  {log.targetName ? (
                    <span className="font-medium text-violet-300">{log.targetName}</span>
                  ) : null}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="px-6 py-8 text-center text-sm text-slate-400">
              No audit events yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
