"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Assignment {
  id: string;
  status: string;
  dueDate?: string;
  template?: {
    id: string;
    title: string;
    description?: string;
    specialty: string;
    questions: Array<{
      id: string;
      questionText: string;
    }>;
  };
}

export default function PatientQuestionnairesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/questionnaires/assign");

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch questionnaires" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setAssignments(data.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load questionnaires";
      setError(errorMessage);
      console.error("Error fetching questionnaires:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "OVERDUE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "COMPLETED":
        return "Complété";
      case "OVERDUE":
        return "En retard";
      default:
        return status;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Questionnaires
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Consultez et complétez les questionnaires assignés par votre médecin
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {assignments.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Aucun questionnaire assigné
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Votre médecin vous assignera des questionnaires ici
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questionnaires List */}
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className={`hover:shadow-lg transition-shadow ${
              assignment.status === "COMPLETED"
                ? "border-green-200 dark:border-green-900/30"
                : isOverdue(assignment.dueDate)
                  ? "border-red-200 dark:border-red-900/30"
                  : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {assignment.template?.title || "Sans titre"}
                  </CardTitle>
                  {assignment.template?.description && (
                    <CardDescription className="mt-2">
                      {assignment.template.description}
                    </CardDescription>
                  )}
                </div>
                <Badge className={getStatusColor(assignment.status)}>
                  {getStatusLabel(assignment.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Metadata */}
              <div className="flex flex-wrap gap-4">
                {assignment.template?.specialty && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Spécialité:
                    </span>
                    <Badge variant="outline">
                      {assignment.template.specialty}
                    </Badge>
                  </div>
                )}

                {assignment.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Échéance:{" "}
                      {new Date(assignment.dueDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}

                {assignment.template?.questions && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {assignment.template.questions.length} question
                    {assignment.template.questions.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {assignment.status !== "COMPLETED" ? (
                <Link
                  href={`/dashboard/patient/questionnaires/${assignment.id}`}
                >
                  <Button className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700">
                    Compléter le questionnaire
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Questionnaire complété</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
