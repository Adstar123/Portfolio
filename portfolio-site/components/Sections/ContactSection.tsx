"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

type Status = "idle" | "pending" | "ok" | "err";

const SIDEBAR = [
  {
    label: "Direct",
    iconLabel: "✉",
    text: "adstar3108@gmail.com",
    href: "mailto:adstar3108@gmail.com",
    iconify: "mdi:email-outline",
  },
  {
    label: "Code",
    iconLabel: "⌘",
    text: "@Adstar123",
    href: "https://github.com/Adstar123",
    iconify: "mdi:github",
  },
  {
    label: "Network",
    iconLabel: "in",
    text: "/in/adam-jarick",
    href: "https://linkedin.com/in/adam-jarick-1154b7211",
    iconify: "mdi:linkedin",
  },
  {
    label: "Phone",
    iconLabel: "☎",
    text: "0431 773 937",
    href: "tel:+61431773937",
    iconify: "mdi:phone-outline",
  },
];

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setStatusMsg("Sending…");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("err");
      setStatusMsg("Please fill in every field");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data?.error || "Send failed");
      }
      setStatus("ok");
      setStatusMsg("Sent. I'll be in touch.");
      setName("");
      setEmail("");
      setMessage("");
      setTouched({});
    } catch (err) {
      const e = err as Error;
      setStatus("err");
      setStatusMsg(e.message || "Send failed");
    }
  }

  return (
    <section
      id="contact"
      className="relative z-[10] py-[120px] md:py-[160px] px-[var(--pad)]"
    >
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-12 gap-x-8 mb-12 pb-10 border-b"
          style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
        >
          <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              005 / Ground
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(56px, 10vw, 160px)",
                fontWeight: 500,
                lineHeight: 0.9,
                letterSpacing: "-0.045em",
                maxWidth: "14ch",
              }}
            >
              Let&apos;s build{" "}
              <span
                className="font-serif italic"
                style={{ color: "#ff5b1f", fontWeight: 400 }}
              >
                something.
              </span>
            </h2>
          </div>
        </motion.div>

        {/* Form + sidebar */}
        <div
          className="grid grid-cols-12 gap-x-8 gap-y-12 pt-8"
          style={{ borderTop: "1px solid rgba(242, 239, 232, 0.14)" }}
        >
          {/* Form */}
          <motion.form
            ref={formRef}
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="col-span-12 md:col-span-7 flex flex-col gap-7"
            noValidate
          >
            <Field
              num="01"
              label="Name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(v) => {
                setName(v);
                if (status !== "idle" && status !== "pending") setStatus("idle");
              }}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              error={touched.name && !name.trim() ? "Required" : undefined}
            />
            <Field
              num="02"
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@somewhere.com"
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (status !== "idle" && status !== "pending") setStatus("idle");
              }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={
                touched.email && !email.trim()
                  ? "Required"
                  : touched.email &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  ? "Invalid"
                  : undefined
              }
            />
            <Field
              num="03"
              label="Message"
              name="message"
              type="textarea"
              placeholder="Tell me about the project, the idea, or just say hey."
              value={message}
              onChange={(v) => {
                setMessage(v);
                if (status !== "idle" && status !== "pending") setStatus("idle");
              }}
              onBlur={() => setTouched((t) => ({ ...t, message: true }))}
              error={touched.message && !message.trim() ? "Required" : undefined}
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                type="submit"
                disabled={status === "pending"}
                data-cursor-hover
                className="inline-flex items-center gap-3 px-7 py-4 font-mono text-[11px] tracking-[0.22em] uppercase transition-all"
                style={{
                  background: "#ff5b1f",
                  color: "#07080a",
                  border: "1px solid #ff5b1f",
                }}
              >
                <span>{status === "pending" ? "Sending" : "Send message"}</span>
                <span style={{ display: "inline-block" }}>→</span>
              </button>
              <span
                className="font-mono text-[11px] tracking-[0.14em] uppercase"
                style={{
                  color:
                    status === "err"
                      ? "#e0664f"
                      : status === "ok"
                      ? "#ff5b1f"
                      : "#b8b4a8",
                  minHeight: 16,
                }}
                aria-live="polite"
              >
                {statusMsg}
              </span>
            </div>
          </motion.form>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="col-span-12 md:col-span-5"
          >
            <div
              className="md:pl-8 space-y-3"
              style={{ borderLeft: "1px solid rgba(242, 239, 232, 0.14)" }}
            >
              <div
                className="font-mono text-[10px] tracking-[0.22em] uppercase pb-3"
                style={{
                  color: "#6e6b62",
                  borderBottom: "1px solid rgba(242, 239, 232, 0.14)",
                  marginBottom: 12,
                }}
              >
                Direct lines
              </div>
              {SIDEBAR.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  data-cursor-hover
                  className="group grid items-center gap-3 py-3 transition-all"
                  style={{
                    gridTemplateColumns: "28px 1fr 16px",
                    color: "#f2efe8",
                    borderBottom: "1px solid rgba(242, 239, 232, 0.06)",
                  }}
                >
                  <span
                    className="grid place-items-center w-7 h-7 transition-colors"
                    style={{
                      border: "1px solid rgba(242, 239, 232, 0.14)",
                      color: "#ff5b1f",
                    }}
                  >
                    <Icon icon={item.iconify} width={14} height={14} />
                  </span>
                  <span className="font-display text-[15px]">{item.text}</span>
                  <span
                    className="font-mono text-[12px] transition-transform"
                    style={{ color: "#6e6b62" }}
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  num,
  label,
  name,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
}: {
  num: string;
  label: string;
  name: string;
  type: "text" | "email" | "textarea";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase"
        style={{ color: "#6e6b62" }}
      >
        <span style={{ color: "#ff5b1f" }}>{num}</span>
        {label}
        {error && (
          <span style={{ color: "#e0664f", marginLeft: "auto" }}>{error}</span>
        )}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full bg-transparent py-3 outline-none transition-colors resize-y font-display"
          style={{
            borderBottom: error
              ? "1px solid #e0664f"
              : "1px solid rgba(242, 239, 232, 0.14)",
            color: "#f2efe8",
            fontSize: 16,
            lineHeight: 1.5,
            minHeight: 110,
          }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="w-full bg-transparent py-3 outline-none transition-colors font-display"
          style={{
            borderBottom: error
              ? "1px solid #e0664f"
              : "1px solid rgba(242, 239, 232, 0.14)",
            color: "#f2efe8",
            fontSize: 17,
          }}
        />
      )}
    </div>
  );
}
