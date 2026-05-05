"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer
      className="relative z-[10] flex items-center justify-between flex-wrap gap-3 px-[var(--pad)] py-7"
      style={{
        borderTop: "1px solid rgba(242, 239, 232, 0.14)",
        color: "#6e6b62",
      }}
    >
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
        © {year} Adam Jarick · Made with Three.js, Motion, and too much coffee
      </span>
      <button
        type="button"
        onClick={backToTop}
        data-cursor-hover
        className="font-mono text-[10px] tracking-[0.18em] uppercase transition-colors"
        style={{ color: "#ff5b1f" }}
      >
        Back to top ↑
      </button>
    </footer>
  );
}
