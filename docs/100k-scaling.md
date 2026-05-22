# Scaling @ewooral/icons to 100K+

> Architecture brief — what we need to change to go from 56 to 100,000+ icons without breaking consumers, builds, or our wallet.

---

## What "100K icons" actually means

For context:

| Set | Count | Style |
|---|---|---|
| **Material Symbols** | ~3,500 | Single-style baseline |
| **Lucide** | ~1,500 | Stroke-only, very consistent |
| **Tabler** | ~5,200 | Stroke + filled |
| **Heroicons** | ~300 × 3 weights | Curated tight set |
| **Phosphor** | ~9,000 (6 weights × 1,500) | Multi-weight |
| **The Noun Project** | ~5M user-contributed | Crowdsourced, inconsistent |
| **Iconify** (aggregator) | ~200K across sets | Federated, no shared style |

**100K curated, single-style icons does not exist today.** The Noun Project hits that scale but at the cost of consistency. Our pitch is "100K with the Ewooral medallion stamp on every one" — a category nobody owns yet.

To get there we don't draw 100K icons by hand. We **source + transform**:

1. ~500 hand-drawn glyphs for the highest-traffic primitives (already partly done — heart, scissors, bell, etc. + the salon/booking domain).
2. ~5,000 procedurally wrapped from permissively-licensed open sets (Lucide MIT, Tabler MIT, Material Apache-2.0). The wrapper script applies our medallion chrome, the splash, the colour-variable system. Their glyph paths sit inside our `ew-glyph` group. **Attribution required in every wrapped icon's metadata; license headers preserved in the manifest.**
3. ~50,000 from domain-specific public-domain sources (NounProject CC0 tier, OpenMoji, Twemoji-derived) — same transform.
4. Long tail: contributor PRs + commissioned illustrators for gaps the procedural pipeline can't fill (highly specific brand/cultural marks).

The wrapper script already exists — `scripts/medallionize.mjs`. It takes any 24×24 viewBox SVG and emits a medallion-style variant. Today we run it manually; for scale it becomes a pipeline.

---

## Storage

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| One git repo, all SVGs in `src/svg/` | Simple, status quo | 100K × ~700 bytes ≈ 70 MB. Manageable but slow to clone. Git itself fine. | ✅ Up to ~20K |
| Git LFS for SVGs above N | Keeps repo lean | LFS bandwidth costs money. SVGs are text — LFS isn't designed for that. | ❌ |
| Split into **sub-packages** by category | Consumers only pull what they use; clones stay sane | More publishing work; need a registry of which-icon-lives-where | ✅ The actual answer at scale |
| CDN-only, no npm | Smallest install | Breaks tree-shaking, breaks SSR, no offline | ❌ |

**Plan:** sub-packages keyed by domain. The current monorepo grows into:

```
@ewooral/icons              (umbrella package, re-exports a curated v1 core ~200 icons)
@ewooral/icons-core         (most-used 200 — same as the umbrella, ships alone for size)
@ewooral/icons-salon        (haircare / spa / cosmetics — ~500)
@ewooral/icons-commerce     (cart, wallet, invoice, POS — ~800)
@ewooral/icons-medical      (clinic, fitness, body — ~1,500)
@ewooral/icons-finance      (banks, currencies, charts — ~600)
@ewooral/icons-tech         (devops, languages, brands — ~2,000)
@ewooral/icons-emoji        (faces, gestures, weather — ~5,000)
@ewooral/icons-anything     (the long tail — ~80,000+, lazy-loaded)
```

Each ships independently with its own semver. The umbrella package has zero dependency on the others — adding a new sub-pack doesn't bloat consumers of the core.

The Flutter port follows the same split: `ewooral_icons`, `ewooral_icons_salon`, etc. (Dart package names use snake_case.)

---

## Build pipeline

Today: `node scripts/generate.mjs` re-runs from scratch on every change. Takes ~1.5s for 56 icons. At 100K this would be ~45 minutes per build — unacceptable.

**Incremental codegen:**

1. Hash every SVG; cache `dist/.tmp-tsx/<hash>.tsx` keyed by hash.
2. On run, only re-emit changed icons.
3. Barrel + sprite + manifest still re-emit (cheap operations).

Target: <5s incremental build at 100K, <2min cold.

**CI strategy:**

- Per-icon unit tests (rendering snapshot + accessibility check) run only on changed icons in PR.
- Full regen + snapshot suite runs nightly on `main`.
- Releases are calendar-based weekly cuts, not per-PR.

---

## Tree-shaking is already correct

The current React output emits one file per icon:

```
dist/react/components/EWHeart.js
dist/react/components/EWBell.js
…
dist/react/index.js  → re-exports all
```

`import { EWHeart } from "@ewooral/icons/react"` pulls just `EWHeart.js`. This already scales to 100K (Webpack/Rollup/Turbopack tree-shake at the file level). **No change required.**

Flutter does the same — one widget class per file, each `import 'src/icons/heart.dart'` is independent.

