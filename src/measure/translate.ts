/**
 * Turn raw flexion/extension degrees into plain language an athlete actually
 * understands. No clinical jargon — what can you DO at this range.
 */

export function translateFlexion(maxFlexionDeg: number): string {
  const f = maxFlexionDeg;
  if (f < 30) return 'Very limited bend so far — early days.';
  if (f < 60) return 'Getting on and off a chair is still a stretch.';
  if (f < 90) return 'Functional bend — sitting and gentle stairs are workable.';
  if (f < 120) return 'Good range — most everyday movement is back.';
  if (f < 135) return 'Strong bend — close to a full deep squat.';
  return 'Full range — deep squats and kneeling are in reach.';
}

export function translateExtension(minFlexionDeg: number): string {
  const e = minFlexionDeg;
  if (e <= 3) return 'Straightens fully.';
  if (e <= 10) return `${Math.round(e)}° shy of fully straight.`;
  return `Resting ${Math.round(e)}° bent — full extension still to come.`;
}

export interface Symmetry {
  /** measured / other, as a percentage (100 = matched). */
  percent: number;
  label: string;
  tone: 'green' | 'amber' | 'red';
}

export function symmetry(measuredFlexion: number, otherFlexion: number): Symmetry | null {
  if (!otherFlexion || otherFlexion <= 0) return null;
  const percent = Math.round((measuredFlexion / otherFlexion) * 100);
  const gap = Math.abs(100 - percent);
  const tone = gap <= 5 ? 'green' : gap <= 15 ? 'amber' : 'red';
  const label =
    percent >= 98
      ? 'Matched to your other leg'
      : percent < 100
      ? `${percent}% of your other leg`
      : `${percent}% — ahead of your other leg`;
  return { percent, label, tone };
}
