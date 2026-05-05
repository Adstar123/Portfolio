"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ─── Section formations ──────────────────────────────────────────────────────

type Formation = {
  positions: THREE.Vector3[];
  scales: number[];
  cameraZ: number;
  groupRotY: number;
};

const SHARD_COUNT = 22;

// Stable random — seeded by index, so positions are deterministic across renders
function rand(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildFormations(): Formation[] {
  // Hero: tight ragged cluster on the right
  const heroPositions: THREE.Vector3[] = [];
  const heroScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const r = 1.0 + rand(i, 1) * 1.4;
    const theta = (i / SHARD_COUNT) * Math.PI * 2 + rand(i, 2) * 0.8;
    const phi = Math.acos(2 * rand(i, 3) - 1);
    heroPositions.push(
      new THREE.Vector3(
        2.6 + r * Math.sin(phi) * Math.cos(theta) * 1.05,
        -0.2 + r * Math.sin(phi) * Math.sin(theta) * 0.8,
        -0.2 + r * Math.cos(phi) * 1.3
      )
    );
    heroScales.push(0.4 + rand(i, 4) * 0.55);
  }

  // About: shards drift outward to the left edge in a vertical column
  const aboutPositions: THREE.Vector3[] = [];
  const aboutScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    aboutPositions.push(
      new THREE.Vector3(
        -5.5 + rand(i, 11) * 1.2,
        -3 + (i / SHARD_COUNT) * 6 + rand(i, 12) * 0.6,
        -1.2 + rand(i, 13) * 1.5
      )
    );
    aboutScales.push(0.18 + rand(i, 14) * 0.28);
  }

  // Track Record: dispersed scatter on far edges (top + bottom corners)
  const trackPositions: THREE.Vector3[] = [];
  const trackScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const sideX = i % 2 === 0 ? -5.5 : 5.5;
    const sideY = i % 4 < 2 ? 3.2 : -3.2;
    trackPositions.push(
      new THREE.Vector3(
        sideX + (rand(i, 21) - 0.5) * 1.2,
        sideY + (rand(i, 22) - 0.5) * 1.6,
        -2 + rand(i, 23) * 2
      )
    );
    trackScales.push(0.18 + rand(i, 24) * 0.28);
  }

  // Toolkit: edges only — top/bottom horizontal bands
  const toolkitPositions: THREE.Vector3[] = [];
  const toolkitScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const top = i % 2 === 0;
    toolkitPositions.push(
      new THREE.Vector3(
        -5 + rand(i, 31) * 10,
        top ? 3.4 + rand(i, 32) * 1.5 : -3.4 - rand(i, 33) * 1.5,
        -1.5 + rand(i, 34) * 2.5
      )
    );
    toolkitScales.push(0.16 + rand(i, 35) * 0.28);
  }

  // Work: split cluster — pushed off both extreme sides
  const workPositions: THREE.Vector3[] = [];
  const workScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const side = i < SHARD_COUNT / 2 ? -1 : 1;
    const r = 0.7 + rand(i, 41) * 0.8;
    const theta = rand(i, 42) * Math.PI * 2;
    workPositions.push(
      new THREE.Vector3(
        side * 5.6 + Math.cos(theta) * r * 0.4,
        Math.sin(theta) * r * 0.6 + (rand(i, 43) - 0.5) * 0.8,
        -2.5 + rand(i, 44) * 2.0
      )
    );
    workScales.push(0.22 + rand(i, 45) * 0.32);
  }

  // Contact: regrouped tight cluster on the right
  const contactPositions: THREE.Vector3[] = [];
  const contactScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const r = 0.8 + rand(i, 51) * 0.6;
    const theta = (i / SHARD_COUNT) * Math.PI * 2;
    const phi = Math.acos(2 * (i / SHARD_COUNT) - 1);
    contactPositions.push(
      new THREE.Vector3(
        4.0 + r * Math.sin(phi) * Math.cos(theta) * 0.8,
        -0.5 + r * Math.sin(phi) * Math.sin(theta) * 0.7,
        -1 + r * Math.cos(phi) * 0.8
      )
    );
    contactScales.push(0.28 + rand(i, 52) * 0.28);
  }

  return [
    { positions: heroPositions, scales: heroScales, cameraZ: 7, groupRotY: 0 },
    { positions: aboutPositions, scales: aboutScales, cameraZ: 8, groupRotY: 0.5 },
    { positions: trackPositions, scales: trackScales, cameraZ: 8, groupRotY: 1.0 },
    { positions: toolkitPositions, scales: toolkitScales, cameraZ: 7, groupRotY: 1.6 },
    { positions: workPositions, scales: workScales, cameraZ: 8, groupRotY: 2.2 },
    { positions: contactPositions, scales: contactScales, cameraZ: 7, groupRotY: 2.8 },
  ];
}

