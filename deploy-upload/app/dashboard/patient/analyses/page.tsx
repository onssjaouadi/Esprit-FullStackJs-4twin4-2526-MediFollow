import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import PatientAnalysisView from "@/components/PatientAnalysisView";

export default async function PatientAnalysisPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <PatientAnalysisView />
    </div>
  );
}
