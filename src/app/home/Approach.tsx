import { motion } from "motion/react";
import { ArrowRight, Compass, Leaf, Star } from "lucide-react";
import { scrollToSection } from "../utils/scroll";

const FOREST_IMAGE =
  "https://images.unsplash.com/photo-1692719525723-f179a6a86955?w=700&h=900&fit=crop&auto=format";

const approachSteps = [
  {
    icon: Compass,
    label: "Clarify",
    description:
      "Get clear on what matters—your values, priorities, and the outcomes you actually want.",
  },
  {
    icon: Leaf,
    label: "Simplify",
    description: "Cut through the noise. Reduce friction and define the next easy step.",
  },
  {
    icon: Star,
    label: "Stabilize",
    description: "Build routines that fit your energy and life—steady, repeatable, and kind.",
  },
  {
    icon: ArrowRight,
    label: "Sustain",
    description: "Keep what works. Review wins, adjust gently, and protect your bandwidth.",
  },
];

/** Below-the-fold "Approach" section (4-step grid + divider). Lazy-loaded. */
export default function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="py-24 md:py-32 max-w-6xl mx-auto px-6 md:px-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <p
          className="text-accent tracking-[0.18em] uppercase mb-4"
          style={{ fontSize: "0.75rem", fontWeight: 700 }}
        >
          The Steady Steps Approach
        </p>
        <h2
          id="approach-heading"
          className="text-foreground max-w-2xl mx-auto"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          Change happens in steps. We work through every one.
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {approachSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "var(--secondary)" }}
              >
                <Icon
                  size={22}
                  aria-hidden="true"
                  className="text-primary group-hover:text-accent transition-colors"
                />
              </div>
              <h3
                className="text-foreground mb-3"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                }}
              >
                {step.label}
              </h3>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.75,
                }}
              >
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Divider image */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-16 rounded-2xl overflow-hidden relative"
        style={{ height: "280px" }}
      >
        <img
          src={FOREST_IMAGE}
          alt="Peaceful forest path"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(45,36,23,0.55)" }}
        >
          <p
            className="text-white text-center max-w-xl px-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              lineHeight: 1.5,
            }}
          >
            "You don't need a perfect plan — you need a steady next step."
          </p>
        </div>
      </motion.div>

      <div className="flex justify-end mt-6">
        <a
          href="#testimonials"
          onClick={scrollToSection("testimonials")}
          className="inline-flex items-center gap-2 text-primary"
          style={{ fontWeight: 700, fontSize: "0.95rem" }}
        >
          See Testimonials <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
