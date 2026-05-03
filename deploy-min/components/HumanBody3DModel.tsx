"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  useGLTF,
} from "@react-three/drei";
import { Activity, Heart, Thermometer, Wind } from "lucide-react";

// Composant pour afficher les points de mesure vitaux
function VitalPoint({
  position,
  color,
  label,
  value,
  icon: Icon,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  value: string;
  icon: any;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={hovered ? 1 : 0.8}
        />
      </mesh>

      {hovered && (
        <Html center distanceFactor={8}>
          <div className="rounded-lg bg-white px-4 py-2 shadow-xl border-2 border-gray-200 whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <Icon className="size-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-600">{value}</p>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Composant pour charger un modèle GLTF/GLB
function HumanModel({ url }: { url: string }) {
  const groupRef = useRef<any>(null);
  const gltf = useGLTF(url);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]} scale={1.5}>
      <primitive object={gltf.scene} />

      {/* Points de mesure vitaux */}
      <VitalPoint
        position={[0, 0.8, 0.3]}
        color="#e74c3c"
        label="Fréquence cardiaque"
        value="72 BPM"
        icon={Heart}
      />

      <VitalPoint
        position={[-0.3, 0.8, 0.3]}
        color="#3498db"
        label="Saturation O₂"
        value="98%"
        icon={Wind}
      />

      <VitalPoint
        position={[0, 1.5, 0.3]}
        color="#f39c12"
        label="Température"
        value="37.2°C"
        icon={Thermometer}
      />

      <VitalPoint
        position={[0.4, 0.5, 0.2]}
        color="#27ae60"
        label="Tension artérielle"
        value="120/80 mmHg"
        icon={Activity}
      />
    </group>
  );
}

// Composant de chargement
function LoadingSpinner() {
  return (
    <Html center>
      <div className="text-center">
        <div className="mb-2 inline-block size-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-600">
          Chargement du modèle 3D...
        </p>
      </div>
    </Html>
  );
}

// Composant principal avec plusieurs options de modèles
export default function HumanBody3DModel() {
  // URLs de modèles 3D gratuits disponibles
  const models = {
    // Option 1: Modèle anatomique simplifié (vous devez télécharger et placer dans /public/models/)
    local: "/models/human-body.glb",

    // Option 2: Utiliser un CDN public (exemple avec un modèle de test)
    // Remplacez par un vrai modèle anatomique de Sketchfab
    demo: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/fox-animated/model.gltf",
  };

  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div className="relative h-[500px] w-full rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-2xl overflow-hidden">
      {/* Header avec informations */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="rounded-lg bg-white/95 backdrop-blur-sm px-4 py-2 shadow-lg">
          <p className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <span className="animate-pulse text-red-500">●</span>
            <span>Modèle anatomique 3D</span>
          </p>
          <p className="text-xs text-gray-600">Survolez les points vitaux</p>
        </div>
      </div>

      {/* Instructions pour utiliser un modèle gratuit */}
      {showInstructions && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-3 text-lg font-bold text-gray-900">
              📦 Configuration du modèle 3D
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="font-semibold">
                Pour utiliser un modèle 3D gratuit :
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Téléchargez un modèle gratuit depuis{" "}
                  <a
                    href="https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount&q=human+anatomy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sketchfab
                  </a>
                </li>
                <li>
                  Choisissez format <strong>GLB</strong> ou{" "}
                  <strong>GLTF</strong>
                </li>
                <li>
                  Placez le fichier dans{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">
                    /public/models/human-body.glb
                  </code>
                </li>
                <li>Rafraîchissez la page</li>
              </ol>

              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-900">
                  💡 Modèles recommandés :
                </p>
                <ul className="mt-2 space-y-1 text-xs text-blue-800">
                  <li>• Anatomie humaine détaillée</li>
                  <li>• Licence Creative Commons (CC)</li>
                  <li>• Format GLB optimisé</li>
                  <li>• Taille &lt; 10MB pour performance</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              J'ai compris - Fermer
            </button>
          </div>
        </div>
      )}

      {/* Canvas Three.js */}
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={1}
        />

        {/* Lumières */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[0, 3, 3]} intensity={0.8} color="#ffffff" />
        <spotLight
          position={[0, 8, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Environnement */}
        <Environment preset="studio" />

        {/* Modèle 3D avec fallback */}
        <Suspense fallback={<LoadingSpinner />}>
          {/* Essayez d'abord le modèle local, puis le démo */}
          <HumanModel url={models.local} />
        </Suspense>

        {/* Sol réfléchissant */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.1}
            metalness={0.8}
            opacity={0.3}
            transparent
          />
        </mesh>
      </Canvas>

      {/* Légende et contrôles */}
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        <button
          onClick={() => setShowInstructions(true)}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg hover:bg-blue-700 transition"
        >
          <span>📖</span>
          <span>Comment utiliser ?</span>
        </button>
      </div>

      {/* Instructions d'utilisation */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg text-xs text-gray-700">
          <p className="font-semibold mb-1">💡 Contrôles :</p>
          <p>🖱️ Glisser: Rotation</p>
          <p>🔍 Scroll: Zoom</p>
          <p>🔄 Auto-rotation activée</p>
        </div>
      </div>
    </div>
  );
}

// Pré-charger le modèle pour optimiser les performances
// useGLTF.preload("/models/human-body.glb");
