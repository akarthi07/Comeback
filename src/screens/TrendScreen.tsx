import { View, StyleSheet } from 'react-native';
import { Screen, Card, Text, LineChart } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { useReadiness } from '../store';

export function TrendScreen() {
  const { series, physical, confidence, gap, sessionCount, checkCount } = useReadiness(8);

  // A single point isn't a trend — show an intentional early state instead of a
  // flat, broken-looking chart until there's enough to draw a line.
  const enoughForTrend = sessionCount >= 2 || checkCount >= 2;
  if (!enoughForTrend) {
    return (
      <Screen title="Trend" subtitle="The gap, over time">
        <Card>
          <Text variant="h2">Your trend starts here</Text>
          <Text variant="body" tone="mid" style={{ marginTop: spacing.sm }}>
            {sessionCount + checkCount === 0
              ? 'Once you log a couple of measurements and confidence checks, this is where you’ll watch your range climb and the readiness gap close.'
              : 'Nice start. Log one or two more and the trend lines — and the gap between body and head — will appear here.'}
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Trend" subtitle="The gap, over time">
      <Card>
        <View style={styles.legendRow}>
          <Legend color={palette.green} label="Physical" value={physical} />
          <Legend color={palette.textHi} label="Confidence" value={confidence} />
          <Legend color={palette.textLow} label="Gap" value={gap} />
        </View>
        <LineChart physical={series.physical} confidence={series.confidence} labels={series.labels} />
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="title" style={{ marginBottom: spacing.sm }}>
          What this shows
        </Text>
        <Text variant="body" tone="mid">
          The green line is your knee’s physical recovery. The white line is how much you
          actually trust it. The band between them is the{' '}
          <Text variant="bodyStrong" tone="hi">
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
