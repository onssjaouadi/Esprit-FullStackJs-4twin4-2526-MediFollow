import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "COORDINATOR") {
    redirect("/login");
  }

  return <>{children}</>;
}
