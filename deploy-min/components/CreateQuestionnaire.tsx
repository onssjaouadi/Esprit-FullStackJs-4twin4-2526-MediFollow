"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Sparkles } from "lucide-react";

type MedicalSpecialty =
  | "CARDIOLOGY"
  | "NEUROLOGY"
  | "ORTHOPEDICS"
  | "PULMONOLOGY"
  | "GASTROENTEROLOGY"
  | "ENDOCRINOLOGY"
  | "RHEUMATOLOGY"
  | "NEPHROLOGY"
  | "HEMATOLOGY"
  | "ONCOLOGY"
  | "PSYCHIATRY"
  | "DERMATOLOGY"
  | "ENT"
  | "OPHTHALMOLOGY"
  | "GENERAL_MEDICINE"
  | "OTHER";

const SPECIALTIES: { value: MedicalSpecialty; label: string }[] = [
  { value: "CARDIOLOGY", label: "Cardiology" },
  { value: "NEUROLOGY", label: "Neurology" },
  { value: "ORTHOPEDICS", label: "Orthopedics" },
  { value: "PULMONOLOGY", label: "Pulmonology" },
  { value: "GASTROENTEROLOGY", label: "Gastroenterology" },
  { value: "ENDOCRINOLOGY", label: "Endocrinology" },
  { value: "RHEUMATOLOGY", label: "Rheumatology" },
  { value: "NEPHROLOGY", label: "Nephrology" },
  { value: "HEMATOLOGY", label: "Hematology" },
  { value: "ONCOLOGY", label: "Oncology" },
  { value: "PSYCHIATRY", label: "Psychiatry" },
  { value: "DERMATOLOGY", label: "Dermatology" },
  { value: "ENT", label: "ENT (Ear, Nose, Throat)" },
  { value: "OPHTHALMOLOGY", label: "Ophthalmology" },
  { value: "GENERAL_MEDICINE", label: "General Medicine" },
  { value: "OTHER", label: "Other" },
];

interface Question {
  questionText: string;
  questionType: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

interface CreateQuestionnaireProps {
  onSuccess?: () => void;
}

export default function CreateQuestionnaire({
  onSuccess,
}: CreateQuestionnaireProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"create" | "ai">("create");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialty, setSpecialty] =
    useState<MedicalSpecialty>("GENERAL_MEDICINE");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");

  // Add question to list
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        questionType: "TEXT",
        isRequired: true,
      },
    ]);
  };

  // Update question
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Generate questions with AI
  const handleAiGenerate = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/questionnaires/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, customPrompt }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const data = await response.json();
      setGeneratedQuestions(data.data.questions);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Use generated questions
  const useGeneratedQuestions = () => {
    setQuestions(generatedQuestions);
    setTab("create");
    setGeneratedQuestions([]);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!title || !specialty || questions.length === 0) {
      alert("Please fill in title, specialty, and add at least one question");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/questionnaires/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          specialty,
          questions,
          isAiGenerated: tab === "ai",
          aiPrompt: customPrompt || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create questionnaire");

      alert("Questionnaire created successfully!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      alert("Failed to create questionnaire");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSpecialty("GENERAL_MEDICINE");
    setQuestions([]);
    setGeneratedQuestions([]);
    setCustomPrompt("");
    setTab("create");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Questionnaire
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Questionnaire</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={tab === "create" ? "default" : "outline"}
              onClick={() => setTab("create")}
            >
              Manual Create
            </Button>
            <Button
              variant={tab === "ai" ? "default" : "outline"}
              onClick={() => setTab("ai")}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </div>

          {tab === "create" ? (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label>Questionnaire Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Post-Surgery Recovery Assessment"
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              {/* Specialty */}
              <div>
                <Label>Medical Specialty *</Label>
                <Select
                  value={specialty}
                  onValueChange={(v) => setSpecialty(v as MedicalSpecialty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Questions *</Label>
                  <Button variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <QuestionEditor
                      key={idx}
                      question={q}
                      index={idx}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                    />
                  ))}
                </div>

                {questions.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Questionnaire
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Specialty for AI */}
              <div>
                <Label>Medical Specialty *</Label>
                <Select
                  value={specialty}
                  onValueChange={(v) => setSpecialty(v as MedicalSpecialty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label>Questionnaire Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cardiology Follow-up Assessment"
                />
              </div>

              {/* Custom Prompt */}
              <div>
                <Label>Custom Instructions (Optional)</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add any specific requirements or focus areas for the questions"
                  rows={3}
                />
              </div>

              {/* Generated Questions */}
              {generatedQuestions.length > 0 && (
                <div>
                  <Label>Preview Generated Questions</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {generatedQuestions.map((q, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-4">
                          <p className="font-medium text-sm">
                            {idx + 1}. {q.questionText}
                          </p>
                          <Badge className="mt-2" variant="outline">
                            {q.questionType}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 justify-end">
                {generatedQuestions.length > 0 ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedQuestions([])}
                    >
                      Regenerate
                    </Button>
                    <Button onClick={useGeneratedQuestions}>
                      Use These Questions
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAiGenerate} disabled={aiLoading}>
                      {aiLoading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Generate Questions
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Question Editor Component
function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
}: {
  question: Question;
  index: number;
  onUpdate: (index: number, updates: Partial<Question>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Question {index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          </div>

          <Input
            value={question.questionText}
            onChange={(e) => onUpdate(index, { questionText: e.target.value })}
            placeholder="Enter question text"
          />

          <div className="flex gap-2">
            <Select
              value={question.questionType}
              onValueChange={(v) => onUpdate(index, { questionType: v })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="TEXTAREA">Long Text</SelectItem>
                <SelectItem value="NUMBER">Number</SelectItem>
                <SelectItem value="RATING">Rating (1-10)</SelectItem>
                <SelectItem value="YESNO">Yes/No</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                <SelectItem value="DATE">Date</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.isRequired ?? true}
                onChange={(e) =>
                  onUpdate(index, { isRequired: e.target.checked })
                }
              />
              <span className="text-sm">Required</span>
            </label>
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300 block mb-2">
              Help Text (optional)
            </label>
            <Input
              value={question.helpText || ""}
              onChange={(e) => onUpdate(index, { helpText: e.target.value })}
              placeholder="Additional help text for the question"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
