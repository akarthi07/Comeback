import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../components';
import { palette, spacing } from '../theme';
import { useGoal } from '../store';
import { seedMockData } from '../data/mock';

/**
 * Stub onboarding. Real flow (goal-setting wizard) comes in a later chunk; for now
 * it gets the user into the app with a sensible default goal + sample data so the
 * rest of the product is explorable.
 */
export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const setGoal = useGoal((s) => s.setGoal);

  function start() {
    setGoal({
      injuredLeg: 'left',
      targetFlexion: 135,
      activity: 'your comeback',
      createdAt: new Date().toISOString(),
    });
  }

  function startWithSample() {
    seedMockData(true);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.x4, paddingBottom: insets.bottom + spacing.x2 }]}>
      <View style={styles.top}>
        <Text variant="label" tone="orange" uppercase>
          Comeback
        </Text>
        <Text variant="display" style={styles.hero}>
          Heal the{'\n'}whole athlete.
        </Text>
        <Text variant="body" tone="mid" style={{ marginTop: spacing.lg }}>
          Most rehab apps track your body. Comeback tracks your body and your confidence —
          and shows you the gap between them, so nothing holds you back when you’re ready.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Start my comeback" full onPress={start} />
        <Button title="Explore with sample data" variant="ghost" full onPress={startWithSample} />
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
