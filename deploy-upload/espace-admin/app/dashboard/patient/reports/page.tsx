"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Download,
  Eye,
  ChevronRight,
  Calendar,
  User,
  Activity,
  Droplet,
  Heart,
  Brain,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      // TODO: Replace with actual API call
      // Mock data for demonstration
      setReports([
        {
          id: "1",
          title: "Analyse sanguine complète",
          category: "Analyses",
          date: new Date("2026-02-20"),
          doctor: "Dr. Marie Dubois",
          description:
            "Bilan sanguin de routine - Tous les résultats sont normaux",
          fileSize: "2.3 MB",
          fileType: "PDF",
          status: "normal",
        },
        {
          id: "2",
          title: "Électrocardiogramme (ECG)",
          category: "Cardiologie",
          date: new Date("2026-02-15"),
          doctor: "Dr. Pierre Laurent",
          description: "ECG au repos - Rythme sinusal normal",
          fileSize: "1.8 MB",
          fileType: "PDF",
          status: "normal",
        },
        {
          id: "3",
          title: "IRM cérébrale",
          category: "Imagerie",
          date: new Date("2026-01-30"),
          doctor: "Dr. Sophie Bernard",
          description: "IRM de contrôle - Aucune anomalie détectée",
          fileSize: "15.7 MB",
          fileType: "PDF",
          status: "normal",
        },
        {
          id: "4",
          title: "Test d'effort cardiaque",
          category: "Cardiologie",
          date: new Date("2026-01-15"),
          doctor: "Dr. Pierre Laurent",
          description:
            "Test d'effort sur tapis roulant - Capacité cardiaque excellente",
          fileSize: "3.1 MB",
          fileType: "PDF",
          status: "normal",
        },
        {
          id: "5",
          title: "Bilan lipidique",
          category: "Analyses",
          date: new Date("2025-12-20"),
          doctor: "Dr. Jean Martin",
          description: "Cholestérol légèrement élevé - Surveillance requise",
          fileSize: "1.2 MB",
          fileType: "PDF",
          status: "attention",
        },
      ]);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Analyses":
        return <Droplet size={20} className="text-blue-600" />;
      case "Cardiologie":
        return <Heart size={20} className="text-red-600" />;
      case "Imagerie":
        return <Brain size={20} className="text-purple-600" />;
      default:
        return <Activity size={20} className="text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Analyses":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Cardiologie":
        return "bg-red-50 text-red-700 border-red-200";
      case "Imagerie":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredReports = reports
    .filter((report) =>
      filterCategory === "all" ? true : report.category === filterCategory
    )
    .filter(
      (report) =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categories = ["Analyses", "Cardiologie", "Imagerie", "Radiologie"];
  const totalReports = reports.length;
  const recentReports = reports.filter(
    (r) => new Date(r.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Search Bar - YouTube Style */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un rapport médical..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
                {totalReports} rapports
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                {recentReports} récents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Rapports médicaux
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez et téléchargez vos résultats d&apos;examens et analyses
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterCategory === "all"
                ? "border-gray-900 bg-gray-100 text-gray-900"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                filterCategory === category
                  ? "border-gray-900 bg-gray-100 text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>

        {/* Reports Grid - YouTube Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-12 text-center">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Aucun rapport trouvé
              </h3>
              <p className="text-gray-600">
                Aucun rapport ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const reportDate = new Date(report.date);

              return (
                <div
                  key={report.id}
                  className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center">
                        <FileText className="text-gray-900" size={24} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                          {report.title}
                        </h3>
                        <span
                          className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(report.category)}`}
                        >
                          {report.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {reportDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {report.doctor}
                        </span>
                        <span>{report.fileSize}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                          <Eye size={14} />
                          Voir
                        </button>
                        <button className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <Download size={14} />
                          Télécharger
                        </button>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={20}
                      className="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
