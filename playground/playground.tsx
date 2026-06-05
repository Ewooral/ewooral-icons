import React, { useState, useMemo, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/icons.css";
import "../src/vanilla/ew-icons-trigger.js";
import * as engine from "../src/engines/index.js";

// ─────────────────────────────────────────────────────────────────
// Icon loading — Vite glob, raw SVG strings, hot-reload on edit.
// ─────────────────────────────────────────────────────────────────
const SVG_MODULES = import.meta.glob<string>("../src/svg/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

type IconEntry = { name: string; svg: string };

const ICONS: IconEntry[] = Object.entries(SVG_MODULES)
  .map(([path, svg]) => ({
    name: path.split("/").pop()!.replace(/\.svg$/, ""),
    svg,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ─────────────────────────────────────────────────────────────────
// Colour-var registry — keep in sync with the SVG sweep so the
// detail panel can tweak every brand colour at once.
// ─────────────────────────────────────────────────────────────────
type ColorVar = { name: string; label: string; default: string };
const COLOR_VARS: ColorVar[] = [
  { name: "--ew-glyph",        label: "Glyph (primary)",     default: "#1a3a2a" },
  { name: "--ew-outline",      label: "Outline",             default: "#0f2017" },
  { name: "--ew-secondary",    label: "Secondary (sage)",    default: "#8fb89a" },
  { name: "--ew-highlight",    label: "Highlight (cream)",   default: "#f5f1e8" },
  { name: "--ew-glyph-2",      label: "Glyph 2 (dark)",      default: "#142a1e" },
  { name: "--ew-spark-light",  label: "Spark light",         default: "#fff3cf" },
  { name: "--ew-rose",         label: "Rose",                default: "#e8a3a3" },
  { name: "--ew-accent-deep",  label: "Accent deep (gold)",  default: "#d99500" },
  { name: "--ew-accent",       label: "Accent (gold)",       default: "#f5b820" },
  { name: "--ew-signature",    label: "Signature mark",      default: "#f5b820" },
  { name: "--ew-bg",           label: "Disc bg",             default: "#f5f1e8" },
];

// ─────────────────────────────────────────────────────────────────
// PALETTES — preset overrides for the brand colour vars. Each picks
// new glyph / accent / secondary / highlight / signature values so
// the medallion reads correctly across all three playground themes
// (default forest, light, dark). Add new entries to the array; the
// chip row in the side panel grows automatically.
// ─────────────────────────────────────────────────────────────────
type Palette = {
  name: string;
  swatches: [string, string, string]; // 3-wedge preview chip
  colors: Record<string, string>;     // CSS var → hex
};
const PALETTES: Palette[] = [
  {
    name: "Forest (default)",
    swatches: ["#1a3a2a", "#8fb89a", "#f5b820"],
    colors: {
      "--ew-glyph": "#1a3a2a", "--ew-outline": "#0f2017",
      "--ew-secondary": "#8fb89a", "--ew-highlight": "#f5f1e8",
      "--ew-glyph-2": "#142a1e", "--ew-spark-light": "#fff3cf",
      "--ew-accent": "#f5b820", "--ew-accent-deep": "#d99500",
      "--ew-signature": "#f5b820", "--ew-rose": "#e8a3a3",
      "--ew-bg": "#f5f1e8",
    },
  },
  {
    name: "Sunset",
    swatches: ["#3a1a2a", "#f5b820", "#ff6f61"],
    colors: {
      "--ew-glyph": "#3a1a2a", "--ew-outline": "#1a0a14",
      "--ew-secondary": "#f5b820", "--ew-highlight": "#fff3e0",
      "--ew-glyph-2": "#2a0f1f", "--ew-spark-light": "#fff5d6",
      "--ew-accent": "#ff6f61", "--ew-accent-deep": "#d9583f",
      "--ew-signature": "#ff6f61", "--ew-rose": "#ff9a8a",
      "--ew-bg": "#fff3e0",
    },
  },
  {
    name: "Ocean",
    swatches: ["#0c2540", "#5db8c8", "#f5b820"],
    colors: {
      "--ew-glyph": "#0c2540", "--ew-outline": "#06182b",
      "--ew-secondary": "#5db8c8", "--ew-highlight": "#e8f3f5",
      "--ew-glyph-2": "#091a30", "--ew-spark-light": "#d6f0f5",
      "--ew-accent": "#f5b820", "--ew-accent-deep": "#c08e10",
      "--ew-signature": "#f5b820", "--ew-rose": "#9bd0d8",
      "--ew-bg": "#e8f3f5",
    },
  },
  {
    name: "Royal",
    swatches: ["#2d1b4e", "#a78bfa", "#f5b820"],
    colors: {
      "--ew-glyph": "#2d1b4e", "--ew-outline": "#1a0f2e",
      "--ew-secondary": "#a78bfa", "--ew-highlight": "#f3eeff",
      "--ew-glyph-2": "#22143b", "--ew-spark-light": "#ece0ff",
      "--ew-accent": "#f5b820", "--ew-accent-deep": "#c08e10",
      "--ew-signature": "#f5b820", "--ew-rose": "#c4a8ff",
      "--ew-bg": "#f3eeff",
    },
  },
  {
    name: "Slate",
    swatches: ["#1f2937", "#94a3b8", "#f5b820"],
    colors: {
      "--ew-glyph": "#1f2937", "--ew-outline": "#0f172a",
      "--ew-secondary": "#94a3b8", "--ew-highlight": "#f1f5f9",
      "--ew-glyph-2": "#1a2230", "--ew-spark-light": "#e2e8f0",
      "--ew-accent": "#f5b820", "--ew-accent-deep": "#c08e10",
      "--ew-signature": "#f5b820", "--ew-rose": "#cbd5e1",
      "--ew-bg": "#f1f5f9",
    },
  },
  {
    name: "Plum",
    swatches: ["#4a1f3d", "#e879c0", "#f5b820"],
    colors: {
      "--ew-glyph": "#4a1f3d", "--ew-outline": "#2a0f23",
      "--ew-secondary": "#e879c0", "--ew-highlight": "#fdf0f8",
      "--ew-glyph-2": "#3a182f", "--ew-spark-light": "#ffd9ee",
      "--ew-accent": "#f5b820", "--ew-accent-deep": "#c08e10",
      "--ew-signature": "#f5b820", "--ew-rose": "#f5a8d4",
      "--ew-bg": "#fdf0f8",
    },
  },
  {
    name: "Sand",
    swatches: ["#5c4a2e", "#c8a878", "#e58f2c"],
    colors: {
      "--ew-glyph": "#5c4a2e", "--ew-outline": "#3a2f1e",
      "--ew-secondary": "#c8a878", "--ew-highlight": "#fbf3e1",
      "--ew-glyph-2": "#4a3a23", "--ew-spark-light": "#fff0d4",
      "--ew-accent": "#e58f2c", "--ew-accent-deep": "#b96918",
      "--ew-signature": "#e58f2c", "--ew-rose": "#d4b896",
      "--ew-bg": "#fbf3e1",
    },
  },
  {
    name: "Coral",
    swatches: ["#3a1414", "#ff9c8a", "#ffb84d"],
    colors: {
      "--ew-glyph": "#3a1414", "--ew-outline": "#1f0a0a",
      "--ew-secondary": "#ff9c8a", "--ew-highlight": "#fff0ed",
      "--ew-glyph-2": "#2c0e0e", "--ew-spark-light": "#ffe0d3",
      "--ew-accent": "#ffb84d", "--ew-accent-deep": "#d18f24",
      "--ew-signature": "#ffb84d", "--ew-rose": "#ffc4b3",
      "--ew-bg": "#fff0ed",
    },
  },
  {
    name: "Mono",
    swatches: ["#1a1a1a", "#737373", "#bfbfbf"],
    colors: {
      "--ew-glyph": "#1a1a1a", "--ew-outline": "#000000",
      "--ew-secondary": "#737373", "--ew-highlight": "#f5f5f5",
      "--ew-glyph-2": "#262626", "--ew-spark-light": "#fafafa",
      "--ew-accent": "#bfbfbf", "--ew-accent-deep": "#8a8a8a",
      "--ew-signature": "#404040", "--ew-rose": "#a3a3a3",
      "--ew-bg": "#f5f5f5",
    },
  },
  {
    name: "Aurora",
    swatches: ["#0d2a3f", "#4ade80", "#22d3ee"],
    colors: {
      "--ew-glyph": "#0d2a3f", "--ew-outline": "#061726",
      "--ew-secondary": "#4ade80", "--ew-highlight": "#ecfdf5",
      "--ew-glyph-2": "#0a2030", "--ew-spark-light": "#d4f7e5",
      "--ew-accent": "#22d3ee", "--ew-accent-deep": "#0e9aab",
      "--ew-signature": "#22d3ee", "--ew-rose": "#86efac",
      "--ew-bg": "#ecfdf5",
    },
  },
];

const MOTIONS = [
  "pop", "tilt", "spin", "swing", "shake", "rise", "slide",
  "pulse", "flip", "check", "blink", "tick", "lid-open",
];

/* ─────────────────────────────────────────────────────────────────
 *  SIGNATURE MARKS — swappable Akan-rooted brand signature at the
 *  top-right of the medallion. Lives in `<g class="ew-signature">`,
 *  OUTSIDE the chrome group, so stripping chrome leaves it intact.
 *  Colour: `var(--ew-signature, #f5b820)` — independent from the
 *  accent gold, so we can tint it per theme.
 *
 *  Default in every SVG is `nkonsonkonson` (interlocked chain links).
 *  The signature swap below replaces the inner contents of
 *  <g class="ew-signature">…</g>.
 * ───────────────────────────────────────────────────────────────── */
const SIGNATURE_INNER: Record<string, string> = {
  // Adinkrahene — three concentric circles. "Chief of Adinkra symbols."
  adinkrahene: `<circle cx="19.4" cy="5.4" r="2.4" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55"/><circle cx="19.4" cy="5.4" r="1.5" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55"/><circle cx="19.4" cy="5.4" r="0.6" fill="var(--ew-signature,#f5b820)"/>`,
  // Sankofa — stylised heart with a return-spiral. "Go back, retrieve."
  sankofa: `<path fill="var(--ew-signature,#f5b820)" d="M19.4 4 C 18.4 4 18 4.6 18 5.3 C 18 6.4 19.4 7.4 19.4 7.4 C 19.4 7.4 20.8 6.4 20.8 5.3 C 20.8 4.6 20.4 4 19.4 4 Z"/><path fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.5" stroke-linecap="round" d="M21.0 6.5 C 22 7 22 8 21.2 8.1"/>`,
  // Nkonsonkonson (DEFAULT) — two interlocked chain links. "Linked together."
  nkonsonkonson: `<ellipse cx="18.8" cy="5.0" rx="0.75" ry="1.35" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55" transform="rotate(-25 18.8 5.0)"/><ellipse cx="20.3" cy="6.4" rx="0.75" ry="1.35" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55" transform="rotate(25 20.3 6.4)"/>`,
  // Original gold petal — legacy, kept as an option for backwards-compat.
  // pathLength="100" + dasharray/offset wire the draw-stroke animation
  // (`ew-petal-draw` keyframe). Stroke is the highlight cream so the
  // outline reads clearly against the gold fill regardless of palette.
  petal: `<path class="ew-spark ew-petal-draw" fill="var(--ew-signature,#f5b820)" stroke="var(--ew-highlight,#f5f1e8)" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" d="M18.5 3.4 C 20.4 3.4 21.6 4.8 21.4 6.6 C 21.2 7.4 20.4 7.7 19.4 7.5 C 18.4 7.2 17.6 6.4 17.6 5.4 C 17.6 4.4 18 3.8 18.5 3.4 Z"/>`,
};

const ENGINES = ["css", "gsap", "motion"];

/* ─────────────────────────────────────────────────────────────────
 *  ARCHETYPE MAP
 *  Each icon (or icon family) gets a "what does this thing do in
 *  real life" motion. The detail panel applies these on selection
 *  so the playground shows each icon in its characteristic motion
 *  without forcing the user to dial in engine + motion + flags by
 *  hand.
 *
 *  Add entries here as we author archetypes. Icons without an
 *  entry fall back to whatever data-motion is baked into their SVG.
 * ───────────────────────────────────────────────────────────────── */
type Archetype = {
  motion: string;
  engine?: string;       // default "css"
  ember?: boolean;       // toggle the GSAP fire emitter
  repeat?: string;       // GSAP timeline repeat (-1 = ∞, 0 = once)
  repeatDelay?: string;  // seconds between iterations
  speed?: string;        // CSS duration / GSAP speed
};

const ICON_ARCHETYPES: Record<string, Archetype> = {
  // Characteristic blink: MorphSVG lid morph + ember emit, loop while hovered.
  eye:       { motion: "blink", engine: "gsap", ember: true,  repeat: "-1", repeatDelay: "1.6" },
  "eye-off": { motion: "blink", engine: "gsap", ember: false, repeat: "-1", repeatDelay: "2.2" },
  // Second-hand sweep — rotates the minute path 360° in discrete 60 steps
  // (one per "second"), loops while hovered.
  clock:     { motion: "tick",  engine: "gsap", repeat: "-1", repeatDelay: "0" },
  // Lid lifts + tilts to "peek inside", then drops shut. Same motion will
  // be applied to folder, gift, briefcase, inbox as they get tagged.
  archive:   { motion: "lid-open", engine: "gsap" },
  folder:    { motion: "lid-open", engine: "gsap" },
  gift:      { motion: "lid-open", engine: "gsap" },
  // Continuous loader: GSAP spin loops linearly + ember petals lick upward
  // from the signature like a kettle just about to boil.
  loader:    { motion: "spin", engine: "gsap", ember: true, repeat: "-1", repeatDelay: "0", speed: "1.1s" },

  // ─── Fintech kit ─────────────────────────────────────────────────
  // Each icon picks the motion that reads as its real-world action.
  // We compose from existing motions (pop, swing, tilt, shake, rise,
  // pulse, spin, flip, check, lid-open, tick) plus ember on the
  // payment-success-y icons so they feel celebratory.

  // Money / wallet
  dollar:        { motion: "pop",   engine: "gsap", ember: true },           // coin lands, sparkles
  coins:         { motion: "swing", engine: "css" },                          // stack clink
  wallet:        { motion: "lid-open", engine: "gsap" },                      // flap opens
  card:          { motion: "flip",  engine: "css" },                          // card flips
  receipt:       { motion: "rise",  engine: "css" },                          // print roll
  coupon:        { motion: "tilt",  engine: "css" },                          // coupon flap

  // Money flow / transactions
  send:          { motion: "tilt",  engine: "css" },                          // paper plane
  download:      { motion: "rise",  engine: "css" },                          // settle in
  upload:        { motion: "rise",  engine: "css" },                          // lift off
  refresh:       { motion: "spin",  engine: "gsap", repeat: "-1", repeatDelay: "0", speed: "1.1s" },
  "refresh-cw":  { motion: "spin",  engine: "gsap", repeat: "-1", repeatDelay: "0", speed: "1.1s" },
  sync:          { motion: "spin",  engine: "gsap", repeat: "-1", repeatDelay: "0", speed: "1.1s" },

  // Charts / analytics
  chart:         { motion: "rise",  engine: "css" },                          // bars grow
  "pie-chart":   { motion: "spin",  engine: "css" },                          // wedge sweep
  "trending-up": { motion: "rise",  engine: "css" },
  "trending-down": { motion: "rise", engine: "css" },                         // path renders the dip
  dashboard:     { motion: "pop",   engine: "css" },

  // Security
  lock:          { motion: "tilt",  engine: "css" },                          // shackle nudge
  unlock:        { motion: "tilt",  engine: "css" },
  key:           { motion: "tilt",  engine: "css" },                          // turn
  shield:        { motion: "pulse", engine: "css" },
  "shield-check": { motion: "pulse", engine: "css" },
  fingerprint:   { motion: "pulse", engine: "css" },                          // scan beat
  verified:      { motion: "check", engine: "css" },                          // checkmark draw

  // Status / confirmation
  check:         { motion: "check", engine: "css" },
  "check-circle":{ motion: "check", engine: "css" },
  "check-check": { motion: "check", engine: "css" },
  close:         { motion: "shake", engine: "css" },                          // rejection wobble
  "x-circle":    { motion: "shake", engine: "css" },
  "info-circle": { motion: "pulse", engine: "css" },
  "help-circle": { motion: "tilt",  engine: "css" },
  alert:         { motion: "shake", engine: "css" },                          // (already authored)
  "alert-circle":{ motion: "shake", engine: "css" },

  // People
  group:         { motion: "pop",   engine: "css" },                          // team greeting

  // Notifications
  bell:          { motion: "swing", engine: "css" },                          // (already authored)
  "bell-off":    { motion: "tilt",  engine: "css" },
  notification:  { motion: "pulse", engine: "css" },

  // Time / scheduling
  timer:         { motion: "tick",  engine: "gsap", repeat: "-1", repeatDelay: "0" },
  alarm:         { motion: "swing", engine: "css" },                          // bell-style ring
  hourglass:     { motion: "flip",  engine: "css" },                          // sand pours
  history:       { motion: "spin",  engine: "gsap", repeat: "1" },            // clockwise sweep

  // Future entries (each will get its own implementation pass):
  // scissors:  { motion: "cut",   engine: "gsap" },
  // bell:      { motion: "ring",  engine: "gsap" },
  // heart:     { motion: "beat",  engine: "gsap", repeat: "-1", repeatDelay: "0.4" },
  // lock:      { motion: "unlock",engine: "gsap" },
  // flame:     { motion: "flame-flicker", engine: "gsap", ember: true, repeat: "-1" },
};

type Theme = "dark" | "light" | "green";

// ─────────────────────────────────────────────────────────────────
//                              APP
// ─────────────────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [query, setQuery] = useState("");
  // Sheet closed by default; opens on first icon click.
  const [selected, setSelected] = useState<IconEntry | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Esc closes the sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^ew-/, "");
    if (!q) return ICONS;
    return ICONS.filter((i) => i.name.includes(q));
  }, [query]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        // Sheet is conditional — when no icon selected, the grid takes
        // the full width; when an icon is picked, a 560-px detail sheet
        // slides in to its right (wide enough that the longest snippet
        // lines don't need horizontal scrolling).
        gridTemplateColumns: selected
          ? "minmax(0, 1fr) 560px"
          : "minmax(0, 1fr)",
        gap: 0,
      }}
    >
      {/* ────────── LEFT: header + browse grid (no animation) ────────── */}
      <div style={{ minWidth: 0, borderRight: "1px solid var(--line)" }}>
        <header
          style={{
            padding: "28px 32px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                fontFamily: "Bricolage Grotesque, system-ui",
              }}
            >
              @ewooral/icons
            </h1>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-faint)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {ICONS.length} icons · click any to test
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="Search icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: "1 1 220px",
                minWidth: 220,
                maxWidth: 360,
                background: "var(--bg-2)",
                color: "var(--ink)",
                border: "1px solid var(--line)",
                padding: "9px 14px",
                borderRadius: 4,
                outline: "none",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
            <ThemeButton current={theme} value="dark" onClick={setTheme} label="Dark" />
            <ThemeButton current={theme} value="light" onClick={setTheme} label="Light" />
            <ThemeButton current={theme} value="green" onClick={setTheme} label="Company" />
          </div>
        </header>

        <section style={{ padding: 22 }}>
          {filtered.length === 0 ? (
            <p style={{ color: "var(--ink-faint)", padding: 40, textAlign: "center" }}>
              No icons match “{query}”.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: 10,
              }}
            >
              {filtered.map((icon) => (
                <BrowseCard
                  key={icon.name}
                  icon={icon}
                  selected={selected?.name === icon.name}
                  onSelect={() => setSelected(icon)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ────────── RIGHT: detail panel (only renders when an icon is selected) ────────── */}
      {selected && <DetailPanel icon={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────
// BROWSE CARD — static thumbnail, no animation. Click to select.
// Renders the SVG with data-motion-off so it doesn't translate.
// ─────────────────────────────────────────────────────────────────
function BrowseCard({
  icon,
  selected,
  onSelect,
}: {
  icon: IconEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const cleaned = useMemo(() => {
    // Force size + suppress motion so the grid never animates → no
    // top-left glitch from CSS transform / SVG-attr conflicts.
    return icon.svg
      .replace(/<svg([^>]*?)>/, `<svg$1 width="56" height="56" data-motion-off="">`)
      .replace(/data-motion="[^"]*"/, 'data-motion="off"');
  }, [icon.svg]);

  return (
    <button
      type="button"
      onClick={onSelect}
      title={icon.name}
      style={{
        background: selected ? "var(--bg-2)" : "transparent",
        border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
        borderRadius: 6,
        padding: "16px 8px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        color: "var(--ink)",
        transition: "border-color 120ms, background 120ms",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "var(--ink-faint)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 56 }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.04em",
          color: selected ? "var(--accent)" : "var(--ink-dim)",
          fontFamily: "JetBrains Mono, monospace",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {icon.name}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// DETAIL PANEL — fully featured tester for the selected icon.
// ─────────────────────────────────────────────────────────────────
function DetailPanel({ icon, onClose }: { icon: IconEntry | null; onClose: () => void }) {
  // Per-instance prop state. Reset on icon swap so previous tweaks
  // don't bleed into the new one.
  const [size, setSize] = useState(120);
  const [plain, setPlain] = useState(false);
  const [noPetal, setNoPetal] = useState(false);
  const [ember, setEmber] = useState(false);
  const [motion, setMotion] = useState("pop");
  const [engineName, setEngineName] = useState("css");
  const [trigger, setTrigger] = useState("hover");
  const [repeat, setRepeat] = useState("1");
  const [repeatDelay, setRepeatDelay] = useState("1.6");
  const [speed, setSpeed] = useState("4.7s");
  const [delay, setDelay] = useState("0s");
  const [colors, setColors] = useState<Record<string, string>>({});
  // Signature mark at the medallion's top-right. Default = Nkonsonkonson
  // (matches what every SVG now ships with). Swappable per icon.
  const [spark, setSpark] = useState<"petal" | "adinkrahene" | "sankofa" | "nkonsonkonson">("nkonsonkonson");
  // Panel tab — "settings" exposes all props; "usage" shows code snippets
  // for vanilla / React / React Native / Flutter / Vue.
  const [tab, setTab] = useState<"settings" | "usage">("settings");
  // Settings tab also exposes a "Copy snippet" block — same live props,
  // minimal output (no commentary), framework picked via dropdown.
  const [copyFramework, setCopyFramework] = useState<string>("react");

  // Reset state when the icon changes. If the icon has an archetype
  // entry, apply its motion/engine/ember/repeat/etc. — otherwise fall
  // back to the SVG's own baked-in data-motion.
  useEffect(() => {
    if (!icon) return;
    const archetype = ICON_ARCHETYPES[icon.name];
    if (archetype) {
      setMotion(archetype.motion);
      setEngineName(archetype.engine ?? "css");
      setEmber(archetype.ember ?? false);
      setRepeat(archetype.repeat ?? "1");
      setRepeatDelay(archetype.repeatDelay ?? "1.6");
      if (archetype.speed) setSpeed(archetype.speed);
    } else {
      setMotion(extractDefaultMotion(icon.svg) ?? "pop");
      setEngineName("css");
      setEmber(false);
      setRepeat("1");
    }
    setColors({});
  }, [icon?.name]);

  const hostRef = useRef<HTMLDivElement | null>(null);

  // Mount the icon SVG into the preview host. We dangerouslySetInnerHTML
  // through React, then mutate attributes after to wire the engine.
  const previewSvg = useMemo(() => {
    if (!icon) return "";
    let svg = icon.svg;
    // Force size on the outer <svg>
    svg = svg.replace(
      /<svg([^>]*?)>/,
      `<svg$1 width="${size}" height="${size}">`,
    );
    if (plain) svg = stripChrome(svg);
    if (noPetal) {
      // Drop the entire <g class="ew-signature"> block.
      svg = svg.replace(/<g class="ew-signature"[\s\S]*?<\/g>/g, "");
    } else if (spark !== "nkonsonkonson") {
      // Swap the inner of <g class="ew-signature"> with the chosen variant.
      svg = svg.replace(
        /(<g class="ew-signature"[^>]*>)[\s\S]*?(<\/g>)/,
        `$1${SIGNATURE_INNER[spark]}$2`,
      );
    }
    return svg;
  }, [icon?.svg, size, plain, noPetal, spark]);

  // After SVG mounts, set data-engine / data-motion / data-trigger /
  // data-repeat / data-repeat-delay / data-ember and wire the trigger.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const el = host.querySelector<SVGElement>(".ew-icon");
    if (!el) return;

    el.setAttribute("data-engine", engineName);
    el.setAttribute("data-motion", motion);
    el.setAttribute("data-trigger", trigger);
    el.setAttribute("data-repeat", repeat);
    el.setAttribute("data-repeat-delay", repeatDelay);
    if (ember) el.setAttribute("data-ember", "true");
    else el.removeAttribute("data-ember");

    // Iter / speed / delay are CSS-variable driven (works for css engine
    // and is harmless for gsap/motion which read their own props).
    const iter = repeat === "-1" ? "infinite" : repeat;
    (el as HTMLElement).style.setProperty("--ew-iter", iter);
    (el as HTMLElement).style.setProperty("--ew-dur", speed);
    (el as HTMLElement).style.setProperty("--ew-delay", delay);

    // Apply colour vars
    for (const v of COLOR_VARS) {
      const val = colors[v.name];
      if (val) (el as HTMLElement).style.setProperty(v.name, val);
      else (el as HTMLElement).style.removeProperty(v.name);
    }

    if (trigger === "hover") {
      const onEnter = () => engine.play(el);
      const onLeave = () => engine.stop(el);
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        engine.stop(el);
      };
    }
  }, [previewSvg, engineName, motion, trigger, repeat, repeatDelay, ember, speed, delay, colors]);

  if (!icon) {
    return (
      <aside
        style={{
          padding: 40,
          color: "var(--ink-faint)",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
        }}
      >
        Click any icon to start.
      </aside>
    );
  }

  return (
    <aside
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100vh",
        overflowY: "auto",
        background: "var(--bg-2)",
        borderLeft: "1px solid var(--line)",
        padding: "22px 22px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {/* Sticky head — keeps the preview + Play/Stop pinned at the top of
          the panel while the user scrolls down into Theme colour vars, so
          colour changes apply visibly in real time. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--bg-2)",
          paddingTop: 22,           // mirror parent's 22 — keeps bg fully covering
          paddingBottom: 18,
          marginTop: -22,           // cancel parent's 22px top padding
          marginLeft: -22,
          marginRight: -22,
          paddingLeft: 22,
          paddingRight: 22,
          borderBottom: "1px solid var(--line)",
          // Subtle drop-shadow so section titles scrolling underneath
          // fade out instead of looking half-clipped by the border line.
          boxShadow: "0 6px 10px -6px rgba(0,0,0,0.45)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 22,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: 4,
            }}
          >
            Selected
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily: "Bricolage Grotesque, system-ui",
              fontWeight: 600,
            }}
          >
            ew-{icon.name}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close"
          style={{
            background: "transparent",
            border: "1px solid var(--line)",
            color: "var(--ink-dim)",
            borderRadius: 4,
            width: 32,
            height: 32,
            cursor: "pointer",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 14,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          ✕
        </button>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {(["settings", "usage"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: "transparent",
                color: active ? "var(--accent)" : "var(--ink-dim)",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                padding: "8px 12px",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Big preview stage */}
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <div
          ref={hostRef}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => {
            const el = hostRef.current?.querySelector<SVGElement>(".ew-icon");
            if (el) engine.play(el);
          }}
          style={btnPrimary}
        >
          ▶ Play
        </button>
        <button
          type="button"
          onClick={() => {
            const el = hostRef.current?.querySelector<SVGElement>(".ew-icon");
            if (el) engine.stop(el);
          }}
          style={btnGhost}
        >
          ■ Stop
        </button>
      </div>
      </div> {/* end sticky head */}

      {/* ───── Tab body ───── */}
      {tab === "usage" ? (
        <UsageTab
          icon={icon}
          motion={motion}
          engineName={engineName}
          size={size}
          ember={ember}
          plain={plain}
          noPetal={noPetal}
          spark={spark}
        />
      ) : (
      <>
      <Section title="Engine & motion">
        <Select label="Engine" value={engineName} onChange={setEngineName}
          options={ENGINES.map((e) => [e, e]) as [string,string][]} />
        <Select label="Motion" value={motion} onChange={setMotion}
          options={MOTIONS.map((m) => [m, m]) as [string,string][]} />
        <Select label="Trigger" value={trigger} onChange={setTrigger}
          options={[
            ["hover","hover"],["click","click"],["focus","focus"],
            ["mount","mount"],["viewport","viewport"],["manual","manual"],
          ]} />
      </Section>

      <Section title="Timing">
        <Range label={`Size ${size}`} min={16} max={240} value={size} onChange={setSize} />
        <Text label="Speed" value={speed} onChange={setSpeed} placeholder="4.7s" />
        <Text label="Delay" value={delay} onChange={setDelay} placeholder="0s" />
        <Text label="Repeat (-1 = ∞)" value={repeat} onChange={setRepeat} placeholder="1" />
        <Text label="Repeat delay" value={repeatDelay} onChange={setRepeatDelay} placeholder="1.6" />
      </Section>

      <Section title="Chrome">
        <Toggle label="plain (strip chrome)" value={plain} onChange={setPlain} />
        <Toggle label="noPetal (drop gold ribbon)" value={noPetal} onChange={setNoPetal} />
        <Toggle label="ember emitter (data-ember)" value={ember} onChange={setEmber} />
        <Select
          label="Signature"
          value={spark}
          onChange={(v) => setSpark(v as typeof spark)}
          options={[
            ["nkonsonkonson", "Nkonsonkonson (default, links)"],
            ["adinkrahene",   "Adinkrahene (3 circles)"],
            ["sankofa",       "Sankofa (heart + spiral)"],
            ["petal",         "Petal (legacy)"],
          ]}
        />
      </Section>

      <Section title="Palette">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              title={p.name}
              onClick={() => setColors(p.colors)}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                padding: 0,
                cursor: "pointer",
                border: "1px solid var(--line)",
                // Three-wedge conic shows glyph / secondary / accent at a glance.
                background: `conic-gradient(${p.swatches[0]} 0 33.33%, ${p.swatches[1]} 33.33% 66.66%, ${p.swatches[2]} 66.66% 100%)`,
                outline: "none",
                transition: "transform 120ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--ink-faint)",
            fontFamily: "JetBrains Mono, monospace",
            marginTop: 6,
            letterSpacing: "0.04em",
          }}
        >
          Hover for name · click to apply
        </div>
      </Section>

      <Section title="Theme colour vars">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 12px",
          }}
        >
          {COLOR_VARS.map((v) => (
            <ColorRow
              key={v.name}
              variable={v}
              value={colors[v.name] ?? v.default}
              onChange={(val) => setColors((c) => ({ ...c, [v.name]: val }))}
              onReset={() => setColors((c) => {
                const next = { ...c };
                delete next[v.name];
                return next;
              })}
              overridden={colors[v.name] !== undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setColors({})}
          style={{ ...btnGhost, marginTop: 8, fontSize: 10 }}
        >
          Reset all colours
        </button>
      </Section>

      <Section title="Copy snippet">
        <Select
          label="Framework"
          value={copyFramework}
          onChange={setCopyFramework}
          options={[
            ["react",        "React"],
            ["react-native", "React Native"],
            ["flutter",      "Flutter"],
            ["vue",          "Vue 3"],
            ["svelte",       "Svelte"],
            ["angular",      "Angular"],
            ["html-svg",     "Inline SVG"],
            ["html-img",     "<img> tag"],
          ]}
        />
        {(() => {
          const snippets = buildLiveSnippets({
            icon, motion, engineName, size, ember, plain, noPetal,
            spark, speed, delay, trigger, repeat, repeatDelay, colors,
          });
          const labels: Record<string, string> = {
            "react":        "React",
            "react-native": "React Native",
            "flutter":      "Flutter",
            "vue":          "Vue 3",
            "svelte":       "Svelte",
            "angular":      "Angular",
            "html-svg":     "Inline SVG",
            "html-img":     "<img> tag",
          };
          return (
            <div style={{ marginTop: 4 }}>
              <UsageBlock
                title={labels[copyFramework] ?? "Snippet"}
                code={snippets[copyFramework as keyof typeof snippets]}
              />
            </div>
          );
        })()}
      </Section>
      </>
      )}
    </aside>
  );
}

// Pull data-motion="X" out of the raw SVG (icons author their own default)
function extractDefaultMotion(svg: string): string | null {
  const m = svg.match(/data-motion="([^"]+)"/);
  return m ? m[1] : null;
}

// Strip <g class="ew-chrome">…</g> respecting nested <g>
function stripChrome(svg: string): string {
  const open = svg.indexOf('<g class="ew-chrome">');
  if (open === -1) return svg;
  let depth = 0;
  let i = open;
  while (i < svg.length) {
    if (svg.startsWith("<g", i)) { depth++; i = svg.indexOf(">", i) + 1; continue; }
    if (svg.startsWith("</g>", i)) {
      depth--;
      if (depth === 0) return svg.slice(0, open) + svg.slice(i + 4);
      i += 4; continue;
    }
    i++;
  }
  return svg;
}

// ─────────────────────────────────────────────────────────────────
// Small controls
// ─────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--ink-faint)",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: 8,
          paddingTop: "1rem",
          paddingBottom: 6,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v:string)=>void;
  options: Array<[string,string]>;
}) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      >
        {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Text({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v:string)=>void; placeholder?: string;
}) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function Range({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (n:number)=>void;
}) {
  return (
    <div style={{ ...rowStyle, alignItems: "center" }}>
      <span style={labelStyle}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 140 }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (b:boolean)=>void;
}) {
  return (
    <label style={{ ...rowStyle, cursor: "pointer", alignItems: "center" }}>
      <span style={labelStyle}>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function ColorRow({
  variable,
  value,
  onChange,
  onReset,
  overridden,
}: {
  variable: ColorVar;
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  overridden: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ ...labelStyle, fontSize: 9, lineHeight: 1.2 }}>{variable.label}</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 26, padding: 0, border: "1px solid var(--line)", background: "transparent" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, fontSize: 10, padding: "5px 6px", flex: 1 }}
        />
        {overridden && (
          <button type="button" onClick={onReset} title="Reset" style={{ ...btnGhost, padding: "4px 6px" }}>
            ↺
          </button>
        )}
      </div>
    </div>
  );
}

