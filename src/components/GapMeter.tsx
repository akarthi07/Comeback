import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { palette, radius, spacing, tabularNums } from '../theme';
import { Text } from './Text';

interface Props {
  physical: number; // 0..100
  confidence: number; // 0..100
}

/**
 * The readiness gap: a thin 0–100 rail with two hairline markers (physical =
 * green, confidence = orange) and a faint band between them. Flat and quiet —
 * the number carries the weight, not decoration.
 */
export function GapMeter({ physical, confidence }: Props) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const lo = Math.min(physical, confidence);
  const hi = Math.max(physical, confidence);
  const gap = Math.round(hi - lo);
  const x = (v: number) => (w * v) / 100;

  return (
    <View>
      <Text variant="label" tone="mid">Readiness gap</Text>
      <View style={styles.gapRow}>
        <Text variant="display" style={tabularNums}>{gap}</Text>
        <Text variant="title" tone="mid" style={styles.pts}>pts apart</Text>
      </View>

      <View style={styles.rail} onLayout={onLayout}>
        {w > 0 && (
          <>
            <View style={[styles.band, { left: x(lo), width: x(hi) - x(lo) }]} />
            <View style={[styles.marker, { left: x(confidence) - 1, backgroundColor: palette.orange }]} />
            <View style={[styles.marker, { left: x(physical) - 1, backgroundColor: palette.green }]} />
          </>
        )}
      </View>

      <View style={styles.legend}>
        <LegendItem color={palette.green} label="Physical" value={physical} />
        <LegendItem color={palette.orange} label="Confidence" value={confidence} />
      </View>
    </View>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="body" tone="mid">{label}</Text>
      <Text variant="bodyStrong" style={[styles.legendVal, tabularNums]}>{Math.round(value)}</Text>
    </View>
  );
}

const RAIL_H = 6;
const styles = StyleSheet.create({
  gapRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2, marginBottom: spacing.lg },
  pts: { marginLeft: 8 },
  rail: {
    height: RAIL_H,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  band: { position: 'absolute', top: 0, bottom: 0, backgroundColor: palette.amberSoft },
  marker: { position: 'absolute', width: 2, height: RAIL_H + 8, top: -4, borderRadius: 1 },
  legend: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  legendVal: { marginLeft: 8 },
});
