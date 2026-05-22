import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'types.dart';

/// Brand defaults — mirrored from the web package's CSS variables.
const Color _kEwBrandGold  = Color(0xFFF5B820);
const Color _kEwBrandInk   = Color(0xFFF5F1E8);

const Duration _kEwDefaultSpeed = Duration(milliseconds: 700);
const Duration _kEwDefaultDelay = Duration.zero;

/// Base widget that powers every generated icon. You usually don't import
/// this directly — instead use the per-icon classes like [EwHeart], [EwBell].
///
/// Three layered responsibilities:
///
///   1. Render the SVG via [SvgPicture.string] after rewriting the inline
///      `currentColor` + `var(--ew-accent)` + `var(--ew-bg)` placeholders to
///      explicit Color values picked from [color] / [accent] / [bg].
///   2. Run an [AnimationController] driven by [trigger]. The controller's
///      0.0→1.0 value is interpreted differently per [motion].
///   3. Overlay the splash particle burst — five gold dots that pop, grow,
///      and shoot into the upper-right quadrant during the first 35% of the
///      cycle, then stay invisible for the rest period.
class EwIconBase extends StatefulWidget {
  const EwIconBase({
    super.key,
    required this.svg,
    this.size = 24,
    this.color,
    this.accent,
    this.bg,
    this.plain = false,
    this.noPetal = false,
    this.motion = EwMotion.pop,
    this.speed,
    this.delay,
    this.trigger = EwTrigger.hover,
    this.iter = 1,
    this.controller,
    this.onPlay,
  });

  /// Raw SVG XML — supplied by each generated icon class.
  final String svg;

  /// Width + height in logical pixels.
  final double size;

  /// Glyph + medallion-disc tint colour. Drives `currentColor`.
  final Color? color;

  /// Petal-ribbon + splash particle colour. Defaults to brand gold.
  final Color? accent;

  /// Medallion disc background. When `null`, disc is a subtle 7%-opacity
  /// tint of [color]. When non-null, fills solid.
  final Color? bg;

  /// Strip the medallion chrome — glyph only.
  final bool plain;

  /// Hide the gold petal-ribbon (backdrop + ring stay).
  final bool noPetal;

  /// How the icon moves when triggered.
  final EwMotion motion;

  /// Cycle duration. Defaults to 0.7s. Bigger = slower motion AND longer
  /// pause between repeats (matches the web behaviour exactly).
  final Duration? speed;

  /// Delay before motion starts after the trigger fires.
  final Duration? delay;

  /// What event fires the animation.
  final EwTrigger trigger;

  /// Iteration count. `1` plays once, `0` for infinite loop (matches web's
  /// `motion="repeat"`), or any positive integer.
  final int iter;

  /// Optional imperative controller. Call [EwIconController.play] from any
  /// parent widget to fire the animation regardless of [trigger].
  final EwIconController? controller;

  /// Fires every time the animation starts. Hook for haptics / sound /
  /// analytics.
  final VoidCallback? onPlay;

  @override
  State<EwIconBase> createState() => _EwIconBaseState();
}

