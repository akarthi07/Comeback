import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Camera as PoseCamera } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';

import { kneeFlexionDeg } from '../../shared/math/kneeAngle';
import { CalibrationSession, type CalibrationResult } from '../../shared/calibration/calibrate';
import type { Leg } from '../../shared/capture/quality';
import { palette, radius, spacing, tabularNums } from '../theme';
import { Text, Button } from '../components';
import { parsePose, legTriple, type ParsedPose } from '../measure/poseData';
import type { Calibration } from '../store/types';

interface Props {
  leg: Leg;
  onDone: (calibration: Calibration | null) => void;
}

const MIN_CONFIDENCE = 0.8;
const CAPTURE_MS = 4000;

/**
 * The one-time straight-leg calibration (Chunk 1.4 wired to the camera). The
 * user stands side-on and holds the injured leg straight; we collect
 * confidence-gated raw flexion readings and learn the constant offset to
 * subtract from every future measurement (single-camera 2D pose reads a few
 * false degrees on a truly straight leg). Skippable — can be redone later.
 */
export function CalibrateStep({ leg, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  const [live, setLive] = useState<number>(NaN);
  const [confidence, setConfidence] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CalibrationResult | null>(null);

  const sessionRef = useRef(new CalibrationSession(MIN_CONFIDENCE));
  const capturingRef = useRef(false);

  const onPose = useCallback((data: any) => {
    const parsed: ParsedPose = parsePose(data);
    const triple = legTriple(parsed, leg);
    if (!triple) {
      setLive(NaN);
      setConfidence(0);
      return;
    }
    const [hip, knee, ankle] = triple;
    const raw = kneeFlexionDeg(hip, knee, ankle);
    const conf = Math.min(hip.confidence, knee.confidence, ankle.confidence);
    setLive(raw);
    setConfidence(conf);
    if (capturingRef.current) sessionRef.current.add(raw, conf);
  }, [leg]);

  // Drive the fixed-length capture window.
  useEffect(() => {
    if (!capturing) return;
    sessionRef.current.reset();
    capturingRef.current = true;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => setProgress(Math.min(1, (Date.now() - start) / CAPTURE_MS)), 80);
    const done = setTimeout(() => {
      capturingRef.current = false;
      setCapturing(false);
      setResult(sessionRef.current.finalize());
    }, CAPTURE_MS);
    return () => { clearInterval(tick); clearTimeout(done); };
  }, [capturing]);

  function accept() {
    if (!result) return;
    onDone({
      offsetDeg: Math.round(result.offsetDeg * 10) / 10,
      samples: result.sampleCount,
      ok: result.ok,
      updatedAt: new Date().toISOString(),
    });
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text variant="h1">Calibrate your measurement</Text>
        <Text variant="body" tone="mid" center style={{ marginVertical: spacing.lg }}>
          One quick camera step teaches Comeback your setup so every reading is accurate.
          Nothing leaves your phone.
        </Text>
        <Button title="Grant camera access" full onPress={requestPermission} />
        <View style={{ height: spacing.md }} />
        <Button title="Skip for now" variant="ghost" full onPress={() => onDone(null)} />
      </View>
    );
  }
  if (!device) {
    return (
      <View style={styles.center}>
        <Text variant="h2">No camera found</Text>
        <View style={{ height: spacing.md }} />
        <Button title="Skip for now" variant="ghost" full onPress={() => onDone(null)} />
      </View>
    );
  }

  // Result view.
  if (result) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + spacing.x2 }]}>
        <Text variant="label" tone="mid">Calibration</Text>
        {result.ok ? (
          <>
            <Text variant="display" tone="green" style={[tabularNums, { marginVertical: spacing.sm }]}>
              {result.offsetDeg.toFixed(1)}°
            </Text>
            <Text variant="body" tone="mid" center>
              We'll subtract {result.offsetDeg.toFixed(1)}° from every reading so a straight leg
              reads zero. Learned from {result.sampleCount} steady samples.
            </Text>
            <View style={{ height: spacing.xl }} />
            <Button title="Use this calibration" full onPress={accept} />
            <View style={{ height: spacing.md }} />
            <Button title="Redo" variant="secondary" full onPress={() => setResult(null)} />
          </>
        ) : (
          <>
            <Text variant="h1" style={{ marginVertical: spacing.sm }}>Let's try that again</Text>
            <Text variant="body" tone="mid" center>
              {result.sampleCount < 10
                ? "I couldn't see your leg clearly enough. Stand side-on with your whole body in frame."
                : `Your leg moved a little (spread ${Math.round(result.spreadDeg)}°). Hold it straight and still.`}
            </Text>
            <View style={{ height: spacing.xl }} />
            <Button title="Retry calibration" full onPress={() => setResult(null)} />
            <View style={{ height: spacing.md }} />
            <Button title="Skip for now" variant="ghost" full onPress={() => onDone(null)} />
          </>
        )}
      </View>
    );
  }

  // Live capture view.
  const ready = !Number.isNaN(live) && confidence >= MIN_CONFIDENCE;
  return (
    <View style={styles.root}>
      <PoseCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        callback={onPose}
        options={{ mode: 'stream', performanceMode: 'max' }}
      />
      <View style={[styles.hud, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl }]} pointerEvents="box-none">
        <View style={styles.angleChip}>
          <Text variant="label" tone="mid">{leg} knee · straight</Text>
          <Text variant="display" tone={ready ? 'green' : 'mid'} style={[styles.angleNum, tabularNums]}>
            {Number.isNaN(live) ? '--' : `${Math.round(live)}°`}
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          {capturing ? (
            <View style={styles.card}>
              <Text variant="h2">Hold still — straight leg…</Text>
              <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text variant="bodyStrong" tone={ready ? 'green' : 'hi'}>
                {ready ? 'Ready — leg detected' : 'Stand side-on, whole body in frame'}
              </Text>
              <Text variant="caption" tone="mid">
                Straighten your {leg} leg fully and hold it steady, then capture.
              </Text>
            </View>
          )}
          <Button
            title={capturing ? 'Capturing…' : 'Capture straight leg'}
            full
            disabled={!ready || capturing}
            onPress={() => setCapturing(true)}
          />
          {!capturing && (
            <Button title="Skip for now" variant="ghost" full onPress={() => onDone(null)} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  center: { flex: 1, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', padding: spacing.x2 },
  hud: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  angleChip: {
    alignSelf: 'center', alignItems: 'center',
    backgroundColor: 'rgba(11,13,16,0.55)', borderRadius: radius.lg,
    paddingHorizontal: spacing.x2, paddingVertical: spacing.sm,
  },
  angleNum: { fontSize: 60, lineHeight: 66 },
  card: {
    backgroundColor: 'rgba(11,13,16,0.72)', borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth, borderColor: palette.hairline,
    padding: spacing.lg, gap: spacing.sm,
  },
  track: { height: 6, borderRadius: 6, backgroundColor: palette.surfaceAlt, overflow: 'hidden', marginTop: spacing.sm },
  fill: { height: '100%', backgroundColor: palette.green },
});
