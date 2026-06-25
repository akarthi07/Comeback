/**
 * Capture-quality gating (Chunk 1, task 1.3).
 *
 * A knee angle is only trustworthy if the CAPTURE was good. This module scores
 * the current frame on four independent factors and reports a single 0..1
 * quality score plus which factor (if any) failed, so the UX can tell the user
 * exactly what to fix ("turn side-on", "step closer", "level your phone").
 *
 * Factors:
 *   1. landmarksVisible - all six leg landmarks (both legs' hip/knee/ankle)
 *      are confidently detected. Without these the angle is guessed.
 *   2. sideOn          - the person is in profile, not facing the camera. A
 *      knee flexion read from a front-on view is badly foreshortened. Heuristic:
 *      when side-on, the left and right hips overlap horizontally, so the
 *      inter-hip horizontal gap is small relative to leg length.
 *   3. distance        - the leg fills a sensible fraction of the frame: too
 *      far = imprecise landmarks, too close = joints cut off.
 *   4. pitch           - the phone is roughly level/upright. Tilt distorts the
 *      projected angle. The pitch value comes from the accelerometer (task 1.5);
 *      it is an INPUT here and is simply skipped until that sensor is wired.
 *
 * Pure (no React/native deps) so it is unit-testable with synthetic landmarks,
 * exactly like shared/math/kneeAngle.ts and shared/rep/extremes.ts.
 *
 * IMPORTANT: every threshold below is a PLACEHOLDER. The real values are
 * determined empirically in task 1.6 (goniometer validation) and recorded in
 * 1.7. The structure is correct; the numbers are first guesses.
 */

export interface PoseLandmark {
  x: number;
  y: number;
  /** In-frame likelihood for this landmark, 0..1. */
  confidence: number;
}

export type Leg = 'left' | 'right';

export interface CaptureFrame {
  measuredLeg: Leg;
  leftHip: PoseLandmark;
  leftKnee: PoseLandmark;
  leftAnkle: PoseLandmark;
  rightHip: PoseLandmark;
  rightKnee: PoseLandmark;
  rightAnkle: PoseLandmark;
  /** Frame pixel dimensions, used to judge distance. */
  imageWidth: number;
  imageHeight: number;
  /**
   * Phone pitch in degrees away from level (0 = held perfectly upright).
   * From the accelerometer (task 1.5). OMIT until the sensor is wired — the
   * pitch factor is then skipped rather than failed.
   */
  pitchDeg?: number;
}

export interface FactorResult {
  /** Whether this factor is acceptable on its own. */
  ok: boolean;
  /** Graded 0..1 contribution (1 = ideal), for a smooth on-screen meter. */
  score: number;
  /** Human-readable explanation for the UX. */
  detail: string;
}

export interface QualityResult {
  /** Overall 0..1 capture quality (the weakest evaluated factor). */
  score: number;
  /** True only if every evaluated factor is ok. */
  passed: boolean;
  /** Name of the worst failing factor, or null if all passed. */
  failedFactor: keyof QualityFactors | null;
  factors: QualityFactors;
}

export interface QualityFactors {
  landmarksVisible: FactorResult;
  sideOn: FactorResult;
  distance: FactorResult;
  /** evaluated:false when no pitchDeg was supplied (accelerometer pending). */
  pitch: FactorResult & { evaluated: boolean };
}

// --- PLACEHOLDER thresholds (tune in task 1.6) ---------------------------
/** Each leg landmark must be at least this confident. */
const VIS_THRESHOLD = 0.8;
/** Confidence that maps to a visibility score of 0 (below = useless). */
const VIS_FLOOR = 0.5;
/** interHipGap / legLength at/below which we consider it fully side-on. */
const SIDEON_RATIO_GOOD = 0.15;
/** interHipGap / legLength at/above which it's clearly front-on. */
const SIDEON_RATIO_BAD = 0.4;
/** Leg length as a fraction of frame height: comfortable band. */
const DIST_FRAC_MIN = 0.35;
const DIST_FRAC_MAX = 0.85;
/** Falloff margin (in fraction units) outside the comfortable distance band. */
const DIST_FRAC_MARGIN = 0.2;
/** Phone pitch (deg) fully fine at/below this. */
const PITCH_GOOD_DEG = 3;
/** Phone pitch (deg) unacceptable at/above this. */
const PITCH_MAX_DEG = 12;
/** A factor's score at/above which it is considered "ok" (for graded factors). */
const FACTOR_OK_SCORE = 0.5;
// -------------------------------------------------------------------------

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const dist = (a: PoseLandmark, b: PoseLandmark) => Math.hypot(a.x - b.x, a.y - b.y);

/** Higher input is better: floor -> 0, full -> 1. */
function risingScore(v: number, floor: number, full: number): number {
  return clamp01((v - floor) / (full - floor));
}

