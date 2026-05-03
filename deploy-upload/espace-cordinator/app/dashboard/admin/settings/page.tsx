"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/app/SettingsContext";
import { Save, Loader2, Sun, Moon, Globe, Palette, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);

  const t: any = {
    fr: { title: "Paramètres", save: "Sauvegarder", theme: "Mode Sombre", lang: "Langue", sub: "Configuration" },
    en: { title: "Settings", save: "Save Changes", theme: "Dark Mode", lang: "Language", sub: "System Config" },
    es: { title: "Ajustes", save: "Guardar", theme: "Modo Oscuro", lang: "Idioma", sub: "Configuración" }
  };
  const curr = t[language];

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000)); // Fake save delay
    setSaving(false);
    
    // REDIRECT TO HOME/ACCUEIL
    router.push("/dashboard/admin"); 
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">{curr.title}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{curr.sub}</p>
        </div>
        <button onClick={handleSave} className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
          {curr.save}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Toggle */}
        <div className="glass-panel p-6 rounded-[24px] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Palette className="text-pink-500" />
            <span className="font-bold">{curr.theme}</span>
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {theme === "dark" ? <Sun className="text-amber-400" /> : <Moon />}
          </button>
        </div>

        {/* Language Selector */}
        <div className="glass-panel p-6 rounded-[24px] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="text-blue-500" />
            <span className="font-bold">{curr.lang}</span>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="dark:bg-slate-800 dark:text-white p-2 rounded-lg outline-none">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </div>
  );
}