function ThemeButton({ current, value, onClick, label }: {
  current: Theme; value: Theme; onClick: (v:Theme)=>void; label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      style={{
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--bg)" : "var(--ink-dim)",
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        padding: "8px 14px",
        borderRadius: 4,
        fontSize: 11,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        cursor: "pointer",
        fontFamily: "JetBrains Mono, monospace",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
};
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--ink-dim)",
  fontFamily: "JetBrains Mono, monospace",
  letterSpacing: "0.04em",
  flex: "0 0 auto",
};
const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  padding: "6px 10px",
  borderRadius: 3,
  fontSize: 12,
  fontFamily: "JetBrains Mono, monospace",
  flex: "1 1 auto",
  minWidth: 0,
};
const btnPrimary: React.CSSProperties = {
  background: "var(--accent)",
  color: "var(--bg)",
  border: "1px solid var(--accent)",
  padding: "8px 14px",
  borderRadius: 4,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "JetBrains Mono, monospace",
  fontWeight: 600,
};
const btnGhost: React.CSSProperties = {
  background: "transparent",
  color: "var(--ink-dim)",
  border: "1px solid var(--line)",
  padding: "8px 14px",
  borderRadius: 4,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "JetBrains Mono, monospace",
  fontWeight: 600,
};

// ─────────────────────────────────────────────────────────────────
//                          USAGE TAB
// Code snippets for every supported consumer. Reflects the currently
// selected icon + motion + engine + signature etc., so you can copy
// straight into your app.
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// LIVE SNIPPET BUILDER — emits minimal, copy-paste-ready code for
// each framework. Every prop the user has touched in the Settings
// tab flows through (size, motion, engine, speed, delay, trigger,
// repeat, repeatDelay, ember, plain, noPetal, signature, and any
// overridden colour vars). Defaults stay implicit so the snippet
// reads cleanly — only the things that differ from defaults show.
// ─────────────────────────────────────────────────────────────────
function buildLiveSnippets(p: {
  icon: IconEntry;
  motion: string;
  engineName: string;
  size: number;
  ember: boolean;
  plain: boolean;
  noPetal: boolean;
  spark: string;
  speed: string;
  delay: string;
  trigger: string;
  repeat: string;
  repeatDelay: string;
  colors: Record<string, string>;
}): {
  react: string; "react-native": string; flutter: string;
  vue: string; svelte: string; angular: string;
  "html-svg": string; "html-img": string;
} {
  const {
    icon, motion, engineName, size, ember, plain, noPetal, spark,
    speed, delay, trigger, repeat, repeatDelay, colors,
  } = p;

  const pascal = "EW" + icon.name
    .split("-")
    .map((s) => (s[0]?.toUpperCase() ?? "") + s.slice(1))
    .join("");

  const timeToMs = (s: string): number => {
    const t = s.trim();
    if (t.endsWith("ms")) return Number(t.slice(0, -2)) || 0;
    if (t.endsWith("s"))  return Math.round((Number(t.slice(0, -1)) || 0) * 1000);
    return Number(t) || 0;
  };
  const speedMs = timeToMs(speed);
  const delayMs = timeToMs(delay);
  const repeatN = Number(repeat) || 0;
  const repeatDelayMs = timeToMs(repeatDelay.endsWith("s") || repeatDelay.endsWith("ms") ? repeatDelay : `${repeatDelay}s`);

  // Only emit overrides — keeps the snippet noise-free.
  const overriddenColors = Object.entries(colors);
  const hasColorOverrides = overriddenColors.length > 0;

  // CSS vars that have a dedicated React prop in the wrapper — emit
  // these as props instead of style overrides for the cleanest output.
  // Keep the rest (rose, spark-light, glyph-2, signature) as CSS-var
  // style entries since they have no shorthand prop.
  const PROP_VARS: Record<string, string> = {
    "--ew-glyph":     "color",
    "--ew-accent":    "accent",
    "--ew-bg":        "bg",
    "--ew-highlight": "highlight",
    "--ew-secondary": "secondary",
    "--ew-outline":   "outline",
  };
  const propColorEntries = overriddenColors.filter(([k]) => PROP_VARS[k]);
  const styleColorEntries = overriddenColors.filter(([k]) => !PROP_VARS[k]);

  // ───── React ─────
  const reactProps = [
    `      size={${size}}`,
    `      motion="${motion}"`,
    `      engine="${engineName}"`,
    `      trigger="${trigger}"`,
    `      speed="${speed}"`,
    `      delay="${delay}"`,
    `      data-repeat="${repeat}"`,
    `      data-repeat-delay="${repeatDelay}"`,
    `      signature="${spark}"`,
  ];
  if (plain)   reactProps.push(`      plain`);
  if (noPetal) reactProps.push(`      noPetal`);
  if (ember)   reactProps.push(`      ember`);
  for (const [k, v] of propColorEntries) {
    reactProps.push(`      ${PROP_VARS[k]}="${v}"`);
  }
  if (styleColorEntries.length) {
    const lines = styleColorEntries
      .map(([k, v]) => `        "${k}": "${v}",`)
      .join("\n");
    reactProps.push(`      style={{\n${lines}\n      }}`);
  }
  const react = `import { ${pascal} } from "@ewooral/icons";
import "@ewooral/icons/styles/icons.css";

export default function Example() {
  return (
    <${pascal}
${reactProps.join("\n")}
    />
  );
}`;

  // ───── React Native ─────
  const rnProps = [
    `      size={${size}}`,
    `      motion="${motion}"`,
    `      speed={${speedMs}}`,
    `      delay={${delayMs}}`,
    `      trigger="${trigger === "hover" ? "press" : trigger}"`,
    `      signature="${spark}"`,
  ];
  if (plain)   rnProps.push(`      plain`);
  if (noPetal) rnProps.push(`      noPetal`);
  if (ember)   rnProps.push(`      ember`);
  if (hasColorOverrides) {
    const map: Record<string, string> = {
      "--ew-glyph":"glyph","--ew-outline":"outline","--ew-secondary":"secondary",
      "--ew-highlight":"highlight","--ew-glyph-2":"glyphTwo","--ew-spark-light":"sparkLight",
      "--ew-rose":"rose","--ew-accent-deep":"accentDeep","--ew-accent":"accent",
      "--ew-signature":"signature","--ew-bg":"bg",
    };
    const lines = overriddenColors
      .map(([k, v]) => `        ${map[k] ?? k}: "${v}",`)
      .join("\n");
    rnProps.push(`      colors={{\n${lines}\n      }}`);
  }
  const reactNative = `import { ${pascal} } from "@ewooral/icons-native";

export default function Example() {
  return (
    <${pascal}
${rnProps.join("\n")}
    />
  );
}`;

  // ───── Flutter ─────
  const motionDart = motion.replace(/-/g, "_");
  const triggerDart = trigger === "hover" || trigger === "click" ? "tap"
                    : trigger === "focus" ? "tap"
                    : trigger === "viewport" ? "mount"
                    : trigger;
  const flutterLines = [
    `      name: '${icon.name}',`,
    `      size: ${size}.0,`,
    `      motion: EwMotion.${motionDart},`,
    `      speed: const Duration(milliseconds: ${speedMs}),`,
    `      delay: const Duration(milliseconds: ${delayMs}),`,
    `      trigger: EwTrigger.${triggerDart},`,
    `      repeat: ${repeatN},`,
    `      repeatDelay: const Duration(milliseconds: ${repeatDelayMs}),`,
    `      signature: EwSignature.${spark},`,
  ];
  if (plain)   flutterLines.push(`      plain: true,`);
  if (noPetal) flutterLines.push(`      noPetal: true,`);
  if (ember)   flutterLines.push(`      ember: true,`);
  if (hasColorOverrides) {
    const hexOf = (v: string) => {
      const m = v.match(/^#([0-9a-f]{6})$/i);
      return m ? `0xFF${m[1].toUpperCase()}` : `0xFF000000 /* ${v} */`;
    };
    const map: Record<string, string> = {
      "--ew-glyph":"glyph","--ew-outline":"outline","--ew-secondary":"secondary",
      "--ew-highlight":"highlight","--ew-glyph-2":"glyphTwo","--ew-spark-light":"sparkLight",
      "--ew-rose":"rose","--ew-accent-deep":"accentDeep","--ew-accent":"accent",
      "--ew-signature":"signature","--ew-bg":"bg",
    };
    const lines = overriddenColors
      .map(([k, v]) => `        ${map[k] ?? k}: const Color(${hexOf(v)}),`)
      .join("\n");
    flutterLines.push(`      palette: EwPalette(\n${lines}\n      ),`);
  }
  const flutter = `import 'package:ewooral_icons/ewooral_icons.dart';
import 'package:flutter/material.dart';

class Example extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return EwIcon(
${flutterLines.join("\n")}
    );
  }
}`;

  // ───── Vue 3 ─────
  const vueLines = [
    `    :size="${size}"`,
    `    motion="${motion}"`,
    `    engine="${engineName}"`,
    `    trigger="${trigger}"`,
    `    speed="${speed}"`,
    `    delay="${delay}"`,
    `    data-repeat="${repeat}"`,
    `    data-repeat-delay="${repeatDelay}"`,
    `    signature="${spark}"`,
  ];
  if (plain)   vueLines.push(`    plain`);
  if (noPetal) vueLines.push(`    no-petal`);
  if (ember)   vueLines.push(`    ember`);
  if (hasColorOverrides) {
    const lines = overriddenColors
      .map(([k, v]) => `      '${k}': '${v}',`)
      .join("\n");
    vueLines.push(`    :style="{\n${lines}\n    }"`);
  }
  const vue = `<script setup>
import { ${pascal} } from "@ewooral/icons/vue";
import "@ewooral/icons/styles/icons.css";
</script>

<template>
  <${pascal}
${vueLines.join("\n")}
  />
</template>`;

  // ───── Svelte ─────
  const svelteLines = [
    `    size={${size}}`,
    `    motion="${motion}"`,
    `    engine="${engineName}"`,
    `    trigger="${trigger}"`,
    `    speed="${speed}"`,
    `    delay="${delay}"`,
    `    data-repeat="${repeat}"`,
    `    data-repeat-delay="${repeatDelay}"`,
    `    signature="${spark}"`,
  ];
  if (plain)   svelteLines.push(`    plain`);
  if (noPetal) svelteLines.push(`    noPetal`);
  if (ember)   svelteLines.push(`    ember`);
  if (hasColorOverrides) {
    const lines = overriddenColors
      .map(([k, v]) => `      ${k}: '${v}';`)
      .join("\n");
    svelteLines.push(`    style="${overriddenColors.map(([k, v]) => `${k}: ${v};`).join(" ")}"`);
  }
  const svelte = `<script>
  import { ${pascal} } from "@ewooral/icons/svelte";
  import "@ewooral/icons/styles/icons.css";
</script>

<${pascal}
${svelteLines.join("\n")}
/>`;

  // ───── Angular ─────
  const angularAttrs = [
    `  [size]="${size}"`,
    `  motion="${motion}"`,
    `  engine="${engineName}"`,
    `  trigger="${trigger}"`,
    `  speed="${speed}"`,
    `  delay="${delay}"`,
    `  data-repeat="${repeat}"`,
    `  data-repeat-delay="${repeatDelay}"`,
    `  signature="${spark}"`,
  ];
  if (plain)   angularAttrs.push(`  [plain]="true"`);
  if (noPetal) angularAttrs.push(`  [noPetal]="true"`);
  if (ember)   angularAttrs.push(`  [ember]="true"`);
  if (hasColorOverrides) {
    angularAttrs.push(
      `  [style]="{${overriddenColors.map(([k, v]) => ` '${k}': '${v}'`).join(",")} }"`,
    );
  }
  // Angular component selector: kebab-case of PascalCase
  const ngSelector = "ew-" + icon.name;
  const angular = `// app.module.ts
import { EwIconsModule } from "@ewooral/icons/angular";
@NgModule({ imports: [EwIconsModule] }) export class AppModule {}

<!-- template -->
<${ngSelector}
${angularAttrs.join("\n")}
></${ngSelector}>`;

  // ───── Inline SVG — emit the live SVG with current data-attrs + CSS vars ─────
  // Pull the raw SVG and inject data attributes + a style block with overrides.
  const styleVars = hasColorOverrides
    ? `style="${overriddenColors.map(([k, v]) => `${k}: ${v};`).join(" ")}"`
    : "";
  const dataAttrs = [
    `data-engine="${engineName}"`,
    `data-motion="${motion}"`,
    `data-trigger="${trigger}"`,
    `data-repeat="${repeat}"`,
    `data-repeat-delay="${repeatDelay}"`,
    ember ? `data-ember="true"` : "",
  ].filter(Boolean).join(" ");
  let svgInline = icon.svg.replace(
    /<svg([^>]*?)>/,
    `<svg$1 width="${size}" height="${size}" ${dataAttrs} ${styleVars}>`,
  );
  // Apply the same signature swap / chrome-strip the preview uses, so the
  // copied SVG renders exactly as the user sees it.
  // (Signature swap inlined to avoid a circular import here.)
  if (plain) {
    svgInline = svgInline.replace(/<g class="ew-chrome">[\s\S]*?<\/g>/, "");
  }
  if (noPetal) {
    svgInline = svgInline.replace(/<g class="ew-signature"[\s\S]*?<\/g>/, "");
  }
  const vanillaInline = `<!-- Paste anywhere. Animation needs the stylesheet + (for GSAP motions) the engine script. -->
<link rel="stylesheet" href="https://unpkg.com/@ewooral/icons/dist/styles/icons.css" />

${svgInline}

<script type="module">
  import * as engine from "https://unpkg.com/@ewooral/icons/dist/engines/index.js";
  document.querySelectorAll(".ew-icon").forEach((el) => {
    el.addEventListener("mouseenter", () => engine.play(el));
    el.addEventListener("mouseleave", () => engine.stop(el));
  });
</script>`;

  // ───── <img> — static, no animation ─────
  const vanillaImg = `<img
  src="https://icons.ewooral.com/icons/${icon.name}.svg"
  width="${size}" height="${size}"
  alt="${icon.name}"
/>`;

  return {
    react,
    "react-native": reactNative,
    flutter,
    vue,
    svelte,
    angular,
    "html-svg": vanillaInline,
    "html-img": vanillaImg,
  };
}

function UsageTab(props: {
  icon: IconEntry;
  motion: string;
  engineName: string;
  size: number;
  ember: boolean;
  plain: boolean;
  noPetal: boolean;
  spark: string;
}) {
  const { icon, motion, engineName, size, ember, plain, noPetal, spark } = props;
  // Convert "eye-off" → "EWEyeOff"
  const pascal = "EW" + icon.name
    .split("-")
    .map((p) => (p[0]?.toUpperCase() ?? "") + p.slice(1))
    .join("");
  const motionAttr = motion !== "pop" ? ` data-motion="${motion}"` : "";
  const engineAttr = engineName !== "css" ? ` data-engine="${engineName}"` : "";
  const emberAttr = ember ? ` data-ember="true"` : "";
  const plainProp = plain ? " plain" : "";
  const noPetalProp = noPetal ? " noPetal" : "";
  const sparkProp = spark !== "nkonsonkonson" ? ` signature="${spark}"` : "";

  // Vanilla — <img> tag (no animation, simplest)
  const vanillaImg = `<!-- Static image (no animation) -->
<img
  src="https://icons.ewooral.com/icons/${icon.name}.svg"
  width="${size}" height="${size}"
  alt="${icon.name}"
/>`;

  // Vanilla — inline SVG with engine attributes (full attribute reference)
  const vanillaInline = `<!-- Required CSS: animation keyframes -->
<link rel="stylesheet" href="https://unpkg.com/@ewooral/icons/dist/styles/icons.css" />

<!-- Inline SVG — every prop is a data-attribute or CSS variable.
     Paste contents of @ewooral/icons/svg/${icon.name}.svg between the tags. -->
<svg class="ew-icon"
     viewBox="0 0 24 24"
     width="${size}" height="${size}"

     <!-- ── Animation engine + motion ─────────────────── -->
     data-engine="${engineName}"             <!-- "css" | "gsap" | "motion" -->
     data-motion="${motion}"               <!-- which keyframe / GSAP case -->
     data-trigger="hover"             <!-- hover|click|focus|mount|viewport|manual -->

     <!-- ── Playback flags ────────────────────────────── -->${ember ? `
     data-ember="true"               <!-- emit fire particles on hover (GSAP) -->` : `
     <!-- data-ember="true"          ← enable fire particles -->`}
     data-repeat="-1"                <!-- -1 = ∞, 0 = once, N = N times -->
     data-repeat-delay="1.6"         <!-- seconds between iterations (GSAP) -->

     <!-- ── Inline style: every brand colour is a CSS var ── -->
     style="
       --ew-iter: 1;                  /* CSS animation iteration count */
       --ew-dur: 4.7s;                /* duration */
       --ew-delay: 0s;                /* delay before play */
       --ew-glyph: #1a3a2a;           /* primary forest fill */
       --ew-outline: #0f2017;         /* strokes */
       --ew-secondary: #8fb89a;       /* sage secondary */
       --ew-highlight: #f5f1e8;       /* cream highlight */
       --ew-glyph-2: #142a1e;         /* darker forest variant */
       --ew-spark-light: #fff3cf;     /* eye pupil shine */
       --ew-rose: #e8a3a3;            /* rose accent */
       --ew-accent-deep: #d99500;     /* deep gold */
       --ew-accent: #f5b820;          /* brand gold */
       --ew-signature: #f5b820;       /* signature mark colour */
       --ew-bg: transparent;          /* medallion disc bg */
     ">
  <!-- paste the eye.svg path/circle contents here -->
</svg>

<!-- Optional: opt into GSAP for blink/tick/lid-open/fire-emitter -->
<script type="module">
  import * as engine from "https://unpkg.com/@ewooral/icons/dist/engines/index.js";
  document.querySelectorAll(".ew-icon").forEach((el) => {
    el.addEventListener("mouseenter", () => engine.play(el));
    el.addEventListener("mouseleave", () => engine.stop(el));
  });
</script>`;

  const react = `import { ${pascal} } from "@ewooral/icons";
import "@ewooral/icons/styles/icons.css";

export default function Example() {
  return (
    <${pascal}
      /* ─── Size / layout ───────────────────────────────── */
      size={${size}}                          // number | string ("3rem" / "48px")

      /* ─── Chrome variants (mutually exclusive) ────────── */
      // plain                              // strip medallion → glyph only
      // noPetal                            // keep chrome, drop signature mark
      signature="${spark}"        // "nkonsonkonson" | "adinkrahene" | "sankofa" | "petal"

      /* ─── Colour shortcuts (override the CSS vars) ────── */
      color="currentColor"                  // glyph + 7% disc tint
      accent="#f5b820"                      // gold paths inside the glyph
      bg="rgba(245,184,32,0.22)"            // medallion disc background

      /* ─── Theme-wide colour vars (preferred) ──────────── */
      style={{
        "--ew-glyph":        "#1a3a2a",     // primary forest fill
        "--ew-outline":      "#0f2017",     // strokes
        "--ew-secondary":    "#8fb89a",     // sage secondary
        "--ew-highlight":    "#f5f1e8",     // cream highlight
        "--ew-glyph-2":      "#142a1e",     // darker forest variant
        "--ew-spark-light":  "#fff3cf",     // pupil-shine / cream accent
        "--ew-rose":         "#e8a3a3",     // rose accent
        "--ew-accent-deep":  "#d99500",     // deep gold
        "--ew-accent":       "#f5b820",     // brand gold
        "--ew-signature":    "#f5b820",     // signature mark (independent)
        "--ew-bg":           "transparent", // disc bg (or any colour)
      }}

      /* ─── Animation engine + motion ───────────────────── */
      engine="${engineName}"                // "css" | "gsap" | "motion"
      motion="${motion}"                  // pop, tilt, spin, swing, shake, rise,
                                            // slide, pulse, flip, check, blink,
                                            // tick, lid-open, ...

      /* ─── Timing / playback ───────────────────────────── */
      speed="4.7s"                          // CSS time string OR ms number
      delay="0s"                            // delay before play${ember ? `
      ember                                 // emit gold particles on hover (GSAP)` : `
      // ember                              // emit gold particles on hover (GSAP)`}

      /* ─── Trigger + callback ──────────────────────────── */
      trigger="hover"                       // hover, click, focus, mount,
                                            //  viewport, manual
      onPlay={() => {/* fired on each play */}}

      /* ─── GSAP timeline loop (engine="gsap" only) ─────── */
      data-repeat="-1"                      // -1 = infinite
      data-repeat-delay="1.6"               // seconds between iterations
    />
  );
}`;

  const reactNative = `// npm install @ewooral/icons-native react-native-svg react-native-reanimated
