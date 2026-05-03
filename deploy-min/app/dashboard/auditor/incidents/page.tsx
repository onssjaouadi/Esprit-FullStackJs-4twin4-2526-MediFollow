"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Loader,
} from "lucide-react";
import { getAuditIncidents } from "@/lib/actions/auditor.actions";

interface Incident {
  id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "open" | "investigating" | "resolved";
  timestamp: string;
  description: string;
  affectedUser?: string;
}

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncidents() {
      try {
        setLoading(true);
        const result = await getAuditIncidents({
          search: searchQuery || undefined,
        });

        if (result.success) {
          setIncidents(result.incidents || []);
          setError(null);
        } else {
          setError(result.error || "Erreur lors du chargement");
          setIncidents([]);
        }
      } catch (err) {
        setError("Erreur lors du chargement des incidents");
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, [searchQuery]);

  const severityColors = {
    LOW: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    MEDIUM:
      "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30",
    HIGH: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
    CRITICAL:
      "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
  };

  const statusColors = {
    open: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    investigating:
      "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    resolved:
      "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Incidents de Sécurité
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Suivez et gérez les incidents de sécurité du système
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
            placeholder="Rechercher les incidents..."
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

      {/* Incidents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-violet-600 dark:text-violet-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Chargement des incidents...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun incident trouvé
            </p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className={`rounded-xl border p-6 hover:shadow-md transition-shadow ${
                severityColors[incident.severity]
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="rounded-lg bg-white/50 p-3 flex-shrink-0">
                    {incident.severity === "CRITICAL" ||
                    incident.severity === "HIGH" ? (
                      <AlertTriangle className="size-6" />
                    ) : (
                      <AlertCircle className="size-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {incident.title}
                    </h3>
                    <p className="text-sm opacity-80 mt-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm opacity-75">
                        <Clock size={16} />
                        {incident.timestamp}
                      </div>
                      {incident.affectedUser && (
                        <div className="text-sm opacity-75">
                          Utilisateur:{" "}
                          <span className="font-mono">
                            {incident.affectedUser}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full text-center ${
                      statusColors[incident.status]
                    }`}
                  >
                    {incident.status === "open"
                      ? "Ouvert"
                      : incident.status === "investigating"
                        ? "En investigation"
                        : "Résolu"}
                  </span>
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
