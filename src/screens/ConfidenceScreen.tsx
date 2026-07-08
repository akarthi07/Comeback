import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Screen, Card, Text, Button } from '../components';
import { palette, radius, spacing, tabularNums } from '../theme';
import { useGoal, useConfidence } from '../store';

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export function ConfidenceScreen() {
  const goal = useGoal((s) => s.goal);
  const checks = useConfidence((s) => s.checks);
  const addCheck = useConfidence((s) => s.addCheck);

  const [score, setScore] = useState<number>(50);
  const leg = goal?.injuredLeg ?? 'left';

  function save() {
    addCheck({
      id: `conf_${Date.now().toString(36)}`,
      dateISO: new Date().toISOString(),
      score,
      prompt: `How much do you trust your ${leg} knee?`,
    });
  }

  const recent = checks.slice(0, 5);

  return (
    <Screen title="Confidence" subtitle="Check in with your head, not just your knee">
      <Card>
        <Text variant="h2" style={{ marginBottom: spacing.lg }}>
          How much do you trust your {leg} knee right now?
        </Text>

        <View style={styles.scoreRow}>
          <Text variant="display" tone="orange" style={tabularNums}>
            {score}
          </Text>
          <Text variant="h2" tone="mid">
            /100
          </Text>
        </View>

        <View style={styles.scale}>
          {STEPS.map((v) => (
            <Pressable
              key={v}
              onPress={() => setScore(v)}
              style={[styles.tick, v <= score && styles.tickOn, v === score && styles.tickSel]}
            />
          ))}
        </View>
        <View style={styles.scaleLabels}>
          <Text variant="caption" tone="low">
            No trust
          </Text>
          <Text variant="caption" tone="low">
            Full trust
          </Text>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Button title="Log confidence check" full onPress={save} />
        </View>
      </Card>

      {recent.length > 0 && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text variant="label" tone="mid" style={{ marginBottom: spacing.md }}>
            Recent checks
          </Text>
          {recent.map((c) => (
            <View key={c.id} style={styles.histRow}>
              <Text variant="body" tone="mid">
                {new Date(c.dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
              <Text variant="bodyStrong" tone="orange" style={tabularNums}>
                {c.score}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: spacing.lg },
  scale: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 44 },
  tick: {
    flex: 1,
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
  },
  tickOn: { backgroundColor: palette.orangeSoft },
  tickSel: { height: 44, backgroundColor: palette.orange },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  histRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.hairline,
  },
});
