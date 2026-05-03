"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 dark:border-cyan-300/20 bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-cyan-200 transition-all hover:scale-105"
      // a11y: 4.1.2 Name, Role, Value – aria-label replaces title for AT
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {/* a11y: 1.1.1 Non-text Content – icons are decorative; label is on the button */}
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
