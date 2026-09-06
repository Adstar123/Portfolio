"use client";

import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// A levitating mass of thick oil, with a few droplets drifting near it as if
// they've just separated. The surface is displaced on the GPU by slow, broad
// noise only: no fine detail anywhere, because a viscous liquid has none. A
// thin-film thickness field swirls across it for the petrol sheen. Scrolling
// drags the mass like a suspended liquid (it lags, stretches, then settles),
// and the pointer presses a wide, soft dent into it.

// ─── Section poses ───────────────────────────────────────────────────────────
// Where the oil sits for each section (0 hero … 5 contact), kept to the edges
// wherever text needs the room. `scale` is the base size; the body itself is
// wider than tall (see BODY_STRETCH) and lumpy, so it reads larger.

type Pose = { x: number; y: number; z: number; scale: number };

const POSES: Pose[] = [
  { x: 2.35, y: -0.15, z: 0, scale: 1.15 }, // hero: right
  { x: -4.9, y: 0.5, z: -1.0, scale: 0.75 }, // about: left edge
  { x: 5.0, y: -2.8, z: -1.5, scale: 0.7 }, // experience: bottom-right corner
  { x: 0.2, y: 3.6, z: -2.0, scale: 0.9 }, // skills: top edge
  { x: -5.0, y: -1.7, z: -1.5, scale: 0.7 }, // projects: left
  { x: 3.4, y: -0.5, z: -0.5, scale: 0.95 }, // contact: right, medium
];

// The main body's resting proportions: a wide, low mass.
const BODY_STRETCH = new THREE.Vector3(1.75, 0.8, 1.0);

// Portrait phones: pull the edge poses in so they stay on screen, and lift
// the hero body above the headline instead of hiding it off the right edge.
function poseFor(index: number, aspect: number, out: Pose): Pose {
  const p = POSES[index];
  const narrow = aspect < 1;
  if (narrow && index === 0) {
    out.x = 0.3;
    out.y = 1.3;
    out.z = -0.6;
    out.scale = 0.62;
    return out;
  }
  const squeeze = Math.min(1, aspect / 1.6);
  out.x = p.x * squeeze;
  out.y = p.y;
  out.z = p.z;
  out.scale = narrow ? p.scale * 0.85 : p.scale;
  return out;
}

const poseA: Pose = { x: 0, y: 0, z: 0, scale: 1 };
const poseB: Pose = { x: 0, y: 0, z: 0, scale: 1 };

// Blend between the two poses a scroll progress value sits between.
function blendPose(
  progress: number,
  aspect: number,
  outPosition: THREE.Vector3
): number {
  const idxA = Math.max(0, Math.min(POSES.length - 1, Math.floor(progress)));
  const idxB = Math.max(0, Math.min(POSES.length - 1, idxA + 1));
  const t = THREE.MathUtils.clamp(progress - idxA, 0, 1);
  const ts = t * t * (3 - 2 * t);
  poseFor(idxA, aspect, poseA);
  poseFor(idxB, aspect, poseB);
  outPosition.set(
    THREE.MathUtils.lerp(poseA.x, poseB.x, ts),
    THREE.MathUtils.lerp(poseA.y, poseB.y, ts),
    THREE.MathUtils.lerp(poseA.z, poseB.z, ts)
  );
  return THREE.MathUtils.lerp(poseA.scale, poseB.scale, ts);
}

// ─── Oil shader ──────────────────────────────────────────────────────────────
// MeshPhysicalMaterial keeps its full lighting model (studio reflections,
// thin-film iridescence); these patches add GPU displacement, a matching
// recomputed normal, and a per-vertex film thickness.