import { ${pascal} } from "@ewooral/icons-native";

export default function Example() {
  return (
    <${pascal}
      /* ─── Size / chrome ─────────────────────────────── */
      size={${size}}                          // number (DP)
      // plain                              // strip medallion → glyph only
      // noPetal                            // keep chrome, drop signature
      signature="${spark}"        // "nkonsonkonson" | "adinkrahene" | "sankofa" | "petal"

      /* ─── Colours (all flow through to SVG paint) ─── */
      color="#1c1c1a"                       // glyph + tint
      accent="#f5b820"                      // gold parts
      bg="rgba(245,184,32,0.22)"            // disc background

      /* ─── Theme-wide override (RN-style object) ────── */
      colors={{
        glyph:       "#1a3a2a",
        outline:     "#0f2017",
        secondary:   "#8fb89a",
        highlight:   "#f5f1e8",
        glyphTwo:    "#142a1e",
        sparkLight:  "#fff3cf",
        rose:        "#e8a3a3",
        accentDeep:  "#d99500",
        accent:      "#f5b820",
        signature:   "#f5b820",
        bg:          "transparent",
      }}

      /* ─── Motion (Reanimated under the hood) ───────── */
      motion="${motion}"                  // pop, tilt, blink, tick, etc.
      speed={4700}                          // ms (RN uses Reanimated time)
      delay={0}                             // ms
      trigger="press"                       // "press" | "longPress" | "mount" | "manual"
      onPlay={() => {/* haptic, analytics… */}}

      /* ─── GSAP / Motion engines don't run on RN. The
        component dispatches to Reanimated when supported,
        falls back to a static render otherwise. ─────── */
    />
  );
}`;

  const flutter = `// pubspec.yaml:  ewooral_icons: ^0.4.0
