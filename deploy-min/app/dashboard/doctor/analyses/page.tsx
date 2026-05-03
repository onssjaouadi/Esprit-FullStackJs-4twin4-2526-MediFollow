import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import AnalysisManagement from "@/components/AnalysisManagement";

export const metadata = {
  title: "Demandes d'Analyses | MediFollow",
  description: "Manage medical analysis requests",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalysesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 dark:via-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <AnalysisManagement />
      </div>
    </div>
  );
}
