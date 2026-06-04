// Build-time code generation for @ewooral/icons.
//
// Pipeline (run with `pnpm build:react`):
//   1. Read every SVG from src/svg/
//   2. Emit a React .tsx component per icon under dist/.tmp-tsx/components/
//   3. Emit a barrel dist/.tmp-tsx/index.ts that re-exports all icons
//   4. Copy the source SVGs into dist/svg/ (consumed via @ewooral/icons/svg/<name>)
//   5. Concatenate all SVGs into dist/sprite.svg (id'd <symbol>s)
//   6. Copy src/styles/icons.css into dist/styles/icons.css
//   7. Emit dist/manifest.json with the icon catalog
//
// Then tsc compiles dist/.tmp-tsx/ → dist/react/ with proper .d.ts files
// (the second step of `pnpm build` chains it).

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SVG_DIR = join(ROOT, "src/svg");
const STYLES_DIR = join(ROOT, "src/styles");
const VANILLA_DIR = join(ROOT, "src/vanilla");
const DIST_DIR = join(ROOT, "dist");
const TSX_DIR = join(DIST_DIR, ".tmp-tsx");
const TSX_COMPONENTS_DIR = join(TSX_DIR, "components");

// Clean
if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true, force: true });
mkdirSync(TSX_COMPONENTS_DIR, { recursive: true });
mkdirSync(join(DIST_DIR, "svg"), { recursive: true });
mkdirSync(join(DIST_DIR, "styles"), { recursive: true });
mkdirSync(join(DIST_DIR, "vanilla"), { recursive: true });

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));

// kebab-case → "EW" prefixed PascalCase. e.g. "arrow-right" → "EWArrowRight".
// The EW prefix is the brand signature in import statements — every
// Ewooral icon visibly starts with EW in source code.
const toPascal = (s) =>
  "EW" + s.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

const manifest = [];

