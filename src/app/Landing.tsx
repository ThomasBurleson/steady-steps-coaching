import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

import Header from "./home/Header";
import Hero from "./home/Hero";
import Footer from "./home/Footer";
import DeferredSection from "./utils/DeferredSection";
import { revealAndScrollTo } from "./utils/scroll";
import { useScrollSpy } from "./utils/useScrollSpy";
import { SECTION_IDS } from "./utils/sections";

// Below-the-fold sections are code-split AND IntersectionObserver-gated (see
// DeferredSection): their chunks aren't fetched/parsed/rendered until the
// section nears the viewport, keeping them off the initial load path entirely.

export default function App() {
  // Reflect the section in view in the URL as the user scrolls (see the
  // click-driven counterpart in utils/scroll `revealAndScrollTo`).
  useScrollSpy(SECTION_IDS);

  // When arriving on the home page with a hash (e.g. navigating from a blog
  // page to "/#approach"), reveal + scroll to the target. Routing through
  // revealAndScrollTo also reveals the sections *above* the target so their
  // real heights settle before scrolling — otherwise we'd land short.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (id) revealAndScrollTo(id);
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
