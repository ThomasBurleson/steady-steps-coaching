import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { InsightsSection } from "../blog/List";
import { blogPosts } from "../blog/_data";

/**
 * Below-the-fold "Insights" section: the 3 most recent blog cards + a link to
 * the full blog. Lazy-loaded so `blogPosts`/`InsightsSection` stay out of the
 * eager homepage chunk.
 */
export default function Insights() {
  return (
    <section id="insights" aria-labelledby="insights-heading" className="bg-background">
      <InsightsSection posts={blogPosts.slice(0, 3)} />
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
  );
}
