"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
  Save,
  Plus,
  X,
  Award,
  Building,
  Edit2,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  ScanFace,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getDoctorProfile,
  updateDoctorProfile,
  uploadProfileImage,
} from "@/lib/actions/doctor.actions";
import FaceEnrollModal from "@/components/FaceEnrollModal";

// Medical specialties enum values
const MEDICAL_SPECIALTIES = [
  { value: "CARDIOLOGY", label: "Cardiologie" },
  { value: "NEUROLOGY", label: "Neurologie" },
  { value: "ORTHOPEDICS", label: "Orthopédie" },
  { value: "PULMONOLOGY", label: "Pneumologie" },
  { value: "GASTROENTEROLOGY", label: "Gastro-entérologie" },
  { value: "ENDOCRINOLOGY", label: "Endocrinologie" },
  { value: "RHEUMATOLOGY", label: "Rhumatologie" },
  { value: "NEPHROLOGY", label: "Néphrologie" },
  { value: "HEMATOLOGY", label: "Hématologie" },
  { value: "ONCOLOGY", label: "Oncologie" },
  { value: "PSYCHIATRY", label: "Psychiatrie" },
  { value: "DERMATOLOGY", label: "Dermatologie" },
  { value: "ENT", label: "ORL (Oto-rhino-laryngologie)" },
  { value: "OPHTHALMOLOGY", label: "Ophtalmologie" },
  { value: "GENERAL_MEDICINE", label: "Médecine générale" },
  { value: "OTHER", label: "Autre" },
];

interface Experience {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export default function DoctorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Profile data
  const [profileImage, setProfileImage] = useState<string>("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Image cropping
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [showFaceEnroll, setShowFaceEnroll] = useState(false);
  const [hasFaceEnrolled, setHasFaceEnrolled] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Edit modes
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingSpecialty, setIsEditingSpecialty] = useState(false);

  // Experience form
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: "",
    title: "",
    institution: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setHasFaceEnrolled(currentUser.hasFaceDescriptor ?? false);

      // Charger le profil docteur depuis MongoDB
      const result = await getDoctorProfile(currentUser.id);

