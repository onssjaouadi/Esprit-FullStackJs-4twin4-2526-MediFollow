"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Save,
  Sparkles,
  Loader2,
  Edit2,
  Trash2,
  Eye,
  Download,
  ChevronDown,
  Send,
} from "lucide-react";
import {
  createSituationReport,
  updateSituationReport,
  generateAISummary,
  improveTextWithAI,
  getSituationReports,
  publishSituationReport,
  deleteSituationReport,
} from "@/lib/actions/situation-reports.actions";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface SituationReportEditorProps {
  patientId: string;
  patientName: string;
}

export default function SituationReportEditor({
  patientId,
  patientName,
}: SituationReportEditorProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [currentReport, setCurrentReport] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [improveInstruction, setImproveInstruction] = useState("");
  const [showImproveModal, setShowImproveModal] = useState(false);

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, [patientId]);

  // Create new report
  const handleCreateReport = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsCreating(true);
    try {
      const result = await createSituationReport(
        patientId,
        newTitle,
        newContent
      );

      if (result.success) {
        setCurrentReport(result.report);
        setNewTitle("");
        setNewContent("");
        setShowNewForm(false);
        // Refresh reports list
        loadReports();
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Load reports
  const loadReports = async () => {
    const result = await getSituationReports(patientId);
    if (result.success) {
      setReports(result.reports);
    }
  };

  // Update content
  const handleSaveContent = async () => {
    if (!currentReport) return;

    setIsSaving(true);
    try {
      const result = await updateSituationReport(currentReport.id, {
        content: currentReport.content,
      });

      if (result.success) {
        setCurrentReport(result.report);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Generate AI Summary
  const handleGenerateAISummary = async () => {
    if (!currentReport) return;

    setIsLoadingAI(true);
    try {
      const result = await generateAISummary(currentReport.id);

      if (result.success) {
        setCurrentReport((prev: any) => ({
          ...prev,
          aiSummary: result.summary,
        }));
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Improve text
  const handleImproveText = async () => {
    if (!currentReport || !improveInstruction.trim()) return;

    setIsLoadingAI(true);
    try {
      const result = await improveTextWithAI(
        currentReport.id,
        improveInstruction
      );

      if (result.success) {
        setCurrentReport((prev: any) => ({
          ...prev,
          content: result.improvedContent,
        }));
        setImproveInstruction("");
        setShowImproveModal(false);
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Publish report
  const handlePublishReport = async () => {
    if (!currentReport) return;

    setIsSaving(true);
    try {
      const result = await publishSituationReport(currentReport.id);

      if (result.success) {
        setCurrentReport(result.report);
        loadReports();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete report
  const handleDeleteReport = async () => {
    if (!currentReport || !confirm("Are you sure?")) return;

    setIsSaving(true);
    try {
      const result = await deleteSituationReport(currentReport.id);

      if (result.success) {
        setCurrentReport(null);
        loadReports();
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!currentReport) return;

    const element = document.getElementById("report-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210 - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= 297 - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= 297 - 20;
      }

      pdf.save(`rapport-situation-${currentReport.id}.pdf`);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Rapports de Situation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{patientName}</p>
        </div>
        <button
          onClick={() => {
            setShowNewForm(true);
            setCurrentReport(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Rapport
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Mes Rapports
            </h3>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun rapport</p>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setCurrentReport(report)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    currentReport?.id === report.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300"
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {report.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        report.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                          : report.status === "IN_REVIEW"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {showNewForm ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Créer un nouveau rapport
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titre du rapport..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenu
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Rédigez votre rapport..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateReport}
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Créer
                </button>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : currentReport ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-6">
              {/* Report Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentReport.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Créé le{" "}
                    {new Date(currentReport.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {currentReport.status !== "PUBLISHED" && (
                    <button
                      onClick={handlePublishReport}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Publier
                    </button>
                  )}
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={handleDeleteReport}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div
                id="report-content"
                className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <label
                  htmlFor="report-textarea"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Contenu du rapport
                </label>
                <textarea
                  id="report-textarea"
                  placeholder="Entrez le contenu détaillé du rapport clinique..."
                  value={currentReport.content}
                  onChange={(e) =>
                    setCurrentReport((prev: any) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={12}
                />
              </div>

              {/* AI Summary */}
              {currentReport.aiSummary && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Résumé IA
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                    {currentReport.aiSummary}
                  </p>
                </div>
              )}

              {/* AI Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleGenerateAISummary}
                  disabled={isLoadingAI}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoadingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Générer Résumé IA
                </button>
                <button
                  onClick={() => setShowImproveModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Améliorer avec IA
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveContent}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Sélectionnez un rapport ou créez-en un nouveau
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Improve Modal */}
      {showImproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Améliorer le texte avec IA
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions pour l'IA
              </label>
              <textarea
                value={improveInstruction}
                onChange={(e) => setImproveInstruction(e.target.value)}
                placeholder="Ex: Améliore la clarté médicale, corrige les fautes d'orthographe, reformule les phrases complexes..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleImproveText}
                disabled={isLoadingAI || !improveInstruction.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isLoadingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Améliorer
              </button>
              <button
                onClick={() => setShowImproveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
