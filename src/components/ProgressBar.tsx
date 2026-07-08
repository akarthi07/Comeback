import { View, StyleSheet } from 'react-native';
import { palette, radius } from '../theme';

interface Props {
  value: number; // 0..1
  color?: string;
  track?: string;
  height?: number;
}

export function ProgressBar({ value, color = palette.orange, track = palette.surfaceAlt, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: track, height, borderRadius: height }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
});
