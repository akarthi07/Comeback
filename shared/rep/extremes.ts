/**
 * Rep extremes tracking (Chunk 1, task 1.2).
 *
 * One knee-flexion reading is a single frame. A "rep" is a motion SEQUENCE:
 * the leg moves from (near) straight, into a bend, and back — passing through
 * the whole range. To report Range of Motion (ROM) we need the EXTREMES across
 * that sequence (the deepest flexion and the fullest extension), not whatever
 * the last frame happened to read.
 *
 * This module is pure (no React/native deps) so it can be unit-tested with
 * synthetic sequences, exactly like shared/math/kneeAngle.ts. Feed it one
 * sample per frame via add(); read extremes() at any time.
 *
 * Robustness ("handle the leg passing through the range"): pose output is
 * noisy and a single bad frame can spike to a wild angle. We smooth with a
 * small rolling MEDIAN (outlier-resistant, unlike a mean) and update the
 * extremes from the smoothed value, so one rogue frame can't set a false
 * max/min. Low-confidence and NaN frames are rejected outright and never
 * enter the window.
 *
 * Trade-off: median smoothing lags a sharp 1-frame peak slightly. Real reps
 * pause at the extremes (e.g. the bottom of a squat), so the held value is
 * what we capture. Task 1.6 validates this against a goniometer.
 */

export interface FrameSample {
  /** Knee flexion in clinical degrees (straight = 0). From kneeFlexionDeg(). */
  flexionDeg: number;
  /** Min in-frame landmark confidence for hip/knee/ankle, 0..1. */
  confidence: number;
}

export interface RepExtremes {
  /** Deepest bend observed (max flexion), degrees. */
  maxFlexionDeg: number;
  /** Straightest observed (max extension = min flexion), degrees. */
  minFlexionDeg: number;
  /** Range of motion = maxFlexion - minFlexion, degrees. */
  rangeDeg: number;
  /** Frames that passed the quality gate and were counted. */
  acceptedFrames: number;
}

export interface RepTrackerOptions {
  /** Reject frames below this confidence (default 0.8, matches the UI gate). */
  minConfidence?: number;
  /** Rolling median window size; odd is best (default 5). */
  smoothingWindow?: number;
}

const DEFAULT_MIN_CONFIDENCE = 0.8;
const DEFAULT_SMOOTHING_WINDOW = 5;

/** Median of a non-empty list (does not mutate the input). */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Stateful tracker for a single rep. Construct one per rep; call reset() to
 * reuse it for the next rep.
 */
export class RepTracker {
  private readonly minConfidence: number;
  private readonly windowSize: number;
  private window: number[] = [];
  private maxFlexion = Number.NEGATIVE_INFINITY;
  private minFlexion = Number.POSITIVE_INFINITY;
  private accepted = 0;
  private lastSmoothed = Number.NaN;

  constructor(opts: RepTrackerOptions = {}) {
    this.minConfidence = opts.minConfidence ?? DEFAULT_MIN_CONFIDENCE;
    this.windowSize = Math.max(1, opts.smoothingWindow ?? DEFAULT_SMOOTHING_WINDOW);
  }

  /**
   * Feed one frame. Returns the current smoothed flexion (for live display),
   * or NaN if nothing has been accepted yet. Rejected frames (low confidence
   * or NaN) leave all state untouched and return the last smoothed value.
   */
  add(sample: FrameSample): number {
    if (Number.isNaN(sample.flexionDeg) || sample.confidence < this.minConfidence) {
      return this.lastSmoothed;
    }

    this.window.push(sample.flexionDeg);
    if (this.window.length > this.windowSize) this.window.shift();

    const smoothed = median(this.window);
    this.lastSmoothed = smoothed;
    this.accepted += 1;

    if (smoothed > this.maxFlexion) this.maxFlexion = smoothed;
    if (smoothed < this.minFlexion) this.minFlexion = smoothed;

    return smoothed;
  }

  /** Current smoothed flexion, or NaN before any accepted frame. */
  get smoothedFlexionDeg(): number {
    return this.lastSmoothed;
  }

  /** Extremes so far, or null if no frame has been accepted yet. */
  extremes(): RepExtremes | null {
    if (this.accepted === 0) return null;
    return {
      maxFlexionDeg: this.maxFlexion,
      minFlexionDeg: this.minFlexion,
      rangeDeg: this.maxFlexion - this.minFlexion,
      acceptedFrames: this.accepted,
    };
  }

  /** Clear all state to start a fresh rep. */
  reset(): void {
    this.window = [];
    this.maxFlexion = Number.NEGATIVE_INFINITY;
    this.minFlexion = Number.POSITIVE_INFINITY;
    this.accepted = 0;
    this.lastSmoothed = Number.NaN;
  }
}
