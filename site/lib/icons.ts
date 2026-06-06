import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve ../../src/svg from inside the site/ folder regardless of CWD
// (Next.js runs from project root during build, from site/ during dev).
const HERE = dirname(fileURLToPath(import.meta.url));
const SVG_DIR = join(HERE, "..", "..", "src", "svg");

export type IconRecord = {
  /** kebab-case icon name, e.g. "arrow-up" */
  name: string;
  /** "ew-arrow-up" — what users see + search */
  displayName: string;
  /** "EWArrowUp" — React component export name */
  pascal: string;
  /** Raw inline SVG string */
  svg: string;
  /** data-motion value from the SVG (pop, tilt, swing, slide-r, ...) */
  motion: string | null;
};

const toPascal = (s: string) =>
  "EW" + s.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());

let _cache: IconRecord[] | null = null;

/** All icons in the package, loaded synchronously at build time.
 *  Safe to call from Server Components and generateStaticParams. */
export function loadIcons(): IconRecord[] {
  if (_cache) return _cache;
  const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg")).sort();
  _cache = files.map((file) => {
    const name = file.replace(/\.svg$/, "");
    const svg = readFileSync(join(SVG_DIR, file), "utf-8");
    const motionMatch = svg.match(/data-motion="([^"]+)"/);
    return {
      name,
      displayName: `ew-${name}`,
      pascal: toPascal(name),
      svg,
      motion: motionMatch?.[1] ?? null,
    };
  });
  return _cache;
}

export function loadIcon(name: string): IconRecord | undefined {
  return loadIcons().find((i) => i.name === name);
}

/** Same shape as IconRecord minus the raw `svg` field. Use this whenever
 *  the consumer is a Client Component — keeps the serialized payload to a
 *  few KB instead of inlining ~500 KB of SVG content into every page. */
export type IconMeta = Omit<IconRecord, "svg">;

export function loadIconMeta(): IconMeta[] {
  return loadIcons().map(({ svg: _svg, ...meta }) => meta);
}
