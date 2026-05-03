"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Loader,
  X,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import {
  getAuditUsers,
  createAuditUser,
  updateAuditUser,
  deleteAuditUser,
  resetAuditUserPassword,
} from "@/lib/actions/auditor.actions";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
}

type ModalMode = null | "create" | "edit";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "PATIENT",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAuditUsers({
        search: searchQuery || undefined,
      });

      console.log("getAuditUsers result:", result);

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from server");
      }

      if (result.success && result.users) {
        setUsers(result.users as User[]);
        setError(null);
      } else if (!result.success) {
        setError(result.error || "Erreur lors du chargement des utilisateurs");
        setUsers([]);
      } else {
        throw new Error("No users data received");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des utilisateurs";
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const openCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "PATIENT",
      isActive: true,
    });
    setSelectedUser(null);
    setModalMode("create");
  };

  const openEditModal = (user: User) => {
    const [firstName, lastName] = user.name.split(" ");
    setFormData({
      firstName: firstName || "",
      lastName: lastName || "",
      email: user.email,
      role: user.role,
      isActive: user.status === "active",
    });
    setSelectedUser(user);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (modalMode === "create") {
        const result = await createAuditUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
        });

        if (result.success) {
          // Show password modal if password was generated
          if (result.temporaryPassword) {
            setTemporaryPassword(result.temporaryPassword);
            setShowPasswordModal(true);
          }
          setSuccess(result.message || "Utilisateur créé avec succès");
          closeModal();
          await fetchUsers();
          setTimeout(() => setSuccess(null), 5000);
        } else {
          setError(result.error || "Erreur lors de la création");
        }
      } else if (modalMode === "edit" && selectedUser) {
        const result = await updateAuditUser(selectedUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });

        if (result.success) {
          setSuccess("Utilisateur mis à jour avec succès");
          closeModal();
          await fetchUsers();
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(result.error || "Erreur lors de la mise à jour");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    try {
      setSubmitting(true);
      const result = await deleteAuditUser(userId);

      if (result.success) {
        setSuccess("Utilisateur supprimé avec succès");
        await fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Réinitialiser le mot de passe de ${userName} ? Un email sera envoyé avec le nouveau mot de passe.`
      )
    )
      return;

    try {
      setSubmitting(true);
      const result = await resetAuditUserPassword(userId);

      if (result.success) {
        setTemporaryPassword(result.temporaryPassword || "");
        setShowPasswordModal(true);
        setSuccess(result.message || "Mot de passe réinitialisé avec succès");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.error || "Erreur lors de la réinitialisation");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && users.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    active:
      "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
    inactive: "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400",
    suspended: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
  };

  const roleIcons: Record<string, string> = {
    DOCTOR: "👨‍⚕️",
    PATIENT: "👤",
    ADMIN: "⚙️",
    AUDITOR: "🔍",
    COORDINATOR: "📋",
  };

  const roles = ["PATIENT", "DOCTOR", "ADMIN", "AUDITOR", "COORDINATOR"];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Notifications */}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-4 flex items-center gap-2">
          <CheckCircle
            size={20}
            className="text-green-600 dark:text-green-400"
          />
          <p className="text-sm text-green-700 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Utilisateurs
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Gérez les utilisateurs et leurs accès du système
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
        >
          <Plus size={20} />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter size={20} />
          <span>Filtres</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-violet-600 dark:text-violet-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              Chargement des utilisateurs...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Dernière Connexion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-lg">
                            {roleIcons[user.role] || "👤"}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {user.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail size={16} />
                          {user.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 rounded-full font-mono text-xs font-semibold">
                          <Shield size={12} />
                          {user.role || "PATIENT"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[user.status] || statusColors.inactive
                          }`}
                        >
                          {user.status === "active"
                            ? "✓ Actif"
                            : user.status === "inactive"
                              ? "○ Inactif"
                              : "Suspendu"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-xs">
                          {user.lastLogin && user.lastLogin !== "Jamais"
                            ? new Date(user.lastLogin).toLocaleString("fr-FR")
                            : "Jamais"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors"
                          title="Éditer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleResetPassword(user.id, user.name)
                          }
                          disabled={submitting}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                          title="Réinitialiser le mot de passe"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Aucun utilisateur trouvé
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === "create"
                  ? "Ajouter un utilisateur"
                  : "Éditer l'utilisateur"}
              </h2>
              <button
                onClick={closeModal}
                title="Fermer la fenêtre"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  title="Prénom de l'utilisateur"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  title="Nom de l'utilisateur"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  title="Adresse email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Rôle
                </label>
                <select
                  id="role"
                  title="Rôle de l'utilisateur"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {modalMode === "edit" && (
                <div>
                  <label htmlFor="isActive" className="flex items-center gap-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      title="Activer le compte"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Compte actif
                    </span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  title="Annuler l'opération"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  title={
                    modalMode === "create"
                      ? "Créer l'utilisateur"
                      : "Mettre à jour l'utilisateur"
                  }
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50"
                >
                  {submitting ? "Envoi..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && temporaryPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                🔐 Mot de passe temporaire
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                  <strong>⚠️ Important :</strong> Partagez ce mot de passe avec
                  l'utilisateur. Il doit le changer lors de sa première
                  connexion.
                </p>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-500/30 font-mono text-center text-lg font-bold text-violet-600 dark:text-violet-400 break-all relative group">
                  {temporaryPassword}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(temporaryPassword);
                      alert("Mot de passe copié!");
                    }}
                    title="Copier le mot de passe"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  ✅ <strong>Email d'invitation envoyé</strong> à l'utilisateur
                  avec :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Identifiants de connexion</li>
                  <li>Lien de connexion</li>
                  <li>Instructions de sécurité</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setTemporaryPassword(null);
                }}
                title="Fermer le modal"
                className="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors font-medium"
              >
                OK, J'ai noté le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
