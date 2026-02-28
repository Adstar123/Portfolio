"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Icosahedron() {
  const meshRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  const edgesGeometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1.8, 1);
    return new THREE.EdgesGeometry(ico);
  }, []);

  const solidGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1.8, 1);
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;

    // Slow base rotation
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;

    // Breathing scale
    const breathe = 1 + Math.sin(t * 0.5) * 0.05;
    meshRef.current.scale.setScalar(breathe);

    // Mouse attraction (subtle)
    targetRotation.current.x = mouseRef.current.y * 0.3;
    targetRotation.current.y = mouseRef.current.x * 0.3;

    meshRef.current.rotation.x +=
      (targetRotation.current.x - meshRef.current.rotation.x) * 0.02;
    meshRef.current.rotation.z +=
      (targetRotation.current.y * 0.5 - meshRef.current.rotation.z) * 0.02;
  });

  return (
    <group ref={meshRef}>
      {/* Wireframe edges */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.35}
          linewidth={1}
        />
      </lineSegments>

      {/* Secondary wireframe — slightly larger, fainter */}
      <lineSegments
        geometry={edgesGeometry}
        scale={1.15}
        rotation={[0.3, 0.5, 0.1]}
      >
        <lineBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.1}
          linewidth={1}
        />
      </lineSegments>

      {/* Very faint solid fill for depth */}
      <mesh geometry={solidGeometry}>
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point vertices */}
      <points geometry={solidGeometry}>
        <pointsMaterial
          color="#fbbf24"
          size={0.04}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function WireframeIcosahedron() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-[1] transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true, powerPreference: "default" }}
      >
        <Icosahedron />
      </Canvas>
    </div>
  );
}
