// Keep compatibility with Flutter 3.35 before the material_ui split.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:magnolia_ui/magnolia_ui.dart';

void main() {
  test('Material brightness and legacy palette remain paired', () {
    final light = MagnoliaTheme.light();
    final dark = MagnoliaTheme.dark();
    expect(light.brightness, Brightness.light);
    expect(dark.brightness, Brightness.dark);
    expect(light.colorScheme.primary, const Color(0xff350868));
    expect(dark.colorScheme.primary, const Color(0xffb59aff));
    expect(
      dark.extension<MagnoliaFrc>()!.blueAlliance,
      const Color(0xff364077),
    );
    expect(light.useMaterial3, isTrue);
  });
  test('FRC extension supports interpolation and overrides', () {
    final a = MagnoliaFrc.forBrightness(Brightness.light);
    final b = MagnoliaFrc.forBrightness(Brightness.dark);
    expect(a.lerp(b, 0).redAlliance, a.redAlliance);
    expect(a.lerp(b, 1).blueAlliance, b.blueAlliance);
    expect(a.copyWith(redAlliance: Colors.red).redAlliance, Colors.red);
  });
  testWidgets('Native controls remain usable at 200% text scale', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: MagnoliaTheme.light(),
        home: MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: Scaffold(
            body: ListView(
              children: [
                FilledButton(onPressed: () {}, child: const Text('Continue')),
                const TextField(
                  decoration: InputDecoration(labelText: 'Team name'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.text('Continue'), findsOneWidget);
  });
}
