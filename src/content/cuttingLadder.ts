import type { LadderRung } from '../store/types';

/**
 * The cutting re-exposure ladder (Chunk 6.2) — curated/hardcoded for v1, the
 * same for everyone. This is the FEAR-reduction ladder, not the ROM ladder:
 * graded exposure to change-of-direction, the movement most ACL athletes fear.
 *
 * The arc mirrors established return-to-sport progressions — gym → game, along
 * three axes: slow → fast, planned → reactive, unopposed → full pressure. The
 * point is confidence, so each rung is framed as something you TRUST, and is
 * marked complete by you, not auto-scored.
 *
 * Companion, not clearance: this structures re-exposure, it does not medically
 * clear anyone to cut. Edit this one file to change the ladder.
 */
export const CUTTING_LADDER: LadderRung[] = [
  { id: 'cut1', label: 'Change direction at a walking pace', note: 'Big, gentle angles. Just re-teach the movement.', done: false },
  { id: 'cut2', label: 'Planned cut at a jog', note: 'Marked cones, wide ~45° angle, submaximal effort.', done: false },
  { id: 'cut3', label: 'Planned cut at 3/4 speed', note: 'Sharper ~90° angles. You know where you’re going.', done: false },
  { id: 'cut4', label: 'Planned cut at full speed, unopposed', note: 'Max effort, still pre-planned. No one guarding you.', done: false },
  { id: 'cut5', label: 'React and cut off a cue', note: 'Coach or partner points; you cut where told. Moderate speed.', done: false },
  { id: 'cut6', label: 'Reactive cut at full speed', note: 'Unplanned, game-speed changes of direction.', done: false },
  { id: 'cut7', label: 'Cutting in small-sided drills', note: 'A teammate and light pressure. Reads and contact creep in.', done: false },
  { id: 'cut8', label: 'Cutting freely in a game', note: 'Full pressure, no thinking about the knee.', done: false },
];
