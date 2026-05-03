"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Download,
  Eye,
  ChevronRight,
  Calendar,
  Upload as UploadIcon,
  Activity,
  Droplet,
  Heart,
  Brain,
  Trash2,
  Image as ImageIcon,
  FileImage,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getCurrentUserDocuments,
  deleteDocument,
  getDocumentDownloadUrl,
} from "@/lib/actions/azure-storage.actions";
import FileUploadMedical from "@/components/FileUploadMedical";

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      // Load documents from database using server action
      const result = await getCurrentUserDocuments(user.id);
      if (result.success && result.data) {
        setDocuments(result.data);
        if (result.patientId) {
          setPatientId(result.patientId);
        }
      } else {
        console.error("Error loading documents:", result.error);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSuccess = () => {
    // Reload documents after successful upload
    loadDocuments();
    setShowUpload(false);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    const result = await deleteDocument(documentId);
    if (result.success) {
      // Reload documents
      loadDocuments();
    } else {
      alert("Erreur lors de la suppression: " + result.error);
    }
  };

  const handleView = async (doc: any) => {
    const result = await getDocumentDownloadUrl(doc.id);
    if (result.success && result.data) {
      setViewingDocument(doc);
      setDocumentUrl(result.data.url);
    } else {
      alert("Erreur lors du chargement: " + result.error);
    }
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
    setDocumentUrl(null);
  };

  const handleDownload = async (documentId: string) => {
    const result = await getDocumentDownloadUrl(documentId);
    if (result.success && result.data) {
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = result.data.url;
      link.download = result.data.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Erreur lors du téléchargement: " + result.error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ANALYSIS":
        return <Droplet size={20} className="text-blue-600" />;
      case "IMAGING":
        return <Brain size={20} className="text-purple-600" />;
      case "PRESCRIPTION":
        return <FileText size={20} className="text-green-600" />;
      case "REPORT":
        return <Activity size={20} className="text-orange-600" />;
      case "DISCHARGE_SUMMARY":
        return <Heart size={20} className="text-red-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ANALYSIS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "IMAGING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "PRESCRIPTION":
        return "bg-green-50 text-green-700 border-green-200";
      case "REPORT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "DISCHARGE_SUMMARY":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ANALYSIS: "Analyses",
      IMAGING: "Imagerie",
      PRESCRIPTION: "Ordonnances",
      REPORT: "Rapports",
      DISCHARGE_SUMMARY: "Résumé sortie",
      CONSULTATION: "Consultations",
      OTHER: "Autre",
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredDocuments = documents
    .filter((doc) =>
      filterCategory === "all" ? true : doc.category === filterCategory
    )
    .filter(
      (doc) =>
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description &&
          doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const categories = [
    "ANALYSIS",
    "IMAGING",
    "PRESCRIPTION",
    "REPORT",
    "DISCHARGE_SUMMARY",
  ];
  const totalDocuments = documents.length;
  const recentDocuments = documents.filter(
    (d) =>
      new Date(d.uploadedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 dark:border-gray-400 border-t-transparent dark:border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  {viewingDocument.fileType.includes("image") ? (
                    <ImageIcon size={20} className="text-gray-900" />
                  ) : (
                    <FileText size={20} className="text-gray-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {viewingDocument.originalName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(viewingDocument.fileSize)} •{" "}
                    {getCategoryLabel(viewingDocument.category)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(viewingDocument.id)}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Télécharger
                </button>
                <button
                  onClick={handleCloseViewer}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Fermer"
                  title="Fermer"
                >
                  <X size={20} className="text-gray-900" />
                </button>
              </div>
            </div>

            {/* Document Display */}
            <div className="h-full pt-24 pb-4">
              <div className="h-full bg-white rounded-xl overflow-hidden shadow-2xl">
                {viewingDocument.fileType === "application/pdf" ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-full border-0"
                    title={viewingDocument.originalName}
                  />
                ) : viewingDocument.fileType.includes("image") ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 overflow-auto">
                    <img
                      src={documentUrl}
                      alt={viewingDocument.originalName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                      <FileText
                        size={64}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Aperçu non disponible
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Ce type de fichier ne peut pas être affiché dans le
                        navigateur
                      </p>
                      <button
                        onClick={() => handleDownload(viewingDocument.id)}
                        className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        Télécharger pour voir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Search Bar - YouTube Style */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un document médical..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-2.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-400 dark:focus:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <UploadIcon size={18} />
              Ajouter un document
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                {totalDocuments} documents
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                {recentDocuments} récents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Documents médicaux
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Téléchargez et gérez vos documents médicaux en toute sécurité
          </p>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Télécharger un nouveau document
            </h2>
            <FileUploadMedical onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterCategory === "all"
                ? "border-gray-900 dark:border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                filterCategory === category
                  ? "border-gray-900 dark:border-gray-200 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {getCategoryIcon(category)}
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Documents Grid - YouTube Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Aucun document trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {documents.length === 0
                  ? "Vous n'avez pas encore téléchargé de documents"
                  : "Aucun document ne correspond à vos critères de recherche"}
              </p>
              {documents.length === 0 && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Télécharger un document
                </button>
              )}
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const uploadDate = new Date(doc.uploadedAt);

              return (
                <div
                  key={doc.id}
                  className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        {doc.fileType.includes("image") ? (
                          <ImageIcon className="text-gray-900" size={24} />
                        ) : (
                          <FileText className="text-gray-900" size={24} />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {doc.originalName}
                        </h3>
                        <span
                          className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(doc.category)}`}
                        >
                          {getCategoryLabel(doc.category)}
                        </span>
                      </div>

                      {doc.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {uploadDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="flex items-center gap-1.5 rounded-full bg-gray-900 dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Eye size={14} />
                          Voir
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Download size={14} />
                          Télécharger
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={20}
                      className="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
