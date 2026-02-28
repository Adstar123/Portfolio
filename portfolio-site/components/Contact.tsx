"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Send, CircleCheck, CircleAlert, Github, Linkedin, Mail, Phone } from "lucide-react";
import { socialLinks } from "@/lib/data";

type Status = "idle" | "sending" | "success" | "error";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone,
};

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setFormState({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 bg-background">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-heading text-4xl md:text-6xl font-bold gradient-text mb-4"
        >
          Let&apos;s Build Something Brilliant
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="font-body text-lg text-text-secondary mb-12"
        >
          Got a project in mind or just want to say hey? Drop me a line.
        </motion.p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={(e) =>
                setFormState((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="Name"
              className="peer w-full bg-surface border border-white/5 rounded-xl px-5 pt-6 pb-2 font-body text-text-primary outline-none placeholder-transparent focus:border-transparent focus:ring-2 focus:ring-accent-amber/50 transition-all"
            />
            <label
              htmlFor="name"
              className="absolute left-5 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-accent-amber peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Name
            </label>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formState.email}
              onChange={(e) =>
                setFormState((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="Email"
              className="peer w-full bg-surface border border-white/5 rounded-xl px-5 pt-6 pb-2 font-body text-text-primary outline-none placeholder-transparent focus:border-transparent focus:ring-2 focus:ring-accent-amber/50 transition-all"
            />
            <label
              htmlFor="email"
              className="absolute left-5 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-accent-amber peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Email
            </label>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formState.message}
              onChange={(e) =>
                setFormState((s) => ({ ...s, message: e.target.value }))
              }
              placeholder="Message"
              className="peer w-full bg-surface border border-white/5 rounded-xl px-5 pt-6 pb-2 font-body text-text-primary outline-none placeholder-transparent resize-none focus:border-transparent focus:ring-2 focus:ring-accent-amber/50 transition-all"
            />
            <label
              htmlFor="message"
              className="absolute left-5 top-4 text-text-secondary text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-accent-amber peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Message
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.button
              type="submit"
              disabled={status === "sending"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-heading font-bold text-black flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed bg-accent-amber hover:bg-accent-amber-hover transition-colors"
            >
              {status === "idle" && (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
              {status === "sending" && "Sending..."}
              {status === "success" && (
                <>
                  <CircleCheck size={18} />
                  Sent!
                </>
              )}
              {status === "error" && (
                <>
                  <CircleAlert size={18} />
                  Something went wrong
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 mt-12">
          {socialLinks.map((link, i) => {
            const Icon = iconMap[link.icon];
            if (!Icon) return null;

            const isExternal = link.url.startsWith("http");

            return (
              <motion.a
                key={link.name}
                href={link.url}
                aria-label={link.name}
                {...(isExternal && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.2, y: -2 }}
                className="p-3 rounded-full bg-surface border border-white/5 text-text-secondary hover:text-text-primary hover:glow-amber transition-colors"
              >
                <Icon size={20} />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
