/** Domain types shared across the persisted stores. */

export type Leg = 'left' | 'right';

export interface Goal {
  injuredLeg: Leg;
  /** Target knee flexion in degrees (e.g. 135 = deep bend restored). */
  targetFlexion: number;
  /** What they're coming back to do — "soccer", "running", "stairs without thinking". */
  activity: string;
  /** ISO date string, optional target. */
  targetDate?: string;
  createdAt: string;
}

export interface Calibration {
  /** Degrees of systematic offset to subtract from raw flexion. */
  offsetDeg: number;
  samples: number;
  ok: boolean;
  updatedAt: string;
}

export interface MeasurementSession {
  id: string;
  dateISO: string;
  leg: Leg;
  /** Best (deepest) flexion reached this session, in degrees. */
  maxFlexion: number;
  /** Closest-to-straight reached this session, in degrees of flexion (lower = better). */
  maxExtension: number;
  repCount?: number;
  /** 0..1 capture quality score. */
  quality?: number;
  notes?: string;
}

export interface ConfidenceCheck {
  id: string;
  dateISO: string;
  /** Self-reported trust in the leg, 0..100. */
  score: number;
  prompt?: string;
  note?: string;
}

export interface LadderRung {
  id: string;
  label: string;
  /** Optional flexion target that auto-completes the rung when reached. */
  targetFlexion?: number;
  done: boolean;
  doneDateISO?: string;
}

export interface LadderProgress {
  rungs: LadderRung[];
}
