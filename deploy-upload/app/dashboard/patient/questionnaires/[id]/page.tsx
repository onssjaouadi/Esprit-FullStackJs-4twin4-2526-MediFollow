"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PatientQuestionnaire from "@/components/PatientQuestionnaire";

export default function PatientQuestionnairePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitSuccess = () => {
    setSubmitting(true);
    // Redirect after a short delay to show the success message
    setTimeout(() => {
      router.push("/dashboard/patient/questionnaires");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Back Button */}
        <Link href="/dashboard/patient/questionnaires">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux questionnaires
          </Button>
        </Link>

        {/* Questionnaire Component */}
        <PatientQuestionnaire
          assignmentId={params.id}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </div>
    </div>
  );
}
