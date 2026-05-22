// GENERATED FILE — do not edit. See scripts/generate.dart.
import 'package:flutter/widgets.dart';
import '../ew_icon_base.dart';
import '../types.dart';

const String _svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ew-icon" data-motion="pop">
  <g class="ew-chrome">
    <path class="ew-backdrop" fill="var(--ew-bg, currentColor)" fill-opacity="var(--ew-bg-opacity, 0.07)"
          d="M12 1.6 C 18 2.4  22.4 6.4  22.4 12  C 22.4 17.6 18 22  12 22.4
             C 6 22  1.6 17.6  1.6 12  C 1.6 6.4  6 2.4  12 1.6 Z"/>
    <path fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.45"
          stroke-dasharray="0.4 1.8" stroke-linecap="round"
          d="M12 3.2 C 17.2 3.9  20.8 7.2  20.8 12  C 20.8 16.8 17.2 20.4 12 20.8
             C 6.8 20.4 3.2 16.8 3.2 12  C 3.2 7.2  6.8 3.9  12 3.2 Z"/>
    <path class="ew-spark" fill="var(--ew-accent, #f5b820)"
          d="M18.5 3.4 C 20.4 3.4  21.6 4.8  21.4 6.6
             C 21.2 7.4  20.4 7.7  19.4 7.5
             C 18.4 7.2  17.6 6.4  17.6 5.4
             C 17.6 4.4  18 3.8  18.5 3.4 Z"/>
    <g class="ew-splash" aria-hidden="true">
      <circle class="ew-p1" cx="19.6" cy="5.5" r="0.9" fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p2" cx="19.6" cy="5.5" r="0.75" fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p3" cx="19.6" cy="5.5" r="0.85"  fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p4" cx="19.6" cy="5.5" r="0.7"  fill="var(--ew-accent, #f5b820)"/>
      <circle class="ew-p5" cx="19.6" cy="5.5" r="0.8"  fill="var(--ew-accent, #f5b820)"/>
    </g>
  </g>

  <g class="ew-glyph" transform="translate(12 12.5) scale(0.5) translate(-12 -12)">
    <g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21s-7-7.5-7-12.4a7 7 0 0 1 14 0C19 13.5 12 21 12 21Z"/>
        <circle cx="12" cy="9" r="2.6"/>
      </g>
  </g>
</svg>
''';

class EwLocation extends StatelessWidget {
  const EwLocation({
    super.key,
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

  final double size;
  final Color? color;
  final Color? accent;
  final Color? bg;
  final bool plain;
  final bool noPetal;
  final EwMotion motion;
  final Duration? speed;
  final Duration? delay;
  final EwTrigger trigger;
  final int iter;
  final EwIconController? controller;
  final VoidCallback? onPlay;

  @override
  Widget build(BuildContext context) => EwIconBase(
        svg: _svg,
        size: size,
        color: color,
        accent: accent,
        bg: bg,
        plain: plain,
        noPetal: noPetal,
        motion: motion,
        speed: speed,
        delay: delay,
        trigger: trigger,
        iter: iter,
        controller: controller,
        onPlay: onPlay,
      );
}
