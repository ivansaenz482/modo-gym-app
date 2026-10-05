'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Plate({ x, color, radius }: { x: number; color: string; radius: number }) {
  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, 0.26, 48]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.85}
        roughness={0.25}
      />
    </mesh>
  );
}

function Dumbbell() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return (
    <group ref={ref} rotation={[0.18, 0, 0.12]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 4.5, 32]} />
        <meshStandardMaterial color="#cfcfda" metalness={1} roughness={0.18} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 1.6, 32]} />
        <meshStandardMaterial color="#14141c" metalness={0.5} roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Plate x={s * 1.65} color="#ff7a18" radius={0.95} />
          <Plate x={s * 1.98} color="#a855f7" radius={0.7} />
        </group>
      ))}
    </group>
  );
}

function Orb({
  position,
  color,
  scale,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
}) {
  return (
    <Float speed={2} rotationIntensity={1.6} floatIntensity={1.8}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.4}
          roughness={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.7} castShadow />
      <pointLight position={[-6, -2, -4]} intensity={45} color="#a855f7" />
      <pointLight position={[6, 3, 4]} intensity={35} color="#ff7a18" />

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.1}>
        <Dumbbell />
      </Float>

      <Orb position={[-3.3, 1.9, -1]} color="#22d3ee" scale={0.75} />
      <Orb position={[3.2, -1.7, -1]} color="#a855f7" scale={0.95} />
      <Orb position={[2.7, 2.3, -2]} color="#ff7a18" scale={0.55} />

      <ContactShadows position={[0, -2.4, 0]} opacity={0.5} scale={12} blur={2.6} far={5} color="#000000" />
    </Canvas>
  );
}
