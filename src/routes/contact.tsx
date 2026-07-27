import { createFileRoute } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import BlogHeader from "@/app/blog/Header";
import Contact from "@/app/contact/Contact";

// "/contact" → the standalone booking / intake page. The sizeable form lives in
// src/app/contact/Contact.tsx; this route only supplies the page chrome (shared
// nav + SEO), mirroring the blog/NotFound layout: a `min-h-screen` shell + fixed
// `BlogHeader` + top-padded content.
function ContactPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <Helmet>
        <title>Book a Call — Steady Steps Coaching</title>
        <meta
          name="description"
          content="Book a free 15-minute Clarity session with Chelsea. Share a little about where you are, and take the first steady step toward lasting change."
        />
      </Helmet>
      <BlogHeader />
      {/* Top padding clears the fixed BlogHeader, matching the blog pages. */}
      <div className="pt-0">
        <Contact />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});
