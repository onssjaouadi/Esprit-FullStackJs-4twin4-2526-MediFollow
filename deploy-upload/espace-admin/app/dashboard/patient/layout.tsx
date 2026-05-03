"use client";

import { ReactNode, useState, useEffect } from "react";
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
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { logout } from "@/lib/actions/auth.actions";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
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
      icon: Bell,
      label: "Alertes",
      href: "/dashboard/patient/alerts",
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
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - YouTube/ChatGPT Style (Minimal & Clean) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo - Minimal */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <Heart className="size-6 text-gray-900 transition-transform group-hover:scale-105" />
            <span className="text-lg font-semibold text-gray-900">
              MediFollow
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation - YouTube Sidebar Style */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-gray-900 rounded-r-full"></div>
                  )}
                  <Icon className="size-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/dashboard/patient/settings"
              className={`group flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === "/dashboard/patient/settings"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pathname === "/dashboard/patient/settings" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-gray-900 rounded-r-full"></div>
              )}
              <Settings className="size-5" />
              <span>Paramètres</span>
            </Link>
          </div>
        </nav>

        {/* User Profile - Minimal ChatGPT Style */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-gray-50 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header - Minimal */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="size-6" />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="size-6 text-gray-900" />
            <span className="text-lg font-semibold text-gray-900">
              MediFollow
            </span>
          </Link>
          <div className="size-10"></div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
      </div>

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
