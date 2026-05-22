// Reads every SVG from ../src/svg/*.svg and emits a Dart widget per icon
// under lib/src/icons/. Each widget is a 10-line wrapper around EwIconBase
// — the SVG XML is inlined as a string constant so the package is fully
// self-contained (no runtime asset loading).
//
// Also writes lib/src/icons/icons.dart (the barrel) and updates the
// default-motion picker so a heart with no explicit `motion:` arg uses
// EwMotion.pop (matching its data-motion="pop" attribute in the SVG).
//
// Run from inside the flutter/ folder:
//
//   dart run scripts/generate.dart

import 'dart:io';

void main() {
  final svgDir = Directory('../src/svg').absolute;
  if (!svgDir.existsSync()) {
    stderr.writeln('SVG source dir not found at ${svgDir.path}');
    exit(2);
  }
  final outDir = Directory('lib/src/icons');
  if (outDir.existsSync()) {
    outDir.deleteSync(recursive: true);
  }
  outDir.createSync(recursive: true);

  final files = svgDir
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.svg'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  final exports = <String>[];
  for (final f in files) {
    final name = f.uri.pathSegments.last.replaceAll('.svg', '');
    final pascal = 'Ew${_toPascal(name)}';
    final svgXml = f.readAsStringSync();
    final motion = _detectMotion(svgXml);

    // Build the per-icon Dart file.
    final dart = _iconTemplate(
      pascal: pascal,
      svgXml: svgXml,
      defaultMotion: motion,
    );
    File('${outDir.path}/${_snakeCase(name)}.dart').writeAsStringSync(dart);
    exports.add('${_snakeCase(name)}.dart');
  }

  // Barrel.
  final barrel = StringBuffer()
    ..writeln('// GENERATED FILE — do not edit. See scripts/generate.dart.')
    ..writeln();
  for (final e in exports) {
    barrel.writeln("export '$e';");
  }
  File('${outDir.path}/icons.dart').writeAsStringSync(barrel.toString());

  stdout.writeln('Wrote ${files.length} Dart icons → ${outDir.path}/');
}

String _iconTemplate({
  required String pascal,
  required String svgXml,
  required String defaultMotion,
}) {
  // Escape backticks/dollar/backslash for Dart string literal.
  final escaped = svgXml
      .replaceAll(r'\', r'\\')
      .replaceAll(r'$', r'\$')
      .replaceAll("'''", r"\'\'\'");
  return '''// GENERATED FILE — do not edit. See scripts/generate.dart.
import 'package:flutter/widgets.dart';
import '../ew_icon_base.dart';
import '../types.dart';

const String _svg = \'\'\'$escaped\'\'\';

class $pascal extends StatelessWidget {
  const $pascal({
    super.key,
    this.size = 24,
    this.color,
    this.accent,
    this.bg,
    this.plain = false,
    this.noPetal = false,
    this.motion = $defaultMotion,
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
''';
}

String _detectMotion(String svgXml) {
  final match = RegExp(r'data-motion="([^"]+)"').firstMatch(svgXml);
  final raw = match?.group(1);
  switch (raw) {
    case 'pop':      return 'EwMotion.pop';
    case 'tilt':     return 'EwMotion.tilt';
    case 'shake':    return 'EwMotion.shake';
    case 'swing':    return 'EwMotion.swing';
    case 'spin':     return 'EwMotion.spin';
    case 'slide-r':  return 'EwMotion.slideRight';
    case 'slide-l':  return 'EwMotion.slideLeft';
    case 'slide-u':  return 'EwMotion.slideUp';
    case 'slide-d':  return 'EwMotion.slideDown';
    case 'flip':     return 'EwMotion.flip';
    case 'pulse':    return 'EwMotion.pop'; // pulse is a subtle pop — re-use
    default:         return 'EwMotion.pop';  // safe default
  }
}

String _toPascal(String kebab) =>
    kebab.split('-').map((s) => s[0].toUpperCase() + s.substring(1)).join();

String _snakeCase(String kebab) => kebab.replaceAll('-', '_');
