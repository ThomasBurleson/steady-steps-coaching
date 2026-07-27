# Routing (TanStack Router, file-based)

This app uses **[TanStack Router](https://tanstack.com/router)** with **file-based
routing**. It replaced `react-router` (removed). Routes are defined by files under
`src/routes/**`; the Vite plugin generates a typed route tree from them.

## How it's wired

- **Vite plugin** — [`vite.config.ts`](../vite.config.ts) runs
  `tanstackRouter({ target: 'react', autoCodeSplitting: true })` **before**
  `@vitejs/plugin-react` (order matters). On dev/build it scans `src/routes/**` and
  regenerates [`src/routeTree.gen.ts`](../src/routeTree.gen.ts).
- **Entry** — [`src/main.tsx`](../src/main.tsx) builds the router with
  `createRouter({ routeTree, defaultPreload: 'intent', scrollRestoration: true })`,
  registers it via the `declare module '@tanstack/react-router'` `Register` interface
  (this is what makes `Link`/params type-safe), and renders `<RouterProvider>`. The
  `HelmetProvider` and `CalendlyProvider` wrap it here.
- **Root layout** — [`src/routes/__root.tsx`](../src/routes/__root.tsx) renders
  `<Outlet />` (+ router devtools, which are `null` in production) and wires the app-wide
  404 via `notFoundComponent: NotFound`.

## File → URL conventions

| File in `src/routes/` | URL | Renders |
| --- | --- | --- |
| `__root.tsx` | (layout) | `<Outlet/>` + 404 |
| `index.tsx` | `/` | landing (`src/app/App.tsx`) |
| `blog/index.tsx` | `/blog` | `src/app/blog/List.tsx` |
| `blog/$slug.tsx` | `/blog/:slug` | `src/app/blog/Article.tsx` |

- `index.tsx` → the folder's root path. `$param` = a dynamic segment (`$slug` → `:slug`).
- No `*` route — unmatched URLs hit the root's `notFoundComponent`.

## Page components live in `src/app/**`, not in the route files

Route files are **thin adapters**: each just calls `createFileRoute` and points at the
real component under `src/app/**`. This keeps the sizeable page components where they
already live and makes routing easy to see at a glance.

```tsx
// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import App from "@/app/App.tsx";
export const Route = createFileRoute("/")({ component: App });
```

Dynamic route — read params in the route file, pass as a prop so the page component
stays router-agnostic:

```tsx
// src/routes/blog/$slug.tsx
export const Route = createFileRoute("/blog/$slug")({ component: RouteComponent });
function RouteComponent() {
  const { slug } = Route.useParams();
  return <BlogArticle slug={slug} />;   // Article takes `slug`, not useParams()
}
```

## Navigation

Import `Link` from `@tanstack/react-router` (typed against the route tree):

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/blog">Blog</Link>                                   // static
<Link to="/blog/$slug" params={{ slug: post.slug }}>…</Link>   // dynamic — NOT `/blog/${slug}`
<Link to="/" hash="contact">Book a Call</Link>                 // hash is a SEPARATE prop, NOT `to="/#contact"`
```

Both the `params` and `hash` forms above are gotchas: the string-interpolated path and
the `/#hash` string that worked under react-router are **type errors** here.

## Adding a route

1. Create `src/routes/<path>.tsx` exporting a `Route` via `createFileRoute("/<path>")`.
2. Point its `component` at a component in `src/app/**` (or inline a small one).
3. `npm run dev` (or `build`) regenerates `src/routeTree.gen.ts` automatically.

## `src/routeTree.gen.ts` is generated but committed

The plugin regenerates it on dev/build, but it is **committed** (and listed in
[`.prettierignore`](../.prettierignore)) because `npm run build` runs `tsc -b` **before**
`vite build` — `tsc` needs the file to already exist. Don't hand-edit it; if it looks
stale, run `npm run dev`/`build` to regenerate.

## Deploy

Unchanged: still a client-rendered SPA. Netlify's `/* → /index.html 200` redirect (in
[`public/_redirects`](../public/_redirects)) is still required so deep links resolve.
