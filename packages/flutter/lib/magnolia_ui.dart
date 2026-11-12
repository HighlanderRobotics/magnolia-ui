library;

// Keep compatibility with Flutter 3.35 before the material_ui split.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'src/tokens.g.dart';
export 'src/tokens.g.dart';

@immutable
class MagnoliaFrc extends ThemeExtension<MagnoliaFrc> {
  const MagnoliaFrc({
    required this.redAlliance,
    required this.onRedAlliance,
    required this.blueAlliance,
    required this.onBlueAlliance,
  });
  final Color redAlliance;
  final Color onRedAlliance;
  final Color blueAlliance;
  final Color onBlueAlliance;

  factory MagnoliaFrc.forBrightness(Brightness brightness) {
    final colors = brightness == Brightness.dark
        ? magnoliaDarkFrc
        : magnoliaLightFrc;
    return MagnoliaFrc(
      redAlliance: colors['redAlliance']!,
      onRedAlliance: colors['onRedAlliance']!,
      blueAlliance: colors['blueAlliance']!,
      onBlueAlliance: colors['onBlueAlliance']!,
    );
  }
  @override
  MagnoliaFrc copyWith({
    Color? redAlliance,
    Color? onRedAlliance,
    Color? blueAlliance,
    Color? onBlueAlliance,
  }) => MagnoliaFrc(
    redAlliance: redAlliance ?? this.redAlliance,
    onRedAlliance: onRedAlliance ?? this.onRedAlliance,
    blueAlliance: blueAlliance ?? this.blueAlliance,
    onBlueAlliance: onBlueAlliance ?? this.onBlueAlliance,
  );
  @override
  MagnoliaFrc lerp(covariant MagnoliaFrc? other, double t) => other == null
      ? this
      : MagnoliaFrc(
          redAlliance: Color.lerp(redAlliance, other.redAlliance, t)!,
          onRedAlliance: Color.lerp(onRedAlliance, other.onRedAlliance, t)!,
          blueAlliance: Color.lerp(blueAlliance, other.blueAlliance, t)!,
          onBlueAlliance: Color.lerp(onBlueAlliance, other.onBlueAlliance, t)!,
        );
}

abstract final class MagnoliaTheme {
  static ThemeData light({bool compact = false, String? fontFamily}) =>
      _build(magnoliaLightColorScheme, compact, fontFamily);
  static ThemeData dark({bool compact = false, String? fontFamily}) =>
      _build(magnoliaDarkColorScheme, compact, fontFamily);
  static ThemeData _build(
    ColorScheme scheme,
    bool compact,
    String? fontFamily,
  ) {
    final density = compact
        ? magnoliaCompactDensity
        : magnoliaComfortableDensity;
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(density['radius']!),
    );
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      fontFamily: fontFamily ?? magnoliaFontFamily,
      visualDensity: compact ? VisualDensity.compact : VisualDensity.standard,
      materialTapTargetSize: MaterialTapTargetSize.padded,
    );
    return base.copyWith(
      scaffoldBackgroundColor: scheme.surface,
      extensions: [MagnoliaFrc.forBrightness(scheme.brightness)],
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: shape,
          minimumSize: const Size(48, 48),
          padding: EdgeInsets.symmetric(
            horizontal: density['paddingX']!,
            vertical: density['paddingY']!,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: shape,
          minimumSize: const Size(48, 48),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          shape: shape,
          minimumSize: const Size(48, 48),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surfaceContainerHighest,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(density['radius']!),
        ),
        contentPadding: EdgeInsets.symmetric(
          horizontal: magnoliaSpacingMd,
          vertical: density['paddingY']!,
        ),
      ),
    );
  }
}
