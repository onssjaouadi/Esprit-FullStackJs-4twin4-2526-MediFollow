import { redirect } from "next/navigation";
import SituationReportEditor from "@/components/SituationReportEditor";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPatientById } from "@/lib/actions/patient.actions";

export default async function SituationReportsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patient = await getPatientById(params.id);

  if (!patient) {
    redirect("/dashboard/doctor/patients");
  }

  const patientName = `${patient.user.firstName} ${patient.user.lastName}`;

  return (
    <div className="space-y-6">
      <SituationReportEditor patientId={patient.id} patientName={patientName} />
    </div>
  );
}
