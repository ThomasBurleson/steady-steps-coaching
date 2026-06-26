import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

/**
 * Lightweight top bar shared by the blog list and article pages. Mirrors the
 * landing-page nav styling but uses router links since blog pages are routes
 * rather than in-page anchors.
 */
export default function BlogHeader() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 bg-background/90 backdrop-blur-sm border-b border-border"
    >
      <Link
        to="/"
        aria-label="Steady Steps Coaching — home"
        className="text-primary tracking-wide"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.15rem",
          fontWeight: 600,
        }}
      >
        Steady Steps Coaching
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Link to="/blog" className="text-foreground transition-colors">
          Blog
        </Link>
      </div>

      <Link
        to="/#contact"
        className="hidden md:inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90 transition-colors"
      >
        Book a Call <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </nav>
  );
}
