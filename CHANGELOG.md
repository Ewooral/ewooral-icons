# Changelog

## 0.4.0 — 2026-06-06

Major release. Animation engine, signature mark refactor, and a fresh
"browse + test" Studio at icons.ewooral.com/icons.

### Engine + motion
- **Pluggable engines** — `engine="css" | "gsap" | "motion"` per icon.
- New motion cases in the GSAP engine: `blink` (MorphSVG eye), `tick`
  (clock second hand), `lid-open` (archive / folder / gift), and an
  **ember** fire-particle emitter (`data-ember="true"`).
- `spin` motion now does linear-loop when `data-repeat<0`, perfect for
  loaders and refresh spinners. One-shot spin keeps the satisfying ease.
- **CSS fallback for `blink`** so `<EWEye />` blinks on hover without
  needing `engine="gsap"`.
- Every animation rule in `icons.css` now honours `var(--ew-dur)` —
  the `speed` prop actually slows / speeds the animation.

### Icons + visuals
- **235 icons** total. New: `group` (three-figure team mark for fintech).
- Body-anchor wrap on all 234 pre-existing icons so the `<g class="ew-body">`
  transform doesn't fight CSS rotation animations.
- **Akan signature mark** — `<g class="ew-signature">` sibling of chrome.
  Default in `src/svg/*.svg` is Nkonsonkonson (chain links); Adinkrahene,
  Sankofa, and the legacy gold petal swap via the new `signature` prop.
- `noPetal` now defaults to **`true`** on the React wrapper — the
  signature is a deliberate brand accent, opt in per icon.
- Tone-down forest green — primary glyph fallback `#1a3a2a` → `#3a6b48`
  across all 181 affected SVGs. Deeper `#1a3a2a` is reserved for outline
  stroke only.
- Highlight default `#f5f1e8` → `#8fb89a` (sage) in 59 SVGs so the inner
  fills read against light + cream backgrounds.
- 23 SVGs repaired — the body-anchor sweep had corrupted `<path`, `<circle`,
  `<rect` opening tags in a generation pass; fully repaired.
- Clock's minute + hour hands now rotate together as one group.
- Globe redrawn with proper meridians (equator, prime meridian, tilted
  ellipse).
- Group icon authored from scratch — three figures in hierarchy.

### React wrapper
- New props: `highlight`, `secondary`, `outline` for direct CSS-var
  override without dropping to `style={{ "--ew-..." }}`.
- `noPetal` default flipped to `true`. Opt back into the brand mark
  per icon with `noPetal={false}`.
- `noPetal` regex actually strips the new `<g class="ew-signature">` +
  `<g class="ew-splash">` groups (previous regex targeted the old
  `.ew-spark` shape that no longer exists).
- Cycle duration default bumped from `0.7s` to `4.7s` (more ambient
  on a single-icon focus).

### CSS / themes
- `[data-theme="default" | "light" | "dark"]` overrides in `icons.css`
  so consumers tagging a parent get readable icons automatically — no
  per-page CSS-var setup needed.
- Dashed medallion ring driven by `color: var(--ew-secondary)` so it
  inherits the brand sage instead of an invisible page-text colour.
- Signature mark hidden by default (`:where(.ew-icon) .ew-signature
  { display: none }`) — opt in via `data-signature`.
- `--ew-secondary` aligned to `#8fb89a` across all themes so what the
  Studio's colour picker shows matches what the icon renders.

### Studio (icons.ewooral.com/icons)
- New **IconStudio** — grid + slide-in side panel, replaces the
  thin browse + per-icon detail route.
- 10-palette chip row, signature picker, theme colour vars, copy
  snippet for 8 frameworks (React, RN, Flutter, Vue 3, Svelte,
  Angular, inline SVG, `<img>` tag) with live prop reflection.
- Lazy-load architecture: grid uses `<img src="/svg/...">`, panel
  fetches single SVG on click. ~8 KB client bundle for 235 icons.
- Studio's grid icons match the side-panel preview — both render
  with signature + splash stripped (matches React wrapper default).
- Single dev server (`pnpm run dev` → next on `:3010`); Vite playground
  retired.

### Fintech kit
- 35 icons get characteristic motion archetypes wired in the Studio
  (dollar pops + sparkles, refresh / sync / loader linear-spin,
  verified / check check-draws, lock / unlock / key tilt, ...).

### Bug fixes
- Studio side-panel prop controls now apply CSS vars on the
  `.ew-icon` element directly so `[data-theme]` overrides don't
  shadow user picks.
- Speed + delay flow through `--ew-dur` / `--ew-delay` on the SVG.
- Petal draw-stroke animation when the legacy petal signature is
  selected — cream stroke traces the outline before fading.

## 0.3.7

See git log up to commit `429c772`.
