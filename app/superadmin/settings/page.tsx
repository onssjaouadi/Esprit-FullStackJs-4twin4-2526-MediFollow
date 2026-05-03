"use client";

import { useLanguage } from "@/app/SettingsContext";
import { Globe, Settings } from "lucide-react";

export default function SystemSettingsPage() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Settings className="text-violet-500" />
          System Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          SuperAdmin global system configurations and preferences.
        </p>
      </div>

      <div className="glass-panel rounded-xl border border-violet-500/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="text-violet-500" size={24} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Regional Preferences
          </h2>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
            Interface Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-700 rounded-xl mt-8">
        <div className="text-4xl mb-4">⚙️</div>
        <h2 className="text-xl font-bold text-white">More Settings Coming Soon</h2>
        <p className="mt-2 text-slate-400 max-w-md mx-auto">Additional system configuration options are currently under development.</p>
      </div>
    </div>
  );
}
