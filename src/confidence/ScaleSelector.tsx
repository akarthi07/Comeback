import { View, StyleSheet, Pressable } from 'react-native';
import { palette, radius, spacing } from '../theme';
import { Text } from '../components';
import { RESPONSE_STEPS, SCALE_ANCHORS } from '../../shared/scales/aclRsi';

interface Props {
  value: number | null;
  onChange: (v: number) => void;
}

/**
 * The ACL-RSI response scale: 0–100 in 10-point steps, "Not at all" →
 * "Extremely". A row of tappable bars that fill up to the chosen value, with the
 * selected step raised. Directionality is handled by scoring, not the UI, so the
 * anchors are the same for every question.
 */
export function ScaleSelector({ value, onChange }: Props) {
  return (
    <View>
      <View style={styles.scale}>
        {RESPONSE_STEPS.map((v) => {
          const filled = value !== null && v <= value;
          const selected = v === value;
          return (
            <Pressable
              key={v}
              onPress={() => onChange(v)}
              hitSlop={6}
              style={[styles.tick, filled && styles.tickOn, selected && styles.tickSel]}
            />
          );
        })}
      </View>
      <View style={styles.anchors}>
        <Text variant="caption" tone="low">{SCALE_ANCHORS.low}</Text>
        <Text variant="caption" tone="low">{SCALE_ANCHORS.high}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scale: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 48 },
  tick: {
    flex: 1,
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
  },
  tickOn: { backgroundColor: palette.greenSoft },
  tickSel: { height: 48, backgroundColor: palette.green },
  anchors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
