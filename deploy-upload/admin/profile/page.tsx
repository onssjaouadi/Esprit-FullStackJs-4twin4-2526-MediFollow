"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Shield,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  profilePhoto: string | null;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "La photo ne doit pas dépasser 2 Mo." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhoto: base64 }),
        });
        const data = await res.json();
        if (data.success) {
          setProfile((prev) => prev ? { ...prev, profilePhoto: base64 } : prev);
          setMessage({ type: "success", text: "Photo mise à jour avec succès." });
        } else {
          setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour." });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'upload." });
      setUploading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Mot de passe modifié avec succès." });
        setShowPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du changement de mot de passe." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "SUPPRIMER") return;
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/profile", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/login");
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la suppression." });
        setShowDeleteModal(false);
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-slate-500 dark:text-slate-400">Impossible de charger le profil.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gérez vos informations personnelles et votre mot de passe.
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <Shield size={16} />}
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/20 p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-slate-200 dark:border-cyan-300/30 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt="Photo de profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {profile.role}
            </span>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail size={15} />
                <span>{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={15} />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <User size={15} />
                <span>
                  Membre depuis{" "}
                  {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-cyan-300/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Lock size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold">Mot de passe</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modifiez votre mot de passe de connexion.
              </p>
            </div>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => { setShowPasswordForm(true); setMessage(null); }}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Modifier
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            {/* Current password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-400/35 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-400/35 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/35 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {changingPassword && <Loader2 size={15} className="animate-spin" />}
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage(null);
                }}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete Account Section */}
      <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-900/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-400">Supprimer le compte</h3>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">
                Cette action est irréversible. Toutes vos données seront supprimées.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setMessage(null); }}
            className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-red-500/30 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Confirmer la suppression</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Cette action supprimera définitivement votre compte et toutes les données associées.
              Tapez <strong className="text-red-600 dark:text-red-400">SUPPRIMER</strong> pour confirmer.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-400/35 dark:border-slate-700 dark:bg-slate-800 dark:text-white mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "SUPPRIMER" || deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 size={15} className="animate-spin" />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
