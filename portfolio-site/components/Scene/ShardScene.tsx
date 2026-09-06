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

type ShardType = "octahedron" | "spindle" | "icosahedron" | "dodecahedron";
const SHARD_TYPES: ShardType[] = [
  "octahedron",
  "spindle",
  "icosahedron",
  "dodecahedron",
];
function shardType(i: number): ShardType {
  return SHARD_TYPES[i % SHARD_TYPES.length];
}
// Outer radius of each unit solid relative to its uniform scale. The spindle
// is an octahedron stretched along y, so it reaches further than the others.
const RADIUS_FACTOR: Record<ShardType, number> = {
  octahedron: 1,
  spindle: 1.35,
  icosahedron: 1,
  dodecahedron: 1,
};

// Stable random — seeded by index, so positions are deterministic across renders
function rand(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildFormations(): Formation[] {
  // Hero: ragged cluster on the right. Sizes are kept modest so individual
  // facets stay readable and the cluster doesn't swallow the section rail.
  const heroPositions: THREE.Vector3[] = [];
  const heroScales: number[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const r = 1.1 + rand(i, 1) * 1.5;
    const theta = (i / SHARD_COUNT) * Math.PI * 2 + rand(i, 2) * 0.8;
    const phi = Math.acos(2 * rand(i, 3) - 1);
    // Shallow depth range: a shard that drifts too close to the camera
    // balloons in perspective and crops against the HUD.
    heroPositions.push(
      new THREE.Vector3(
        2.7 + r * Math.sin(phi) * Math.cos(theta) * 1.0,
        -0.3 + r * Math.sin(phi) * Math.sin(theta) * 0.8,
        -0.4 + r * Math.cos(phi) * 0.95
      )
    );
    heroScales.push(0.28 + rand(i, 4) * 0.44);
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

  const formations: Formation[] = [
    { positions: heroPositions, scales: heroScales, cameraZ: 7, groupRotY: 0 },
    { positions: aboutPositions, scales: aboutScales, cameraZ: 8, groupRotY: 0.5 },
    { positions: trackPositions, scales: trackScales, cameraZ: 8, groupRotY: 1.0 },
    { positions: toolkitPositions, scales: toolkitScales, cameraZ: 7, groupRotY: 1.6 },
    { positions: workPositions, scales: workScales, cameraZ: 8, groupRotY: 2.2 },
    { positions: contactPositions, scales: contactScales, cameraZ: 7, groupRotY: 2.8 },
  ];
  for (const f of formations) separate(f.positions, f.scales);
  return formations;
}

// Nudge overlapping shards apart so each reads as a distinct object rather
// than a pile of interpenetrating solids. Deterministic; runs once at build.
function separate(positions: THREE.Vector3[], scales: number[]) {
  const d = new THREE.Vector3();
  for (let pass = 0; pass < 48; pass++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        d.subVectors(positions[j], positions[i]);
        const dist = d.length();
        // Solids are built with circumradius 1, so `scale` is the outer radius.
        const minDist =
          (scales[i] * RADIUS_FACTOR[shardType(i)] +
            scales[j] * RADIUS_FACTOR[shardType(j)]) *
          0.92;
        if (dist >= minDist || dist < 1e-4) continue;
        d.multiplyScalar(((minDist - dist) * 0.5) / dist);
        positions[i].sub(d);
        positions[j].add(d);
      }
    }
  }
}

// Which two formations a scroll progress value sits between, and how far
// along (smoothstepped). Shared by the frame loop and the initial placement
// so a freshly mounted shard starts exactly where the loop would put it.
function blendAt(formations: Formation[], p: number) {
  const idxA = Math.max(0, Math.min(formations.length - 1, Math.floor(p)));
  const idxB = Math.max(0, Math.min(formations.length - 1, idxA + 1));
  const t = THREE.MathUtils.clamp(p - idxA, 0, 1);
  const ts = t * t * (3 - 2 * t);
  return { fA: formations[idxA], fB: formations[idxB], ts };
}

// ─── Single shard ────────────────────────────────────────────────────────────

