import { getAlertStats } from "@/lib/actions/alert.actions";
import { getAllUsers } from "@/lib/actions/admin.actions";
import LiveAdminDashboard from "@/components/admin/LiveAdminDashboard";
import Link from "next/link";

export default async function AdminDashboard() {
  const alertRes = await getAlertStats();
  const alertData = alertRes?.stats ?? {
    total: 0,
    critical: 0,
    open: 0,
    resolved: 0,
  };
  const allUsers = await getAllUsers();
  const initialStats = {
    totalAlerts: alertData.total || 0,
    criticalAlerts: alertData.critical || 0,
    openAlerts: alertData.open || 0,
    resolvedAlerts: alertData.resolved || 0,
    totalUsers: allUsers.length,
    totalDoctors: allUsers.filter((u: any) => u.role === "DOCTOR").length,
    totalPatients: allUsers.filter((u: any) => u.role === "PATIENT").length,
  };

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
        <Link
          href="/admin/alerts"
          className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/25 p-3 text-sm font-bold text-slate-700 dark:text-cyan-100"
        >
          Incidents
        </Link>
        <Link
          href="/admin/users"
          className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/25 p-3 text-sm font-bold text-slate-700 dark:text-cyan-100"
        >
          Users
        </Link>
        <Link
          href="/admin/analytics"
          className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/25 p-3 text-sm font-bold text-slate-700 dark:text-cyan-100"
        >
          Analytics
        </Link>
      </div>
      <LiveAdminDashboard initialStats={initialStats} />
    </>
  );
}
