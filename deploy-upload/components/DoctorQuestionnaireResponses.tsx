"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Eye, AlertCircle } from "lucide-react";

interface Response {
  id: string;
  answer?: string | null;
  question: {
    id: string;
    questionNumber: number;
    questionText: string;
    questionType: string;
  };
}

interface Assignment {
  id: string;
  template?: {
    title: string;
    description?: string;
    specialty: string;
    questions: any[];
  };
  patient?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  status: string;
  completedAt?: string;
  score?: number;
  scoreOutOf?: number;
  responses: any[];
}

interface DoctorQuestionnaireResponsesProps {
  templateId?: string;
  patientId?: string;
  assignmentId?: string;
}

export default function DoctorQuestionnaireResponses({
  templateId,
  patientId,
  assignmentId,
}: DoctorQuestionnaireResponsesProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({});
  const [analysisLoading, setAnalysisLoading] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchResponses();
  }, [templateId, patientId, assignmentId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      let url = "/api/questionnaires/responses?";

      if (assignmentId) {
        url += `assignmentId=${assignmentId}`;
      } else if (patientId && templateId) {
        url += `patientId=${patientId}&templateId=${templateId}`;
      } else {
        setError(
          "Please provide either assignmentId or both patientId and templateId"
        );
        return;
      }

      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch responses");

      const data = await response.json();
      setAssignments(data.data);

      if (data.data.length > 0) {
        setSelectedAssignment(data.data[0]);
        // Fetch analysis for each assignment
        data.data.forEach((assignment: Assignment) => {
          fetchAnalysis(assignment.id);
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (assignmentId: string) => {
    try {
      setAnalysisLoading((prev) => new Set([...prev, assignmentId]));
      const response = await fetch(
        `/api/questionnaires/analyze?assignmentId=${assignmentId}`
      );

      if (!response.ok) {
        console.warn("Analysis fetch failed for assignment", assignmentId);
        return;
      }

      const result = await response.json();
      if (result.data?.analysis) {
        setAnalysisMap((prev) => ({
          ...prev,
          [assignmentId]: result.data.analysis,
        }));
      }
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setAnalysisLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200";
    }
  };

  const handleDownloadPDF = async (assignment: Assignment) => {
    // Simple text-based export for now
    const content = generateTextReport(assignment);
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute(
      "download",
      `questionnaire-${assignment.patient?.user.firstName}-${Date.now()}.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateTextReport = (assignment: Assignment): string => {
    let report = "";
    report += `QUESTIONNAIRE RESPONSE REPORT\n`;
    report += `=============================\n\n`;
    report += `Document: ${assignment.template?.title}\n`;
    report += `Patient: ${assignment.patient?.user.firstName} ${assignment.patient?.user.lastName}\n`;
    report += `Email: ${assignment.patient?.user.email}\n`;
    report += `Status: ${assignment.status}\n`;
    report += `Completed: ${assignment.completedAt ? new Date(assignment.completedAt).toLocaleString() : "Not completed"}\n\n`;

    report += `RESPONSES\n`;
    report += `=========\n\n`;

    assignment.responses.forEach((response: Response, idx: number) => {
      report += `Q${response.question.questionNumber}: ${response.question.questionText}\n`;
      report += `Type: ${response.question.questionType}\n`;
      report += `Answer: ${response.answer || "N/A"}\n\n`;
    });

    return report;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || assignments.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error || "No responses found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Responses List */}
      {assignments.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer transition-colors ${
                selectedAssignment?.id === assignment.id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">
                      {assignment.patient?.user.firstName}{" "}
                      {assignment.patient?.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {assignment.patient?.user.email}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={
                        assignment.status === "COMPLETED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {assignment.status}
                    </Badge>
                    {assignment.completedAt && (
                      <Badge variant="outline">
                        {new Date(assignment.completedAt).toLocaleDateString()}
                      </Badge>
                    )}
                    {analysisMap[assignment.id] && (
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold ${getUrgencyColor(analysisMap[assignment.id].urgency)}`}
                      >
                        {analysisMap[assignment.id].urgency}
                      </div>
                    )}
                    {analysisLoading.has(assignment.id) && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Analyzing...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Response Detail */}
      {selectedAssignment && (
        <div className="space-y-4">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedAssignment.template?.title}</CardTitle>
                  {selectedAssignment.template?.description && (
                    <CardDescription className="mt-2">
                      {selectedAssignment.template.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(selectedAssignment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Patient and Status Info */}
              <div className="flex flex-col gap-2 mt-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Patient:
                  </span>
                  <p className="text-sm">
                    {selectedAssignment.patient?.user.firstName}{" "}
                    {selectedAssignment.patient?.user.lastName}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <Badge className="ml-2" variant="outline">
                      {selectedAssignment.status}
                    </Badge>
                  </div>
                  {selectedAssignment.completedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Completed:
                      </span>
                      <p className="text-sm">
                        {new Date(
                          selectedAssignment.completedAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Analysis Section */}
          {analysisMap[selectedAssignment.id] ? (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <CardTitle>Clinical Analysis</CardTitle>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full font-bold text-sm ${getUrgencyColor(analysisMap[selectedAssignment.id].urgency)}`}
                  >
                    {analysisMap[selectedAssignment.id].urgency} URGENCY
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Risk Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Risk Score</p>
                    <span className="text-sm font-bold">
                      {analysisMap[selectedAssignment.id].riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        analysisMap[selectedAssignment.id].riskScore >= 80
                          ? "bg-red-600"
                          : analysisMap[selectedAssignment.id].riskScore >= 60
                            ? "bg-orange-500"
                            : analysisMap[selectedAssignment.id].riskScore >= 40
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{
                        width: `${analysisMap[selectedAssignment.id].riskScore}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {analysisMap[selectedAssignment.id].analysis}
                  </p>
                </div>

                {/* Key Findings */}
                {analysisMap[selectedAssignment.id].keyFindings?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Key Findings</p>
                    <ul className="space-y-2">
                      {analysisMap[selectedAssignment.id].keyFindings.map(
                        (finding: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-red-500 font-bold">•</span>
                            {finding}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysisMap[selectedAssignment.id].recommendations?.length >
                  0 && (
                  <div>
                    <p className="font-semibold mb-2">Recommendations</p>
                    <ul className="space-y-2">
                      {analysisMap[selectedAssignment.id].recommendations.map(
                        (rec: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-green-600 font-bold">✓</span>
                            {rec}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : analysisLoading.has(selectedAssignment.id) ? (
            <Card>
              <CardContent className="pt-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <p>Analyzing responses...</p>
              </CardContent>
            </Card>
          ) : null}

          {/* Responses */}
          <div className="space-y-3">
            <h3 className="font-semibold">Patient Responses</h3>
            {selectedAssignment.responses.length > 0 ? (
              selectedAssignment.responses.map(
                (response: Response, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="font-medium">
                          Q{response.question.questionNumber}:{" "}
                          {response.question.questionText}
                        </p>
                        <Badge variant="outline">
                          {response.question.questionType}
                        </Badge>
                        <div className="bg-gray-50 p-3 rounded">
                          {response.answer ? (
                            <p className="text-sm">{response.answer}</p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No response provided
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <p className="text-yellow-700">No responses submitted yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
