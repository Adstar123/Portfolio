"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Icosahedron() {
  const meshRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const smoothScale = useRef(1);
  const introProgress = useRef(0);

  // Drag state
  const isDragging = useRef(false);
  const dragTarget = useRef({ x: 0, y: 0 });
  const smoothPosition = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });
  const grabOffset = useRef({ x: 0, y: 0 });

  const { viewport } = useThree();

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

      if (isDragging.current) {
        const rawX = (e.clientX / window.innerWidth - 0.5) * viewport.width;
        const rawY = -(e.clientY / window.innerHeight - 0.5) * viewport.height;
        const newX = rawX - grabOffset.current.x;
        const newY = rawY - grabOffset.current.y;
        dragVelocity.current = {
          x: newX - lastDragPos.current.x,
          y: newY - lastDragPos.current.y,
        };
        lastDragPos.current = { x: newX, y: newY };
        dragTarget.current = { x: newX, y: newY };
      }
    }

    function onMouseDown(e: MouseEvent) {
      // Check if click is roughly over the icosahedron (centre area of screen)
      const nx = Math.abs(e.clientX / window.innerWidth - 0.5);
      const ny = Math.abs(e.clientY / window.innerHeight - 0.5);
      if (nx < 0.25 && ny < 0.3) {
        isDragging.current = true;
        const clickX = (e.clientX / window.innerWidth - 0.5) * viewport.width;
        const clickY = -(e.clientY / window.innerHeight - 0.5) * viewport.height;
        // Store offset between click and shape's current position
        grabOffset.current = {
          x: clickX - smoothPosition.current.x,
          y: clickY - smoothPosition.current.y,
        };
        // Set drag target to current position so it doesn't snap before first mousemove
        dragTarget.current = {
          x: smoothPosition.current.x,
          y: smoothPosition.current.y,
        };
        lastDragPos.current = {
          x: smoothPosition.current.x,
          y: smoothPosition.current.y,
        };
        dragVelocity.current = { x: 0, y: 0 };
      }
    }

    function onMouseUp() {
      isDragging.current = false;
    }

    function onScroll() {
      const progress = Math.min(
        window.scrollY / (window.innerHeight * 0.8),
        1
      );
      scrollRef.current = progress;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("scroll", onScroll);
    };
  }, [viewport.width, viewport.height]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;

    // Intro scale-up: ease from 0 to 1 over ~1.5 seconds
    if (introProgress.current < 1) {
      introProgress.current = Math.min(introProgress.current + 0.012, 1);
    }
    // Smooth ease-out curve for intro
    const introScale = 1 - Math.pow(1 - introProgress.current, 3);

    // Smooth scroll-based scale (lerp for buttery smooth)
    const targetScale =
      (1 - scrollRef.current * 0.3) * (1 + Math.sin(t * 0.5) * 0.05);
    smoothScale.current += (targetScale - smoothScale.current) * 0.08;
    meshRef.current.scale.setScalar(smoothScale.current * introScale);

    // Slow base rotation
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;

    // Mouse attraction (noticeable)
    targetRotation.current.x = mouseRef.current.y * 0.8;
    targetRotation.current.y = mouseRef.current.x * 0.8;

    meshRef.current.rotation.x +=
      (targetRotation.current.x - meshRef.current.rotation.x) * 0.06;
    meshRef.current.rotation.z +=
      (targetRotation.current.y * 0.7 - meshRef.current.rotation.z) * 0.06;

    // Drag position — follow drag or spring back to centre
    if (isDragging.current) {
      smoothPosition.current.x +=
        (dragTarget.current.x - smoothPosition.current.x) * 0.15;
      smoothPosition.current.y +=
        (dragTarget.current.y - smoothPosition.current.y) * 0.15;
    } else {
      // Apply velocity as momentum then decay
      smoothPosition.current.x += dragVelocity.current.x;
      smoothPosition.current.y += dragVelocity.current.y;
      dragVelocity.current.x *= 0.92;
      dragVelocity.current.y *= 0.92;

      // Spring back to centre
      smoothPosition.current.x += (0 - smoothPosition.current.x) * 0.03;
      smoothPosition.current.y += (0 - smoothPosition.current.y) * 0.03;
    }

    meshRef.current.position.set(
      smoothPosition.current.x,
      smoothPosition.current.y,
      0
    );
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
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Stage 1: mount the canvas (hidden)
    const mountTimer = setTimeout(() => setMounted(true), 400);
    // Stage 2: fade in after canvas has had a frame to render
    const showTimer = setTimeout(() => setVisible(true), 600);
    return () => {
      clearTimeout(mountTimer);
      clearTimeout(showTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="absolute inset-0 z-[1]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 1.2s ease-out",
        cursor: "grab",
      }}
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
