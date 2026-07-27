#!/usr/bin/env node
/**
 * md-to-blocks — convert Markdown into the typed `ContentBlock[]` used by the blog.
 *
 * The blog stores each article as a `ContentBlock[]` in `src/app/blog/_data.ts`
 * (see the `ContentBlock` union there). This script turns Markdown — e.g. the
 * output of the markitdown MCP server on a Word doc — into that array so it can be
 * pasted into a `BlogPost.content` field.
 *
 * Mapping:
 *   # Heading            → article title (first h1 only; emitted as a `// Title:` comment)
 *   ## / ### Heading     → { type: "heading", text }
 *   first paragraph      → { type: "lead", text }        (disable with --no-lead)
 *   other paragraphs     → { type: "paragraph", text }
 *   ![alt](src "cap")    → { type: "image", src, alt, caption? }
 *   > quote              → { type: "quote", text, attribution? }
 *   - / * / 1. items     → { type: "list", items: [...] }
 *
 * Inline Markdown (**bold**, *italic*, [links](url)) is PRESERVED — the article
 * renderer passes these text fields through react-markdown. There is no Markdown
 * equivalent for the `video` block; add those by hand.
 *
 * Usage:
 *   node scripts/md-to-blocks.mjs article.md          # TS-style array (paste into content)
 *   node scripts/md-to-blocks.mjs --json article.md   # strict JSON
 *   node scripts/md-to-blocks.mjs --no-lead article.md # keep first paragraph as "paragraph"
 *   markitdown-mcp ... | node scripts/md-to-blocks.mjs # read from stdin
 *
 * Limitations: ATX headings (`#`) only (not setext `===`/`---`); standalone
 * `---`/`***`/`___` are treated as horizontal rules and dropped.
 */

const IMAGE_RE = /^!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*\S)\s*#*\s*$/;
const LIST_RE = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const ATTRIBUTION_RE = /^\s*(?:—|–|--)\s*(.+)$/;

/**
 * Strip emphasis markers that wrap an entire string, e.g. "**Heading**" → "Heading".
 * Google Docs exports headings as bold, but the `heading` block renders as plain text
 * (no Markdown), so the markers would otherwise show literally. Only strips when a
 * marker fully encloses the string and doesn't appear inside it.
 */
export function stripWrappingEmphasis(text) {
  let s = String(text).trim();
  for (;;) {
    let changed = false;
    for (const m of ["**", "__", "*", "_"]) {
      if (s.length > m.length * 2 && s.startsWith(m) && s.endsWith(m)) {
        const inner = s.slice(m.length, -m.length);
        if (!inner.includes(m)) {
          s = inner.trim();
          changed = true;
        }
      }
    }
    if (!changed) return s;
  }
}

/**
 * Parse Markdown into `{ title, blocks, droppedImages }`.
 * @param {string} markdown
 * @param {{ lead?: boolean, keepDataImages?: boolean, images?: string[] }} [opts]
 *   lead: promote the first paragraph to a "lead" block (default true).
 *   images: ordered web paths (from extract-docx-images) to substitute into the embedded
 *     (`data:`) image placeholders, in document order — the Nth placeholder becomes an
 *     image block pointing at images[N].
 *   keepDataImages: keep the raw `data:` URI when no substitute is available, instead of
 *     dropping it (default false). Embedded doc images export as huge base64 URIs the
 *     blog can't use, so unresolved ones are dropped.
 * @returns {{ title: string | null, blocks: object[], droppedImages: number }}
 */