// ─── Single shard ────────────────────────────────────────────────────────────

interface ShardProps {
  index: number;
  rotationSpeed: THREE.Vector3;
  geometryType: "octahedron" | "tetrahedron" | "icosahedron" | "dodecahedron";
}

function Shard({ rotationSpeed, geometryType }: ShardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const targetPos = useRef(new THREE.Vector3());
  const targetScale = useRef(0.5);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const lerpAmt = Math.min(1, delta * 2.0);
    meshRef.current.position.lerp(targetPos.current, lerpAmt);
    const s = meshRef.current.scale.x;
    const ts = THREE.MathUtils.lerp(s, targetScale.current, lerpAmt);
    meshRef.current.scale.set(ts, ts, ts);

    meshRef.current.rotation.x += rotationSpeed.x * delta;
    meshRef.current.rotation.y += rotationSpeed.y * delta;
    meshRef.current.rotation.z += rotationSpeed.z * delta;

    if (edgesRef.current) {
      edgesRef.current.position.copy(meshRef.current.position);
      edgesRef.current.scale.copy(meshRef.current.scale);
      edgesRef.current.rotation.copy(meshRef.current.rotation);
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.targetPos = targetPos.current;
      meshRef.current.userData.targetScale = (s: number) => {
        targetScale.current = s;
      };
    }
  }, []);

  const geometry = useMemo(() => {
    // Mild subdivision adds extra facets without losing the low-poly feel,
    // so light catches more varied angles.
    switch (geometryType) {
      case "tetrahedron":
        return new THREE.TetrahedronGeometry(1, 1);
      case "icosahedron":
        return new THREE.IcosahedronGeometry(1, 1);
      case "dodecahedron":
        return new THREE.DodecahedronGeometry(1, 0);
      default:
        return new THREE.OctahedronGeometry(1, 1);
    }
  }, [geometryType]);

  // Edges from a coarser version so the wireframe still reads as low-poly
  const edgeGeometry = useMemo(() => {
    let coarse: THREE.BufferGeometry;
    switch (geometryType) {
      case "tetrahedron":
        coarse = new THREE.TetrahedronGeometry(1, 0);
        break;
      case "icosahedron":
        coarse = new THREE.IcosahedronGeometry(1, 0);
        break;
      case "dodecahedron":
        coarse = new THREE.DodecahedronGeometry(1, 0);
        break;
      default:
        coarse = new THREE.OctahedronGeometry(1, 0);
    }
    const eg = new THREE.EdgesGeometry(coarse);
    coarse.dispose();
    return eg;
  }, [geometryType]);

  return (
    <>
      <mesh ref={meshRef}>
        <primitive object={geometry} attach="geometry" />
        <meshPhysicalMaterial
          color="#1a0a04"
          emissive="#ff3d10"
          emissiveIntensity={0.04}
          metalness={1.0}
          roughness={0.08}
          envMapIntensity={4.5}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          iridescence={0.45}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[100, 800]}
          flatShading
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <primitive object={edgeGeometry} attach="geometry" />
        <lineBasicMaterial
          color="#ff7a3d"
          transparent
          opacity={0.55}
          linewidth={1}
        />
      </lineSegments>
    </>
  );
}

// ─── Cluster ─────────────────────────────────────────────────────────────────

interface ClusterProps {
  scrollProgress: { current: number };
  pointer: { x: number; y: number };
}

