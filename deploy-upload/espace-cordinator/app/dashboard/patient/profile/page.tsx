"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Edit2,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  ScanFace,
  Heart,
  AlertCircle,
  Droplets,
  Home,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getPatientProfile,
  updatePatientProfile,
  uploadPatientProfileImage,
} from "@/lib/actions/patient.actions";
import FaceEnrollModal from "@/components/FaceEnrollModal";

const BLOOD_TYPES = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export default function PatientProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Profile data
  const [profileImage, setProfileImage] = useState<string>("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", country: "" });
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
  });

  // Patient DB id
  const [patientId, setPatientId] = useState<string>("");

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
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);

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

      if (currentUser.role !== "PATIENT") {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setHasFaceEnrolled(currentUser.hasFaceDescriptor ?? false);

      const result = await getPatientProfile(currentUser.id);

      if (result.success && result.data) {
        const p = result.data;
        setPatientId(p.id);
        setBio(p.bio || "");
        setPhone(p.user?.phoneNumber || "");
        setBloodType(p.bloodType || "");
        setGender(p.gender || "");
        setProfileImage(p.profileImage || "");
        if (p.dateOfBirth) {
          setDateOfBirth(new Date(p.dateOfBirth).toISOString().slice(0, 10));
        }
        if (p.address) {
          setAddress({
            street: (p.address as any).street || "",
            city: (p.address as any).city || "",
            country: (p.address as any).country || "",
          });
        }
        if (p.emergencyContact) {
          setEmergencyContact({
            name: (p.emergencyContact as any).name || "",
            phone: (p.emergencyContact as any).phone || "",
          });
        }
      } else {
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
    if (!isDragging) return;
    setDragPosition(e.clientX, e.clientY);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function setDragPosition(clientX: number, clientY: number) {
    const container = cropContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const maxOffset = (rect.width * cropScale - rect.width) / 2;
    const newX = Math.max(
      -maxOffset,
      Math.min(maxOffset, clientX - dragStart.x)
    );
    const newY = Math.max(
      -maxOffset,
      Math.min(maxOffset, clientY - dragStart.y)
    );
    setCropPosition({ x: newX, y: newY });
  }

  async function applyCrop() {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = async () => {
      const container = cropContainerRef.current;
      if (!container) return;

      const C = container.offsetWidth; // container size (e.g. 256)
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const s = cropScale;
      const dx = cropPosition.x;
      const dy = cropPosition.y;

      // object-cover: scale that fills the C×C container while preserving aspect ratio
      const renderScale = Math.max(C / W, C / H);
      // Top-left of the rendered image inside the container (may be negative = overflows)
      const imgX = (C - W * renderScale) / 2;
      const imgY = (C - H * renderScale) / 2;

      // Container top-left (0,0) maps back to img-element coords via inverse CSS transform:
      //   qx = C/2 + (containerX - C/2 - dx) / s
      const qx0 = C / 2 + (-C / 2 - dx) / s;
      const qy0 = C / 2 + (-C / 2 - dy) / s;
      // The visible square in img-element space is C/s × C/s
      const qSize = C / s;

      // Map img-element coords → natural image coords:
      //   nx = (qx - imgX) / renderScale
      const srcX = (qx0 - imgX) / renderScale;
      const srcY = (qy0 - imgY) / renderScale;
      const srcW = qSize / renderScale;
      const srcH = qSize / renderScale;

      // Circular clip + draw
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 300, 300);

      const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
      setProfileImage(croppedImage);
      setShowCropModal(false);
      setImageToCrop("");
      setCropScale(1);
      setCropPosition({ x: 0, y: 0 });

      // Upload to DB
      if (user) {
        await uploadPatientProfileImage(user.id, croppedImage);
      }
    };
    img.src = imageToCrop;
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      await updatePatientProfile(user.id, {
        bio,
        phoneNumber: phone,
        bloodType: bloodType || undefined,
        address,
        emergencyContact,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        profileImage,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Chargement du profil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-3xl mx-auto">
        {/* Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Recadrer la photo
              </h3>

              {/* Crop area */}
              <div className="flex justify-center mb-4">
                <div
                  ref={cropContainerRef}
                  className="relative size-64 overflow-hidden rounded-full cursor-move border-4 border-red-600 shadow-lg"
                  style={{
                    background: `radial-gradient(circle, transparent 49%, rgba(0,0,0,0.6) 50%)`,
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {imageToCrop && (
                    <img
                      src={imageToCrop}
                      alt="À recadrer"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                      style={{
                        transform: `scale(${cropScale}) translate(${cropPosition.x / cropScale}px, ${cropPosition.y / cropScale}px)`,
                        transformOrigin: "center",
                      }}
                      draggable={false}
                    />
                  )}
                </div>
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3 px-2 mb-4">
                <button
                  onClick={() => setCropScale((s) => Math.max(1, s - 0.1))}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Dézoomer"
                  aria-label="Dézoomer"
                >
                  <ZoomOut className="size-5" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={cropScale}
                  onChange={(e) => setCropScale(parseFloat(e.target.value))}
                  className="flex-1 accent-red-600"
                  aria-label="Zoom"
                />
                <button
                  onClick={() => setCropScale((s) => Math.min(3, s + 0.1))}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Zoomer"
                  aria-label="Zoomer"
                >
                  <ZoomIn className="size-5" />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={applyCrop}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-all"
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

              {/* Tip */}
              <div className="mt-4 bg-red-50 dark:bg-red-500/10 rounded-lg p-3 border border-red-200 dark:border-red-500/20">
                <div className="flex items-start gap-2">
                  <Move className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900 dark:text-gray-300">
                    <p className="font-semibold mb-1">Astuce :</p>
                    <p className="text-red-700 dark:text-gray-400">
                      Cliquez et faites glisser pour déplacer l'image, utilisez
                      le curseur pour zoomer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles et médicales
          </p>
        </div>

        {/* Profile photo + main info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Photo */}
            <div className="relative">
              <div className="size-32 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Photo de profil"
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
                className="absolute bottom-0 right-0 size-10 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
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

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-4">
                Patient
              </p>
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
                      className="text-sm italic hover:text-red-600"
                    >
                      Ajouter un téléphone
                    </button>
                  </div>
                )}
                {address.city || address.country ? (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 md:col-span-2">
                    <MapPin className="size-4" />
                    <span className="text-sm">
                      {[address.city, address.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 md:col-span-2">
                    <MapPin className="size-4" />
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="text-sm italic hover:text-red-600"
                    >
                      Ajouter une adresse
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Biographie */}
        {(bio || isEditingBio) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <User className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  À propos de moi
                </h3>
              </div>
              {!isEditingBio && bio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 p-2"
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
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors resize-none"
                  placeholder="Parlez de vous, vos préférences médicales, vos allergies connues..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {bio.length} / 500 caractères
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
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
              <div className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {bio}
              </div>
            )}
          </div>
        )}

        {/* Add bio if empty */}
        {!bio && !isEditingBio && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 mb-6 text-center hover:border-red-300 dark:hover:border-red-500 hover:shadow-xl transition-all">
            <div className="size-16 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <User className="size-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ajoutez une présentation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Partagez des informations utiles sur vous avec votre équipe
              soignante
            </p>
            <button
              onClick={() => setIsEditingBio(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 dark:bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <User className="size-5" />
              Ajouter une présentation
            </button>
          </div>
        )}

        {/* Coordonnées */}
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
            {!isEditingContact && (
              <button
                onClick={() => setIsEditingContact(true)}
                className="text-red-600 hover:text-red-700 p-2"
                title="Modifier"
              >
                <Edit2 className="size-4" />
              </button>
            )}
          </div>
          {isEditingContact ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingContact(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
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
              {phone ? (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="size-4" />
                  <span>{phone}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Aucun numéro renseigné
                </p>
              )}
            </div>
          )}
        </div>

        {/* Adresse */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Home className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Adresse
              </h3>
            </div>
            {!isEditingAddress && (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="text-red-600 hover:text-red-700 p-2"
                title="Modifier"
              >
                <Edit2 className="size-4" />
              </button>
            )}
          </div>
          {isEditingAddress ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Rue
                  </label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="123 Rue de la Paix"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) =>
                      setAddress({ ...address, country: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="France"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingAddress(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setIsEditingAddress(false);
                    loadProfile();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              {address.street || address.city || address.country ? (
                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                  {address.street && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 flex-shrink-0" />
                      <span>{address.street}</span>
                    </div>
                  )}
                  {(address.city || address.country) && (
                    <div className="flex items-center gap-2 pl-6">
                      <span>
                        {[address.city, address.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Aucune adresse renseignée
                </p>
              )}
            </div>
          )}
        </div>

        {/* Informations médicales */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <Heart className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Informations médicales
              </h3>
            </div>
            {!isEditingMedical && (
              <button
                onClick={() => setIsEditingMedical(true)}
                className="text-red-600 hover:text-red-700 p-2"
                title="Modifier"
              >
                <Edit2 className="size-4" />
              </button>
            )}
          </div>
          {isEditingMedical ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    aria-label="Date de naissance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Groupe sanguin
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    aria-label="Groupe sanguin"
                  >
                    <option value="">Non renseigné</option>
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {BLOOD_TYPE_LABELS[bt]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Sexe
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    aria-label="Sexe"
                  >
                    <option value="">Non renseigné</option>
                    <option value="MALE">Homme</option>
                    <option value="FEMALE">Femme</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingMedical(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setIsEditingMedical(false);
                    loadProfile();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Calendar className="size-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Date de naissance
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {dateOfBirth
                      ? new Date(dateOfBirth).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Non renseignée"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Droplets className="size-5 text-red-500 dark:text-red-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Groupe sanguin
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {bloodType ? BLOOD_TYPE_LABELS[bloodType] : "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <User className="size-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Sexe
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {gender === "MALE"
                      ? "Homme"
                      : gender === "FEMALE"
                        ? "Femme"
                        : gender === "OTHER"
                          ? "Autre"
                          : "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact d'urgence */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Contact d'urgence
              </h3>
            </div>
            {!isEditingEmergency && (
              <button
                onClick={() => setIsEditingEmergency(true)}
                className="text-red-600 hover:text-red-700 p-2"
                title="Modifier"
              >
                <Edit2 className="size-4" />
              </button>
            )}
          </div>
          {isEditingEmergency ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    value={emergencyContact.name}
                    onChange={(e) =>
                      setEmergencyContact({
                        ...emergencyContact,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Prénom Nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone du contact
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact.phone}
                    onChange={(e) =>
                      setEmergencyContact({
                        ...emergencyContact,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-red-400 dark:focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingEmergency(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setIsEditingEmergency(false);
                    loadProfile();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              {emergencyContact.name || emergencyContact.phone ? (
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  {emergencyContact.name && (
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{emergencyContact.name}</span>
                    </div>
                  )}
                  {emergencyContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <span>{emergencyContact.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Aucun contact d'urgence renseigné
                </p>
              )}
            </div>
          )}
        </div>

        {/* Reconnaissance faciale */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-600/20">
              <ScanFace className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Connexion par reconnaissance faciale
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connectez-vous sans mot de passe via votre visage
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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

        {/* Save button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/dashboard/patient")}
            className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
          >
            Retour au dashboard
          </button>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 shadow-md"
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
