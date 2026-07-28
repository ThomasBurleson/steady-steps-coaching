import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";

import Header from "./home/Header";
import Hero from "./home/Hero";
import Footer from "./home/Footer";

// Below-the-fold sections are code-split so they stay out of the homepage's
// initial JS parse/execute path — the hero can paint before these chunks are
// fetched/parsed. Chunks still start downloading on mount (off the critical
// path), so nav "scroll to section" links keep working without a scroll-gate.
const About = lazy(() => import("./home/About"));
const Coaching = lazy(() => import("./home/Coaching"));
const Approach = lazy(() => import("./home/Approach"));
const Testimonials = lazy(() => import("./home/Testimonials"));
const Insights = lazy(() => import("./home/Insights"));

/** Reserves the section's approximate height so a lazy chunk can't cause CLS. */
function Deferred({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  return <Suspense fallback={<div aria-hidden="true" style={{ minHeight }} />}>{children}</Suspense>;
}

export default function App() {
  // When arriving on the home page with a hash (e.g. navigating from a blog
  // page to "/#about"), scroll to the target section once it has rendered.
  // Sections are lazy-loaded, so retry briefly until the element exists.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const attempt = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tries++ < 20) {
        timer = setTimeout(attempt, 100);
      }
    };
    timer = setTimeout(attempt, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>Steady-Steps Life Coaching</title>
        <meta
          name="description"
          content="Improve your life with thoughtful, personalized life coaching. Book a free 15-minute Clarity session with Chelsea today."
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
        <link rel="canonical" href="https://steadysteps.online" />
      </Helmet>
      <div
        className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        <Header />
        <Hero />
        <Deferred minHeight={640}>
          <About />
        </Deferred>
        <Deferred minHeight={900}>
          <Coaching />
        </Deferred>
        <Deferred minHeight={640}>
          <Approach />
        </Deferred>
        <Deferred minHeight={720}>
          <Testimonials />
        </Deferred>
        <Deferred minHeight={760}>
          <Insights />
        </Deferred>
        <Footer />
      </div>
    </>
  );
}
