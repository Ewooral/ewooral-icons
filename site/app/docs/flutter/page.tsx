import Link from "next/link";

export const metadata = { title: "Flutter" };

export default function FlutterDocsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose-eo">
      <Link href="/docs" className="label-cap hover:text-[var(--color-accent)] transition">← All docs</Link>

      <header className="mt-6 mb-12 pb-8 border-b border-[var(--color-line)]">
        <p className="label-cap mb-3">Framework guide · Flutter</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
          Using <code className="text-[var(--color-accent)]">ewooral_icons</code> in Flutter
        </h1>
        <p className="text-lg text-[var(--color-ink-dim)] leading-relaxed">
          The Dart port of <a href="https://www.npmjs.com/package/@ewooral/icons" className="text-[var(--color-ink)] underline">@ewooral/icons</a>{" "}
          — same medallion design, same trigger system, same colour layering. 56 widget classes,
          10 motion primitives, splash overlay, full <code>flutter_test</code> coverage recipe at the
          bottom of this page.
        </p>
        <div className="mt-6 flex gap-4 flex-wrap text-sm">
          <a href="https://pub.dev/packages/ewooral_icons" className="text-[var(--color-accent)] hover:underline">📦 pub.dev/packages/ewooral_icons</a>
          <a href="https://github.com/Ewooral/ewooral-icons/tree/main/flutter" className="text-[var(--color-accent)] hover:underline">⌨ GitHub source</a>
        </div>
      </header>

      <Section id="install" title="Install">
        <p>Add to <code>pubspec.yaml</code>:</p>
        <Code lang="yaml">{`dependencies:
  ewooral_icons: ^0.1.0`}</Code>
        <p>Then:</p>
        <Code lang="bash">{`flutter pub get`}</Code>
        <p>That's it. No native setup, no asset registration — the SVGs are inlined as Dart strings inside each widget class.</p>
        <Callout tone="info">
          <strong>Min versions:</strong> Flutter 3.27 / Dart 3.6. Older Flutter versions may work but
          aren't tested.
        </Callout>
      </Section>

      <Section id="quick-start" title="Quick start">
        <Code lang="dart">{`import 'package:ewooral_icons/ewooral_icons.dart';

// Defaults: hover on desktop/web, no-op on touch.
const EwHeart()

// Tap to play on mobile.
const EwBell(trigger: EwTrigger.tap)

// Bigger + custom colours.
const EwStar(size: 48, color: Colors.white, accent: Color(0xFFFF5FA3))

// Plays once when the widget mounts.
const EwScissors(trigger: EwTrigger.mount)

// Loops forever (until you swap out the widget).
const EwGift(motion: EwMotion.spin, iter: 0)`}</Code>
      </Section>

      <Section id="props" title="All props">
        <p>Every generated widget (<code>EwHeart</code>, <code>EwBell</code>, …) accepts:</p>
        <PropsTable rows={[
          ["size",       "double",                "24",           "Width + height in logical pixels."],
          ["color",      "Color?",                "brand ink",    "Glyph + medallion-disc tint (drives currentColor in the SVG)."],
          ["accent",     "Color?",                "#f5b820",      "Petal-ribbon + splash particle colour."],
          ["bg",         "Color?",                "null",         "Disc background. null = subtle 7%-opacity tint of color. Set = solid fill."],
          ["plain",      "bool",                  "false",        "Strip the medallion chrome — glyph only."],
          ["noPetal",    "bool",                  "false",        "Hide the gold petal-ribbon (backdrop + ring stay)."],
          ["motion",     "EwMotion",              "per-icon",     "How the icon moves. See motion vocabulary below."],
          ["speed",      "Duration?",             "700ms",        "Cycle duration. Bigger = slower motion AND longer pause between repeats."],
          ["delay",      "Duration?",             "0",            "Delay before motion starts after the trigger fires."],
          ["trigger",    "EwTrigger",             "hover",        "What fires the animation. See trigger system below."],
          ["iter",       "int",                   "1",            "Play count. 0 = loop forever. Any positive integer plays exactly N times."],
          ["controller", "EwIconController?",     "null",         "Imperative .play() / .stop() handle."],
          ["onPlay",     "VoidCallback?",         "null",         "Fires every time the animation starts (haptics, sound, analytics hook)."],
        ]} />
      </Section>

      <Section id="trigger" title="Trigger system">
        <p>
          Same contract as the web package — what you set in React with <code>trigger=&quot;tap&quot;</code>{" "}
          maps to <code>EwTrigger.tap</code> in Flutter. Six modes:
        </p>
        <PropsTable rows={[
          ["EwTrigger.hover",   "MouseRegion.onEnter",          "Desktop + Flutter web. No-op on mobile (touch has no hover)."],
          ["EwTrigger.tap",     "GestureDetector.onTapDown",    "Every platform. The right default for mobile UIs."],
          ["EwTrigger.focus",   "Focus.onFocusChange",          "Fires when the icon (or its enclosing focus scope) receives focus."],
          ["EwTrigger.mount",   "WidgetsBinding postFrame",     "Fires once as soon as the widget mounts. Great for celebratory flourishes."],
          ["EwTrigger.viewport","VisibilityDetector (v0.2)",    "Stub today — will fire when the icon scrolls into view. Tracked for v0.2."],
          ["EwTrigger.manual",  "EwIconController only",        "Never auto-fires. Use the controller to drive from anywhere."],
        ]} />
        <Callout tone="warn">
          <strong>Mobile gotcha:</strong> If you ship a screen with <code>EwTrigger.hover</code> on
          mobile, the icon will appear static — there's no hover event to fire it. Either set
          <code> EwTrigger.tap</code> explicitly for mobile-first surfaces or rely on a parent
          <code>EwIconController</code> driven by your own logic.
        </Callout>
      </Section>

      <Section id="motions" title="Motion vocabulary">
        <p>Every icon ships with a sensible default motion baked in (e.g. <code>EwHeart</code> → <code>pop</code>). Override with the <code>motion:</code> arg:</p>
        <PropsTable rows={[
          ["EwMotion.pop",        "Quick scale-up + settle. Default for hearts, checks, gifts."],
          ["EwMotion.tilt",       "Whole-icon wobble. Good for cards, tags, badges."],
          ["EwMotion.shake",      "Rapid left-right. Good for alerts, errors."],
          ["EwMotion.swing",      "Pendulum tilt. Default for bells."],
          ["EwMotion.spin",       "Full 360° rotation. Default for refresh, settings, loaders."],
          ["EwMotion.slideRight", "Translate +x. Default for arrow-right, send."],
          ["EwMotion.slideLeft",  "Translate -x. Default for arrow-left."],
          ["EwMotion.slideUp",    "Translate -y. Default for arrow-up, upload."],
          ["EwMotion.slideDown",  "Translate +y. Default for arrow-down, download."],
          ["EwMotion.flip",       "Vertical card flip (rotateY)."],
          ["EwMotion.splash",     "Splash burst only — no whole-icon motion."],
          ["EwMotion.none",       "No motion at all (splash still plays — it's a chrome element)."],
        ]} />
        <Callout tone="info">
          <strong>Compressed keyframes:</strong> Every motion does its real work in the first 35% of
          the cycle and rests for the remaining 65%. So <code>speed: Duration(seconds: 2)</code>
          gives ~0.7s of motion + ~1.3s of stillness — visible pauses between repeats, no extra
          knob needed.
        </Callout>
      </Section>

      <Section id="colors" title="Three colour layers">
        <p>
          The medallion has three independently-coloured surfaces. Mix them for fully-branded chips:
        </p>
        <Code lang="dart">{`// Brand-pinned alert chip — white glyph, rose disc, cream petal.
const EwBell(
  color: Colors.white,
  bg: Color(0xFFC0413A),       // rose disc
  accent: Color(0xFFF5E6A8),   // cream petal
)

// Brand-pinned booking confirmation — dark green disc, gold accents.
const EwCheck(
  bg: Color(0xFF1A3A2A),
  color: Colors.white,
  size: 56,
)`}</Code>
        <p>When <code>bg</code> is null, the disc is a 7%-opacity tint of <code>color</code> (the subtle default look). Setting <code>bg</code> to any colour fills solid.</p>
      </Section>

      <Section id="imperative" title="Imperative controller">
        <p>For trigger-from-anywhere control, pass an <code>EwIconController</code>:</p>
        <Code lang="dart">{`class _MyWidget extends StatefulWidget {
  @override
  State<_MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<_MyWidget> {
  final _bellCtrl = EwIconController();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        EwBell(
          controller: _bellCtrl,
          trigger: EwTrigger.manual,    // never auto-fires
        ),
        FilledButton(
          onPressed: () => _bellCtrl.play(),
          child: const Text('Ring it'),
        ),
        TextButton(
          onPressed: () => _bellCtrl.stop(),
          child: const Text('Stop'),
        ),
      ],
    );
  }
}`}</Code>
        <Callout tone="info">
          <strong>onPlay callback:</strong> Use <code>onPlay: () =&gt; HapticFeedback.lightImpact()</code>{" "}
          to pair every animation with a phone buzz, or to fire an analytics event.
        </Callout>
      </Section>

      <Section id="testing" title="Testing — every case">
        <p>
          Icons are pure <code>StatefulWidget</code>s with an <code>AnimationController</code> — they
          work cleanly under <code>flutter_test</code>. Below are recipes for every common scenario.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>1. The icon mounts</h3>
        <p>The most basic test — verify the widget renders without throwing:</p>
        <Code lang="dart">{`import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ewooral_icons/ewooral_icons.dart';

void main() {
  testWidgets('EwHeart mounts cleanly', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(body: Center(child: EwHeart())),
    ));
    expect(find.byType(EwHeart), findsOneWidget);
    expect(find.byType(EwIconBase), findsOneWidget);
  });
}`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>2. Every prop is accepted (smoke test)</h3>
        <p>Catches accidental API regressions across the full prop surface:</p>
        <Code lang="dart">{`testWidgets('EwHeart accepts every prop without throwing', (tester) async {
  await tester.pumpWidget(const MaterialApp(
    home: Scaffold(
      body: EwHeart(
        size: 48,
        color: Color(0xFFC0413A),
        accent: Color(0xFFF5E6A8),
        bg: Color(0xFF1A3A2A),
        plain: false,
        noPetal: false,
        motion: EwMotion.tilt,
        speed: Duration(milliseconds: 1200),
        delay: Duration(milliseconds: 200),
        trigger: EwTrigger.mount,
        iter: 3,
      ),
    ),
  ));
  // Pump past the full animation (3 iterations × 1.2s + 0.2s delay).
  await tester.pumpAndSettle(const Duration(seconds: 5));
  expect(find.byType(EwHeart), findsOneWidget);
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>3. Tap trigger fires</h3>
        <p>Verify the user gesture path:</p>
        <Code lang="dart">{`testWidgets('tap trigger plays the animation', (tester) async {
  var playCount = 0;

  await tester.pumpWidget(MaterialApp(
    home: Scaffold(
      body: Center(
        child: EwBell(
          trigger: EwTrigger.tap,
          onPlay: () => playCount++,
        ),
      ),
    ),
  ));

  expect(playCount, 0);
  await tester.tap(find.byType(EwBell));
  await tester.pump();
  expect(playCount, 1);

  // Second tap fires a second play.
  await tester.tap(find.byType(EwBell));
  await tester.pump();
  expect(playCount, 2);

  // Pump past the animation so it settles cleanly.
  await tester.pumpAndSettle(const Duration(seconds: 2));
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>4. Manual controller drives play/stop</h3>
        <Code lang="dart">{`testWidgets('EwIconController play() + stop()', (tester) async {
  final controller = EwIconController();
  var played = 0;

  await tester.pumpWidget(MaterialApp(
    home: Scaffold(
      body: EwGift(
        trigger: EwTrigger.manual,
        controller: controller,
        onPlay: () => played++,
      ),
    ),
  ));

  // Manual + no tap = nothing yet.
  expect(played, 0);

  // Programmatic play.
  controller.play();
  await tester.pump();
  expect(played, 1);

  // Stop mid-cycle.
  controller.stop();
  await tester.pump();
  // No throw == passing. \`played\` stays at 1 (we already counted the start).
  expect(played, 1);
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>5. Mount trigger fires exactly once</h3>
        <Code lang="dart">{`testWidgets('mount trigger fires once on first frame', (tester) async {
  var played = 0;

  await tester.pumpWidget(MaterialApp(
    home: Scaffold(
      body: EwSparkle(
        trigger: EwTrigger.mount,
        onPlay: () => played++,
      ),
    ),
  ));
  await tester.pump();           // first frame
  expect(played, 1);

  // No further plays unless we drive it.
  await tester.pumpAndSettle(const Duration(seconds: 2));
  expect(played, 1);
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>6. Verify motion timing (animation lifecycle)</h3>
        <p>
          To inspect the actual animation progress, find the icon's internal{" "}
          <code>AnimationController</code> by reaching into the State. Useful for asserting
          something like "icon scaled up to 1.25× peak":
        </p>
        <Code lang="dart">{`testWidgets('pop motion peaks then settles within speed window', (tester) async {
  await tester.pumpWidget(const MaterialApp(
    home: Scaffold(
      body: EwHeart(
        trigger: EwTrigger.mount,
        speed: Duration(milliseconds: 800),
      ),
    ),
  ));
  await tester.pump(); // mount triggers play

  // Pump to ~50% of the cycle — animation should be mid-motion (Transform applied).
  await tester.pump(const Duration(milliseconds: 400));
  final svgFinder = find.byType(Transform);
  expect(svgFinder, findsWidgets);

  // Pump past 100% — animation settles back to identity.
  await tester.pump(const Duration(milliseconds: 500));
  // No exceptions = animation cleaned up.
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>7. Plain (chrome stripped) renders without the medallion</h3>
        <Code lang="dart">{`testWidgets('plain: true strips chrome without throwing', (tester) async {
  await tester.pumpWidget(const MaterialApp(
    home: Scaffold(body: EwScissors(plain: true)),
  ));
  expect(find.byType(EwScissors), findsOneWidget);
  // The medallion disc + dotted ring + petal + splash particles are absent.
  // The bare glyph SVG path remains.
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>8. Looping motion runs continuously until stopped</h3>
        <Code lang="dart">{`testWidgets('iter: 0 loops forever until stop()', (tester) async {
  final controller = EwIconController();
  var played = 0;

  await tester.pumpWidget(MaterialApp(
    home: Scaffold(
      body: EwStar(
        trigger: EwTrigger.mount,
        motion: EwMotion.spin,
        iter: 0,              // infinite
        speed: Duration(milliseconds: 300),
        controller: controller,
        onPlay: () => played++,
      ),
    ),
  ));
  await tester.pump();
  expect(played, 1);

  // Let it run for ~1s — should re-fire repeatedly.
  await tester.pump(const Duration(milliseconds: 1100));
  expect(played, greaterThan(2));

  // Stop the loop.
  controller.stop();
  final after = played;
  await tester.pump(const Duration(milliseconds: 500));
  expect(played, after);   // no new plays after stop
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>9. Multiple icons in a list (interaction isolation)</h3>
        <p>Sanity-check that tapping one icon doesn't fire another:</p>
        <Code lang="dart">{`testWidgets('tapping one icon does not fire siblings', (tester) async {
  var bellPlayed = 0;
  var heartPlayed = 0;

  await tester.pumpWidget(MaterialApp(
    home: Scaffold(
      body: Row(
        children: [
          EwBell(
            trigger: EwTrigger.tap,
            onPlay: () => bellPlayed++,
          ),
          EwHeart(
            trigger: EwTrigger.tap,
            onPlay: () => heartPlayed++,
          ),
        ],
      ),
    ),
  ));

  await tester.tap(find.byType(EwBell));
  await tester.pump();
  expect(bellPlayed, 1);
  expect(heartPlayed, 0);

  await tester.tap(find.byType(EwHeart));
  await tester.pump();
  expect(bellPlayed, 1);
  expect(heartPlayed, 1);
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>10. Disposal — no leaked timers</h3>
        <p>
          The base widget owns an <code>AnimationController</code> + a delay <code>Timer?</code>.
          Both must be cleaned up on dispose. The fastest way to verify: pump a widget tree that
          contains the icon, then replace it with an empty tree and check no exceptions surface:
        </p>
        <Code lang="dart">{`testWidgets('disposes cleanly mid-animation', (tester) async {
  await tester.pumpWidget(const MaterialApp(
    home: Scaffold(
      body: EwHeart(
        trigger: EwTrigger.mount,
        speed: Duration(seconds: 1),
        delay: Duration(milliseconds: 200),
      ),
    ),
  ));
  await tester.pump();
  // Replace before the animation completes — should NOT throw
  // "A Timer is still pending even after the widget tree was disposed."
  await tester.pumpWidget(const MaterialApp(home: Scaffold(body: SizedBox.shrink())));
  await tester.pump(const Duration(seconds: 2));
});`}</Code>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>11. Golden test (visual regression)</h3>
        <p>
          Capture a pixel-perfect snapshot of the icon at rest and reject silent visual changes.
          Useful when refining the medallion design.
        </p>
        <Code lang="dart">{`testWidgets('EwHeart golden — default', (tester) async {
  await tester.pumpWidget(const MaterialApp(
    home: Scaffold(
      body: Center(child: EwHeart(size: 96)),
    ),
  ));
  await expectLater(
    find.byType(EwHeart),
    matchesGoldenFile('golden/ew_heart_default.png'),
  );
});`}</Code>
        <p>Run <code>flutter test --update-goldens</code> on the first run to generate the baseline. Subsequent runs assert against it.</p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)" }}>12. Run the suite</h3>
        <Code lang="bash">{`flutter test                       # all tests
flutter test --update-goldens      # regenerate golden snapshots
flutter analyze                    # static analysis
dart format --set-exit-if-changed lib test  # format check`}</Code>
      </Section>

      <Section id="tree-shaking" title="Tree-shaking">
        <p>
          Each icon is its own file (<code>lib/src/icons/heart.dart</code>, <code>bell.dart</code>, …).
          Dart's compiler discards unused exports — importing <code>EwHeart</code> alone does not
          pull the other 55 widgets into your app bundle.
        </p>
        <p>
          Verify your release-mode build with <code>flutter build apk --analyze-size</code>{" "}
          or <code>--tree-shake-icons</code> (the latter applies specifically to icon fonts; our
          package uses inline SVG strings so it shakes via the standard mechanism).
        </p>
      </Section>

      <Section id="custom" title="Custom icons via EwIconBase">
        <p>
          The 56 generated widgets are thin wrappers around <code>EwIconBase</code>. To make your own
          medallion icon with custom artwork, pass any compliant SVG string directly:
        </p>
        <Code lang="dart">{`const _myCustomSvg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ew-icon" data-motion="pop">
  <g class="ew-chrome">
    <!-- backdrop disc, dotted ring, petal-ribbon, splash particles — see existing icons -->
  </g>
  <g class="ew-glyph" transform="translate(12 12.5) scale(0.5) translate(-12 -12)">
    <!-- your glyph paths here -->
  </g>
</svg>
''';

class MyBrandIcon extends StatelessWidget {
  const MyBrandIcon({super.key});
  @override
  Widget build(BuildContext context) =>
      const EwIconBase(svg: _myCustomSvg, motion: EwMotion.pop);
}`}</Code>
        <p>
          See <a href="https://github.com/Ewooral/ewooral-icons/tree/main/src/svg" className="text-[var(--color-accent)] hover:underline">the source SVGs</a> for the chrome + glyph template.
        </p>
      </Section>

      <Section id="next" title="What's next">
        <ul className="list-disc pl-6 space-y-1.5 marker:text-[var(--color-accent)]">
          <li>v0.2: <code>EwTrigger.viewport</code> via <code>VisibilityDetector</code></li>
          <li>v0.3: sub-packages — <code>ewooral_icons_salon</code>, <code>_commerce</code>, <code>_medical</code></li>
          <li>v1.0: replace Material <code>Icons.*</code> in <code>ahofe-mobile</code> with EW equivalents</li>
        </ul>
        <p className="mt-6">
          Issues / PRs: <a href="https://github.com/Ewooral/ewooral-icons/issues" className="text-[var(--color-accent)] hover:underline">github.com/Ewooral/ewooral-icons/issues</a>
        </p>
      </Section>
    </article>
  );
}

// ─── Small page-local components ──────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h2>
      <div className="space-y-4 text-[var(--color-ink-dim)] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Code({ lang, children }: { lang: string; children: string }) {
  return (
    <pre className="bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded p-4 overflow-x-auto my-3">
      <code className="text-sm font-mono text-[var(--color-ink)] leading-relaxed whitespace-pre" data-lang={lang}>
        {children}
      </code>
    </pre>
  );
}

function PropsTable({ rows }: { rows: Array<string[]> }) {
  // 4-col table for props (name/type/default/notes) OR 3-col (name/uses/notes) OR 2-col (name/notes).
  const cols = rows[0].length;
  const headers = cols === 4
    ? ["Prop", "Type", "Default", "Notes"]
    : cols === 3
      ? ["Name", "Uses", "Notes"]
      : ["Name", "Notes"];
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-line-strong)]">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-4 label-cap font-normal align-top">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--color-line)] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-3 pr-4 align-top">
                  {j === 0
                    ? <code className="text-[var(--color-accent)] whitespace-nowrap">{cell}</code>
                    : j === 1 && cols >= 3
                      ? <code className="text-[var(--color-ink)] whitespace-nowrap">{cell}</code>
                      : <span className="text-[var(--color-ink-dim)]">{cell}</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ tone, children }: { tone: "info" | "warn"; children: React.ReactNode }) {
  const border = tone === "info" ? "border-[var(--color-accent)]" : "border-[var(--color-rose)]";
  const bg     = tone === "info" ? "bg-[var(--color-bg-2)]" : "bg-[var(--color-bg-2)]";
  return (
    <div className={`my-4 ${bg} border-l-4 ${border} pl-4 py-3 pr-4 rounded`}>
      <div className="text-sm text-[var(--color-ink-dim)] leading-relaxed">{children}</div>
    </div>
  );
}
