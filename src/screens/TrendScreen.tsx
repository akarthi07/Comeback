import { View, StyleSheet } from 'react-native';
import { Screen, Card, Text, LineChart } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { useReadiness } from '../store';

export function TrendScreen() {
  const { series, physical, confidence, gap } = useReadiness(8);

  return (
    <Screen title="Trend" subtitle="The gap, over time">
      <Card>
        <View style={styles.legendRow}>
          <Legend color={palette.green} label="Physical" value={physical} />
          <Legend color={palette.orange} label="Confidence" value={confidence} />
          <Legend color={palette.amber} label="Gap" value={gap} />
        </View>
        <LineChart physical={series.physical} confidence={series.confidence} labels={series.labels} />
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="title" style={{ marginBottom: spacing.sm }}>
          What this shows
        </Text>
        <Text variant="body" tone="mid">
          The green line is your knee’s physical recovery. The orange line is how much you
          actually trust it. The amber band between them is the{' '}
          <Text variant="bodyStrong" tone="amber">
            readiness gap
          </Text>
          {' '}— and it closes slower than the body heals. Naming it is how you close it.
        </Text>
      </Card>
    </Screen>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View>
        <Text variant="caption" tone="mid">
          {label}
        </Text>
        <Text variant="bodyStrong" style={tabularNums}>
          {Math.round(value)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: { flexDirection: 'row', gap: spacing.x2, marginBottom: spacing.lg },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
