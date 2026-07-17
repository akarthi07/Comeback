import { View, StyleSheet } from 'react-native';
import { palette, spacing, tabularNums } from '../theme';
import { Text, Card, Button, ProgressBar } from '../components';
import type { AclRsiScore, Subscale } from '../../shared/scales/aclRsi';
import { SUBSCALE_LABELS } from '../../shared/scales/aclRsi';

interface Props {
  score: AclRsiScore;
  saved: boolean;
  onSave: () => void;
  onRetake: () => void;
}

const SUBSCALE_ORDER: Subscale[] = ['confidence', 'emotions', 'riskAppraisal'];

/**
 * ACL-RSI result: the overall readiness number, the three subscales, and a
 * plain-language read. Deliberately NOT a clinical verdict — it frames, it does
 * not clear anyone to play.
 */
export function RsiResult({ score, saved, onSave, onRetake }: Props) {
  const insight = readSubscales(score);

  return (
    <>
      <Card>
        <Text variant="label" tone="mid">Psychological readiness</Text>
        <View style={styles.heroRow}>
          <Text variant="display" tone="green" style={tabularNums}>{score.overall}</Text>
          <Text variant="h2" tone="mid" style={styles.outOf}>/100</Text>
        </View>
        <Text variant="body" tone="mid">
          Higher means more mentally ready to return. One check is a snapshot — the
          trend over weeks is the real signal.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="label" tone="mid" style={{ marginBottom: spacing.md }}>Subscales</Text>
        {SUBSCALE_ORDER.map((s) => (
          <View key={s} style={styles.subRow}>
            <View style={styles.subHead}>
              <Text variant="bodyStrong">{SUBSCALE_LABELS[s]}</Text>
              <Text variant="bodyStrong" tone="hi" style={tabularNums}>{score[s]}</Text>
            </View>
            <ProgressBar value={score[s] / 100} height={6} />
          </View>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="label" tone="mid" style={{ marginBottom: spacing.sm }}>What this says</Text>
        <Text variant="body" tone="mid">{insight}</Text>
      </Card>

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        {!saved ? (
          <Button title="Save this check" full onPress={onSave} />
        ) : (
          <Text variant="bodyStrong" tone="green" center>Saved ✓</Text>
        )}
        <Button title={saved ? 'Done' : 'Retake'} variant="secondary" full onPress={onRetake} />
      </View>
    </>
  );
}

/** Non-diagnostic framing keyed off the lagging subscale. */
function readSubscales(score: AclRsiScore): string {
  const entries: [Subscale, number][] = [
    ['confidence', score.confidence],
    ['emotions', score.emotions],
    ['riskAppraisal', score.riskAppraisal],
  ];
  const [lowest] = entries.sort((a, b) => a[1] - b[1])[0];

  switch (lowest) {
    case 'riskAppraisal':
      return 'Risk appraisal — how likely you feel re-injury is — is your lowest right now. It is the slowest part to shift for almost everyone, and it lagging behind your body is expected, not a warning sign. It moves as safe reps pile up.';
    case 'emotions':
      return 'Emotions around playing — the nerves and frustration — are the lagging piece right now. That is normal this far into a comeback. Naming it is how it starts to settle.';
    default:
      return 'Confidence in how the knee will perform is your lowest right now. It tends to climb steadily as you bank reps and hard moments that go fine.';
  }
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2, marginBottom: spacing.sm },
  outOf: { marginLeft: spacing.sm },
  subRow: { marginBottom: spacing.lg },
  subHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
});
