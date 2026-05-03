"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes"; // Correctly imported to sync with Somber mode

import {
  ArrowLeft,
  TrendingUp,
  Users,
  Activity,
  AlertCircle,
  Download,
  Database,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// --- Types ---
interface UserData { date: string; count: number; }
interface AlertSeverityData { name: string; value: number; color: string; }
interface ActivityData { time: string; alerts: number; }

interface AnalyticsResponse {
  stats: {
    totalUsers: number;
    totalAlerts: number;
    activeUsers: number;
    resolutionRate: number;
  };
  userData: UserData[];
  alertTrendData: UserData[];
  activityData: ActivityData[];
  severityData: AlertSeverityData[];
}

export default function AdminAnalyticsPage() {
  const { theme } = useTheme(); // Listening to the global "Somber" toggle
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7days");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [alertTrendData, setAlertTrendData] = useState<UserData[]>([]);
  const [severityData, setSeverityData] = useState<AlertSeverityData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAlerts: 0,
    activeUsers: 0,
    resolutionRate: 0,
  });

  // Helper to get text color for charts based on theme
  const chartTextColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const gridColor = theme === "dark" ? "#1e293b" : "#f1f5f9";
  const combinedTrendData = userData.map((point, idx) => ({
    date: point.date,
    users: point.count,
    alerts: alertTrendData[idx]?.count || 0,
  }));

  const usersTrend = calculateTrend(userData.map((entry) => entry.count));
  const alertsTrend = calculateTrend(alertTrendData.map((entry) => entry.count));
  const resolutionTrend = calculateTrend([0, stats.resolutionRate]);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as AnalyticsResponse;
      setStats(result.stats);
      setUserData(result.userData || []);
      setAlertTrendData(result.alertTrendData || []);
      setSeverityData(result.severityData || []);
      setActivityData(result.activityData || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const exportToCSV = () => {
    const timestamp = new Date().toLocaleString("en-US");
    const rows = [
      ["CAREPULSE ANALYTICS REPORT"],
      [`Generated on: ;${timestamp}`],
      [`Period: ;${period.toUpperCase()}`],
      [],
      ["SECTION;METRIC;VALUE;STATUS"],
      [`Users;Total Users;${stats.totalUsers};Active`],
      [`Users;Active Users;${stats.activeUsers};Connected`],
      [`Performance;Resolution Rate;${stats.resolutionRate}%;Stable`],
      [`Alerts;Total Alerts;${stats.totalAlerts};Attention`],
      [],
      ["PERIOD HISTORY"],
      ["Date;User Count"],
      ...userData.map(d => [`${d.date};${d.count}`])
    ];

    const csvContent = rows.map(e => e.join("")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CarePulse_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Activity className="animate-spin text-indigo-500 mb-4" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase">Loading...</p>
    </div>
  );

  return (
    <div className="relative overflow-hidden pb-12">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-700/20" />
      <div className="pointer-events-none absolute top-16 right-8 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-700/10" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Analytics Command Center</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Intelligence</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
        >
          <Download size={14} /> EXPORT (.CSV)
        </button>
      </div>

      <div className="relative z-10">
        <div className="glass-panel p-1 rounded-2xl flex gap-1 w-fit mb-10">
          {["7days", "30days", "3months"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                period === p ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {p === "7days" ? "7 DAYS" : p === "30days" ? "30 DAYS" : "3 MONTHS"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend={formatTrend(usersTrend)} trendTone={usersTrend > 0 ? "up" : usersTrend < 0 ? "down" : "flat"} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
          <StatCard title="Active Users" value={stats.activeUsers} icon={Activity} trend={`${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% active`} trendTone="up" color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
          <StatCard title="Alerts" value={stats.totalAlerts} icon={AlertCircle} trend={formatTrend(alertsTrend)} trendTone={alertsTrend > 0 ? "down" : alertsTrend < 0 ? "up" : "flat"} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-900/20" />
          <StatCard title="Resolution Rate" value={`${stats.resolutionRate}%`} icon={TrendingUp} trend={formatTrend(resolutionTrend)} trendTone={resolutionTrend >= 0 ? "up" : "down"} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartBox title="User Growth" subtitle="Daily evolution">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedTrendData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.16}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: theme === 'dark' ? '#fff' : '#000' 
                  }} 
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={3} fill="url(#userGrad)" />
                <Area type="monotone" dataKey="alerts" name="Alerts" stroke="#f43f5e" strokeWidth={2} fill="url(#alertGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Alert Severity" subtitle="Distribution by risk level">
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie 
                  data={severityData} 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={8} 
                  dataKey="value"
                  cornerRadius={10} 
                >
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </RePieChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ChartBox title="Activity Peaks" subtitle="Hourly volume" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: chartTextColor}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor}} />
                <Tooltip cursor={{fill: theme === 'dark' ? '#1e293b' : '#f8fafc'}} />
                <Bar dataKey="alerts" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>

          <div className="bg-slate-900 dark:bg-black rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Infrastructure</h3>
              <div className="space-y-6">
                <ProgressItem label="System Uptime" val="99.9%" percent={99.9} color="bg-emerald-400" />
                <ProgressItem label="API Latency" val="142ms" percent={85} color="bg-indigo-400" />
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <Database size={16} className="text-emerald-400" />
              <p className="text-[10px] font-bold text-slate-300">Active Synchronization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateTrend(series: number[]) {
  if (series.length < 2) return 0;
  const first = series[0] ?? 0;
  const last = series[series.length - 1] ?? 0;
  if (first === 0) return last === 0 ? 0 : 100;
  return ((last - first) / Math.abs(first)) * 100;
}

function formatTrend(value: number) {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}%`;
  return `${rounded}%`;
}

// --- Sub-Components Updated for Somber Mode ---

function StatCard({ title, value, icon: Icon, trend, trendTone = "flat", color, bg }: any) {
  const trendClass =
    trendTone === "up"
      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"
      : trendTone === "down"
        ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600"
        : "bg-slate-100 dark:bg-slate-800 text-slate-500";

  return (
    <div className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`size-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendClass}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ChartBox({ title, subtitle, children, className = "" }: any) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-8 shadow-sm ${className}`}>
      <div className="mb-6">
        <h3 className="text-md font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ProgressItem({ label, val, percent, color }: any) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-bold text-slate-500">{label}</span>
        <span className="text-[10px] font-black">{val}</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}