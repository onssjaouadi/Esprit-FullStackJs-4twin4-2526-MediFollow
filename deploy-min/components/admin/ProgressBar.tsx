"use client";

interface ProgressBarProps {
  percentage: number;
  label: string;
  value: string;
  colorClass: string;
}

export function ProgressBar({
  percentage,
  label,
  value,
  colorClass,
}: ProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-cyan-100/70">
        <span>{label}</span>
        <span className={colorClass}>{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900/45">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass
            .split(" ")
            .filter((c) => c.startsWith("bg-"))
            .join(" ")
            .replace(/^bg-/, "bg-")
            .split("-")
            .slice(0, -1)
            .join("-")}`}
          style={
            {
              "--width": `${percentage}%`,
              width: `${percentage}%`,
            } as React.CSSProperties & { "--width": string }
          }
        />
      </div>
    </div>
  );
}
