// Copy every src/svg/*.svg into site/public/svg/ so the grid can reference
// them as `<img src="/svg/name.svg">`. The browser loads them lazily — no
// 500 KB inline-SVG payload in the client bundle, no Turbopack/Tailwind
// pressure from a single giant client component.
//
// Per the React wrapper's default (noPetal=true), this also strips the
// <g class="ew-signature"> + <g class="ew-splash"> groups when copying.
// img-loaded SVGs are CSS-isolated so the `.ew-signature { display: none }`
// rule never reaches them — we have to bake the strip into the file.
// Inline-SVG consumers still use src/svg/*.svg with the groups intact.
//
// Runs before dev (predev) + build (prebuild) via site/package.json.

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "..", "src", "svg");
const DEST = join(HERE, "..", "public", "svg");

if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith(".svg"));
let stripped = 0;
for (const f of files) {
  let text = readFileSync(join(SRC, f), "utf-8");
  const before = text.length;
  text = text.replace(/<g class="ew-signature"[\s\S]*?<\/g>\s*/g, "");
  text = text.replace(/<g class="ew-splash"[\s\S]*?<\/g>\s*/g, "");
  if (text.length !== before) stripped++;
  writeFileSync(join(DEST, f), text);
}
console.log(`sync-svg: ${files.length} svg → site/public/svg/  (${stripped} had signature/splash stripped)`);
