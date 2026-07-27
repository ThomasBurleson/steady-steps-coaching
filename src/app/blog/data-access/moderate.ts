/**
 * GET /.netlify/functions/moderate?slug=&id=&action=approve|reject&token=
 *
 * The coach reaches this by tapping the link in the SMS sent from comment.ts.
 * `approve` makes a pending comment public; `reject` deletes it. Protected by a
 * constant-time comparison against the ADMIN_TOKEN env var. Returns a small HTML
 * confirmation page (this is opened in a phone browser, not called by JS).
 */
import crypto from "node:crypto";
import { readComments, writeComments } from "./_store";

const { ADMIN_TOKEN } = process.env;

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return page("Method not allowed", 405);

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  const id = url.searchParams.get("id")?.trim();
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("token") ?? "";

  if (!ADMIN_TOKEN || !tokenMatches(token, ADMIN_TOKEN)) return page("Not authorized", 401);
  if (!slug || !id) return page("Missing slug or id", 400);
  if (action !== "approve" && action !== "reject") return page("Invalid action", 400);

  const comments = await readComments(slug);
  const target = comments.find((c) => c.id === id);
  if (!target) return page("Comment not found (already moderated?)", 404);

  if (action === "approve") {
    target.status = "approved";
    await writeComments(slug, comments);
    return page(`Approved — the comment by ${escapeHtml(target.name)} is now public.`);
  }

  await writeComments(
    slug,
    comments.filter((c) => c.id !== id),
  );
  return page(`Rejected — the comment by ${escapeHtml(target.name)} was deleted.`);
};

/** Length-safe, constant-time token comparison. */
function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function page(message: string, status = 200): Response {
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comment moderation</title>
<div style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;text-align:center">
  <h1 style="font-size:1.25rem">Comment moderation</h1>
  <p style="font-size:1rem;color:#333">${escapeHtml(message)}</p>
</div>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
