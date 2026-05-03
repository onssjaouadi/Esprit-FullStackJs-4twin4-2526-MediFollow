"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth.actions";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import ThemeToggle from "@/components/admin/ThemeToggle";

interface AdminHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-end border-b border-gray-200 dark:border-gray-800 px-6 bg-white dark:bg-gray-950 transition-colors">
      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* User Name */}
        {user?.firstName && (
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administrateur
            </p>
          </div>
        )}

        {/* Avatar */}
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-indigo-500/30">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

        {/* Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AdminNotificationBell />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 transition-all hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Décon.</span>
          </button>
        </div>
      </div>
    </header>
  );
}