for (const file of files) {
  const name = basename(file, ".svg");
  const pascal = toPascal(name);
  const raw = readFileSync(join(SVG_DIR, file), "utf-8");

  // Copy source SVG into dist/svg for direct consumption
  writeFileSync(join(DIST_DIR, "svg", file), raw);

  // Build the React component. We strip the outer <svg> tag and re-emit it
  // with spread props so consumers can override width/height/className/etc.
  const inner = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();

  // Pull the class + data-motion attributes off the original <svg> so we
  // can apply them as defaults on the generated component.
  const classMatch = raw.match(/class="([^"]*)"/);
  const motionMatch = raw.match(/data-motion="([^"]*)"/);

  // Pre-compute body variants:
  //   FULL     = chrome + glyph (default)
  //   NO_PETAL = chrome (minus petal-ribbon) + glyph
  //   PLAIN    = glyph only (medallion chrome stripped)
  const innerFull = inner;
  const innerNoPetal = inner.replace(/<(circle|rect|path)[^>]*class="ew-spark"[^>]*\/>/g, "");
  // Plain mode: strip the chrome, scale the glyph 1.8x so it actually fills
  // the icon box, and swap the baked-in brand greens for currentColor so the
  // glyph inherits the surrounding text colour (adapts per theme — invisible
  // against the default-theme forest-green bg otherwise). Sage stays for the
  // two-tone visual identity; gold accent (var(--ew-accent)) stays for the
  // brand spark.
  const innerPlain = inner
    .replace(/<g[^>]*class="ew-chrome"[^>]*>[\s\S]*?<\/g>/g, "")
    .replace(
      /<g class="ew-body" transform="translate\(12 12(?:\.\d+)?\)">/,
      '<g class="ew-body" transform="translate(12 12) scale(1.8)">',
    )
    // Structural (primary/highlight) colours → currentColor so the glyph
    // inherits the surrounding text colour and adapts to every theme.
    // Greens (#1a3a2a, #0f2017, #142a1e) are the dark primary fills/outlines
    // — invisible on the default-theme forest-green bg otherwise.
    // Creams (#f5f1e8, #fff3cf) are the light highlights — invisible on
    // the light theme white bg otherwise.
    // Sage #8fb89a stays for the two-tone effect; gold var(--ew-accent) and
    // rose stay for brand pops.
    .replace(/(fill|stroke)="#1a3a2a"/g, '$1="currentColor"')
    .replace(/(fill|stroke)="#0f2017"/g, '$1="currentColor"')
    .replace(/(fill|stroke)="#142a1e"/g, '$1="currentColor"')
    .replace(/(fill|stroke)="#f5f1e8"/g, '$1="currentColor"')
    .replace(/(fill|stroke)="#fff3cf"/g, '$1="currentColor"');

  const tsx = `"use client";
import * as React from "react";

export type EWMotion = "play" | "repeat" | "off" | number;

/** When does the animation fire?
 *  - "hover"    (default) play whenever the cursor is over the icon
 *  - "click"    play once on click / touch
 *  - "focus"    play while the icon (or wrapping <button>) has focus
 *  - "mount"    play once as soon as it appears in the React tree
 *  - "viewport" play whenever it scrolls into view (IntersectionObserver)
 *  - "manual"   only fires via ref.play()
 */
export type EWTrigger = "hover" | "click" | "focus" | "mount" | "viewport" | "manual";

/** Imperative handle exposed via ref — every icon supports .play() so
 *  the parent can drive the animation from anywhere, regardless of the
 *  trigger setting. \`.svg\` gives the underlying <svg> element. */
export type EWIconHandle = {
  /** Force one play cycle now. Honours \`motion\`/\`speed\`/\`delay\`. */
  play: () => void;
  /** Cancel a running animation (useful for trigger="repeat" loops). */
  stop: () => void;
  /** The underlying <svg> element. Null until mounted. */
  svg: SVGSVGElement | null;
};

export type IconProps = Omit<React.SVGAttributes<SVGSVGElement>, "color"> & {
  /** Sets both width and height. */
  size?: number | string;
  /** Glyph + medallion-backdrop colour. Drives currentColor. */
  color?: string;
  /** Petal-ribbon colour. Defaults to the brand gold #f5b820. */
  accent?: string;
  /** Medallion disc background. Any CSS colour. When unset, the disc is a
   *  subtle 7%-opacity tint of \`color\`. When set, it fills solid. */
  bg?: string;
  /** Hide the gold petal-ribbon (backdrop + ring stay). */
  noPetal?: boolean;
  /** Strip the medallion chrome — glyph only. */
  plain?: boolean;
  /** Animation play count:
   *  - "play"   (default) — play once
   *  - "repeat" — loop until something stops it (esp. trigger="manual"+stop)
   *  - "off"    — no animation at all
   *  - number   — play exactly N times
   */
  motion?: EWMotion;
  /** Animation duration. CSS time string ("0.7s") or ms number (700).
   *  Default 0.7s. Bigger = slower. */
  speed?: string | number;
  /** Animation delay before motion starts. CSS time string or ms number.
   *  Default 0s. */
  delay?: string | number;
  /** What kind of event fires the animation. Default "hover". */
  trigger?: EWTrigger;
  /** Called every time the animation starts (good for haptics, sound, analytics). */
  onPlay?: () => void;
};

const FULL = ${JSON.stringify(innerFull)};
const NO_PETAL = ${JSON.stringify(innerNoPetal)};
const PLAIN = ${JSON.stringify(innerPlain)};

const toTime = (v: string | number | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === "number" ? \`\${v}ms\` : v;

// Parse a CSS time string ("0.7s", "500ms") to milliseconds.
const toMs = (v: string | undefined, fallback: number): number => {
  if (!v) return fallback;
  const m = v.trim().match(/^([\\d.]+)(ms|s)$/);
  if (!m) return fallback;
  const n = parseFloat(m[1]);
  return m[2] === "ms" ? n : n * 1000;
};

const ${pascal} = React.forwardRef<EWIconHandle, IconProps>(function ${pascal}(
  {
    size = 24,
    className,
    color, accent, bg,
    noPetal, plain,
    motion = "play",
    speed, delay,
    trigger = "hover",
    onPlay,
    style, children, ...rest
  },
  ref,
) {
  const cls = ["ew-icon", className].filter(Boolean).join(" ");
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const playTimer = React.useRef<number | null>(null);

  // Map motion prop → CSS variable + data-attribute.
  let iter: string = "1";
  let off = false;
  if (motion === "off") off = true;
  else if (motion === "repeat") iter = "infinite";
  else if (typeof motion === "number") iter = String(motion);

  const dur = toTime(speed);
  const dly = toTime(delay);

  // Imperative play: set data-play, then auto-clear after the expected
  // duration so the next call re-triggers from frame 0. For motion="repeat"
  // (iter === "infinite") we don't auto-clear — call stop() to stop the loop.
  const play = React.useCallback(() => {
    const el = svgRef.current;
    if (!el || off) return;
    el.removeAttribute("data-play");
    // Force reflow so re-adding the attribute restarts the animation
    // even if the element was already mid-animation.
    void el.getBoundingClientRect();
    el.setAttribute("data-play", "");
    onPlay?.();
    if (playTimer.current != null) window.clearTimeout(playTimer.current);
    if (iter === "infinite") return;
    const cycleMs = toMs(dur, 700);
    const delayMs = toMs(dly, 0);
    const totalMs = cycleMs * Number(iter || 1) + delayMs + 60;
    playTimer.current = window.setTimeout(() => {
      svgRef.current?.removeAttribute("data-play");
      playTimer.current = null;
    }, totalMs);
  }, [iter, dur, dly, off, onPlay]);

  const stop = React.useCallback(() => {
    if (playTimer.current != null) window.clearTimeout(playTimer.current);
    playTimer.current = null;
    svgRef.current?.removeAttribute("data-play");
  }, []);

  React.useImperativeHandle(ref, () => ({
    play, stop,
    get svg() { return svgRef.current; },
  }), [play, stop]);

  // Trigger wiring — each trigger mode attaches the right native event.
  // trigger="hover" is the no-op default — CSS :hover does it for free.
  React.useEffect(() => {
    if (off || trigger === "hover") return;
    const el = svgRef.current;
    if (!el) return;

    if (trigger === "manual") return; // ref.play() only

    if (trigger === "mount") {
      play();
      return;
    }

    if (trigger === "click") {
      const handler = () => play();
      el.addEventListener("click", handler);
      return () => el.removeEventListener("click", handler);
    }

    if (trigger === "focus") {
      const focusHandler = () => play();
      // SVGs need tabindex to be focusable
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      el.addEventListener("focus", focusHandler);
      return () => el.removeEventListener("focus", focusHandler);
    }

    if (trigger === "viewport") {
      if (typeof IntersectionObserver === "undefined") {
        play();
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) play(); });
      }, { threshold: 0.4 });
      io.observe(el);
      return () => io.disconnect();
    }
  }, [trigger, play, off]);

  React.useEffect(() => () => {
    if (playTimer.current != null) window.clearTimeout(playTimer.current);
  }, []);

  const mergedStyle: React.CSSProperties = {
    ...(color ? { color } : {}),
    ...(accent ? ({ ["--ew-accent" as never]: accent } as React.CSSProperties) : {}),
    ...(bg ? ({ ["--ew-bg" as never]: bg, ["--ew-bg-opacity" as never]: 1 } as React.CSSProperties) : {}),
    ["--ew-iter" as never]: iter,
    ...(dur ? ({ ["--ew-dur" as never]: dur } as React.CSSProperties) : {}),
    ...(dly ? ({ ["--ew-delay" as never]: dly } as React.CSSProperties) : {}),
    ...style,
  };
  const body = plain ? PLAIN : noPetal ? NO_PETAL : FULL;

  // data-trigger="<value>" disables the CSS :hover fallback for any
  // non-hover trigger, so we don't double-fire.
  const triggerAttr = trigger !== "hover" ? { "data-trigger": trigger } : {};

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cls}
      style={mergedStyle}
      ${motionMatch ? `data-motion={(rest as Record<string, unknown>)["data-motion"] ?? "${motionMatch[1]}"}` : ""}
      {...triggerAttr}
      {...(off ? { "data-motion-off": "" } : {})}
      {...rest}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
});

export default ${pascal};
`;
  writeFileSync(join(TSX_COMPONENTS_DIR, `${pascal}.tsx`), tsx);

  manifest.push({
    name,
    pascal,
    motion: motionMatch?.[1] ?? null,
    classes: classMatch?.[1] ?? null,
    file: `svg/${file}`,
  });
}

