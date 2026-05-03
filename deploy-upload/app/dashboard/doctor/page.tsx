"use client";

import {
  Users,
  AlertCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bell,
  Search,
  Clock,
  MoreVertical,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  X,
  Home,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  BarChart3,
  User,
  Moon,
  Sun,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";

import {
  getAllAlerts,
  getAlertStats,
  getAlertsByDoctorSpecialty,
  getAlertStatsByDoctorSpecialty,
} from "@/lib/actions/alert.actions";
import { getCurrentUser, logout } from "@/lib/actions/auth.actions";
import { getDoctorProfile } from "@/lib/actions/doctor.actions";
import {
  getDashboardStats,
  getDashboardStatsByDoctorSpecialty,
} from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";
import { AlertStatus } from "@/types/medifollow.types";
import { useTheme } from "@/contexts/ThemeContext";

export default function DoctorDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);

  function handleCopyWallet() {
    if (user?.blockchainAddress) {
      navigator.clipboard.writeText(user.blockchainAddress);
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2000);
    }
  }

  // Filter alerts based on search query
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentAlerts;
    }

    const query = searchQuery.toLowerCase();
    return recentAlerts.filter((alert: any) => {
      const patientName = alert.patient?.user
        ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`.toLowerCase()
        : "";
      const message = alert.message?.toLowerCase() || "";
      const severity = alert.severity?.toLowerCase() || "";
      const status = alert.status?.toLowerCase() || "";

      return (
        patientName.includes(query) ||
        message.includes(query) ||
        severity.includes(query) ||
        status.includes(query)
      );
    });
  }, [recentAlerts, searchQuery]);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Fermer le panneau de notifications au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showNotifications]);

  async function loadDashboard() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Load doctor profile photo
      const profileResult = await getDoctorProfile(currentUser.id);
      if (profileResult.success && profileResult.data?.profileImage) {
        setProfileImage(profileResult.data.profileImage);
      }

      // Load alert stats filtered by doctor's specialty
      const statsResult = await getAlertStatsByDoctorSpecialty(currentUser.id);
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Load comprehensive dashboard stats filtered by doctor's specialty
      const dashStatsResult = await getDashboardStatsByDoctorSpecialty(
        currentUser.id
      );
      if (dashStatsResult.success && dashStatsResult.stats) {
        setDashboardStats(dashStatsResult.stats);
      }

      // Load recent alerts filtered by doctor's specialty
      const alertsResult = await getAlertsByDoctorSpecialty(
        currentUser.id,
        AlertStatus.OPEN
      );
      if (alertsResult.success && alertsResult.alerts) {
        setRecentAlerts(alertsResult.alerts.slice(0, 10));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-green-500 dark:border-t-green-400"></div>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header - now in layout */}
      {false && (
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() =>
                  document.dispatchEvent(new Event("sidebar:open"))
                }
                className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Ouvrir le menu"
              >
                <Menu className="size-5 text-gray-600 dark:text-gray-300" />
              </button>
              {/* Barre de recherche - Style Kick */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher un patient, une alerte..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-green-400 dark:focus:border-green-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Effacer la recherche"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Actions rapides - Organisées à droite */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Alertes"
                  >
                    <Bell className="size-5 text-gray-700 dark:text-gray-300" />
                    {(stats?.open || 0) > 0 && (
                      <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-green-500 text-black text-[9px] font-bold shadow-lg shadow-green-500/50">
                        {stats.open}
                      </span>
                    )}
                  </button>

                  {/* Panneau de notifications - Kick Style */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                      {/* Header du panneau */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label="Fermer"
                        >
                          <X className="size-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Liste des notifications */}
                      <div className="max-h-[500px] overflow-y-auto">
                        {recentAlerts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-4">
                            <Bell className="size-12 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Aucune notification
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                              Vous êtes à jour !
                            </p>
                          </div>
                        ) : (
                          recentAlerts.map((alert) => {
                            const patientName = alert.patient?.user
                              ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`
                              : "Patient inconnu";

                            const severityColors = {
                              LOW: "bg-blue-50 text-blue-700 border-blue-200",
                              MEDIUM:
                                "bg-yellow-50 text-yellow-700 border-yellow-200",
                              HIGH: "bg-orange-50 text-orange-700 border-orange-200",
                              CRITICAL: "bg-red-50 text-red-700 border-red-200",
                            };

                            return (
                              <Link
                                key={alert.id}
                                href={`/dashboard/doctor/alerts`}
                                onClick={() => setShowNotifications(false)}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                              >
                                {/* Avatar patient */}
                                <div className="size-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                                  {alert.patient?.user?.firstName?.charAt(0) ||
                                    "?"}
                                  {alert.patient?.user?.lastName?.charAt(0) ||
                                    ""}
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {patientName}
                                    </p>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${
                                        severityColors[
                                          alert.severity as keyof typeof severityColors
                                        ]
                                      }`}
                                    >
                                      {alert.severity === "CRITICAL"
                                        ? "CRITIQUE"
                                        : alert.severity === "HIGH"
                                          ? "ÉLEVÉ"
                                          : alert.severity === "MEDIUM"
                                            ? "MOYEN"
                                            : "BAS"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                                    {alert.message}
                                  </p>
                                  <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-500">
                                    <Clock className="size-3" />
                                    <span>
                                      {new Date(
                                        alert.createdAt
                                      ).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      {recentAlerts.length > 0 && (
                        <Link
                          href="/dashboard/doctor/alerts"
                          onClick={() => setShowNotifications(false)}
                          className="block px-4 py-3 text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors border-t border-gray-200 dark:border-gray-800"
                        >
                          Voir toutes les alertes
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Séparateur vertical */}
                <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-800"></div>

                {/* Bouton Mode Sombre/Clair - Kick Style */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={theme === "dark" ? "Mode clair" : "Mode sombre"}
                >
                  {theme === "dark" ? (
                    <Sun className="size-5 text-gray-700 dark:text-green-400" />
                  ) : (
                    <Moon className="size-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>

                {/* Badge Blockchain - Kick Style */}
                {user?.blockchainAddress && (
                  <div className="hidden xl:flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-green-500/10 px-3 py-2 border border-purple-200 dark:border-green-500/20">
                    <div className="size-2 rounded-full bg-purple-600 dark:bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-purple-900 dark:text-green-400">
                      Blockchain Active
                    </span>
                  </div>
                )}

                {/* Wallet button */}
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all border ${
                    user?.blockchainAddress
                      ? "border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Wallet className="size-4" />
                  {user?.blockchainAddress ? (
                    <>
                      <span className="hidden md:inline font-mono text-xs">
                        {user.blockchainAddress.slice(0, 6)}...
                        {user.blockchainAddress.slice(-4)}
                      </span>
                      <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    </>
                  ) : (
                    <span className="hidden sm:inline">Wallet</span>
                  )}
                </button>

                {/* Séparateur vertical */}
                <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-800"></div>

                {/* Icône de profil avec menu déroulant */}
                <Link
                  href="/dashboard/doctor/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Profil"
                >
                  <div className="size-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Photo de profil"
                        className="size-full object-cover"
                      />
                    ) : (
                      <>
                        {user?.firstName?.[0] || "D"}
                        {user?.lastName?.[0] || "M"}
                      </>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : "Dr. Médecin"}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-500 truncate">
                      Cardiologue
                    </span>
                  </div>
                </Link>

                {/* Bouton Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="p-6 sm:p-8 lg:p-10 max-w-[1600px] mx-auto bg-gray-50 dark:bg-black transition-colors">
        {/* Welcome Banner - Kick Style avec vert */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-green-800 dark:from-green-600/90 dark:via-green-700/90 dark:to-green-800/90 p-8 text-white shadow-lg border dark:border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">
                Bonjour, Dr {user?.lastName || "Médecin"} ! 👋
              </h1>
              <p className="text-green-100 text-base">
                Voici un aperçu de votre activité aujourd'hui
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <div className="text-center">
                <div className="text-4xl font-black mb-1">
                  {dashboardStats?.patients?.total || 0}
                </div>
                <div className="text-sm text-green-100">Patients actifs</div>
              </div>
              <div className="h-16 w-px bg-white/20"></div>
              <div className="text-center">
                <div className="text-4xl font-black mb-1">
                  {dashboardStats?.alerts?.critical || 0}
                </div>
                <div className="text-sm text-green-100">Alertes critiques</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Vue d'ensemble des alertes */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Vue d'ensemble des alertes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suivi en temps réel de toutes vos alertes
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Alerts - Kick Style */}
            <Link href="/dashboard/doctor/alerts">
              <div className="group rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-green-300 dark:hover:border-green-500 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-14 rounded-xl bg-blue-50 dark:bg-green-500/10 flex items-center justify-center">
                    <AlertCircle
                      size={28}
                      className="text-blue-600 dark:text-green-400"
                    />
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {stats?.total || 0}
                </p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Total des alertes
                </p>
              </div>
            </Link>

            {/* Open Alerts - Kick Style */}
            <Link href="/dashboard/doctor/alerts?status=open">
              <div className="group rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-14 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle
                      size={28}
                      className="text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {stats?.open || 0}
                </p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Alertes ouvertes
                </p>
              </div>
            </Link>

            {/* Critical Alerts - Kick Style */}
            <Link href="/dashboard/doctor/alerts?severity=critical">
              <div className="group rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-red-300 dark:hover:border-red-500 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-14 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <Activity
                      size={28}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {stats?.critical || 0}
                </p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Alertes critiques
                </p>
              </div>
            </Link>

            {/* Resolved Alerts - Kick Style avec vert */}
            <Link href="/dashboard/doctor/alerts?status=resolved">
              <div className="group rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-green-300 dark:hover:border-green-500 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-14 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <CheckCircle
                      size={28}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {stats?.resolved || 0}
                </p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Alertes résolues
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Section: Statistiques détaillées */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Statistiques détaillées
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-500">
              Analyse approfondie de votre activité
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Patients Statistics - Kick Style */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-green-500/10 flex items-center justify-center">
                  <Users
                    size={24}
                    className="text-blue-600 dark:text-green-400"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Patients
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total actifs
                  </span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {dashboardStats?.patients?.total || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Actifs (7j)
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-green-400">
                    {dashboardStats?.patients?.active || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                    Nouveaux (7j)
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full">
                    +{dashboardStats?.patients?.newThisWeek || 0}
                    <TrendingUp size={14} />
                  </span>
                </div>
              </div>
            </div>

            {/* Vitals Statistics - Kick Style */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                  <HeartPulse
                    size={24}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Signes vitaux
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cette semaine
                  </span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {dashboardStats?.vitals?.thisWeek || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Aujourd&apos;hui
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {dashboardStats?.vitals?.today || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                    Symptômes (24h)
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full">
                    {dashboardStats?.symptoms?.today || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics - Kick Style */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <Activity
                    size={24}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Performance
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Taux résolution
                  </span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {dashboardStats?.alerts?.resolutionRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Temps réponse
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {dashboardStats?.alerts?.avgResponseTime || 0}h
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                    Alertes critiques
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${
                      (dashboardStats?.alerts?.critical || 0) > 0
                        ? "text-red-600 bg-red-50"
                        : "text-green-600 bg-green-50"
                    }`}
                  >
                    {dashboardStats?.alerts?.critical || 0}
                    {(dashboardStats?.alerts?.critical || 0) > 0 ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Données médicales */}
        {dashboardStats?.bloodTypeDistribution &&
          dashboardStats.bloodTypeDistribution.length > 0 && (
            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Données médicales
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-500">
                  Informations cliniques des patients
                </p>
              </div>
              <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <Activity
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Distribution des groupes sanguins
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Répartition des patients par type sanguin
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {dashboardStats.bloodTypeDistribution.map(
                    (bt: { bloodType: string; count: number }) => (
                      <div
                        key={bt.bloodType}
                        className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 hover:shadow-md transition-all cursor-pointer"
                      >
                        <span className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                          {bt.count}
                        </span>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                          {bt.bloodType}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Section: Alertes récentes */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Activité récente
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-500">
              Dernières alertes et notifications
            </p>
          </div>

          {/* Quick Navigation - Kick Style Chips */}
          <div className="mb-4 flex items-center gap-3 overflow-x-auto pb-2">
            <Link href="/dashboard/doctor/patients">
              <button className="flex items-center gap-2 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-green-300 dark:hover:border-green-500 transition-colors whitespace-nowrap">
                <Users size={18} />
                Patients
              </button>
            </Link>
            <Link href="/dashboard/doctor/vitals">
              <button className="flex items-center gap-2 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-green-300 dark:hover:border-green-500 transition-colors whitespace-nowrap">
                <HeartPulse size={18} />
                Signes vitaux
              </button>
            </Link>
            <Link href="/dashboard/doctor/analytics">
              <button className="flex items-center gap-2 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-green-300 dark:hover:border-green-500 transition-colors whitespace-nowrap">
                <TrendingUp size={18} />
                Analytiques
              </button>
            </Link>
            <Link href="/dashboard/doctor/reports">
              <button className="flex items-center gap-2 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-green-300 dark:hover:border-green-500 transition-colors whitespace-nowrap">
                <Stethoscope size={18} />
                Rapports
              </button>
            </Link>
            <Link href="/dashboard/questionnaires">
              <button className="flex items-center gap-2 rounded-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500 transition-colors whitespace-nowrap">
                <ClipboardList size={18} />
                Questionnaires
              </button>
            </Link>
          </div>

          {/* Recent Alerts - Kick Style */}
          <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
            <div className="border-b-2 border-gray-200 dark:border-gray-800 px-6 py-5 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Alertes récentes
                </h3>
                {searchQuery && (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                    {filteredAlerts.length} résultat
                    {filteredAlerts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/doctor/alerts"
                className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-xl transition-all hover:shadow-md"
              >
                Voir tout
                <ChevronRight size={18} />
              </Link>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {searchQuery ? (
                    <Search
                      size={36}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  ) : (
                    <CheckCircle
                      size={36}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {searchQuery
                    ? "Aucun résultat trouvé"
                    : "Aucune alerte active"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery
                    ? "Essayez avec d'autres mots-clés"
                    : "Toutes les alertes sont résolues"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAlerts.map((alert: any) => (
                  <Link
                    key={alert.id}
                    href={`/dashboard/doctor/alerts/${alert.id}`}
                    className="group block hover:bg-green-50/50 dark:hover:bg-green-500/5 transition-all"
                  >
                    <div className="px-6 py-5">
                      <div className="flex gap-5">
                        {/* Patient Avatar - Kick Style */}
                        <div className="flex-shrink-0">
                          <div className="relative h-28 w-44 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 dark:from-green-600/90 dark:to-green-700/90 flex items-center justify-center overflow-hidden shadow-md border dark:border-green-500/20">
                            <div className="text-4xl font-black text-white">
                              {alert.patient?.user?.firstName?.charAt(0)}
                              {alert.patient?.user?.lastName?.charAt(0)}
                            </div>
                            {/* Severity Badge - Kick Style */}
                            <div
                              className={`absolute bottom-2 right-2 rounded-lg px-3 py-1 text-xs font-black text-black shadow-lg ${
                                alert.severity === "CRITICAL"
                                  ? "bg-red-500"
                                  : alert.severity === "HIGH"
                                    ? "bg-orange-400"
                                    : "bg-yellow-400"
                              }`}
                            >
                              {alert.severity}
                            </div>
                          </div>
                        </div>

                        {/* Alert Details - Kick Style */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Alert Title */}
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {alert.message}
                              </h3>

                              {/* Patient Name */}
                              <div className="flex items-center gap-2 mb-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {alert.patient?.user
                                    ? `${alert.patient.user.firstName} ${alert.patient.user.lastName}`
                                    : "Patient inconnu"}
                                </p>
                                {alert.severity === "CRITICAL" && (
                                  <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                    <AlertCircle size={14} />
                                    Urgent
                                  </span>
                                )}
                              </div>

                              {/* Meta Info - Kick Style */}
                              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {formatDateTime(alert.createdAt)}
                                </div>
                                <span>•</span>
                                <span className="capitalize font-semibold">
                                  {alert.status === "OPEN"
                                    ? "Non traité"
                                    : alert.status === "IN_PROGRESS"
                                      ? "En cours"
                                      : "Résolu"}
                                </span>
                              </div>
                            </div>

                            {/* More Options Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                              title="Plus d'options"
                              aria-label="Plus d'options"
                            >
                              <MoreVertical
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Wallet Modal - now in layout */}
      {false && walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setWalletModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 dark:bg-green-500/20 p-2">
                  <Wallet className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Mon Wallet Blockchain
                </h2>
              </div>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Fermer le modal du wallet"
                title="Fermer"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {user?.blockchainAddress ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Connecté · Aptos Testnet
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
                    Adresse publique
                  </p>
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all leading-relaxed">
                    {user.blockchainAddress}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyWallet}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/30 transition-colors"
                  >
                    {walletCopied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {walletCopied ? "Copié !" : "Copier"}
                  </button>
                  <a
                    href={`https://explorer.aptoslabs.com/account/${user.blockchainAddress}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    Explorer
                  </a>
                </div>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3 border border-blue-100 dark:border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">
                    Réseau Aptos Testnet
                  </p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-300/70">
                    Ce wallet sécurise et certifie votre accès aux dossiers
                    patients via la blockchain.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="size-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  Aucun wallet configuré
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Contactez un administrateur pour assigner votre wallet
                  blockchain.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