class _EwIconBaseState extends State<EwIconBase>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  int _playsLeft = 0;
  bool _focused = false;
  Timer? _delayTimer;

  Duration get _speed => widget.speed ?? _kEwDefaultSpeed;
  Duration get _delay => widget.delay ?? _kEwDefaultDelay;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: _speed)
      ..addStatusListener(_onStatus);
    widget.controller?.attach(_play, _stop);

    if (widget.trigger == EwTrigger.mount) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _play());
    }
  }

  @override
  void didUpdateWidget(covariant EwIconBase old) {
    super.didUpdateWidget(old);
    if (_speed != _ctrl.duration) _ctrl.duration = _speed;
    if (widget.controller != old.controller) {
      old.controller?.detach();
      widget.controller?.attach(_play, _stop);
    }
  }

  @override
  void dispose() {
    _delayTimer?.cancel();
    widget.controller?.detach();
    _ctrl.dispose();
    super.dispose();
  }

  // ── play / stop logic ──────────────────────────────────────────────────

  void _onStatus(AnimationStatus status) {
    if (status != AnimationStatus.completed) return;
    if (_playsLeft == 0) {
      // infinite — restart immediately
      _ctrl.value = 0;
      _ctrl.forward();
    } else if (_playsLeft > 1) {
      _playsLeft -= 1;
      _ctrl.value = 0;
      _ctrl.forward();
    } else {
      _playsLeft = 0;
    }
  }

  void _play() {
    if (!mounted || widget.motion == EwMotion.none) return;
    widget.onPlay?.call();
    _playsLeft = widget.iter <= 0 ? 0 : widget.iter;
    _delayTimer?.cancel();
    void fire() {
      if (!mounted) return;
      _ctrl
        ..stop()
        ..value = 0
        ..forward();
    }
    if (_delay == Duration.zero) {
      fire();
    } else {
      _delayTimer = Timer(_delay, fire);
    }
  }

  void _stop() {
    if (!mounted) return;
    _playsLeft = 0;
    _delayTimer?.cancel();
    _delayTimer = null;
    _ctrl
      ..stop()
      ..value = 0;
  }

  // ── trigger wiring ─────────────────────────────────────────────────────

  Widget _wireTrigger({required Widget child}) {
    switch (widget.trigger) {
      case EwTrigger.hover:
        return MouseRegion(
          onEnter: (_) => _play(),
          child: child,
        );
      case EwTrigger.tap:
        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: (_) => _play(),
          child: child,
        );
      case EwTrigger.focus:
        return Focus(
          onFocusChange: (f) {
            if (f && !_focused) _play();
            _focused = f;
          },
          child: child,
        );
      case EwTrigger.mount:
      case EwTrigger.viewport: // v0.2: VisibilityDetector
      case EwTrigger.manual:
        return child;
    }
  }

  // ── render ─────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final ink    = widget.color  ?? _kEwBrandInk;
    final accent = widget.accent ?? _kEwBrandGold;
    final bg     = widget.bg;

    final svgXml = _prepareSvg(widget.svg, widget.plain, widget.noPetal);
    final coloredXml = _applyColors(svgXml, ink: ink, accent: accent, bg: bg);

    return _wireTrigger(
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (context, _) {
          final t = _curve(_ctrl.value);
          final transform = _motionTransform(widget.motion, t);
          return SizedBox(
            width: widget.size,
            height: widget.size,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                // Glyph + chrome
                Positioned.fill(
                  child: Transform(
                    transform: transform,
                    alignment: Alignment.center,
                    child: SvgPicture.string(
                      coloredXml,
                      width: widget.size,
                      height: widget.size,
                    ),
                  ),
                ),
                // Splash overlay — only when chrome is visible
                if (!widget.plain) _SplashOverlay(t: t, color: accent, size: widget.size),
              ],
            ),
          );
        },
      ),
    );
  }

  // Compressed keyframe: real motion happens in the first 35% of the cycle,
  // rest period for the remaining 65%. Output is the "intensity" 0..1.
  double _curve(double v) {
    if (v <= 0.35) return Curves.easeOut.transform(v / 0.35);
    return 0; // rest
  }

  Matrix4 _motionTransform(EwMotion motion, double t) {
    // t goes 0 → 1 → 0 → … but we treat it as a single 0..1 pulse with
    // overshoot on the rising edge.
    final pulse = math.sin(t * math.pi); // bell curve, peaks at t=0.5

    switch (motion) {
      case EwMotion.pop:
        final s = 1 + 0.25 * pulse;
        return Matrix4.identity()..scaleByDouble(s, s, 1, 1);
      case EwMotion.tilt:
        final angle = math.sin(t * math.pi * 2) * 0.20; // 11° wobble
        return Matrix4.rotationZ(angle);
      case EwMotion.shake:
        final angle = math.sin(t * math.pi * 6) * 0.10;
        return Matrix4.rotationZ(angle);
      case EwMotion.swing:
        final angle = math.sin(t * math.pi * 2) * 0.25;
        return Matrix4.rotationZ(angle)..translateByDouble(0, widget.size * 0.1, 0, 1);
      case EwMotion.spin:
        return Matrix4.rotationZ(t * math.pi * 2);
      case EwMotion.slideRight:
        return Matrix4.identity()..translateByDouble(pulse * widget.size * 0.16, 0, 0, 1);
      case EwMotion.slideLeft:
        return Matrix4.identity()..translateByDouble(-pulse * widget.size * 0.16, 0, 0, 1);
      case EwMotion.slideUp:
        return Matrix4.identity()..translateByDouble(0, -pulse * widget.size * 0.16, 0, 1);
      case EwMotion.slideDown:
        return Matrix4.identity()..translateByDouble(0, pulse * widget.size * 0.16, 0, 1);
      case EwMotion.flip:
        return Matrix4.identity()
          ..setEntry(3, 2, 0.001) // perspective
          ..rotateY(t * math.pi * 2);
      case EwMotion.splash:
      case EwMotion.none:
        return Matrix4.identity();
    }
  }
}

// ── SVG colour rewriting ────────────────────────────────────────────────

/// Strips chrome (when plain=true) or petal (when noPetal=true) from the
/// raw SVG so the resulting XML matches the requested variant.
String _prepareSvg(String svg, bool plain, bool noPetal) {
  if (plain) {
    return _stripChrome(svg);
  }
  if (noPetal) {
    return svg.replaceAll(
      RegExp(r'<(?:circle|rect|path)[^>]*class="ew-spark"[^>]*\/>\s*'),
      '',
    );
  }
  return svg;
}

