import { useEffect } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import BlogHeader from "./Header";
import { blogPosts, type BlogPost } from "./_data";

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link to={`/blog/${post.slug}`} className="group flex flex-col focus:outline-none">
        <div className="relative pt-[50%] sm:pt-[70%] rounded-xl overflow-hidden">
          <img
            className="size-full absolute top-0 left-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-xl"
            src={post.image}
            alt={post.title}
            loading="lazy"
          />
          {post.sponsored && (
            <span className="absolute top-0 right-0 rounded-tr-xl rounded-bl-xl text-xs font-medium bg-foreground text-background py-1.5 px-3">
              Sponsored
            </span>
          )}
        </div>
        <div className="mt-7">
          <h3
            className="text-foreground group-hover:text-primary transition-colors"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.3rem",
              fontWeight: 600,
            }}
          >
            {post.title}
          </h3>
          <p className="mt-3 text-muted-foreground" style={{ lineHeight: 1.7 }}>
            {post.excerpt}
          </p>
          <p className="mt-5 inline-flex items-center gap-x-1 text-sm text-primary group-hover:underline group-focus:underline font-medium">
            Read more
            <ChevronRight className="shrink-0 size-4" aria-hidden="true" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * The "Insights" title + card grid. Reused by the standalone `/blog` page and
 * embedded on the home page. Pass `posts` to control which (and how many) cards
 * render — defaults to all posts.
 */
export function InsightsSection({ posts = blogPosts }: { posts?: BlogPost[] }) {
  return (
    <div className="max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* Title */}
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2
          className="text-foreground"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 4.5vw, 2.8rem)",
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          Insights
        </h2>
        <p className="mt-1 text-muted-foreground">
          Stay in the know with insights from the industry.
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function BlogList() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <Helmet>
        <title>Insights — Steady Steps Coaching</title>
        <meta
          name="description"
          content="Insights and reflections on personal growth, habits, boundaries, and mental health from Steady Steps Coaching."
        />
      </Helmet>

      <BlogHeader />

      <main className="pt-28 lg:pt-32">
        <InsightsSection />
      </main>
    </div>
  );
}
