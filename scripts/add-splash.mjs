// Inject a `.ew-splash` particle group into every medallioned SVG, right
// before the closing tag of `<g class="ew-chrome">`. The CSS in icons.css
// drives the per-particle keyframes on hover.
//
// Idempotent: skips files that already contain class="ew-splash".

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SVG_DIR = new URL("../src/svg/", import.meta.url).pathname;

// Five particles, all emitted from the spark's centre (~19.6, 5.5).
// Each carries its own class so a keyframe can give it a unique trajectory.
const SPLASH = `    <g class="ew-splash" aria-hidden="true">
      <circle class="ew-p1" cx="19.6" cy="5.5" r="0.9"  fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p2" cx="19.6" cy="5.5" r="0.75" fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p3" cx="19.6" cy="5.5" r="0.85" fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p4" cx="19.6" cy="5.5" r="0.7"  fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p5" cx="19.6" cy="5.5" r="0.8"  fill="var(--ew-accent, #f5b820)"/>
    </g>`;

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));

let touched = 0;
let skipped = 0;

for (const file of files) {
  const path = join(SVG_DIR, file);
  const raw = readFileSync(path, "utf-8");

  if (raw.includes('class="ew-splash"')) {
    skipped++;
    continue;
  }

  const start = raw.indexOf('<g class="ew-chrome">');
  if (start === -1) {
    console.warn(`! ${file}: no ew-chrome group, skipping`);
    skipped++;
    continue;
  }
  // ew-chrome has no nested <g>, so the FIRST </g> after `start` closes it.
  const end = raw.indexOf("</g>", start);
  if (end === -1) {
    console.warn(`! ${file}: unclosed ew-chrome, skipping`);
    skipped++;
    continue;
  }

  // Trim any trailing whitespace before </g> so our insertion has clean indent.
  const before = raw.slice(0, end).replace(/\s+$/, "\n");
  const after = raw.slice(end);
  const out = `${before}${SPLASH}\n  ${after}`;
  writeFileSync(path, out);
  touched++;
  console.log(`  splash added: ${file}`);
}

console.log(`\n${touched} touched, ${skipped} skipped.`);
