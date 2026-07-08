import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, Badge } from '../components';
import { palette, spacing, tabularNums } from '../theme';
import { translateFlexion, translateExtension, symmetry } from './translate';
import type { Leg } from '../../shared/capture/quality';

export interface MeasureResult {
  leg: Leg;
  maxFlexionDeg: number;
  minFlexionDeg: number;
  rangeDeg: number;
  acceptedFrames: number;
}

interface Props {
  result: MeasureResult;
  otherLegFlexion?: number;
  saved: boolean;
  onSave: () => void;
  onRedo: () => void;
}

export function MeasurementResult({ result, otherLegFlexion, saved, onSave, onRedo }: Props) {
  const insets = useSafeAreaInsets();
  const sym = otherLegFlexion ? symmetry(result.maxFlexionDeg, otherLegFlexion) : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.x2, paddingBottom: insets.bottom + 80 }]}>
      <Text variant="label" tone="orange" uppercase>
        {result.leg} knee · result
      </Text>
      <Text variant="h1" style={{ marginTop: 4, marginBottom: spacing.xl }}>
        Here's your range
      </Text>

      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroCol}>
            <Text variant="label" tone="mid" uppercase>
              Bend
            </Text>
            <View style={styles.numRow}>
              <Text variant="display" tone="green" style={tabularNums}>
                {Math.round(result.maxFlexionDeg)}
              </Text>
              <Text variant="h2" tone="mid">°</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.heroCol}>
            <Text variant="label" tone="mid" uppercase>
              Straighten
            </Text>
            <View style={styles.numRow}>
              <Text variant="display" style={tabularNums}>
                {Math.round(result.minFlexionDeg)}
              </Text>
              <Text variant="h2" tone="mid">°</Text>
            </View>
          </View>
        </View>
        <Text variant="caption" tone="low" style={{ marginTop: spacing.sm }}>
          Range of motion {Math.round(result.rangeDeg)}° · {result.acceptedFrames} frames
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="body" tone="hi">{translateFlexion(result.maxFlexionDeg)}</Text>
        <Text variant="body" tone="mid" style={{ marginTop: 4 }}>
          {translateExtension(result.minFlexionDeg)}
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.symRow}>
          <Text variant="title">Symmetry</Text>
          {sym ? <Badge label={sym.label} tone={sym.tone} /> : <Badge label="No comparison yet" tone="neutral" />}
        </View>
        <Text variant="caption" tone="mid" style={{ marginTop: spacing.sm }}>
          {sym
            ? 'Compared with your most recent measurement of the other leg.'
            : 'Measure your other leg to see how the two compare.'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button title="Measure again" variant="secondary" full onPress={onRedo} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={saved ? 'Saved ✓' : 'Save session'} full onPress={onSave} disabled={saved} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink, paddingHorizontal: spacing.xl },
  heroCard: {},
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroCol: { flex: 1, alignItems: 'center' },
  numRow: { flexDirection: 'row', alignItems: 'baseline' },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: palette.hairline },
  symRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.x2 },
});
