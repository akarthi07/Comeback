/**
 * Per-user calibration (Chunk 1, task 1.4).
 *
 * Single-camera 2D pose systematically reads a few degrees of flexion on a leg
 * that is actually straight (landmark jitter + perspective). That bias differs
 * per person/setup, so we learn it ONCE: the user stands with the leg straight,
 * we collect readings, and the learned offset is subtracted from every future
 * reading. A truly straight leg should then read ~0deg.
 *
 * Model = a single constant offset (per the task spec). Whether a constant is
 * good enough across the whole flexion range is exactly what task 1.6 checks;
 * if not, this is where a range-dependent correction would later go.
 *
 * Pure (no React/native/storage deps): computeCalibration() does the math,
 * applyCalibration() applies it. Persisting the offset (AsyncStorage etc.) and
 * gating samples on capture quality happen at integration time.
 */

export interface CalibrationResult {
  /** Degrees to subtract from each raw flexion reading. */
  offsetDeg: number;
  /** How many accepted samples produced this offset. */
  sampleCount: number;
  /** Spread (max-min) of accepted samples — low = a steady straight leg. */
  spreadDeg: number;
  /** True if there were enough, steady-enough samples to trust the offset. */
  ok: boolean;
}

// --- PLACEHOLDER thresholds (confirm in task 1.6) ------------------------
/** Need at least this many straight-leg samples to calibrate. */
const MIN_SAMPLES = 10;
/** If straight-leg readings vary more than this, the user wasn't steady. */
const MAX_SPREAD_DEG = 5;
/** Default confidence gate for collected samples. */
const DEFAULT_MIN_CONFIDENCE = 0.8;
// -------------------------------------------------------------------------

/** Median of a non-empty list (does not mutate input). */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Compute a calibration offset from a set of straight-leg flexion readings.
 * Uses the median (robust to the odd bad frame). The offset is returned even
 * when ok is false, so the caller can show it while warning it's unreliable.
 */
export function computeCalibration(straightLegFlexions: number[]): CalibrationResult {
  const samples = straightLegFlexions.filter((v) => !Number.isNaN(v));
  if (samples.length === 0) {
    return { offsetDeg: 0, sampleCount: 0, spreadDeg: 0, ok: false };
  }
  const offsetDeg = median(samples);
  const spreadDeg = Math.max(...samples) - Math.min(...samples);
  const ok = samples.length >= MIN_SAMPLES && spreadDeg <= MAX_SPREAD_DEG;
  return { offsetDeg, sampleCount: samples.length, spreadDeg, ok };
}

/**
 * Apply a calibration offset to a raw flexion reading. Clamped at 0 because a
 * straight (or hyperextended-looking) leg should never report negative flexion.
 */
export function applyCalibration(rawFlexionDeg: number, offsetDeg: number): number {
  if (Number.isNaN(rawFlexionDeg)) return NaN;
  return Math.max(0, rawFlexionDeg - offsetDeg);
}

/**
 * Collects straight-leg samples during a calibration session, gating on
 * landmark confidence. Mirrors the RepTracker pattern. Call finalize() to get
 * the CalibrationResult.
 */
export class CalibrationSession {
  private readonly minConfidence: number;
  private samples: number[] = [];

  constructor(minConfidence: number = DEFAULT_MIN_CONFIDENCE) {
    this.minConfidence = minConfidence;
  }

  /** Feed one straight-leg frame. Rejected if NaN or low confidence. */
  add(flexionDeg: number, confidence: number): void {
    if (Number.isNaN(flexionDeg) || confidence < this.minConfidence) return;
    this.samples.push(flexionDeg);
  }

  get count(): number {
    return this.samples.length;
  }

  finalize(): CalibrationResult {
    return computeCalibration(this.samples);
  }

  reset(): void {
    this.samples = [];
  }
}
