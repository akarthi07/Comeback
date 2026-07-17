import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Card, Text, Button } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { useCalibration } from '../store';
import { seedMockData, resetAllData } from '../data/mock';

export function SettingsScreen() {
  const nav = useNavigation<any>();
  const calibration = useCalibration((s) => s.calibration);

  function loadSample() {
    seedMockData(true);
    Alert.alert('Sample data loaded', 'Dashboard and Trend now show a demo comeback.');
    nav.goBack();
  }

  function reset() {
    Alert.alert(
      'Reset everything?',
      'This clears your goal, measurements, confidence checks, calibration, and ladder progress, and returns to the start. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetAllData() },
      ]
    );
  }

  return (
    <Screen title="Settings" right={<Pressable onPress={() => nav.goBack()} hitSlop={10}><Text variant="bodyStrong" tone="mid">Done</Text></Pressable>}>
      {/* Calibration */}
      <Card>
        <Text variant="label" tone="mid" style={{ marginBottom: spacing.sm }}>Calibration</Text>
        {calibration ? (
          <>
            <View style={styles.row}>
              <Text variant="body" tone="mid">Offset applied</Text>
              <Text variant="bodyStrong" tone="hi" style={tabularNums}>{calibration.offsetDeg.toFixed(1)}°</Text>
            </View>
            <View style={styles.row}>
              <Text variant="body" tone="mid">Samples</Text>
              <Text variant="bodyStrong" tone="hi" style={tabularNums}>{calibration.samples}</Text>
            </View>
            {!calibration.ok && (
              <Text variant="caption" tone="amber" style={{ marginTop: spacing.sm }}>
                This calibration was a bit unsteady — consider redoing it.
              </Text>
            )}
          </>
        ) : (
          <Text variant="body" tone="mid">
            Not calibrated yet. Calibrating teaches Comeback your setup so a straight leg reads zero.
          </Text>
        )}
        <View style={{ marginTop: spacing.lg }}>
          <Button title={calibration ? 'Recalibrate' : 'Calibrate now'} variant="secondary" full onPress={() => nav.navigate('Calibrate')} />
        </View>
      </Card>

      {/* Demo data */}
      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="label" tone="mid" style={{ marginBottom: spacing.sm }}>Demo data</Text>
        <Text variant="body" tone="mid">
          Load a sample comeback (8 weeks of measurements + confidence checks) to explore the
          Trend and Readiness Gap without waiting for real data.
        </Text>
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Load sample data" variant="secondary" full onPress={loadSample} />
        </View>
      </Card>

      {/* Reset */}
      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="label" tone="mid" style={{ marginBottom: spacing.sm }}>Start over</Text>
        <Text variant="body" tone="mid">Clear all data and return to the beginning.</Text>
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Reset all data" variant="secondary" full onPress={reset} />
        </View>
      </Card>

      {/* About / honest framing */}
      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="label" tone="mid" style={{ marginBottom: spacing.sm }}>About the measurement</Text>
        <Text variant="body" tone="mid">
          Comeback's knee-angle reading is validated to within{' '}
          <Text variant="bodyStrong" tone="green">3–5°</Text> of a goniometer under a standardized
          side-on setup. It's a companion for tracking your comeback — not a medical device, and not
          a clearance to return to sport.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
});