/// Walk the `<g class="ew-chrome">...</g>` block counting nested groups
/// (the splash group is nested inside it).
String _stripChrome(String svg) {
  final open = svg.indexOf('<g class="ew-chrome">');
  if (open < 0) return svg;
  var depth = 0;
  var i = open;
  while (i < svg.length) {
    if (svg.startsWith('<g', i)) {
      depth++;
      i = svg.indexOf('>', i) + 1;
      continue;
    }
    if (svg.startsWith('</g>', i)) {
      depth--;
      if (depth == 0) return svg.substring(0, open) + svg.substring(i + 4);
      i += 4;
      continue;
    }
    i++;
  }
  return svg;
}

/// Replace currentColor + the CSS-variable fallbacks with concrete Color
/// strings so flutter_svg can render without the browser's CSS engine.
String _applyColors(String svg, {
  required Color ink,
  required Color accent,
  Color? bg,
}) {
  String hex(Color c) =>
      '#${c.toARGB32().toRadixString(16).padLeft(8, '0').substring(2)}';
  final inkHex    = hex(ink);
  final accentHex = hex(accent);
  final bgHex     = bg != null ? hex(bg) : inkHex;
  final bgOpacity = bg != null ? '1' : '0.07';

  return svg
      // var(--ew-accent, #f5b820) → accent
      .replaceAll(
        RegExp(r'var\(--ew-accent[^)]*\)'),
        accentHex,
      )
      // var(--ew-bg, currentColor) → bg or ink
      .replaceAll(
        RegExp(r'var\(--ew-bg[^)]*\)'),
        bgHex,
      )
      // var(--ew-bg-opacity, 0.07) → opacity literal
      .replaceAll(
        RegExp(r'var\(--ew-bg-opacity[^)]*\)'),
        bgOpacity,
      )
      // currentColor → ink (must come last so we don't double-replace)
      .replaceAll('currentColor', inkHex);
}

// ── splash overlay ──────────────────────────────────────────────────────

/// Five gold particles emitted from the spark's centre (~19.6, 5.5 in SVG
/// user units = upper-right of the 24×24 viewBox). Each has its own
/// trajectory + opacity curve.
class _SplashOverlay extends StatelessWidget {
  const _SplashOverlay({required this.t, required this.color, required this.size});

  /// 0..1 motion progress.
  final double t;
  final Color color;
  final double size;

  // (translateX, translateY, peakOpacity, finalScale) — in SVG user units.
  static const List<List<double>> _particles = [
    [8,   -10, 1.0, 0.4],
    [11,  -3,  1.0, 0.4],
    [2,   -12, 1.0, 0.4],
    [12,  3,   1.0, 0.4],
    [-5,  -10, 1.0, 0.4],
  ];

  @override
  Widget build(BuildContext context) {
    if (t == 0) return const SizedBox.shrink();

    // 1 SVG unit ≈ size/24 logical pixels.
    final scale = size / 24;
    // Spark centre in SVG units → pixel coords inside the SizedBox.
    final originX = 19.6 * scale;
    final originY = 5.5  * scale;

    return Positioned.fill(
      child: IgnorePointer(
        child: Stack(
          clipBehavior: Clip.none,
          children: List.generate(_particles.length, (i) {
            final p = _particles[i];
            final dx = p[0] * scale;
            final dy = p[1] * scale;
            final particleSize = _particleSize(i) * scale;

            // 0..1 → 0..1 (pop-in 0-10%, shoot-out 10-100%).
            final localT = t.clamp(0.0, 1.0);
            final pop = (localT / 0.1).clamp(0.0, 1.0);            // 0..1 in 0-10%
            final shoot = ((localT - 0.1) / 0.9).clamp(0.0, 1.0);  // 0..1 in 10-100%

            final scaleAt = pop < 1
                ? 1.6 * Curves.easeOut.transform(pop)
                : 1.6 - (1.6 - 0.4) * Curves.easeOut.transform(shoot);
            final opacity = pop < 1 ? pop : (1 - shoot);

            return Positioned(
              left: originX + dx * shoot - particleSize / 2,
              top:  originY + dy * shoot - particleSize / 2,
              child: Opacity(
                opacity: opacity.clamp(0.0, 1.0),
                child: Transform.scale(
                  scale: scaleAt,
                  child: Container(
                    width: particleSize,
                    height: particleSize,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  // Particle radii in SVG user units (matches r="0.9", "0.75", … in the SVG).
  static double _particleSize(int i) {
    const sizes = [1.8, 1.5, 1.7, 1.4, 1.6];
    return sizes[i];
  }
}
