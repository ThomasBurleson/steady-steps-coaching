// Generate responsive AVIF variants of the hero (LCP) image from a single
// master, so mobile downloads far fewer bytes than the full-width desktop image.
//
// Master (not served):  src/_images/forest.avif   (1800×900)
// Output (served):      public/forest-<width>.avif
//
// Wired into `npm run build` (before `vite build`, so Vite copies public/), and
// runnable on its own via `npm run images`. Output is deterministic, so the
// committed variants and a fresh build produce identical bytes. When the master
// changes, re-run and commit the regenerated variants.

import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MASTER = path.join(root, "src/_images/forest.avif");
const OUT_DIR = path.join(root, "public");

// The master is 1800px wide. Downscaled widths cover phones/tablets (accounting
// for 2–3× DPR); the full width is copied as-is to avoid re-compressing it.
const DOWNSCALED = [768, 1280];
const FULL_WIDTH = 1800;
const QUALITY = 55; // AVIF quality — visually clean for a photographic hero

await mkdir(OUT_DIR, { recursive: true });

for (const width of DOWNSCALED) {
  const out = path.join(OUT_DIR, `forest-${width}.avif`);
  await sharp(MASTER).resize({ width }).avif({ quality: QUALITY }).toFile(out);
  console.log(`✓ forest-${width}.avif`);
}

// Full-size variant: copy the already-encoded master verbatim (no re-encode).
await copyFile(MASTER, path.join(OUT_DIR, `forest-${FULL_WIDTH}.avif`));
console.log(`✓ forest-${FULL_WIDTH}.avif (copied from master)`);
