"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Activity,
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  AlertCircle,
  TrendingUp,
  Heart,
  Droplet,
  Thermometer,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
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
      setHistoryItems([
        {
          id: "1",
          type: "vital",
          title: "Mesure des signes vitaux",
          description: "TA: 120/80, FC: 72 bpm, Temp: 36.8°C",
          date: new Date("2026-03-01T14:30:00"),
          status: "normal",
        },
        {
          id: "2",
          type: "appointment",
          title: "Consultation cardiologie",
          description: "Dr. Marie Dubois - Consultation de suivi",
          date: new Date("2026-02-28T10:00:00"),
          status: "completed",
        },
        {
          id: "3",
          type: "report",
          title: "Analyse sanguine",
          description: "Bilan sanguin complet - Résultats normaux",
          date: new Date("2026-02-25T09:15:00"),
          status: "normal",
        },
        {
          id: "4",
          type: "alert",
          title: "Alerte tension artérielle",
          description: "Tension élevée détectée: 145/95 mmHg",
          date: new Date("2026-02-20T16:45:00"),
          status: "warning",
        },
        {
          id: "5",
          type: "vital",
          title: "Mesure des signes vitaux",
          description: "TA: 118/78, FC: 68 bpm, Temp: 36.7°C",
          date: new Date("2026-02-18T08:00:00"),
          status: "normal",
        },
        {
          id: "6",
          type: "medication",
          title: "Prescription médicale",
          description: "Lisinopril 10mg - 1 fois par jour",
          date: new Date("2026-02-15T11:30:00"),
          status: "active",
        },
        {
          id: "7",
          type: "appointment",
          title: "Consultation générale",
          description: "Dr. Jean Martin - Bilan de santé annuel",
          date: new Date("2026-02-10T14:00:00"),
          status: "completed",
        },
        {
          id: "8",
          type: "report",
          title: "Électrocardiogramme (ECG)",
          description: "ECG au repos - Rythme sinusal normal",
          date: new Date("2026-02-05T10:30:00"),
          status: "normal",
        },
        {
          id: "9",
          type: "vital",
          title: "Mesure des signes vitaux",
          description: "TA: 115/75, FC: 70 bpm, Temp: 36.9°C",
          date: new Date("2026-01-28T07:45:00"),
          status: "normal",
        },
        {
          id: "10",
          type: "appointment",
          title: "Téléconsultation",
          description: "Dr. Sophie Bernard - Suivi dermatologique",
          date: new Date("2026-01-20T16:00:00"),
          status: "completed",
        },
      ]);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "vital":
        return {
          icon: Activity,
          label: "Signes vitaux",
          color: "text-blue-600 bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "appointment":
        return {
          icon: Calendar,
          label: "Rendez-vous",
          color: "text-purple-600 bg-purple-50",
          borderColor: "border-purple-200",
        };
      case "report":
        return {
          icon: FileText,
          label: "Rapport",
          color: "text-green-600 bg-green-50",
          borderColor: "border-green-200",
        };
      case "alert":
        return {
          icon: AlertCircle,
          label: "Alerte",
          color: "text-red-600 bg-red-50",
          borderColor: "border-red-200",
        };
      case "medication":
        return {
          icon: Pill,
          label: "Médicament",
          color: "text-orange-600 bg-orange-50",
          borderColor: "border-orange-200",
        };
      default:
        return {
          icon: Clock,
          label: "Événement",
          color: "text-gray-600 bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const filteredHistory = historyItems
    .filter((item) => (filterType === "all" ? true : item.type === filterType))
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const typeFilters = [
    { id: "all", label: "Tout", icon: Clock },
    { id: "vital", label: "Signes vitaux", icon: Activity },
    { id: "appointment", label: "Rendez-vous", icon: Calendar },
    { id: "report", label: "Rapports", icon: FileText },
    { id: "alert", label: "Alertes", icon: AlertCircle },
    { id: "medication", label: "Médicaments", icon: Pill },
  ];

  const totalItems = historyItems.length;
  const recentItems = historyItems.filter(
    (item) =>
      new Date(item.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
                placeholder="Rechercher dans l'historique médical..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
                {totalItems} événements
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                {recentItems} cette semaine
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
            Historique médical
          </h1>
          <p className="mt-2 text-gray-600">
            Chronologie complète de votre parcours de santé
          </p>
        </div>

        {/* Type Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  filterType === filter.id
                    ? "border-gray-900 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Timeline - YouTube Style */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {filteredHistory.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <Clock className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun événement trouvé
                </h3>
                <p className="text-gray-600">
                  Aucun événement ne correspond à vos critères
                </p>
              </div>
            ) : (
              filteredHistory.map((item, index) => {
                const typeConfig = getTypeConfig(item.type);
                const Icon = typeConfig.icon;
                const itemDate = new Date(item.date);

                return (
                  <div key={item.id} className="relative pl-14">
                    {/* Timeline Icon */}
                    <div
                      className={`absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${typeConfig.color} ${typeConfig.borderColor}`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Content Card */}
                    <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${typeConfig.color} ${typeConfig.borderColor}`}
                        >
                          {typeConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {itemDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span>
                          {itemDate.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