function Cluster({ scrollProgress, pointer }: ClusterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const formations = useMemo(() => buildFormations(), []);
  const { camera } = useThree();

  const shardProps = useMemo(() => {
    const types: Array<"octahedron" | "tetrahedron" | "icosahedron" | "dodecahedron"> = [
      "octahedron",
      "tetrahedron",
      "icosahedron",
      "dodecahedron",
    ];
    return Array.from({ length: SHARD_COUNT }).map((_, i) => ({
      rotationSpeed: new THREE.Vector3(
        (rand(i, 91) - 0.5) * 0.4,
        (rand(i, 92) - 0.5) * 0.4,
        (rand(i, 93) - 0.5) * 0.3
      ),
      geometryType: types[i % 4],
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const p = scrollProgress.current;
    const idxA = Math.max(0, Math.min(formations.length - 1, Math.floor(p)));
    const idxB = Math.max(0, Math.min(formations.length - 1, idxA + 1));
    const t = THREE.MathUtils.clamp(p - idxA, 0, 1);
    const ts = t * t * (3 - 2 * t);

    const fA = formations[idxA];
    const fB = formations[idxB];

    groupRef.current.children
      .filter((c) => (c as THREE.Mesh).isMesh)
      .forEach((mesh, i) => {
        if (!(mesh as THREE.Mesh).userData.targetPos) return;
        const targetPos: THREE.Vector3 = (mesh as THREE.Mesh).userData.targetPos;
        const setScale: (s: number) => void = (mesh as THREE.Mesh).userData.targetScale;
        targetPos.lerpVectors(fA.positions[i], fB.positions[i], ts);
        setScale(THREE.MathUtils.lerp(fA.scales[i], fB.scales[i], ts));
      });

    // Camera parallax + zoom per section — much stronger pointer response
    const targetCamX = pointer.x * 1.6;
    const targetCamY = pointer.y * 1.2;
    const targetCamZ = THREE.MathUtils.lerp(fA.cameraZ, fB.cameraZ, ts);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.05);
    camera.lookAt(0, 0, 0);

    // Group rotation reacts strongly to pointer + scroll
    const scrollRotY = THREE.MathUtils.lerp(fA.groupRotY, fB.groupRotY, ts);
    const targetGroupRotY = scrollRotY + pointer.x * 0.6;
    const targetGroupRotX = pointer.y * -0.4;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetGroupRotY,
      0.06
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetGroupRotX,
      0.06
    );
    // Slow ambient drift on top of pointer-driven rotation
    groupRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group ref={groupRef}>
      {shardProps.map((p, i) => (
        <Shard
          key={i}
          index={i}
          rotationSpeed={p.rotationSpeed}
          geometryType={p.geometryType}
        />
      ))}
    </group>
  );
}

// ─── Procedural environment map ──────────────────────────────────────────────
// Builds a bright orange/cream gradient cube map at runtime so PBR metals
// have something to reflect (avoiding the CSP-blocked HDRi fetch).

function ProceduralEnv() {
  const { scene, gl } = useThree();
  useEffect(() => {
    const size = 512;
    const renderTarget = new THREE.WebGLCubeRenderTarget(size, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    const envScene = new THREE.Scene();
    const disposables: Array<{
      geo: THREE.BufferGeometry;
      mat: THREE.Material;
    }> = [];

    // Gradient sky dome — bright cream upper, hot orange middle, deep shadow below
    // This is the main reflection source the metals will pick up.
    const domeGeo = new THREE.SphereGeometry(60, 64, 32);
    const domeColors: number[] = [];
    const domeColorAttr = domeGeo.attributes.position;
    const top = new THREE.Color("#fff1d0");
    const upper = new THREE.Color("#ffc26a");
    const mid = new THREE.Color("#ff5b1f");
    const lower = new THREE.Color("#3a0d04");
    const bottom = new THREE.Color("#000000");
    const tmp = new THREE.Color();
    for (let i = 0; i < domeColorAttr.count; i++) {
      const y = domeColorAttr.getY(i) / 60; // -1..1
      let col: THREE.Color;
      if (y > 0.6) {
        const t = (y - 0.6) / 0.4;
        col = tmp.copy(upper).lerp(top, t);
      } else if (y > 0.0) {
        const t = y / 0.6;
        col = tmp.copy(mid).lerp(upper, t);
      } else if (y > -0.5) {
        const t = (y + 0.5) / 0.5;
        col = tmp.copy(lower).lerp(mid, t);
      } else {
        const t = (y + 1) / 0.5;
        col = tmp.copy(bottom).lerp(lower, t);
      }
      domeColors.push(col.r, col.g, col.b);
    }
    domeGeo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(domeColors, 3)
    );
    const domeMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      toneMapped: false,
    });
    envScene.add(new THREE.Mesh(domeGeo, domeMat));
    disposables.push({ geo: domeGeo, mat: domeMat });

    // Add specific hot spots on top of the gradient
    function addEmissiveQuad(
      color: string,
      pos: THREE.Vector3,
      size: number
    ) {
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.lookAt(0, 0, 0);
      envScene.add(mesh);
      return { geo, mat };
    }

    // PURE WHITE blazing key spec for the brightest highlights
    disposables.push(
      addEmissiveQuad("#ffffff", new THREE.Vector3(15, 14, 8), 14)
    );
    disposables.push(
      addEmissiveQuad("#fff8e0", new THREE.Vector3(-10, 12, 4), 14)
    );
    // Hot orange under-glow
    disposables.push(
      addEmissiveQuad("#ff5b1f", new THREE.Vector3(0, -8, 6), 30)
    );
    // Cool blue accent for facet break-up
    disposables.push(
      addEmissiveQuad("#284878", new THREE.Vector3(-14, 0, 8), 14)
    );

    // Render the cubemap from origin
    const cubeCamera = new THREE.CubeCamera(0.1, 200, renderTarget);
    cubeCamera.update(gl, envScene);

    scene.environment = renderTarget.texture;

    return () => {
      renderTarget.dispose();
      disposables.forEach((d) => {
        d.geo.dispose();
        d.mat.dispose();
      });
      scene.environment = null;
    };
  }, [scene, gl]);

  return null;
}

