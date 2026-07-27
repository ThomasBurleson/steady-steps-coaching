---
name: blog-convert
description: Convert a Word doc or Markdown into a Steady Steps blog article. Use when turning source content (an online .docx, a Google Doc export, or raw Markdown) into a BlogPost entry in src/app/blog/_data.ts. Handles the markitdown → ContentBlock[] pipeline.
---

# Blog convert

Turn source content into a `BlogPost` in [`src/app/blog/_data.ts`](../../../src/app/blog/_data.ts).

Full background: [`docs/blog-authoring.md`](../../../docs/blog-authoring.md).

## Pipeline

```
Google Docs URL → blog:fetch (docx) → markitdown convert_file → Markdown ─┐
                                       blog:images (docx → /public) ───────┼→ blog:convert → ContentBlock[]
```

Sources are **Google Docs** (`docs.google.com`). Pick a `<slug>` up front (kebab-case,
unique) — it names both the article and its image files. Skip ahead if you already have
a local file or Markdown (but you still need the .docx for images).

## Steps

0. **Download the Google Doc as .docx.** The markitdown MCP server does NOT fetch URLs
   (`convert_file` only takes a local `file_path`), and a Google Docs share link is an
   HTML page, not a file. Use the fetcher, which resolves the export endpoint, saves
   into a safe directory, and verifies it got a real document:
   ```bash
   npm run --silent blog:fetch -- "<google-docs-share-url>" /tmp/<slug>.docx
   ```
   The doc must be shared **"Anyone with the link → Viewer"** — otherwise Google returns
   a sign-in page and the fetcher errors out with that hint. (It accepts `/edit` links,
   `open?id=` links, or a bare doc id.) Keep the `.docx` — step 2 needs it for images.

1. **Get Markdown.** Convert the downloaded file with the markitdown MCP `convert_file`
   tool (`file_path: "/tmp/<slug>.docx"`). Save the returned Markdown to `/tmp/<slug>.md`.

2. **Extract images to /public.** markitdown does NOT include real image data (just a
   `data:` placeholder), so pull the embedded images out of the .docx into a per-article
   folder `public/images/blog/<slug>/` in document order:
   ```bash
   node scripts/extract-docx-images.mjs /tmp/<slug>.docx --slug=<slug>
   # → prints JSON, e.g. ["/images/blog/<slug>/1.png"]  (files: public/images/blog/<slug>/N.ext)
   ```
   Capture that JSON — it maps 1:1, in order, to the `data:` placeholders in the Markdown.
   These files are committed with the post (do NOT delete them in step 5).

3. **Convert to blocks**, substituting the extracted image paths:
   ```bash
   IMGS=$(node scripts/extract-docx-images.mjs /tmp/<slug>.docx --slug=<slug>)
   node scripts/md-to-blocks.mjs /tmp/<slug>.md --images="$IMGS"
   #   flags: --json | --no-lead | --keep-data-images
   ```
   (Call `node scripts/...` directly for clean stdout, or `npm run --silent blog:convert`.)
   Output mapping: `#` → article title (comment), `##`/`###` → `heading`, first
   paragraph → `lead`, others → `paragraph`, embedded `data:` image → `image` with the
   extracted `/images/blog/...` path (in order; unmatched ones are dropped with a note),
   `![alt](url)` → `image`, `>` → `quote` (trailing `— Name` → `attribution`),
   `-`/`1.` → `list`. Inline `**bold**`/`*italic*`/`[links]()` are preserved; headings
   exported as `**bold**` are auto-un-bolded (the `heading` block renders plain text).
   `video` blocks have no Markdown form — add them by hand.

4. **Assemble the `BlogPost`.** Add a new object to the `blogPosts` array in
   `src/app/blog/_data.ts` with the generated `content`, plus the fields the script
   can't infer:
   - `slug` (the `<slug>` you chose), `title` (from the `// Title:` comment), `excerpt`
   - `image` (hero — often `/images/blog/<slug>/1.<ext>`), `author` (e.g. `chelsea`)
   - `date` (short, e.g. "Jul 6"), `readTime` (e.g. "6 min read")
   - `tags`, `likes`, `comments` (start at 0)
   Fill in `alt` text on the image blocks (they come out empty).

5. **Review, format, clean up.** Sanity-check block boundaries (markitdown can merge or
   split awkwardly), then:
   ```bash
   npm run format
   rm -f /tmp/<slug>.docx /tmp/<slug>.md    # delete the temp source + markdown
   ```
   Delete only the temp `.docx`/`.md` — the extracted images under `public/images/blog/`
   stay (they're part of the post).

## Notes

- Engines: [`scripts/fetch-gdoc.mjs`](../../../scripts/fetch-gdoc.mjs),
  [`scripts/extract-docx-images.mjs`](../../../scripts/extract-docx-images.mjs),
  [`scripts/md-to-blocks.mjs`](../../../scripts/md-to-blocks.mjs). Each has unit tests
  under `test/`.
- Image order is resolved from `word/document.xml` (embed refs) via the rels file, so
  the Nth placeholder in the Markdown lines up with the Nth extracted image. Repeated
  images reuse one file. Non-web formats (`.emf`/`.wmf`) are saved but warned about —
  replace them.
- Tests require Node with type-stripping. On Node < 22.18 run:
  `node --experimental-strip-types --test "test/**/*.test.ts"`.