import 'package:ewooral_icons/ewooral_icons.dart';
import 'package:flutter/material.dart';

class Example extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return EwIcon(
      // ─── Identity + size ──────────────────────────────
      name: '${icon.name}',
      size: ${size}.0,

      // ─── Chrome variants ──────────────────────────────
      // plain: true,                          // strip chrome → glyph only
      // noPetal: true,                        // chrome on, signature off
      signature: EwSignature.${spark},

      // ─── Colour shortcuts ─────────────────────────────
      color: const Color(0xFF1A3A2A),         // glyph + tint
      accent: const Color(0xFFF5B820),        // gold parts of glyph
      bg: Colors.transparent,                  // disc background

      // ─── Theme-wide palette ───────────────────────────
      palette: const EwPalette(
        glyph:       Color(0xFF1A3A2A),
        outline:     Color(0xFF0F2017),
        secondary:   Color(0xFF8FB89A),
        highlight:   Color(0xFFF5F1E8),
        glyphTwo:    Color(0xFF142A1E),
        sparkLight:  Color(0xFFFFF3CF),
        rose:        Color(0xFFE8A3A3),
        accentDeep:  Color(0xFFD99500),
        accent:      Color(0xFFF5B820),
        signature:   Color(0xFFF5B820),
      ),

      // ─── Motion ───────────────────────────────────────
      motion: EwMotion.${motion.replace(/-/g, "_")},
      speed: const Duration(milliseconds: 700),
      delay: Duration.zero,
      trigger: EwTrigger.tap,                  // tap | longPress | mount | manual
      repeat: -1,                              // -1 = infinite
      repeatDelay: const Duration(milliseconds: 1600),
      onPlay: () {
        // haptic, analytics, ...
      },
    );
  }
}`;

  const vue = `<!-- Vue 3 — full prop surface, mirrors the React API. -->
