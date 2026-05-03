"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, Download, Eye, Loader } from "lucide-react";
import { getAuditPatients } from "@/lib/actions/auditor.actions";

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  primaryDoctor: string;
  status: "active" | "inactive" | "archived";
  recordCount: number;
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        const result = await getAuditPatients({
          search: searchQuery || undefined,
        });

        if (result.success) {
          setPatients((result.patients || []) as Patient[]);
          setError(null);
        } else {
          setError(result.error || "Erreur lors du chargement des patients");
          setPatients([]);
        }
      } catch (err) {
        setError("Erreur lors du chargement des patients");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, [searchQuery]);

  if (error) {
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
    archived: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Patients (Lecture Seule)
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Consultez la liste des patients en mode lecture seule
        </p>
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
            placeholder="Rechercher par nom ou médecin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter size={20} />
          <span>Filtres</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">
          <Download size={20} />
          <span>Exporter</span>
        </button>
      </div>

      {/* Patients Table */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-violet-600 dark:text-violet-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              Chargement des patients...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Âge
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Médecin Prescripteur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Dossiers
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Dernière Visite
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-lg">
                            👤
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {patient.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {patient.age} ans
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {patient.primaryDoctor}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[patient.status]
                          }`}
                        >
                          {patient.status === "active"
                            ? "Actif"
                            : patient.status === "inactive"
                              ? "Inactif"
                              : "Archivé"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users size={16} />
                          {patient.recordCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {patient.lastVisit}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors">
                          <Eye size={16} />
                          <span className="hidden sm:inline">Voir</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Aucun patient trouvé
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note de sécurité:</strong> Cet espace est en mode lecture
          seule. Vous pouvez consulter les informations des patients, mais les
          modifications ne sont pas autorisées.
        </p>
      </div>
    </div>
  );
}
