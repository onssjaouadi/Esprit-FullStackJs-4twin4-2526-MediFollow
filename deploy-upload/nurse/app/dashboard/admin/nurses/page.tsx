"use client";

import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getAllNurses,
  createNurse,
  updateNurse,
  deleteNurse,
} from "@/lib/actions/admin.actions";

export default function AdminNursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [nurses, setNurses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const result = await getAllNurses();
      if (result.success && result.data) {
        setNurses(result.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNurses = useMemo(() => {
    if (!searchQuery.trim()) return nurses;

    const query = searchQuery.toLowerCase();
    return nurses.filter((nurse) => {
      const fullName = `${nurse.firstName} ${nurse.lastName}`.toLowerCase();
      const email = nurse.email.toLowerCase();
      const department = nurse.nurseProfile?.department?.toLowerCase() || "";
      return fullName.includes(query) || email.includes(query) || department.includes(query);
    });
  }, [nurses, searchQuery]);

  async function handleCreateNurse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      department: formData.get("department") as string,
      shift: formData.get("shift") as string,
    };

    const result = await createNurse(data);

    if (result.success) {
      setSuccess("Infirmier créé avec succès!");
      setShowCreateModal(false);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Erreur lors de la création");
    }

    setSubmitting(false);
  }

  async function handleUpdateNurse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedNurse) return;

    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      department: formData.get("department") as string,
      shift: formData.get("shift") as string,
      isActive: formData.get("isActive") === "true",
    };

    const result = await updateNurse(selectedNurse.id, data);

    if (result.success) {
      setSuccess("Infirmier mis à jour avec succès!");
      setShowEditModal(false);
      setSelectedNurse(null);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Erreur lors de la mise à jour");
    }

    setSubmitting(false);
  }

  async function handleDeleteNurse(nurseId: string, nurseName: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${nurseName} ?`)) {
      return;
    }

    const result = await deleteNurse(nurseId);

    if (result.success) {
      setSuccess("Infirmier supprimé avec succès!");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error || "Erreur lors de la suppression");
      setTimeout(() => setError(""), 5000);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des infirmiers
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérer les comptes infirmiers et leurs assignations
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Ajouter un infirmier
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4 text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total infirmiers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nurses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nurses.filter((n) => n.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nurses.filter((n) => !n.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Nurses List */}
        <div className="space-y-4">
          {filteredNurses.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? "Aucun infirmier correspondant"
                  : "Aucun infirmier enregistré"}
              </p>
            </div>
          ) : (
            filteredNurses.map((nurse) => (
              <div
                key={nurse.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {nurse.firstName.charAt(0)}
                      {nurse.lastName.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {nurse.firstName} {nurse.lastName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            nurse.isActive
                              ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {nurse.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {nurse.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {nurse.phoneNumber}
                          </span>
                        </div>

                        {nurse.nurseProfile?.department && (
                          <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {nurse.nurseProfile.department}
                            </span>
                          </div>
                        )}

                        {nurse.nurseProfile?.shift && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Équipe: {nurse.nurseProfile.shift}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Créé le:{" "}
                        {new Date(nurse.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedNurse(nurse);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteNurse(
                          nurse.id,
                          `${nurse.firstName} ${nurse.lastName}`
                        )
                      }
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ajouter un infirmier
            </h2>

            <form onSubmit={handleCreateNurse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Département
                </label>
                <input
                  type="text"
                  name="department"
                  placeholder="Ex: Cardiologie"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Équipe
                </label>
                <select
                  name="shift"
                  defaultValue="morning"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="morning">Matin</option>
                  <option value="afternoon">Après-midi</option>
                  <option value="night">Nuit</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNurse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Modifier l'infirmier
            </h2>

            <form onSubmit={handleUpdateNurse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    defaultValue={selectedNurse.firstName}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    defaultValue={selectedNurse.lastName}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  defaultValue={selectedNurse.phoneNumber}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Département
                </label>
                <input
                  type="text"
                  name="department"
                  defaultValue={selectedNurse.nurseProfile?.department}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Équipe
                </label>
                <select
                  name="shift"
                  defaultValue={selectedNurse.nurseProfile?.shift || "morning"}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="morning">Matin</option>
                  <option value="afternoon">Après-midi</option>
                  <option value="night">Nuit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  name="isActive"
                  defaultValue={selectedNurse.isActive ? "true" : "false"}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedNurse(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Mise à jour..." : "Mettre à jour"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
