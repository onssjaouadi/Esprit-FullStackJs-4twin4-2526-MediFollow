"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Lock,
  Activity,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function NurseProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    licenseNumber: "",
    specialization: "",
    bio: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        setFormData({
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          email: currentUser.email || "",
          phone: currentUser.phoneNumber || "",
          location: "Paris, France",
          licenseNumber: "INF-2024-001",
          specialization: "Cardiologie",
          bio: "Infirmière expérimentée en suivi post-hospitalisation",
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = () => {
    setEditMode(false);
    // TODO: Make API call to save profile
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="size-8 text-pink-600 dark:text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mon profil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez vos informations professionnelles
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-pink-500 to-rose-500"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 mb-6">
            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>

            <div className="flex-1 pt-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-pink-600 dark:text-pink-400 font-semibold">
                    Infirmière
                  </p>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {editMode ? "Annuler" : "Modifier"}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Membre depuis le {new Date().toLocaleDateString("fr")}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Informations de contact
              </h3>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Mail
                  size={20}
                  className="text-pink-600 dark:text-pink-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  {editMode ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Phone
                  size={20}
                  className="text-pink-600 dark:text-pink-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Téléphone
                  </p>
                  {editMode ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <MapPin
                  size={20}
                  className="text-pink-600 dark:text-pink-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Localisation
                  </p>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏥 Informations professionnelles
              </h3>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Award
                  size={20}
                  className="text-pink-600 dark:text-pink-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Numéro de licence
                  </p>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.licenseNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Award
                  size={20}
                  className="text-pink-600 dark:text-pink-400 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Spécialisation
                  </p>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm outline-none"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <User
                  size={20}
                  className="text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Bio
                  </p>
                  {editMode ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm outline-none resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formData.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {editMode && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium transition-colors"
              >
                Enregistrer les modifications
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock size={20} />
          Sécurité
        </h3>
        <button className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors">
          Modifier le mot de passe
        </button>
      </div>
    </div>
  );
}
