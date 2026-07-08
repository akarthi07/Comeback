import type { Goal, MeasurementSession, ConfidenceCheck } from '../store/types';
import { useGoal } from '../store/useGoal';
import { useSessions } from '../store/useSessions';
import { useConfidence } from '../store/useConfidence';
import { mmkv } from '../store/storage';

const DAY = 86_400_000;
const SEED_FLAG = 'comeback.seeded';

let _id = 0;
const id = (p: string) => `${p}_${Date.now().toString(36)}_${_id++}`;

/**
 * Eight weeks of a believable comeback: the knee heals steadily (flexion climbs
 * from ~70° toward the 135° goal) while self-reported confidence trails it the
 * whole way. That divergence is the Readiness Gap — the story the demo must tell.
 */
export function buildMockData(): {
  goal: Goal;
  sessions: MeasurementSession[];
  checks: ConfidenceCheck[];
} {
  const now = Date.now();
  const WEEKS = 8;

  const goal: Goal = {
    injuredLeg: 'left',
    targetFlexion: 135,
    activity: 'get back on the pitch',
    targetDate: new Date(now + 35 * DAY).toISOString(),
    createdAt: new Date(now - WEEKS * 7 * DAY).toISOString(),
  };

  const sessions: MeasurementSession[] = [];
  const checks: ConfidenceCheck[] = [];

  // Physical: 70 -> 128 over 8 weeks (ease toward goal). Confidence: 30 -> 62 (lags).
  for (let w = WEEKS - 1; w >= 0; w--) {
    const p = (WEEKS - 1 - w) / (WEEKS - 1); // 0..1 progress
    const baseFlexion = 70 + p * 58; // 70 -> 128
    const baseExt = 16 - p * 12; // 16 -> 4
    const baseConf = 30 + p * 32; // 30 -> 62 (deliberately behind)

    // 2 sessions per week
    for (let s = 0; s < 2; s++) {
      const dayOffset = w * 7 + (s === 0 ? 1 : 4);
      const jitter = (Math.sin((w + s) * 1.7) + 1) * 2.5; // 0..5 deterministic wobble
      sessions.push({
        id: id('sess'),
        dateISO: new Date(now - dayOffset * DAY).toISOString(),
        leg: 'left',
        maxFlexion: Math.round(baseFlexion + jitter - 2),
        maxExtension: Math.max(2, Math.round(baseExt - (jitter - 2.5) * 0.4)),
        repCount: 8 + (s % 3),
        quality: 0.82 + p * 0.12,
      });
    }

    // 1 confidence check per week
    const cJitter = (Math.cos(w * 1.3) + 1) * 2; // 0..4
    checks.push({
      id: id('conf'),
      dateISO: new Date(now - (w * 7 + 2) * DAY).toISOString(),
      score: Math.round(baseConf + cJitter - 2),
      prompt: 'How much do you trust your left knee today?',
    });
  }

  return { goal, sessions, checks };
}

/** Load the mock dataset into the live stores. Idempotent unless force=true. */
export function seedMockData(force = false) {
  if (!force && mmkv.getBoolean(SEED_FLAG)) return;
  const { goal, sessions, checks } = buildMockData();
  useGoal.getState().setGoal(goal);
  useSessions.getState().replaceAll(sessions);
  useConfidence.getState().replaceAll(checks);
  mmkv.set(SEED_FLAG, true);
}

export function isSeeded() {
  return mmkv.getBoolean(SEED_FLAG) ?? false;
}

export function clearSeedFlag() {
  mmkv.remove(SEED_FLAG);
}
