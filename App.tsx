import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Camera as PoseCamera } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';
import { kneeFlexionDeg, jointAngleDeg, type Point2D } from './shared/math/kneeAngle';

type Leg = 'left' | 'right';

// The ML Kit plugin returns named landmarks, each as { x, y } in image pixels.
type LM = { x: number; y: number } | undefined;

interface FrameReadout {
  frames: number;
  hasLeg: boolean;
  likelihood: number; // min in-frame confidence of hip/knee/ankle (0..1)
  jointAngle: number; // interior angle, straight ~180
  flexion: number; // clinical, straight = 0
}

// Hip/knee/ankle must each be at least this confident to trust the reading.
// ML Kit returns guessed positions for off-screen joints with LOW confidence,
// so this is what stops "leg tracking OK" from lighting up on a face-only view.
const MIN_LIKELIHOOD = 0.8;

function pt(lm: LM): Point2D | null {
  if (!lm || typeof lm.x !== 'number' || typeof lm.y !== 'number') return null;
  if (lm.x === 0 && lm.y === 0) return null; // ML Kit returns 0,0 when not detected
  return { x: lm.x, y: lm.y };
}

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [leg, setLeg] = useState<Leg>('left');
  const legRef = useRef<Leg>('left');
  const framesRef = useRef(0);
  const [readout, setReadout] = useState<FrameReadout | null>(null);

  const onPose = useCallback((data: any) => {
    if (framesRef.current === 0) console.log('[pose] first callback fired');
    framesRef.current += 1;

    // NOTE: the plugin's native code emits keys "...Position" (its TS types are
    // wrong — they claim leftHipX/leftHipY which don't exist in the real data).
    const useLeft = legRef.current === 'left';
    const hipLm = useLeft ? data?.leftHipPosition : data?.rightHipPosition;
    const kneeLm = useLeft ? data?.leftKneePosition : data?.rightKneePosition;
    const ankleLm = useLeft ? data?.leftAnklePosition : data?.rightAnklePosition;

    const likelihood = Math.min(
      hipLm?.inFrameLikelihood ?? 0,
      kneeLm?.inFrameLikelihood ?? 0,
      ankleLm?.inFrameLikelihood ?? 0
    );

    const hip = pt(hipLm);
    const knee = pt(kneeLm);
    const ankle = pt(ankleLm);

    if (likelihood < MIN_LIKELIHOOD || !hip || !knee || !ankle) {
      setReadout({ frames: framesRef.current, hasLeg: false, likelihood, jointAngle: NaN, flexion: NaN });
      return;
    }
    setReadout({
      frames: framesRef.current,
      hasLeg: true,
      likelihood,
      jointAngle: jointAngleDeg(hip, knee, ankle),
      flexion: kneeFlexionDeg(hip, knee, ankle),
    });
  }, []);

  function selectLeg(next: Leg) {
    legRef.current = next;
    setLeg(next);
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.title}>Comeback</Text>
        <Text style={styles.sub}>Smoke test needs camera access.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant camera permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <Text style={styles.title}>No camera found</Text>
        <Text style={styles.sub}>Waiting for a back camera…</Text>
      </View>
    );
  }

  const r = readout;
  const trusted = r != null && r.hasLeg && !Number.isNaN(r.flexion);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PoseCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        callback={onPose}
        options={{ mode: 'stream', performanceMode: 'max' }}
      />

      <View style={styles.hud} pointerEvents="box-none">
        <View style={styles.bigBox}>
          <Text style={styles.bigLabel}>{leg.toUpperCase()} KNEE FLEXION</Text>
          <Text style={[styles.bigNum, { color: trusted ? '#3DDC97' : '#F5A524' }]}>
            {trusted ? `${r!.flexion.toFixed(0)}°` : '--'}
          </Text>
          <Text style={styles.bigSub}>
            interior angle {r && !Number.isNaN(r.jointAngle) ? `${r.jointAngle.toFixed(0)}°` : '--'}
            {'   '}(straight ≈ 180°)
          </Text>
        </View>

        <ScrollView style={styles.debug} contentContainerStyle={{ padding: 12 }}>
          <Text style={[styles.debugLine, { color: '#3DDC97' }]}>
            frames processed: {r?.frames ?? 0} {r && r.frames > 0 ? '• engine LIVE' : ''}
          </Text>
          <Text style={styles.debugLine}>
            leg confidence: {(r?.likelihood ?? 0).toFixed(2)} (need ≥ {MIN_LIKELIHOOD})
          </Text>
          <Text style={[styles.debugLine, { color: trusted ? '#3DDC97' : '#F5A524' }]}>
            {trusted ? 'leg tracking OK' : 'leg not in frame'}
          </Text>
        </ScrollView>

        <View style={styles.legRow}>
          <TouchableOpacity
            style={[styles.legBtn, leg === 'left' && styles.legBtnActive]}
            onPress={() => selectLeg('left')}
          >
            <Text style={styles.legText}>Left leg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.legBtn, leg === 'right' && styles.legBtnActive]}
            onPress={() => selectLeg('right')}
          >
            <Text style={styles.legText}>Right leg</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D10' },
  center: {
    flex: 1,
    backgroundColor: '#0B0D10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  hud: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  title: { color: '#F2F4F8', fontSize: 32, fontWeight: '800' },
  sub: { color: '#9AA0AE', fontSize: 16, marginTop: 8, marginBottom: 24, textAlign: 'center' },
  btn: { backgroundColor: '#FF6A3D', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bigBox: {
    marginTop: 60,
    marginHorizontal: 16,
    backgroundColor: 'rgba(11,13,16,0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  bigLabel: { color: '#9AA0AE', fontSize: 13, letterSpacing: 1, fontWeight: '700' },
  bigNum: { fontSize: 72, fontWeight: '900' },
  bigSub: { color: '#9AA0AE', fontSize: 13 },
  debug: {
    maxHeight: 120,
    marginHorizontal: 16,
    backgroundColor: 'rgba(11,13,16,0.6)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  debugLine: { color: '#F2F4F8', fontSize: 14, fontFamily: 'monospace', lineHeight: 20 },
  legRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 12 },
  legBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#15181E',
    borderWidth: 1,
    borderColor: '#2A2F3A',
  },
  legBtnActive: { borderColor: '#FF6A3D', backgroundColor: '#1E222B' },
  legText: { color: '#F2F4F8', fontWeight: '700' },
});
