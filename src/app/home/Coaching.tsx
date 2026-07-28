import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { scrollToId } from "./scroll";
import coachingImage from "../../_images/image-1.jpg";

const coachingItems = [
  {
    heading: "Explore your intentions and create realistic goals",
    body: "Together, we'll clarify what you truly want and why it matters to you. We'll break larger goals into manageable, attainable steps and use a simple goal-setting and tracking system to measure progress without creating unnecessary pressure.",
    indent: "0",
  },
  {
    heading: "Understand what's getting in the way",
    body: "We'll look beyond surface-level obstacles to identify patterns, habits, beliefs, stressors, or circumstances that may be contributing to your challenges. Sometimes the solution isn't doing more—it's understanding yourself more clearly.",
    indent: "0",
  },
  {
    heading: "Create space for self-awareness",
    body: "Many people spend so much time taking care of responsibilities that they rarely pause to listen to their own thoughts, feelings, and needs. Coaching provides dedicated time to slow down, reflect, and reconnect with what's important to you.",
    indent: "0",
  },
  {
    heading: "Simplify the next steps",
    body: "When goals feel overwhelming, it's easy to shut down or feel like you've failed before you've even begun. We'll focus on simplifying what feels complicated and identifying the next realistic step forward.",
    indent: "0",
  },
  {
    heading: "Review progress and celebrate wins",
    body: "Growth often happens in ways we don't immediately notice. We'll recognize your successes, acknowledge progress, and build confidence through consistent forward movement.",
    indent: "0",
  },
  {
    heading: "Receive support, encouragement, and accountability",
    body: "You'll have a supportive partner who will help you stay focused, motivated, and committed to the goals you've set for yourself—without judgment or unrealistic expectations.",
    indent: "0",
    extraTop: "8px",
  },
];

/** Below-the-fold "Coaching" section (the largest). Lazy-loaded from App.tsx. */
export default function Coaching() {
  return (
    <section
      id="coaching"
      aria-labelledby="coaching-heading"
      className="py-24 md:py-32"
      style={{ background: "var(--secondary)" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="text-accent tracking-[0.18em] uppercase mb-4"
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              My Coaching
            </p>
            <h2
              id="coaching-heading"
              className="text-foreground mb-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.1rem)",
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              In our sessions, we will:
            </h2>

            <div className="flex flex-col gap-4">
              {coachingItems.map((item, i) => (
                <motion.div
                  key={item.heading}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.08,
                  }}
                  className="flex gap-3"
                  style={{
                    marginLeft: item.indent,
                    paddingTop: item.extraTop ?? 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "1rem",
                      flexShrink: 0,
                      background: "var(--primary)",
                      borderRadius: "6px",
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "2px",
                    }}
                  >
                    ✨
                  </span>
                  <div>
                    <p
                      className="text-foreground mb-1"
                      style={{
                        lineHeight: 1.4,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                      }}
                    >
                      {item.heading}
                    </p>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontSize: "0.92rem",
                        lineHeight: 1.8,
                      }}
                    >
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Single coaching image */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <img
              src={coachingImage}
              alt="Clipboard with notepad, pen, and candle on a warm wooden table"
              className="rounded-2xl object-contain w-full shadow-md bg-card"
              loading="lazy"
              decoding="async"
              style={{ height: "auto" }}
            />
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                }}
              >
                Together, we'll identify what's holding you back, build systems that work for
                you, and create accountability that feels supportive—not judgmental.
              </p>
            </div>
            <div
              className="flex justify-end"
              style={{ marginTop: "50px", marginRight: "50px" }}
            >
              <a
                href="#approach"
                onClick={scrollToId("approach")}
                className="inline-flex items-center gap-2 text-primary"
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                4 Easy Steps <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
