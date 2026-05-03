"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ResponseViewerProps {
  assignmentId: string;
  onBack?: () => void;
}

interface AnalysisData {
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  riskScore: number;
  keyFindings: string[];
  recommendations: string[];
  analysis: string;
}

const formatDate = (date: string | Date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export default function ResponseViewer({
  assignmentId,
  onBack,
}: ResponseViewerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResponses();
  }, [assignmentId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questionnaires/responses?assignmentId=${assignmentId}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch responses" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.data) {
        throw new Error("Invalid response format from server");
      }
      setData(result.data);
      setError(null);

      // Fetch analysis after responses are loaded
      await fetchAnalysis();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching responses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      const response = await fetch(
        `/api/questionnaires/analyze?assignmentId=${assignmentId}`
      );

      if (!response.ok) {
        console.warn("Analysis fetch failed, continuing without analysis");
        return;
      }

      const result = await response.json();
      if (result.data?.analysis) {
        setAnalysis(result.data.analysis);
      }
    } catch (err) {
      console.error("Error fetching analysis:", err);
      // Continue gracefully without analysis
    } finally {
      setAnalysisLoading(false);
    }
  };

  const renderResponse = (question: any) => {
    if (!question.response || !question.response.answer) {
      return <span className="text-gray-400 italic">No response provided</span>;
    }

    const answerText = question.response.answer;

    switch (question.questionType) {
      case "TEXT":
      case "TEXTAREA":
        return <p className="whitespace-pre-wrap">{answerText}</p>;

      case "NUMBER":
      case "RATING":
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{answerText}</span>
            {question.questionType === "RATING" && (
              <span className="text-gray-500">/ 5</span>
            )}
          </div>
        );

      case "YESNO":
        return (
          <Badge variant={answerText === "Yes" ? "default" : "secondary"}>
            {answerText}
          </Badge>
        );

      case "DATE":
        return (
          <p>
            {answerText ? new Date(answerText).toLocaleDateString() : "N/A"}
          </p>
        );

      case "MULTIPLE_CHOICE":
      case "CHECKBOX":
        try {
          const values = JSON.parse(answerText);
          return (
            <div className="space-y-2">
              {Array.isArray(values) ? (
                values.map((val: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {val}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">{answerText}</Badge>
              )}
            </div>
          );
        } catch {
          return <p>{answerText}</p>;
        }

      default:
        return <p>{answerText}</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { assignment, template, responses } = data;
  const patientName =
    `${assignment.patient?.firstName || ""} ${assignment.patient?.lastName || ""}`.trim();

  return (
    <div className="space-y-6">
      {onBack && (
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{template.title}</CardTitle>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Patient: <span className="font-semibold">{patientName}</span>
              </p>
            </div>
            <Badge
              variant={
                assignment.status === "COMPLETED" ? "default" : "secondary"
              }
              className="text-base"
            >
              {assignment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Assigned Date</p>
            <p className="font-semibold">{formatDate(assignment.assignedAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="font-semibold">
              {assignment.dueDate
                ? formatDate(assignment.dueDate)
                : "No due date"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Completed Date</p>
            <p className="font-semibold">
              {assignment.completedAt
                ? formatDate(assignment.completedAt)
                : "Not completed"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Questions</p>
            <p className="font-semibold">{template.questions?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Section */}
      {analysisLoading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <p>Analyzing responses...</p>
          </CardContent>
        </Card>
      ) : analysis ? (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Clinical Analysis
                </CardTitle>
              </div>
              <div
                className={`px-4 py-2 rounded-full font-bold text-sm ${getUrgencyColor(analysis.urgency)}`}
              >
                {analysis.urgency} URGENCY
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Score Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Risk Score</p>
                <span className="text-sm font-bold">
                  {analysis.riskScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full transition-all ${
                    analysis.riskScore >= 80
                      ? "bg-red-600"
                      : analysis.riskScore >= 60
                        ? "bg-orange-500"
                        : analysis.riskScore >= 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                  style={{ width: `${analysis.riskScore}%` }}
                />
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {analysis.analysis}
              </p>
            </div>

            {/* Key Findings */}
            {analysis.keyFindings && analysis.keyFindings.length > 0 && (
              <div>
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Key Findings
                </p>
                <ul className="space-y-2">
                  {analysis.keyFindings.map((finding, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-red-500 font-bold">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations &&
              analysis.recommendations.length > 0 && (
                <div>
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Recommendations
                  </p>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-green-600 font-bold">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>
      ) : null}

      {/* Responses */}
      <div className="space-y-4">
        {responses.length === 0 ? (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
            <CardContent className="pt-6">
              <p className="text-yellow-700 dark:text-yellow-400">
                No responses submitted yet
              </p>
            </CardContent>
          </Card>
        ) : (
          responses.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Question {question.questionNumber}
                    </p>
                    <p className="mt-1 text-base font-medium">
                      {question.questionText}
                    </p>
                  </div>

                  <div className="rounded-md bg-gray-50 p-4 dark:bg-slate-900/50">
                    {renderResponse(question)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
