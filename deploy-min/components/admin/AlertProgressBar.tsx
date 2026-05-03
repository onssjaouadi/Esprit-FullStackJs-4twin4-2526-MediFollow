"use client";

export function AlertProgressBar({
  open,
  critical,
  resolved,
  total,
}: {
  open: number;
  critical: number;
  resolved: number;
  total: number;
}) {
  const openPercent = total > 0 ? (open / total) * 100 : 0;
  const criticalPercent = total > 0 ? (critical / total) * 100 : 0;
  const resolvedPercent = total > 0 ? (resolved / total) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Open Alerts */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Ouvertes
          </span>
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {open}
          </span>
        </div>
        <ProgressBar percentage={openPercent} color="rose" />
      </div>

      {/* Critical Alerts */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Critiques
          </span>
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {critical}
          </span>
        </div>
        <ProgressBar percentage={criticalPercent} color="amber" />
      </div>

      {/* Resolved Alerts */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Résolues
          </span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {resolved}
          </span>
        </div>
        <ProgressBar percentage={resolvedPercent} color="emerald" />
      </div>
    </div>
  );
}

function ProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: "rose" | "amber" | "emerald";
}) {
  const colorMap = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  };

  const widthClass =
    percentage <= 25
      ? "w-1/4"
      : percentage <= 50
        ? "w-1/2"
        : percentage <= 75
          ? "w-3/4"
          : "w-full";

  return (
    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div
        className={`h-full ${colorMap[color]} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
