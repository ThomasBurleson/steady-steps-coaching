import { useState } from "react";

import type { CommentInput, CommentSubmitResult, PublicComment } from "./Article.hook";

/** Format an ISO timestamp as a short, human date (e.g. "Jul 27, 2026"). */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Approved-comment list plus a submission form. New comments are held for
 * moderation server-side, so after submitting the user sees a "pending review"
 * confirmation rather than their comment appearing in the list.
 */
export default function CommentsPanel({
  comments,
  loaded,
  onSubmit,
}: {
  comments: PublicComment[];
  loaded: boolean;
  onSubmit: (input: CommentInput) => Promise<CommentSubmitResult>;
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "submitting" | CommentSubmitResult>("idle");

  const submitting = status === "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const result = await onSubmit({ name, body, website });
    setStatus(result);
    if (result === "pending") {
      setName("");
      setBody("");
    }
  }

  return (
    <section aria-label="Comments" className="max-w-2xl mx-auto mt-12 pt-10 border-t border-border">
      <h2
        className="text-foreground mb-6"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 500 }}
      >
        Comments{loaded ? ` (${comments.length})` : ""}
      </h2>

      {/* Existing approved comments */}
      {comments.length > 0 ? (
        <ul className="space-y-6 mb-10">
          {comments.map((c) => (
            <li key={c.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-foreground whitespace-pre-line">{c.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        loaded && (
          <p className="text-muted-foreground mb-10">Be the first to share your thoughts.</p>
        )
      )}

      {/* Submission form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot: hidden from real users, tempting to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
        />

        <div>
          <label htmlFor="comment-name" className="block text-sm font-medium text-foreground mb-1">
            Name
          </label>
          <input
            id="comment-name"
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="comment-body" className="block text-sm font-medium text-foreground mb-1">
            Comment
          </label>
          <textarea
            id="comment-body"
            required
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>

          {status === "pending" && (
            <span className="text-sm text-muted-foreground">
              Thanks! Your comment is awaiting review.
            </span>
          )}
          {status === "invalid" && (
            <span className="text-sm text-destructive">Please enter your name and a comment.</span>
          )}
          {status === "error" && (
            <span className="text-sm text-destructive">
              Something went wrong. Please try again.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
