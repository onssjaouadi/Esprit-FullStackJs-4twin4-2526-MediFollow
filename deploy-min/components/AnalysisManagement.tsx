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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search, Download, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadFileToAzure } from "@/lib/utils/file-upload";
import { getBlobDownloadUrl } from "@/lib/utils/blob-utils";
import {
  extractTextFromDocument,
  isExtractableFileType,
} from "@/lib/utils/text-extraction";

const ANALYSIS_TYPES = [
  { value: "BLOOD_TEST", label: "Analyse de sang (NFS, Biochimie)" },
  { value: "URINE_TEST", label: "Analyse d'urine" },
  { value: "IMAGING_XRAY", label: "Radiographie" },
  { value: "IMAGING_CT_SCAN", label: "Scanner CT" },
  { value: "IMAGING_MRI", label: "IRM" },
  { value: "IMAGING_ULTRASOUND", label: "Echographie" },
  { value: "ECG", label: "ECG" },
  { value: "ECHOCARDIOGRAPHY", label: "Echocardiographie" },
  { value: "SPIROMETRY", label: "Spirométrie" },
  { value: "BIOPSY", label: "Biopsie" },
  { value: "CULTURE", label: "Culture" },
  { value: "OTHER", label: "Autre" },
];

// Helper function to get file type from filename
const getFileType = (filename: string): string => {
  if (!filename) return "Fichier inconnu";

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const fileTypeMap: Record<string, string> = {
    // Images
    jpg: "JPEG Image",
    jpeg: "JPEG Image",
    png: "PNG Image",
    gif: "GIF Image",
    bmp: "Bitmap Image",
    svg: "SVG Image",
    webp: "WebP Image",
    tiff: "TIFF Image",
    // Documents
    pdf: "PDF Document",
    doc: "Word Document",
    docx: "Word Document",
    xls: "Excel Spreadsheet",
    xlsx: "Excel Spreadsheet",
    ppt: "PowerPoint Presentation",
    pptx: "PowerPoint Presentation",
    txt: "Text File",
    rtf: "Rich Text File",
    // Medical
    dicom: "DICOM Medical Image",
    dcm: "DICOM Medical Image",
    // Archives
    zip: "ZIP Archive",
    rar: "RAR Archive",
    "7z": "7Z Archive",
    // Default
  };

  return fileTypeMap[ext] || `${ext.toUpperCase()} File`;
};

