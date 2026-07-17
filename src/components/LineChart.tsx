import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import Svg, { Polyline, Path, Circle, Line as SvgLine } from 'react-native-svg';
import { palette, spacing } from '../theme';
import { Text } from './Text';

interface Props {
  /** Each series is an array of 0..100 values, equally spaced along x. */
  physical: number[];
  confidence: number[];
  labels?: string[]; // x labels, optional (e.g. week markers)
  height?: number;
}

/**
 * Custom dual-line chart. Physical (green) typically climbs faster than
 * confidence (orange); the band between them is shaded amber so the story —
 * the body healing ahead of the mind — is legible at a glance.
 */
export function LineChart({ physical, confidence, labels, height = 180 }: Props) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const padL = 4;
  const padR = 4;
  const padT = 10;
  const padB = 18;
  const innerW = Math.max(0, w - padL - padR);
  const innerH = height - padT - padB;

  const n = Math.max(physical.length, confidence.length);
  const xAt = (i: number) => padL + (n <= 1 ? 0 : (innerW * i) / (n - 1));
  const yAt = (v: number) => padT + innerH * (1 - Math.max(0, Math.min(100, v)) / 100);

  const pts = (s: number[]) => s.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');

  // Closed polygon for the gap band (physical top edge, confidence bottom edge reversed).
  const bandPath =
    n > 0
      ? `M ${physical.map((v, i) => `${xAt(i)} ${yAt(v)}`).join(' L ')} L ` +
        confidence
          .map((v, i) => `${xAt(confidence.length - 1 - i)} ${yAt(confidence[confidence.length - 1 - i])}`)
          .join(' L ') +
        ' Z'
      : '';

  return (
    <View>
      <View style={{ height }} onLayout={onLayout}>
        {w > 0 && (
          <Svg width={w} height={height}>
            {/* subtle gridlines at 25/50/75 */}
            {[25, 50, 75].map((g) => (
              <SvgLine key={g} x1={padL} y1={yAt(g)} x2={w - padR} y2={yAt(g)} stroke={palette.hairline} strokeWidth={1} />
            ))}
            {/* gap band */}
            <Path d={bandPath} fill={palette.amberSoft} />
            {/* confidence line */}
            <Polyline points={pts(confidence)} fill="none" stroke={palette.textHi} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {/* physical line */}
            <Polyline points={pts(physical)} fill="none" stroke={palette.green} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {/* end dots */}
            {n > 0 && (
              <>
                <Circle cx={xAt(physical.length - 1)} cy={yAt(physical[physical.length - 1])} r={4} fill={palette.green} />
                <Circle cx={xAt(confidence.length - 1)} cy={yAt(confidence[confidence.length - 1])} r={4} fill={palette.textHi} />
              </>
            )}
          </Svg>
        )}
      </View>
      {labels && (
        <View style={styles.labels}>
          {labels.map((l, i) => (
            <Text key={i} variant="caption" tone="low">
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
});
