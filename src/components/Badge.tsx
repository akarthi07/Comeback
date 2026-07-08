import { View, StyleSheet } from 'react-native';
import { palette } from '../theme';
import { Text } from './Text';

type Tone = 'neutral' | 'orange' | 'green' | 'amber' | 'red';

const color: Record<Tone, string> = {
  neutral: palette.textMid,
  orange: palette.orange,
  green: palette.green,
  amber: palette.amber,
  red: palette.red,
};

/** Minimal status marker: a small dot + colored label. No filled pill. */
export function Badge({ label, tone = 'neutral', dot = true }: { label: string; tone?: Tone; dot?: boolean }) {
  return (
    <View style={styles.row}>
      {dot && <View style={[styles.dot, { backgroundColor: color[tone] }]} />}
      <Text variant="label" style={{ color: color[tone] }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
