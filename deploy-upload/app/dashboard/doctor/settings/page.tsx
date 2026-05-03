"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Lock,
  Shield,
  Database,
  Moon,
  Globe,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  updateUserProfile,
  changePassword,
  deactivateAccount,
} from "@/lib/actions/settings.actions";

export default function DoctorSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile form states
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form states
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Deactivate account states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "DOCTOR") {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Load user error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateUserProfile(formData);

      if (result.success) {
        setProfileSuccess(result.message || "Profil mis à jour avec succès");
        if (result.user) {
          setUser({
            ...user,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
          });
        }
      } else {
        setProfileError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      setProfileError("Une erreur est survenue");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await changePassword(formData);

      if (result.success) {
        setPasswordSuccess(
          result.message || "Mot de passe modifié avec succès"
        );
        // Reset form
        (e.target as HTMLFormElement).reset();
      } else {
        setPasswordError(result.error || "Erreur lors du changement");
      }
    } catch (error) {
      setPasswordError("Une erreur est survenue");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeactivateAccount() {
    if (!deactivatePassword) {
      setDeactivateError("Veuillez entrer votre mot de passe");
      return;
    }

    setDeactivateError("");
    setDeactivateLoading(true);

    const formData = new FormData();
    formData.append("password", deactivatePassword);

    try {
      const result = await deactivateAccount(formData);

      if (result.success) {
        // Redirect to login
        router.push("/login");
      } else {
        setDeactivateError(result.error || "Erreur lors de la désactivation");
      }
    } catch (error) {
      setDeactivateError("Une erreur est survenue");
    } finally {
      setDeactivateLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 mx-auto size-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-green-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez vos préférences et votre compte
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profil
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Informations personnelles et professionnelles
            </p>
          </div>
        </div>

        {/* Profile Success/Error Messages */}
        {profileSuccess && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-300">
              {profileSuccess}
            </p>
          </div>
        )}

        {profileError && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-300">
              {profileError}
            </p>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                defaultValue={user.firstName}
                required
                title="Prénom"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                defaultValue={user.lastName}
                required
                title="Nom"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                title="Email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phoneNumber"
                defaultValue={user.phoneNumber || ""}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setProfileSuccess("");
                setProfileError("");
                loadUser();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={profileLoading}
              className="px-4 py-2 bg-blue-600 dark:bg-green-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez vos préférences de notification
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Alertes Critiques
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recevoir les notifications pour les alertes critiques
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                title="Alertes Critiques"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Nouvelles Mesures Vitales
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notification quand un patient entre de nouvelles mesures
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                title="Nouvelles Mesures Vitales"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Alertes par Email
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recevoir un résumé quotidien par email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                title="Alertes par Email"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                SMS d&apos;urgence
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recevoir des SMS pour les situations d&apos;urgence
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                title="SMS d'urgence"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sécurité
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez votre mot de passe et la sécurité
            </p>
          </div>
        </div>

        {/* Password Success/Error Messages */}
        {passwordSuccess && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-300">
              {passwordSuccess}
            </p>
          </div>
        )}

        {passwordError && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-300">
              {passwordError}
            </p>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  required
                  title="Mot de passe actuel"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title={showCurrentPassword ? "Masquer" : "Afficher"}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    required
                    title="Nouveau mot de passe"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title={showNewPassword ? "Masquer" : "Afficher"}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    title="Confirmer le mot de passe"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title={showConfirmPassword ? "Masquer" : "Afficher"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Le mot de passe doit contenir au moins 8 caractères, une
              majuscule, une minuscule, un chiffre et un caractère spécial.
            </p>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 bg-red-600 dark:bg-green-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? "Changement..." : "Changer le mot de passe"}
              </button>
            </div>
          </div>
        </form>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Authentification à deux facteurs
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ajoutez une couche de sécurité supplémentaire
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 dark:bg-green-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-green-700 transition-colors text-sm">
              Activer
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Préférences
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personnalisez votre expérience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Langue
            </label>
            <select
              title="Langue"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Moon className="w-4 h-4 inline mr-2" />
              Thème
            </label>
            <select
              title="Thème"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="auto">Automatique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Database className="w-4 h-4 inline mr-2" />
              Format de date
            </label>
            <select
              title="Format de date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
          Zone Dangereuse
        </h2>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Ces actions sont irréversibles. Procédez avec prudence.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeactivateModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-red-300 dark:border-gray-700 text-red-700 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
          >
            Désactiver le compte
          </button>
          <button className="px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition-colors">
            Supprimer le compte
          </button>
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Désactiver le compte
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cette action peut être annulée
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Votre compte sera désactivé et vous serez déconnecté. Vous
                pourrez réactiver votre compte en vous reconnectant plus tard.
              </p>

              {deactivateError && (
                <div className="mb-4 flex items-start space-x-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-300">
                    {deactivateError}
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entrez votre mot de passe pour confirmer
              </label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500"
                placeholder="Mot de passe"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivatePassword("");
                  setDeactivateError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                disabled={deactivateLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={deactivateLoading || !deactivatePassword}
                className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deactivateLoading ? "Désactivation..." : "Désactiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
