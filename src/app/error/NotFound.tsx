import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import BlogHeader from "../blog/Header";

/**
 * App-wide 404 page. Wired as the root route's `notFoundComponent`, so any
 * unmatched URL degrades into this styled page rather than the router's default
 * not-found screen.
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <BlogHeader />
      <div className="max-w-2xl mx-auto px-6 pt-40 text-center">
        <p className="text-primary font-medium tracking-wide mb-3">404</p>
        <h1
          className="text-foreground mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 500 }}
        >
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-medium">
          <ArrowLeft size={16} aria-hidden="true" /> Back to home
        </Link>
      </div>
    </div>
  );
}
