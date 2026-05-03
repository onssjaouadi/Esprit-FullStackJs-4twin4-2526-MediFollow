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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Clock, Mic } from "lucide-react";
import { VoiceQuestionnaireForm } from "./VoiceQuestionnaireForm";

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

interface QuestionnaireTemplate {
  id: string;
  title: string;
  description?: string;
  specialty: string;
  questions: Question[];
}

interface Assignment {
  id: string;
  status: string;
  dueDate?: string;
  template: QuestionnaireTemplate;
}

interface PatientQuestionnaireProps {
  assignmentId?: string;
  onSubmitSuccess?: () => void;
}

export default function PatientQuestionnaire({
  assignmentId,
  onSubmitSuccess,
}: PatientQuestionnaireProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  // Helper function to parse options from strings if needed
  const parseOptions = (
    options: any
  ): Array<{ value: string; label: string }> => {
    if (!options) return [];

    return options.map((opt: any) => {
      // If it's already an object with value and label, return as-is
      if (typeof opt === "object" && opt.value && opt.label) {
        return opt;
      }
      // If it's a JSON string, parse it
      if (typeof opt === "string") {
        try {
          return JSON.parse(opt);
        } catch (e) {
          // If parse fails, return as fallback
          return { value: opt, label: opt };
        }
      }
      // Fallback
      return opt;
    });
  };

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questionnaires/assign?assignmentId=${assignmentId}`
      );

      if (!response.ok) throw new Error("Failed to fetch questionnaire");

      const data = await response.json();
      const assignmentData = data.data[0];

      // Parse options for all questions
      if (
        assignmentData &&
        assignmentData.template &&
        assignmentData.template.questions
      ) {
        assignmentData.template.questions =
          assignmentData.template.questions.map((q: Question) => ({
            ...q,
            options: parseOptions(q.options),
          }));
      }

      setAssignment(assignmentData);

      // Initialize responses
      const initialResponses: Record<string, any> = {};
      assignmentData.template.questions.forEach((q: Question) => {
        initialResponses[q.id] = "";
      });
      setResponses(initialResponses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load questionnaire"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const getProgressPercentage = () => {
    if (!assignment) return 0;
    const requiredQuestions = assignment.template.questions.filter(
      (q) => q.isRequired
    );
    const answered = requiredQuestions.filter((q) => responses[q.id]).length;
    return (answered / requiredQuestions.length) * 100;
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    // Validate required fields
    const requiredQuestions = assignment.template.questions.filter(
      (q) => q.isRequired
    );
    const unanswered = requiredQuestions.filter((q) => !responses[q.id]);

    if (unanswered.length > 0) {
      alert(
        `Please answer all required questions (${unanswered.length} remaining)`
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Format responses based on question type
      const formattedResponses = assignment.template.questions.map(
        (question) => {
          const value = responses[question.id];
          let answer: string | null = null;

          // Format based on question type
          switch (question.questionType) {
            case "YESNO":
              // Convert boolean to "Yes"/"No" string
              answer = value === true ? "Yes" : value === false ? "No" : null;
              break;

            case "RATING":
            case "NUMBER":
              // Store as string
              answer = value ? String(value) : null;
              break;

            case "CHECKBOX":
              // Store as JSON array string
              answer =
                value && Array.isArray(value) ? JSON.stringify(value) : null;
              break;

            case "MULTIPLE_CHOICE":
            case "DATE":
            case "TEXT":
            case "TEXTAREA":
            default:
              // Store as text
              answer = value ? String(value) : null;
              break;
          }

          return {
            questionId: question.id,
            responseText: answer, // Send as responseText to API compatibility
            responseNumber: answer,
            responseJson: answer,
          };
        }
      );

      const response = await fetch("/api/questionnaires/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          responses: formattedResponses,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to submit" }));
        throw new Error(errorData.error || "Failed to submit responses");
      }

      // Mark as submitted and update assignment status
      setSubmitted(true);
      setAssignment({
        ...assignment,
        status: "COMPLETED",
      });

      // Call success callback after 2 seconds
      setTimeout(() => {
        onSubmitSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit questionnaire";
      setError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceSubmit = async (voiceData: Record<string, any>) => {
    if (!assignment) return;

    setSubmitting(true);
    setError(null);
    try {
      // Format voice responses based on question type
      const formattedResponses = assignment.template.questions.map(
        (question) => {
          const value = voiceData[question.id];
          let answer: string | null = null;

          // Format based on question type
          switch (question.questionType) {
            case "YESNO":
              // Convert boolean to "Yes"/"No" string
              answer = value === true ? "Yes" : value === false ? "No" : null;
              break;

            case "RATING":
            case "NUMBER":
              // Store as string
              answer = value ? String(value) : null;
              break;

            case "CHECKBOX":
              // Store as JSON array string
              answer =
                value && Array.isArray(value) ? JSON.stringify(value) : null;
              break;

            case "MULTIPLE_CHOICE":
            case "DATE":
            case "TEXT":
            case "TEXTAREA":
            default:
              // Store as text
              answer = value ? String(value) : null;
              break;
          }

          return {
            questionId: question.id,
            responseText: answer,
            responseNumber: answer,
            responseJson: answer,
          };
        }
      );

      const response = await fetch("/api/questionnaires/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          responses: formattedResponses,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to submit" }));
        throw new Error(errorData.error || "Failed to submit responses");
      }

      // Mark as submitted and update assignment status
      setSubmitted(true);
      setAssignment({
        ...assignment,
        status: "COMPLETED",
      });

      // Speak success message
      const utterance = new SpeechSynthesisUtterance(
        "Vos réponses ont été enregistrées avec succès!"
      );
      utterance.lang = "fr-FR";
      window.speechSynthesis.speak(utterance);

      // Call success callback after 2 seconds
      setTimeout(() => {
        onSubmitSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit questionnaire";
      setError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Show voice form if voiceMode is enabled
  if (voiceMode && assignment) {
    return (
      <VoiceQuestionnaireForm
        questions={assignment.template.questions}
        questionnaireName={assignment.template.title}
        onSubmit={handleVoiceSubmit}
        onCancel={() => setVoiceMode(false)}
      />
    );
  }

  if (error || !assignment) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error || "Questionnaire not found"}</p>
        </CardContent>
      </Card>
    );
  }

  const { template, status, dueDate } = assignment;
  const isCompleted = status === "COMPLETED" || submitted;
  const progress = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <CardTitle>{template.title}</CardTitle>
              {template.description && (
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              )}
            </div>
            {!isCompleted && (
              <Button
                onClick={() => setVoiceMode(true)}
                variant="outline"
                className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Mic className="h-4 w-4" />
                Mode Vocal
              </Button>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>

          {/* Status and Due Date */}
          <div className="flex gap-4 mt-4">
            <Badge variant="outline">{template.specialty}</Badge>
            {dueDate && (
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {!isCompleted && (
            <>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </>
          )}
        </CardHeader>
      </Card>

      {/* Questions */}
      {!isCompleted ? (
        <div className="space-y-4">
          {template.questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={responses[question.id]}
              onChange={(value) => handleResponseChange(question.id, value)}
            />
          ))}

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Save Draft</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Questionnaire
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
              <div>
                <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
                  Questionnaire Submitted Successfully!
                </p>
                <p className="text-green-600 dark:text-green-500 text-sm mt-1">
                  Your responses have been recorded and sent to your healthcare
                  provider.
                </p>
              </div>
              <div className="text-xs text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 rounded p-2">
                <p className="font-medium">
                  Total Questions: {template.questions.length}
                </p>
                <p>
                  Thank you for taking the time to complete this questionnaire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Question Field Component
function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <label className="font-medium">
              {question.questionNumber}. {question.questionText}
              {question.isRequired && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
          </div>

          {question.helpText && (
            <p className="text-sm text-gray-600">{question.helpText}</p>
          )}

          {/* Text Input */}
          {question.questionType === "TEXT" && (
            <Input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your answer"
              maxLength={question.maxLength}
            />
          )}

          {/* Textarea */}
          {question.questionType === "TEXTAREA" && (
            <Textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your answer"
              rows={4}
              maxLength={question.maxLength}
            />
          )}

          {/* Number Input */}
          {question.questionType === "NUMBER" && (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter a number"
              min={question.minValue}
              max={question.maxValue}
            />
          )}

          {/* Rating */}
          {question.questionType === "RATING" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => onChange(num)}
                  className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                    value === num
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:border-blue-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {/* Yes/No */}
          {question.questionType === "YESNO" && (
            <div className="flex gap-2">
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map((option) => (
                <Button
                  key={String(option.value)}
                  variant={value === option.value ? "default" : "outline"}
                  onClick={() => onChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {/* Multiple Choice */}
          {question.questionType === "MULTIPLE_CHOICE" && question.options && (
            <Select value={value || ""} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Checkbox */}
          {question.questionType === "CHECKBOX" && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${question.id}-${option.value}`}
                    checked={(value || []).includes(option.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(value || []), option.value]
                        : (value || []).filter(
                            (v: string) => v !== option.value
                          );
                      onChange(newValue);
                    }}
                  />
                  <label htmlFor={`${question.id}-${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Date */}
          {question.questionType === "DATE" && (
            <Input
              type="date"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
