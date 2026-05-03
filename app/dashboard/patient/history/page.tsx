"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Activity,
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  AlertCircle,
  TrendingUp,
  Heart,
  Droplet,
  Thermometer,
  Plus,
  X,
  Save,
  Loader2,
  Edit,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  createVitalRecord,
  getVitalRecords,
  updateVitalRecord,
} from "@/lib/actions/vital.actions";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterReview, setFilterReview] = useState<string>("all");
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [editingVitalId, setEditingVitalId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [formData, setFormData] = useState({
    systolicBP: "",
    diastolicBP: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    notes: "",
    recordedAt: new Date().toISOString().slice(0, 16),
    // Symptômes
    painChecked: false,
    painIntensity: 0,
    fatigueChecked: false,
    fatigueIntensity: 0,
    breathlessnessChecked: false,
    breathlessnessIntensity: 0,
    nauseaChecked: false,
    nauseaIntensity: 0,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
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

      setPatient(user.patient);

      // Récupérer les vrais enregistrements de signes vitaux
      const vitalRecordsResult = await getVitalRecords(user.patient.id);

      const vitalItems =
        vitalRecordsResult.success && vitalRecordsResult.records
          ? vitalRecordsResult.records.map((record: any) => {
              // Formater la description avec les signes vitaux
              const parts = [];
              if (record.systolicBP && record.diastolicBP) {
                parts.push(`TA: ${record.systolicBP}/${record.diastolicBP}`);
              }
              if (record.heartRate) {
                parts.push(`FC: ${record.heartRate} bpm`);
              }
              if (record.temperature) {
                parts.push(`Temp: ${record.temperature}°C`);
              }

              return {
                id: record.id,
                type: "vital",
                title: "Mesure des signes vitaux",
                description: parts.join(", "),
                date: new Date(record.recordedAt),
                status: record.status || "NORMAL",
                vitalStatus: record.status || "NORMAL",
                badge: "Signes vitaux",
                // Copier tous les champs nécessaires pour l'édition
                systolicBP: record.systolicBP,
                diastolicBP: record.diastolicBP,
                heartRate: record.heartRate,
                temperature: record.temperature,
                oxygenSaturation: record.oxygenSaturation,
                weight: record.weight,
                notes: record.notes,
                symptoms: record.symptoms,
                recordedAt: record.recordedAt,
                // Champs de review
                reviewStatus: record.reviewStatus,
                reviewNotes: record.reviewNotes,
                reviewedBy: record.reviewedBy,
                reviewedAt: record.reviewedAt,
              };
            })
          : [];

      // Mock data pour les autres types d'événements
      const otherItems = [
        {
          id: "apt-1",
          type: "appointment",
          title: "Consultation cardiologie",
          description: "Dr. Marie Dubois - Consultation de suivi",
          date: new Date("2026-02-28T10:00:00"),
          status: "completed",
          badge: "Rendez-vous",
        },
        {
          id: "rep-1",
          type: "report",
          title: "Analyse sanguine",
          description: "Bilan sanguin complet - Résultats normaux",
          date: new Date("2026-02-25T09:15:00"),
          status: "normal",
          badge: "Rapport",
        },
      ];

      // Combiner tous les items et les trier par date
      const allItems = [...vitalItems, ...otherItems].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setHistoryItems(allItems);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (symptom: string) => {
    setFormData({
      ...formData,
      [`${symptom}Checked`]:
        !formData[`${symptom}Checked` as keyof typeof formData],
    });
  };

  const handleSliderChange = (symptom: string, value: number) => {
    setFormData({
      ...formData,
      [`${symptom}Intensity`]: value,
    });
  };

  const handleEditVital = (record: any) => {
    // Parser les symptômes s'ils existent
    let symptoms: any = {};
    try {
      symptoms = record.symptoms ? JSON.parse(record.symptoms) : {};
    } catch (e) {
      symptoms = {};
    }

    // Remplir le formulaire avec les données du record
    setFormData({
      systolicBP: record.systolicBP?.toString() || "",
      diastolicBP: record.diastolicBP?.toString() || "",
      heartRate: record.heartRate?.toString() || "",
      temperature: record.temperature?.toString() || "",
      oxygenSaturation: record.oxygenSaturation?.toString() || "",
      weight: record.weight?.toString() || "",
      notes: record.notes || "",
      recordedAt: record.recordedAt
        ? new Date(record.recordedAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      painChecked: symptoms.pain?.checked || false,
      painIntensity: symptoms.pain?.intensity || 0,
      fatigueChecked: symptoms.fatigue?.checked || false,
      fatigueIntensity: symptoms.fatigue?.intensity || 0,
      breathlessnessChecked: symptoms.breathlessness?.checked || false,
      breathlessnessIntensity: symptoms.breathlessness?.intensity || 0,
      nauseaChecked: symptoms.nausea?.checked || false,
      nauseaIntensity: symptoms.nausea?.intensity || 0,
    });

    // Définir l'état d'édition
    setEditingVitalId(record.id);
    setEditingRecord(record);

    // Ouvrir le formulaire
    setShowVitalForm(true);
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      if (!patient?.id) {
        setFormError("Patient non trouvé");
        setFormLoading(false);
        return;
      }

      // Create FormData
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          form.append(key, value.toString());
        }
      });

      // Ajouter les symptômes comme JSON
      const symptoms = {
        pain: {
          checked: formData.painChecked,
          intensity: formData.painChecked ? formData.painIntensity : undefined,
        },
        fatigue: {
          checked: formData.fatigueChecked,
          intensity: formData.fatigueChecked
            ? formData.fatigueIntensity
            : undefined,
        },
        breathlessness: {
          checked: formData.breathlessnessChecked,
          intensity: formData.breathlessnessChecked
            ? formData.breathlessnessIntensity
            : undefined,
        },
        nausea: {
          checked: formData.nauseaChecked,
          intensity: formData.nauseaChecked
            ? formData.nauseaIntensity
            : undefined,
        },
      };
      form.append("symptoms", JSON.stringify(symptoms));

      let result;
      if (editingVitalId) {
        // Mode édition
        result = await updateVitalRecord(editingVitalId, patient.id, form);
      } else {
        // Mode création
        result = await createVitalRecord(patient.id, form);
      }

      if (result.success) {
        // Réinitialiser le formulaire
        setFormData({
          systolicBP: "",
          diastolicBP: "",
          heartRate: "",
          temperature: "",
          oxygenSaturation: "",
          weight: "",
          notes: "",
          recordedAt: new Date().toISOString().slice(0, 16),
          painChecked: false,
          painIntensity: 0,
          fatigueChecked: false,
          fatigueIntensity: 0,
          breathlessnessChecked: false,
          breathlessnessIntensity: 0,
          nauseaChecked: false,
          nauseaIntensity: 0,
        });
        setShowVitalForm(false);
        setEditingVitalId(null);
        setEditingRecord(null);
        // Recharger l'historique
        loadHistory();
      } else {
        setFormError(result.error || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      setFormError("Une erreur s'est produite");
    } finally {
      setFormLoading(false);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "vital":
        return {
          icon: Activity,
          label: "Signes vitaux",
          color: "text-blue-600 bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "appointment":
        return {
          icon: Calendar,
          label: "Rendez-vous",
          color: "text-purple-600 bg-purple-50",
          borderColor: "border-purple-200",
        };
      case "report":
        return {
          icon: FileText,
          label: "Rapport",
          color: "text-green-600 bg-green-50",
          borderColor: "border-green-200",
        };
      case "alert":
        return {
          icon: AlertCircle,
          label: "Alerte",
          color: "text-red-600 bg-red-50",
          borderColor: "border-red-200",
        };
      case "medication":
        return {
          icon: Pill,
          label: "Médicament",
          color: "text-orange-600 bg-orange-50",
          borderColor: "border-orange-200",
        };
      default:
        return {
          icon: Clock,
          label: "Événement",
          color: "text-gray-600 bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const filteredHistory = historyItems
    .filter((item) => (filterType === "all" ? true : item.type === filterType))
    .filter((item) => {
      // Filtre par statut (uniquement pour les signes vitaux)
      if (filterStatus !== "all" && item.type === "vital") {
        return item.vitalStatus === filterStatus;
      }
      return true;
    })
    .filter((item) => {
      // Filtre par review (uniquement pour les signes vitaux)
      if (filterReview !== "all" && item.type === "vital") {
        if (filterReview === "pending") {
          // Afficher les enregistrements non encore reviewés
          return item.reviewStatus === "PENDING" || !item.reviewStatus;
        } else if (filterReview === "reviewed") {
          // Afficher les enregistrements déjà reviewés
          return item.reviewStatus === "REVIEWED";
        }
      }
      return true;
    })
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const typeFilters = [
    { id: "all", label: "Tout", icon: Clock },
    { id: "vital", label: "Signes vitaux", icon: Activity },
    { id: "appointment", label: "Rendez-vous", icon: Calendar },
    { id: "report", label: "Rapports", icon: FileText },
    { id: "alert", label: "Alertes", icon: AlertCircle },
    { id: "medication", label: "Médicaments", icon: Pill },
  ];

  const totalItems = historyItems.length;
  const recentItems = historyItems.filter(
    (item) =>
      new Date(item.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const pendingReview = historyItems.filter(
    (item) =>
      item.type === "vital" &&
      (item.reviewStatus === "PENDING" || !item.reviewStatus) &&
      (item.vitalStatus === "A_VERIFIER" || item.vitalStatus === "CRITIQUE")
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Search Bar - YouTube Style */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher dans l'historique médical..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-gray-400 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
                {totalItems} événements
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                {recentItems} cette semaine
              </span>
              {pendingReview > 0 && (
                <span className="rounded-full bg-orange-50 px-3 py-1.5 font-medium text-orange-700 border border-orange-200">
                  ⏳ {pendingReview} en attente
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Historique médical
            </h1>
            <p className="mt-2 text-gray-600">
              Chronologie complète de votre parcours de santé
            </p>
          </div>
          <button
            onClick={() => setShowVitalForm(!showVitalForm)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            {showVitalForm ? (
              <>
                <X size={20} />
                Annuler
              </>
            ) : (
              <>
                <Plus size={20} />
                Ajouter signes vitaux
              </>
            )}
          </button>
        </div>

        {/* Vital Signs Form */}
        {showVitalForm && (
          <div className="mb-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVitalId
                ? "✏️ Modifier vos signes vitaux"
                : "📊 Enregistrer vos signes vitaux"}
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitVitals}>
              {/* Section 1: Constantes vitales */}
              <div className="mb-6 rounded-lg bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Section 1 — Constantes vitales
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Température */}
                  <div>
                    <label
                      htmlFor="temperature"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      🌡️ Température (°C) *
                    </label>
                    <input
                      type="number"
                      id="temperature"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="36.5"
                      step="0.1"
                      min="34"
                      max="42"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Min: 34°C - Max: 42°C
                    </p>
                  </div>

                  {/* Fréquence cardiaque */}
                  <div>
                    <label
                      htmlFor="heartRate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ❤️ Fréquence cardiaque (bpm) *
                    </label>
                    <input
                      type="number"
                      id="heartRate"
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="70"
                      step="1"
                      min="30"
                      max="220"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Min: 30 - Max: 220
                    </p>
                  </div>

                  {/* Tension systolique */}
                  <div>
                    <label
                      htmlFor="systolicBP"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      💉 Tension systolique (mmHg) *
                    </label>
                    <input
                      type="number"
                      id="systolicBP"
                      name="systolicBP"
                      value={formData.systolicBP}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="120"
                      step="1"
                      min="70"
                      max="250"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Min: 70 - Max: 250
                    </p>
                  </div>

                  {/* Tension diastolique */}
                  <div>
                    <label
                      htmlFor="diastolicBP"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      💉 Tension diastolique (mmHg) *
                    </label>
                    <input
                      type="number"
                      id="diastolicBP"
                      name="diastolicBP"
                      value={formData.diastolicBP}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="80"
                      step="1"
                      min="40"
                      max="150"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Min: 40 - Max: 150
                    </p>
                  </div>

                  {/* Poids */}
                  <div>
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ⚖️ Poids (kg) *
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="70"
                      step="0.1"
                      min="20"
                      max="300"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Min: 20 - Max: 300
                    </p>
                  </div>

                  {/* SpO2 */}
                  <div>
                    <label
                      htmlFor="oxygenSaturation"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      💨 SpO2 (%) - Optionnel
                    </label>
                    <input
                      type="number"
                      id="oxygenSaturation"
                      name="oxygenSaturation"
                      value={formData.oxygenSaturation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="98"
                      step="1"
                      min="70"
                      max="100"
                    />
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="recordedAt"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      📅 Date et heure de la mesure
                    </label>
                    <input
                      type="datetime-local"
                      id="recordedAt"
                      name="recordedAt"
                      value={formData.recordedAt}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Symptômes */}
              <div className="mb-6 rounded-lg bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🤒 Section 2 — Symptômes
                </h3>
                <div className="space-y-4">
                  {/* Douleur */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="painChecked"
                        checked={formData.painChecked}
                        onChange={() => handleCheckboxChange("pain")}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="painChecked"
                        className="text-base font-medium text-gray-900"
                      >
                        Douleur
                      </label>
                    </div>
                    {formData.painChecked && (
                      <div className="ml-8 space-y-2">
                        <label className="block text-sm text-gray-700">
                          Intensité :{" "}
                          <span className="font-semibold text-blue-600">
                            {formData.painIntensity}/10
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={formData.painIntensity}
                          onChange={(e) =>
                            handleSliderChange("pain", Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 - Aucune</span>
                          <span>10 - Insupportable</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fatigue */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="fatigueChecked"
                        checked={formData.fatigueChecked}
                        onChange={() => handleCheckboxChange("fatigue")}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="fatigueChecked"
                        className="text-base font-medium text-gray-900"
                      >
                        Fatigue
                      </label>
                    </div>
                    {formData.fatigueChecked && (
                      <div className="ml-8 space-y-2">
                        <label className="block text-sm text-gray-700">
                          Intensité :{" "}
                          <span className="font-semibold text-blue-600">
                            {formData.fatigueIntensity}/10
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={formData.fatigueIntensity}
                          onChange={(e) =>
                            handleSliderChange(
                              "fatigue",
                              Number(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 - Aucune</span>
                          <span>10 - Épuisement total</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Essoufflement */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="breathlessnessChecked"
                        checked={formData.breathlessnessChecked}
                        onChange={() => handleCheckboxChange("breathlessness")}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="breathlessnessChecked"
                        className="text-base font-medium text-gray-900"
                      >
                        Essoufflement
                      </label>
                    </div>
                    {formData.breathlessnessChecked && (
                      <div className="ml-8 space-y-2">
                        <label className="block text-sm text-gray-700">
                          Intensité :{" "}
                          <span className="font-semibold text-blue-600">
                            {formData.breathlessnessIntensity}/10
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={formData.breathlessnessIntensity}
                          onChange={(e) =>
                            handleSliderChange(
                              "breathlessness",
                              Number(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 - Aucun</span>
                          <span>10 - Très sévère</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nausée */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="nauseaChecked"
                        checked={formData.nauseaChecked}
                        onChange={() => handleCheckboxChange("nausea")}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="nauseaChecked"
                        className="text-base font-medium text-gray-900"
                      >
                        Nausée
                      </label>
                    </div>
                    {formData.nauseaChecked && (
                      <div className="ml-8 space-y-2">
                        <label className="block text-sm text-gray-700">
                          Intensité :{" "}
                          <span className="font-semibold text-blue-600">
                            {formData.nauseaIntensity}/10
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={formData.nauseaIntensity}
                          onChange={(e) =>
                            handleSliderChange("nausea", Number(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 - Aucune</span>
                          <span>10 - Très sévère</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6 rounded-lg bg-white p-6">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  📝 Notes (optionnel)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Ajoutez des notes sur votre état général..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editingVitalId ? "Mise à jour..." : "Enregistrement..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingVitalId ? "Mettre à jour" : "Enregistrer"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVitalForm(false);
                    setEditingVitalId(null);
                    setEditingRecord(null);
                  }}
                  className="rounded-full border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Type Filters */}
        <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  filterType === filter.id
                    ? "border-gray-900 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Status Filters (only for vital signs) */}
        {(filterType === "all" || filterType === "vital") && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              Statut des signes vitaux
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterStatus === "all"
                    ? "border-gray-900 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatus("NORMAL")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterStatus === "NORMAL"
                    ? "border-green-600 bg-green-50 text-green-800"
                    : "border-green-300 bg-white text-green-700 hover:bg-green-50"
                }`}
              >
                🟢 Normal
              </button>
              <button
                onClick={() => setFilterStatus("A_VERIFIER")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterStatus === "A_VERIFIER"
                    ? "border-orange-600 bg-orange-50 text-orange-800"
                    : "border-orange-300 bg-white text-orange-700 hover:bg-orange-50"
                }`}
              >
                🟡 À vérifier
              </button>
              <button
                onClick={() => setFilterStatus("CRITIQUE")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterStatus === "CRITIQUE"
                    ? "border-red-600 bg-red-50 text-red-800"
                    : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                }`}
              >
                🔴 Critique
              </button>
            </div>
          </div>
        )}

        {/* Review Filters (only for vital signs) */}
        {(filterType === "all" || filterType === "vital") && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              Review médecin
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterReview("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterReview === "all"
                    ? "border-gray-900 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterReview("pending")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterReview === "pending"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                }`}
              >
                ⏳ En attente de review
              </button>
              <button
                onClick={() => setFilterReview("reviewed")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filterReview === "reviewed"
                    ? "border-purple-600 bg-purple-50 text-purple-800"
                    : "border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
                }`}
              >
                ✅ Reviewé (Normal)
              </button>
            </div>
          </div>
        )}

        {/* Timeline - YouTube Style */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {filteredHistory.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <Clock className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun événement trouvé
                </h3>
                <p className="text-gray-600">
                  Aucun événement ne correspond à vos critères
                </p>
              </div>
            ) : (
              filteredHistory.map((item, index) => {
                const typeConfig = getTypeConfig(item.type);
                const Icon = typeConfig.icon;
                const itemDate = new Date(item.date);

                return (
                  <div key={item.id} className="relative pl-14">
                    {/* Timeline Icon */}
                    <div
                      className={`absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${typeConfig.color} ${typeConfig.borderColor}`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Content Card */}
                    <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                          {/* Statut des signes vitaux */}
                          {item.type === "vital" && item.vitalStatus && (
                            <div className="mt-2 space-y-2">
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                    item.vitalStatus === "CRITIQUE"
                                      ? "bg-red-50 text-red-800 border-red-200"
                                      : item.vitalStatus === "A_VERIFIER"
                                        ? "bg-orange-50 text-orange-800 border-orange-200"
                                        : "bg-green-50 text-green-800 border-green-200"
                                  }`}
                                >
                                  {item.vitalStatus === "CRITIQUE"
                                    ? "🔴 CRITIQUE"
                                    : item.vitalStatus === "A_VERIFIER"
                                      ? "🟡 À VÉRIFIER"
                                      : "🟢 NORMAL"}
                                </span>
                                {item.reviewStatus === "PENDING" &&
                                  item.vitalStatus !== "NORMAL" && (
                                    <span className="ml-2 text-xs text-gray-500 italic">
                                      En attente du review du médecin
                                    </span>
                                  )}
                              </div>

                              {/* Message de review du médecin */}
                              {item.reviewStatus === "REVIEWED" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <div className="bg-blue-100 rounded-full p-1 flex-shrink-0">
                                      <svg
                                        className="w-4 h-4 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-blue-900 mb-1">
                                        Review du Dr.{" "}
                                        {item.reviewedBy?.firstName}{" "}
                                        {item.reviewedBy?.lastName}
                                      </p>
                                      {item.reviewNotes && (
                                        <p className="text-xs text-blue-800">
                                          {item.reviewNotes}
                                        </p>
                                      )}
                                      {item.reviewedAt && (
                                        <p className="text-xs text-blue-600 mt-1">
                                          {new Date(
                                            item.reviewedAt
                                          ).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "long",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${typeConfig.color} ${typeConfig.borderColor}`}
                        >
                          {typeConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {itemDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span>
                          {itemDate.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {/* Bouton Edit pour les vitaux (uniquement dans les 5 premières minutes) */}
                        {item.type === "vital" &&
                          (() => {
                            const minutesElapsed =
                              (Date.now() - itemDate.getTime()) / (1000 * 60);
                            const remainingMinutes = Math.max(
                              0,
                              Math.ceil(5 - minutesElapsed)
                            );
                            return minutesElapsed < 5 ? (
                              <button
                                onClick={() => handleEditVital(item)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition"
                                title={`Modifiable pendant encore ${remainingMinutes} min`}
                              >
                                <Edit size={14} />
                                <span>Modifier ({remainingMinutes} min)</span>
                              </button>
                            ) : null;
                          })()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
