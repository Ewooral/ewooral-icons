# Changelog

## 0.1.0 — 2026-05-22

Initial public release.

- 56 medallion-style icons as Dart widget classes (`EwHeart`, `EwBell`, `EwScissors`, ...)
- `EwIconBase` — shared `StatefulWidget` with:
  - `flutter_svg` renderer + build-time XML colour rewrite (`color` / `accent` / `bg`)
  - 10 motion primitives via `AnimationController`: `pop` / `tilt` / `swing` / `shake` / `spin` / `slideRight` / `slideLeft` / `slideUp` / `slideDown` / `flip` / `none`
  - Five-particle splash overlay emitted from the gold petal-ribbon
- Cross-platform trigger contract (mirrors the web package):
  - `EwTrigger.hover` — `MouseRegion` (desktop + web)
  - `EwTrigger.tap` — `GestureDetector.onTapDown` (every platform)
  - `EwTrigger.focus` — `Focus.onFocusChange`
  - `EwTrigger.mount` — fires once on mount
  - `EwTrigger.manual` — only via `EwIconController.play()` / `.stop()`
- `EwIconController` — imperative play/stop handle
- `onPlay` callback for haptics / sound / analytics hooks
- Tests + analyzer green on Flutter 3.27 / Dart 3.6
