"use client";

import { useState } from "react";
import { User, Mail, Shield, Save, X } from "lucide-react";
import Link from "next/link";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [userData, setUserData] = useState({
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@medifollow.health",
    role: "DOCTOR",
    status: "active",
    specialty: "Cardiologie",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Modifier l'Utilisateur
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Modifiez les informations et permissions de l'utilisateur
          </p>
        </div>
        <Link
          href="/dashboard/auditor/users"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="size-6" />
        </Link>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    lastName: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Non modifiable
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Shield size={18} />
              Rôle
            </label>
            <select
              value={userData.role}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  role: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              <option value="PATIENT">👤 Patient</option>
              <option value="DOCTOR">👨‍⚕️ Docteur</option>
              <option value="ADMIN">⚙️ Admin</option>
              <option value="AUDITOR">🔍 Auditeur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={userData.status}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  status: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Spécialité
            </label>
            <input
              type="text"
              value={userData.specialty}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  specialty: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              <Save size={18} />
              <span>Enregistrer</span>
            </button>
            <Link
              href="/dashboard/auditor/users"
              className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </Link>
            {saved && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                ✓ Utilisateur mis à jour
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
