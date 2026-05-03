"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Lock,
  Heart,
  Save,
  Edit2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [user, setUser] = useState<any>(null);
  const [success, setSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    bloodType: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: true,
    appointmentReminders: true,
    vitalAlerts: true,
    medicalReports: true,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setProfileData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: "", // TODO: Add phone field to user model
        dateOfBirth: currentUser.patient?.dateOfBirth
          ? new Date(currentUser.patient.dateOfBirth)
              .toISOString()
              .slice(0, 10)
          : "",
        address:
          typeof currentUser.patient?.address === "object"
            ? currentUser.patient.address.street || ""
            : currentUser.patient?.address || "",
        bloodType: currentUser.patient?.bloodType || "",
        emergencyContact:
          typeof currentUser.patient?.emergencyContact === "object"
            ? currentUser.patient.emergencyContact.name || ""
            : "",
        emergencyPhone:
          typeof currentUser.patient?.emergencyContact === "object"
            ? currentUser.patient.emergencyContact.phone || ""
            : "",
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings],
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSuccess("");

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Préférences de notification mises à jour");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving notifications:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "privacy", label: "Confidentialité", icon: Lock },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 dark:border-gray-400 border-t-transparent dark:border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez votre profil et vos préférences
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Groupe sanguin
                      </label>
                      <select
                        name="bloodType"
                        value={profileData.bloodType}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      >
                        <option value="">Sélectionner</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact d&apos;urgence
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={profileData.emergencyContact}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone d&apos;urgence
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={profileData.emergencyPhone}
                        onChange={handleProfileChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:border-gray-400 dark:focus:border-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Préférences de notification
                </h2>

                <div className="space-y-6">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {key === "emailAlerts" && "Alertes par email"}
                          {key === "smsAlerts" && "Alertes par SMS"}
                          {key === "appointmentReminders" &&
                            "Rappels de rendez-vous"}
                          {key === "vitalAlerts" && "Alertes signes vitaux"}
                          {key === "medicalReports" && "Rapports médicaux"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Recevoir des notifications pour cette catégorie
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors dark:opacity-90 ${
                          value ? "bg-gray-900" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Sécurité
                </h2>

                <div className="space-y-6">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-900 p-6">
                    <div className="flex items-start gap-4">
                      <Lock className="text-gray-600 mt-1" size={20} />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Modifier le mot de passe
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Changez votre mot de passe régulièrement pour plus de
                          sécurité
                        </p>
                        <button className="rounded-full bg-gray-900 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-900 p-6">
                    <div className="flex items-start gap-4">
                      <Shield className="text-gray-600 mt-1" size={20} />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Authentification à deux facteurs
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Ajoutez une couche de sécurité supplémentaire
                        </p>
                        <button className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          Activer 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Confidentialité
                </h2>

                <div className="space-y-6">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-900 p-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Partage des données médicales
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Contrôlez qui peut accéder à vos informations médicales
                    </p>
                    <button className="rounded-full bg-gray-900 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                      Gérer les autorisations
                    </button>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-900 p-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Télécharger mes données
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Obtenez une copie de toutes vos données médicales
                    </p>
                    <button className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Télécharger
                    </button>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h3 className="text-sm font-medium text-red-900 mb-2">
                      Zone de danger
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      Supprimer définitivement votre compte et toutes vos
                      données
                    </p>
                    <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