// Simplex 3D noise (Ashima Arts / Stefan Gustavson, MIT)
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VERTEX_HEAD = /* glsl */ `
uniform float uTime;
uniform vec3 uPointer;   // pointer on the z = 0 plane, world units
uniform float uPoke;     // 0..1, whether the pointer is on the page
uniform float uSlosh;    // 0..1, scroll agitation
uniform float uFlow;     // accumulated scroll, drags the film
uniform float uScale;    // world units per local unit (mean of the axes)
uniform float uSeed;
uniform float uDetail;   // noise frequency multiplier; lower for small bodies
uniform float uShape;    // how far from a sphere the resting silhouette is
varying float vFilm;
${NOISE_GLSL}
// Two octaves, the second faint: used only for the film, where a little
// finer structure reads as swirl. The surface itself uses single octaves.
float fbm(vec3 p) {
  return 0.72 * snoise(p) + 0.28 * snoise(p * 1.7 + 7.7);
}
// Radius of the body along unit direction n, and the film thickness there.
float oilRadius(vec3 n, out float film) {
  float t = uTime;
  vec3 q = n * uDetail;
  // Silhouette: a few big lazy lobes that drift very slowly, so the mass
  // keeps re-forming without ever moving quickly. One octave only: every
  // extra octave reads as rock.
  float lobes = snoise(q * 0.62 + vec3(uSeed * 4.0, t * 0.03, -t * 0.025));
  // Flow: a broad swell that travels around the body. Sampled from a slowly
  // rotating frame so the surface appears to circulate.
  float c = cos(t * 0.05);
  float s = sin(t * 0.05);
  vec3 qr = vec3(c * q.x - s * q.z, q.y, s * q.x + c * q.z);
  float swell = snoise(qr * 0.85 + vec3(-t * 0.06, uSeed, t * 0.045));
  float r = 1.0 + uShape * lobes + 0.1 * swell;
  // Weight: the underside hangs lower, the way a thick liquid droops.
  float under = smoothstep(0.2, -0.8, n.y);
  r += under * uShape * 0.5 * (0.5 + 0.5 * lobes);
  // Scroll agitation: a slow, blobby wobble. No waves; waves crease.
  r += uSlosh * 0.14 * snoise(q * 0.7 + vec3(t * 0.6, uSeed * 2.0, -t * 0.45));
  // Pointer: one wide, soft push, measured in world units. The divisor is
  // floored so a small droplet is nudged, not crushed.
  vec3 wp = (modelMatrix * vec4(n * r, 1.0)).xyz;
  float d = distance(wp.xy, uPointer.xy);
  float push = exp(-d * d / 1.8);
  r -= uPoke * 0.3 * push / max(uScale, 0.8);
  // Film thickness: broad bands that swirl slowly, dragged by scroll, and
  // thinned where the surface is pushed.
  film = 0.5 + 0.5 * fbm(q * 0.95 + vec3(t * 0.035, uFlow + t * 0.025, uSeed * 2.0));
  film -= uPoke * 0.3 * push;
  film = clamp(film, 0.0, 1.0);
  return r;
}
vec3 oilPoint(vec3 n, out float film) {
  return n * oilRadius(n, film);
}
`;

// Replaces <beginnormal_vertex>: displace the vertex and rebuild its normal
// from two neighbouring displaced points.
const VERTEX_NORMAL = /* glsl */ `
vec3 oilN = normalize(position);
vec3 oilT = normalize(cross(oilN, abs(oilN.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
vec3 oilB = cross(oilN, oilT);
float oilFilm;
float oilF1;
float oilF2;
vec3 oilPos = oilPoint(oilN, oilFilm);
vec3 oilP1 = oilPoint(normalize(oilN + oilT * 0.03), oilF1);
vec3 oilP2 = oilPoint(normalize(oilN + oilB * 0.03), oilF2);
vec3 objectNormal = normalize(cross(oilP1 - oilPos, oilP2 - oilPos));
vFilm = oilFilm;
`;

type OilUniforms = {
  uTime: { value: number };
  uPointer: { value: THREE.Vector3 };
  uPoke: { value: number };
  uSlosh: { value: number };
  uFlow: { value: number };
  uScale: { value: number };
  uSeed: { value: number };
  uDetail: { value: number };
  uShape: { value: number };
};

