# @ewooral/icons

> Ewooral & BFAM Holdings — branded icon set in the **Ewooral Medallion** style: every glyph sits on a soft disc with a dotted ring and a gold petal-ribbon spark, plus a cartoonish particle burst on play. 56 icons. Works in any web framework. Flutter port planned for `ahofe-mobile`.

---

## Why a custom set

Generic icon libraries (Lucide, Heroicons, Material) look generic. Across the Ewooral product line — Ahoɔfɛ, the BFAM admin console, the marketing site, future products — we want a single, recognisable visual voice. Every icon ships with:

- a `currentColor` glyph (inherits text colour, works in every theme)
- a 7%-tint disc backdrop with a dotted decorative ring
- a gold petal-ribbon (`#f5b820`) — the brand signature, overridable
- a five-particle splash burst on play (cartoonish, fades out)
- a named animation primitive (`pop`, `tilt`, `spin`, `swing`, `slide-*`, `pulse`, `flip`, `shake`)
- full per-icon control: colour / accent / disc-background / size / motion count / speed / delay / trigger

---

## Install

```bash
pnpm add @ewooral/icons         # once published
# — or, while linked locally —
pnpm add ../ewooral-icons
```

Then import the stylesheet **once** in your app's entry point:

```ts
import "@ewooral/icons/styles/icons.css";
```

The stylesheet is required for the animations to fire. The SVGs themselves still render correctly without it (just frozen).

---

## Quick reference — `trigger` prop

Animations don't have to fire on hover. They can fire on **any event**:

| `trigger` | What plays it |
|---|---|
| `"hover"` (default) | cursor moves over the icon — pure CSS, no JS needed |
| `"click"` | click / tap |
| `"focus"` | element receives focus (good for keyboard nav) |
| `"mount"` | once, as soon as it renders |
| `"viewport"` | when it scrolls into view (`IntersectionObserver`) |
| `"manual"` | only via `ref.play()` or `dispatchEvent('ew-play')` |

This works the **same way in every framework** because under the hood it's a single `data-play` attribute on the `<svg>` — anything that can toggle that attribute can play the animation.

---

## Use it from your framework

### React (CRA / Vite / Remix)

```tsx
import { EWHeart, EWBell, EWScissors } from "@ewooral/icons/react";
import "@ewooral/icons/styles/icons.css";

<EWHeart size={32} color="#c0413a" accent="#f5e6a8" />
<EWBell trigger="click" motion={3} speed="1.2s" />
<EWScissors bg="#1a3a2a" color="#fff" plain={false} />
```

Imperative play via ref:

```tsx
import { useRef } from "react";
import { EWBell, type EWIconHandle } from "@ewooral/icons/react";

const ref = useRef<EWIconHandle>(null);

<EWBell ref={ref} trigger="manual" />
<button onClick={() => ref.current?.play()}>Ring it</button>
```

### Next.js (App Router)

Icons are **pure CSS-animated SVGs with optional event-handler effects** — they render fine as Server Components when `trigger="hover"` (zero JS sent to the client). For triggers that need event listeners (`click`, `focus`, `mount`, `viewport`, `manual`), the icon becomes interactive — wrap it (or its parent) in `"use client"`.

```tsx
// app/layout.tsx
import "@ewooral/icons/styles/icons.css";

// app/page.tsx — Server Component, no client JS
import { EWHeart } from "@ewooral/icons/react";
export default function Page() {
  return <EWHeart size={48} />;   // hover trigger, pure CSS
}

// app/cart-button.tsx — Client Component
"use client";
import { EWCart } from "@ewooral/icons/react";
export function CartButton() {
  return <EWCart trigger="click" motion={2} />;
}
```

Every icon is its own file under `dist/react/components/<EWName>.js`, so tree-shaking is automatic — importing `EWHeart` does not pull in the other 55.

### Vue 3 (SFC)

The package doesn't ship a Vue wrapper, but Vue can consume the raw SVGs directly:

```vue
<script setup>
import HeartSvg from "@ewooral/icons/svg/heart.svg?raw";   // Vite ?raw import
import "@ewooral/icons/styles/icons.css";
import "@ewooral/icons/vanilla/ew-icons-trigger.js";       // auto-wires data-trigger
</script>

<template>
  <span v-html="HeartSvg" />                              <!-- hover -->
  <span :data-trigger="'click'" v-html="HeartSvg" />      <!-- click -->
</template>
```

### Svelte 5

```svelte
<script>
  import HeartSvg from "@ewooral/icons/svg/heart.svg?raw";
  import "@ewooral/icons/styles/icons.css";
  import "@ewooral/icons/vanilla/ew-icons-trigger.js";
</script>

{@html HeartSvg}                                              <!-- hover -->
<div data-trigger="click">{@html HeartSvg}</div>              <!-- click -->
```

### Vanilla HTML / Angular / anything else

```html
<link rel="stylesheet" href="/node_modules/@ewooral/icons/styles/icons.css" />
<script src="/node_modules/@ewooral/icons/vanilla/ew-icons-trigger.js" defer></script>

<!-- Default: hover -->
<svg class="ew-icon" data-motion="pop" viewBox="0 0 24 24" width="32" height="32">
  <!-- contents of @ewooral/icons/svg/heart.svg -->
</svg>

<!-- Click trigger -->
<svg class="ew-icon" data-motion="pop" data-trigger="click" ...>...</svg>

<!-- On viewport -->
<svg class="ew-icon" data-trigger="viewport" ...>...</svg>

<!-- Imperative -->
<svg class="ew-icon" id="my-icon" data-trigger="manual" ...>...</svg>
<script>
  document.getElementById("my-icon").dispatchEvent(new CustomEvent("ew-play"));
  // — or —
  EWIcons.play("#my-icon");
</script>
```

