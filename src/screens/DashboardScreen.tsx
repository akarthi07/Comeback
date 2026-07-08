import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Card, Text, GapMeter, Button } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { useGoal, useSessions, useLadder, useReadiness } from '../store';

const DAY = 86_400_000;

export function DashboardScreen() {
  const nav = useNavigation<any>();
  const goal = useGoal((s) => s.goal);
  const sessions = useSessions((s) => s.sessions);
  const rungs = useLadder((s) => s.rungs);
  const { physical, confidence, gap, series } = useReadiness();

  const dayN = goal ? Math.max(1, Math.floor((Date.now() - Date.parse(goal.createdAt)) / DAY)) : 1;
  const weekDelta =
    series.physical.length >= 2
      ? series.physical[series.physical.length - 1] - series.physical[series.physical.length - 2]
      : 0;
  const bestFlexion = sessions.reduce((m, s) => Math.max(m, s.maxFlexion), 0);
  const rungsDone = rungs.filter((r) => r.done).length;
  const nextRung = rungs.find((r) => !r.done);

  return (
    <Screen>
      {/* header */}
      <View style={styles.header}>
        <View>
          <Text variant="h2">Comeback</Text>
          <Text variant="caption" tone="mid" style={{ marginTop: 2 }}>
            Day {dayN} · {goal?.activity ?? 'your comeback'}
          </Text>
        </View>
        <Button title="Measure" size="md" onPress={() => nav.navigate('Measure')} />
      </View>

      {/* hero — physical readiness */}
      <View style={styles.hero}>
        <Text variant="label" tone="mid">Physical readiness</Text>
        <View style={styles.heroRow}>
          <Text variant="display" style={tabularNums}>{physical}</Text>
          <Text variant="h1" tone="mid" style={styles.pct}>%</Text>
        </View>
        <Text variant="body" tone={weekDelta >= 0 ? 'green' : 'red'} style={tabularNums}>
          {weekDelta >= 0 ? '▲' : '▼'} {Math.abs(Math.round(weekDelta))} this week
        </Text>
      </View>

      {/* mini stat row */}
      <View style={styles.stats}>
        <Mini label="Best bend" value={`${bestFlexion}°`} />
        <Mini label="Confidence" value={`${confidence}`} />
        <Mini label="Gap" value={`${gap}`} tone={gap >= 18 ? 'amber' : 'hi'} />
        <Mini label="Sessions" value={`${sessions.length}`} />
      </View>

      {/* gap rail */}
      <Card style={styles.card}>
        <GapMeter physical={physical} confidence={confidence} />
      </Card>

      {/* up next */}
      <Text variant="label" tone="low" style={styles.sectionLabel}>Up next</Text>
      <Card padded={false} style={styles.card}>
        <Row title="Measure your knee" subtitle="Guided range-of-motion capture" onPress={() => nav.navigate('Measure')} />
        <Divider />
        <Row title="Confidence check" subtitle="How much do you trust the leg today?" onPress={() => nav.navigate('Confidence')} />
        <Divider />
        <Row
          title={nextRung ? nextRung.label : 'All rungs cleared'}
          subtitle={`Ladder · ${rungsDone}/${rungs.length} cleared`}
          onPress={() => nav.navigate('Ladder')}
        />
      </Card>
    </Screen>
  );
}

function Mini({ label, value, tone = 'hi' }: { label: string; value: string; tone?: 'hi' | 'amber' }) {
  return (
    <View style={styles.mini}>
      <Text variant="caption" tone="mid">{label}</Text>
      <Text variant="title" tone={tone} style={[{ marginTop: 3 }, tabularNums]}>{value}</Text>
    </View>
  );
}

function Row({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={{ flex: 1 }}>
        <Text variant="title">{title}</Text>
        <Text variant="caption" tone="mid" style={{ marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Text variant="title" tone="low">›</Text>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.x3 },
  hero: { marginBottom: spacing.x2 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 2 },
  pct: { marginLeft: 2 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.x2 },
  mini: { flex: 1 },
  card: { marginBottom: spacing.lg },
  sectionLabel: { marginBottom: spacing.sm, marginLeft: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.hairline, marginLeft: spacing.xl },
});
