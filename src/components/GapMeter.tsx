import { View, StyleSheet, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { palette, radius, spacing, tabularNums } from '../theme';
import { Text } from './Text';

interface Props {
  physical: number; // 0..100 — recovered range / strength readiness
  confidence: number; // 0..100 — self-reported trust in the leg
}

/**
 * The signature view. A single 0–100 rail with two markers:
 *  - physical readiness (green) — usually ahead
 *  - confidence (orange) — usually lagging
 * The shaded band between them IS the "readiness gap" the whole product is about.
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
      <View style={styles.topRow}>
        <View>
          <Text variant="label" tone="mid" uppercase>
            Readiness gap
          </Text>
          <View style={styles.gapRow}>
            <Text variant="display" tone="amber" style={tabularNums}>
              {gap}
            </Text>
            <Text variant="h2" tone="mid" style={styles.pts}>
              pts
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rail} onLayout={onLayout}>
        {w > 0 && (
          <>
            {/* shaded gap band */}
            <View
              style={[
                styles.band,
                { left: x(lo), width: x(hi) - x(lo) },
              ]}
            />
            {/* confidence marker (orange) */}
            <Marker x={x(confidence)} color={palette.orange} />
            {/* physical marker (green) */}
            <Marker x={x(physical)} color={palette.green} />
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

function Marker({ x, color }: { x: number; color: string }) {
  return (
    <View style={[styles.marker, { left: x - 9, borderColor: color }]}>
      <View style={[styles.markerDot, { backgroundColor: color }]} />
    </View>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" tone="mid">
        {label}
      </Text>
      <Text variant="bodyStrong" style={[{ marginLeft: 4 }, tabularNums]}>
        {Math.round(value)}
      </Text>
    </View>
  );
}

const RAIL_H = 18;
const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  gapRow: { flexDirection: 'row', alignItems: 'baseline' },
  pts: { marginLeft: 6 },
  rail: {
    height: RAIL_H,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: palette.amberSoft,
    borderRadius: radius.pill,
  },
  marker: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: { width: 7, height: 7, borderRadius: 4 },
  legend: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
});