export function markdownToBlocks(markdown, opts = {}) {
  const lead = opts.lead !== false;
  const keepDataImages = opts.keepDataImages === true;
  const images = Array.isArray(opts.images) ? opts.images : [];
  let dataImageIndex = 0;
  let droppedImages = 0;
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");

  const blocks = [];
  let title = null;

  // Pending multi-line buffers.
  let para = []; // paragraph lines
  let quote = []; // blockquote lines (marker stripped)
  let list = []; // list item texts

  const flushPara = () => {
    if (para.length) blocks.push({ type: "paragraph", text: para.join(" ").trim() });
    para = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list.slice() });
    list = [];
  };
  const flushQuote = () => {
    if (quote.length) {
      const text = quote.join(" ").trim();
      // Pull a trailing attribution line ("— Someone") out of the quote.
      const last = quote[quote.length - 1];
      const attr = last && ATTRIBUTION_RE.exec(last.trim());
      if (attr && quote.length > 1) {
        const body = quote.slice(0, -1).join(" ").trim();
        blocks.push({ type: "quote", text: body, attribution: attr[1].trim() });
      } else {
        blocks.push({ type: "quote", text });
      }
    }
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const text = stripWrappingEmphasis(heading[2].trim());
      if (level === 1 && title === null) title = text;
      else blocks.push({ type: "heading", text });
      continue;
    }

    const image = IMAGE_RE.exec(line);
    if (image) {
      flushAll();
      const src = image[2];
      const alt = (image[1] || "").trim();
      if (src.startsWith("data:")) {
        // Embedded doc image: substitute the extracted /public path for this position.
        const substitute = images[dataImageIndex];
        dataImageIndex += 1;
        if (substitute) {
          blocks.push({ type: "image", src: substitute, alt });
        } else if (keepDataImages) {
          blocks.push({ type: "image", src, alt });
        } else {
          droppedImages += 1; // no hosted path available — host it and add by hand
        }
        continue;
      }
      const block = { type: "image", src, alt };
      if (image[3]) block.caption = image[3].trim();
      blocks.push(block);
      continue;
    }

    if (HR_RE.test(line)) {
      flushAll();
      continue; // horizontal rule — no block equivalent
    }

    const quoteMatch = QUOTE_RE.exec(line);
    if (quoteMatch) {
      // Switching into a quote ends any paragraph/list in progress.
      flushPara();
      flushList();
      quote.push(quoteMatch[1]);
      continue;
    }

    const listMatch = LIST_RE.exec(line);
    if (listMatch) {
      flushPara();
      flushQuote();
      list.push(listMatch[1].trim());
      continue;
    }

    // Plain text — part of a paragraph. Ends any quote/list in progress.
    flushQuote();
    flushList();
    para.push(line.trim());
  }
  flushAll();

  if (lead) {
    const first = blocks.find((b) => b.type === "paragraph");
    if (first) first.type = "lead";
  }

  return { title, blocks, droppedImages };
}

/** Serialize a value as a TypeScript-style literal with unquoted object keys. */
function serialize(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => padIn + serialize(v, indent + 1));
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const entries = keys.map((k) => `${padIn}${k}: ${serialize(value[k], indent + 1)}`);
    return `{\n${entries.join(",\n")},\n${pad}}`;
  }
  // Strings (and everything else) via JSON — double-quoted, correctly escaped.
  return JSON.stringify(value);
}

/** Render `blocks` as a pasteable TS array literal. */
export function serializeBlocks(blocks) {
  return serialize(blocks, 0);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const noLead = argv.includes("--no-lead");
  const keepDataImages = argv.includes("--keep-data-images");
  const getOpt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
  const file = argv.find((a) => !a.startsWith("-"));

  const { readFile } = await import("node:fs/promises");
  const markdown = file ? await readFile(file, "utf8") : await readStdin();

  // Ordered web paths for embedded images: --images-file=<json> or --images=a,b,c
  let images = [];
  const imagesFile = getOpt("images-file");
  const imagesInline = getOpt("images");
  if (imagesFile) {
    images = JSON.parse(await readFile(imagesFile, "utf8"));
  } else if (imagesInline) {
    const t = imagesInline.trim();
    images = t.startsWith("[") ? JSON.parse(t) : t.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const { title, blocks, droppedImages } = markdownToBlocks(markdown, {
    lead: !noLead,
    keepDataImages,
    images,
  });

  // Warn on stderr so it doesn't pollute the pasteable stdout.
  if (droppedImages > 0) {
    process.stderr.write(
      `note: dropped ${droppedImages} embedded (data:) image(s) — host them and add ` +
        `image block(s) by hand (or pass --keep-data-images).\n`,
    );
  }

  if (json) {
    process.stdout.write(JSON.stringify(blocks, null, 2) + "\n");
    return;
  }

  if (title) process.stdout.write(`// Title: ${title}\n`);
  process.stdout.write("// Paste as a BlogPost.content value, then run: npm run format\n");
  process.stdout.write(serializeBlocks(blocks) + "\n");
}

// Run as CLI only when invoked directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