interface Patient {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AnalysisRequest {
  id: string;
  testName: string;
  status: string;
  requestedAt: string;
  dueDate?: string;
  submittedAt?: string;
  patient?: any;
}

export default function AnalysisManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(
    new Set()
  );
  const [patientSearch, setPatientSearch] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [testName, setTestName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Text extraction states
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    fetchRequests();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log("🔍 Fetching patients...");
      const response = await fetch("/api/patients");
      const data = await response.json();

      console.log("📡 FULL API Response:", data);
      console.log("📡 Response keys:", Object.keys(data));
      console.log(
        "📡 data.data exists?",
        !!data.data,
        "type:",
        typeof data.data
      );
      if (data.data) console.log("📡 data.data length:", data.data.length);

      if (!response.ok) {
        console.error("❌ Error fetching patients:", data.error);
        alert(`Erreur: ${data.error || "Failed to fetch patients"}`);
        return;
      }

      const patientsArray = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      console.log(`✅ Setting patients: ${patientsArray.length} patients`);
      setPatients(patientsArray);
      if (patientsArray.length === 0) {
        console.warn(
          "⚠️ No patients found - make sure you have AccessGrant links"
        );
        // Log current user info
        try {
          const userResponse = await fetch("/api/me");
          const userData = await userResponse.json();
          console.log(
            "👤 Current user:",
            userData?.user?.email,
            `(${userData?.user?.role})`
          );
          console.log("   User ID:", userData?.user?.id);
        } catch (e) {
          console.log("Could not fetch user info:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert(
        `Erreur: ${error instanceof Error ? error.message : "Failed to fetch patients"}`
      );
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analysis-requests");
      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching requests:", data.error);
        alert(`Erreur: ${data.error || "Failed to fetch requests"}`);
        return;
      }

      setRequests(data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      alert(
        `Erreur: ${error instanceof Error ? error.message : "Failed to fetch requests"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (
    blobUrl: string | undefined,
    fileName: string | undefined,
    documentType: string
  ) => {
    console.log(`🔵 Download initiated:`, { blobUrl, fileName, documentType });

    if (!blobUrl) {
      alert(`❌ ${documentType} not available`);
      return;
    }

    if (!fileName) {
      fileName = `${documentType}-${Date.now()}`;
    }

    try {
      const downloadUrl = getBlobDownloadUrl(blobUrl, fileName);

      if (!downloadUrl) {
        alert(`❌ Invalid download URL for ${documentType}`);
        return;
      }

      console.log(`✅ Downloading from:`, downloadUrl);

      // Use fetch to handle errors properly
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Download failed:`, response.status, errorData);
        alert(
          `❌ Impossible de télécharger: ${errorData.error || response.statusText}`
        );
        return;
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Download completed:`, fileName);
    } catch (error) {
      console.error(`❌ Download error:`, error);
      alert(
        `❌ Impossible de télécharger: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleAssign = async () => {
    if (!analysisType || !testName || selectedPatients.size === 0) {
      alert(
        "Veuillez remplir tous les champs requis et sélectionner au moins un patient"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload document if provided
      let documentUrl: string | null = null;
      let documentName: string | null = null;

      if (documentFile) {
        const uploadResult = await uploadFileToAzure(
          documentFile,
          "analysis-requests"
        );
        if (uploadResult) {
          documentUrl = uploadResult.url;
          documentName = uploadResult.name;
        } else {
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch("/api/analysis-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientIds: Array.from(selectedPatients),
          analysisType,
          testName,
          description: description || null,
          dueDate: dueDate || null,
          documentUrl,
          documentName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        alert(`Erreur: ${data.error || "Failed to create request"}`);
        return;
      }

      alert(`✓ Demande d'analyse créée pour ${data.count} patient(s)`);

      setAssignDialogOpen(false);
      setSelectedPatients(new Set());
      setAnalysisType("");
      setTestName("");
      setDescription("");
      setDueDate("");
      setDocumentFile(null);

      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
      alert(
        `Erreur: ${error instanceof Error ? error.message : "Failed to create request"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
    // Reset extraction state when opening new request
    setExtractedText(null);
    setExtractionError(null);
    setExtractionProgress(0);
  };

  const handleExtractText = async () => {
    if (
      !selectedRequest?.submittedDocumentUrl ||
      !selectedRequest?.submittedDocumentName
    ) {
      setExtractionError("Pas de document disponible");
      return;
    }

    // Check if file type is supported
    if (!isExtractableFileType(selectedRequest.submittedDocumentName)) {
      setExtractionError(
        `Format de fichier non supporté pour l'extraction: ${selectedRequest.submittedDocumentName.split(".").pop()?.toUpperCase()}`
      );
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractedText(null);

    try {
      console.log(
        "🔍 Starting text extraction from:",
        selectedRequest.submittedDocumentName
      );

      const result = await extractTextFromDocument(
        selectedRequest.submittedDocumentUrl,
        selectedRequest.submittedDocumentName,
        (progress) => {
          setExtractionProgress(Math.round(progress * 100));
          console.log(`📊 Extraction progress: ${Math.round(progress * 100)}%`);
        }
      );

      if (result.success && result.text) {
        setExtractedText(result.text);
        console.log(
          `✅ Text extracted successfully (${result.text.length} characters)`
        );
      } else {
        setExtractionError("Une erreur est survenue lors de l'extraction");
      }
    } catch (error) {
      let errorMsg = "Erreur lors de l'extraction";

      if (error instanceof Error) {
        console.error("❌ Text extraction failed:", error.message, error);
        errorMsg = error.message;

        // Better error messages for common issues
        if (
          error.message.includes("CORS") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMsg =
            "Impossible de télécharger l'image. Vérifiez que le document est accessible.";
        } else if (error.message.includes("Unsupported")) {
          errorMsg = error.message;
        }
      } else {
        console.error("❌ Text extraction failed:", error);
      }

      setExtractionError(errorMsg);
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
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

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analyses Médicales</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérer les demandes d'analyses pour vos patients
          </p>
        </div>
        <Button onClick={() => setAssignDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle Demande
        </Button>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Demandes d'Analyses</CardTitle>
            <CardDescription>
              Toutes vos demandes d'analyses médicales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune demande d'analyse
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Analyse
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Date Demande
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Échéance
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="px-4 py-3">
                          {request.patient
                            ? `${request.patient.user?.firstName} ${request.patient.user?.lastName}`
                            : "Unknown"}
                        </td>
                        <td className="px-4 py-3">{request.testName}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {request.dueDate
                            ? new Date(request.dueDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                          >
                            Voir
                          </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Créer une Demande d'Analyse</DialogTitle>
            <DialogDescription>
              Demander une analyse médicale à vos patients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 px-1">
            {/* Analysis Type */}
            <div>
              <Label htmlFor="analysis-type" className="dark:text-gray-100">
                Type d'Analyse *
              </Label>
              <select
                id="analysis-type"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                aria-label="Type d'Analyse"
                className="w-full mt-2 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un type</option>
                {ANALYSIS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Name */}
            <div>
              <Label htmlFor="test-name" className="dark:text-gray-100">
                Nom du Test *
              </Label>
              <Input
                id="test-name"
                placeholder="ex: NFS, Analyse Biochimique..."
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="dark:text-white dark:bg-slate-900"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="dark:text-gray-100">
                Description/Notes
              </Label>
              <Textarea
                id="description"
                placeholder="Raison de la demande, notes importantes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="dark:text-white dark:bg-slate-900"
              />
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due-date" className="dark:text-gray-100">
                Date Limite (optionnel)
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="dark:text-white dark:bg-slate-900"
              />
            </div>

            {/* Document Upload */}
            <div>
              <Label htmlFor="document" className="dark:text-gray-100">
                Document Demande (optionnel)
              </Label>
              <Input
                id="document"
                type="file"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                className="dark:text-white dark:bg-slate-900"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formulaire de demande d'analyse, ordonnance, etc.
              </p>
            </div>

            {/* Patient Selection */}
            <div>
              <Label htmlFor="patient-search" className="dark:text-gray-100">
                Sélectionner Patients *
              </Label>

              {patients.length === 0 ? (
                <div className="mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    ⚠️ Aucun patient trouvé. Assurez-vous d'avoir des liens
                    d'accès (AccessGrant) établis avec vos patients d'abord.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative mt-2 mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="patient-search"
                      placeholder="Rechercher par email ou nom..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="pl-10 dark:text-white dark:bg-slate-900"
                    />
                  </div>

                  {/* Patient List */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-950 max-h-48 overflow-y-auto space-y-2">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-900"
                        >
                          <Checkbox
                            id={`patient-${patient.id}`}
                            checked={selectedPatients.has(patient.id)}
                            onCheckedChange={() =>
                              handlePatientToggle(patient.id)
                            }
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
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        Aucun patient trouvé
                      </div>
                    )}
                  </div>

                  {selectedPatients.size > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {selectedPatients.size} patient(s) sélectionné(s)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Buttons - Fixed at bottom */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selectedPatients.size === 0 || isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Envoi..." : "Créer la Demande"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Détails de la Demande d'Analyse</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 overflow-y-auto flex-1 px-1">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Patient
                  </p>
                  <p className="font-medium dark:text-gray-100">
                    {selectedRequest.patient?.user?.firstName}{" "}
                    {selectedRequest.patient?.user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type d'Analyse
                  </p>
                  <p className="font-medium dark:text-gray-100">
                    {selectedRequest.analysisType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test
                  </p>
                  <p className="font-medium dark:text-gray-100">
                    {selectedRequest.testName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Statut
                  </p>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date Demande
                  </p>
                  <p className="font-medium dark:text-gray-100">
                    {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedRequest.dueDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Échéance
                    </p>
                    <p className="font-medium dark:text-gray-100">
                      {new Date(selectedRequest.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRequest.submittedAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date Soumission
                    </p>
                    <p className="font-medium dark:text-gray-100">
                      {new Date(
                        selectedRequest.submittedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedRequest.description && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Description
                  </p>
                  <p className="font-medium dark:text-gray-100 whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {/* Doctor's Document */}
              {selectedRequest.documentUrl && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    📄 Document Demande
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        selectedRequest.documentUrl,
                        selectedRequest.documentName,
                        "Document Demande"
                      )
                    }
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {selectedRequest.documentName || "Télécharger le document"}
                  </Button>
                </div>
              )}

              {/* Patient Submission */}
              {selectedRequest.status !== "PENDING" && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    📋 Réponse Patient
                  </p>

                  {selectedRequest.submittedDocumentUrl && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        📋 Document Résultat
                      </p>
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownload(
                              selectedRequest.submittedDocumentUrl,
                              selectedRequest.submittedDocumentName,
                              "Document Résultat"
                            )
                          }
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {selectedRequest.submittedDocumentName ||
                            "Télécharger le résultat"}
                        </Button>

                        {/* Extract Text Button */}
                        {isExtractableFileType(
                          selectedRequest.submittedDocumentName || ""
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExtractText}
                            disabled={isExtracting}
                            className="gap-2"
                          >
                            {isExtracting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {extractionProgress}%
                              </>
                            ) : extractedText ? (
                              <>
                                <Eye className="h-4 w-4" />
                                Texte extrait
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Extraire le texte
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Type :{" "}
                        {getFileType(
                          selectedRequest.submittedDocumentName || ""
                        )}
                      </p>

                      {/* Extraction Error */}
                      {extractionError && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
                          {extractionError}
                        </div>
                      )}

                      {/* Extracted Text Display */}
                      {extractedText && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            📝 Texte extrait:
                          </p>
                          <div className="max-h-48 overflow-y-auto">
                            <p className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap break-words font-mono">
                              {extractedText}
                            </p>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            {extractedText.length} caractères extraits
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRequest.patientNotes && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Notes du Patient
                      </p>
                      <p className="text-sm dark:text-gray-200 bg-gray-50 dark:bg-slate-900 p-2 rounded whitespace-pre-wrap">
                        {selectedRequest.patientNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