interface ShardProps {
  index: number;
  rotationSpeed: THREE.Vector3;
  geometryType: ShardType;
  // Where the shard is created. Without this a mesh spawns at the origin at
  // scale 1 and the first painted frame is a giant blob in the middle of the
  // viewport that then eases (or, after a shader-compile hitch, snaps) into
  // place.
  initialPosition: THREE.Vector3;
  initialScale: number;
  // A different starting orientation per shard, so they don't all present
  // the same facet (and the same shading) to the camera.
  initialRotation: [number, number, number];
}

function Shard({
  rotationSpeed,
  geometryType,
  initialPosition,
  initialScale,
  initialRotation,
}: ShardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const targetPos = useRef(initialPosition.clone());
  const targetScale = useRef(initialScale);

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

  // Unsubdivided solids: every face is one flat plane, so each facet catches a
  // single clean reflection instead of a smeared gradient. The outline is cut
  // from the same solid so it sits exactly on the bevels.
  const { geometry, edgeGeometry } = useMemo(() => {
    let solid: THREE.BufferGeometry;
    switch (geometryType) {
      case "spindle":
        // Octahedron drawn out along one axis: a classic crystal splinter.
        solid = new THREE.OctahedronGeometry(1, 0);
        solid.scale(1, 1.7, 1);
        break;
      case "icosahedron":
        solid = new THREE.IcosahedronGeometry(1, 0);
        break;
      case "dodecahedron":
        solid = new THREE.DodecahedronGeometry(1, 0);
        break;
      default:
        solid = new THREE.OctahedronGeometry(1, 0);
    }
    return { geometry: solid, edgeGeometry: new THREE.EdgesGeometry(solid) };
  }, [geometryType]);

  return (
    <>
      <mesh
        ref={meshRef}
        position={initialPosition}
        scale={initialScale}
        rotation={initialRotation}
      >
        <primitive object={geometry} attach="geometry" />
        {/*
          Dark polished steel. A metal's reflections are tinted by its base
          colour, so the base is a mid warm grey rather than near-black: the
          studio environment supplies the colour (cream key, vermilion ember),
          the metal just mirrors it.
        */}
        <meshPhysicalMaterial
          color="#bba898"
          metalness={0.9}
          roughness={0.28}
          envMapIntensity={2.0}
          clearcoat={1.0}
          clearcoatRoughness={0.14}
          flatShading
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments
        ref={edgesRef}
        position={initialPosition}
        scale={initialScale}
        rotation={initialRotation}
      >
        <primitive object={edgeGeometry} attach="geometry" />
        <lineBasicMaterial
          color="#ffd2b8"
          transparent
          opacity={0.3}
          depthWrite={false}
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
    return Array.from({ length: SHARD_COUNT }).map((_, i) => ({
      rotationSpeed: new THREE.Vector3(
        (rand(i, 91) - 0.5) * 0.4,
        (rand(i, 92) - 0.5) * 0.4,
        (rand(i, 93) - 0.5) * 0.3
      ),
      geometryType: shardType(i),
      initialRotation: [
        rand(i, 94) * Math.PI * 2,
        rand(i, 95) * Math.PI * 2,
        rand(i, 96) * Math.PI * 2,
      ] as [number, number, number],
    }));
  }, []);

  // Formation blend at mount time, so each shard is created in place rather
  // than at the origin. On a top-of-page load this is the hero cluster.
  const initialTransforms = useMemo(() => {
    const { fA, fB, ts } = blendAt(formations, scrollProgress.current);
    return Array.from({ length: SHARD_COUNT }).map((_, i) => ({
      position: new THREE.Vector3().lerpVectors(
        fA.positions[i],
        fB.positions[i],
        ts
      ),
      scale: THREE.MathUtils.lerp(fA.scales[i], fB.scales[i], ts),
    }));
  }, [formations, scrollProgress]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const { fA, fB, ts } = blendAt(formations, scrollProgress.current);

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
          initialPosition={initialTransforms[i].position}
          initialScale={initialTransforms[i].scale}
          initialRotation={p.initialRotation}
        />
      ))}
    </group>
  );
}

