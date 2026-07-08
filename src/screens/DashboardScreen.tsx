import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Card, Text, Button, GapMeter, ProgressBar, Badge } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { useGoal, useSessions, useLadder, useReadiness } from '../store';

const DAY = 86_400_000;

export function DashboardScreen() {
  const nav = useNavigation<any>();
  const goal = useGoal((s) => s.goal);
  const sessions = useSessions((s) => s.sessions);
  const rungs = useLadder((s) => s.rungs);
  const { physical, confidence, gap, hasData } = useReadiness();

  const dayN = goal ? Math.max(1, Math.floor((Date.now() - Date.parse(goal.createdAt)) / DAY)) : 1;
  const weekAgo = Date.now() - 7 * DAY;
  const sessionsThisWeek = sessions.filter((s) => Date.parse(s.dateISO) > weekAgo).length;
  const bestFlexion = sessions.reduce((m, s) => Math.max(m, s.maxFlexion), 0);
  const rungsDone = rungs.filter((r) => r.done).length;

  const headline =
    gap >= 18
      ? 'Your knee is ahead of your confidence.'
      : gap >= 8
      ? 'Confidence is catching up to your knee.'
      : 'Body and confidence are in sync.';

  return (
    <Screen title="Comeback" subtitle={`Day ${dayN} · ${goal?.activity ?? 'your comeback'}`}>
      {/* HERO — the readiness gap */}
      <Card accent={palette.amber} style={styles.hero}>
        <Text variant="title" style={{ marginBottom: spacing.lg }}>
          {headline}
        </Text>
        <GapMeter physical={physical} confidence={confidence} />
        <Text variant="caption" tone="mid" style={{ marginTop: spacing.lg }}>
          Recovery is physical and mental. We track both so the gap doesn't sneak up on you.
        </Text>
      </Card>

      {/* quick stats */}
      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text variant="label" tone="mid" uppercase>
            Best flexion
          </Text>
          <View style={styles.statValueRow}>
            <Text variant="h1" style={tabularNums}>
              {bestFlexion}
            </Text>
            <Text variant="title" tone="mid">
              °
            </Text>
          </View>
          <Text variant="caption" tone="low">
            goal {goal?.targetFlexion ?? 135}°
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text variant="label" tone="mid" uppercase>
            This week
          </Text>
          <View style={styles.statValueRow}>
            <Text variant="h1" style={tabularNums}>
              {sessionsThisWeek}
            </Text>
            <Text variant="title" tone="mid">
              {' '}sessions
            </Text>
          </View>
          <Text variant="caption" tone="low">
            keep the streak alive
          </Text>
        </Card>
      </View>

      {/* CTAs */}
      <View style={styles.ctaRow}>
        <View style={{ flex: 1 }}>
          <Button title="Measure" full onPress={() => nav.navigate('Measure')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Confidence check" variant="secondary" full onPress={() => nav.navigate('Confidence')} />
        </View>
      </View>

      {/* ladder mini */}
      <Card onPress={() => nav.navigate('Ladder')} style={styles.ladder}>
        <View style={styles.ladderTop}>
          <Text variant="title">The comeback ladder</Text>
          <Badge label={`${rungsDone}/${rungs.length}`} tone="orange" />
        </View>
        <ProgressBar value={rungs.length ? rungsDone / rungs.length : 0} color={palette.orange} />
        <Text variant="caption" tone="mid" style={{ marginTop: spacing.sm }}>
          {rungsDone < rungs.length
            ? `Next: ${rungs.find((r) => !r.done)?.label}`
            : 'All rungs cleared — you’re back.'}
        </Text>
      </Card>

      {!hasData && (
        <Text variant="caption" tone="low" center style={{ marginTop: spacing.lg }}>
          Showing sample data. Take a measurement to start your real record.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.lg },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  ctaRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  ladder: {},
  ladderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
});
