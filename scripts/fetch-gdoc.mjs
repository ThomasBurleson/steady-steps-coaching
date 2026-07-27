#!/usr/bin/env node
/**
 * fetch-gdoc — download a Google Doc as .docx into a markitdown-safe directory.
 *
 * The markitdown MCP server can't fetch URLs, and a Google Docs share link is an HTML
 * editor page, not a file. This resolves a share link (or bare doc id) to the export
 * endpoint, downloads the .docx, and verifies it's a real document — not the HTML
 * login/permission page Google returns for private docs.
 *
 * The doc must be shared so "anyone with the link can view" (otherwise the export
 * endpoint returns a sign-in page and this errors out).
 *
 * Usage:
 *   node scripts/fetch-gdoc.mjs "<google-docs-url>" [outPath]
 *   node scripts/fetch-gdoc.mjs "<url>"                 # → /tmp/gdoc-<id>.docx
 *   node scripts/fetch-gdoc.mjs "<url>" --format=md     # export Markdown instead of docx
 *
 * Prints the output path on success (so it can be piped into the next step).
 */

/**
 * Extract the document id from a Google Docs URL or accept a bare id.
 * @param {string} input
 * @returns {string}
 */
export function extractDocId(input) {
  const s = String(input).trim();
  const m = s.match(/\/document\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  // Also accept "...open?id=<ID>" links.
  const q = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (q) return q[1];
  // Bare id.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;
  throw new Error(`Could not find a Google Docs document id in: ${input}`);
}

/**
 * Build the Google Docs export URL for a document id.
 * @param {string} id
 * @param {string} [format] docx (default) | md | pdf | txt | html | odt | rtf
 */
export function buildExportUrl(id, format = "docx") {
  return `https://docs.google.com/document/d/${id}/export?format=${format}`;
}

const DOCX_MAGIC = [0x50, 0x4b]; // "PK" — docx is a zip archive

async function main() {
  const argv = process.argv.slice(2);
  const formatArg = argv.find((a) => a.startsWith("--format="));
  const format = formatArg ? formatArg.split("=")[1] : "docx";
  const positional = argv.filter((a) => !a.startsWith("-"));
  const url = positional[0];
  if (!url) {
    console.error('Usage: node scripts/fetch-gdoc.mjs "<google-docs-url>" [outPath] [--format=docx|md]');
    process.exit(1);
  }

  const id = extractDocId(url);
  const exportUrl = buildExportUrl(id, format);
  const ext = format === "md" ? "md" : format;
  const outPath = positional[1] ?? `/tmp/gdoc-${id}.${ext}`;

  const res = await fetch(exportUrl, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Export request failed: HTTP ${res.status} ${res.statusText} for ${exportUrl}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());

  // Detect Google's sign-in / permission page instead of a real export.
  const looksHtml =
    contentType.includes("text/html") ||
    (buf.length >= 15 && buf.slice(0, 15).toString("latin1").toLowerCase().includes("<!doctype html"));
  if (looksHtml) {
    throw new Error(
      `Got an HTML page, not a document. The doc is likely not shared publicly.\n` +
        `Set sharing to "Anyone with the link → Viewer" and retry. (${exportUrl})`,
    );
  }
  if (format === "docx" && !(buf[0] === DOCX_MAGIC[0] && buf[1] === DOCX_MAGIC[1])) {
    throw new Error(`Downloaded data is not a valid .docx (bad magic bytes) from ${exportUrl}`);
  }

  const { writeFile } = await import("node:fs/promises");
  await writeFile(outPath, buf);
  process.stdout.write(outPath + "\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