// ─── Procedural environment map ──────────────────────────────────────────────
// Renders a small "studio" cube map at runtime so the metal has something to
// reflect (an HDRi fetch would be blocked by CSP). The studio is mostly dark
// with a few distinct emitters, so a facet is either catching one of them
// (a clean bright plane) or falling to near-black. That contrast is what
// makes faceted metal read as polished rather than muddy.

function ProceduralEnv() {
  const { scene, gl } = useThree();
  useEffect(() => {
    const size = 512;
    const renderTarget = new THREE.WebGLCubeRenderTarget(size, {
      // Half-float so emitters can exceed 1.0 and survive tone mapping as
      // genuinely hot highlights instead of clipping to flat white.
      type: THREE.HalfFloatType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    const envScene = new THREE.Scene();
    const disposables: Array<{
      geo: THREE.BufferGeometry;
      mat: THREE.Material;
    }> = [];

    // Dark warm dome: faint warmth above, ember tint below the horizon,
    // black underneath.
    const domeGeo = new THREE.SphereGeometry(60, 64, 32);
    const domeColors: number[] = [];
    const domeColorAttr = domeGeo.attributes.position;
    const top = new THREE.Color("#4a3a30");
    const horizon = new THREE.Color("#1c1512");
    const ember = new THREE.Color("#5a1c08");
    const bottom = new THREE.Color("#000000");
    const tmp = new THREE.Color();
    for (let i = 0; i < domeColorAttr.count; i++) {
      const y = domeColorAttr.getY(i) / 60; // -1..1
      let col: THREE.Color;
      if (y > 0) {
        col = tmp.copy(horizon).lerp(top, y);
      } else if (y > -0.45) {
        col = tmp.copy(ember).lerp(horizon, (y + 0.45) / 0.45);
      } else {
        col = tmp.copy(bottom).lerp(ember, (y + 1) / 0.55);
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

    // Emitters: flat panels facing the origin. `color` may exceed 1.0.
    function addEmitter(
      color: THREE.Color,
      pos: THREE.Vector3,
      width: number,
      height: number
    ) {
      const geo = new THREE.PlaneGeometry(width, height);
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

    // Key: one large cream softbox, upper-left-front. Broad bright facets.
    disposables.push(
      addEmitter(
        new THREE.Color(1.8, 1.7, 1.5),
        new THREE.Vector3(-10, 14, 14),
        28,
        28
      )
    );
    // Fill: a big dim panel front-right so camera-facing facets lift to a
    // readable warm grey instead of dropping to black.
    disposables.push(
      addEmitter(
        new THREE.Color(0.55, 0.5, 0.45),
        new THREE.Vector3(14, 4, 16),
        20,
        20
      )
    );
    // Rim: a tall thin white strip, right and behind. Thin hard highlights
    // that trace the bevels and separate shards from the dark page.
    disposables.push(
      addEmitter(
        new THREE.Color(2.4, 2.3, 2.1),
        new THREE.Vector3(18, 5, -7),
        3.5,
        28
      )
    );
    // Ember: a wide vermilion strip low and in front, the page accent
    // reflected on every downward-facing facet.
    disposables.push(
      addEmitter(
        new THREE.Color(2.6, 0.85, 0.3),
        new THREE.Vector3(4, -11, 10),
        40,
        9
      )
    );
    // A small cool panel far left so not every reflection is warm.
    disposables.push(
      addEmitter(
        new THREE.Color("#2a3648"),
        new THREE.Vector3(-16, -2, -4),
        8,
        8
      )
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

// The environment map does most of the lighting; these three just add sharp
// specular hits that move as the group rotates. (No ambient light: a metal
// has no diffuse term for it to affect.)
function Lights() {
  return (
    <>
      {/* Cream key from upper-right */}
      <directionalLight position={[6, 8, 5]} intensity={3} color="#fff2d9" />
      {/* Ember from below-front */}
      <pointLight
        position={[3, -2.5, 4]}
        intensity={5}
        color="#ff5b1f"
        distance={12}
        decay={1.6}
      />
      {/* Pale rim from behind-left for silhouette separation */}
      <directionalLight
        position={[-4, 2, -5]}
        intensity={1.2}
        color="#ffd9b8"
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
        {/* Page-coloured fog: far shards sink into the background for depth */}
        <fog attach="fog" args={["#07080a", 7, 13]} />
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
