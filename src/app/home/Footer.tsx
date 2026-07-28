import { Link } from "@tanstack/react-router";

/** Site footer. Static (eager) — cheap, no `motion`, no benefit to deferring. */
export default function Footer() {
  return (
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
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
