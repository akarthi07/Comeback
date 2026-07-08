import { View, StyleSheet } from 'react-native';
import { palette, radius, spacing } from '../theme';
import { Text, ProgressBar } from '../components';
import type { QualityResult } from '../../shared/capture/quality';

interface Props {
  quality: QualityResult | null;
  hasPose: boolean;
}

/** Maps the worst failing factor to a short, imperative instruction. */
function prompt(q: QualityResult | null, hasPose: boolean): { msg: string; ready: boolean } {
  if (!hasPose || !q) return { msg: 'Step into frame, side-on to the camera', ready: false };
  if (q.passed) return { msg: "Hold it — you're set", ready: true };
  switch (q.failedFactor) {
    case 'landmarksVisible':
      return { msg: 'Make sure your whole leg is visible', ready: false };
    case 'sideOn':
      return { msg: 'Turn side-on to the camera', ready: false };
    case 'distance':
      return {
        msg: q.factors.distance.detail.includes('closer') ? 'Step closer' : 'Step back',
        ready: false,
      };
    case 'pitch':
      return { msg: 'Stand your phone up straight', ready: false };
    default:
      return { msg: 'Adjust your position', ready: false };
  }
}

export function CaptureGuide({ quality, hasPose }: Props) {
  const { msg, ready } = prompt(quality, hasPose);
  const score = quality?.score ?? 0;

  return (
    <View style={[styles.wrap, ready ? styles.wrapReady : styles.wrapBusy]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: ready ? palette.green : palette.amber }]} />
        <Text variant="title" tone={ready ? 'green' : 'hi'} style={styles.msg}>
          {msg}
        </Text>
      </View>
      <View style={styles.bar}>
        <ProgressBar value={score} color={ready ? palette.green : palette.amber} height={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(11,13,16,0.7)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  wrapReady: { borderColor: palette.green },
  wrapBusy: { borderColor: palette.hairline },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  msg: { flex: 1 },
  bar: { marginTop: spacing.md },
});
