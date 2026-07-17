import { useGoal } from './useGoal';
import { useSessions } from './useSessions';
import { useConfidence } from './useConfidence';
import type { MeasurementSession, ConfidenceCheck } from './types';

const DAY = 86_400_000;

/** Physical readiness as a 0..100 percentage of the flexion goal. */
export function physicalReadiness(maxFlexion: number, targetFlexion: number): number {
  if (!targetFlexion) return 0;
  return Math.max(0, Math.min(100, Math.round((maxFlexion / targetFlexion) * 100)));
}

export interface WeeklySeries {
  labels: string[];
  physical: number[];
  confidence: number[];
}

/**
 * Bucket sessions + confidence checks into the last `weeks` 7-day windows ending
 * today. Empty weeks carry the previous value forward so the lines stay continuous.
 */
export function buildWeeklySeries(
  sessions: MeasurementSession[],
  checks: ConfidenceCheck[],
  targetFlexion: number,
  weeks = 8
): WeeklySeries {
  const now = Date.now();
  const physical: number[] = [];
  const confidence: number[] = [];
  const labels: string[] = [];

  let lastP = 0;
  let lastC = 0;

  for (let i = weeks - 1; i >= 0; i--) {
    const end = now - i * 7 * DAY;
    const start = end - 7 * DAY;

    const wkSessions = sessions.filter((s) => {
      const t = Date.parse(s.dateISO);
      return t > start && t <= end;
    });
    const wkChecks = checks.filter((c) => {
      const t = Date.parse(c.dateISO);
      return t > start && t <= end;
    });

    if (wkSessions.length) {
      const best = Math.max(...wkSessions.map((s) => physicalReadiness(s.maxFlexion, targetFlexion)));
      lastP = best;
    }
    if (wkChecks.length) {
      lastC = Math.round(wkChecks.reduce((a, c) => a + c.score, 0) / wkChecks.length);
    }

    physical.push(lastP);
    confidence.push(lastC);
    labels.push(i === 0 ? 'Now' : `-${i}w`);
  }

  return { labels, physical, confidence };
}

export interface ReadinessNow {
  physical: number;
  confidence: number;
  gap: number;
  series: WeeklySeries;
  hasData: boolean;
  sessionCount: number;
  checkCount: number;
}

/** One hook the Dashboard + Trend screens read for the whole readiness picture. */
export function useReadiness(weeks = 8): ReadinessNow {
  const goal = useGoal((s) => s.goal);
  const sessions = useSessions((s) => s.sessions);
  const checks = useConfidence((s) => s.checks);

  const target = goal?.targetFlexion ?? 135;
  const series = buildWeeklySeries(sessions, checks, target, weeks);

  const physical = series.physical[series.physical.length - 1] ?? 0;
  const confidence = series.confidence[series.confidence.length - 1] ?? 0;

  return {
    physical,
    confidence,
    gap: Math.max(0, physical - confidence),
    series,
    hasData: sessions.length > 0 || checks.length > 0,
    sessionCount: sessions.length,
    checkCount: checks.length,
  };
}
