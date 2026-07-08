/**
 * Comeback design tokens — v2, "fintech-flat".
 *
 * Reference aesthetic: true near-black, cards that are barely-there, a mostly
 * monochrome palette where the accent (orange) shows up ONLY on the primary
 * action / active state, green for positive values, red for negative. No
 * shadows, no glows, no soft-color chip fills, no heavy uppercase tracking.
 * Typography is Inter — a tight professional grotesk.
 */

/** Inter families loaded at startup (see App.tsx useFonts). */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
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

  // accent — used sparingly
  orange: '#FF6A3D',
  orangeDeep: '#E85A2E',
  green: '#3DDC97',
  amber: '#F5A524',
  red: '#FF5A5F',

  // very-low-alpha tints — ONLY for chart fills / a single subtle bar.
  // Not for chip backgrounds (that's the bubbly look we're removing).
  orangeSoft: 'rgba(255,106,61,0.10)',
  greenSoft: 'rgba(61,220,151,0.10)',
  amberSoft: 'rgba(245,165,36,0.12)',
  redSoft: 'rgba(255,90,95,0.10)',
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

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/**
 * Type scale. With custom fonts the weight is baked into the family, so entries
 * carry fontFamily (not fontWeight). Tight negative tracking on the big sizes is
 * what makes it read "designed" rather than default.
 */
export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 40, letterSpacing: -1.2 },
  h1: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.semibold, fontSize: 20, letterSpacing: -0.4 },
  title: { fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: -0.1 },
  label: { fontFamily: fonts.medium, fontSize: 12.5, letterSpacing: 0 },
  caption: { fontFamily: fonts.regular, fontSize: 13, letterSpacing: 0 },
} as const;

/** Tabular numerals — use on any stat that changes so it doesn't jitter. */
export const tabularNums = { fontVariant: ['tabular-nums' as const] };

export const theme = { palette, spacing, radius, type, tabularNums, fonts } as const;
export type Theme = typeof theme;
