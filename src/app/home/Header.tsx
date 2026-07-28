import { useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { revealAndScrollTo } from "../utils/scroll";

/**
 * Above-the-fold home page chrome: announcement banner + fixed nav + mobile
 * menu. Kept eager (not lazy) since it paints immediately on load. Owns its own
 * `menuOpen` state and section-scroll handler (which also closes the menu).
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    revealAndScrollTo(id);
    setMenuOpen(false);
  };

  return (
    <>
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
          {(["about", "coaching", "approach"] as const).map((id) => (
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
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        <Link
          to="/contact"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90 transition-colors"
        >
          Book a Call <ArrowRight size={14} aria-hidden="true" />
        </Link>

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
          {["About", "Coaching", "Approach"].map((item) => (
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
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="border-b border-border pb-4 text-foreground"
          >
            Contact
          </Link>
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full"
          >
            Book a Call <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