// Barrel index — both default exports and a names map.
const indexTs = `// Auto-generated by scripts/generate.mjs — do not edit.
${manifest.map((m) => `export { default as ${m.pascal} } from "./components/${m.pascal}.js";`).join("\n")}

export const ICON_NAMES = [${manifest.map((m) => `"${m.name}"`).join(", ")}] as const;
export type IconName = (typeof ICON_NAMES)[number];
`;
writeFileSync(join(TSX_DIR, "index.ts"), indexTs);

// Sprite — one symbol per icon, addressable via <use href="#ew-NAME">.
const symbols = manifest.map((m) => {
  const raw = readFileSync(join(SVG_DIR, basename(m.file)), "utf-8");
  const inner = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
  return `  <symbol id="ew-${m.name}" viewBox="0 0 24 24">${inner}</symbol>`;
}).join("\n");
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
${symbols}
</svg>
`;
writeFileSync(join(DIST_DIR, "sprite.svg"), sprite);

// Copy styles
cpSync(join(STYLES_DIR, "icons.css"), join(DIST_DIR, "styles", "icons.css"));

// Copy vanilla trigger helper (drop-in <script> for non-React consumers).
cpSync(join(VANILLA_DIR, "ew-icons-trigger.js"), join(DIST_DIR, "vanilla", "ew-icons-trigger.js"));

// Manifest
writeFileSync(join(DIST_DIR, "manifest.json"), JSON.stringify({ count: manifest.length, icons: manifest }, null, 2));

console.log(`Wrote ${manifest.length} icons → dist/ (react, svg, sprite, manifest)`);
