/**
 * [NEW] SuperAdmin Layout
 * Route: /superadmin/*
 * Guard: SUPERADMIN role only — redirects to /login otherwise.
 * Does NOT touch the existing /admin layout.
 */

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import SuperAdminSidebar from "@/components/superadmin/SuperAdminSidebar";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  // [FRONTEND GUARD] Backend also guards every API endpoint independently.
  if (!user || user.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return (
    <div className="sa-canvas flex min-h-screen bg-[#0a0f1e] text-slate-100">
      <SuperAdminSidebar user={user} />

      <div className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-violet-500/20 bg-[#0a0f1e]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 items-center rounded-full bg-violet-600/20 px-3 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/40">
              SUPERADMIN
            </span>
            <span className="text-sm text-slate-400">
              {user.firstName} {user.lastName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30"
              aria-label="SuperAdmin avatar"
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
          </div>
        </header>

        <main className="p-8 max-w-screen-2xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
