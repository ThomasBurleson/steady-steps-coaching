/**
 * POST /.netlify/functions/like   body: { slug: string, action: "like" | "unlike" }
 *
 * Adjusts the like counter for an article and returns the new total. Per-browser
 * de-duplication is handled on the client via localStorage (see Article.hook.ts);
 * this endpoint just applies the +1 / -1 the client asks for.
 *
 * Note: Netlify Blobs has no atomic increment, so this read-modify-write can
 * race under simultaneous writes. Acceptable for this blog's traffic.
 */
import { readLikes, writeLikes } from "./_store";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let body: { slug?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad Request" }, 400);
  }

  const slug = body.slug?.trim();
  const action = body.action;
  if (!slug) return json({ error: "Missing slug" }, 400);
  if (action !== "like" && action !== "unlike") return json({ error: "Invalid action" }, 400);

  const current = (await readLikes(slug)) ?? 0;
  const likes = Math.max(0, current + (action === "like" ? 1 : -1));
  await writeLikes(slug, likes);

  return json({ likes });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
