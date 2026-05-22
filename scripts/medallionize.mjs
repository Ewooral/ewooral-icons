// One-shot transform: wrap every src/svg/*.svg in the Ewooral Medallion
// chrome (petal backdrop + dotted ring + gold petal-ribbon spark).
//
// Idempotent: any file that already has `class="ew-chrome"` is skipped.
// Removes the old corner-dot `.ew-spark` (circle/rect/path) because the
// medallion's petal-ribbon takes over that role on hover.
//
// Run with: node scripts/medallionize.mjs

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SVG_DIR = new URL("../src/svg/", import.meta.url).pathname;

const CHROME = `  <g class="ew-chrome">
    <path class="ew-backdrop" fill="var(--ew-bg, currentColor)" fill-opacity="var(--ew-bg-opacity, 0.07)"
          d="M12 1.6 C 18 2.4  22.4 6.4  22.4 12  C 22.4 17.6 18 22  12 22.4
             C 6 22  1.6 17.6  1.6 12  C 1.6 6.4  6 2.4  12 1.6 Z"/>
    <path fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.45"
          stroke-dasharray="0.4 1.8" stroke-linecap="round"
          d="M12 3.2 C 17.2 3.9  20.8 7.2  20.8 12  C 20.8 16.8 17.2 20.4 12 20.8
             C 6.8 20.4 3.2 16.8 3.2 12  C 3.2 7.2  6.8 3.9  12 3.2 Z"/>
    <path class="ew-spark" fill="var(--ew-accent, #f5b820)"
          d="M18.5 3.4 C 20.4 3.4  21.6 4.8  21.4 6.6
             C 21.2 7.4  20.4 7.7  19.4 7.5
             C 18.4 7.2  17.6 6.4  17.6 5.4
             C 17.6 4.4  18 3.8  18.5 3.4 Z"/>
    <g class="ew-splash" aria-hidden="true">
      <circle class="ew-p1" cx="19.6" cy="5.5" r="0.9"  fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p2" cx="19.6" cy="5.5" r="0.75" fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p3" cx="19.6" cy="5.5" r="0.85" fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p4" cx="19.6" cy="5.5" r="0.7"  fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p5" cx="19.6" cy="5.5" r="0.8"  fill="var(--ew-accent, #f5b820)"/>
    </g>
  </g>`;

// 0.5x scale centred — glyph lives in the inner ~12px disc
const GLYPH_OPEN = `  <g class="ew-glyph" transform="translate(12 12.5) scale(0.5) translate(-12 -12)">`;
const GLYPH_CLOSE = `  </g>`;

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));

let touched = 0;
let skipped = 0;

for (const file of files) {
  const path = join(SVG_DIR, file);
  const raw = readFileSync(path, "utf-8");

  if (raw.includes('class="ew-chrome"')) {
    skipped++;
    continue;
  }

  // Capture outer <svg ...> tag verbatim so we keep class + data-motion + viewBox
  const openMatch = raw.match(/<svg[^>]*>/);
  if (!openMatch) {
    console.warn(`! ${file}: no <svg> tag found, skipping`);
    skipped++;
    continue;
  }
  const openTag = openMatch[0];
  const inner = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();

  // Strip the old corner-dot ew-spark — the medallion's petal-ribbon
  // replaces it. We strip self-closing variants of circle / rect / path
  // that carry `class="ew-spark"`.
  const cleaned = inner
    .replace(/<(circle|rect|path)[^>]*class="ew-spark"[^>]*\/>\s*/g, "")
    .trim();

  // If the icon's data-motion is "spark" or "pulse", those rules now drive
  // the medallion's spark (which is still .ew-spark, just lives in chrome).
  // Nothing to rewrite — class name is identical.

  const out = `${openTag}
${CHROME}

${GLYPH_OPEN}
${indent(cleaned, 4)}
${GLYPH_CLOSE}
</svg>
`;

  writeFileSync(path, out);
  touched++;
  console.log(`  medallionized: ${file}`);
}

function indent(s, n) {
  const pad = " ".repeat(n);
  return s.split("\n").map((line) => (line.length ? pad + line : line)).join("\n");
}

console.log(`\n${touched} touched, ${skipped} skipped (already medallioned).`);
