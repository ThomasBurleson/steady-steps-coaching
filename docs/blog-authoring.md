# Blog authoring workflow

Blog articles for Steady Steps originate as **online Word documents** and are turned
into on-site articles by converting them to Markdown with the **markitdown MCP server**,
then mapping the result into typed content blocks.

## Pipeline

```
Google Doc (.docx)  →  markitdown convert_file  →  Markdown  ─┐
                        extract-docx-images → /public ────────┼→ md-to-blocks → ContentBlock[] in _data.ts
```

Articles are **not** stored as raw Markdown files. Each post lives in
[`src/app/blog/_data.ts`](../src/app/blog/_data.ts) as a `BlogPost` whose `content`
is a `ContentBlock[]` (typed blocks: `lead`, `paragraph`, `heading`, `image`, `quote`,
`list`, `video`).

The `blog-convert` skill drives this end to end. The scripts:

```bash
node scripts/fetch-gdoc.mjs "<share-url>" /tmp/post.docx     # Google Doc → .docx
node scripts/extract-docx-images.mjs /tmp/post.docx --slug=post   # images → public/images/blog/post/
node scripts/md-to-blocks.mjs /tmp/post.md --images="$IMGS"  # Markdown → pasteable content array
```

`md-to-blocks` maps `##`→`heading`, first paragraph→`lead`, others→`paragraph`,
`![alt](src)`→`image`, `>`→`quote`, `-`/`1.`→`list`, preserves inline
`**bold**`/`*italic*`/links, and un-bolds headings. `video` blocks have no Markdown form
— add by hand.

**Images:** markitdown only emits a `data:` placeholder for embedded images, so
`extract-docx-images` pulls the real files out of the .docx (a zip) into a per-article
folder `public/images/blog/<slug>/N.ext` in document order, and `md-to-blocks --images=…`
substitutes those `/images/blog/<slug>/N.ext` paths into the `image` blocks. The
extracted files are committed with the post. Fill in `alt` text by hand.

**Cleanup:** after the post is in `_data.ts`, delete the temp `.docx` and `.md`
(`rm -f /tmp/post.docx /tmp/post.md`); keep the images under `public/`.

## Title style

Article `title`s use **sentence case** — capitalize only the first word plus proper
nouns and acronyms (e.g. `Why AI can't replace your coach`, `The art of saying no`),
**not** Title Case. The title feeds the on-page `<h1>` and the `<title>` / `og:title` /
`twitter:title` tags. The `slug` is independent (always lowercase-kebab) and does not
change when a title's casing does.

## Public assets & paths

Vite serves everything under [`public/`](../public) from the site root, so a file at
`public/<path>` is referenced as `/<path>` (no `public/` prefix, no import). Conventions:

| On disk | Referenced in code as | Used for |
| --- | --- | --- |
| `public/videos/<slug>/clip.mp4` | `/videos/<slug>/clip.mp4` | `video` block `src` (per-article folder) |
| `public/images/blog/<slug>/N.ext` | `/images/blog/<slug>/N.ext` | blog `image` block `src` / `poster` (per-article folder) |

Each article's assets live in a folder named by its slug — images under
`public/images/blog/<slug>/` and videos under `public/videos/<slug>/`. The hero `image`
and video `poster` fields point at files in the image folder (or a remote URL). Keep an
article's assets together and delete them if the post is removed. Assets imported through
the bundler instead (e.g. `src/_images/*`) are `import`ed in TS, not served from
`public/` — that's a separate mechanism.

## markitdown MCP server

Configured in [`.mcp.json`](../.mcp.json) (project scope) and also in the user-global
Claude Code config. Tools exposed: `convert_file`, `convert_directory`,
`list_supported_formats`.

The server restricts file access to a set of **safe directories** (this repo,
`~/Documents`, `~/Downloads`, `~/Desktop`, and temp). Download or place the `.docx`
in one of those before converting.

**It does not fetch URLs.** This fork's `convert_file` takes only a local `file_path`
(or base64 `file_content`) — there is no URL/URI tool.

Sources are **Google Docs**. A share link is an HTML editor page, not a file, so
download it as `.docx` via the export endpoint first — use the fetcher, which resolves
the id, saves into a safe directory, and verifies it got a real document (not a sign-in
page):

```bash
npm run blog:fetch -- "<google-docs-share-url>"     # → prints /tmp/gdoc-<id>.docx
```

The doc must be shared **"Anyone with the link → Viewer"**. Engine:
[`scripts/fetch-gdoc.mjs`](../scripts/fetch-gdoc.mjs) (export URL is
`https://docs.google.com/document/d/<DOC_ID>/export?format=docx`).

### Installation

Requires Python 3.10+. This repo uses [`uv`](https://docs.astral.sh/uv/) (not `pipx`):

```bash
uv tool install "git+https://github.com/trsdn/markitdown-mcp.git" \
  --with "markitdown[all]" --with openpyxl --with xlrd --with pandas \
  --with pymupdf --with pdfplumber \
  --with "cryptography<49"
```

> **Intel Mac note:** the `cryptography<49` pin is required on x86_64 macOS —
> `cryptography` 49+ ships no Intel wheel and source-builds against a Cargo toolchain
> that's too old to parse its manifest. 48.x has a prebuilt Intel wheel. On Apple
> Silicon this pin is unnecessary.

After installing, `markitdown-mcp` is on `PATH` (via `~/.local/bin`). The committed
`.mcp.json` invokes it by bare name so it resolves per-machine.

The README's `pipx` instructions map to `uv` as: `pipx install` → `uv tool install`,
`pipx inject <dep>` → an extra `--with <dep>`.
