"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

// Composant du corps humain 3D
function HumanBody() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Animation de rotation automatique
  useFrame((state) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  // Couleurs pour les différentes parties du corps
  const colors = {
    head: "#ffa07a",
    torso: "#ff8c6b",
    leftArm: "#ffb399",
    rightArm: "#ffb399",
    leftLeg: "#ff7f50",
    rightLeg: "#ff7f50",
  };

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Tête */}
      <mesh
        position={[0, 1.8, 0]}
        onPointerOver={() => setHovered("head")}
        onPointerOut={() => setHovered(null)}
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={hovered === "head" ? "#ff6347" : colors.head}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Cou */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
        <meshStandardMaterial color={colors.head} roughness={0.5} />
      </mesh>

      {/* Torse */}
      <mesh
        position={[0, 0.7, 0]}
        onPointerOver={() => setHovered("torso")}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial
          color={hovered === "torso" ? "#ff6347" : colors.torso}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Bras gauche */}
      <group
        position={[-0.5, 1, 0]}
        onPointerOver={() => setHovered("leftArm")}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
          <meshStandardMaterial
            color={hovered === "leftArm" ? "#ff6347" : colors.leftArm}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 16]} />
          <meshStandardMaterial
            color={hovered === "leftArm" ? "#ff6347" : colors.leftArm}
            roughness={0.5}
          />
        </mesh>
        {/* Main gauche */}
        <mesh position={[0, -1.45, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={colors.leftArm} roughness={0.5} />
        </mesh>
      </group>

      {/* Bras droit */}
      <group
        position={[0.5, 1, 0]}
        onPointerOver={() => setHovered("rightArm")}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
          <meshStandardMaterial
            color={hovered === "rightArm" ? "#ff6347" : colors.rightArm}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 16]} />
          <meshStandardMaterial
            color={hovered === "rightArm" ? "#ff6347" : colors.rightArm}
            roughness={0.5}
          />
        </mesh>
        {/* Main droite */}
        <mesh position={[0, -1.45, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={colors.rightArm} roughness={0.5} />
        </mesh>
      </group>

      {/* Jambe gauche */}
      <group
        position={[-0.2, 0, 0]}
        onPointerOver={() => setHovered("leftLeg")}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
          <meshStandardMaterial
            color={hovered === "leftLeg" ? "#ff6347" : colors.leftLeg}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.8, 16]} />
          <meshStandardMaterial
            color={hovered === "leftLeg" ? "#ff6347" : colors.leftLeg}
            roughness={0.5}
          />
        </mesh>
        {/* Pied gauche */}
        <mesh position={[0, -1.8, 0.1]}>
          <boxGeometry args={[0.2, 0.15, 0.35]} />
          <meshStandardMaterial color={colors.leftLeg} roughness={0.5} />
        </mesh>
      </group>

      {/* Jambe droite */}
      <group
        position={[0.2, 0, 0]}
        onPointerOver={() => setHovered("rightLeg")}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
          <meshStandardMaterial
            color={hovered === "rightLeg" ? "#ff6347" : colors.rightLeg}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.8, 16]} />
          <meshStandardMaterial
            color={hovered === "rightLeg" ? "#ff6347" : colors.rightLeg}
            roughness={0.5}
          />
        </mesh>
        {/* Pied droit */}
        <mesh position={[0, -1.8, 0.1]}>
          <boxGeometry args={[0.2, 0.15, 0.35]} />
          <meshStandardMaterial color={colors.rightLeg} roughness={0.5} />
        </mesh>
      </group>

      {/* Points vitaux - Cœur */}
      <mesh position={[0.15, 0.9, 0.25]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Points vitaux - Poumons */}
      <mesh position={[-0.2, 0.8, 0.15]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#00bfff"
          emissive="#00bfff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0.2, 0.8, 0.15]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#00bfff"
          emissive="#00bfff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Pulse effect pour le cœur */}
      <PulsingHeart position={[0.15, 0.9, 0.25]} />
    </group>
  );
}

// Effet de pulsation pour le cœur
function PulsingHeart({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color="#ff1744"
        emissive="#ff1744"
        emissiveIntensity={1}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Composant principal exporté
export default function HumanBody3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Chargement du modèle 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl overflow-hidden">
      {/* Labels informatifs */}
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 shadow-lg">
        <p className="text-sm font-semibold text-gray-800">
          🫀 Modèle anatomique interactif
        </p>
        <p className="text-xs text-gray-600">Survolez pour explorer</p>
      </div>

      {/* Canvas Three.js */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />

        {/* Lumières */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

        {/* Environnement */}
        <Environment preset="sunset" />

        {/* Corps humain */}
        <HumanBody />

        {/* Sol */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2.5, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#e0e0e0" opacity={0.3} transparent />
        </mesh>
      </Canvas>

      {/* Indicateurs de santé */}
      <div className="absolute bottom-4 right-4 z-10 space-y-2">
        <div className="flex items-center space-x-2 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg">
          <div className="size-3 animate-pulse rounded-full bg-red-500"></div>
          <span className="text-xs font-semibold text-gray-800">Cœur</span>
        </div>
        <div className="flex items-center space-x-2 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg">
          <div className="size-3 rounded-full bg-blue-500"></div>
          <span className="text-xs font-semibold text-gray-800">Poumons</span>
        </div>
      </div>
    </div>
  );
}