<script setup>
import { ${pascal} } from "@ewooral/icons/vue";
import "@ewooral/icons/styles/icons.css";
</script>

<template>
  <${pascal}
    :size="${size}"
    plain="false"
    no-petal="false"
    signature="${spark}"

    color="currentColor"
    accent="#f5b820"
    bg="rgba(245,184,32,0.22)"
    :style="{
      '--ew-glyph':       '#1a3a2a',
      '--ew-outline':     '#0f2017',
      '--ew-secondary':   '#8fb89a',
      '--ew-highlight':   '#f5f1e8',
      '--ew-glyph-2':     '#142a1e',
      '--ew-spark-light': '#fff3cf',
      '--ew-rose':        '#e8a3a3',
      '--ew-accent-deep': '#d99500',
      '--ew-accent':      '#f5b820',
      '--ew-signature':   '#f5b820',
      '--ew-bg':          'transparent',
    }"

    engine="${engineName}"
    motion="${motion}"
    speed="4.7s"
    delay="0s"${ember ? `
    ember` : ""}
    trigger="hover"
    @play="onPlay"

    data-repeat="-1"
    data-repeat-delay="1.6"
  />
</template>`;

  // Reuse the live snippet builder so Usage tab and Settings/Copy stay in sync.
  const live = buildLiveSnippets({
    icon, motion, engineName, size, ember, plain, noPetal, spark,
    // Usage tab is educational — show typical defaults rather than live values.
    speed: "4.7s", delay: "0s", trigger: "hover",
    repeat: "-1", repeatDelay: "1.6", colors: {},
  });
  const tabs: Array<[string, string, string]> = [
    ["react",        "React",        react],
    ["react-native", "React Native", reactNative],
    ["flutter",      "Flutter",      flutter],
    ["vue",          "Vue 3",        vue],
    ["svelte",       "Svelte",       live.svelte],
    ["angular",      "Angular",      live.angular],
    ["html-svg",     "Inline SVG",   vanillaInline],
    ["html-img",     "<img>",        vanillaImg],
  ];
  const [activeTab, setActiveTab] = useState<string>(tabs[0][0]);
  const current = tabs.find((t) => t[0] === activeTab) ?? tabs[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Framework tab bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: 4,
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: 6,
        }}
      >
        {tabs.map(([id, label]) => {
          const on = id === activeTab;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                flex: "1 1 auto",
                background: on ? "var(--accent)" : "transparent",
                color: on ? "var(--bg)" : "var(--ink-dim)",
                border: "none",
                padding: "6px 10px",
                borderRadius: 4,
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <UsageBlock title={current[1]} code={current[2]} />
    </div>
  );
}

function UsageBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--ink-faint)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {title}
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1100);
          }}
          style={{
            background: "transparent",
            border: "1px solid var(--line)",
            color: copied ? "var(--accent)" : "var(--ink-dim)",
            padding: "4px 10px",
            borderRadius: 3,
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: 12,
          margin: 0,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "var(--ink-dim)",
          lineHeight: 1.5,
          // Wrap long lines so the panel never needs horizontal scroll.
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "hidden",
          overflowY: "auto",
          maxHeight: 460,
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
