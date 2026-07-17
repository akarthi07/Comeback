/**
 * Comeback design tokens — v2, "fintech-flat".
 *
 * Reference aesthetic (Polymarket-style): true near-black, cards that are
 * barely-there, an almost fully MONOCHROME palette. There is exactly ONE accent
 * color — a calm green — used sparingly for positive values, the active state,
 * and "ready". Everything else (secondary data, gaps, confidence) is greyscale
 * so the one green reads as intentional. No orange, no shadows, no glows, no
 * soft-color chip fills, no heavy uppercase tracking. Typography is Inter.
 */

/**
 * IBM Plex families loaded at startup (see App.tsx useFonts).
 * Plex Sans for all UI text; Plex Mono for numeric/data readouts (angles,
 * scores) — the mono numerals give an instrument-panel precision. Plex tops out
 * at 700 (Bold), so `extrabold` maps to Bold.
 */
export const fonts = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',
  extrabold: 'IBMPlexSans_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',
} as const;

export const palette = {
  // base — flat, true near-black
  ink: '#0A0B0D', // app background
  surface: '#131519', // cards / panels (barely lighter than bg)
  surfaceAlt: '#1B1E23', // inputs, pressed, search
  hairline: '#24272E', // 1px borders + dividers

  // text
  textHi: '#F4F5F7',
  textMid: '#8B909A',
  textLow: '#565A62',

  // THE accent — a calm green, used sparingly. Not neon.
  green: '#34C77B',
  greenDeep: '#26965C',
  red: '#E5484D', // negative values only

  // Legacy names kept so nothing breaks — deliberately neutralised to greys so
  // any stray reference stays monochrome. Do NOT use these for new work; the
  // only real accent is `green`.
  orange: '#8B909A',
  orangeDeep: '#565A62',
  amber: '#8B909A',

  // very-low-alpha tints — ONLY for chart fills / a single subtle band.
  greenSoft: 'rgba(52,199,123,0.12)',
  orangeSoft: 'rgba(255,255,255,0.05)',
  amberSoft: 'rgba(255,255,255,0.05)',
  redSoft: 'rgba(229,72,77,0.10)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  x2: 24,
  x3: 32,
  x4: 40,
  x5: 56,
} as const;

/**
 * Corner radii — deliberately SMALL. Institutional/terminal software is squared,
 * not rounded. Pills read as consumer/playful, so buttons use `md`, not `pill`.
 */
export const radius = {
  sm: 3,
  md: 5,
  lg: 7,
  xl: 8,
  pill: 999,
} as const;

/**
 * Type scale. With custom fonts the weight is baked into the family, so entries
 * carry fontFamily (not fontWeight). Tight negative tracking on the big sizes is
 * what makes it read "designed" rather than default.
 */
export const type = {
  // Big numbers stay tight but not exaggerated — restrained, not "designed".
  display: { fontFamily: fonts.bold, fontSize: 38, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.semibold, fontSize: 24, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.semibold, fontSize: 19, letterSpacing: -0.2 },
  title: { fontFamily: fonts.semibold, fontSize: 15.5, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 15, letterSpacing: 0 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: 0 },
  // Eyebrow micro-label: UPPERCASE + positive tracking. This is the single
  // strongest "professional/institutional" typographic signal.
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  caption: { fontFamily: fonts.regular, fontSize: 13, letterSpacing: 0 },
} as const;

/**
 * Data numerals. Applied to every stat/measurement so numbers render in IBM
 * Plex Mono — fixed-width, non-jittering, instrument-panel precise. Because
 * it's passed via the `style` prop it overrides the variant's family, so any
 * `<Text variant="display" style={tabularNums}>` number becomes mono while
 * word headlines (no tabularNums) stay in Plex Sans.
 */
export const tabularNums = {
  fontFamily: fonts.monoMedium,
  fontVariant: ['tabular-nums' as const],
};

export const theme = { palette, spacing, radius, type, tabularNums, fonts } as const;
export type Theme = typeof theme;
