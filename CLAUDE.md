# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. Keep it short — link
to `docs/` rather than duplicating them.

## What this is

Marketing + blog site for **Steady Steps Coaching**. A **purely client-rendered
Vite 6 SPA** (no SSR) using **TanStack Router** (the router library, not TanStack
Start), deployed to **Netlify**. Package manager is **npm** (ignore the stray
`pnpm.overrides` field in `package.json`).

## Commands

| Command | Use |
| --- | --- |
| `npm run dev` | Vite dev server (port 5173). **Does NOT serve Netlify Functions or Blobs.** |
| `netlify dev` | Full local stack (port 8888) — use this to exercise `netlify/functions/*` and Netlify Blobs. |
| `npm run build` | `tsc -b && vite build && node scripts/prerender.mjs` |
| `npm run typecheck` | `tsc -b` (source of truth — the IDE can lag behind it) |
| `npm test` | Node test runner over `test/**/*.test.ts` |
| `npm run format` | Prettier write over `src/**` |

## Layout & conventions

- **Routing:** file-based; route files in `src/routes/**` are thin adapters that
  point `component` at real pages in `src/app/**`. `src/routeTree.gen.ts` is
  **generated but committed** (build needs it before `vite build`) — never
  hand-edit; regenerate via `npm run dev`/`build`. See `docs/routing.md`.
- **Netlify Functions:** live in `netlify/functions/`, **v2 signature**
  `export default async (req: Request): Promise<Response>`, bundled by esbuild.
  For blog features, the **handler logic lives in `src/app/blog/data-access/`**
  and `netlify/functions/<name>.ts` is a one-line re-export shim. Client code
  reaches functions only via `fetch()` — never `import` from `data-access/`
  (keeps `@netlify/blobs`/`twilio` out of the browser bundle).
- **SEO:** social crawlers don't run JS, so `scripts/prerender.mjs` runs after
  `vite build` to bake per-article OG/Twitter/canonical meta into
  `dist/blog/<slug>/index.html` (+ sitemap/robots). `SITE_URL` is hardcoded in
  **both** `scripts/prerender.mjs` and `src/app/blog/Article.tsx` — keep in sync.
- **Env vars:** set in Netlify → Site settings → Environment variables and mirror
  in local `.env` (see `.env.example`). Changes only take effect on redeploy.

## Docs

- `docs/routing.md` — routing conventions, adding routes, gotchas
- `docs/blog-authoring.md` — Word doc → markitdown → `src/app/blog/_data.ts`
- `docs/calendly-sms-setup.md` — Calendly webhook → Twilio SMS
- `docs/blog-reactions.md` — blog Likes/Comments (Netlify Blobs + moderation)

## Gotcha: ts(2591) on server files in the IDE

`data-access/` files use Node globals (`process`, `Buffer`, `node:crypto`) but are
typechecked by the browser `tsconfig.app.json`. If the editor flags
`ts(2591) Cannot find name …` on a **newly created** server file while
`npm run typecheck` is clean, it's a stale TS server — **Reload Window**. The CLI
is authoritative.
