import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Working with Chelsea has completely changed how I tackle my to-do list. She helps me simplify overwhelming goals into realistic steps.",
    name: "",
    role: "",
  },
  {
    quote:
      "Chelsea is exactly the kind of person you want in your corner. She holds me accountable without adding any unnecessary stress, and her guidance makes even the most intimidating tasks feel totally realistic.",
    name: "",
    role: "",
  },
  {
    quote:
      "It’s been such a relief to have Chelsea helping me. We take our time to talk through what I want to do, and it really feels like we’re just working together to make sure the goals actually make sense for me.",
    name: "",
    role: "",
  },
  {
    quote:
      "Working with Chelsea is super laid-back. We take our time figuring out my goals, and if I need to change directions, we just do it. It feels like we’re just two people working together to get stuff done, no pressure at all.",
    name: "",
    role: "",
  },
  {
    quote:
      "I really like that we don't have to stick to some strict, straight line. Chelsea gets that life happens, and she’s totally fine with changing our approach when I need to. It really feels like a partnership where we’re just working on whatever makes the most sense for me right now",
    name: "",
    role: "",
  },
];

/** Below-the-fold "Testimonials" section. Lazy-loaded from App.tsx. */
export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="Client testimonials"
      className="py-24 md:py-32"
      style={{ background: "var(--primary)" }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <p
          className="text-center tracking-[0.18em] uppercase mb-14"
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "rgba(253,250,246,0.6)",
          }}
        >
          What Clients Say
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.quote}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
              }}
              className="rounded-2xl p-8"
              style={{
                background: "rgba(253,250,246,0.08)",
                border: "1px solid rgba(253,250,246,0.12)",
              }}
            >
              <Quote
                size={28}
                aria-hidden="true"
                className="mb-5"
                style={{ color: "var(--accent)" }}
              />
              <p
                className="mb-6"
                style={{
                  color: "rgba(253,250,246,0.9)",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                }}
              >
                {t.quote}
              </p>
              <div>
                <p
                  style={{
                    color: "#FDFAF6",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    color: "rgba(253,250,246,0.5)",
                    fontSize: "0.8rem",
                  }}
                >
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-end mt-8">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-primary-foreground"
            style={{ fontWeight: 700, fontSize: "0.95rem", opacity: 0.85 }}
          >
            Let's Begin <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
