"use client";

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Amber blob — top left */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent 70%)",
          top: "-10%",
          left: "-5%",
          filter: "blur(80px)",
          animation: "aurora-drift-1 18s ease-in-out infinite",
        }}
      />
      {/* Warm red blob — centre right */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(239, 68, 68, 0.5), transparent 70%)",
          top: "20%",
          right: "-10%",
          filter: "blur(100px)",
          animation: "aurora-drift-2 22s ease-in-out infinite",
        }}
      />
      {/* Gold blob — bottom centre */}
      <div
        className="absolute w-[550px] h-[550px] rounded-full opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%)",
          bottom: "-15%",
          left: "30%",
          filter: "blur(90px)",
          animation: "aurora-drift-3 15s ease-in-out infinite",
        }}
      />
    </div>
  );
}