The pitfall: the umbrella barrel `index.js` re-exports everything. Static analyzers handle this fine, but a few legacy bundlers (older CRA versions) don't tree-shake re-exports cleanly. Mitigation: ship `subpath imports` in `package.json` so consumers can write `@ewooral/icons/react/EWHeart` to bypass the barrel entirely. That's a 5-line `exports` map addition.

---

## Search & discovery on `icons.ewooral.com`

At 56 icons the docs site does a linear `.filter()` over an in-memory array — works fine. At 100K:

| Option | Setup | Cost |
|---|---|---|
| Prebuilt static index (Fuse.js / FlexSearch) shipped as gzipped JSON | Build-time — generate `out/search-index.json.gz` | Free. ~3 MB gz for 100K icons. |
| **Algolia** | Index uploaded at build, client uses InstantSearch | Free tier covers ~10K queries/day. Paid ~$50/mo from ~100K queries. |
| Custom backend (Postgres + trigram) | Need a server. Negates static-export simplicity. | Hosting + maintenance. |

**Plan:** start with prebuilt static FlexSearch index. Cross to Algolia only if the static index gets too big to ship (>10 MB gzipped, which is several hundred thousand icons).

The browse page becomes virtualised (`react-virtuoso` or `@tanstack/react-virtual`) — at 100K nodes the DOM falls over without it.

---

## Versioning + breaking changes

| Change type | Bump |
|---|---|
| Add new icon | patch |
| New prop with default | minor |
| Rename icon | **major** — breaks imports |
| Visual redesign of medallion | **major** — breaks brand-pinned screenshots |
| Add new sub-package | independent of umbrella version |

**Pinning policy in `ahofe-app` and `ahofe-mobile`:** caret range `^0.x.y` until v1.0; then exact-pin major (`^1.0.0`) and gate visual regressions with screenshot tests.

The CHANGELOG follows Keep-a-Changelog. Auto-generated from conventional commits.

---

## License & attribution at scale

Procedurally wrapping someone else's icons creates derivative works. We're MIT-licensed; the source sets we draw from are MIT, Apache-2.0, or CC0 — all compatible. **But we must:**

1. Track provenance per icon. Manifest entry: `{ source: "lucide", originalName: "heart", license: "ISC", attribution: "Lucide Contributors" }`.
2. Bundle a `LICENSES-THIRD-PARTY` file in every published artifact (npm + pub.dev).
3. Add a `licenses` script that diffs manifest → file and fails CI if anything's missing.

CC0 / public-domain icons don't require attribution but we record provenance anyway for auditability.

---

## Cost projection (1-year horizon, conservative)

| Item | Monthly | Annual |
|---|---|---|
| Contabo VPS (already paid for ahofe-app) | $0 marginal | $0 |
| npm publish (free tier — fine) | $0 | $0 |
| pub.dev publish (free) | $0 | $0 |
| GitHub Actions minutes (build + nightly snapshot at 100K) | ~$0 (within free tier with caching) | $0 |
| Algolia (only if we cross the static-index ceiling) | $50 | $600 |
| Domain `icons.ewooral.com` (already owned) | $0 | $0 |
| Contributor / illustrator commission (long tail) | variable | $1K–$5K depending on ambition |

**Bottom line:** scaling to 100K is a few thousand dollars and a year of disciplined pipeline work, not a venture-funded operation.

---

## Rollout phases

| Phase | Target | Timeline | Deliverable |
|---|---|---|---|
| **v0.1** | 56 medallion icons (done) | shipped | `@ewooral/icons@0.1.0` |
| **v0.2** | Docs site live at `icons.ewooral.com`, npm publish, Flutter on pub.dev | June 2026 | Public consumable artifacts |
| **v0.3** | Sub-package split + 200 icons in `@ewooral/icons-core` | July 2026 | Re-architected build |
| **v0.4** | Procedural medallion-wrap pipeline runnable on any 24×24 SVG | August 2026 | `scripts/wrap.mjs <source-set>` produces a new sub-pack |
| **v0.5** | Salon + commerce + finance sub-packs (~2K icons total) | Q3 2026 | First "scale" release |
| **v1.0** | Replace lucide-react in ahofe-app entirely; 500+ icons across umbrella + sub-packs | Q4 2026 | Production-grade |
| **v2.0** | 100K-class long-tail sub-pack with lazy loading | 2027 | The pitch achieved |

---

## What this means for the next 4 weeks

1. **Don't optimise prematurely.** Stay on the simple flat-directory layout until ~500 icons. Sub-packages come at v0.3.
2. **Add the provenance manifest field now** — even at 56 icons, fill it in for the hand-drawn set (`source: "ewooral", license: "MIT"`). Cheaper than retrofitting.
3. **Write the medallion-wrap script for arbitrary source SVGs** — same code path as the existing `medallionize.mjs`, generalised to take an input dir argument. This unlocks scaling from day one.
4. **Defer:** sub-packages, Algolia, virtualisation, incremental codegen. None of those is on the critical path until we hit ~1K icons.
