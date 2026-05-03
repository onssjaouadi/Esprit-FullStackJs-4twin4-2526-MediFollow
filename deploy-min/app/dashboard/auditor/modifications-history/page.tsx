"use client";

import { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
} from "lucide-react";
import { getAuditModifications } from "@/lib/actions/auditor.actions";

interface Modification {
  id: string;
  timestamp: string;
  user: string;
  entity: string;
  entityName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValue?: string;
  newValue?: string;
  field: string;
}

export default function ModificationsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModifications() {
      try {
        setLoading(true);
        const result = await getAuditModifications({
          search: searchQuery || undefined,
        });

        if (result.success) {
          setModifications(result.modifications || []);
          setError(null);
        } else {
          setError(result.error || "Erreur lors du chargement");
          setModifications([]);
        }
      } catch (err) {
        setError("Erreur lors du chargement des modifications");
        setModifications([]);
      } finally {
        setLoading(false);
      }
    }

    fetchModifications();
  }, [searchQuery]);

  const actionColors = {
    CREATE:
      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10",
    UPDATE: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
    DELETE: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Historique des Modifications
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Suivez toutes les modifications apportées aux données du système
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
            placeholder="Rechercher par utilisateur, entité..."
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

      {/* Timeline View */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-violet-600 dark:text-violet-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Chargement des modifications...</span>
          </div>
        ) : modifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <History className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune modification trouvée
            </p>
          </div>
        ) : (
          modifications.map((mod) => (
            <div
              key={mod.id}
              className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      mod.action === "CREATE"
                        ? "bg-green-100 dark:bg-green-500/20"
                        : mod.action === "UPDATE"
                          ? "bg-blue-100 dark:bg-blue-500/20"
                          : "bg-red-100 dark:bg-red-500/20"
                    }`}
                  >
                    {mod.action === "CREATE" || mod.action === "UPDATE" ? (
                      <CheckCircle2
                        className={`w-6 h-6 ${
                          mod.action === "CREATE"
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {mod.entity} - {mod.entityName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Par <span className="font-semibold">{mod.user}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} />
                      {mod.timestamp}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        actionColors[mod.action]
                      }`}
                    >
                      {mod.action}
                    </span>
                    {mod.field && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Champ:{" "}
                        <span className="font-mono font-semibold">
                          {mod.field}
                        </span>
                      </span>
                    )}
                  </div>
                  {mod.oldValue && mod.newValue && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Ancienne valeur
                          </p>
                          <code className="text-gray-700 dark:text-gray-300 font-mono">
                            {mod.oldValue}
                          </code>
                        </div>
                        <div className="border-l border-gray-200 dark:border-gray-700"></div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Nouvelle valeur
                          </p>
                          <code className="text-gray-700 dark:text-gray-300 font-mono">
                            {mod.newValue}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
