"use client";

import { useState } from "react";
import { Bell, Lock, Eye, Save, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEmail: true,
    notificationsSMS: false,
    notificationsApp: true,
    securityTwoFactor: true,
    logsRetention: "90",
    backupFrequency: "weekly",
    maintenanceMode: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Paramètres sauvegardés avec succès!");
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Paramètres
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Configurez les préférences du système et les paramètres
          d'administration
        </p>
      </div>

      {/* Notifications */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Notifications Email
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Recevoir les alertes par email
              </p>
            </div>
            <button
              onClick={() => handleToggle("notificationsEmail")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notificationsEmail
                  ? "bg-blue-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notificationsEmail
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Notifications SMS
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Recevoir les alertes par SMS
              </p>
            </div>
            <button
              onClick={() => handleToggle("notificationsSMS")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notificationsSMS
                  ? "bg-blue-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notificationsSMS ? "translate-x-6" : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Notifications In-App
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Recevoir les notifications dans l'application
              </p>
            </div>
            <button
              onClick={() => handleToggle("notificationsApp")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notificationsApp
                  ? "bg-blue-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notificationsApp ? "translate-x-6" : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Sécurité
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Authentification à Deux Facteurs
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Activer 2FA pour tous les comptes
              </p>
            </div>
            <button
              onClick={() => handleToggle("securityTwoFactor")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.securityTwoFactor
                  ? "bg-blue-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.securityTwoFactor ? "translate-x-6" : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
              Rétention des Journaux (jours)
            </label>
            <select
              name="logsRetention"
              aria-label="Rétention des journaux"
              value={settings.logsRetention}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="180">180 jours</option>
              <option value="365">1 an</option>
              <option value="unlimited">Illimité</option>
            </select>
          </div>
        </div>
      </div>

      {/* System */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Système
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">
              Fréquence de Sauvegarde
            </label>
            <select
              name="backupFrequency"
              aria-label="Fréquence de sauvegarde"
              value={settings.backupFrequency}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/50 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-3">
              <AlertCircle
                className="text-yellow-600 dark:text-yellow-400"
                size={20}
              />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Mode Maintenance
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Désactiver l'accès des utilisateurs au système
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("maintenanceMode")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.maintenanceMode
                  ? "bg-yellow-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          <Save size={20} />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-semibold transition-colors">
          Réinitialiser
        </button>
      </div>

      {/* System Info */}
      <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Informations Système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Version
            </p>
            <p className="text-slate-900 dark:text-slate-100">1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dernière Mise à Jour
            </p>
            <p className="text-slate-900 dark:text-slate-100">
              15 janvier 2024
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Uptime</p>
            <p className="text-slate-900 dark:text-slate-100">
              45 jours 12 heures
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Base de Données
            </p>
            <p className="text-slate-900 dark:text-slate-100">MongoDB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
