/**
 * Shared server-side persistence for blog Likes & Comments, backed by
 * Netlify Blobs (a built-in key/value store — no external database).
 *
 * These helpers run ONLY inside Netlify Functions (see the thin entrypoints in
 * `netlify/functions/{reactions,like,comment,moderate}.ts`). They must never be
 * imported by client code — that would pull `@netlify/blobs` into the browser
 * bundle. The client talks to the functions over `fetch()` instead
 * (see `../Article.hook.ts`).
 *
 * Data model (store "blog"):
 *   likes:<slug>     -> number
 *   comments:<slug>  -> Comment[]
 * Articles are keyed by `post.slug`.
 */
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

/** A single reader comment. `status` gates public visibility (moderation). */
export interface Comment {
  id: string;
  name: string;
  body: string;
  /** ISO-8601 timestamp of submission. */
  createdAt: string;
  status: "pending" | "approved";
}

/** The public projection sent to browsers — internal `status` stripped. */
export interface PublicComment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

const store = () => getStore({ name: "blog" });

const likesKey = (slug: string) => `likes:${slug}`;
const commentsKey = (slug: string) => `comments:${slug}`;

/**
 * Read the like count for a slug. Returns `null` when the key doesn't exist yet
 * so callers can distinguish "never seeded" from "explicitly zero".
 */
export async function readLikes(slug: string): Promise<number | null> {
  const value = await store().get(likesKey(slug), { type: "text" });
  if (value == null) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function writeLikes(slug: string, count: number): Promise<void> {
  await store().set(likesKey(slug), String(Math.max(0, Math.trunc(count))));
}

export async function readComments(slug: string): Promise<Comment[]> {
  const value = await store().get(commentsKey(slug), { type: "json" });
  return Array.isArray(value) ? (value as Comment[]) : [];
}

export async function writeComments(slug: string, comments: Comment[]): Promise<void> {
  await store().setJSON(commentsKey(slug), comments);
}

/** Strip moderation internals before sending a comment to the browser. */
export function toPublicComment(c: Comment): PublicComment {
  return { id: c.id, name: c.name, body: c.body, createdAt: c.createdAt };
}

export const newId = (): string => randomUUID();
