# @ewooral/icons -- Project Context & Working Notes

> Last updated: 2026-06-04
> Status: 203 icons live in the dev playground. Nothing committed/pushed yet -- publishing is done by the repo owner.

## 1. What this project is

`@ewooral/icons` is a branded SVG icon library. Every icon is a self-contained,
optimized SVG rendered inside a consistent "medallion" chrome, animated on hover,
and themeable through CSS custom properties. The visual language is an original,
flat-illustration interpretation inspired by reference sheets, but rendered
entirely in the Ewooral company palette (not the reference colors).

### Company palette
- bg / deep green: #1a3a2a  | bg-2 #142a1e | outline #0f2017
- accent gold: #f5b820 | accent-deep #d99500
- ink / cream: #f5f1e8 | ink-dim #a8a39a
- sage #8fb89a | rose #e8a3a3

## 2. Current state

- 203 icons generated and rendering live (playground header reads "203 ICONS").
- All 56 original icons were redesigned into the richer illustration style;
  the remaining ~147 are new icons added to cover common app-building cases
  (navigation, layout, media, devices, comms, commerce, social, finance, files,
  data, cloud, security, status, time, weather, editing, tools, etc.).
- Three animation engines ship: CSS (default), GSAP (optional), Motion (optional).
- ~20 keyframes defined; ~10 exposed as selectable data-motion gestures.

## 3. Icon anatomy

```
<svg viewBox="0 0 24 24" class="ew-icon" data-motion="pop">
  <g class="ew-chrome">      <!-- backdrop disc, dotted ring, gold spark petal, splash dots -->
  <g class="ew-body" transform="translate(12 12.4)">
    <!-- glyph: centered at (0,0), ~13x13 box, layered two-tone company-palette fills -->
  </g>
</svg>
```

Glyph rules: centered at origin, dark outlines (#0f2017, stroke ~0.9),
gold accents via var(--ew-accent,#f5b820), sage secondary, cream highlights.

## 4. Animation system

Selectable motions (data-motion): pop, rise, tilt, shake, swing, spin,
slide, pulse, flip, check. (Additional internal keyframes exist: spark, snip-a/b,
draw, splash-1..5 -- candidates to promote into the public set.)

Engines (how motion is driven) -- a first-class feature so end-users choose:
- css     -- default, zero-dependency. Simple pop. Always the fallback.
- gsap    -- optional, lazy-loaded only when opted in. Signature: elastic overshoot + spin.
- motion  -- optional, lazy-loaded. Signature: spring vertical bounce.

GSAP/Motion load only when an icon opts in (e.g. data-engine="gsap"); if the
package is absent the CSS engine takes over gracefully.

## 5. How it was built (workflow)

Worked directly in the StackBlitz fork of the repo. Icons were designed in
batches as JS glyph-markup data, wrapped through a build(motion, glyph) helper
into the full medallion SVG, previewed in a standalone tab, then written to disk.

The authoritative generation path is scripts/generate-icons.mjs -- it embeds
all 203 icon definitions and writes every file under src/svg/. To tweak or add
icons: edit the master data in that script and re-run it in the terminal:

```bash
node scripts/generate-icons.mjs
```

This regenerates the whole set deterministically (preferred over per-file edits).

## 6. Roadmap / vision (aspirational -- NOT yet built)

The long-term goal is a comprehensive library that covers effectively every
app-building use case. The "200K+" figure is an aspirational north-star target,
not the current count. Reaching anything near that scale would require an
automated/assisted pipeline (templating, naming taxonomy, dedup, QA) rather than
hand-authoring. Today's 203 are the curated, hand-crafted core.

Near-term milestones:
1. Promote the remaining internal keyframes into the public selectable motion set.
2. Build a motion-picker + engine-picker demo in the playground.
3. Expand categories incrementally via the generate script, keeping each icon
   on-brand and reviewed.

## 7. Constraints / conventions

- Company colors only -- never the reference-sheet blue/yellow.
- 24x24 viewBox + medallion chrome so icons work in the playground and engine.
- Edit-and-rerun the generate script; don't hand-edit individual SVGs.
- Publishing (git commit/push, npm publish) is performed by the repo owner, not automated.
