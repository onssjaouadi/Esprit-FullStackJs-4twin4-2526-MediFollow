"use client";

/**
 * [NEW] SuperAdmin Sidebar Navigation
 * Standalone component — does not affect existing AdminSidebar.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Stethoscope,
  UserCheck,
  HeartPulse,
  ClipboardList,
  ScrollText,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/lib/actions/auth.actions";

const NAV = [
  {
    label: "Overview",
    href: "/superadmin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    icon: Users,
    children: [
      { label: "All Users", href: "/superadmin/users", icon: Users },
      { label: "Admins", href: "/superadmin/users/admins", icon: UserCog },
      { label: "Doctors", href: "/superadmin/users/doctors", icon: Stethoscope },
      { label: "Patients", href: "/superadmin/users/patients", icon: HeartPulse },
      { label: "Nurses", href: "/superadmin/users/nurses", icon: ClipboardList },
      { label: "Coordinators", href: "/superadmin/users/coordinators", icon: UserCheck },
      { label: "Deleted / Suspended", href: "/superadmin/users/deleted", icon: ShieldAlert },
    ],
  },
  {
    label: "Audit Log",
    href: "/superadmin/audit",
    icon: ScrollText,
  },
  {
    label: "System Settings",
    href: "/superadmin/settings",
    icon: Settings,
    badge: "Soon",
  },
];

export default function SuperAdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/superadmin" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r border-violet-500/20 bg-[#080c18]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-violet-500/20 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/40">
          <ShieldAlert size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">MediFollow</p>
          <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-widest">
            SuperAdmin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {NAV.map((item) => {
          if (item.children) {
            const groupActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label} className="space-y-0.5">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <item.icon size={14} />
                  {item.label}
                </div>
                <div className="ml-2 space-y-0.5 border-l border-violet-500/20 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                        isActive(child.href)
                          ? "bg-violet-600/20 text-violet-300 font-medium ring-1 ring-violet-500/30"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <child.icon size={14} />
                      {child.label}
                      {isActive(child.href) && (
                        <ChevronRight size={12} className="ml-auto text-violet-400" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive(item.href!)
                  ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <item.icon size={16} />
              {item.label}
              {(item as any).badge && (
                <span className="ml-auto rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-violet-500/20 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-violet-400">SuperAdmin</p>
          </div>
          <form action={async () => { await logout(); }}>
            <button
              type="submit"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
