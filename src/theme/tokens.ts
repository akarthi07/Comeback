/**
 * Comeback design tokens.
 *
 * One source of truth for the look: a dark, cinematic "night training facility"
 * aesthetic. Mostly grayscale, with a single hero accent (orange) used sparingly
 * and green reserved for genuine positive signal. No gradients-for-the-sake-of-it,
 * no decoration that isn't carrying information.
 */

export const palette = {
  // base
  ink: '#0B0D10', // app background
  surface: '#15181E', // cards, panels
  surfaceAlt: '#1B1F27', // raised / pressed
  hairline: '#232833', // 1px borders, dividers

  // text
  textHi: '#F4F6FA',
  textMid: '#9AA0AE',
  textLow: '#5B6270',

  // brand
  orange: '#FF6A3D',
  orangeDeep: '#E8542A',
  orangeSoft: 'rgba(255,106,61,0.12)',

  // signal
  green: '#3DDC97',
  greenSoft: 'rgba(61,220,151,0.12)',
  amber: '#F5A524',
  amberSoft: 'rgba(245,165,36,0.12)',
  red: '#FF5A5F',
  redSoft: 'rgba(255,90,95,0.12)',
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
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Type scale. Weights are strings to satisfy RN's fontWeight typing. */
export const type = {
  display: { fontSize: 56, fontWeight: '900', letterSpacing: -1.5 },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '500' },
  bodyStrong: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }, // UPPERCASE
  caption: { fontSize: 12, fontWeight: '500' },
} as const;

/** Tabular numerals — use on any stat that animates/changes so it doesn't jitter. */
export const tabularNums = { fontVariant: ['tabular-nums' as const] };

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }),
} as const;

export const theme = { palette, spacing, radius, type, tabularNums, shadow } as const;
export type Theme = typeof theme;
