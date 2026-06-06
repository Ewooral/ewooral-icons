// Shared data + constants powering the icon Studio (the rich /icons page).
// Ported from playground/playground.tsx so both the Vite playground and the
// Next.js docs site render from the same source of truth.

export type ColorVar = { name: string; label: string; default: string };

/** Every CSS custom property an icon honours. Keep aligned with the SVG
 *  fallbacks in src/svg/*.svg. */
export const COLOR_VARS: ColorVar[] = [
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

export type Palette = {
  name: string;
  swatches: [string, string, string];
  colors: Record<string, string>;
};

/** Preset overrides for the brand colour vars. Each entry picks new glyph
 *  / accent / secondary / highlight / signature values so the medallion
 *  reads cleanly across themes. Adding to this array grows the chip row. */
export const PALETTES: Palette[] = [
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

export const MOTIONS = [
  "pop", "tilt", "spin", "swing", "shake", "rise", "slide",
  "pulse", "flip", "check", "blink", "tick", "lid-open",
];

export const ENGINES = ["css", "gsap", "motion"];

export const TRIGGERS = [
  "hover", "click", "focus", "mount", "viewport", "manual",
];

export type SignatureKey = "adinkrahene" | "sankofa" | "nkonsonkonson" | "petal";

/** Inner contents of <g class="ew-signature"> for each Akan-rooted signature
 *  mark variant. Swap the inner of that group to swap the mark. */
export const SIGNATURE_INNER: Record<SignatureKey, string> = {
  adinkrahene: `<circle cx="19.4" cy="5.4" r="2.4" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55"/><circle cx="19.4" cy="5.4" r="1.5" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55"/><circle cx="19.4" cy="5.4" r="0.6" fill="var(--ew-signature,#f5b820)"/>`,
  sankofa: `<path fill="var(--ew-signature,#f5b820)" d="M19.4 4 C 18.4 4 18 4.6 18 5.3 C 18 6.4 19.4 7.4 19.4 7.4 C 19.4 7.4 20.8 6.4 20.8 5.3 C 20.8 4.6 20.4 4 19.4 4 Z"/><path fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.5" stroke-linecap="round" d="M21.0 6.5 C 22 7 22 8 21.2 8.1"/>`,
  nkonsonkonson: `<ellipse cx="18.8" cy="5.0" rx="0.75" ry="1.35" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55" transform="rotate(-25 18.8 5.0)"/><ellipse cx="20.3" cy="6.4" rx="0.75" ry="1.35" fill="none" stroke="var(--ew-signature,#f5b820)" stroke-width="0.55" transform="rotate(25 20.3 6.4)"/>`,
  petal: `<path class="ew-spark ew-petal-draw" fill="var(--ew-signature,#f5b820)" stroke="var(--ew-highlight,#f5f1e8)" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" d="M18.5 3.4 C 20.4 3.4 21.6 4.8 21.4 6.6 C 21.2 7.4 20.4 7.7 19.4 7.5 C 18.4 7.2 17.6 6.4 17.6 5.4 C 17.6 4.4 18 3.8 18.5 3.4 Z"/>`,
};

export type Archetype = {
  motion: string;
  engine?: string;       // "css" | "gsap" | "motion", default "css"
  ember?: boolean;       // toggle the GSAP fire emitter
  repeat?: string;       // GSAP timeline repeat (-1 = ∞, 0 = once)
  repeatDelay?: string;  // seconds between iterations
  speed?: string;        // CSS / GSAP duration
};

/** Each named icon gets the motion/engine/ember mix that reads as its
 *  real-world action. Selecting the icon applies these on open. Icons
 *  without an entry fall back to their baked-in data-motion. */
export const ICON_ARCHETYPES: Record<string, Archetype> = {
  eye:       { motion: "blink", engine: "gsap", ember: true,  repeat: "-1", repeatDelay: "1.6" },
  "eye-off": { motion: "blink", engine: "gsap", ember: false, repeat: "-1", repeatDelay: "2.2" },
  clock:     { motion: "tick",  engine: "gsap", repeat: "-1", repeatDelay: "0" },
  archive:   { motion: "lid-open", engine: "gsap" },
  folder:    { motion: "lid-open", engine: "gsap" },
  gift:      { motion: "lid-open", engine: "gsap" },
  loader:    { motion: "spin", engine: "gsap", ember: true, repeat: "-1", repeatDelay: "0", speed: "1.1s" },

  // Fintech kit
  dollar:        { motion: "pop",   engine: "gsap", ember: true },
  coins:         { motion: "swing", engine: "css" },
  wallet:        { motion: "lid-open", engine: "gsap" },
  card:          { motion: "flip",  engine: "css" },
  receipt:       { motion: "rise",  engine: "css" },
  coupon:        { motion: "tilt",  engine: "css" },
  send:          { motion: "tilt",  engine: "css" },
  download:      { motion: "rise",  engine: "css" },
  upload:        { motion: "rise",  engine: "css" },
  refresh:       { motion: "spin",  engine: "gsap", repeat: "-1", repeatDelay: "0", speed: "1.1s" },
  "refresh-cw":  { motion: "spin",  engine: "gsap", repeat: "-1", repeatDelay: "0", speed: "1.1s" },
  sync:          { motion: "spin",  engine: "gsap", repeat: "-1", repeatDelay: "0", speed: "1.1s" },
  chart:         { motion: "rise",  engine: "css" },
  "pie-chart":   { motion: "spin",  engine: "css" },
  "trending-up": { motion: "rise",  engine: "css" },
  "trending-down": { motion: "rise", engine: "css" },
  dashboard:     { motion: "pop",   engine: "css" },
  lock:          { motion: "tilt",  engine: "css" },
  unlock:        { motion: "tilt",  engine: "css" },
  key:           { motion: "tilt",  engine: "css" },
  shield:        { motion: "pulse", engine: "css" },
  "shield-check": { motion: "pulse", engine: "css" },
  fingerprint:   { motion: "pulse", engine: "css" },
  verified:      { motion: "check", engine: "css" },
  check:         { motion: "check", engine: "css" },
  "check-circle":{ motion: "check", engine: "css" },
  "check-check": { motion: "check", engine: "css" },
  close:         { motion: "shake", engine: "css" },
  "x-circle":    { motion: "shake", engine: "css" },
  "info-circle": { motion: "pulse", engine: "css" },
  "help-circle": { motion: "tilt",  engine: "css" },
  alert:         { motion: "shake", engine: "css" },
  "alert-circle":{ motion: "shake", engine: "css" },
  group:         { motion: "pop",   engine: "css" },
  bell:          { motion: "swing", engine: "css" },
  "bell-off":    { motion: "tilt",  engine: "css" },
  notification:  { motion: "pulse", engine: "css" },
  timer:         { motion: "tick",  engine: "gsap", repeat: "-1", repeatDelay: "0" },
  alarm:         { motion: "swing", engine: "css" },
  hourglass:     { motion: "flip",  engine: "css" },
  history:       { motion: "spin",  engine: "gsap", repeat: "1" },
};
