library;

// Retain Flutter 3.35 compatibility before the material_ui package split.
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'src/v2_tokens.g.dart';
export 'src/v2_tokens.g.dart';

/// The semantic v2 colors and density values, including roles Material omits.
@immutable
class MagnoliaV2 extends ThemeExtension<MagnoliaV2> {
  const MagnoliaV2({required this.colors, required this.density});
  final Map<String, Color> colors;
  final Map<String, double> density;
  factory MagnoliaV2.forMode(Brightness brightness, {bool compact = false}) =>
      MagnoliaV2(
        colors: brightness == Brightness.dark
            ? magnoliaV2DarkColors
            : magnoliaV2LightColors,
        density: compact
            ? magnoliaV2CompactDensity
            : magnoliaV2ComfortableDensity,
      );
  @override
  MagnoliaV2 copyWith({
    Map<String, Color>? colors,
    Map<String, double>? density,
  }) => MagnoliaV2(
    colors: colors ?? this.colors,
    density: density ?? this.density,
  );
  @override
  MagnoliaV2 lerp(covariant MagnoliaV2? other, double t) {
    if (other == null) return this;
    return MagnoliaV2(
      colors: {
        for (final key in colors.keys)
          key: Color.lerp(colors[key], other.colors[key], t)!,
      },
      density: {
        for (final key in density.keys)
          key: density[key]! + (other.density[key]! - density[key]!) * t,
      },
    );
  }
}

/// Opt-in Material adapter. Product widgets can read [MagnoliaV2] for exact roles.
abstract final class MagnoliaV2Theme {
  static ThemeData dark({bool compact = false, String fontFamily = 'Roboto'}) =>
      _build(Brightness.dark, compact, fontFamily);
  static ThemeData light({
    bool compact = false,
    String fontFamily = 'Roboto',
  }) => _build(Brightness.light, compact, fontFamily);
  static ThemeData _build(
    Brightness brightness,
    bool compact,
    String fontFamily,
  ) {
    final tokens = MagnoliaV2.forMode(brightness, compact: compact);
    final c = tokens.colors, s = tokens.density;
    final scheme =
        ColorScheme.fromSeed(
          seedColor: c['color/bg/accent-strong']!,
          brightness: brightness,
        ).copyWith(
          primary: c['color/bg/accent-strong'],
          onPrimary: c['color/fg/on-accent'],
          primaryContainer: c['color/bg/accent-subtle'],
          onPrimaryContainer: c['color/fg/accent'],
          secondary: c['color/bg/control'],
          onSecondary: c['color/fg/primary'],
          secondaryContainer: c['color/bg/selected'],
          onSecondaryContainer: c['color/fg/primary'],
          surface: c['color/bg/base'],
          onSurface: c['color/fg/primary'],
          surfaceContainer: c['color/bg/raised'],
          surfaceContainerHighest: c['color/bg/overlay'],
          onSurfaceVariant: c['color/fg/secondary'],
          outline: c['color/border/default'],
          outlineVariant: c['color/border/subtle'],
          error: c['color/fg/danger'],
          errorContainer: c['color/bg/danger-subtle'],
          onErrorContainer: c['color/fg/danger'],
          surfaceTint: Colors.transparent,
        );
    TextStyle type(String name, {FontWeight weight = FontWeight.w400}) =>
        TextStyle(
          fontFamily: fontFamily,
          fontSize: s['type/$name/size'],
          height: s['type/$name/line']! / s['type/$name/size']!,
          fontWeight: weight,
          color: c['color/fg/primary'],
        );
    final radius = BorderRadius.circular(s['radius/control']!);
    OutlineInputBorder border(Color color) => OutlineInputBorder(
      borderRadius: radius,
      borderSide: BorderSide(color: color),
    );
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      fontFamily: fontFamily,
    );
    final button = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(
        Size(44, s['size/control']!.clamp(44, double.infinity)),
      ),
      padding: WidgetStatePropertyAll(
        EdgeInsets.symmetric(horizontal: s['pad/control-x']!, vertical: 8),
      ),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(borderRadius: radius),
      ),
      textStyle: WidgetStatePropertyAll(type('label', weight: FontWeight.w500)),
      elevation: const WidgetStatePropertyAll(0),
      overlayColor: const WidgetStatePropertyAll(Colors.transparent),
      backgroundColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.disabled)
            ? c['color/bg/accent-strong']!.withValues(alpha: 0.4)
            : c[states.contains(WidgetState.pressed)
                  ? 'color/bg/primary-press'
                  : states.contains(WidgetState.hovered)
                  ? 'color/bg/primary-hover'
                  : 'color/bg/accent-strong'],
      ),
      foregroundColor: WidgetStateProperty.resolveWith(
        (states) => c['color/fg/on-accent']!.withValues(
          alpha: states.contains(WidgetState.disabled) ? 0.4 : 1,
        ),
      ),
      side: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.focused)
            ? BorderSide(color: c['color/border/focus']!, width: 2)
            : BorderSide.none,
      ),
    );
    return base.copyWith(
      extensions: [tokens],
      scaffoldBackgroundColor: c['color/bg/base'],
      disabledColor: c['color/fg/disabled'],
      textTheme: base.textTheme.copyWith(
        displayLarge: type('display', weight: FontWeight.w500),
        titleLarge: type('title/lg', weight: FontWeight.w500),
        titleMedium: type('title/md', weight: FontWeight.w500),
        titleSmall: type('title/sm', weight: FontWeight.w500),
        bodyLarge: type('body'),
        bodyMedium: type('body/sm'),
        bodySmall: type('caption'),
        labelLarge: type('label', weight: FontWeight.w500),
        labelMedium: type('label/sm', weight: FontWeight.w500),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: c['color/bg/base'],
        foregroundColor: c['color/fg/primary'],
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      filledButtonTheme: FilledButtonThemeData(style: button),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c['color/bg/field'],
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        border: border(c['color/border/default']!),
        enabledBorder: border(c['color/border/default']!),
        focusedBorder: border(c['color/border/focus']!),
        errorBorder: border(c['color/border/danger']!),
        focusedErrorBorder: border(c['color/border/danger']!),
        disabledBorder: border(c['color/border/field-disabled']!),
        hintStyle: type('body').copyWith(color: c['color/fg/tertiary']),
        labelStyle: type('label/sm', weight: FontWeight.w500),
      ),
      dividerTheme: DividerThemeData(
        color: c['color/border/subtle'],
        thickness: 1,
      ),
      tabBarTheme: TabBarThemeData(
        dividerColor: Colors.transparent,
        labelColor: c['color/fg/primary'],
        unselectedLabelColor: c['color/fg/secondary'],
        labelStyle: type('label', weight: FontWeight.w500),
        unselectedLabelStyle: type('body'),
        indicatorSize: TabBarIndicatorSize.tab,
        indicator: BoxDecoration(
          color: c['color/bg/selected'],
          borderRadius: radius,
        ),
      ),
    );
  }
}
