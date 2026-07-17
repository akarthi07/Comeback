import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Camera as PoseCamera } from '@scottjgilroy/react-native-vision-camera-v4-pose-detection';

import { kneeFlexionDeg } from '../../shared/math/kneeAngle';
import { scoreCaptureQuality, type QualityResult, type Leg } from '../../shared/capture/quality';
import { applyCalibration } from '../../shared/calibration/calibrate';
import { RepTracker } from '../../shared/rep/extremes';

import { palette, radius, spacing, tabularNums } from '../theme';
import { Text, Button } from '../components';
import { useGoal, useCalibration, useSessions } from '../store';
import { parsePose, toCaptureFrame, legTriple, type ParsedPose, type ViewMap } from '../measure/poseData';
import { useAccelerometer } from '../measure/useAccelerometer';
import { PoseOverlay } from '../measure/PoseOverlay';
import { CaptureGuide } from '../measure/CaptureGuide';
import { MeasurementResult, type MeasureResult } from '../measure/MeasurementResult';

type Phase = 'position' | 'straighten' | 'bend' | 'result';

const STRAIGHTEN_MS = 3500;
const BEND_MS = 4500;
const MIN_CONFIDENCE = 0.8;

export function MeasureScreen() {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  // TEMP: front cam so you can see yourself; revert to 'back' for production.
  const device = useCameraDevice('front');

  const goal = useGoal((s) => s.goal);
  const calibration = useCalibration((s) => s.calibration);
  const sessions = useSessions((s) => s.sessions);
  const addSession = useSessions((s) => s.addSession);

  const [leg, setLeg] = useState<Leg>(goal?.injuredLeg ?? 'left');
  const [phase, setPhase] = useState<Phase>('position');
  const [parsed, setParsed] = useState<ParsedPose | null>(null);
  const [quality, setQuality] = useState<QualityResult | null>(null);
  const [liveFlexion, setLiveFlexion] = useState<number>(NaN);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MeasureResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState({ w: 0, h: 0 });

  const legRef = useRef<Leg>(leg);
  const phaseRef = useRef<Phase>('position');
  const recordingRef = useRef(false);
  const pitchRef = useRef<number | undefined>(undefined);
  const trackerRef = useRef(new RepTracker({ minConfidence: MIN_CONFIDENCE }));
  const offset = calibration?.offsetDeg ?? 0;

  const pitch = useAccelerometer(phase !== 'result');
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);
  useEffect(() => { legRef.current = leg; }, [leg]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const onPose = useCallback((data: any) => {
    const p = parsePose(data);
    setParsed(p);

    const triple = legTriple(p, legRef.current);
    if (!triple) {
      setQuality(null);
      setLiveFlexion(NaN);
      return;
    }
    const [hip, knee, ankle] = triple;
    const rawFlexion = kneeFlexionDeg(hip, knee, ankle);
    const flexion = applyCalibration(rawFlexion, offset);
    const confidence = Math.min(hip.confidence, knee.confidence, ankle.confidence);

    const frame = toCaptureFrame(p, legRef.current, pitchRef.current);
    setQuality(frame ? scoreCaptureQuality(frame) : null);

    if (recordingRef.current) {
      const smoothed = trackerRef.current.add({ flexionDeg: flexion, confidence });
      setLiveFlexion(Number.isNaN(smoothed) ? flexion : smoothed);
    } else {
      setLiveFlexion(flexion);
    }
  }, [offset]);

  // Drive the recording phases with timers + a progress ring.
  useEffect(() => {
    if (phase === 'position' || phase === 'result') {
      recordingRef.current = false;
      return;
    }
    if (phase === 'straighten') trackerRef.current.reset();
    recordingRef.current = true;

    const duration = phase === 'straighten' ? STRAIGHTEN_MS : BEND_MS;
    const start = Date.now();
    setProgress(0);
    const tick = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - start) / duration));
    }, 80);
    const done = setTimeout(() => {
      if (phase === 'straighten') {
        setPhase('bend');
      } else {
        recordingRef.current = false;
        const ex = trackerRef.current.extremes();
        if (ex) {
          setResult({
            leg: legRef.current,
            maxFlexionDeg: ex.maxFlexionDeg,
            minFlexionDeg: ex.minFlexionDeg,
            rangeDeg: ex.rangeDeg,
            acceptedFrames: ex.acceptedFrames,
          });
          setSaved(false);
          setPhase('result');
        } else {
          setPhase('position'); // nothing captured, try again
        }
      }
    }, duration);

    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [phase]);

  const onLayout = (e: LayoutChangeEvent) =>
    setView({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  function saveResult() {
    if (!result) return;
    addSession({
      id: `sess_${Date.now().toString(36)}`,
      dateISO: new Date().toISOString(),
      leg: result.leg,
      maxFlexion: Math.round(result.maxFlexionDeg),
      maxExtension: Math.round(result.minFlexionDeg),
      quality: quality?.score,
    });
    setSaved(true);
  }

  function redo() {
    setResult(null);
    setSaved(false);
    setPhase('position');
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text variant="h1">Camera access</Text>
        <Text variant="body" tone="mid" center style={{ marginVertical: spacing.lg }}>
          Comeback reads your knee angle on-device. Nothing leaves your phone.
        </Text>
        <Button title="Grant camera access" onPress={requestPermission} />
      </View>
    );
  }
  if (!device) {
    return (
      <View style={styles.center}>
        <Text variant="h2">No camera found</Text>
      </View>
    );
  }

  // Result view replaces the camera once captured.
  if (phase === 'result' && result) {
    const other: Leg = result.leg === 'left' ? 'right' : 'left';
    const otherSession = sessions.find((s) => s.leg === other);
    return (
      <MeasurementResult
        result={result}
        otherLegFlexion={otherSession?.maxFlexion}
        saved={saved}
        onSave={saveResult}
        onRedo={redo}
      />
    );
  }

  const map: ViewMap = {
    viewW: view.w,
    viewH: view.h,
    imageW: parsed?.imageWidth ?? 0,
    imageH: parsed?.imageHeight ?? 0,
    mirror: true, // front camera preview is mirrored
  };
  const ready = quality?.passed ?? false;
  const recording = phase === 'straighten' || phase === 'bend';
  const liveStr = Number.isNaN(liveFlexion) ? '--' : `${Math.round(liveFlexion)}°`;
  const phaseLabel =
    phase === 'straighten' ? 'Straighten your leg fully'
    : phase === 'bend' ? 'Bend as far as is comfortable'
    : null;

  return (
    <View style={styles.root} onLayout={onLayout}>
      <PoseCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        callback={onPose}
        options={{ mode: 'stream', performanceMode: 'max' }}
      />

      {parsed && <PoseOverlay parsed={parsed} measuredLeg={leg} map={map} active={recording ? true : ready} />}

      <View style={[styles.hud, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 80 }]} pointerEvents="box-none">
        {/* top: live angle */}
        <View style={styles.angleChip}>
          <Text variant="label" tone="mid">{leg} knee</Text>
          <Text variant="display" tone={ready || recording ? 'green' : 'mid'} style={[styles.angleNum, tabularNums]}>
            {liveStr}
          </Text>
        </View>

        {/* bottom: guidance + controls */}
        <View style={{ gap: spacing.md }}>
          {recording ? (
            <View style={styles.recordCard}>
              <Text variant="h2" tone="hi">{phaseLabel}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text variant="caption" tone="mid">Hold steady — capturing your range…</Text>
            </View>
          ) : (
            <>
              <CaptureGuide quality={quality} hasPose={parsed?.hasPose ?? false} />
              <View style={styles.legRow}>
                <LegPill label="Left leg" active={leg === 'left'} onPress={() => setLeg('left')} />
                <LegPill label="Right leg" active={leg === 'right'} onPress={() => setLeg('right')} />
              </View>
              <Button
                title={ready ? 'Start measurement' : 'Line up the shot first'}
                full
                disabled={!ready}
                onPress={() => setPhase('straighten')}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function LegPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.legPill, active && styles.legPillActive]}>
      <Text variant="bodyStrong" tone={active ? 'hi' : 'mid'}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  center: { flex: 1, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', padding: spacing.x2 },
  hud: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  angleChip: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11,13,16,0.55)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.x2,
    paddingVertical: spacing.sm,
  },
  angleNum: { fontSize: 64, lineHeight: 70 },
  recordCard: {
    backgroundColor: 'rgba(11,13,16,0.72)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.green,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: palette.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: palette.green, borderRadius: 8 },
  legRow: { flexDirection: 'row', gap: spacing.sm, alignSelf: 'center' },
  legPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: 'rgba(21,24,30,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
  },
  legPillActive: { borderColor: palette.green, backgroundColor: palette.greenSoft },
});