      if (result.success && result.data) {
        const profile = result.data;
        setSpecialty(profile.specialty || "");
        setBio(profile.bio || "");
        setPhone(profile.phone || currentUser.phoneNumber || "");
        setLocation(profile.location || "");
        setProfileImage(profile.profileImage || "");

        // Convertir les expériences Prisma en format UI
        if (profile.experiences && profile.experiences.length > 0) {
          const formattedExperiences = profile.experiences.map(
            (exp: any, index: number) => ({
              id: `${index}-${Date.now()}`,
              title: exp.title,
              institution: exp.institution,
              startDate: new Date(exp.startDate).toISOString().slice(0, 7),
              endDate: exp.endDate
                ? new Date(exp.endDate).toISOString().slice(0, 7)
                : "",
              current: exp.isCurrent || false,
              description: exp.description || "",
            })
          );
          setExperiences(formattedExperiences);
        }
      } else {
        // Nouveau profil - charger uniquement les données de base
        setPhone(currentUser.phoneNumber || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setImageToCrop(imageData);
        setShowCropModal(true);
        setCropScale(1);
        setCropPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging) {
      setCropPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  async function applyCrop() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx || !cropContainerRef.current) return;

    const img = new Image();
    img.src = imageToCrop;

    img.onload = async () => {
      const outputSize = 300;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Obtenir les dimensions réelles du conteneur
      const containerRect = cropContainerRef.current!.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Centre du conteneur où le cercle de recadrage est positionné
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      // Rayon du cercle de recadrage en pixels
      const cropRadius = 150;

      // Calculer les coordonnées source dans l'image originale
      // En inversant les transformations CSS: translate(cropPosition.x, cropPosition.y) scale(cropScale)
      const sourceX = (centerX - cropPosition.x - cropRadius) / cropScale;
      const sourceY = (centerY - cropPosition.y - cropRadius) / cropScale;
      const sourceSize = (cropRadius * 2) / cropScale;

      // Dessiner la portion de l'image source sur le canvas
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize
      );

      const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
      setProfileImage(croppedImage);
      setShowCropModal(false);

      // Upload l'image recadrée
      if (user?.id) {
        const result = await uploadProfileImage(user.id, croppedImage);
        if (result.success) {
          console.log("Image uploaded successfully");
        } else {
          console.error("Error uploading image:", result.error);
          alert("Erreur lors du téléchargement de l'image");
        }
      }
    };
  }

  function addExperience() {
    if (currentExperience.title && currentExperience.institution) {
      const newExperience = {
        ...currentExperience,
        id: Date.now().toString(),
      };
      setExperiences([...experiences, newExperience]);
      setCurrentExperience({
        id: "",
        title: "",
        institution: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
      setShowExperienceForm(false);
    }
  }

  function removeExperience(id: string) {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  }

  async function saveProfile() {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Convertir les expériences UI en format Prisma
      const formattedExperiences = experiences.map((exp) => ({
        title: exp.title,
        institution: exp.institution,
        startDate: new Date(exp.startDate + "-01"),
        endDate: exp.endDate ? new Date(exp.endDate + "-01") : null,
        isCurrent: exp.current,
        description: exp.description || null,
      }));

      // Sauvegarder dans MongoDB
      const result = await updateDoctorProfile(user.id, {
        specialty: specialty || null,
        bio: bio || null,
        phone: phone || null,
        location: location || null,
        profileImage: profileImage || null,
        experiences: formattedExperiences,
      });

      if (result.success) {
        alert("Profil mis à jour avec succès !");
        // Recharger le profil pour synchroniser
        await loadProfile();
      } else {
        alert(result.error || "Erreur lors de la sauvegarde du profil");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erreur lors de la sauvegarde du profil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-black">
        <div className="text-center">
          <div className="size-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-green-400 mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Chargement du profil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        {/* Modal de recadrage d'image */}
        {showCropModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-800">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Recadrer l'image
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Utilisez les contrôles pour ajuster votre photo de profil
                </p>
              </div>

              {/* Zone de recadrage */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
                <div
                  ref={cropContainerRef}
                  className="relative w-full h-96 overflow-hidden cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Image à recadrer */}
                  <img
                    src={imageToCrop}
                    alt="À recadrer"
                    className="origin-[0_0] max-w-none select-none pointer-events-none"
                    style={{
                      transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                    }}
                    draggable={false}
                  />

                  {/* Cercle de recadrage overlay */}
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_150px_at_center,transparent_150px,rgba(0,0,0,0.5)_150px)]" />

                  {/* Indicateur du cercle */}
                  <div className="absolute border-4 border-white rounded-full pointer-events-none w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                </div>
              </div>

              {/* Contrôles */}
              <div className="space-y-4">
                {/* Zoom */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <ZoomIn className="size-4" />
                    Zoom: {Math.round(cropScale * 100)}%
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Bouton Zoom - */}
                    <button
                      onClick={() =>
                        setCropScale(Math.max(0.1, cropScale - 0.1))
                      }
                      className="flex items-center justify-center size-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex-shrink-0"
                      title="Dézoomer"
                      aria-label="Dézoomer"
                    >
                      <ZoomOut className="size-5" />
                    </button>

                    {/* Curseur de zoom */}
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={cropScale}
                      onChange={(e) => setCropScale(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-green-500"
                      aria-label="Niveau de zoom"
                    />

                    {/* Bouton Zoom + */}
                    <button
                      onClick={() => setCropScale(Math.min(3, cropScale + 0.1))}
                      className="flex items-center justify-center size-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors flex-shrink-0"
                      title="Zoomer"
                      aria-label="Zoomer"
                    >
                      <ZoomIn className="size-5" />
                    </button>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={applyCrop}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    <Check className="size-5" />
                    Appliquer
                  </button>
                  <button
                    onClick={() => {
                      setShowCropModal(false);
                      setImageToCrop("");
                      setCropScale(1);
                      setCropPosition({ x: 0, y: 0 });
                    }}
                    className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-green-500/10 rounded-lg p-3 border border-blue-200 dark:border-green-500/20">
                  <div className="flex items-start gap-2">
                    <Move className="size-5 text-blue-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-gray-300">
                      <p className="font-semibold mb-1">Astuce :</p>
                      <p className="text-blue-700 dark:text-gray-400">
                        Cliquez et faites glisser pour déplacer l'image,
                        utilisez le curseur pour zoomer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>

        {/* Photo de profil et informations principales */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Photo de profil */}
            <div className="relative">
              <div className="size-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                ) : (
                  <>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 size-10 rounded-full bg-blue-600 dark:bg-green-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 dark:hover:bg-green-700 transition-colors shadow-lg"
              >
                <Camera className="size-5 text-white" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Changer la photo de profil"
                />
              </label>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                Dr. {user?.firstName} {user?.lastName}
              </h2>
              {specialty ? (
                <p className="text-lg text-blue-600 dark:text-green-400 font-semibold mb-4">
                  {specialty}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                  Spécialité non renseignée •{" "}
                  <button
                    onClick={() => setIsEditingSpecialty(true)}
                    className="text-blue-600 dark:text-green-400 hover:underline"
                  >
                    Ajouter
                  </button>
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="size-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {phone ? (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="size-4" />
                    <span className="text-sm">{phone}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <Phone className="size-4" />
                    <button
                      onClick={() => setIsEditingContact(true)}
                      className="text-sm italic hover:text-blue-600"
                    >
                      Ajouter un téléphone
                    </button>
                  </div>
                )}
                {location ? (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 md:col-span-2">
                    <MapPin className="size-4" />
                    <span className="text-sm">{location}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 md:col-span-2">
                    <MapPin className="size-4" />
                    <button
                      onClick={() => setIsEditingContact(true)}
                      className="text-sm italic hover:text-blue-600"
                    >
                      Ajouter une localisation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spécialité */}
        {(specialty || isEditingSpecialty) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 dark:bg-green-500/10 flex items-center justify-center">
                  <Award className="size-5 text-blue-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Spécialité
                </h3>
              </div>
              {!isEditingSpecialty && specialty && (
                <button
                  onClick={() => setIsEditingSpecialty(true)}
                  className="text-blue-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-green-500 p-2"
                  title="Modifier"
                >
                  <Edit2 className="size-4" />
                </button>
              )}
            </div>
            {isEditingSpecialty ? (
              <div>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  aria-label="Sélectionner une spécialité"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-400 dark:focus:border-green-500 focus:outline-none transition-colors"
                  autoFocus
                >
                  <option value="">Sélectionner une spécialité</option>
                  {MEDICAL_SPECIALTIES.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setIsEditingSpecialty(false)}
                    className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-green-600 text-white hover:bg-blue-700 dark:hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingSpecialty(false);
                      loadProfile();
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                {MEDICAL_SPECIALTIES.find((spec) => spec.value === specialty)
                  ?.label || specialty}
              </div>
            )}
          </div>
        )}

        {/* Coordonnées */}
        {(phone || location || isEditingContact) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                  <Phone className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Coordonnées
                </h3>
              </div>
              {!isEditingContact && (phone || location) && (
                <button
                  onClick={() => setIsEditingContact(true)}
                  className="text-blue-600 hover:text-blue-700 p-2"
                  title="Modifier"
                >
                  <Edit2 className="size-4" />
                </button>
              )}
            </div>
            {isEditingContact ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-400 dark:focus:border-green-500 focus:outline-none transition-colors"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="Ville, Pays"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingContact(false)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingContact(false);
                      loadProfile();
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {phone && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="size-4" />
                    <span>{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="size-4" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Biographie */}
        {(bio || isEditingBio) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <User className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Biographie
                </h3>
              </div>
              {!isEditingBio && bio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-blue-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-green-500 p-2"
                  title="Modifier"
                >
                  <Edit2 className="size-4" />
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  placeholder="Parlez de votre parcours, vos compétences, vos centres d'intérêt..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {bio.length} / 500 caractères
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      loadProfile();
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-700 whitespace-pre-wrap">
                {bio}
              </div>
            )}
          </div>
        )}

        {/* Bouton Ajouter Bio si vide */}
        {!bio && !isEditingBio && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 mb-6 text-center hover:border-purple-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
            <div className="size-16 rounded-full bg-purple-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <User className="size-8 text-purple-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ajoutez une biographie pour vous présenter
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Partagez votre parcours, vos compétences et ce qui vous passionne
            </p>
            <button
              onClick={() => setIsEditingBio(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 dark:bg-green-600 text-white hover:bg-purple-700 dark:hover:bg-green-700 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <Plus className="size-5" />
              Ajouter une biographie
            </button>
          </div>
        )}

        {/* Expériences */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <Briefcase className="size-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Expérience Professionnelle
              </h3>
            </div>
            <button
              onClick={() => setShowExperienceForm(!showExperienceForm)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 dark:bg-green-600 text-white hover:bg-orange-700 dark:hover:bg-green-700 transition-colors font-semibold"
            >
              <Plus className="size-5" />
              Ajouter
            </button>
          </div>

          {/* Formulaire d'ajout d'expérience */}
          {showExperienceForm && (
            <div className="mb-6 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Poste
                  </label>
                  <input
                    type="text"
                    value={currentExperience.title}
                    onChange={(e) =>
                      setCurrentExperience({
                        ...currentExperience,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 dark:focus:border-green-500 focus:outline-none"
                    placeholder="Ex: Cardiologue Senior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Établissement
                  </label>
                  <input
                    type="text"
                    value={currentExperience.institution}
                    onChange={(e) =>
                      setCurrentExperience({
                        ...currentExperience,
                        institution: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 dark:focus:border-green-500 focus:outline-none"
                    placeholder="Ex: Hôpital Universitaire"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="month"
                    value={currentExperience.startDate}
                    onChange={(e) =>
                      setCurrentExperience({
                        ...currentExperience,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-green-500 focus:outline-none"
                    aria-label="Date de début"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="month"
                    value={currentExperience.endDate}
                    onChange={(e) =>
                      setCurrentExperience({
                        ...currentExperience,
                        endDate: e.target.value,
                      })
                    }
                    disabled={currentExperience.current}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-green-500 focus:outline-none disabled:opacity-50"
                    aria-label="Date de fin"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentExperience.current}
                    onChange={(e) =>
                      setCurrentExperience({
                        ...currentExperience,
                        current: e.target.checked,
                        endDate: e.target.checked
                          ? ""
                          : currentExperience.endDate,
                      })
                    }
                    className="size-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 dark:text-green-600 focus:ring-orange-500 dark:focus:ring-green-500"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Je travaille actuellement ici
                  </span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentExperience.description}
                  onChange={(e) =>
                    setCurrentExperience({
                      ...currentExperience,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-green-500 focus:outline-none resize-none"
                  placeholder="Décrivez vos responsabilités et réalisations..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addExperience}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowExperienceForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des expériences */}
          <div className="space-y-4">
            {experiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="size-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Aucune expérience ajoutée</p>
                <p className="text-xs">
                  Cliquez sur &quot;Ajouter&quot; pour commencer
                </p>
              </div>
            ) : (
              experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {exp.title}
                      </h4>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Building className="size-4" />
                        <span className="text-sm font-medium">
                          {exp.institution}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Calendar className="size-4" />
                        <span className="text-sm">
                          {new Date(exp.startDate).toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {exp.current
                            ? "Présent"
                            : new Date(exp.endDate).toLocaleDateString(
                                "fr-FR",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-gray-600">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reconnaissance faciale */}
        <div className="rounded-2xl border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-300 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-600/20">
              <ScanFace className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Connexion par reconnaissance faciale
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-600">
                Connectez-vous sans mot de passe via votre visage
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-dark-400 bg-gray-50 dark:bg-dark-400/30">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${hasFaceEnrolled ? "bg-green-500" : "bg-gray-300"}`}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {hasFaceEnrolled
                  ? "Visage enregistré — connexion faciale activée"
                  : "Aucun visage enregistré"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowFaceEnroll(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <ScanFace className="size-4" />
              {hasFaceEnrolled ? "Mettre à jour" : "Enregistrer mon visage"}
            </button>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/dashboard/doctor")}
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
          >
            Retour au dashboard
          </button>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 dark:bg-green-600 text-white font-semibold hover:bg-green-700 dark:hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="size-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>

      {/* Face Enroll Modal */}
      <FaceEnrollModal
        open={showFaceEnroll}
        onClose={() => setShowFaceEnroll(false)}
        onSuccess={() => setHasFaceEnrolled(true)}
        hasExistingFace={hasFaceEnrolled}
      />
    </div>
  );
}
