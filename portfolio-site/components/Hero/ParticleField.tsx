"use client";

import dynamic from "next/dynamic";
import AuroraBackground from "./AuroraBackground";
import LampEffect from "./LampEffect";
import FloatingParticles from "./FloatingParticles";

const WireframeIcosahedron = dynamic(
  () => import("./WireframeIcosahedron"),
  { ssr: false }
);

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <AuroraBackground />
      <LampEffect />
      <WireframeIcosahedron />
      <FloatingParticles count={25} />
    </div>
  );
}
