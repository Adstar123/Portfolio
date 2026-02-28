"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParticleData {
  /** Current positions (mutated every frame) */
  positions: Float32Array;
  /** Original rest positions (immutable after init) */
  originals: Float32Array;
  /** Per-particle velocity for ambient drift */
  velocities: Float32Array;
  /** Per-instance colours (r, g, b) */
  colors: Float32Array;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createParticleData(count: number): ParticleData {
  const positions = new Float32Array(count * 3);
  const originals = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorA = new THREE.Color("#3b82f6"); // blue
  const colorB = new THREE.Color("#8b5cf6"); // purple
  const colorC = new THREE.Color("#06b6d4"); // cyan
  const tmp = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // Distribute points in a sphere (radius ~3.5)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3.5 * Math.cbrt(Math.random()); // cube-root for uniform volume

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    const i3 = i * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    originals[i3] = x;
    originals[i3 + 1] = y;
    originals[i3 + 2] = z;

    // Small random ambient drift velocity
    velocities[i3] = (Math.random() - 0.5) * 0.002;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

    // Colour based on normalised x (-3.5 … 3.5 → 0 … 1)
    const t = (x / 3.5 + 1) / 2; // 0 at far left, 1 at far right
    if (t < 0.5) {
      tmp.copy(colorA).lerp(colorB, t * 2);
    } else {
      tmp.copy(colorB).lerp(colorC, (t - 0.5) * 2);
    }

    colors[i3] = tmp.r;
    colors[i3 + 1] = tmp.g;
    colors[i3 + 2] = tmp.b;
  }

  return { positions, originals, velocities, colors };
}

// ---------------------------------------------------------------------------
// Particles (Instanced Mesh)
// ---------------------------------------------------------------------------

function Particles({ data, count }: { data: ParticleData; count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Attach per-instance colour attribute once on mount
  useEffect(() => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    geo.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(data.colors, 3)
    );
  }, [data.colors]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const { pointer, viewport } = state;

    // Convert NDC pointer (-1…1) to world coords in the z=0 plane
    const mouseX = (pointer.x * viewport.width) / 2;
    const mouseY = (pointer.y * viewport.height) / 2;

    const repulsionRadius = 2.5;
    const repulsionRadiusSq = repulsionRadius * repulsionRadius;

    const { positions, originals, velocities } = data;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Ambient drift
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Mouse repulsion (in XY plane, comparing to z=0 projection)
      const dx = positions[i3] - mouseX;
      const dy = positions[i3 + 1] - mouseY;
      const distSq = dx * dx + dy * dy;

      if (distSq < repulsionRadiusSq && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / repulsionRadius) * 0.15;
        positions[i3] += (dx / dist) * force;
        positions[i3 + 1] += (dy / dist) * force;
      }

      // Lerp back toward original position
      positions[i3] += (originals[i3] - positions[i3]) * 0.008;
      positions[i3 + 1] += (originals[i3 + 1] - positions[i3 + 1]) * 0.008;
      positions[i3 + 2] += (originals[i3 + 2] - positions[i3 + 2]) * 0.008;

      // Update instance matrix
      dummy.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      dummy.scale.setScalar(0.025);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial toneMapped={false} vertexColors />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Constellation Lines
// ---------------------------------------------------------------------------

function ConstellationLines({
  data,
  count,
}: {
  data: ParticleData;
  count: number;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);

  // We only check the first ~100 particles for connections
  const checkCount = Math.min(count, 100);
  const maxSegments = checkCount * checkCount; // upper bound
  const linePositions = useMemo(
    () => new Float32Array(maxSegments * 6),
    [maxSegments]
  );

  useFrame(() => {
    if (!lineRef.current) return;

    const { positions } = data;
    const maxDist = 1.5;
    const maxDistSq = maxDist * maxDist;
    let idx = 0;

    for (let i = 0; i < checkCount; i++) {
      const i3 = i * 3;
      const ax = positions[i3];
      const ay = positions[i3 + 1];
      const az = positions[i3 + 2];

      for (let j = i + 1; j < checkCount; j++) {
        const j3 = j * 3;
        const dx = ax - positions[j3];
        const dy = ay - positions[j3 + 1];
        const dz = az - positions[j3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistSq) {
          linePositions[idx++] = ax;
          linePositions[idx++] = ay;
          linePositions[idx++] = az;
          linePositions[idx++] = positions[j3];
          linePositions[idx++] = positions[j3 + 1];
          linePositions[idx++] = positions[j3 + 2];
        }
      }
    }

    const geo = lineRef.current.geometry;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
    geo.setDrawRange(0, idx / 3); // each vertex is 3 floats
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ---------------------------------------------------------------------------
// Scene (shared data between Particles & ConstellationLines)
// ---------------------------------------------------------------------------

function ParticleScene({ count, isMobile }: { count: number; isMobile: boolean }) {
  const data = useMemo(() => createParticleData(count), [count]);

  return (
    <>
      <Particles data={data} count={count} />
      {!isMobile && <ConstellationLines data={data} count={count} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported wrapper
// ---------------------------------------------------------------------------

export default function ParticleField() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(
      typeof window !== "undefined" && window.innerWidth < 768
    );
  }, []);

  const count = isMobile ? 300 : 800;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
      >
        <ParticleScene count={count} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
