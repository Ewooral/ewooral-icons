// PNG rasteriser. Emits 24/32/48/96 px PNGs per icon under dist/png/
// for use in environments where SVG isn't practical (email, OG images,
// older Android targets). Run with `pnpm build:png` — separate from
// the main build because sharp is heavy (~50MB) and only needed when
// PNG output is actually required.

import sharp from "sharp";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SVG_DIR = join(ROOT, "src/svg");
const OUT_DIR = join(ROOT, "dist/png");

mkdirSync(OUT_DIR, { recursive: true });

const SIZES = [24, 32, 48, 96];
// Render in two ink colors so consumers don't have to recolor each PNG:
//   ink: currentColor placeholder → near-black (#1c1c1a)
//   inverse: → cream (#f5f1e8) for dark backgrounds
const VARIANTS = [
  { suffix: "", ink: "#1c1c1a" },
  { suffix: "@inverse", ink: "#f5f1e8" },
];

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));

for (const file of files) {
  const name = basename(file, ".svg");
  const raw = readFileSync(join(SVG_DIR, file), "utf-8");

  for (const variant of VARIANTS) {
    // sharp needs literal colors — replace currentColor with the variant ink.
    const tinted = raw.replace(/currentColor/g, variant.ink);
    for (const size of SIZES) {
      const out = join(OUT_DIR, `${name}${variant.suffix}@${size}.png`);
      await sharp(Buffer.from(tinted))
        .resize(size, size)
        .png()
        .toFile(out);
    }
  }
}

console.log(`PNG rasterised: ${files.length} icons × ${VARIANTS.length} variants × ${SIZES.length} sizes`);
