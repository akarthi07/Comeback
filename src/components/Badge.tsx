import { View, StyleSheet } from 'react-native';
import { palette, radius, spacing } from '../theme';
import { Text } from './Text';

type Tone = 'neutral' | 'orange' | 'green' | 'amber' | 'red';

const map: Record<Tone, { bg: string; fg: 'mid' | 'orange' | 'green' | 'amber' | 'red' }> = {
  neutral: { bg: palette.surfaceAlt, fg: 'mid' },
  orange: { bg: palette.orangeSoft, fg: 'orange' },
  green: { bg: palette.greenSoft, fg: 'green' },
  amber: { bg: palette.amberSoft, fg: 'amber' },
  red: { bg: palette.redSoft, fg: 'red' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const c = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text variant="label" tone={c.fg} uppercase style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, letterSpacing: 0.8 },
});
