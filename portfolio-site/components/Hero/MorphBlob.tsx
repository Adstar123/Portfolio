"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Custom shader material for the blob
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simplex 3D noise (compact GLSL implementation)
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec3 pos = position;
    vec3 norm = normalize(normal);

    // Layered noise displacement
    float t = uTime * 0.3;
    float noise1 = snoise(pos * 0.8 + t);
    float noise2 = snoise(pos * 1.6 + t * 1.3) * 0.5;
    float noise3 = snoise(pos * 3.2 + t * 0.7) * 0.25;
    float displacement = (noise1 + noise2 + noise3) * 0.35;

    // Mouse proximity push
    if (uMouseInfluence > 0.01) {
      float dist = length(pos.xy - uMouse);
      if (dist < 3.0) {
        float pushForce = (1.0 - dist / 3.0) * 0.4 * uMouseInfluence;
        displacement += pushForce;
      }
    }

    vDisplacement = displacement;
    pos += norm * displacement;

    vNormal = normalMatrix * norm;
    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);

    // Base amber colour
    vec3 baseColor = vec3(0.96, 0.62, 0.04); // #f59e0b

    // Warm tint based on displacement
    vec3 warmTint = mix(
      vec3(0.96, 0.62, 0.04),  // amber
      vec3(0.94, 0.27, 0.27),  // warm red
      clamp(vDisplacement * 1.5 + 0.3, 0.0, 1.0)
    );

    // Fresnel rim lighting
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    vec3 rimColor = vec3(0.98, 0.75, 0.18) * fresnel * 1.2; // golden rim

    // Diffuse lighting from multiple directions
    vec3 light1Dir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 light2Dir = normalize(vec3(-0.8, -0.6, 0.8));
    vec3 light3Dir = normalize(vec3(0.0, -1.0, -0.6));

    float diff1 = max(dot(normal, light1Dir), 0.0);
    float diff2 = max(dot(normal, light2Dir), 0.0) * 0.5;
    float diff3 = max(dot(normal, light3Dir), 0.0) * 0.25;

    // Specular highlights
    vec3 halfDir = normalize(light1Dir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0) * 0.8;

    vec3 ambient = warmTint * 0.15;
    vec3 diffuse = warmTint * (diff1 + diff2 + diff3);
    vec3 specular = vec3(1.0, 0.9, 0.7) * spec;

    vec3 color = ambient + diffuse + specular + rimColor;

    // Metallic look: darken non-reflecting areas
    color = mix(color * 0.3, color, 0.4 + fresnel * 0.6 + diff1 * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Blob Mesh — GPU-displaced sphere with custom shader
// ---------------------------------------------------------------------------

function Blob({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const segments = isMobile ? 48 : 80;
  const baseRadius = 2.2;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: isMobile ? 0 : 1 },
    }),
    [isMobile]
  );

  // Track mouse
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

    uniforms.uTime.value = state.clock.elapsedTime;

    if (!isMobile) {
      uniforms.uMouse.value.set(
        mouseRef.current.x * viewport.width * 0.5,
        mouseRef.current.y * viewport.height * 0.5
      );
    }

    // Slow rotation
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[baseRadius, segments, segments]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
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
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true, powerPreference: "default" }}
      >
        <Blob isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
