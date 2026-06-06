// Copy every src/svg/*.svg into site/public/svg/ so the grid can reference
// them as `<img src="/svg/name.svg">`. The browser loads them lazily — no
// 500 KB inline-SVG payload in the client bundle, no Turbopack/Tailwind
// pressure from a single giant client component.
//
// Runs before dev (predev) + build (prebuild) via site/package.json.

import { mkdirSync, readdirSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "..", "src", "svg");
const DEST = join(HERE, "..", "public", "svg");

if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith(".svg"));
for (const f of files) {
  copyFileSync(join(SRC, f), join(DEST, f));
}
console.log(`sync-svg: ${files.length} svg → site/public/svg/`);
