"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  X,
  Image as ImageIcon,
  FileImage,
  Activity,
  Droplet,
  Heart,
  Brain,
  Pill,
  ClipboardList,
  FolderOpen,
  Shield,
  ShieldAlert,
} from "lucide-react";

import {
  getDoctorPatientDocuments,
  getDocumentDownloadUrl,
} from "@/lib/actions/azure-storage.actions";
import DocumentActions from "@/components/DocumentActions";

interface PatientDocumentsViewerProps {
  patientId: string;
  doctorUserId: string;
}

const categoryIcons: Record<string, any> = {
  ANALYSIS: Activity,
  IMAGING: ImageIcon,
  PRESCRIPTION: Pill,
  REPORT: ClipboardList,
  DISCHARGE_SUMMARY: FileText,
  CONSULTATION: Heart,
  OTHER: FolderOpen,
};

const categoryLabels: Record<string, string> = {
  ANALYSIS: "Analyses",
  IMAGING: "Imagerie",
  PRESCRIPTION: "Ordonnances",
  REPORT: "Rapports",
  DISCHARGE_SUMMARY: "Résumés de sortie",
  CONSULTATION: "Consultations",
  OTHER: "Autres",
};

export default function PatientDocumentsViewer({
  patientId,
  doctorUserId,
}: PatientDocumentsViewerProps) {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [blockchainStatus, setBlockchainStatus] = useState<
    "active" | "disabled" | "denied" | "error" | "db_fallback" | "loading"
  >("loading");
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [patientId, doctorUserId]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setAccessError(null);
      const result = await getDoctorPatientDocuments(patientId, doctorUserId);
      if (result.success && result.data) {
        setDocuments(result.data);
        setBlockchainStatus(
          (result as any).blockchainStatus ??
            (result.blockchainVerified ? "active" : "disabled")
        );
      } else {
        const status = (result as any).blockchainStatus;
        setBlockchainStatus(status ?? "error");
        setAccessError(result.error ?? null);
        console.error("Error loading documents:", result.error);
      }
    } catch (error) {
      setBlockchainStatus("error");
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleView = async (doc: any) => {
    try {
      const result = await getDocumentDownloadUrl(doc.id);
      if (result.success && result.data) {
        setDocumentUrl(result.data.url);
        setViewingDocument(doc);
      } else {
        alert("Erreur lors du chargement du document");
      }
    } catch (error) {
      console.error("Error getting document URL:", error);
      alert("Erreur lors du chargement du document");
    }
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
    setDocumentUrl(null);
  };

  const handleDownload = async (docId: string) => {
    try {
      const result = await getDocumentDownloadUrl(docId);
      if (result.success && result.data) {
        // Create temporary link to download
        const link = document.createElement("a");
        link.href = result.data.url;
        link.download = result.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Erreur lors du téléchargement");
    }
  };

  const filteredDocuments =
    filterCategory === "all"
      ? documents
      : documents.filter((doc) => doc.category === filterCategory);

  const categories = Array.from(new Set(documents.map((doc) => doc.category)));

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Documents Médicaux
            </h2>
            {blockchainStatus === "active" ? (
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Blockchain Activée</span>
              </div>
            ) : blockchainStatus === "db_fallback" ? (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Accès via DB</span>
              </div>
            ) : blockchainStatus === "denied" ? (
              <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-medium">Accès refusé</span>
              </div>
            ) : blockchainStatus === "error" ? (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-medium">Erreur réseau</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Blockchain Désactivée
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {documents.length} document(s)
          </span>
        </div>

        {/* Access error banner */}
        {accessError &&
          (blockchainStatus === "denied" || blockchainStatus === "error") && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-lg p-3 text-sm ${blockchainStatus === "denied" ? "bg-red-50 text-red-700 border border-red-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{accessError}</span>
            </div>
          )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterCategory === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tous ({documents.length})
            </button>
            {categories.map((category) => {
              const Icon = categoryIcons[category] || FolderOpen;
              const count = documents.filter(
                (doc) => doc.category === category
              ).length;
              return (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterCategory === category
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {categoryLabels[category] || category} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {documents.length === 0
                ? "Aucun document médical disponible"
                : "Aucun document dans cette catégorie"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const Icon = categoryIcons[doc.category] || FileText;
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.originalName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                        {doc.description && (
                          <span className="truncate max-w-xs">
                            {doc.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleView(doc)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <DocumentActions
                      document={{
                        id: doc.id,
                        fileName: doc.originalName,
                        description: doc.description || "",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {viewingDocument.originalName}
                </h3>
                <p className="text-sm text-gray-500">
                  {categoryLabels[viewingDocument.category]} •{" "}
                  {new Date(viewingDocument.uploadedAt).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleDownload(viewingDocument.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={handleCloseViewer}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Fermer"
                  aria-label="Fermer le visualiseur"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 p-4">
              {viewingDocument.fileType === "application/pdf" ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full rounded-lg border border-gray-200"
                  title={viewingDocument.originalName}
                />
              ) : viewingDocument.fileType.startsWith("image/") ? (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={documentUrl}
                    alt={viewingDocument.originalName}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Prévisualisation non disponible pour ce type de fichier
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Type: {viewingDocument.fileType}
                  </p>
                  <button
                    onClick={() => handleDownload(viewingDocument.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le fichier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
