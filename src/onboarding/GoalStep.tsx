import { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radius, spacing, fonts } from '../theme';
import { Text, Button } from '../components';
import type { Leg } from '../store/types';

export interface GoalDraft {
  injuredLeg: Leg;
  activity: string;
  targetDate?: string;
}

interface Props {
  onBack: () => void;
  onContinue: (draft: GoalDraft) => void;
}

const DAY = 86_400_000;
const TIMEFRAMES: { label: string; months: number | null }[] = [
  { label: '~1 month', months: 1 },
  { label: '~3 months', months: 3 },
  { label: '~6 months', months: 6 },
  { label: 'No date', months: null },
];

export function GoalStep({ onBack, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const [leg, setLeg] = useState<Leg | null>(null);
  const [activity, setActivity] = useState('');
  const [tf, setTf] = useState<number>(3); // index into TIMEFRAMES; default "No date" would be 3

  const canContinue = leg !== null && activity.trim().length > 0;

  function submit() {
    if (!leg) return;
    const months = TIMEFRAMES[tf].months;
    onContinue({
      injuredLeg: leg,
      activity: activity.trim(),
      targetDate: months ? new Date(Date.now() + months * 30 * DAY).toISOString() : undefined,
    });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.x2 }}>
        <Text variant="label" tone="mid">Step 1 of 2</Text>
        <Text variant="h1" style={{ marginTop: spacing.xs, marginBottom: spacing.x2 }}>
          Set your comeback
        </Text>

        <Text variant="bodyStrong" style={styles.q}>Which knee are you rehabbing?</Text>
        <View style={styles.legRow}>
          <Choice label="Left" active={leg === 'left'} onPress={() => setLeg('left')} />
          <Choice label="Right" active={leg === 'right'} onPress={() => setLeg('right')} />
        </View>

        <Text variant="bodyStrong" style={styles.q}>What are you coming back to?</Text>
        <TextInput
          value={activity}
          onChangeText={setActivity}
          placeholder="e.g. get back on the pitch"
          placeholderTextColor={palette.textLow}
          style={styles.input}
          returnKeyType="done"
          maxLength={60}
        />

        <Text variant="bodyStrong" style={styles.q}>Target timeframe (optional)</Text>
        <View style={styles.tfRow}>
          {TIMEFRAMES.map((t, i) => (
            <Choice key={t.label} label={t.label} active={tf === i} onPress={() => setTf(i)} small />
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Back" variant="secondary" onPress={onBack} />
        <View style={{ flex: 1 }}>
          <Button title="Continue" full disabled={!canContinue} onPress={submit} />
        </View>
      </View>
    </View>
  );
}

function Choice({ label, active, onPress, small }: { label: string; active: boolean; onPress: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, small && styles.choiceSmall, active && styles.choiceActive]}>
      <Text variant="bodyStrong" tone={active ? 'hi' : 'mid'}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink, paddingHorizontal: spacing.xl },
  q: { marginTop: spacing.xl, marginBottom: spacing.md },
  legRow: { flexDirection: 'row', gap: spacing.md },
  tfRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: {
    flex: 1, alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: palette.hairline,
  },
  choiceSmall: { flex: 0, paddingHorizontal: spacing.lg },
  choiceActive: { borderColor: palette.green, backgroundColor: palette.greenSoft },
  input: {
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: palette.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    color: palette.textHi, fontFamily: fonts.regular, fontSize: 15,
  },
  actions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', paddingTop: spacing.md },
});
