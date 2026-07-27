# Blog Likes & Comments (Netlify Blobs + moderation)

Blog articles persist **Like counts** and **Comments** via **Netlify Blobs** (a
built-in key/value store — no external database). Comments are **moderated**: a
new comment is held as `pending`, the coach gets a Twilio SMS with a one-tap
approve link, and only approved comments render publicly.

The Like/Comment buttons are the "Sticky Share Group" in
[src/app/blog/Article.tsx](../src/app/blog/Article.tsx).

## Architecture

```
Browser (Article.hook.ts)             Netlify Functions            Netlify Blobs store "blog"
─────────────────────────             ─────────────────           ──────────────────────────
GET  reactions?slug=x&seed=n ────────► reactions.ts ────────────► likes:<slug>    -> number
                                                                   comments:<slug> -> Comment[]
POST like     {slug, action} ────────► like.ts       (r-m-w)
POST comment  {slug,name,body} ──────► comment.ts ──► Twilio SMS to coach (approve link)
GET  moderate?slug&id&action&token ──► moderate.ts   (coach taps the SMS link)
```

- **Handler logic** lives in [src/app/blog/data-access/](../src/app/blog/data-access/)
  (`_store.ts`, `reactions.ts`, `like.ts`, `comment.ts`, `moderate.ts`). Each
  Netlify endpoint in [netlify/functions/](../netlify/functions/) is a one-line
  re-export shim. Never `import` `data-access/` from client code — the browser
  talks to the functions over `fetch()` (see
  [src/app/blog/Article.hook.ts](../src/app/blog/Article.hook.ts)).
- **Data model** (Blobs store `"blog"`, keyed by `post.slug`):
  `likes:<slug>` → number, `comments:<slug>` → `Comment[]` where each is
  `{ id, name, body, createdAt, status: "pending" | "approved" }`.
- **Like seeding:** the first read of a slug seeds the counter from the client's
  `?seed=<post.likes>` so existing display counts don't reset to zero.
- **Like de-dup** is per-browser via `localStorage["liked:<slug>"]` (a toggle,
  not authenticated — appropriate for this blog).

## Environment variables

Set in **Netlify → Site settings → Environment variables** (mirror in `.env` —
see [.env.example](../.env.example)):

| Var | What |
| --- | --- |
| `ADMIN_TOKEN` | Secret embedded in the moderation link; the `moderate` function rejects any other value. Generate a long random string. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio credentials (**reused** from the Calendly setup) |
| `TWILIO_FROM_NUMBER` | Twilio sending number, E.164 |
| `COACH_PHONE_NUMBER` | Where the comment-notification SMS is sent, E.164 |
| `SITE_URL` | Optional. Origin used to build the approve link; falls back to the request origin (works on deploy previews too). |

If the Twilio/`ADMIN_TOKEN` vars are missing the comment is still **saved**
(pending) — only the SMS is skipped (logged server-side).

## Moderating a comment

1. A visitor submits a comment → it's stored `pending` and hidden.
2. The coach receives an SMS: the comment text + an **Approve** link
   (`…/.netlify/functions/moderate?slug=…&id=…&action=approve&token=<ADMIN_TOKEN>`).
3. Tapping it opens a small confirmation page and the comment becomes public.
   The `moderate` endpoint also supports `action=reject` (deletes the comment).

## Local testing

Netlify Blobs and the functions only run under the Netlify CLI:

```bash
netlify dev   # port 8888 — NOT `npm run dev` (Vite 5173 has no functions)
```

The client hook detects plain Vite (port 5173) and degrades gracefully so the UI
stays interactive without a backend. End-to-end SMS testing is simplest on a
Netlify deploy preview.
