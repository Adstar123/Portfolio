"use client";

const ITEMS = [
  "Engineer",
  "AI Systems",
  "Full-Stack",
  "Cloud",
  "Distributed",
  "NSW DCS",
  "Sydney",
];

export default function Marquee() {
  // Repeat enough times to fill > 200vw with the longest item set
  const sequence = Array.from({ length: 4 }).flatMap(() => ITEMS);

  return (
    <div
      className="relative w-full overflow-hidden border-y py-7"
      style={{
        borderColor: "rgba(242, 239, 232, 0.14)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
      aria-hidden
    >
      <div
        className="flex gap-[60px] whitespace-nowrap"
        style={{
          animation: "marquee 32s linear infinite",
          willChange: "transform",
          width: "max-content",
        }}
      >
        {[...sequence, ...sequence].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-[60px] font-display"
            style={{
              fontSize: "clamp(28px, 4.4vw, 56px)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "#f2efe8",
            }}
          >
            <span
              className="font-serif italic"
              style={{ color: "#ff5b1f", marginRight: 28 }}
            >
              ✦
            </span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
