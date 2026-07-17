import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Card, Text, Button, ProgressBar } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { useConfidence } from '../store';
import {
  ACL_RSI_ITEMS,
  ITEM_COUNT,
  scoreAclRsi,
  isCheckDue,
  SUBSCALE_LABELS,
} from '../../shared/scales/aclRsi';
import { ScaleSelector } from '../confidence/ScaleSelector';
import { RsiResult } from '../confidence/RsiResult';

type Phase = 'intro' | 'question' | 'result';

export function ConfidenceScreen() {
  const checks = useConfidence((s) => s.checks);
  const addCheck = useConfidence((s) => s.addCheck);

  const [phase, setPhase] = useState<Phase>('intro');
  const [responses, setResponses] = useState<(number | null)[]>(
    () => new Array(ITEM_COUNT).fill(null)
  );
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const latest = checks[0];
  const due = isCheckDue(latest?.dateISO);

  function start() {
    setResponses(new Array(ITEM_COUNT).fill(null));
    setIndex(0);
    setSaved(false);
    setPhase('question');
  }

  function answer(v: number) {
    setResponses((r) => {
      const next = [...r];
      next[index] = v;
      return next;
    });
  }

  function next() {
    if (index < ITEM_COUNT - 1) setIndex((i) => i + 1);
    else setPhase('result');
  }

  function back() {
    if (index > 0) setIndex((i) => i - 1);
    else setPhase('intro');
  }

  function save() {
    const s = scoreAclRsi(responses as number[]);
    addCheck({
      id: `rsi_${Date.now().toString(36)}`,
      dateISO: new Date().toISOString(),
      score: s.overall,
      emotions: s.emotions,
      confidence: s.confidence,
      riskAppraisal: s.riskAppraisal,
      responses: responses as number[],
    });
    setSaved(true);
  }

  // ---- RESULT ----------------------------------------------------------
  if (phase === 'result') {
    const score = scoreAclRsi(responses as number[]);
    return (
      <Screen title="Your check" subtitle="ACL-RSI · psychological readiness">
        <RsiResult
          score={score}
          saved={saved}
          onSave={save}
          onRetake={() => (saved ? setPhase('intro') : start())}
        />
      </Screen>
    );
  }

  // ---- QUESTION --------------------------------------------------------
  if (phase === 'question') {
    const item = ACL_RSI_ITEMS[index];
    const value = responses[index];
    return (
      <Screen scroll={false}>
        <View style={styles.qProgress}>
          <View style={styles.qProgressHead}>
            <Text variant="label" tone="mid">
              {SUBSCALE_LABELS[item.subscale]}
            </Text>
            <Text variant="label" tone="low" style={tabularNums}>
              {index + 1} / {ITEM_COUNT}
            </Text>
          </View>
          <ProgressBar value={(index + 1) / ITEM_COUNT} height={4} />
        </View>

        <View style={styles.qBody}>
          <Text variant="h1">{item.text}</Text>
        </View>

        <View style={styles.qFooter}>
          <ScaleSelector value={value} onChange={answer} />
          <View style={styles.qNav}>
            <Button title="Back" variant="secondary" onPress={back} />
            <View style={{ flex: 1 }}>
              <Button
                title={index === ITEM_COUNT - 1 ? 'See result' : 'Next'}
                full
                disabled={value === null}
                onPress={next}
              />
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  // ---- INTRO -----------------------------------------------------------
  return (
    <Screen title="Confidence" subtitle="Check in with your head, not just your knee">
      {latest ? (
        <Card>
          <View style={styles.introHead}>
            <Text variant="label" tone="mid">Latest readiness</Text>
            {due && <Text variant="label" tone="green">Due</Text>}
          </View>
          <View style={styles.introRow}>
            <Text variant="display" tone="green" style={tabularNums}>{latest.score}</Text>
            <Text variant="h2" tone="mid" style={styles.outOf}>/100</Text>
          </View>
          {latest.confidence != null && (
            <View style={styles.subline}>
              <Sub label="Conf" value={latest.confidence} />
              <Sub label="Emot" value={latest.emotions} />
              <Sub label="Risk" value={latest.riskAppraisal} />
            </View>
          )}
        </Card>
      ) : (
        <Card>
          <Text variant="h2">Measure your readiness</Text>
          <Text variant="body" tone="mid" style={{ marginTop: spacing.sm }}>
            The ACL-RSI is the validated 12-question scale for return-to-sport
            confidence — the part of recovery your knee angle can't show. Takes about
            a minute.
          </Text>
        </Card>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <Button
          title={latest ? 'Start a new check' : 'Start your first check'}
          full
          onPress={start}
        />
      </View>

      {checks.length > 0 && (
        <Card style={{ marginTop: spacing.xl }}>
          <Text variant="label" tone="mid" style={{ marginBottom: spacing.md }}>Recent checks</Text>
          {checks.slice(0, 6).map((c) => (
            <View key={c.id} style={styles.histRow}>
              <Text variant="body" tone="mid">
                {new Date(c.dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
              <Text variant="bodyStrong" tone="hi" style={tabularNums}>{c.score}</Text>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Sub({ label, value }: { label: string; value?: number }) {
  return (
    <View style={styles.sub}>
      <Text variant="caption" tone="low">{label}</Text>
      <Text variant="bodyStrong" tone="hi" style={tabularNums}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  introHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  introRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  outOf: { marginLeft: spacing.sm },
  subline: { flexDirection: 'row', gap: spacing.x2, marginTop: spacing.lg },
  sub: { alignItems: 'flex-start' },
  histRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.hairline,
  },

  // question phase
  qProgress: { marginBottom: spacing.x3 },
  qProgressHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  qBody: { flex: 1, justifyContent: 'center' },
  qFooter: { gap: spacing.xl },
  qNav: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
});
