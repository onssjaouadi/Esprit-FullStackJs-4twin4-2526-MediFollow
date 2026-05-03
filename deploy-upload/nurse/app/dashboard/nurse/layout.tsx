"use client";

import {
  Activity,
  Users,
  ClipboardList,
  AlertCircle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Home,
  Bell,
  User,
  Clock,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, ReactNode } from "react";

import { getCurrentUser, logout } from "@/lib/actions/auth.actions";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useNurseBadges } from "@/hooks/useNurseBadges";

export default function NurseLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NurseLayoutInner>{children}</NurseLayoutInner>
    </ThemeProvider>
  );
}

function NurseLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { badges } = useNurseBadges(user?.nurseProfile?.id || null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "NURSE") {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const navItems = [
    {
      href: "/dashboard/nurse",
      label: "Dashboard",
      icon: Home,
      badge: null,
    },
    {
      href: "/dashboard/nurse/patients",
      label: "My Patients",
      icon: Users,
      badge: badges.patientsNeedingData > 0 ? badges.patientsNeedingData : null,
      badgeColor: "orange",
    },
    {
      href: "/dashboard/nurse/assign-patient",
      label: "Assign to Doctor",
      icon: UserPlus,
      badge: null,
    },
    {
      href: "/dashboard/nurse/enter-data",
      label: "Enter Data",
      icon: ClipboardList,
      badge: null,
    },
    {
      href: "/dashboard/nurse/alerts",
      label: "Alerts",
      icon: Bell,
      badge: badges.criticalAlerts > 0 ? badges.criticalAlerts : null,
      badgeColor: "red",
    },
    {
      href: "/dashboard/nurse/notifications",
      label: "Notifications",
      icon: Bell,
      badge: null,
    },
    {
      href: "/dashboard/nurse/reminders",
      label: "Reminders",
      icon: Clock,
      badge: null,
    },
    {
      href: "/dashboard/nurse/profile",
      label: "Profile",
      icon: User,
      badge: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/dashboard/nurse"
            className="flex items-center space-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-2">
              <Activity className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black leading-none bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                MediFollow
              </span>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                Nurse
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null &&
                  item.badge !== undefined &&
                  item.badge > 0 && (
                    <span
                      className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full
                    ${item.badgeColor === "red" ? "bg-red-600 text-white" : ""}
                    ${item.badgeColor === "orange" ? "bg-orange-600 text-white" : ""}
                    ${!item.badgeColor || item.badgeColor === "blue" ? "bg-blue-600 text-white" : ""}
                    ${isActive ? "bg-white text-blue-600" : ""}
                  `}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-200 font-bold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.nurseProfile?.department || "Nurse"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/30"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
