/**
 * GET /.netlify/functions/reactions?slug=<slug>&seed=<n>
 *
 * Returns the current like count and the publicly-visible (approved) comments
 * for an article. `seed` is the static `post.likes` literal from the client;
 * it's used ONLY to initialise the counter the first time a slug is read, so
 * existing display counts don't reset to zero. Once seeded, `seed` is ignored.
 */
import { readComments, readLikes, toPublicComment, writeLikes } from "./_store";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  if (!slug) return json({ error: "Missing slug" }, 400);

  let likes = await readLikes(slug);
  if (likes == null) {
    // First read for this slug — seed from the client-supplied static count.
    const seed = Number.parseInt(url.searchParams.get("seed") ?? "0", 10);
    likes = Number.isFinite(seed) && seed > 0 ? seed : 0;
    await writeLikes(slug, likes);
  }

  const comments = (await readComments(slug))
    .filter((c) => c.status === "approved")
    .map(toPublicComment);

  return json({ likes, comments });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