// ─── Lights ──────────────────────────────────────────────────────────────────

function Lights() {
  return (
    <>
      <ambientLight intensity={0.08} />
      {/* Hard cream key from upper-right giving sharp specular hits */}
      <directionalLight position={[5, 6, 4]} intensity={4.5} color="#fff2d8" />
      {/* Hot orange rim from front-below */}
      <pointLight
        position={[3, -2, 4]}
        intensity={6}
        color="#ff5b1f"
        distance={11}
        decay={1.4}
      />
      {/* Sharp white spec for hot-spot facets */}
      <pointLight
        position={[1, 3, 6]}
        intensity={2.5}
        color="#ffffff"
        distance={10}
        decay={1.8}
      />
      {/* Back rim deep copper for outline glow */}
      <directionalLight
        position={[-2, -1, -3]}
        intensity={1.0}
        color="#d24513"
      />
    </>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export default function ShardScene() {
  const scrollProgress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setEnabled(false);
    const onChange = () => setEnabled(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Map scroll to formation index based on the *current section*.
  // Formations: 0 hero, 1 about, 2 experience, 3 skills, 4 projects, 5 contact.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const sectionFormations: { id: string; formation: number }[] = [
      { id: "hero", formation: 0 },
      { id: "about", formation: 1 },
      { id: "experience", formation: 2 },
      { id: "skills", formation: 3 },
      { id: "projects", formation: 4 },
      { id: "contact", formation: 5 },
    ];

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const viewMid = window.scrollY + window.innerHeight / 2;
        const tops: { top: number; formation: number }[] = [];
        for (const sf of sectionFormations) {
          const el = document.getElementById(sf.id);
          if (!el) continue;
          tops.push({
            top: el.offsetTop + el.offsetHeight / 2,
            formation: sf.formation,
          });
        }
        tops.sort((a, b) => a.top - b.top);
        if (!tops.length) return;
        if (viewMid <= tops[0].top) {
          scrollProgress.current = tops[0].formation;
          return;
        }
        if (viewMid >= tops[tops.length - 1].top) {
          scrollProgress.current = tops[tops.length - 1].formation;
          return;
        }
        for (let i = 0; i < tops.length - 1; i++) {
          const a = tops[i];
          const b = tops[i + 1];
          if (viewMid >= a.top && viewMid <= b.top) {
            const t = (viewMid - a.top) / (b.top - a.top);
            scrollProgress.current = a.formation + (b.formation - a.formation) * t;
            return;
          }
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onMove(e: PointerEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.x = x;
      pointer.current.y = y;
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!enabled) {
    return (
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 40vw 40vw at 70% 50%, rgba(255,91,31,0.25), transparent 60%)",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0"
      style={{ contain: "strict" }}
    >
      <Canvas
        dpr={[1, 1.6]}
        camera={{ fov: 38, position: [0, 0, 7] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ProceduralEnv />
        <Lights />
        <Cluster scrollProgress={scrollProgress} pointer={pointer.current} />
      </Canvas>
      {/* Soft vignette so type stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 25% 50%, rgba(7,8,10,0.78), transparent 60%), linear-gradient(to bottom, rgba(7,8,10,0.45), transparent 30%, rgba(7,8,10,0.55))",
        }}
      />
    </div>
  );
}
