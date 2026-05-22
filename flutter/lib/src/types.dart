/// Cross-platform animation primitive — what kind of motion the icon plays
/// when triggered. Maps 1:1 with the web `data-motion="..."` attribute so the
/// authoring vocabulary stays consistent.
enum EwMotion {
  pop,        // quick scale-up + settle
  tilt,       // whole icon wobble
  shake,      // rapid left-right
  swing,      // pendulum tilt
  spin,       // full 360° rotation
  slideRight, // translate +x
  slideLeft,  // translate -x
  slideUp,    // translate -y
  slideDown,  // translate +y
  flip,       // vertical card flip (rotateY)
  splash,     // particle burst (always overlaid on every motion)
  none,       // no whole-icon motion — splash only
}

/// What event fires the animation. Same contract as the web `trigger` prop.
enum EwTrigger {
  /// Cursor hovers over the icon. Desktop + Flutter web only — silently no-op
  /// on mobile (since touch has no hover).
  hover,

  /// Tap / click. Works on every platform.
  tap,

  /// The icon (or its enclosing focus scope) receives focus.
  focus,

  /// Plays once as soon as the widget mounts.
  mount,

  /// Plays whenever the icon scrolls into view. Requires the icon to live in
  /// a scrollable region; uses VisibilityDetector once added (v0.2).
  viewport,

  /// Never fires automatically. Use [EwIconController.play] / [stop] to drive.
  manual,
}

/// Imperative controller — pass into an icon and call [play] / [stop] from
/// anywhere in your widget tree. The web equivalent of [EWIconHandle].
class EwIconController {
  void Function()? _play;
  void Function()? _stop;

  /// Fires the animation now. Honours the icon's `iter` / `speed` / `delay`.
  void play() => _play?.call();

  /// Stops a running loop (useful when `motion` plays infinitely).
  void stop() => _stop?.call();

  // ── internal — bound by EwIconBase in initState ───────────────────────
  void attach(void Function() play, void Function() stop) {
    _play = play;
    _stop = stop;
  }

  void detach() {
    _play = null;
    _stop = null;
  }
}
