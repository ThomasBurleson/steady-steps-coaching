import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { scrollToSection } from "../utils/scroll";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1623967680551-3e4694e2c9ad?w=1800&h=900&fit=crop&auto=format";

/**
 * Above-the-fold hero. Kept eager (not lazy) — it holds the LCP image, so it
 * must render on first paint. The hero image is loaded eagerly with a
 * `fetchpriority="high"` hint to prioritise the LCP candidate.
 *
 * Note: React 18's DOM renderer doesn't map the camelCase `fetchPriority` prop
 * (that's React 19), so we spread the lowercase `fetchpriority` attribute — React
 * passes unknown lowercase attributes straight to the DOM, and the spread keeps
 * TypeScript happy (its img types only know the camelCase form).
 */
export default function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative h-screen min-h-[600px] flex items-end overflow-hidden"
    >
      <div className="absolute inset-0 bg-foreground/20" style={{ zIndex: 1 }} />
      <img
        src={HERO_IMAGE}
        alt="Forest path winding through tall trees"
        className="absolute inset-0 w-full h-full object-cover"
        {...{ fetchpriority: "high" }}
        style={{ zIndex: 0 }}
      />

      {/* Gradient overlay for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(45,36,23,0.85) 0%, rgba(45,36,23,0.3) 50%, transparent 100%)",
          zIndex: 2,
        }}
      />

      <div
        className="relative w-full max-w-6xl mx-auto px-6 md:px-12 pb-20 md:pb-28"
        style={{ zIndex: 3 }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-accent mb-4 tracking-[0.2em] uppercase inline-block"
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            background: "rgba(0,0,0,0.75)",
            padding: "6px 10px",
            borderRadius: "6px",
          }}
        >
          Life Coaching · Personal Growth
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-white mb-6"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 4.5vw, 3rem)",
            fontWeight: 500,
            lineHeight: 1.12,
            display: "flex",
            flexDirection: "column",
            width: "fit-content",
            paddingBottom: "12px",
          }}
        >
          <span>Improve your life,</span>
          <em
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 600,
              color: "#F5D9A8",
              lineHeight: 1.05,
              textAlign: "right",
            }}
          >
            one steady step at a time.
          </em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/80 max-w-xl mb-10"
          style={{ fontSize: "1.05rem", lineHeight: 1.7 }}
        >
          Thoughtful 1-on-1 guidance and consistent support for lasting personal growth and
          mental health.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors"
            style={{ fontWeight: 700 }}
          >
            Begin Your Journey <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            href="#about"
            onClick={scrollToSection("about")}
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/40 text-white rounded-full hover:bg-white/10 transition-colors"
          >
            Learn More <ChevronDown size={16} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
