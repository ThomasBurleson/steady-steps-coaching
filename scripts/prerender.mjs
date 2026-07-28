/**
 * Post-build prerender for blog articles.
 *
 * TanStack Router ships this app as a client-rendered SPA, so the HTML Netlify
 * serves for every route is the same `dist/index.html` — its <head> never
 * mentions the article. Social crawlers (Facebook, LinkedIn, Slack, iMessage)
 * usually do NOT run JavaScript, so the react-helmet <meta> tags added at
 * runtime are invisible to them and shared links get a bare preview card.
 *
 * This script closes that gap without SSR or a headless browser: for each blog
 * post it clones the built index.html, bakes the article's Open Graph / Twitter
 * tags into the <head>, and writes `dist/blog/<slug>/index.html`. Netlify serves
 * those static files (they take precedence over the `/*` SPA rewrite in
 * public/_redirects), so a crawler hitting /blog/<slug> sees real OG tags while
 * a human gets the same HTML that boots the SPA and renders the article.
 *
 * Runs as the last step of `npm run build` (after `vite build`).
 */

import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

/** Canonical origin — keep in sync with SITE_URL in src/app/blog/Article.tsx. */
const SITE_URL = "https://steadysteps.online";

/**
 * Load `blogPosts` in Node by bundling _data.ts with esbuild and stubbing the
 * asset imports (e.g. avatar.png) that only the browser build can resolve.
 */
async function loadBlogPosts() {
  const stubAssets = {
    name: "stub-assets",
    setup(b) {
      b.onResolve({ filter: /\.(png|jpe?g|gif|svg|webp|avif|css)$/ }, (args) => ({
        path: args.path,
        namespace: "stub-asset",
      }));
      b.onLoad({ filter: /.*/, namespace: "stub-asset" }, () => ({
        contents: 'export default "";',
        loader: "js",
      }));
    },
  };

  const result = await build({
    entryPoints: [path.join(ROOT, "src/app/blog/_data.ts")],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    plugins: [stubAssets],
    logLevel: "silent",
  });

  const code = result.outputFiles[0].text;
  const mod = await import(
    "data:text/javascript;base64," + Buffer.from(code).toString("base64")
  );
  return mod.blogPosts;
}

/**
 * Resolve an article image to an absolute URL suitable for OG/Twitter cards.
 * Unsplash URLs are upsized to 1200px wide (Facebook's `summary_large_image`
 * wants ≥1200px, but the card-grid `image` URLs are only ~560px). Other absolute
 * URLs pass through. Site-relative paths (e.g. `/images/blog/…`) are prefixed
 * with `SITE_URL` — OG/Twitter require absolute image URLs and silently drop
 * relative ones. OG-only — the card grid still uses the original, lighter image.
 */
function toOgImage(src) {
  try {
    const u = new URL(src);
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", "1200");
      u.searchParams.set("q", "80");
      return u.toString();
    }
    return src; // some other absolute URL — use as-is
  } catch {
    // Not an absolute URL — treat as a site-relative path and absolutize it.
    return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
  }
}

/** Minimal HTML-attribute escaping for values interpolated into <meta content>. */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Inject an article's social/meta tags into the built index.html template:
 * replace <title> + <meta name="description">, then insert OG/Twitter/canonical
 * tags immediately before </head>.
 */
function renderArticleHtml(template, post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.title} — Steady-Steps Life Coaching`;
  const ogImage = toOgImage(post.image);

  const head = [
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escapeAttr(post.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(post.excerpt)}" />`,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(post.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(post.excerpt)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
  ].join("\n      ");

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeAttr(post.excerpt)}" />`
    )
    // Articles are indexable (matches the site-wide default; set explicitly so
    // it holds even if index.html's default changes).
    .replace(
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" content="index, follow" />`
    )
    .replace("</head>", `  ${head}\n    </head>`);
}

/**
 * Prerender the blog index (/blog) as an indexable page. We set robots to
 * index/follow (explicit, matching the site default), add listing meta, and
 * bake a <noscript> list of article links so even JS-less crawlers can reach
 * every article (Googlebot renders the real SPA listing on top).
 */
function renderBlogIndexHtml(template, posts) {
  const url = `${SITE_URL}/blog`;
  const title = "Insights — Steady-Steps Life Coaching";
  const description =
    "Thoughtful articles on personal growth, mindfulness, and sustainable change from life coach Chelsea at Steady Steps.";
  const ogImage = posts.length ? toOgImage(posts[0].image) : "";

  const head = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    ...(ogImage ? [`<meta property="og:image" content="${escapeAttr(ogImage)}" />`] : []),
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
  ].join("\n      ");

  const links = posts
    .map(
      (post) =>
        `<li><a href="${escapeAttr(`/blog/${post.slug}`)}">${escapeAttr(post.title)}</a></li>`
    )
    .join("\n        ");
  const noscript = `<noscript>\n      <ul>\n        ${links}\n      </ul>\n    </noscript>`;

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeAttr(description)}" />`
    )
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="index, follow" />`)
    .replace("</head>", `  ${head}\n    </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);
}

/**
 * sitemap.xml of the indexable URLs. Regenerated on every build, so it stays in
 * sync as articles are added to _data.ts. Lists the home page, the blog index,
 * and every article. (The SPA fallback serves index.html for `/`, which now
 * defaults to index,follow — see index.html.)
 */
function renderSitemap(posts) {
  const escapeXml = (v) =>
    String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const locs = [
    `${SITE_URL}/`,
    `${SITE_URL}/blog`,
    ...posts.map((post) => `${SITE_URL}/blog/${post.slug}`),
  ];
  const urls = locs
    .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** robots.txt that allows crawling and advertises the sitemap. */
function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

async function main() {
  const template = await readFile(path.join(DIST, "index.html"), "utf8");
  const posts = await loadBlogPosts();

  for (const post of posts) {
    const outDir = path.join(DIST, "blog", post.slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), renderArticleHtml(template, post));
  }

  await writeFile(path.join(DIST, "blog", "index.html"), renderBlogIndexHtml(template, posts));
  await writeFile(path.join(DIST, "sitemap.xml"), renderSitemap(posts));
  await writeFile(path.join(DIST, "robots.txt"), renderRobots());

  console.log(
    `✓ Prerendered blog index + ${posts.length} article(s) + sitemap.xml + robots.txt`
  );
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
