import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import PatientQuestionnaire from "@/components/PatientQuestionnaire";

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Questionnaire | MediFollow",
  description: "Fill out patient questionnaire",
};

export default async function RespondPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <PatientQuestionnaire assignmentId={params.id} />
      </div>
    </div>
  );
}
