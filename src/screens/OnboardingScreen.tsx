import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../components';
import { palette, spacing } from '../theme';
import { useGoal, useCalibration } from '../store';
import { seedMockData } from '../data/mock';
import { GoalStep, type GoalDraft } from '../onboarding/GoalStep';
import { CalibrateStep } from '../onboarding/CalibrateStep';
import type { Calibration } from '../store/types';

type Step = 'welcome' | 'goal' | 'calibrate';

const DEFAULT_TARGET_FLEXION = 135;

/**
 * Onboarding wizard: Welcome → Goal setup → straight-leg Calibration. The goal
 * is only committed at the very end (setting it flips RootNavigator to the main
 * app), so the whole flow lives here as internal steps.
 */
export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const setGoal = useGoal((s) => s.setGoal);
  const setCalibration = useCalibration((s) => s.setCalibration);

  const [step, setStep] = useState<Step>('welcome');
  const [draft, setDraft] = useState<GoalDraft | null>(null);

  function finish(draftGoal: GoalDraft, calibration: Calibration | null) {
    if (calibration) setCalibration(calibration);
    setGoal({
      injuredLeg: draftGoal.injuredLeg,
      targetFlexion: DEFAULT_TARGET_FLEXION,
      activity: draftGoal.activity,
      targetDate: draftGoal.targetDate,
      createdAt: new Date().toISOString(),
    });
  }

  if (step === 'goal') {
    return (
      <GoalStep
        onBack={() => setStep('welcome')}
        onContinue={(d) => { setDraft(d); setStep('calibrate'); }}
      />
    );
  }

  if (step === 'calibrate' && draft) {
    return <CalibrateStep leg={draft.injuredLeg} onDone={(cal) => finish(draft, cal)} />;
  }

  // Welcome.
  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.x4, paddingBottom: insets.bottom + spacing.x2 }]}>
      <View style={styles.top}>
        <Text variant="label" tone="mid">Comeback</Text>
        <Text variant="display" style={styles.hero}>
          Heal the{'\n'}whole athlete.
        </Text>
        <Text variant="body" tone="mid" style={{ marginTop: spacing.lg }}>
          Most rehab apps track your body. Comeback tracks your body and your confidence —
          and shows you the gap between them, so nothing holds you back when you're ready.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Start my comeback" full onPress={() => setStep('goal')} />
        <Button title="Explore with sample data" variant="ghost" full onPress={() => seedMockData(true)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink, paddingHorizontal: spacing.xl, justifyContent: 'space-between' },
  top: { flex: 1, justifyContent: 'center' },
  hero: { marginTop: spacing.md },
  actions: { gap: spacing.md },
});
