"use client";

import { useState } from "react";
import { User, Mail, Phone, Camera, Save } from "lucide-react";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    firstName: "Jean",
    lastName: "Martin",
    email: "auditor@medifollow.health",
    phone: "+33 6 12 34 56 78",
    specialty: "Auditeur de Sécurité",
    department: "Audit & Conformité",
    bio: "Responsable de l'audit et de la sécurité des données du système MediFollow.",
  });

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mon Profil
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Gérez vos informations personnelles et vos paramètres
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="size-24 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
            {profileData.firstName[0]}
            {profileData.lastName[0]}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors mb-4">
            <Camera size={18} />
            <span>Changer la photo</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {profileData.firstName} {profileData.lastName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {profileData.specialty}
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    firstName: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    lastName: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-violet-500"
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
              value={profileData.email}
              disabled={true}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Non modifiable
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Phone size={18} />
              Téléphone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  phone: e.target.value,
                })
              }
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Spécialité
              </label>
              <input
                type="text"
                value={profileData.specialty}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    specialty: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Département
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    department: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Biographie
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  bio: e.target.value,
                })
              }
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              >
                <User size={18} />
                <span>Modifier</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                >
                  <Save size={18} />
                  <span>Enregistrer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
