/// @ewooral/icons — Flutter port.
///
/// Mirror of the web package at https://icons.ewooral.com.
///
/// Quick start:
///
/// ```dart
/// import 'package:ewooral_icons/ewooral_icons.dart';
///
/// EwHeart()                              // hover (desktop/web), no-op on mobile
/// EwBell(trigger: EwTrigger.tap)         // tap on mobile
/// EwScissors(trigger: EwTrigger.mount)   // plays once when shown
/// EwStar(motion: EwMotion.spin, iter: 0) // loop forever
/// ```
///
/// Every icon is its own widget class for ergonomic autocomplete + tree-shaking.
library;

// Public types — enums + the imperative controller.
export 'src/types.dart';

// Base widget — pluggable for custom icons that follow the medallion contract.
export 'src/ew_icon_base.dart';

// ── Generated icons ─────────────────────────────────────────────────────
// (populated by `dart run scripts/generate.dart`)
export 'src/icons/icons.dart';
