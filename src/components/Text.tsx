import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { palette, type as typeScale, fonts } from '../theme';

type Variant = keyof typeof typeScale;
type Tone = 'hi' | 'mid' | 'low' | 'orange' | 'green' | 'amber' | 'red';

const toneColor: Record<Tone, string> = {
  hi: palette.textHi,
  mid: palette.textMid,
  low: palette.textLow,
  orange: palette.orange,
  green: palette.green,
  amber: palette.amber,
  red: palette.red,
};

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  uppercase?: boolean;
  center?: boolean;
  mono?: boolean;
}

/** The only text component. Everything goes through the type scale + tone system. */
export function Text({
  variant = 'body',
  tone = 'hi',
  uppercase,
  center,
  mono,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        typeScale[variant],
        { color: toneColor[tone] },
        uppercase && styles.upper,
        center && styles.center,
        mono && styles.mono,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  upper: { textTransform: 'uppercase' },
  center: { textAlign: 'center' },
  mono: { fontFamily: fonts.monoMedium },
});
