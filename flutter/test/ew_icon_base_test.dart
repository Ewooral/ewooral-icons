import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ewooral_icons/ewooral_icons.dart';

void main() {
  group('Generated icons render', () {
    testWidgets('EwHeart mounts cleanly with defaults', (tester) async {
      await tester.pumpWidget(const _Wrap(child: EwHeart()));
      expect(find.byType(EwHeart), findsOneWidget);
      expect(find.byType(EwIconBase), findsOneWidget);
    });

    testWidgets('EwHeart accepts every prop without throwing', (tester) async {
      await tester.pumpWidget(const _Wrap(
        child: EwHeart(
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
      ));
      await tester.pumpAndSettle(const Duration(seconds: 5));
      expect(find.byType(EwHeart), findsOneWidget);
    });

    testWidgets('plain strips chrome without throwing', (tester) async {
      await tester.pumpWidget(const _Wrap(child: EwScissors(plain: true)));
      expect(find.byType(EwScissors), findsOneWidget);
    });
  });

  group('EwIconController', () {
    testWidgets('play() and stop() drive a manual icon', (tester) async {
      final controller = EwIconController();
      var played = 0;
      await tester.pumpWidget(_Wrap(
        child: EwBell(
          trigger: EwTrigger.manual,
          controller: controller,
          onPlay: () => played++,
        ),
      ));
      controller.play();
      await tester.pump();
      expect(played, 1);

      controller.stop();
      await tester.pump();
      // No throw == passing.
    });
  });
}

class _Wrap extends StatelessWidget {
  const _Wrap({required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => MaterialApp(
        home: Scaffold(body: Center(child: child)),
      );
}
