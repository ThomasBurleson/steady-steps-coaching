import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import likerPortrait from "../imports/liker-portrait.jpeg";
import coachingImage from "../imports/image-1.png";
import { motion } from "motion/react";
import { ArrowRight, Menu, X, Quote, Leaf, Compass, Star, ChevronDown } from "lucide-react";
import Contact from "./components/Contact";
import { InsightsSection } from "./blog/List";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1623967680551-3e4694e2c9ad?w=1800&h=900&fit=crop&auto=format";
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

const testimonials = [
  {
    quote:
      "Working with this coach gave me the language for what I was feeling and the roadmap to do something about it. I felt truly seen.",
    name: "Mara T.",
    role: "Marketing Director",
  },
  {
    quote:
      "I came in overwhelmed and left each session with more calm than I thought possible. The steady, structured approach changed everything.",
    name: "James R.",
    role: "Entrepreneur",
  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // When arriving on the home page with a hash (e.g. navigating from a blog
  // page to "/#contact"), scroll to the target section once it has rendered.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const timer = setTimeout(
      () => target.scrollIntoView({ behavior: "smooth", block: "start" }),
      100,
    );
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Steady-Steps Life Coaching</title>
        <meta
          name="description"
          content="Cultivating mental health growth through thoughtful, personalized life coaching. Book a free 15-minute Clarity Session with Chelsea today."
        />
        <meta
          name="keywords"
          content="life coaching, personal growth, mindfulness, clarity session, steady steps coaching"
        />
        <meta property="og:title" content="Steady Steps Coaching — Chelsea" />
        <meta
          property="og:description"
          content="Personalized life coaching for lasting change. One steady step at a time."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Steady Steps Coaching — Chelsea" />
        <meta
          name="twitter:description"
          content="Personalized life coaching for lasting change. One steady step at a time."
        />
        <link rel="canonical" href="https://steadystepscoaching.com" />
      </Helmet>
      <div
        className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        {/* ── Accepting clients banner ── */}
        <div
          role="banner"
          aria-label="Announcement"
          className="fixed top-0 left-0 right-0 z-50 text-center py-2 text-sm"
          style={{
            background: "#1a1a1a",
            color: "#fff",
            letterSpacing: "0.05em",
          }}
        >
          <span aria-hidden="true">✨</span> Now Accepting New Clients
        </div>

        {/* ── Nav ── */}
        <nav
          aria-label="Main navigation"
          className="fixed left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 bg-background/90 backdrop-blur-sm border-b border-border"
          style={{ top: "36px" }}
        >
          <a
            href="#"
            aria-label="Steady Steps Coaching — back to top"
            className="text-primary tracking-wide"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.15rem",
              fontWeight: 600,
            }}
          >
            Steady Steps Coaching
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {(["about", "coaching", "approach", "contact"] as const).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={scrollTo(id)}
                className="hover:text-foreground transition-colors capitalize"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>

          <a
            href="#contact"
            onClick={scrollTo("contact")}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90 transition-colors"
          >
            Book a Call <ArrowRight size={14} aria-hidden="true" />
          </a>

          {/* Mobile toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-label="Mobile navigation"
            className="fixed inset-0 z-40 bg-background pt-20 px-8 flex flex-col gap-6 text-lg"
          >
            {["About", "Coaching", "Approach", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={scrollTo(item.toLowerCase())}
                className="border-b border-border pb-4 text-foreground"
              >
                {item}
              </a>
            ))}
            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="border-b border-border pb-4 text-foreground"
            >
              Blog
            </Link>
            <a
              href="#contact"
              onClick={scrollTo("contact")}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full"
            >
              Book a Call <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        )}

        {/* ── Hero ── */}
        <section
          aria-label="Hero"
          className="relative h-screen min-h-[600px] flex items-end overflow-hidden"
        >
          <div className="absolute inset-0 bg-foreground/20" style={{ zIndex: 1 }} />
          <img
            src={HERO_IMAGE}
            alt="Forest path winding through tall trees"
            className="absolute inset-0 w-full h-full object-cover"
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
              <span>Cultivating mental health,</span>
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
              Thoughtful 1-on-1 guidance, sustainable growth, and consistent support for lasting
              personal growth and mental health.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#about"
                onClick={scrollTo("contact")}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors"
                style={{ fontWeight: 700 }}
              >
                Begin Your Journey <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="#about"
                onClick={scrollTo("about")}
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/40 text-white rounded-full hover:bg-white/10 transition-colors"
              >
                Learn More <ChevronDown size={16} aria-hidden="true" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── About ── */}
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
                onClick={scrollTo("coaching")}
                className="inline-flex items-center gap-2 text-primary"
                style={{ fontWeight: 700, fontSize: "0.95rem" }}
              >
                See how I can help <ArrowRight size={16} aria-hidden="true" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── Coaching ── */}
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
                  {[
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
                  ].map((item, i) => (
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
                    onClick={scrollTo("approach")}
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

        {/* ── Approach ── */}
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
              onClick={scrollTo("testimonials")}
              className="inline-flex items-center gap-2 text-primary"
              style={{ fontWeight: 700, fontSize: "0.95rem" }}
            >
              See Testimonials <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* ── Testimonials ── */}
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
                  key={t.name}
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
              <a
                href="#contact"
                onClick={scrollTo("contact")}
                className="inline-flex items-center gap-2 text-primary-foreground"
                style={{ fontWeight: 700, fontSize: "0.95rem", opacity: 0.85 }}
              >
                Let's Begin <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Insights / Blog ── */}
        <section id="insights" aria-labelledby="insights-heading" className="bg-background">
          <InsightsSection />
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 flex justify-end pb-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary"
              style={{ fontWeight: 700, fontSize: "0.95rem" }}
            >
              View all articles <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── CTA / Contact ── */}
        <Contact />

        {/* ── Footer ── */}
        <footer aria-label="Site footer" className="border-t border-border py-10 px-6 md:px-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-foreground hover:text-primary transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem",
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Steady Steps Coaching
            </button>
            <p className="text-muted-foreground" style={{ fontSize: "0.82rem" }}>
              © 2024 Steady Steps Coaching. All rights reserved.
            </p>
            <div className="flex gap-6 text-muted-foreground" style={{ fontSize: "0.85rem" }}>
              <a href="#about" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#coaching" className="hover:text-foreground transition-colors">
                Coaching
              </a>
              <a href="#contact" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
