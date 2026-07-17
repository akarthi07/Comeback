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
  /**
   * Overall ACL-RSI score, 0..100 (higher = more psychologically ready).
   * Kept as `score` so trend/gap views read one field regardless of source.
   */
  score: number;
  /** ACL-RSI subscale means, present on full 12-item checks. */
  emotions?: number;
  confidence?: number;
  riskAppraisal?: number;
  /** The 12 raw item answers (0..100) in item order, for auditability. */
  responses?: number[];
  prompt?: string;
  note?: string;
}

export interface LadderRung {
  id: string;
  label: string;
  /** Short cue on what this rung actually is / how to attempt it. */
  note?: string;
  /** Optional flexion target that auto-completes the rung when reached. */
  targetFlexion?: number;
  done: boolean;
  doneDateISO?: string;
}

export interface LadderProgress {
  rungs: LadderRung[];
}
