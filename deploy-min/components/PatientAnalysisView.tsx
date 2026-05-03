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
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  Calendar,
  Clock,
  FileUp,
  Download,
} from "lucide-react";
import { uploadFileToAzure } from "@/lib/utils/file-upload";
import { getBlobDownloadUrl } from "@/lib/utils/blob-utils";

interface AnalysisRequest {
  id: string;
  testName: string;
  description?: string;
  status: string;
  requestedAt: string;
  dueDate?: string;
  submittedAt?: string;
  submittedDocumentName?: string;
  submittedDocumentUrl?: string;
  patientNotes?: string;
  doctor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  documentUrl?: string;
  documentName?: string;
}

export default function PatientAnalysisView() {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<AnalysisRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patientNotes, setPatientNotes] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analysis-requests");
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (requestId: string) => {
    if (!uploadedFile) {
      alert("Veuillez importer le document de résultat");
      return;
    }

    try {
      setSubmitting(true);

      // Upload file to Azure
      const uploadResult = await uploadFileToAzure(
        uploadedFile,
        "analysis-responses"
      );
      if (!uploadResult) {
        setSubmitting(false);
        return;
      }

      const response = await fetch(`/api/analysis-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedDocumentUrl: uploadResult.url,
          submittedDocumentName: uploadedFile.name,
          patientNotes: patientNotes || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      alert("Résultats d'analyse soumis avec succès!");
      setSelectedRequest(null);
      setUploadedFile(null);
      setPatientNotes("");
      fetchRequests();
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "SUBMITTED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "En attente",
      IN_PROGRESS: "En cours",
      SUBMITTED: "Soumis",
      APPROVED: "Approuvé",
      COMPLETED: "Complété",
      REJECTED: "Rejeté",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (selectedRequest) {
    return (
      <div className="space-y-6">
        <Button onClick={() => setSelectedRequest(null)} variant="outline">
          ← Retour aux analyses
        </Button>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {selectedRequest.testName}
                </CardTitle>
                <CardDescription className="mt-2">
                  {selectedRequest.description}
                </CardDescription>
              </div>
              <Badge className={getStatusBadgeColor(selectedRequest.status)}>
                {getStatusLabel(selectedRequest.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Demandé par
                </p>
                <p className="font-medium">
                  {selectedRequest.doctor?.firstName}{" "}
                  {selectedRequest.doctor?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date de la demande
                </p>
                <p className="font-medium">
                  {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                </p>
              </div>
              {selectedRequest.dueDate && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Échéance
                  </p>
                  <p className="font-medium">
                    {new Date(selectedRequest.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {selectedRequest.documentUrl && (
              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  📄 Document fourni par le médecin
                </p>
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a
                    href={getBlobDownloadUrl(
                      selectedRequest.documentUrl,
                      selectedRequest.documentName
                    )}
                    download={selectedRequest.documentName}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le formulaire
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Form */}
        {selectedRequest.status !== "SUBMITTED" &&
          selectedRequest.status !== "COMPLETED" && (
            <Card>
              <CardHeader>
                <CardTitle>Soumettre les Résultats</CardTitle>
                <CardDescription>
                  Importez votre document de résultat d'analyse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label htmlFor="result-file" className="dark:text-gray-100">
                    Importer le Document de Résultat *
                  </Label>
                  <Input
                    id="result-file"
                    type="file"
                    onChange={(e) =>
                      setUploadedFile(e.target.files?.[0] || null)
                    }
                    className="dark:text-white dark:bg-slate-900 mt-2"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF, Image ou Document (max 10MB)
                  </p>
                  {uploadedFile && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                      <p className="text-sm font-medium text-green-800 dark:text-green-400">
                        ✓ {uploadedFile.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="dark:text-gray-100">
                    Notes Additionnelles (optionnel)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ajouter des informations supplémentaires sur les résultats..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    rows={3}
                    className="dark:text-white dark:bg-slate-900 mt-2"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleSubmit(selectedRequest.id)}
                    disabled={submitting || !uploadedFile}
                    className="gap-2"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Soumettre les Résultats
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Submitted Results */}
        {selectedRequest.status === "SUBMITTED" && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-green-800 dark:text-green-400 font-medium">
                  ✓ Résultats soumis
                </p>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Soumis le:{" "}
                  {new Date(selectedRequest.submittedAt!).toLocaleDateString()}
                </p>
                {selectedRequest.submittedDocumentName && (
                  <p className="text-sm text-green-700 dark:text-green-500">
                    Document: {selectedRequest.submittedDocumentName}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analyses Médicales</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Consultez et complétez les analyses demandées
        </p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Aucune demande d'analyse pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{request.testName}</CardTitle>
                  <Badge className={getStatusBadgeColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {request.doctor && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Demandé par
                    </p>
                    <p className="font-medium">
                      {request.doctor.firstName} {request.doctor.lastName}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </span>
                </div>

                {request.dueDate && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      Échéance: {new Date(request.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {request.status === "PENDING" && (
                  <Button size="sm" className="w-full gap-2 mt-2">
                    <Upload className="h-4 w-4" />
                    Soumettre les Résultats
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
