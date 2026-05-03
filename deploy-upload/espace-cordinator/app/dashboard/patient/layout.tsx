"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Bell,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Clock,
  Shield,
  User,
  Moon,
  Sun,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  Search,
  BookOpen,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { logout } from "@/lib/actions/auth.actions";
import { getPatientAlerts } from "@/lib/actions/alert.actions";
import { getPatientProfile } from "@/lib/actions/patient.actions";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AlertStatus } from "@/types/medifollow.types";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PatientLayoutInner>{children}</PatientLayoutInner>
    </ThemeProvider>
  );
}

function PatientLayoutInner({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [openAlertsCount, setOpenAlertsCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
    const sidebarHandler = () => setSidebarOpen(true);
    document.addEventListener("sidebar:open", sidebarHandler);
    return () => document.removeEventListener("sidebar:open", sidebarHandler);
  }, []);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) return;
      // Load profile image
      const profileRes = await getPatientProfile(currentUser.id);
      if (profileRes.success && profileRes.data?.profileImage) {
        setProfileImage(profileRes.data.profileImage);
      }
      const patientRes = await fetch("/api/patient/me");
      if (patientRes.ok) {
        const { patientId } = await patientRes.json();
        if (patientId) {
          const alertsRes = await getPatientAlerts(patientId, AlertStatus.OPEN);
          if (alertsRes.success) {
            const alerts = alertsRes.alerts ?? [];
            setRecentAlerts(alerts.slice(0, 10));
            setOpenAlertsCount(
              alerts.filter(
                (a: any) => a.severity === "CRITICAL" || a.severity === "HIGH"
              ).length
            );
          }
        }
      }
    } catch {}
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function handleCopyWallet() {
    if (user?.blockchainAddress) {
      navigator.clipboard.writeText(user.blockchainAddress);
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2000);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboard/patient?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery("");
    }
  }

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Tableau de bord",
      href: "/dashboard/patient",
    },
    {
      icon: Activity,
      label: "Signes vitaux",
      href: "/dashboard/patient/vitals",
    },
    {
      icon: BookOpen,
      label: "Guide suivi",
      href: "/dashboard/patient/guide",
    },
    {
      icon: Bell,
      label: "Alertes",
      href: "/dashboard/patient/alerts",
      badge: openAlertsCount,
    },
    {
      icon: Calendar,
      label: "Rendez-vous",
      href: "/dashboard/patient/appointments",
    },
    {
      icon: FileText,
      label: "Rapports médicaux",
      href: "/dashboard/patient/reports",
    },
    {
      icon: Clock,
      label: "Historique",
      href: "/dashboard/patient/history",
    },
    {
      icon: Shield,
      label: "Accès médecins",
      href: "/dashboard/patient/access",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black transition-colors">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo - Style MediFollow avec gradient rouge */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5">
          <Link
            href="/"
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-600 to-red-700 dark:from-white dark:to-gray-100 opacity-0 blur-lg transition-opacity group-hover:opacity-50"></div>
              <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-700 p-2 shadow-lg shadow-red-500/30 dark:shadow-white/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-red-500/50 dark:group-hover:shadow-white/50">
                <Activity className="size-7 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black leading-none bg-gradient-to-r from-red-600 via-red-700 to-red-700 bg-clip-text text-transparent">
                MediFollow
              </span>
              <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-500 tracking-wider uppercase">
                Santé Digitale
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="size-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-red-500/10 to-red-400/10 dark:from-red-500/20 dark:to-red-400/20 text-red-600 dark:text-red-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-red-500 to-red-400 rounded-r-full"></div>
                  )}
                  <Icon className="size-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-red-600 to-red-700 px-2 py-0.5 text-xs font-bold text-white shadow-sm shadow-red-500/50 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                Paramètres
              </p>
            </div>
            <Link
              href="/dashboard/patient/profile"
              className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                pathname === "/dashboard/patient/profile"
                  ? "bg-gradient-to-r from-red-500/10 to-red-400/10 dark:from-red-500/20 dark:to-red-400/20 text-red-600 dark:text-red-400 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {pathname === "/dashboard/patient/profile" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-red-500 to-red-400 rounded-r-full"></div>
              )}
              <User className="size-5" />
              <span>Profil</span>
            </Link>
            <Link
              href="/dashboard/patient/settings"
              className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                pathname === "/dashboard/patient/settings"
                  ? "bg-gradient-to-r from-red-500/10 to-red-400/10 dark:from-red-500/20 dark:to-red-400/20 text-red-600 dark:text-red-400 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {pathname === "/dashboard/patient/settings" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-red-500 to-red-400 rounded-r-full"></div>
              )}
              <Settings className="size-5" />
              <span>Paramètres</span>
            </Link>
          </div>
        </nav>

        {/* Bottom user card — red gradient */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          <Link
            href="/dashboard/patient/profile"
            className="block relative rounded-xl bg-gradient-to-br from-red-600 to-red-700 dark:from-red-600/90 dark:to-red-700/90 p-4 shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border dark:border-red-500/20"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex-shrink-0 overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Photo de profil"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-base">
                    {user?.firstName?.[0] ?? "P"}
                    {user?.lastName?.[0] ?? ""}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "Patient"}
                </p>
                <p className="truncate text-xs text-white/90">Patient</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="rounded-lg p-2 text-white/90 hover:bg-white/20 transition-colors backdrop-blur-sm"
                title="Déconnexion"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Ouvrir le menu"
              >
                <Menu className="size-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-red-400 dark:focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      aria-label="Effacer"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                {/* Notifications bell */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Alertes"
                  >
                    <Bell className="size-5 text-gray-700 dark:text-gray-300" />
                    {openAlertsCount > 0 && (
                      <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-white text-[9px] font-bold shadow-lg shadow-red-500/50">
                        {openAlertsCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        <button
                          aria-label="Fermer"
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <X className="size-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {recentAlerts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 px-4">
                            <Bell className="size-10 text-gray-300 dark:text-gray-700 mb-3" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Aucune notification
                            </p>
                          </div>
                        ) : (
                          recentAlerts.map((alert: any) => {
                            const severityColors: Record<string, string> = {
                              LOW: "bg-blue-50 text-blue-700 border-blue-200",
                              MEDIUM:
                                "bg-yellow-50 text-yellow-700 border-yellow-200",
                              HIGH: "bg-orange-50 text-orange-700 border-orange-200",
                              CRITICAL: "bg-red-50 text-red-700 border-red-200",
                            };
                            return (
                              <Link
                                key={alert.id}
                                href="/dashboard/patient/alerts"
                                onClick={() => setShowNotifications(false)}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                              >
                                <div className="size-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  <Bell className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {alert.alertType ?? "Alerte"}
                                    </p>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${severityColors[alert.severity] ?? ""}`}
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
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {alert.message}
                                  </p>
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>
                      {recentAlerts.length > 0 && (
                        <Link
                          href="/dashboard/patient/alerts"
                          onClick={() => setShowNotifications(false)}
                          className="block px-4 py-3 text-center text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-200 dark:border-gray-800"
                        >
                          Voir toutes les alertes
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-800" />

                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={theme === "dark" ? "Mode clair" : "Mode sombre"}
                >
                  {theme === "dark" ? (
                    <Sun className="size-5 text-red-400" />
                  ) : (
                    <Moon className="size-5 text-gray-700" />
                  )}
                </button>

                {/* Blockchain badge */}
                {user?.blockchainAddress && (
                  <div className="hidden xl:flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/20">
                    <div className="size-2 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
                    <span className="text-xs font-medium text-red-900 dark:text-red-400">
                      Blockchain Active
                    </span>
                  </div>
                )}

                {/* Wallet button */}
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all border ${
                    user?.blockchainAddress
                      ? "border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
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
                      <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                    </>
                  ) : (
                    <span className="hidden sm:inline">Wallet</span>
                  )}
                </button>

                <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-800" />

                {/* Profile link */}
                <Link
                  href="/dashboard/patient/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="size-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Photo de profil"
                        className="size-full object-cover"
                      />
                    ) : (
                      <>
                        {user?.firstName?.[0] || "P"}
                        {user?.lastName?.[0] || ""}
                      </>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : "Patient"}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-500 truncate">
                      Patient
                    </span>
                  </div>
                </Link>

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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-black">
          {children}
        </main>
      </div>

      {/* ── Wallet Modal ──────────────────────────────────────────────────────── */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setWalletModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 dark:bg-red-500/20 p-2">
                  <Wallet className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Mon Wallet Blockchain
                </h2>
              </div>
              <button
                aria-label="Fermer"
                onClick={() => setWalletModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>
            {user?.blockchainAddress ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
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
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 transition-colors"
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
                    Ce wallet identifie votre dossier patient et contrôle les
                    accès blockchain des médecins.
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
                  Votre wallet sera assigné automatiquement lors de votre
                  prochaine connexion.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
