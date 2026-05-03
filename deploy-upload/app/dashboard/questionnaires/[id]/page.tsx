import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import prisma from "@/lib/prisma";

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Questionnaire Detail | MediFollow",
  description: "View questionnaire template details",
};

export default async function QuestionnaireDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // Only doctors can access this page
  if (user.role !== "DOCTOR") {
    redirect("/dashboard");
  }

  // Fetch questionnaire template
  const template = await prisma.questionnaireTemplate.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { questionNumber: "asc" },
      },
      assignments: {
        include: {
          patient: true,
        },
      },
    },
  });

  if (!template) {
    redirect("/dashboard/questionnaires");
  }

  // Verify doctor owns this template
  if (template.doctorId !== user.id) {
    redirect("/dashboard/questionnaires");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a
            href="/dashboard/questionnaires"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Questionnaires
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {template.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {template.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Specialty
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {template.specialty}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Questions
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {template.questions.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Assignments
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {template.assignments.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI Generated
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {template.isAiGenerated ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Questions
          </h2>
          <div className="space-y-4">
            {template.questions.map((question, index) => (
              <div
                key={question.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {index + 1}. {question.questionText}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Type:{" "}
                  <span className="font-mono">{question.questionType}</span>
                  {question.isRequired && (
                    <span className="ml-2 text-red-500">*Required</span>
                  )}
                </p>
                {question.helpText && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Help: {question.helpText}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
