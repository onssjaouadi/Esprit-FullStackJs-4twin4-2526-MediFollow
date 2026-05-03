"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Plus,
  Clock,
  User,
  MapPin,
  Phone,
  ChevronRight,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { formatDateTime } from "@/lib/utils";

export default function AppointmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
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
      setAppointments([
        {
          id: "1",
          date: new Date("2026-03-05T10:00:00"),
          doctor: "Dr. Marie Dubois",
          specialty: "Cardiologue",
          type: "Consultation",
          status: "scheduled",
          location: "Cabinet médical - 15 Rue de la Santé, Paris",
          phone: "01 23 45 67 89",
          notes: "Consultation de suivi",
        },
        {
          id: "2",
          date: new Date("2026-03-10T14:30:00"),
          doctor: "Dr. Jean Martin",
          specialty: "Généraliste",
          type: "Téléconsultation",
          status: "scheduled",
          location: "En ligne",
          phone: "01 23 45 67 90",
          notes: "Renouvellement ordonnance",
        },
        {
          id: "3",
          date: new Date("2026-02-20T09:00:00"),
          doctor: "Dr. Sophie Bernard",
          specialty: "Dermatologue",
          type: "Consultation",
          status: "completed",
          location: "Cabinet médical - 8 Avenue Victor Hugo, Lyon",
          phone: "04 56 78 90 12",
          notes: "Consultation dermatologique",
        },
        {
          id: "4",
          date: new Date("2026-02-15T16:00:00"),
          doctor: "Dr. Pierre Laurent",
          specialty: "Cardiologue",
          type: "Consultation",
          status: "cancelled",
          location: "Hôpital Central - Paris",
          phone: "01 98 76 54 32",
          notes: "Annulé par le patient",
        },
      ]);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          label: "Programmé",
          icon: Clock,
          color: "text-blue-600 bg-blue-50",
          badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "completed":
        return {
          label: "Terminé",
          icon: CheckCircle,
          color: "text-green-600 bg-green-50",
          badgeColor: "bg-green-100 text-green-700 border-green-200",
        };
      case "cancelled":
        return {
          label: "Annulé",
          icon: XCircle,
          color: "text-red-600 bg-red-50",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
        };
      default:
        return {
          label: "En attente",
          icon: AlertCircle,
          color: "text-yellow-600 bg-yellow-50",
          badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
        };
    }
  };

  const filteredAppointments = appointments
    .filter((apt) =>
      filterStatus === "all" ? true : apt.status === filterStatus
    )
    .filter(
      (apt) =>
        apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const upcomingCount = appointments.filter(
    (apt) => apt.status === "scheduled"
  ).length;
  const completedCount = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;

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
      {/* Sticky Search Bar - YouTube Style */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un médecin, une spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-400 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                {upcomingCount} à venir
              </span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                {completedCount} terminés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes rendez-vous</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez vos consultations et prenez rendez-vous
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => {
              /* TODO: Open booking modal */
            }}
            className="flex items-center gap-2 rounded-full bg-gray-900 dark:bg-gray-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Nouveau rendez-vous
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === "all"
                ? "border-gray-900 dark:border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus("scheduled")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === "scheduled"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Clock size={16} />
            Programmés
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === "completed"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <CheckCircle size={16} />
            Terminés
          </button>
          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === "cancelled"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <XCircle size={16} />
            Annulés
          </button>
        </div>

        {/* Appointments List - YouTube Style */}
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Aucun rendez-vous
              </h3>
              <p className="text-gray-600 mb-4">
                Aucun rendez-vous ne correspond à vos critères
              </p>
              <button
                onClick={() => setFilterStatus("all")}
                className="rounded-full bg-gray-900 dark:bg-gray-700 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                Voir tous les rendez-vous
              </button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;
              const appointmentDate = new Date(appointment.date);
              const isPast = appointmentDate < new Date();

              return (
                <div
                  key={appointment.id}
                  className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className="flex-shrink-0">
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {appointmentDate.getDate()}
                        </div>
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                          {appointmentDate.toLocaleDateString("fr-FR", {
                            month: "short",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {appointment.doctor}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.specialty}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.badgeColor}`}
                        >
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock size={16} className="text-gray-400" />
                          <span>
                            {appointmentDate.toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}{" "}
                            à{" "}
                            {appointmentDate.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {appointment.type === "Téléconsultation" ? (
                            <>
                              <Video size={16} className="text-gray-400" />
                              <span>Téléconsultation</span>
                            </>
                          ) : (
                            <>
                              <MapPin size={16} className="text-gray-400" />
                              <span className="truncate">
                                {appointment.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          📝 {appointment.notes}
                        </p>
                      )}

                      {/* Actions */}
                      {appointment.status === "scheduled" && !isPast && (
                        <div className="flex items-center gap-2">
                          <button className="rounded-full bg-gray-900 dark:bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                            Rejoindre
                          </button>
                          <button className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Modifier
                          </button>
                          <button className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                            Annuler
                          </button>
                        </div>
                      )}
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
