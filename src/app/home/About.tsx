import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { scrollToId } from "./scroll";
import likerPortrait from "../../_images/liker-portrait.jpeg";

/** Below-the-fold "About" section. Lazy-loaded from App.tsx. */
export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-24 md:py-32 max-w-6xl mx-auto px-6 md:px-12"
      style={{ scrollMarginTop: "60px" }}
    >
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Image col */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div
            className="absolute -top-5 -left-5 w-full h-full rounded-2xl"
            style={{
              background: "var(--accent)",
              opacity: 0.15,
            }}
          />
          <img
            src={likerPortrait}
            alt="Portrait of your coach"
            className="relative rounded-2xl w-full object-cover shadow-lg"
            loading="lazy"
            decoding="async"
            style={{ maxHeight: "560px" }}
          />
          {/* Floating badge */}
          <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl px-6 py-4 shadow-xl border border-border">
            <p
              className="text-accent"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              15+
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontSize: "0.78rem",
                marginTop: "2px",
              }}
            >
              Years Coaching
            </p>
          </div>
        </motion.div>

        {/* Text col */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p
            className="text-accent tracking-[0.18em] uppercase mb-4"
            style={{ fontSize: "0.75rem", fontWeight: 700 }}
          >
            About Me
          </p>
          <h2
            id="about-heading"
            className="text-foreground mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            Hello, I'm <span style={{ textDecoration: "underline" }}>your coach</span> Chelsea!
          </h2>
          <p className="text-muted-foreground mb-5" style={{ lineHeight: 1.8 }}>
            Through my 15+ years in mental-health coaching, I’ve learned that real, lasting
            growth rarely comes from pushing harder or adding more to your to-do list. Instead
            of focusing on perfection, we focus on meaningful progress.
          </p>
          <p className="text-muted-foreground mb-5" style={{ lineHeight: 1.8 }}>
            If you're tired of constantly feeling like you're "working on yourself," my goal is
            to help make personal growth feel natural and integrated into your everyday life.
          </p>
          <p className="text-muted-foreground mb-8" style={{ lineHeight: 1.8 }}>
            Often, true progress is simply about returning to the fundamentals. It begins with
            developing a deeper understanding of yourself—your challenges, strengths, and needs.
          </p>
          <a
            href="#coaching"
            onClick={scrollToId("coaching")}
            className="inline-flex items-center gap-2 text-primary"
            style={{ fontWeight: 700, fontSize: "0.95rem" }}
          >
            See how I can help <ArrowRight size={16} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
