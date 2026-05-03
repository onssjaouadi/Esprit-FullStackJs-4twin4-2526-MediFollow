"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import Link from "next/link";
import {
  AlertCircle,
  Activity,
  UserCog,
  Users,
  Clock,
  Database,
  Server,
  Globe,
  Shield,
  Sparkles,
  Bot,
  Send,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAlerts: number;
  criticalAlerts: number;
  openAlerts: number;
  resolvedAlerts: number;
  userTrend7d?: number[];
  alertTrend7d?: number[];
}

interface FeedEntry {
  id: string;
  type: "alert" | "signup";
  title: string;
  desc: string;
  time: Date;
}

interface AiCopilotResult {
  answer: string;
  navigationPath?: string;
  suggestions?: string[];
}

// Animates a number from its previous value to the new target
function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === target) return;

    const start = prev;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display;
}

function AnimatedStatCard({
  label,
  value,
  icon,
  color,
  flash,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  flash: boolean;
  trend: number[];
}) {
  const animated = useCountUp(value);

  const colors: Record<string, string> = {
    indigo: "text-cyan-300 bg-cyan-500/15",
    emerald: "text-emerald-300 bg-emerald-500/15",
    amber: "text-amber-300 bg-amber-500/15",
    slate: "text-slate-200 bg-slate-500/20",
    rose: "text-rose-300 bg-rose-500/15",
  };

  const points = (() => {
    if (!trend || trend.length === 0) return "";
    const max = Math.max(...trend, 1);
    const min = Math.min(...trend, 0);
    const span = Math.max(max - min, 1);
    return trend
      .map((point, index) => {
        const x = (index / Math.max(trend.length - 1, 1)) * 100;
        const y = 100 - ((point - min) / span) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  })();

  return (
    <div
      className={`glass-panel glass-scan group rounded-[2rem] border border-cyan-300/20 p-7 shadow-[0_20px_60px_rgba(2,6,23,0.45)] transition-all duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-6px)] ${
        flash ? "glass-neon scale-[1.04]" : ""
      }`}
    >
      <div
        className={`inline-block rounded-2xl p-3 mb-6 ${colors[color]} [transform:translateZ(20px)]`}
      >
        {icon}
      </div>
      <p className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight [transform:translateZ(28px)]">
        {animated}
      </p>
      <p className="text-xs font-bold text-slate-500 dark:text-cyan-100/70 uppercase tracking-widest mt-1 [transform:translateZ(14px)]">
        {label}
      </p>
      <div className="mt-4 rounded-xl bg-slate-200/50 dark:bg-slate-900/35 p-2 [transform:translateZ(10px)]">
        <svg viewBox="0 0 100 24" className="h-6 w-full">
          <polyline
            points={points || "0,20 100,20"}
            fill="none"
            stroke="currentColor"
            className={colors[color].split(" ")[0]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  title,
  status,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/45 text-cyan-600 dark:text-cyan-200 border border-slate-200 dark:border-cyan-300/20">
          {icon}
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {title}
        </p>
      </div>
      <div className="text-right">
        <div
          className={`inline-block h-2 w-2 rounded-full ${
            active
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : "bg-amber-400 animate-pulse"
          }`}
        />
        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-cyan-100/65 mt-1">
          {status}
        </p>
      </div>
    </div>
  );
}

export default function LiveAdminDashboard({
  initialStats,
}: {
  initialStats: Stats;
}) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [flashCards, setFlashCards] = useState<Set<string>>(new Set());
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiCopilotResult | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silently ignore
    }
  }, []);

  const askCopilot = useCallback(async (query: string) => {
    const cleaned = query.trim();
    if (!cleaned) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/admin/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleaned }),
      });

      const payload = await response.json();
      if (response.ok && payload?.success && payload?.result) {
        setAiResult(payload.result as AiCopilotResult);
      } else {
        setAiResult(null);
        setAiError(payload?.error || "Copilot is unavailable right now.");
      }
    } catch {
      setAiResult(null);
      setAiError("Copilot is unavailable right now.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  const quickPrompts = [
    "unresolved critical alerts today",
    "user management summary",
    "access permissions review",
    "patients with repeated high bp",
  ];

  const addFeedEntry = useCallback((entry: Omit<FeedEntry, "id" | "time">) => {
    setFeed((prev) => [
      { ...entry, id: crypto.randomUUID(), time: new Date() },
      ...prev.slice(0, 7),
    ]);
  }, []);

  const flashCard = useCallback((keys: string[]) => {
    setFlashCards(new Set(keys));
    const timer = setTimeout(() => setFlashCards(new Set()), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const pusher = new Pusher("ba707a9085e391ba151b", { cluster: "eu" });
    const channel = pusher.subscribe("admin-updates");

    channel.bind(
      "new-alert",
      async (payload: { title?: string; desc?: string }) => {
        await refreshStats();
        addFeedEntry({
          type: "alert",
          title: payload.title || "New alert",
          desc: payload.desc || "",
        });
        flashCard(["totalAlerts", "criticalAlerts", "openAlerts"]);
      }
    );

    channel.bind(
      "new-signup",
      async (payload: { title?: string; desc?: string }) => {
        await refreshStats();
        addFeedEntry({
          type: "signup",
          title: payload.title || "New user",
          desc: payload.desc || "",
        });
        flashCard(["totalUsers", "totalPatients", "totalDoctors"]);
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-updates");
      pusher.disconnect();
    };
  }, [refreshStats, addFeedEntry, flashCard]);

  const resolvedRate =
    stats.totalAlerts > 0
      ? Math.round((stats.resolvedAlerts / stats.totalAlerts) * 100)
      : 0;

  const quickActions = [
    {
      href: "/admin/alerts",
      label: "Review incidents",
      desc: "Prioritize open and critical alerts",
    },
    {
      href: "/admin/users",
      label: "Manage users",
      desc: "Roles, access, and account status",
    },
    {
      href: "/admin/analytics",
      label: "Open analytics",
      desc: "Trends and care performance",
    },
    {
      href: "/admin/audit",
      label: "Audit logs",
      desc: "Track admin operations and events",
    },
  ];

  const openRate =
    stats.totalAlerts > 0
      ? Math.round((stats.openAlerts / stats.totalAlerts) * 100)
      : 0;
  const criticalRate =
    stats.totalAlerts > 0
      ? Math.round((stats.criticalAlerts / stats.totalAlerts) * 100)
      : 0;

  return (
    <div className="relative">
      <div className="glass-orb pointer-events-none absolute -top-16 left-0 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="glass-orb pointer-events-none absolute top-16 right-6 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl" />

      <section className="glass-panel glass-neon glass-scan relative mb-8 overflow-hidden rounded-[2rem] border border-cyan-300/20 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.5)] lg:p-8">
        <div className="glass-orb absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="glass-orb absolute -bottom-10 left-1/2 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-200/80">
              MediFollow Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-900 dark:text-white lg:text-4xl">
              A clearer command center for safer, faster patient operations
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-cyan-100/80 lg:text-base">
              Monitor incidents in real time, keep user governance under
              control, and coordinate clinical teams with fewer clicks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <div className="glass-panel rounded-xl border border-cyan-300/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-cyan-100/70">
                Open
              </p>
              <p className="mt-1 text-2xl font-black text-rose-600">
                {stats.openAlerts}
              </p>
            </div>
            <div className="glass-panel rounded-xl border border-cyan-300/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-cyan-100/70">
                Critical
              </p>
              <p className="mt-1 text-2xl font-black text-amber-600">
                {stats.criticalAlerts}
              </p>
            </div>
            <div className="glass-panel rounded-xl border border-cyan-300/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-cyan-100/70">
                Resolved
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {stats.resolvedAlerts}
              </p>
            </div>
            <div className="glass-panel rounded-xl border border-cyan-300/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-cyan-100/70">
                Users
              </p>
              <p className="mt-1 text-2xl font-black text-indigo-600">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AnimatedStatCard
          label="Total Registry"
          value={stats.totalUsers}
          icon={<Users size={20} />}
          color="indigo"
          flash={flashCards.has("totalUsers")}
          trend={stats.userTrend7d || []}
        />
        <AnimatedStatCard
          label="Active Patients"
          value={stats.totalPatients}
          icon={<Activity size={20} />}
          color="emerald"
          flash={flashCards.has("totalPatients")}
          trend={stats.userTrend7d || []}
        />
        <AnimatedStatCard
          label="Verified Doctors"
          value={stats.totalDoctors}
          icon={<UserCog size={20} />}
          color="amber"
          flash={flashCards.has("totalDoctors")}
          trend={stats.userTrend7d || []}
        />
        <AnimatedStatCard
          label="Total Alerts"
          value={stats.totalAlerts}
          icon={<AlertCircle size={20} />}
          color="slate"
          flash={flashCards.has("totalAlerts")}
          trend={stats.alertTrend7d || []}
        />
        <AnimatedStatCard
          label="Critical Alerts"
          value={stats.criticalAlerts}
          icon={<AlertCircle size={20} />}
          color="rose"
          flash={flashCards.has("criticalAlerts")}
          trend={stats.alertTrend7d || []}
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-panel rounded-[2rem] border border-cyan-300/20 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.42)] lg:p-8 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Incident Operations
            </h3>
            <Link
              href="/admin/alerts"
              className="glass-panel inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-cyan-300/25 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-cyan-100 transition hover:border-slate-400 dark:hover:border-cyan-300 hover:text-slate-900 dark:hover:text-white"
            >
              Open incidents
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-cyan-100/70">
                <span>Resolved rate</span>
                <span className="text-emerald-600">{resolvedRate}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900/45">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${resolvedRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-cyan-100/70">
                <span>Open rate</span>
                <span className="text-rose-600">{openRate}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900/45">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${openRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-cyan-100/70">
                <span>Critical rate</span>
                <span className="text-amber-600">{criticalRate}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900/45">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${criticalRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.slice(0, 2).map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="glass-panel rounded-2xl border border-cyan-300/20 p-4 transition hover:border-cyan-300/45"
              >
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {action.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-cyan-100/70">
                  {action.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-cyan-300/20 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.42)] lg:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Assistant
            </h3>
            <Bot size={18} className="text-slate-400 dark:text-cyan-100/70" />
          </div>

          <div className="glass-panel glass-scan rounded-2xl border border-cyan-300/20 p-4">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 p-2.5 text-indigo-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Mission Control
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-cyan-100/65">
                    Operational copilot
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void askCopilot(aiQuery);
                  }
                }}
                placeholder="Ask: inactive users, unresolved alerts, permissions..."
                className="w-full rounded-xl border border-slate-200 dark:border-cyan-300/25 bg-slate-50 dark:bg-slate-900/45 py-2.5 px-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-cyan-100/50 outline-none focus:ring-2 focus:ring-cyan-400/35"
              />
              <button
                type="button"
                onClick={() => void askCopilot(aiQuery)}
                disabled={aiLoading || !aiQuery.trim()}
                className="glass-neon inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 px-3 text-white disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setAiQuery(prompt);
                    void askCopilot(prompt);
                  }}
                  className="rounded-full border border-slate-200 dark:border-cyan-300/20 bg-slate-50 dark:bg-slate-900/35 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-cyan-100/75 hover:border-slate-400 dark:hover:border-cyan-300 hover:text-slate-800 dark:hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-900/35 p-4 min-h-[110px] border border-slate-200 dark:border-cyan-300/10">
              {aiLoading && (
                <p className="text-sm text-slate-500 dark:text-cyan-100/75">
                  Analyzing your request...
                </p>
              )}
              {!aiLoading && aiError && (
                <p className="text-sm text-rose-600">{aiError}</p>
              )}
              {!aiLoading && !aiError && !aiResult && (
                <p className="text-sm text-slate-500 dark:text-cyan-100/75">
                  Run a quick prompt to get an AI operations briefing.
                </p>
              )}
              {!aiLoading && aiResult && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {aiResult.answer}
                  </p>
                  {Array.isArray(aiResult.suggestions) &&
                    aiResult.suggestions.length > 0 && (
                      <ul className="space-y-1">
                        {aiResult.suggestions.slice(0, 3).map((item, idx) => (
                          <li
                            key={`${item}-${idx}`}
                            className="text-xs text-slate-500 dark:text-cyan-100/70"
                          >
                            - {item}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            {quickActions.slice(2).map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="glass-panel rounded-2xl border border-cyan-300/20 p-4 transition hover:border-cyan-300/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {action.label}
                  </p>
                  <ArrowRight
                    size={14}
                    className="text-slate-400 dark:text-cyan-100/60"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-cyan-100/70">
                  {action.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-panel rounded-[2rem] border border-cyan-300/20 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.42)] lg:p-8">
          <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
            System Health
          </h3>
          <div className="space-y-5">
            <StatusRow
              icon={<Database size={18} />}
              title="PostgreSQL"
              status="Online"
              active
            />
            <StatusRow
              icon={<Server size={18} />}
              title="REST API"
              status="Online"
              active
            />
            <StatusRow
              icon={<Globe size={18} />}
              title="Blockchain"
              status="Syncing"
              active={false}
            />
            <StatusRow
              icon={<Shield size={18} />}
              title="Auth Service"
              status="Online"
              active
            />
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-cyan-300/20 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.42)] lg:p-8 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Live Activity
            </h3>
            {feed.length > 0 && (
              <span className="rounded-full bg-cyan-500/25 px-2.5 py-0.5 text-[10px] font-black text-cyan-100">
                {feed.length}
              </span>
            )}
          </div>

          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-cyan-100/55">
              <Clock size={28} className="mb-2" />
              <p className="text-xs font-bold">Waiting for events...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {feed.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-panel flex gap-3 rounded-xl border border-cyan-300/15 p-3 animate-in slide-in-from-top-2 duration-300"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-xs ${
                      entry.type === "alert"
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-500"
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
                    }`}
                  >
                    {entry.type === "alert" ? "🚨" : "👤"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {entry.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-cyan-100/70 truncate">
                      {entry.desc}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-cyan-100/55 mt-0.5">
                      {entry.time.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
