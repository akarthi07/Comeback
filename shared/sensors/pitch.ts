/**
 * Phone pitch from the accelerometer (Chunk 1, task 1.5).
 *
 * Tilting the phone forward/back pitches the camera's optical axis up/down,
 * which foreshortens the projected leg and corrupts the knee angle. We read the
 * accelerometer (gravity) to measure that pitch and GATE on it: if the phone is
 * tilted beyond tolerance we block recording and prompt "level your phone".
 *
 * Policy decision (honest): we do NOT apply an unvalidated angular correction to
 * the flexion number. Any geometric correction would itself need goniometer
 * validation, so until 1.6 the rule is simply block-if-out-of-tolerance and
 * assume within-tolerance error is negligible. 1.6 confirms the tolerance and
 * decides whether a correction is worth adding.
 *
 * Coordinate convention (Android sensor frame, phone held in portrait):
 *   x = right across the screen, y = up along the screen, z = out of the screen
 *   toward the user; the back camera looks along -z. At rest the accelerometer
 *   reports the gravity reaction vector. When the phone is upright (screen
 *   vertical, normal photo pose) the camera axis is horizontal and gravity has
 *   no z-component -> pitch 0. Lying flat (screen up) -> pitch 90.
 *
 * Pure and unit-testable: feed it raw accelerometer components.
 */

export interface PitchGate {
  /** True if the phone is level enough to record. */
  ok: boolean;
  /** |pitch| from upright, in degrees (NaN if the reading was unusable). */
  deviationDeg: number;
  /** The tolerance that was applied. */
  toleranceDeg: number;
  /** Message for the UX. */
  message: string;
}

// --- PLACEHOLDER (confirm in task 1.6) -----------------------------------
/** Max |pitch| from upright before we block recording. */
const PITCH_TOLERANCE_DEG = 12;
// -------------------------------------------------------------------------

const toDeg = (rad: number) => (rad * 180) / Math.PI;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Signed phone pitch in degrees from the upright photo pose (0 = upright,
 * +/-90 = lying flat). Returns NaN for an unusable (zero-magnitude) reading.
 *
 * Derived from the z-component of gravity: upright -> gz=0 -> pitch 0;
 * flat -> gravity entirely along z -> pitch 90.
 */
export function pitchDegFromAccel(ax: number, ay: number, az: number): number {
  const norm = Math.hypot(ax, ay, az);
  if (norm === 0 || Number.isNaN(norm)) return NaN;
  return toDeg(Math.asin(clamp(az / norm, -1, 1)));
}

/**
 * Decide whether the phone is level enough. Pass either a pitch from
 * pitchDegFromAccel() or any measured pitch. A NaN pitch is treated as "can't
 * read orientation" -> not ok.
 */
export function evaluatePitch(
  pitchDeg: number,
  toleranceDeg: number = PITCH_TOLERANCE_DEG
): PitchGate {
  if (Number.isNaN(pitchDeg)) {
    return {
      ok: false,
      deviationDeg: NaN,
      toleranceDeg,
      message: 'cannot read phone orientation',
    };
  }
  const deviationDeg = Math.abs(pitchDeg);
  const ok = deviationDeg <= toleranceDeg;
  return {
    ok,
    deviationDeg,
    toleranceDeg,
    message: ok ? 'phone level enough' : 'level your phone',
  };
}
