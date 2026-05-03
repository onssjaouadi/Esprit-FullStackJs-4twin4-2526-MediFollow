"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadMedicalProps {
  onUploadSuccess?: () => void;
}

export default function FileUploadMedical({
  onUploadSuccess,
}: FileUploadMedicalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("OTHER");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: "ANALYSIS", label: "Analyses" },
    { value: "IMAGING", label: "Imagerie" },
    { value: "PRESCRIPTION", label: "Ordonnances" },
    { value: "REPORT", label: "Rapports" },
    { value: "DISCHARGE_SUMMARY", label: "Résumé de sortie" },
    { value: "CONSULTATION", label: "Consultations" },
    { value: "OTHER", label: "Autre" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        type: "error",
        message: "Le fichier dépasse la limite de 10 MB",
      });
      return;
    }

    // Validate file type (PDF, images, common document formats)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: "error",
        message: "Type de fichier non autorisé. Utilisez PDF, JPG, PNG ou DOCX",
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus({ type: null, message: "" });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", category);
      formData.append("description", description);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadStatus({
          type: "success",
          message: "Document téléchargé avec succès!",
        });
        setSelectedFile(null);
        setDescription("");
        setCategory("OTHER");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Call the callback to refresh the document list
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setUploadStatus({
          type: "error",
          message: result.error || "Échec du téléchargement",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: "Une erreur s'est produite lors du téléchargement",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <Upload
            size={48}
            className={`mx-auto mb-4 ${
              isDragging ? "text-blue-600" : "text-gray-400"
            }`}
          />
          <p className="text-base font-medium text-gray-900 mb-1">
            Glissez-déposez votre fichier ici
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ou cliquez pour sélectionner un fichier
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Choisir un fichier
          </button>
          <p className="text-xs text-gray-400 mt-3">
            PDF, JPG, PNG, DOCX (max 10 MB)
          </p>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Category Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez une description du document..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 w-full rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Téléchargement en cours..." : "Télécharger"}
          </button>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus.type && (
        <div
          className={`rounded-xl p-4 ${
            uploadStatus.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {uploadStatus.type === "success" ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <p
              className={`text-sm font-medium ${
                uploadStatus.type === "success"
                  ? "text-green-900"
                  : "text-red-900"
              }`}
            >
              {uploadStatus.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
