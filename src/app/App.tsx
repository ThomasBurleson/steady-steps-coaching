import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

import Header from "./home/Header";
import Hero from "./home/Hero";
import Footer from "./home/Footer";
import DeferredSection from "./utils/DeferredSection";
import { revealSection } from "./utils/reveal";

// Below-the-fold sections are code-split AND IntersectionObserver-gated (see
// DeferredSection): their chunks aren't fetched/parsed/rendered until the
// section nears the viewport, keeping them off the initial load path entirely.

export default function App() {
  // When arriving on the home page with a hash (e.g. navigating from a blog
  // page to "/#about"), reveal the (gated) target section, then scroll to it
  // once it has rendered. Retry briefly until the element exists.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    revealSection(id);
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
        <DeferredSection id="about" loader={() => import("./home/About")} minHeight={640} />
        <DeferredSection id="coaching" loader={() => import("./home/Coaching")} minHeight={900} />
        <DeferredSection id="approach" loader={() => import("./home/Approach")} minHeight={640} />
        <DeferredSection
          id="testimonials"
          loader={() => import("./home/Testimonials")}
          minHeight={720}
        />
        <DeferredSection id="insights" loader={() => import("./home/Insights")} minHeight={760} />
        <Footer />
      </div>
    </>
  );
}
