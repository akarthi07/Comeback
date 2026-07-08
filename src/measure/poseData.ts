/**
 * Bridge between the raw pose-plugin callback and the Chunk 1 engine.
 *
 * The native plugin emits one map per frame: `<landmark>Position: {x, y,
 * inFrameLikelihood}` in rotation-corrected image pixels, plus `imageWidth` /
 * `imageHeight` (added via our patch). This module parses that into typed
 * landmarks and assembles the CaptureFrame the quality gate expects.
 */
import type { CaptureFrame, PoseLandmark, Leg } from '../../shared/capture/quality';

export interface RawLandmark {
  x: number;
  y: number;
  inFrameLikelihood: number;
}

/** The landmarks we actually use, normalized to {x, y, confidence}. */
export interface ParsedPose {
  imageWidth: number;
  imageHeight: number;
  hasPose: boolean;
  pts: Partial<Record<PointName, PoseLandmark>>;
}

export type PointName =
  | 'leftShoulder' | 'rightShoulder'
  | 'leftHip' | 'rightHip'
  | 'leftKnee' | 'rightKnee'
  | 'leftAnkle' | 'rightAnkle'
  | 'leftHeel' | 'rightHeel'
  | 'leftFootIndex' | 'rightFootIndex';

const KEYS: Record<PointName, string> = {
  leftShoulder: 'leftShoulderPosition',
  rightShoulder: 'rightShoulderPosition',
  leftHip: 'leftHipPosition',
  rightHip: 'rightHipPosition',
  leftKnee: 'leftKneePosition',
  rightKnee: 'rightKneePosition',
  leftAnkle: 'leftAnklePosition',
  rightAnkle: 'rightAnklePosition',
  leftHeel: 'leftHeelPosition',
  rightHeel: 'rightHeelPosition',
  leftFootIndex: 'leftFootIndexPosition',
  rightFootIndex: 'rightFootIndexPosition',
};

function toLandmark(raw: RawLandmark | undefined): PoseLandmark | undefined {
  if (!raw || typeof raw.x !== 'number' || typeof raw.y !== 'number') return undefined;
  // The plugin returns 0,0 for an undetected landmark.
  if (raw.x === 0 && raw.y === 0) return undefined;
  return { x: raw.x, y: raw.y, confidence: raw.inFrameLikelihood ?? 0 };
}

export function parsePose(data: any): ParsedPose {
  const pts: Partial<Record<PointName, PoseLandmark>> = {};
  let any = false;
  for (const name of Object.keys(KEYS) as PointName[]) {
    const lm = toLandmark(data?.[KEYS[name]]);
    if (lm) {
      pts[name] = lm;
      any = true;
    }
  }
  return {
    imageWidth: data?.imageWidth ?? 0,
    imageHeight: data?.imageHeight ?? 0,
    hasPose: any,
    pts,
  };
}

const ZERO: PoseLandmark = { x: 0, y: 0, confidence: 0 };

/**
 * Build the CaptureFrame for the quality engine. Returns null if the measured
 * leg's hip/knee/ankle aren't all present (nothing trustworthy to score).
 */
export function toCaptureFrame(
  parsed: ParsedPose,
  measuredLeg: Leg,
  pitchDeg?: number
): CaptureFrame | null {
  const p = parsed.pts;
  const need: PointName[] =
    measuredLeg === 'left'
      ? ['leftHip', 'leftKnee', 'leftAnkle']
      : ['rightHip', 'rightKnee', 'rightAnkle'];
  if (need.some((n) => !p[n])) return null;

  return {
    measuredLeg,
    leftHip: p.leftHip ?? ZERO,
    leftKnee: p.leftKnee ?? ZERO,
    leftAnkle: p.leftAnkle ?? ZERO,
    rightHip: p.rightHip ?? ZERO,
    rightKnee: p.rightKnee ?? ZERO,
    rightAnkle: p.rightAnkle ?? ZERO,
    imageWidth: parsed.imageWidth,
    imageHeight: parsed.imageHeight,
    ...(pitchDeg !== undefined ? { pitchDeg } : {}),
  };
}

/** The hip/knee/ankle triple for a leg, or null if any is missing. */
export function legTriple(
  parsed: ParsedPose,
  leg: Leg
): [PoseLandmark, PoseLandmark, PoseLandmark] | null {
  const p = parsed.pts;
  const hip = leg === 'left' ? p.leftHip : p.rightHip;
  const knee = leg === 'left' ? p.leftKnee : p.rightKnee;
  const ankle = leg === 'left' ? p.leftAnkle : p.rightAnkle;
  if (!hip || !knee || !ankle) return null;
  return [hip, knee, ankle];
}

export interface ViewMap {
  viewW: number;
  viewH: number;
  imageW: number;
  imageH: number;
  mirror: boolean;
}

/**
 * Map an image-space point to on-screen coordinates for an overlay drawn on top
 * of a `cover`-scaled camera preview. `mirror` flips X for the front camera.
 */
export function mapPoint(p: { x: number; y: number }, m: ViewMap): { x: number; y: number } {
  if (m.imageW <= 0 || m.imageH <= 0) return { x: 0, y: 0 };
  const scale = Math.max(m.viewW / m.imageW, m.viewH / m.imageH);
  const dispW = m.imageW * scale;
  const dispH = m.imageH * scale;
  const offX = (m.viewW - dispW) / 2;
  const offY = (m.viewH - dispH) / 2;
  let x = offX + p.x * scale;
  const y = offY + p.y * scale;
  if (m.mirror) x = m.viewW - x;
  return { x, y };
}
