import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Link2,
  Twitter,
  Facebook,
  Linkedin,
  UserPlus,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import BlogHeader from "./Header";
import { getPostBySlug, type ContentBlock } from "./_data";

/**
 * Inline markdown elements styled to match the article. Shared across every
 * text-bearing block so **bold**, _italic_, [links](…) and `code` render
 * consistently.
 */
const inlineMarkdown: Components = {
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-medium hover:underline focus:outline-none focus:underline"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-secondary px-1.5 py-0.5 text-[0.9em] font-mono">{children}</code>
  ),
};

/** Block paragraph: maps markdown's <p> to the article's paragraph styling. */
function MarkdownParagraph({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        ...inlineMarkdown,
        p: ({ children }) => (
          <p className="text-lg text-foreground" style={{ lineHeight: 1.8 }}>
            {children}
          </p>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/** Inline context (e.g. list items): strips markdown's wrapping <p>. */
function MarkdownInline({ text }: { text: string }) {
  return (
    <ReactMarkdown components={{ ...inlineMarkdown, p: ({ children }) => <>{children}</> }}>
      {text}
    </ReactMarkdown>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "lead":
      return <MarkdownParagraph text={block.text} />;
    case "paragraph":
      return <MarkdownParagraph text={block.text} />;
    case "heading":
      return (
        <h3
          className="text-foreground"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
            fontWeight: 500,
          }}
        >
          {block.text}
        </h3>
      );
    case "image":
      return (
        <figure>
          <img
            className="w-full object-cover rounded-xl"
            src={block.src}
            alt={block.alt}
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="mt-3 text-sm text-center text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="text-center p-4 sm:px-7">
          <p
            className="text-foreground"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: block.small ? "clamp(1rem, 1.6vw, 1.15rem)" : "clamp(1.25rem, 2.5vw, 1.5rem)",
              lineHeight: 1.5,
            }}
          >
            <MarkdownInline text={block.text} />
          </p>
          {block.attribution && (
            <p className={`mt-5 text-muted-foreground ${block.small ? "text-sm" : ""}`}>
              <MarkdownInline text={block.attribution} />
            </p>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul className="list-disc list-outside space-y-3 ps-5 text-lg text-foreground">
          {block.items.map((item) => (
            <li key={item} className="ps-2" style={{ lineHeight: 1.7 }}>
              <MarkdownInline text={item} />
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

const shareItemClass =
  "flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-foreground hover:bg-secondary focus:outline-none focus:bg-secondary";

export default function BlogArticle() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!post) {
    return (
      <div
        className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        <BlogHeader />
        <div className="max-w-2xl mx-auto px-6 pt-40 text-center">
          <h1
            className="text-foreground mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 500 }}
          >
            Article not found
          </h1>
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-medium">
            <ArrowLeft size={16} aria-hidden="true" /> Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  const { author } = post;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <Helmet>
        <title>{post.title} — Steady Steps Coaching</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <BlogHeader />

      {/* Blog Article */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl px-4 pt-28 lg:pt-32 pb-12 sm:px-6 lg:px-8 mx-auto"
      >
        <div className="max-w-2xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to Insights
          </Link>

          {/* Avatar Media */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex w-full sm:items-center gap-x-5 sm:gap-x-3">
              <div className="shrink-0">
                <img className="size-12 rounded-full" src={author.avatar} alt={author.name} />
              </div>
              <div className="grow">
                <div className="flex justify-between items-center gap-x-2">
                  <div>
                    {/* Author popover */}
                    <div className="relative inline-block group">
                      <span className="font-semibold text-foreground cursor-pointer">
                        {author.name}
                      </span>
                      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity absolute z-10 max-w-xs w-72 bg-card border border-border divide-y divide-border shadow-lg rounded-xl text-left">
                        <div className="p-4 sm:p-5">
                          <div className="mb-2 flex items-center gap-x-3">
                            <img
                              className="size-8 rounded-full"
                              src={author.avatar}
                              alt={author.name}
                            />
                            <p className="text-lg font-semibold text-foreground">{author.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                            {author.bio}
                          </p>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 sm:px-5">
                          <ul className="text-xs space-x-3">
                            <li className="inline-block">
                              <span className="font-semibold text-foreground">
                                {author.articles}
                              </span>{" "}
                              <span className="text-muted-foreground">articles</span>
                            </li>
                            <li className="inline-block">
                              <span className="font-semibold text-foreground">
                                {author.followers}
                              </span>{" "}
                              <span className="text-muted-foreground">followers</span>
                            </li>
                          </ul>
                          <button
                            type="button"
                            className="py-1.5 px-2.5 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none"
                          >
                            <UserPlus className="shrink-0 size-3.5" aria-hidden="true" />
                            Follow
                          </button>
                        </div>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground mt-1">
                      <li className="inline-block relative pe-6 last:pe-0 before:absolute before:top-1/2 before:end-2 before:-translate-y-1/2 before:size-1 before:bg-muted-foreground before:rounded-full">
                        {post.date}
                      </li>
                      <li className="inline-block relative pe-6 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-2 before:-translate-y-1/2 before:size-1 before:bg-muted-foreground before:rounded-full">
                        {post.readTime}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2.5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg bg-card border border-border text-foreground shadow-sm hover:bg-secondary focus:outline-none"
                    >
                      <Twitter className="size-3.5" aria-hidden="true" />
                      Tweet
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <article className="space-y-5 md:space-y-8">
            <div className="space-y-3">
              <h1
                className="text-foreground"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.9rem, 4vw, 2.6rem)",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {post.title}
              </h1>
            </div>

            {post.content.map((block, i) => (
              <Block key={i} block={block} />
            ))}

            {/* Tags */}
            <div className="pt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="m-1 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-secondary text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </motion.div>

      {/* Sticky Share Group */}
      <div className="sticky bottom-6 inset-x-0 text-center">
        <div className="inline-block bg-card shadow-md border border-border rounded-full py-3 px-4">
          <div className="flex items-center gap-x-1.5">
            <button
              type="button"
              title="Like"
              className="flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
            >
              <Heart className="shrink-0 size-4" aria-hidden="true" />
              {post.likes}
            </button>

            <div className="block h-3 border-e border-border mx-3" />

            <button
              type="button"
              title="Comment"
              className="flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
            >
              <MessageCircle className="shrink-0 size-4" aria-hidden="true" />
              {post.comments}
            </button>

            <div className="block h-3 border-e border-border mx-3" />

            <div className="relative inline-flex">
              <button
                type="button"
                onClick={() => setShareOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={shareOpen}
                aria-label="Share"
                className="flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
              >
                <Share2 className="shrink-0 size-4" aria-hidden="true" />
                Share
              </button>
              {shareOpen && (
                <div
                  role="menu"
                  className="absolute bottom-full right-0 mb-2 w-56 z-10 bg-card border border-border shadow-md rounded-xl p-2 text-left"
                >
                  <button type="button" className={`w-full ${shareItemClass}`}>
                    <Link2 className="shrink-0 size-4" aria-hidden="true" />
                    Copy link
                  </button>
                  <div className="border-t border-border my-2" />
                  <a className={shareItemClass} href="#">
                    <Twitter className="shrink-0 size-4" aria-hidden="true" />
                    Share on Twitter
                  </a>
                  <a className={shareItemClass} href="#">
                    <Facebook className="shrink-0 size-4" aria-hidden="true" />
                    Share on Facebook
                  </a>
                  <a className={shareItemClass} href="#">
                    <Linkedin className="shrink-0 size-4" aria-hidden="true" />
                    Share on LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
