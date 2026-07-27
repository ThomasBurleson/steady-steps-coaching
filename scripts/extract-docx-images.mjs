#!/usr/bin/env node
/**
 * extract-docx-images — pull embedded images out of a .docx into /public, in document order.
 *
 * markitdown does NOT embed real image data (it emits a truncated
 * `![](data:image/png;base64...)` placeholder), but the actual images live inside the
 * .docx (which is a zip) under `word/media/`. This extracts them in the order they
 * appear in the document and writes them to a public directory, then prints the ordered
 * list of web paths (JSON) so `md-to-blocks` can drop them into the `image` blocks.
 *
 * Document order is resolved from `word/document.xml` (`r:embed`/`r:link` references, in
 * order) mapped through `word/_rels/document.xml.rels` to the media file — so repeated
 * images keep their positions and the Nth placeholder lines up with the Nth image.
 *
 * Images are grouped into a per-article folder named by the slug:
 *   public/images/blog/<slug>/<n>.<ext>   (referenced as /images/blog/<slug>/<n>.<ext>)
 *
 * Usage:
 *   node scripts/extract-docx-images.mjs <file.docx> --slug=<slug>
 *   node scripts/extract-docx-images.mjs <file.docx> --slug=my-post --out=public/images/blog
 *
 * Prints e.g.  ["/images/blog/my-post/1.png","/images/blog/my-post/2.png"]  on stdout.
 * Unique images are written once but may appear multiple times in the returned list.
 */

import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const WEB_SAFE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"]);

/** Read a single entry from a zip as a Buffer via the system `unzip`. */
function readZipEntry(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], { maxBuffer: 256 * 1024 * 1024 });
}

/** Parse `word/_rels/document.xml.rels` into a map of relationship id → target path. */
export function parseRels(relsXml) {
  const map = new Map();
  const re = /<Relationship\b[^>]*?\/?>/g;
  let m;
  while ((m = re.exec(relsXml))) {
    const el = m[0];
    const id = /\bId="([^"]+)"/.exec(el)?.[1];
    const target = /\bTarget="([^"]+)"/.exec(el)?.[1];
    const mode = /\bTargetMode="([^"]+)"/.exec(el)?.[1];
    if (id && target) map.set(id, { target, external: mode === "External" });
  }
  return map;
}

/** Ordered list of embedded relationship ids as they appear in `word/document.xml`. */
export function embedOrder(documentXml) {
  const ids = [];
  const re = /r:(?:embed|link)="([^"]+)"/g;
  let m;
  while ((m = re.exec(documentXml))) ids.push(m[1]);
  return ids;
}

/** Resolve a rels Target (relative to `word/`) into a zip entry path. */
function resolveEntry(target) {
  const joined = target.startsWith("/") ? target.slice(1) : path.posix.join("word", target);
  return path.posix.normalize(joined);
}

async function main() {
  const argv = process.argv.slice(2);
  const getOpt = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
  const docx = argv.find((a) => !a.startsWith("-"));
  if (!docx) {
    console.error("Usage: node scripts/extract-docx-images.mjs <file.docx> --slug=<slug> [--out=public/images/blog]");
    process.exit(1);
  }
  const baseDir = getOpt("out") ?? "public/images/blog";
  // --slug names the per-article folder (accepts the old --prefix alias).
  const slug = getOpt("slug") ?? getOpt("prefix") ?? path.basename(docx).replace(/\.[^.]+$/, "");
  const outDir = path.join(baseDir, slug); // public/images/blog/<slug>/
  const publicRoot = getOpt("public-root") ?? "public";

  let documentXml, relsXml;
  try {
    documentXml = readZipEntry(docx, "word/document.xml").toString("utf8");
  } catch {
    console.error(`Could not read word/document.xml from ${docx} — is it a .docx?`);
    process.exit(1);
  }
  try {
    relsXml = readZipEntry(docx, "word/_rels/document.xml.rels").toString("utf8");
  } catch {
    relsXml = "";
  }

  const rels = parseRels(relsXml);
  const order = embedOrder(documentXml);

  await mkdir(outDir, { recursive: true });

  const webPaths = [];
  const writtenByTarget = new Map(); // dedupe identical media across positions
  let n = 0;

  for (const id of order) {
    const rel = rels.get(id);
    if (!rel) continue; // not an image relationship (e.g. hyperlink)
    if (rel.external || /^https?:/i.test(rel.target)) {
      console.error(`note: skipping externally-linked image (${rel.target}) — not embedded in the file.`);
      continue;
    }
    const entry = resolveEntry(rel.target);
    if (!/\/media\//.test(entry)) continue; // only real media

    if (writtenByTarget.has(entry)) {
      webPaths.push(writtenByTarget.get(entry));
      continue;
    }

    n += 1;
    const ext = (path.extname(entry).slice(1) || "png").toLowerCase();
    if (!WEB_SAFE_EXT.has(ext)) {
      console.error(`warning: ${entry} is a .${ext} image — browsers may not render it; consider replacing.`);
    }
    const fileName = `${n}.${ext}`; // folder is named by slug, so filename is just the index
    const outFile = path.join(outDir, fileName);
    let bytes;
    try {
      bytes = readZipEntry(docx, entry);
    } catch {
      console.error(`warning: could not extract ${entry}; skipping.`);
      continue;
    }
    await writeFile(outFile, bytes);

    const webPath = "/" + path.relative(publicRoot, outFile).split(path.sep).join("/");
    writtenByTarget.set(entry, webPath);
    webPaths.push(webPath);
  }

  if (webPaths.length === 0) console.error("note: no embedded images found in the document.");
  process.stdout.write(JSON.stringify(webPaths) + "\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
