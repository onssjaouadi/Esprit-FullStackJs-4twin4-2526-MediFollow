"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AnalysisModal from "@/components/AnalysisModal";

interface AddAnalysisButtonProps {
  patients: Array<{
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function AddAnalysisButton({
  patients,
}: AddAnalysisButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [showPatientSelect, setShowPatientSelect] = useState(false);

  function handleOpenModal() {
    if (patients.length === 0) {
      alert("Aucun patient disponible");
      return;
    }
    setShowPatientSelect(true);
  }

  function handlePatientSelect(patientId: string) {
    setSelectedPatientId(patientId);
    setShowPatientSelect(false);
    setIsModalOpen(true);
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const patientName = selectedPatient
    ? `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}`
    : "";

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
      >
        <Plus className="w-5 h-5" />
        Ajouter une analyse
      </button>

      {/* Patient Selection Modal */}
      {showPatientSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPatientSelect(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sélectionner un patient
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              <div className="space-y-2">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient.id)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">
                      {patient.user.firstName} {patient.user.lastName}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {isModalOpen && selectedPatient && (
        <AnalysisModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientId={selectedPatientId}
          patientName={patientName}
          mode="create"
        />
      )}
    </>
  );
}
