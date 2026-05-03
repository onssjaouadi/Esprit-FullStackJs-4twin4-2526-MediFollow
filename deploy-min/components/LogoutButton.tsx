"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth.actions";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold tracking-tight text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
    >
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  );
}
