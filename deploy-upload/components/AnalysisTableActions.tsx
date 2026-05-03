"use client";

import { useState } from "react";
import { Pen, Trash2 } from "lucide-react";
import AnalysisModal from "@/components/AnalysisModal";
import { deleteMedicalAnalysis } from "@/lib/actions/analysis.actions";
import { useRouter } from "next/navigation";

interface AnalysisTableActionsProps {
  analysis: any;
  patientName: string;
  patientId: string;
}

export default function AnalysisTableActions({
  analysis,
  patientName,
  patientId,
}: AnalysisTableActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'analyse "${analysis.testName}" ?`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteMedicalAnalysis(analysis.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
          title="Modifier"
        >
          <Pen className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          title="Supprimer"
        >
          {deleting ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          )}
        </button>
      </div>

      <AnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patientId}
        patientName={patientName}
        analysis={analysis}
        mode="edit"
      />
    </>
  );
}