// `detail` scales the noise frequencies (a small droplet needs coarser noise
// or it turns crinkly); `shape` sets how lumpy the resting silhouette is.
function makeOilMaterial(seed: number, detail: number, shape: number) {
  const uniforms: OilUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector3() },
    uPoke: { value: 0 },
    uSlosh: { value: 0 },
    uFlow: { value: 0 },
    uScale: { value: 1 },
    uSeed: { value: seed },
    uDetail: { value: detail },
    uShape: { value: shape },
  };
  // Dark chrome fluid. A metal's reflections take its base colour, so a mid
  // grey base keeps the studio reflections bright while the body reads dark
  // wherever it mirrors the dark parts of the room. The thin film supplies
  // the petrol colours; its thickness varies per vertex via vFilm.
  const material = new THREE.MeshPhysicalMaterial({
    color: "#56525a",
    metalness: 0.9,
    roughness: 0.05,
    envMapIntensity: 1.8,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [140, 620],
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      VERTEX_HEAD +
      shader.vertexShader
        .replace("#include <beginnormal_vertex>", VERTEX_NORMAL)
        .replace("#include <begin_vertex>", "vec3 transformed = oilPos;");
    shader.fragmentShader =
      "varying float vFilm;\n" +
      shader.fragmentShader.replace(
        "#include <lights_physical_fragment>",
        THREE.ShaderChunk.lights_physical_fragment.replace(
          "material.iridescenceThickness = iridescenceThicknessMaximum;",
          "material.iridescenceThickness = mix( iridescenceThicknessMinimum, iridescenceThicknessMaximum, vFilm );"
        )
      );
  };
  // All oil bodies share one program; only their uniforms differ.
  material.customProgramCacheKey = () => "oil-v2";
  return { material, uniforms };
}

// ─── Oil bodies ──────────────────────────────────────────────────────────────

// Droplets: relative size, how far out they drift (in body radii), and how
// fast they wander. Slightly wider than tall, like the main body.
// `reach` is in multiples of the body's half-width; the body's lobes extend
// to about 1.45, so anything under 1.65 would pass through it.
const DROPLETS = [
  { size: 0.3, reach: 1.7, rate: 0.16, phase: 0.0 },
  { size: 0.2, reach: 2.0, rate: -0.12, phase: 2.1 },
  { size: 0.14, reach: 1.8, rate: 0.2, phase: 4.0 },
  { size: 0.1, reach: 2.3, rate: -0.09, phase: 1.2 },
];
const DROPLET_STRETCH = new THREE.Vector3(1.2, 0.9, 1.0);

interface OilProps {
  scrollProgress: { current: number };
  pointer: { current: { x: number; y: number; active: boolean } };
  // Signed scroll impulse, positive when scrolling down. Decays here.
  driftRef: { current: number };
  flow: { current: number };
}

