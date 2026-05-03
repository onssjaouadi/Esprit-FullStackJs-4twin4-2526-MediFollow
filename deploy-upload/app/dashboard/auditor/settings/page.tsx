"use client";

import { useState } from "react";
import { Settings, Bell, Lock, Eye, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    securityAlerts: true,
    incidentReports: true,
    twoFactorAuth: true,
    sessionTimeout: "30",
    logLevel: "INFO",
    dataRetention: "12",
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Configurez vos préférences et paramètres de sécurité
        </p>
      </div>

      {/* Notification Section */}
      <div className="mb-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <Bell className="size-6 text-violet-600 dark:text-violet-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Notifications par Email
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recevez les mises à jour par email
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  emailNotifications: e.target.checked,
                })
              }
              className="w-5 h-5 rounded accent-violet-600"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Alertes de Sécurité
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Alertes immédiates des incidents de sécurité
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.securityAlerts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  securityAlerts: e.target.checked,
                })
              }
              className="w-5 h-5 rounded accent-violet-600"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Rapports d'Incidents
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rapports hebdomadaires des incidents
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.incidentReports}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  incidentReports: e.target.checked,
                })
              }
              className="w-5 h-5 rounded accent-violet-600"
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="mb-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <Lock className="size-6 text-violet-600 dark:text-violet-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Sécurité
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Authentification à Deux Facteurs
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Protégez votre compte avec 2FA
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  twoFactorAuth: e.target.checked,
                })
              }
              className="w-5 h-5 rounded accent-violet-600"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Délai d'Expiration de Session (minutes)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="240">4 heures</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Settings Section */}
      <div className="mb-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <Settings className="size-6 text-violet-600 dark:text-violet-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Paramètres Système
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Niveau de Logging
            </label>
            <select
              value={settings.logLevel}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  logLevel: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Niveau de détail des logs générés
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Rétention des Données d'Audit (mois)
            </label>
            <select
              value={settings.dataRetention}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  dataRetention: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              <option value="6">6 mois</option>
              <option value="12">12 mois (1 année)</option>
              <option value="24">24 mois (2 années)</option>
              <option value="36">36 mois (3 années)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Durée de conservation des logs avant suppression
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6">
        <h3 className="font-bold text-red-700 dark:text-red-400 mb-4">
          Zone Dangereuse
        </h3>
        <button className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium">
          Réinitialiser le Mot de Passe
        </button>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors font-medium"
        >
          <Save size={20} />
          <span>Enregistrer les Paramètres</span>
        </button>

        {savedMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
            ✓ Paramètres enregistrés avec succès
          </div>
        )}
      </div>
    </div>
  );
}
