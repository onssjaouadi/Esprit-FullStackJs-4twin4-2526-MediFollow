import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import AdminCommandPalette from "@/components/admin/AdminCommandPalette";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNotificationBell from "@/components/AdminNotificationBell";
import ThemeToggle from "@/components/admin/ThemeToggle";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="glass-canvas flex min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <AdminSidebar />

      <div className="flex-1 lg:pl-72">
        <header className="glass-panel sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 dark:border-cyan-300/20 px-10 backdrop-blur-xl">
          <form action="/dashboard/admin/search" className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-cyan-200/80" size={18} />
            <input
              type="text"
              name="q"
              placeholder="Search users, alerts, services..."
              className="w-full rounded-2xl border border-slate-300 dark:border-cyan-300/30 bg-white/60 dark:bg-slate-900/40 py-2.5 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-cyan-100/50 outline-none focus:ring-2 focus:ring-indigo-400/35 dark:focus:ring-cyan-400/35"
            />
          </form>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AdminNotificationBell />
            <div className="glass-neon h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      <AdminCommandPalette />
    </div>
  );
}