function Oil({ scrollProgress, pointer, driftRef, flow }: OilProps) {
  const mainRef = useRef<THREE.Mesh>(null);
  const dropRefs = useRef<Array<THREE.Mesh | null>>(DROPLETS.map(() => null));

  const bodies = useMemo(
    () => [
      makeOilMaterial(0.0, 1.0, 0.42),
      ...DROPLETS.map((_, k) => makeOilMaterial(1.3 + k * 1.7, 0.7, 0.28)),
    ],
    []
  );
  const mainGeometry = useMemo(() => new THREE.SphereGeometry(1, 180, 120), []);
  const dropGeometry = useMemo(() => new THREE.SphereGeometry(1, 96, 64), []);

  useEffect(() => {
    return () => {
      bodies.forEach((b) => b.material.dispose());
      mainGeometry.dispose();
      dropGeometry.dispose();
    };
  }, [bodies, mainGeometry, dropGeometry]);

  // Pose at mount, so the body is created in place (a phone gets its own
  // hero pose immediately rather than easing in from the desktop one).
  const getState = useThree((s) => s.get);
  const [initial] = useState(() => {
    const { size } = getState();
    const position = new THREE.Vector3();
    const scale = blendPose(
      scrollProgress.current,
      size.width / size.height,
      position
    );
    return { position, scale };
  });

  const time = useRef(0);
  const scale = useRef(initial.scale);
  const drag = useRef(0); // smoothed signed scroll drag
  const slosh = useRef(0);
  const poke = useRef(0);
  const pointerWorld = useRef(new THREE.Vector3());
  const targetPointer = useRef(new THREE.Vector3());
  const targetPosition = useRef(initial.position.clone());
  const tmpScale = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const main = mainRef.current;
    if (!main) return;
    // Clamp so a hitch can't jump the liquid; oil never moves suddenly.
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    const t = time.current;
    const aspect = state.size.width / state.size.height;

    // Scroll: the impulse decays on its own; the drag follows it slowly
    // (overdamped, so it settles without bouncing) and the wobble follows
    // its magnitude.
    driftRef.current *= Math.exp(-dt * 2.2);
    drag.current = THREE.MathUtils.lerp(
      drag.current,
      driftRef.current,
      Math.min(1, dt * 3)
    );
    slosh.current = THREE.MathUtils.lerp(
      slosh.current,
      Math.min(1, Math.abs(driftRef.current) * 1.4),
      Math.min(1, dt * 3)
    );

    // Pose for the current section, with a slow levitating bob. When the
    // page scrolls the mass lags behind (drag) like a liquid suspended in
    // the viewport, and stretches along the direction it's being pulled.
    const targetScale = blendPose(
      scrollProgress.current,
      aspect,
      targetPosition.current
    );
    targetPosition.current.y += Math.sin(t * 0.35) * 0.12 - drag.current * 0.7;
    targetPosition.current.x += Math.sin(t * 0.23 + 1.0) * 0.08;
    main.position.lerp(targetPosition.current, Math.min(1, dt * 1.6));
    scale.current = THREE.MathUtils.lerp(
      scale.current,
      targetScale,
      Math.min(1, dt * 1.6)
    );
    const stretch = Math.min(0.45, Math.abs(drag.current) * 0.5);
    tmpScale.current
      .copy(BODY_STRETCH)
      .multiply(
        tmpScale.current.set(1 - stretch * 0.45, 1 + stretch, 1 - stretch * 0.2)
      )
      .multiplyScalar(scale.current);
    main.scale.copy(tmpScale.current);

    // Droplets wander slowly around the body on their own paths, each on a
    // different rate, so they never fall into a pattern.
    DROPLETS.forEach((d, k) => {
      const drop = dropRefs.current[k];
      if (!drop) return;
      const a = t * d.rate + d.phase;
      const reach = scale.current * BODY_STRETCH.x * d.reach;
      // The path is an ellipse that stays clear of the body in depth too:
      // the body is deeper than it is tall, so the z radius stays generous.
      drop.position.set(
        main.position.x + Math.cos(a) * reach,
        main.position.y +
          Math.sin(a * 0.7 + d.phase) * reach * 0.35 -
          drag.current * 0.5 * (1 + k * 0.3),
        main.position.z + Math.sin(a) * reach * 0.8
      );
      const ds = scale.current * d.size;
      drop.scale.set(
        ds * DROPLET_STRETCH.x * (1 - stretch * 0.3),
        ds * DROPLET_STRETCH.y * (1 + stretch * 0.8),
        ds * DROPLET_STRETCH.z
      );
    });

    // Pointer on the z = 0 plane, in world units, followed with a viscous lag
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);
    targetPointer.current.set(
      (pointer.current.x * vp.width) / 2,
      (pointer.current.y * vp.height) / 2,
      0
    );
    pointerWorld.current.lerp(targetPointer.current, Math.min(1, dt * 3));
    poke.current = THREE.MathUtils.lerp(
      poke.current,
      pointer.current.active ? 1 : 0,
      Math.min(1, dt * 2.5)
    );

    const meshes = [main, ...dropRefs.current];
    bodies.forEach((b, i) => {
      const mesh = meshes[i];
      b.uniforms.uTime.value = t;
      b.uniforms.uPointer.value.copy(pointerWorld.current);
      b.uniforms.uPoke.value = poke.current;
      b.uniforms.uSlosh.value = slosh.current;
      b.uniforms.uFlow.value = flow.current;
      b.uniforms.uScale.value = mesh
        ? (mesh.scale.x + mesh.scale.y + mesh.scale.z) / 3
        : 1;
    });

    // Camera parallax from the pointer
    const cam = state.camera;
    cam.position.set(
      THREE.MathUtils.lerp(cam.position.x, pointer.current.x * 1.2, 0.06),
      THREE.MathUtils.lerp(cam.position.y, pointer.current.y * 0.9, 0.06),
      cam.position.z
    );
    cam.lookAt(0, 0, 0);
  });

  // The displaced surface reaches well outside the sphere's own bounds, so
  // leave frustum culling off; a handful of draw calls is nothing.
  return (
    <>
      <mesh
        ref={mainRef}
        geometry={mainGeometry}
        material={bodies[0].material}
        position={initial.position}
        scale={[
          initial.scale * BODY_STRETCH.x,
          initial.scale * BODY_STRETCH.y,
          initial.scale * BODY_STRETCH.z,
        ]}
        frustumCulled={false}
      />
      {DROPLETS.map((d, k) => (
        <mesh
          key={k}
          ref={(el) => {
            dropRefs.current[k] = el;
          }}
          geometry={dropGeometry}
          material={bodies[k + 1].material}
          position={[
            initial.position.x +
              Math.cos(d.phase) * initial.scale * BODY_STRETCH.x * d.reach,
            initial.position.y,
            initial.position.z,
          ]}
          scale={initial.scale * d.size}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

// ─── Procedural environment map ──────────────────────────────────────────────
// Renders a small "studio" cube map at runtime so the oil has something to
// reflect (an HDRi fetch would be blocked by CSP). The studio is mostly dark
// with a handful of crisp emitters: broad softboxes for the big highlights and
// thin light bars that streak across the surface as it moves. A liquid is only
// ever as interesting as what it reflects.
//
// Built synchronously from the Canvas' onCreated, before the first frame, so
// reflections are present from the very first paint.

function buildStudioEnvironment(gl: THREE.WebGLRenderer) {
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

  // Dark warm dome: faint warmth above, ember tint below the horizon, near
  // black underneath. Kept dark so the emitters read as distinct shapes.
  const domeGeo = new THREE.SphereGeometry(60, 64, 32);
  const domeColors: number[] = [];
  const domeColorAttr = domeGeo.attributes.position;
  const top = new THREE.Color("#4a3a32");
  const horizon = new THREE.Color("#241c18");
  const ember = new THREE.Color("#6a2408");
  const bottom = new THREE.Color("#0a0604");
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

  // Emitters: flat panels facing the origin. `color` may exceed 1.0. `roll`
  // tilts a panel about its own facing axis, for diagonal light bars.
  function addEmitter(
    color: THREE.Color,
    pos: THREE.Vector3,
    width: number,
    height: number,
    roll = 0
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
    if (roll) mesh.rotateZ(roll);
    envScene.add(mesh);
    disposables.push({ geo, mat });
  }

  // Key: one large cream softbox, upper-left-front.
  addEmitter(
    new THREE.Color(1.6, 1.5, 1.35),
    new THREE.Vector3(-10, 14, 14),
    26,
    26
  );
  // Fill: a dim warm panel front-right so facing areas don't fall to black.
  addEmitter(
    new THREE.Color(0.55, 0.5, 0.46),
    new THREE.Vector3(14, 4, 16),
    18,
    18
  );
  // Light bars: three thin, very hot strips at different angles. These draw
  // the sharp streaks that sweep across the surface as it moves.
  addEmitter(
    new THREE.Color(2.8, 2.7, 2.5),
    new THREE.Vector3(18, 5, -7),
    2.5,
    30
  );
  addEmitter(
    new THREE.Color(2.4, 2.3, 2.1),
    new THREE.Vector3(0, 16, 6),
    44,
    2.2,
    0.45
  );
  addEmitter(
    new THREE.Color(1.9, 1.8, 1.7),
    new THREE.Vector3(-14, -3, 10),
    2.2,
    30,
    -0.35
  );
  // Ember: a wide vermilion strip low and in front, the page accent
  // reflected on every downward-facing part of the surface.
  addEmitter(
    new THREE.Color(2.8, 0.9, 0.3),
    new THREE.Vector3(4, -11, 10),
    40,
    8
  );
  // Cool panel left-back: an oil-slick sheen needs a cold colour in the mix.
  addEmitter(
    new THREE.Color(0.45, 0.7, 1.1),
    new THREE.Vector3(-16, 1, -6),
    10,
    16
  );

  // Render the cubemap from origin
  const cubeCamera = new THREE.CubeCamera(0.1, 200, renderTarget);
  cubeCamera.update(gl, envScene);

  // The helper scene has done its job; only the render target lives on.
  disposables.forEach((d) => {
    d.geo.dispose();
    d.mat.dispose();
  });
  return renderTarget;
}

// ─── Lights ──────────────────────────────────────────────────────────────────

// The environment map does most of the lighting; these add sharp specular
// hits. The ember light drifts slowly so the reflections keep moving even
// while the pointer is still. (No ambient light: a metal has no diffuse term
// for it to affect.)
function Lights() {
  const emberRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!emberRef.current) return;
    const t = state.clock.elapsedTime;
    emberRef.current.position.set(
      3 + Math.sin(t * 0.35) * 1.4,
      -2.5 + Math.cos(t * 0.27) * 0.9,
      4 + Math.sin(t * 0.21) * 0.6
    );
  });

  return (
    <>
      {/* Cream key from upper-right */}
      <directionalLight position={[6, 8, 5]} intensity={2.5} color="#fff2d9" />
      {/* Ember from below-front, drifting */}
      <pointLight
        ref={emberRef}
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

interface OilSceneProps {
  // Called once the environment map is built and every shader is compiled,
  // i.e. the first frame will already look final. The page holds its loader
  // until then so reflections never pop in after the reveal.
  onReady?: () => void;
}

export default function OilScene({ onReady }: OilSceneProps) {
  const scrollProgress = useRef(0);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const drift = useRef(0);
  const flow = useRef(0);
  // This component is loaded with ssr: false, so window is safe to read here.
  const [enabled, setEnabled] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const envRef = useRef<THREE.WebGLCubeRenderTarget | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setEnabled(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Reduced motion shows a static gradient instead; nothing to wait for.
  useEffect(() => {
    if (!enabled) onReadyRef.current?.();
  }, [enabled]);

  // The environment render target outlives the Canvas' own scene graph, so
  // dispose it with the component.
  useEffect(() => {
    return () => {
      envRef.current?.dispose();
      envRef.current = null;
    };
  }, []);

  // Map scroll to a pose index based on the *current section*, and turn
  // scroll movement into a signed impulse for the drag.
  // Poses: 0 hero, 1 about, 2 experience, 3 skills, 4 projects, 5 contact.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let lastY = window.scrollY;
    const sectionPoses: { id: string; pose: number }[] = [
      { id: "hero", pose: 0 },
      { id: "about", pose: 1 },
      { id: "experience", pose: 2 },
      { id: "skills", pose: 3 },
      { id: "projects", pose: 4 },
      { id: "contact", pose: 5 },
    ];

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        drift.current = THREE.MathUtils.clamp(
          drift.current + (y - lastY) / 900,
          -1,
          1
        );
        lastY = y;
        flow.current = y * 0.0012;

        const viewMid = y + window.innerHeight / 2;
        const tops: { top: number; pose: number }[] = [];
        for (const sp of sectionPoses) {
          const el = document.getElementById(sp.id);
          if (!el) continue;
          tops.push({ top: el.offsetTop + el.offsetHeight / 2, pose: sp.pose });
        }
        tops.sort((a, b) => a.top - b.top);
        if (!tops.length) return;
        if (viewMid <= tops[0].top) {
          scrollProgress.current = tops[0].pose;
          return;
        }
        if (viewMid >= tops[tops.length - 1].top) {
          scrollProgress.current = tops[tops.length - 1].pose;
          return;
        }
        for (let i = 0; i < tops.length - 1; i++) {
          const a = tops[i];
          const b = tops[i + 1];
          if (viewMid >= a.top && viewMid <= b.top) {
            const t = (viewMid - a.top) / (b.top - a.top);
            scrollProgress.current = a.pose + (b.pose - a.pose) * t;
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
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.active = true;
    }
    function onLeave() {
      pointer.current.active = false;
    }
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Runs after the scene graph exists but before anything has rendered:
  // build the reflections, then compile every material against them (which
  // also pre-filters the environment map). Only then is the scene "ready".
  const handleCreated = useCallback(({ gl, scene, camera }: RootState) => {
    envRef.current?.dispose();
    const env = buildStudioEnvironment(gl);
    envRef.current = env;
    scene.environment = env.texture;
    gl.compileAsync(scene, camera).finally(() => onReadyRef.current?.());
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
      {/* Faint ember halo behind the oil, so the orange reflections have a
          visible source on the page */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 34vw 30vw at 74% 56%, rgba(255,91,31,0.16), transparent 65%)",
        }}
      />
      <Canvas
        dpr={[1, 1.6]}
        camera={{ fov: 38, position: [0, 0, 7] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={handleCreated}
        style={{ width: "100%", height: "100%" }}
      >
        <Lights />
        <Oil
          scrollProgress={scrollProgress}
          pointer={pointer}
          driftRef={drift}
          flow={flow}
        />
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
