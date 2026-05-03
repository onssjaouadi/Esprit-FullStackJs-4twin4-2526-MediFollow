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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  FileText,
  Users,
  Calendar,
  Copy,
  Trash2,
  SendIcon,
  Search,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CreateQuestionnaire from "@/components/CreateQuestionnaire";
import ResponseViewer from "@/components/ResponseViewer";

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
}

interface Template {
  id: string;
  title: string;
  description?: string;
  specialty: string;
  isAiGenerated: boolean;
  isPublished: boolean;
  createdAt: string;
  questions: Question[];
  _count?: {
    assignments: number;
  };
}

interface Patient {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface Assignment {
  id: string;
  status: string;
  assignedAt: string;
  dueDate?: string;
  templateId: string;
  patientId: string;
  template?: Template;
  patient?: any;
}

export default function QuestionnaireManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"templates" | "assignments">(
    "templates"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(
    new Set()
  );
  const [patientSearch, setPatientSearch] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({});
  const [analysisLoading, setAnalysisLoading] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchTemplates();
    fetchPatients();
    fetchAssignments();
  }, []);

  // Re-fetch patients when assign dialog opens
  useEffect(() => {
    if (assignDialogOpen) {
      fetchPatients();
    }
  }, [assignDialogOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/questionnaires/templates");

      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      setTemplates(data.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");

      if (!response.ok) throw new Error("Failed to fetch patients");

      const data = await response.json();
      setPatients(data.data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/questionnaires/assignments");

      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      const assignments = data.data || [];
      setAssignments(assignments);

      // Fetch analysis for each completed assignment
      assignments.forEach((assignment: Assignment) => {
        if (assignment.status === "COMPLETED") {
          fetchAnalysis(assignment.id);
        }
      });
    } catch (error) {
      console.error("Error fetching assignments:", error);
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

  const handleAssign = async () => {
    if (!selectedTemplate || selectedPatients.size === 0) {
      alert("Please select at least one patient to assign the questionnaire");
      return;
    }

    const patientIds = Array.from(selectedPatients);

    try {
      const response = await fetch("/api/questionnaires/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          patientIds,
          dueDate: dueDate || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign questionnaire");

      const data = await response.json();
      alert(`Successfully assigned to ${data.count} patient(s)`);

      setAssignDialogOpen(false);
      setSelectedPatients(new Set());
      setPatientSearch("");
      setDueDate("");
      fetchTemplates(); // Refresh
      fetchAssignments(); // Refresh assignments table
    } catch (error) {
      console.error("Error assigning questionnaire:", error);
      alert("Failed to assign questionnaire");
    }
  };

  const handlePatientToggle = (patientId: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = patientSearch.toLowerCase();
    return (
      patient.user.email.toLowerCase().includes(searchLower) ||
      patient.user.firstName.toLowerCase().includes(searchLower) ||
      patient.user.lastName.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (templateId: string) => {
    if (confirm("Are you sure you want to delete this questionnaire?")) {
      try {
        const response = await fetch(
          `/api/questionnaires/templates/${templateId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete");

        alert("Questionnaire deleted");
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete questionnaire");
      }
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const response = await fetch("/api/questionnaires/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${template.title} (Copy)`,
          description: template.description,
          specialty: template.specialty,
          questions: template.questions.map((q) => ({
            questionText: q.questionText,
            questionType: "TEXT",
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to duplicate");

      alert("Questionnaire duplicated successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error duplicating:", error);
      alert("Failed to duplicate questionnaire");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Questionnaires</h1>
          <p className="text-gray-600 mt-1">
            Create and manage patient questionnaires
          </p>
        </div>
        <CreateQuestionnaire onSuccess={fetchTemplates} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "templates"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "assignments"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <>
          {/* Templates Grid */}
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {template.title}
                        </CardTitle>
                        {template.description && (
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{template.specialty}</Badge>
                      {template.isAiGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{template.questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {template._count?.assignments || 0} assigned
                        </span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-gray-500">
                      Created{" "}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setAssignDialogOpen(true);
                        }}
                        className="flex-1 gap-2"
                      >
                        <SendIcon className="h-4 w-4" />
                        Assign
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  No questionnaires created yet
                </p>
                <CreateQuestionnaire onSuccess={fetchTemplates} />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Questionnaires</CardTitle>
            <CardDescription>
              View all questionnaires assigned to your patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No questionnaires assigned yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Questionnaire
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Assigned Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Urgency
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {assignments.map((assignment) => (
                      <tr
                        key={assignment.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {assignment.patient
                            ? `${assignment.patient.firstName} ${assignment.patient.lastName}`
                            : "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {assignment.template?.title}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : "No deadline"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              assignment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : assignment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }
                          >
                            {assignment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {analysisMap[assignment.id] ? (
                            <div
                              className={`px-3 py-1 rounded text-xs font-bold ${getUrgencyColor(analysisMap[assignment.id].urgency)}`}
                            >
                              {analysisMap[assignment.id].urgency}
                            </div>
                          ) : analysisLoading.has(assignment.id) ? (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Analyzing...
                            </div>
                          ) : assignment.status === "COMPLETED" ? (
                            <span className="text-gray-400 text-xs">-</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          {assignment.status === "COMPLETED" ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              100%
                            </span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {assignment.status === "COMPLETED" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedAssignmentId(assignment.id)
                              }
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign Questionnaire</DialogTitle>
            <DialogDescription>
              Assign "{selectedTemplate?.title}" to patients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient Search */}
            <div>
              <Label htmlFor="patient-search" className="dark:text-gray-100">
                Search Patients
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="patient-search"
                  placeholder="Search by email, name..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-10 dark:text-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-950">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <Checkbox
                      id={`patient-${patient.id}`}
                      checked={selectedPatients.has(patient.id)}
                      onCheckedChange={() => handlePatientToggle(patient.id)}
                    />
                    <label
                      htmlFor={`patient-${patient.id}`}
                      className="flex-1 cursor-pointer text-sm dark:text-gray-200"
                    >
                      <div className="font-medium dark:text-gray-100">
                        {patient.user.firstName} {patient.user.lastName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {patient.user.email}
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No patients found
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedPatients.size > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPatients.size} patient(s) selected
              </div>
            )}

            {/* Due Date */}
            <div>
              <Label htmlFor="due-date" className="dark:text-gray-100">
                Due Date (optional)
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="dark:text-white dark:bg-slate-900"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAssignDialogOpen(false);
                  setSelectedPatients(new Set());
                  setPatientSearch("");
                  setDueDate("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedPatients.size === 0}
              >
                Assign Questionnaire
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Viewer Modal */}
      <Dialog
        open={!!selectedAssignmentId}
        onOpenChange={(open) => {
          if (!open) setSelectedAssignmentId(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle>Questionnaire Responses</DialogTitle>
              {selectedAssignmentId && analysisMap[selectedAssignmentId] && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyColor(analysisMap[selectedAssignmentId].urgency)}`}
                >
                  {analysisMap[selectedAssignmentId].urgency}
                </div>
              )}
            </div>
          </DialogHeader>
          {selectedAssignmentId && (
            <ResponseViewer
              assignmentId={selectedAssignmentId}
              onBack={() => setSelectedAssignmentId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
