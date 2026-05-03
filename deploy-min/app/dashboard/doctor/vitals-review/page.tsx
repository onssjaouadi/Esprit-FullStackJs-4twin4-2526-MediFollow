/**
 * Doctor Vitals Review Page
 * Doctors can review pending vital records, add notes, and update status
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getVitalsToReview,
  reviewVitalRecord,
} from "@/lib/actions/vital.actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Heart,
  Thermometer,
  Droplets,
  BarChart3,
} from "lucide-react";

export default function VitalsReviewPage() {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVital, setSelectedVital] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [newStatus, setNewStatus] = useState<
    "NORMAL" | "A_VERIFIER" | "CRITIQUE"
  >("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">(
    "pending"
  );

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const result = await getVitalsToReview();
      if (result.success) {
        setVitals(result.records || []);
      }
    } catch (error) {
      console.error("Error fetching vitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedVital || !reviewNotes.trim()) {
      alert("Veuillez ajouter des notes de révision");
      return;
    }

    setSubmitting(true);
    try {
      const result = await reviewVitalRecord(
        selectedVital.id,
        "doctor-id", // TODO: Get from session
        reviewNotes,
        newStatus
      );

      if (result.success) {
        alert("Vitals révisées avec succès");
        setSelectedVital(null);
        setReviewNotes("");
        fetchVitals();
      } else {
        alert("Erreur: " + result.error);
      }
    } catch (error) {
      console.error("Review error:", error);
      alert("Une erreur s'est produite");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVitals = vitals.filter((v) => {
    if (filter === "pending") return v.reviewStatus === "PENDING";
    if (filter === "reviewed") return v.reviewStatus === "REVIEWED";
    return true;
  });

  const stats = {
    pending: vitals.filter((v) => v.reviewStatus === "PENDING").length,
    reviewed: vitals.filter((v) => v.reviewStatus === "REVIEWED").length,
    critical: vitals.filter((v) => v.status === "CRITIQUE").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Chargement des vitals en attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Révision Signes Vitaux</h1>
        <p className="text-gray-600 mt-2">
          Vérifiez et validez les mesures vitales des patients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.pending}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critique</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.critical}
              </p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Révisés</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.reviewed}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs
        defaultValue="pending"
        onValueChange={(value) =>
          setFilter(value as "all" | "pending" | "reviewed")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En Attente ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="reviewed">Révisés ({stats.reviewed})</TabsTrigger>
          <TabsTrigger value="all">Tous ({vitals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredVitals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun enregistrement à afficher
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">TA</TableHead>
                    <TableHead className="text-center">FC</TableHead>
                    <TableHead className="text-center">Temp</TableHead>
                    <TableHead className="text-center">SpO2</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Révision</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVitals.map((vital) => (
                    <TableRow key={vital.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {vital.patient.user.firstName}{" "}
                            {vital.patient.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vital.patient.medicalRecordNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(vital.recordedAt), "dd MMM HH:mm", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        {vital.systolicBP && vital.diastolicBP ? (
                          <span className="font-mono text-sm">
                            {vital.systolicBP}/{vital.diastolicBP}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {vital.heartRate ? (
                          <span className="font-mono text-sm">
                            {vital.heartRate} bpm
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {vital.temperature ? (
                          <span className="font-mono text-sm">
                            {vital.temperature}°C
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {vital.oxygenSaturation ? (
                          <span className="font-mono text-sm">
                            {vital.oxygenSaturation}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vital.status === "CRITIQUE"
                              ? "destructive"
                              : vital.status === "A_VERIFIER"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {vital.status === "NORMAL"
                            ? "Normal"
                            : vital.status === "A_VERIFIER"
                              ? "À Vérifier"
                              : "Critique"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vital.reviewStatus === "REVIEWED"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {vital.reviewStatus === "REVIEWED"
                            ? "✓ Révisé"
                            : "En Attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setSelectedVital(vital)}
                          disabled={vital.reviewStatus === "REVIEWED"}
                        >
                          Réviser
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog
        open={!!selectedVital}
        onOpenChange={() => setSelectedVital(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedVital && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Réviser Vitals - {selectedVital.patient.user.firstName}{" "}
                  {selectedVital.patient.user.lastName}
                </DialogTitle>
              </DialogHeader>

              {/* Vital Values Display */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <BarChart3 className="w-4 h-4" />
                    Tension
                  </div>
                  <p className="text-lg font-mono">
                    {selectedVital.systolicBP}/{selectedVital.diastolicBP} mmHg
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Heart className="w-4 h-4" />
                    Fréquence Cardiaque
                  </div>
                  <p className="text-lg font-mono">
                    {selectedVital.heartRate} bpm
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Thermometer className="w-4 h-4" />
                    Température
                  </div>
                  <p className="text-lg font-mono">
                    {selectedVital.temperature}°C
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Droplets className="w-4 h-4" />
                    SpO2
                  </div>
                  <p className="text-lg font-mono">
                    {selectedVital.oxygenSaturation}%
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Statut Actuel</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedVital.status === "CRITIQUE"
                          ? "destructive"
                          : selectedVital.status === "A_VERIFIER"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {selectedVital.status === "NORMAL"
                        ? "Normal"
                        : selectedVital.status === "A_VERIFIER"
                          ? "À Vérifier"
                          : "Critique"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Mettre à jour le Statut (optionnel)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(["NORMAL", "A_VERIFIER", "CRITIQUE"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setNewStatus(status)}
                          className={`px-3 py-2 rounded text-sm font-medium transition ${
                            newStatus === status
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status === "NORMAL"
                            ? "Normal"
                            : status === "A_VERIFIER"
                              ? "À Vérifier"
                              : "Critique"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes de Révision *
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Ajoutez vos observations médicales..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVital(null)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  disabled={submitting || !reviewNotes.trim()}
                >
                  {submitting ? "Révision..." : "Confirmer Révision"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