/** Lower input is better: good -> 1, bad -> 0. */
function fallingScore(v: number, good: number, bad: number): number {
  if (v <= good) return 1;
  if (v >= bad) return 0;
  return (bad - v) / (bad - good);
}

/** 1 inside [lo, hi], ramping to 0 over `margin` on either side. */
function plateauScore(v: number, lo: number, hi: number, margin: number): number {
  if (v >= lo && v <= hi) return 1;
  if (v < lo) return clamp01(1 - (lo - v) / margin);
  return clamp01(1 - (v - hi) / margin);
}

function pick(frame: CaptureFrame, leg: Leg): [PoseLandmark, PoseLandmark, PoseLandmark] {
  return leg === 'left'
    ? [frame.leftHip, frame.leftKnee, frame.leftAnkle]
    : [frame.rightHip, frame.rightKnee, frame.rightAnkle];
}

/**
 * Score a single captured frame. Pure: same input -> same output.
 */
export function scoreCaptureQuality(frame: CaptureFrame): QualityResult {
  const all = [
    frame.leftHip, frame.leftKnee, frame.leftAnkle,
    frame.rightHip, frame.rightKnee, frame.rightAnkle,
  ];
  const [hip, , ankle] = pick(frame, frame.measuredLeg);
  const legLengthPx = dist(hip, ankle);

  // 1. landmarks visible
  const minConf = Math.min(...all.map((l) => l.confidence));
  const landmarksVisible: FactorResult = {
    ok: minConf >= VIS_THRESHOLD,
    score: risingScore(minConf, VIS_FLOOR, VIS_THRESHOLD),
    detail:
      minConf >= VIS_THRESHOLD
        ? 'all six leg landmarks visible'
        : `a leg landmark is weak (min confidence ${minConf.toFixed(2)})`,
  };

  // 2. side-on
  const interHipGap = Math.abs(frame.leftHip.x - frame.rightHip.x);
  const sideOnRatio = legLengthPx > 0 ? interHipGap / legLengthPx : Number.POSITIVE_INFINITY;
  const sideOnScore = fallingScore(sideOnRatio, SIDEON_RATIO_GOOD, SIDEON_RATIO_BAD);
  const sideOn: FactorResult = {
    ok: sideOnScore >= FACTOR_OK_SCORE,
    score: sideOnScore,
    detail:
      sideOnScore >= FACTOR_OK_SCORE
        ? 'good side-on profile'
        : 'turn side-on to the camera (you look front-facing)',
  };

  // 3. distance
  const distanceFrac = frame.imageHeight > 0 ? legLengthPx / frame.imageHeight : 0;
  const distanceScore = plateauScore(distanceFrac, DIST_FRAC_MIN, DIST_FRAC_MAX, DIST_FRAC_MARGIN);
  const distance: FactorResult = {
    ok: distanceFrac >= DIST_FRAC_MIN && distanceFrac <= DIST_FRAC_MAX,
    score: distanceScore,
    detail:
      distanceFrac < DIST_FRAC_MIN
        ? 'step closer (leg too small in frame)'
        : distanceFrac > DIST_FRAC_MAX
        ? 'step back (leg too large / may be cut off)'
        : 'good distance',
  };

  // 4. pitch (skipped until the accelerometer is wired)
  let pitch: FactorResult & { evaluated: boolean };
  if (frame.pitchDeg === undefined) {
    pitch = { evaluated: false, ok: true, score: 1, detail: 'pitch not measured (accelerometer pending 1.5)' };
  } else {
    const absPitch = Math.abs(frame.pitchDeg);
    const pitchScore = fallingScore(absPitch, PITCH_GOOD_DEG, PITCH_MAX_DEG);
    pitch = {
      evaluated: true,
      ok: absPitch <= PITCH_MAX_DEG,
      score: pitchScore,
      detail: absPitch <= PITCH_MAX_DEG ? 'phone level enough' : 'level your phone',
    };
  }

  const factors: QualityFactors = { landmarksVisible, sideOn, distance, pitch };

  // Overall = weakest link among evaluated factors. Any single bad factor
  // ruins the measurement, so we don't average.
  const evaluated: FactorResult[] = [landmarksVisible, sideOn, distance];
  if (pitch.evaluated) evaluated.push(pitch);
  const score = Math.min(...evaluated.map((f) => f.score));

  // Worst failing factor (lowest score among the not-ok ones).
  const order: (keyof QualityFactors)[] = ['landmarksVisible', 'sideOn', 'distance', 'pitch'];
  let failedFactor: keyof QualityFactors | null = null;
  let worst = Number.POSITIVE_INFINITY;
  for (const name of order) {
    const f = factors[name];
    if (name === 'pitch' && !factors.pitch.evaluated) continue;
    if (!f.ok && f.score < worst) {
      worst = f.score;
      failedFactor = name;
    }
  }

  return { score, passed: failedFactor === null, failedFactor, factors };
}
