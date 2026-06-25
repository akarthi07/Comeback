/**
 * Core knee-angle math (Chunk 1, task 1.1).
 *
 * Works purely on 2D image-plane coordinates (x, y). The `z` depth estimate
 * from single-camera pose is unreliable, so it is deliberately ignored.
 *
 * The interior angle between two vectors is invariant to rotation/flip of the
 * coordinate frame, so camera orientation does not corrupt the reading.
 */

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Interior angle at the knee vertex, in degrees.
 * Between the thigh vector (knee -> hip) and the shin vector (knee -> ankle).
 * A fully straight leg ~= 180 degrees.
 *
 * Returns NaN if a segment has zero length (degenerate / missing landmarks).
 */
export function jointAngleDeg(hip: Point2D, knee: Point2D, ankle: Point2D): number {
  const thighX = hip.x - knee.x;
  const thighY = hip.y - knee.y;
  const shinX = ankle.x - knee.x;
  const shinY = ankle.y - knee.y;

  const dot = thighX * shinX + thighY * shinY;
  const magThigh = Math.hypot(thighX, thighY);
  const magShin = Math.hypot(shinX, shinY);

  if (magThigh === 0 || magShin === 0) return NaN;

  // Clamp to [-1, 1] to guard against floating-point drift outside acos domain.
  let cos = dot / (magThigh * magShin);
  cos = Math.max(-1, Math.min(1, cos));

  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Knee FLEXION in clinical convention:
 *   straight leg  = 0 deg
 *   fully bent    = high number (toward ~140 deg)
 *
 * This is simply 180 - the interior joint angle.
 * Returns NaN for degenerate input.
 */
export function kneeFlexionDeg(hip: Point2D, knee: Point2D, ankle: Point2D): number {
  const angle = jointAngleDeg(hip, knee, ankle);
  return Number.isNaN(angle) ? NaN : 180 - angle;
}
