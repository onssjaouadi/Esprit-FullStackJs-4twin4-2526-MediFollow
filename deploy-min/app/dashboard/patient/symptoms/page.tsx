"use client";

import { AlertCircle, CheckCircle2, Heart, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.actions";

type SpecialtySymptoms = {
  CARDIOLOGY: string[];
  PULMONOLOGY: string[];
  GASTROENTEROLOGY: string[];
  NEUROLOGY: string[];
  GENERAL_MEDICINE: string[];
  [key: string]: string[];
};

const SPECIALTY_SYMPTOMS: SpecialtySymptoms = {
  CARDIOLOGY: ["douleur thoracique", "palpitations"],
  PULMONOLOGY: ["essoufflement", "toux", "expectoration"],
  GASTROENTEROLOGY: ["nausée", "vomissements", "diarrhée"],
  NEUROLOGY: ["vertiges", "confusion"],
  GENERAL_MEDICINE: [],
  ENDOCRINOLOGY: [],
  RHEUMATOLOGY: [],
  ONCOLOGY: [],
  NEPHROLOGY: [],
  OTHER: [],
};

export default function SymptomsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [vitals, setVitals] = useState({
    temperature: "",
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    oxygenSaturation: "",
    weight: "",
    respiratoryRate: "",
  });

  const [symptoms, setSymptoms] = useState({
    fatigue: 0,
    fever: false,
    lossOfAppetite: 0,
    specialtySymptoms: {} as Record<string, any>,
    glycemia: "",
    crp: "",
    diuresis: "",
    hydration: "normal",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleVitalChange = (field: string, value: string) => {
    setVitals((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGeneralSymptomChange = (field: string, value: any) => {
    setSymptoms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialtySymptomChange = (field: string, value: any) => {
    setSymptoms((prev) => ({
      ...prev,
      specialtySymptoms: {
        ...prev.specialtySymptoms,
        [field]: value,
      },
    }));
  };

  const specialty = user?.patient?.specialty || "GENERAL_MEDICINE";
  const specialtySymptomsList = SPECIALTY_SYMPTOMS[specialty] || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/patient/vitals-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vitals: {
            temperature: vitals.temperature
              ? parseFloat(vitals.temperature)
              : null,
            heartRate: vitals.heartRate ? parseFloat(vitals.heartRate) : null,
            systolicBP: vitals.systolicBP
              ? parseFloat(vitals.systolicBP)
              : null,
            diastolicBP: vitals.diastolicBP
              ? parseFloat(vitals.diastolicBP)
              : null,
            oxygenSaturation: vitals.oxygenSaturation
              ? parseFloat(vitals.oxygenSaturation)
              : null,
            weight: vitals.weight ? parseFloat(vitals.weight) : null,
            respiratoryRate: vitals.respiratoryRate
              ? parseFloat(vitals.respiratoryRate)
              : null,
          },
          symptoms: {
            general: {
              fatigue: symptoms.fatigue,
              fever: symptoms.fever,
              lossOfAppetite: symptoms.lossOfAppetite,
            },
            specialty: symptoms.specialtySymptoms,
            advanced: {
              glycemia: symptoms.glycemia
                ? parseFloat(symptoms.glycemia)
                : null,
              crp: symptoms.crp ? parseFloat(symptoms.crp) : null,
              diuresis: symptoms.diuresis
                ? parseFloat(symptoms.diuresis)
                : null,
              hydration: symptoms.hydration,
            },
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/patient");
      }, 2000);
    } catch (err: any) {
      setError("Une erreur est survenue");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Heart className="size-12 text-red-600 mx-auto" />
          </div>
          <p className="text-gray-600 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="size-8 text-red-600" />
            <h1 className="text-3xl font-black text-gray-900">
              Saisie des constantes vitales & symptômes
            </h1>
          </div>
          <p className="text-gray-600">
            Veuillez entrer vos mesures du jour et vos symptômes
          </p>
          {specialty !== "GENERAL_MEDICINE" && (
            <p className="text-sm text-blue-600 font-semibold mt-2">
              Formulaire personnalisé pour:{" "}
              <span className="capitalize">{specialty.toLowerCase()}</span>
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="size-5 text-red-600 shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
            <CheckCircle2 className="size-5 text-green-600 shrink-0" />
            <p className="text-green-800">
              Constantes et symptômes enregistrés avec succès!
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vitals Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="size-6 text-red-600" />
              Constantes Vitales
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Température (°C){" "}
                  <span className="text-gray-500 text-xs">
                    Normal: 36.5-37.5
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) =>
                    handleVitalChange("temperature", e.target.value)
                  }
                  placeholder="37.0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fréquence cardiaque (bpm){" "}
                  <span className="text-gray-500 text-xs">Normal: 60-100</span>
                </label>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) =>
                    handleVitalChange("heartRate", e.target.value)
                  }
                  placeholder="75"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Systolic BP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tension systolique (mmHg){" "}
                  <span className="text-gray-500 text-xs">Normal: 120</span>
                </label>
                <input
                  type="number"
                  value={vitals.systolicBP}
                  onChange={(e) =>
                    handleVitalChange("systolicBP", e.target.value)
                  }
                  placeholder="120"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Diastolic BP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tension diastolique (mmHg){" "}
                  <span className="text-gray-500 text-xs">Normal: 80</span>
                </label>
                <input
                  type="number"
                  value={vitals.diastolicBP}
                  onChange={(e) =>
                    handleVitalChange("diastolicBP", e.target.value)
                  }
                  placeholder="80"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* O2 Saturation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Saturation O² (%){" "}
                  <span className="text-gray-500 text-xs">Normal: ≥95</span>
                </label>
                <input
                  type="number"
                  value={vitals.oxygenSaturation}
                  onChange={(e) =>
                    handleVitalChange("oxygenSaturation", e.target.value)
                  }
                  placeholder="98"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.weight}
                  onChange={(e) => handleVitalChange("weight", e.target.value)}
                  placeholder="70"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fréquence respiratoire (resp/min){" "}
                  <span className="text-red-600 font-bold text-xs">
                    IMPORTANT
                  </span>{" "}
                  <span className="text-gray-500 text-xs">Normal: 12-20</span>
                </label>
                <input
                  type="number"
                  value={vitals.respiratoryRate}
                  onChange={(e) =>
                    handleVitalChange("respiratoryRate", e.target.value)
                  }
                  placeholder="16"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Symptômes</h2>

            {/* General Symptoms */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Symptômes généraux
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Fatigue{" "}
                    <span className="text-gray-500 text-xs">
                      (0 = aucune, 5 = très grave)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={symptoms.fatigue}
                      onChange={(e) =>
                        handleGeneralSymptomChange(
                          "fatigue",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-red-600 min-w-fit">
                      {symptoms.fatigue}/5
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={symptoms.fever}
                    onChange={(e) =>
                      handleGeneralSymptomChange("fever", e.target.checked)
                    }
                    className="rounded border-gray-300 text-red-600 w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    Fièvre ressentie
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Perte d'appétit{" "}
                    <span className="text-gray-500 text-xs">
                      (0 = aucune, 5 = totale)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={symptoms.lossOfAppetite}
                      onChange={(e) =>
                        handleGeneralSymptomChange(
                          "lossOfAppetite",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-red-600 min-w-fit">
                      {symptoms.lossOfAppetite}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialty-Specific Symptoms */}
            {specialtySymptomsList.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Symptômes spécialisés ({specialty})
                </h3>
                <div className="space-y-4">
                  {specialty === "CARDIOLOGY" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Douleur thoracique{" "}
                          <span className="text-gray-500 text-xs">
                            (0 = aucune, 10 = insoutenable)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={symptoms.specialtySymptoms.chestPain || 0}
                            onChange={(e) =>
                              handleSpecialtySymptomChange(
                                "chestPain",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-red-600 min-w-fit">
                            {symptoms.specialtySymptoms.chestPain || 0}/10
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.palpitations || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "palpitations",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Palpitations
                        </span>
                      </label>
                    </>
                  )}

                  {specialty === "PULMONOLOGY" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Essoufflement{" "}
                          <span className="text-gray-500 text-xs">
                            (0 = aucun, 5 = grave)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={symptoms.specialtySymptoms.shortness || 0}
                            onChange={(e) =>
                              handleSpecialtySymptomChange(
                                "shortness",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-red-600 min-w-fit">
                            {symptoms.specialtySymptoms.shortness || 0}/5
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.specialtySymptoms.cough || false}
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "cough",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Toux
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.expectoration || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "expectoration",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Expectoration
                        </span>
                      </label>
                    </>
                  )}

                  {specialty === "GASTROENTEROLOGY" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Nausée{" "}
                          <span className="text-gray-500 text-xs">
                            (0 = aucune, 5 = grave)
                          </span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={symptoms.specialtySymptoms.nausea || 0}
                            onChange={(e) =>
                              handleSpecialtySymptomChange(
                                "nausea",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-lg font-bold text-red-600 min-w-fit">
                            {symptoms.specialtySymptoms.nausea || 0}/5
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.specialtySymptoms.vomiting || false}
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "vomiting",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Vomissements
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symptoms.specialtySymptoms.diarrhea || false}
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "diarrhea",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Diarrhée
                        </span>
                      </label>
                    </>
                  )}

                  {specialty === "NEUROLOGY" && (
                    <>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.dizziness || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "dizziness",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Vertiges
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            symptoms.specialtySymptoms.confusion || false
                          }
                          onChange={(e) =>
                            handleSpecialtySymptomChange(
                              "confusion",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-red-600 w-5 h-5"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Confusion
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Data (Collapsible) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-4 px-0 text-lg font-bold text-gray-900 hover:text-red-600 transition-colors"
            >
              <span>📊 Données cliniques avancées (Optionnel)</span>
              <span className="text-xl">{showAdvanced ? "−" : "+"}</span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Glycémie (g/L){" "}
                    <span className="text-gray-500 text-xs">
                      Normal: 0.7-1.1
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={symptoms.glycemia}
                    onChange={(e) =>
                      setSymptoms((prev) => ({
                        ...prev,
                        glycemia: e.target.value,
                      }))
                    }
                    placeholder="0.9"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CRP (mg/L){" "}
                    <span className="text-gray-500 text-xs">Normal: &lt;5</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={symptoms.crp}
                    onChange={(e) =>
                      setSymptoms((prev) => ({ ...prev, crp: e.target.value }))
                    }
                    placeholder="2.5"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diurèse (ml/jour){" "}
                    <span className="text-gray-500 text-xs">
                      Normal: &gt;500
                    </span>
                  </label>
                  <input
                    type="number"
                    value={symptoms.diuresis}
                    onChange={(e) =>
                      setSymptoms((prev) => ({
                        ...prev,
                        diuresis: e.target.value,
                      }))
                    }
                    placeholder="1200"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hydratation
                  </label>
                  <select
                    value={symptoms.hydration}
                    onChange={(e) =>
                      setSymptoms((prev) => ({
                        ...prev,
                        hydration: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    <option value="normal">Normale</option>
                    <option value="low">Faible</option>
                    <option value="veryLow">Très faible</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-4 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2"
          >
            {submitting
              ? "Enregistrement..."
              : "Enregistrer mes constantes et symptômes"}
          </button>
        </form>
      </div>
    </div>
  );
}
