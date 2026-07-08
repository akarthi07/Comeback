import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Screen, Card, Text, ProgressBar } from '../components';
import { palette, radius, spacing } from '../theme';
import { useLadder } from '../store';

export function LadderScreen() {
  const rungs = useLadder((s) => s.rungs);
  const toggleRung = useLadder((s) => s.toggleRung);
  const done = rungs.filter((r) => r.done).length;

  return (
    <Screen title="Ladder" subtitle="One rung at a time, all the way back">
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.headerRow}>
          <Text variant="h2">
            {done}
            <Text variant="title" tone="mid">
              {' '}/ {rungs.length} cleared
            </Text>
          </Text>
        </View>
        <ProgressBar value={rungs.length ? done / rungs.length : 0} color={palette.orange} height={10} />
      </Card>

      {rungs.map((r, i) => {
        const isNext = !r.done && rungs.slice(0, i).every((x) => x.done);
        return (
          <Pressable key={r.id} onPress={() => toggleRung(r.id)}>
            <Card
              padded={false}
              accent={r.done ? palette.green : isNext ? palette.orange : undefined}
              style={[styles.rung, isNext && styles.rungNext]}
            >
              <View style={styles.rungBody}>
                <View style={[styles.check, r.done && styles.checkDone]}>
                  {r.done && (
                    <Svg width={14} height={14} viewBox="0 0 24 24">
                      <Polyline
                        points="5,12 10,17 19,7"
                        fill="none"
                        stroke={palette.ink}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="title" tone={r.done ? 'mid' : 'hi'}>
                    {r.label}
                  </Text>
                  {r.targetFlexion != null && !r.done && (
                    <Text variant="caption" tone="low">
                      target {r.targetFlexion}° flexion
                    </Text>
                  )}
                  {r.done && r.doneDateISO && (
                    <Text variant="caption" tone="green">
                      cleared {new Date(r.doneDateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                </View>
                {isNext && <Text variant="label" tone="orange">Next</Text>}
              </View>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { marginBottom: spacing.md },
  rung: { marginBottom: spacing.md, padding: spacing.lg },
  rungNext: { borderColor: palette.orange },
  rungBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: palette.green, borderColor: palette.green },
});
