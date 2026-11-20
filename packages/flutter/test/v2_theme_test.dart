// Retain Flutter 3.35 compatibility before the material_ui package split.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:magnolia_ui/magnolia_v2.dart';

void main() {
  test(
    'v2 theme uses the exported semantic roles in every mode and density',
    () {
      for (final compact in [false, true]) {
        for (final theme in [
          MagnoliaV2Theme.dark(compact: compact),
          MagnoliaV2Theme.light(compact: compact),
        ]) {
          final tokens = theme.extension<MagnoliaV2>()!;
          expect(theme.scaffoldBackgroundColor, tokens.colors['color/bg/base']);
          expect(
            theme.colorScheme.primary,
            tokens.colors['color/bg/accent-strong'],
          );
          expect(theme.textTheme.bodyLarge!.fontFamily, 'Roboto');
          expect(theme.textTheme.bodyLarge!.fontSize, compact ? 13 : 15);
          expect(tokens.density['size/control'], compact ? 32 : 44);
          expect(
            theme.filledButtonTheme.style!.minimumSize!.resolve({})!.height,
            greaterThanOrEqualTo(44),
          );
          expect(theme.tabBarTheme.indicator, isA<BoxDecoration>());
          expect(
            theme.filledButtonTheme.style!.side!.resolve({
              WidgetState.focused,
            })!.width,
            2,
          );
          expect(
            theme.filledButtonTheme.style!.backgroundColor!.resolve({
              WidgetState.disabled,
            })!.a,
            closeTo(0.4, 0.01),
          );
        }
      }
    },
  );
}
