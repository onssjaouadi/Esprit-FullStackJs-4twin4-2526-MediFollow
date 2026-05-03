import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import DoctorQuestionnaireResponses from "@/components/DoctorQuestionnaireResponses";

interface PageProps {
  searchParams: {
    templateId?: string;
    patientId?: string;
    assignmentId?: string;
  };
}

export const metadata = {
  title: "Questionnaire Responses | MediFollow",
  description: "View patient questionnaire responses",
};

export default async function ResponsesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // Only doctors can view responses
  if (user.role !== "DOCTOR") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <DoctorQuestionnaireResponses
          templateId={searchParams.templateId}
          patientId={searchParams.patientId}
          assignmentId={searchParams.assignmentId}
        />
      </div>
    </div>
  );
}
