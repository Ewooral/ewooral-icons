# ewooral_icons

> Ewooral & BFAM Holdings — distinctive medallion-style icon set with cartoonish splash on play. Flutter port of [@ewooral/icons](https://www.npmjs.com/package/@ewooral/icons). 56 icons, growing toward 100,000+.

[![pub package](https://img.shields.io/pub/v/ewooral_icons.svg)](https://pub.dev/packages/ewooral_icons)
[![docs](https://img.shields.io/badge/docs-icons.ewooral.com-f5b820)](https://icons.ewooral.com)

Live preview + playground: **https://icons.ewooral.com**

---

## Install

```yaml
# pubspec.yaml
dependencies:
  ewooral_icons: ^0.1.0
```

```bash
flutter pub get
```

## Use

```dart
import 'package:ewooral_icons/ewooral_icons.dart';

// Hover on desktop/web, no-op on touch (sane default).
EwHeart();

// Tap to play on mobile.
EwBell(trigger: EwTrigger.tap);

// Plays once as soon as it appears on screen.
EwScissors(trigger: EwTrigger.mount);

// Loop forever.
EwStar(motion: EwMotion.spin, iter: 0);

// Imperative — drive from anywhere.
final ctrl = EwIconController();
EwGift(controller: ctrl, trigger: EwTrigger.manual);
// later, from a parent widget:
ctrl.play();   // and ctrl.stop()
```

## Full prop reference

Every icon (`EwHeart`, `EwBell`, ...) accepts:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `double` | `24` | width + height in logical pixels |
| `color` | `Color?` | brand ink | glyph + disc tint (drives `currentColor` in the SVG) |
| `accent` | `Color?` | `#f5b820` brand gold | petal-ribbon + splash particle colour |
| `bg` | `Color?` | unset | disc background — when set, fills solid; when null, subtle 7%-opacity tint of `color` |
| `plain` | `bool` | `false` | strip the medallion chrome — glyph only |
| `noPetal` | `bool` | `false` | hide the gold petal-ribbon (backdrop + ring stay) |
| `motion` | `EwMotion` | per-icon (e.g. `EwHeart` → `pop`) | how the icon moves: `pop` / `tilt` / `swing` / `shake` / `spin` / `slideRight` / `slideLeft` / `slideUp` / `slideDown` / `flip` / `splash` / `none` |
| `speed` | `Duration?` | `700ms` | cycle duration. Bigger = slower + longer pause between repeats. |
| `delay` | `Duration?` | `0` | delay before motion starts after the trigger fires |
| `trigger` | `EwTrigger` | `hover` | `hover` / `tap` / `focus` / `mount` / `viewport` (v0.2) / `manual` |
| `iter` | `int` | `1` | play count. `0` = loop forever. |
| `controller` | `EwIconController?` | — | imperative `.play()` / `.stop()` handle |
| `onPlay` | `VoidCallback?` | — | fires every time the animation starts (haptics, sound, analytics) |

## Triggers across platforms

The trigger contract is identical to the web package — the same `trigger: "click"` you write in React maps to `trigger: EwTrigger.tap` in Flutter.

| Trigger | Web | Flutter |
|---|---|---|
| `hover` | CSS `:hover` | `MouseRegion.onEnter` (desktop + Flutter web; silently no-op on mobile) |
| `tap` / `click` | `onClick` listener | `GestureDetector.onTapDown` |
| `focus` | `onFocus` / `:focus` | `Focus.onFocusChange` |
| `mount` | `useEffect(() => play(), [])` | `WidgetsBinding.addPostFrameCallback` |
| `viewport` | `IntersectionObserver` | _v0.2 — needs `VisibilityDetector` package_ |
| `manual` | `ref.play()` | `EwIconController.play()` |

## Brand & licensing

MIT. Copyright (c) 2026 Ewooral & BFAM Holdings. The icon artwork is original and ships under the same MIT permissions as the code — use, modify, redistribute freely.

## Roadmap

- **v0.1** — 56 medallion icons, 10 motion primitives, splash, full trigger contract (this release)
- **v0.2** — `EwTrigger.viewport` via `VisibilityDetector`, additional motion primitives matching the web (`snip`, `draw`, `check`, `pulse`)
- **v0.3** — sub-packages (`ewooral_icons_salon`, `ewooral_icons_commerce`, `ewooral_icons_medical`) — see [100K-scaling brief](https://github.com/Ewooral/ewooral-icons/blob/main/docs/100k-scaling.md)
- **v1.0** — wired into `ahofe-mobile` as the standard icon set; 200+ icons curated

## Source + issues

- GitHub: https://github.com/Ewooral/ewooral-icons
- Issues: https://github.com/Ewooral/ewooral-icons/issues
- Web package: https://www.npmjs.com/package/@ewooral/icons