The vanilla helper auto-wires every `.ew-icon` in the DOM, including ones added later (uses `MutationObserver` so SPAs work without extra code).

### Sprite (single-fetch, all icons)

```html
<svg class="ew-icon" data-motion="pop" width="32" height="32">
  <use href="/node_modules/@ewooral/icons/sprite.svg#ew-heart" />
</svg>
```

Note: sprite-mode loses the per-icon medallion animations (`<use>` symbols are detached from the document, so the CSS class selectors don't match the live tree). For animated icons, inline the SVG instead.

### PNG (email, OG images, social cards)

```html
<img src="/node_modules/@ewooral/icons/png/heart@48.png" width="48" height="48" alt="" />
<img src="/node_modules/@ewooral/icons/png/heart@inverse@48.png" />  <!-- dark bg -->
```

Available sizes: 24, 32, 48, 96 px. Variants: default ink + `@inverse`.

---

## All props (React)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | number \| string | `24` | width + height |
| `color` | string | inherits | glyph + disc-tint colour (`currentColor`) |
| `accent` | string | `#f5b820` | petal-ribbon + splash particle colour |
| `bg` | string | unset | disc background — when set, fills solid; when unset, subtle 7%-tint of `color` |
| `plain` | boolean | `false` | strip the medallion chrome — glyph only |
| `noPetal` | boolean | `false` | hide the gold petal-ribbon (backdrop + ring stay) |
| `motion` | `"play"` \| `"repeat"` \| `"off"` \| number | `"play"` | how many times the animation plays per trigger |
| `speed` | string \| number | `"0.7s"` | cycle duration. Bigger = slower motion AND longer pause between repeats. |
| `delay` | string \| number | `"0s"` | delay before motion starts |
| `trigger` | `"hover"` \| `"click"` \| `"focus"` \| `"mount"` \| `"viewport"` \| `"manual"` | `"hover"` | event that fires the animation |
| `onPlay` | `() => void` | — | fires every time the animation starts (haptics, sound, analytics) |
| `ref` | `Ref<EWIconHandle>` | — | imperative handle: `{ play(), stop(), svg }` |

CSS variables (set on any ancestor, no JS required):
`--ew-accent`, `--ew-bg`, `--ew-bg-opacity`, `--ew-dur`, `--ew-delay`, `--ew-iter`.

---

## Motion vocabulary

| `data-motion` | Effect | Sample icons |
|---|---|---|
| `pop` | quick scale-up + settle | check, plus, heart, star |
| `tilt` | whole icon wobbles | home, edit, comb, tag |
| `shake` | rapid left-right | bell, trash, alert |
| `swing` | pendulum tilt | bell, lipstick |
| `slide-r/l/u/d` | element shoots in a direction | arrows, menu, send |
| `spin` | full 360° rotation | refresh, settings, clock |
| `pulse` | gentle scale pulse on spark | more |
| `flip` | vertical card flip | card |
| _scissors_ | blades close like cutting | scissors |
| _check_ | stroke draws on + bounces | check |
| _splash_ (always-on) | five-particle burst from the petal-ribbon | every icon, on every play |

---

## Develop

```bash
pnpm dev      # http://localhost:5174 — live playground with HMR on every .svg
pnpm build    # generate dist/ (React + sprite + manifest + vanilla helper + CSS)
pnpm build:png # rasterise PNG variants (needs sharp)
```

The playground lets you toggle every prop live: colour pickers (glyph / accent / disc), size, motion (off / once / 2× / 3× / 5× / repeat), speed, delay, trigger mode, plus a **Play all** button that dispatches `ew-play` on every visible icon.

## Add a new icon

1. Drop your SVG at `src/svg/<kebab-name>.svg` following the shape rules below.
2. Re-run `node scripts/medallionize.mjs && node scripts/add-splash.mjs` if your SVG doesn't already have the chrome — these are idempotent.
3. `pnpm build` (or just refresh the playground — Vite hot-reloads).
4. Automatically available as `<EWKebabToPascal />` in the React export.

Shape rules:
- `viewBox="0 0 24 24"`, 2px safe margin
- `<svg class="ew-icon" data-motion="<motion>">` — pick a motion from the table above
- Glyph paths use `stroke="currentColor"`, `fill="none"`, `stroke-width="1.7–2.4"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- For multi-element animations (scissors blades, mail flap), use named sub-classes (`.ew-blade-a`, `.ew-blade-b`, `.ew-rise`, `.ew-body`) — the CSS already targets them.

## Roadmap

- **v0.1** — 56 medallion icons + 5 themes + trigger system + vanilla helper (this release)
- **v0.2** — 80+ icons (commerce, social, charts, salon-domain expansion)
- **v0.3** — `@ewooral/icons/flutter` Dart package for `ahofe-mobile`
- **v0.4** — domain packs (clinic / fitness / tutoring) for other BFAM products
- **v0.5** — animated GIFs / Lottie alternates for marketing
- **v1.0** — published to private GitHub Packages registry, replace lucide-react in ahofe-app
