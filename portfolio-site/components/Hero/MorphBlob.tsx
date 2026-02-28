"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { createNoise4D } from "simplex-noise";

// ---------------------------------------------------------------------------
// Blob Mesh — vertex-displaced sphere with metallic material
// ---------------------------------------------------------------------------

const noise4D = createNoise4D();

function Blob({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const segments = isMobile ? 64 : 128;
  const baseRadius = 2.2;

  // Store original positions and normals
  const { originalPositions, originalNormals } = useMemo(() => {
    const geo = new THREE.SphereGeometry(baseRadius, segments, segments);
    geo.computeVertexNormals();
    return {
      originalPositions: new Float32Array(geo.attributes.position.array),
      originalNormals: new Float32Array(geo.attributes.normal.array),
    };
  }, [segments, baseRadius]);

  // Track mouse in normalised coords
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    }
    if (!isMobile) {
      window.addEventListener("mousemove", onMouseMove);
      return () => window.removeEventListener("mousemove", onMouseMove);
    }
  }, [isMobile]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const geo = meshRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;

    // Convert mouse to world space for proximity effect
    const mouseWorldX = mouseRef.current.x * viewport.width * 0.5;
    const mouseWorldY = mouseRef.current.y * viewport.height * 0.5;

    const octaves = isMobile ? 2 : 3;

    for (let i = 0; i < positions.length; i += 3) {
      const ox = originalPositions[i];
      const oy = originalPositions[i + 1];
      const oz = originalPositions[i + 2];

      // Normalise original position for noise input
      const nx = ox / baseRadius;
      const ny = oy / baseRadius;
      const nz = oz / baseRadius;

      // Layered noise displacement
      let displacement = 0;
      let amplitude = 0.35;
      let frequency = 1.0;

      for (let o = 0; o < octaves; o++) {
        displacement +=
          noise4D(
            nx * frequency,
            ny * frequency,
            nz * frequency,
            time * 0.3
          ) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }

      // Mouse proximity push/pull (desktop only)
      if (!isMobile) {
        const dx = ox - mouseWorldX;
        const dy = oy - mouseWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy + oz * oz);
        if (dist < 3) {
          const pushForce = (1 - dist / 3) * 0.4;
          displacement += pushForce;
        }
      }

      // Apply displacement along normal direction
      const normalX = originalNormals[i];
      const normalY = originalNormals[i + 1];
      const normalZ = originalNormals[i + 2];

      positions[i] = ox + normalX * displacement;
      positions[i + 1] = oy + normalY * displacement;
      positions[i + 2] = oz + normalZ * displacement;
    }

    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();

    // Slow rotation
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[baseRadius, segments, segments]} />
      <meshPhysicalMaterial
        color="#f59e0b"
        metalness={0.92}
        roughness={0.12}
        envMapIntensity={1.2}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Lighting rig — warm amber feel
// ---------------------------------------------------------------------------

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#fef3c7" />
      <pointLight position={[5, 5, 5]} intensity={80} color="#f59e0b" />
      <pointLight position={[-4, -3, 4]} intensity={40} color="#fbbf24" />
      <pointLight position={[0, -5, -3]} intensity={20} color="#ef4444" />
      <directionalLight
        position={[0, 0, -5]}
        intensity={1.5}
        color="#f97316"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported wrapper
// ---------------------------------------------------------------------------

export default function MorphBlob() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(
      typeof window !== "undefined" && window.innerWidth < 768
    );
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Lighting />
        <Environment preset="night" />
        <Blob isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
