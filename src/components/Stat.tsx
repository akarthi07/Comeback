import { View, StyleSheet } from 'react-native';
import { palette, spacing, tabularNums } from '../theme';
import { Text } from './Text';

interface Props {
  value: string;
  label: string;
  unit?: string;
  delta?: number; // signed; renders ▲/▼ green/red
  deltaSuffix?: string;
}

/** A labelled number block with an optional up/down delta. */
export function Stat({ value, label, unit, delta, deltaSuffix = '' }: Props) {
  return (
    <View>
      <Text variant="label" tone="mid">
        {label}
      </Text>
      <View style={styles.row}>
        <Text variant="h1" style={tabularNums}>
          {value}
        </Text>
        {unit ? (
          <Text variant="title" tone="mid" style={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </View>
      {delta != null && (
        <View style={styles.deltaRow}>
          <Text variant="caption" tone={delta >= 0 ? 'green' : 'red'} style={tabularNums}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
            {deltaSuffix}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  unit: { marginLeft: 4, color: palette.textMid },
  deltaRow: { marginTop: 2 },
});
