"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  useGLTF,
  Text3D,
  Center,
} from "@react-three/drei";
import * as THREE from "three";

// Composant pour charger le modèle 3D depuis le fichier GLB local
function AnatomicalBody() {
  const groupRef = useRef<THREE.Group>(null);

  // Charger le modèle GLB depuis public/model3d/source
  const { scene } = useGLTF("/model3d/source/1350-813_conjunt_animat.glb");

  // Animation de rotation douce
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <primitive object={scene.clone()} scale={3.6} />
    </group>
  );
}

// Composant de chargement
function LoadingSpinner() {
  return (
    <Html center>
      <div className="text-center">
        <div className="mb-4 inline-block size-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-600">
          Chargement du modèle anatomique 3D...
        </p>
      </div>
    </Html>
  );
}

// Composant principal exporté avec images
export default function MedicalHumanBody3D() {
  return (
    <div className="relative h-[500px] w-full rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-2xl overflow-hidden">
      {/* Header avec informations */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="rounded-lg bg-white/95 backdrop-blur-sm px-4 py-2 shadow-lg">
          <p className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
            <span className="animate-pulse text-red-500">●</span>
            <span>Modèle anatomique interactif</span>
          </p>
        </div>

        <div className="rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-blue-600">Rotation 360°</p>
        </div>
      </div>

      {/* Canvas Three.js */}
      <Canvas shadows camera={{ position: [0, 0.5, 2], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 2]} fov={45} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={0.5}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          autoRotate={true}
          autoRotateSpeed={1}
        />

        {/* Lumières améliorées */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 3, 3]} intensity={1} color="#ffffff" />
        <pointLight position={[-3, 1, 0]} intensity={0.5} color="#3498db" />
        <pointLight position={[3, 1, 0]} intensity={0.5} color="#e74c3c" />
        <spotLight
          position={[0, 8, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.6}
          castShadow
        />

        {/* Environnement */}
        <Environment preset="studio" />

        {/* Corps humain anatomique avec Suspense pour le chargement */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnatomicalBody />
        </Suspense>

        {/* Texte MediFollow 3D */}
        <Center position={[0, 2, 0]}>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={0.4}
            height={0.15}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
            bevelOffset={0}
            bevelSegments={5}
          >
            MediFollow
            <meshStandardMaterial
              color="#2563eb"
              metalness={0.3}
              roughness={0.4}
            />
          </Text3D>
        </Center>

        {/* Sol réfléchissant */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#e8f4f8"
            roughness={0.2}
            metalness={0.6}
            opacity={0.8}
            transparent
          />
        </mesh>
      </Canvas>

      {/* Instructions d'utilisation */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg text-xs text-gray-700">
          <p className="font-semibold mb-1">💡 Contrôles :</p>
          <p>🖱️ Glisser: Rotation</p>
          <p>🔍 Scroll: Zoom</p>
          <p>✨ Auto-rotation activée</p>
        </div>
      </div>
    </div>
  );
}

// Préchargement du modèle pour de meilleures performances
useGLTF.preload("/model3d/source/1350-813_conjunt_animat.glb");
