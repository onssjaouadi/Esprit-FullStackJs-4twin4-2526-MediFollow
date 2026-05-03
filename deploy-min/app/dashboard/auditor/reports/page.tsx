"use client";

import { useState } from "react";
import { FileText, Download, Filter, Calendar, BarChart3 } from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: string;
  period: string;
  generatedAt: string;
  size: string;
  status: "ready" | "generating" | "scheduled";
}

export default function ReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: "1",
      name: "Rapport Mensuel - Janvier 2024",
      type: "Monthly Audit Report",
      period: "01/01/2024 - 31/01/2024",
      generatedAt: "2024-01-31",
      size: "2.5 MB",
      status: "ready",
    },
    {
      id: "2",
      name: "Rapport Sécurité - Q1 2024",
      type: "Security Report",
      period: "01/01/2024 - 31/03/2024",
      generatedAt: "2024-01-15",
      size: "3.8 MB",
      status: "ready",
    },
    {
      id: "3",
      name: "Rapport Utilisateurs Actifs",
      type: "User Activity Report",
      period: "01/01/2024 - 15/01/2024",
      generatedAt: "2024-01-15",
      size: "1.2 MB",
      status: "ready",
    },
    {
      id: "4",
      name: "Rapport Modifications Système",
      type: "System Changes Report",
      period: "01/01/2024 - 15/01/2024",
      generatedAt: "2024-01-15",
      size: "890 KB",
      status: "ready",
    },
    {
      id: "5",
      name: "Rapport de Conformité RGPD",
      type: "Compliance Report",
      period: "To be defined",
      generatedAt: "-",
      size: "-",
      status: "scheduled",
    },
  ]);

  const statusColors = {
    ready:
      "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
    generating:
      "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    scheduled:
      "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Rapports d'Audit
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Générez et téléchargez des rapports détaillés sur l'audit système
        </p>
      </div>

      {/* Generate Report Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-violet-100 dark:bg-violet-500/20 p-3">
              <BarChart3 className="size-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Générer un Nouveau Rapport
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Créez un rapport personnalisé en fonction de vos besoins d'audit
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex-shrink-0">
            Créer Rapport
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="rounded-lg bg-violet-100 dark:bg-violet-500/20 p-3 flex-shrink-0">
                  <FileText className="size-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {report.type}
                  </p>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={16} />
                      {report.period}
                    </div>
                    {report.size !== "-" && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {report.size}
                      </div>
                    )}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        statusColors[report.status]
                      }`}
                    >
                      {report.status === "ready"
                        ? "Prêt"
                        : report.status === "generating"
                          ? "Génération..."
                          : "Planifié"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {report.status === "ready" && (
                  <button className="px-4 py-2 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors flex items-center gap-2">
                    <Download size={18} />
                    <span className="hidden sm:inline">Télécharger</span>
                  </button>
                )}
                <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Voir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
