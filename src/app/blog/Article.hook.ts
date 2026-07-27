import { useCallback, useEffect, useState } from "react";

/**
 * Client-side state for an article's Likes & Comments.
 *
 * Talks to the Netlify Functions in `data-access/` over `fetch()` (never imports
 * them — they run server-side and use Netlify Blobs / Twilio). Likes are
 * de-duplicated per browser with localStorage; comments are held for moderation
 * server-side, so a freshly submitted comment does NOT appear until approved.
 */

/** Public shape of a comment as returned by the `reactions` function. */
export interface PublicComment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

export interface CommentInput {
  name: string;
  body: string;
  /** Honeypot — must stay empty for real users. */
  website?: string;
}

export type CommentSubmitResult = "pending" | "invalid" | "error";

// On the plain Vite dev server (port 5173) the Netlify Functions aren't served,
// so we skip the network and keep the UI interactive. `netlify dev` runs on
// port 8888, where the functions DO exist and real requests are made.
const isViteOnlyDev =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  window.location.port === "5173";

const likedKey = (slug: string) => `liked:${slug}`;

const readLikedFlag = (slug: string): boolean => {
  try {
    return window.localStorage.getItem(likedKey(slug)) === "1";
  } catch {
    return false;
  }
};

const writeLikedFlag = (slug: string, liked: boolean): void => {
  try {
    if (liked) window.localStorage.setItem(likedKey(slug), "1");
    else window.localStorage.removeItem(likedKey(slug));
  } catch {
    // localStorage unavailable (private mode / SSR) — non-fatal.
  }
};

export function useReactions(slug: string, seedLikes: number, seedComments: number) {
  const [likes, setLikes] = useState(seedLikes);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load current counts + approved comments on mount / slug change.
  useEffect(() => {
    setLiked(readLikedFlag(slug));

    if (isViteOnlyDev) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/.netlify/functions/reactions?slug=${encodeURIComponent(slug)}&seed=${seedLikes}`,
        );
        if (!res.ok) throw new Error(String(res.status));
        const data: { likes: number; comments: PublicComment[] } = await res.json();
        if (cancelled) return;
        setLikes(data.likes);
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch {
        // Leave the seeded count in place on failure.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, seedLikes]);

  const toggleLike = useCallback(async () => {
    const next = !liked;
    const action = next ? "like" : "unlike";

    // Optimistic update.
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    writeLikedFlag(slug, next);

    if (isViteOnlyDev) return;

    try {
      const res = await fetch("/.netlify/functions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { likes: number } = await res.json();
      setLikes(data.likes);
    } catch {
      // Roll back on failure.
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      writeLikedFlag(slug, !next);
    }
  }, [liked, slug]);

  const submitComment = useCallback(
    async (input: CommentInput): Promise<CommentSubmitResult> => {
      const name = input.name.trim();
      const body = input.body.trim();
      if (!name || !body) return "invalid";

      if (isViteOnlyDev) {
        console.log("[dev] Faking comment submission (held for moderation):", { name, body });
        return "pending";
      }

      try {
        const res = await fetch("/.netlify/functions/comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, name, body, website: input.website ?? "" }),
        });
        return res.ok ? "pending" : "error";
      } catch {
        return "error";
      }
    },
    [slug],
  );

  return {
    likes,
    liked,
    comments,
    /** Approved-comment count once loaded; the static seed until then. */
    commentCount: loaded ? comments.length : seedComments,
    loaded,
    toggleLike,
    submitComment,
  };
}
