import Svg, { Line, Circle, G } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { palette } from '../theme';
import { ParsedPose, PointName, mapPoint, ViewMap } from './poseData';
import type { Leg } from '../../shared/capture/quality';

interface Props {
  parsed: ParsedPose;
  measuredLeg: Leg;
  map: ViewMap;
  /** Highlight color for the measured leg (green when ready, amber otherwise). */
  active: boolean;
}

function legChain(leg: Leg): PointName[] {
  return leg === 'left'
    ? ['leftHip', 'leftKnee', 'leftAnkle', 'leftHeel', 'leftFootIndex']
    : ['rightHip', 'rightKnee', 'rightAnkle', 'rightHeel', 'rightFootIndex'];
}

/**
 * Skeleton overlay. The measured leg is drawn bright; the rest of the body is
 * dimmed so the eye goes to what's being measured. Pure presentation — all the
 * math already happened upstream.
 */
export function PoseOverlay({ parsed, measuredLeg, map, active }: Props) {
  if (!parsed.hasPose || map.viewW <= 0) return null;
  const other: Leg = measuredLeg === 'left' ? 'right' : 'left';
  const hot = active ? palette.green : palette.orange;

  const draw = (chain: PointName[], color: string, w: number, r: number) => {
    const pts = chain
      .map((n) => parsed.pts[n])
      .map((lm) => (lm ? mapPoint(lm, map) : null));
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (a && b) segs.push(<Line key={`l${color}${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={w} strokeLinecap="round" />);
    }
    const dots = pts.map((p, i) =>
      p ? <Circle key={`c${color}${i}`} cx={p.x} cy={p.y} r={r} fill={color} /> : null
    );
    return (
      <G>
        {segs}
        {dots}
      </G>
    );
  };

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      {draw(legChain(other), palette.textLow, 3, 4)}
      {draw(legChain(measuredLeg), hot, 5, 7)}
    </Svg>
  );
}
