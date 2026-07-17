import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKV } from './storage';
import type { LadderRung } from './types';
import { CUTTING_LADDER } from '../content/cuttingLadder';

/** The v1 ladder content — the curated cutting re-exposure progression. */
export const DEFAULT_RUNGS: LadderRung[] = CUTTING_LADDER;

interface LadderState {
  rungs: LadderRung[];
  toggleRung: (id: string) => void;
  setRungs: (r: LadderRung[]) => void;
  resetLadder: () => void;
}

export const useLadder = create<LadderState>()(
  persist(
    (set, get) => ({
      rungs: DEFAULT_RUNGS,
      toggleRung: (id) =>
        set({
          rungs: get().rungs.map((r) =>
            r.id === id
              ? { ...r, done: !r.done, doneDateISO: !r.done ? new Date().toISOString() : undefined }
              : r
          ),
        }),
      setRungs: (rungs) => set({ rungs }),
      resetLadder: () => set({ rungs: DEFAULT_RUNGS }),
    }),
    {
      name: 'comeback.ladder',
      storage: createJSONStorage(() => zustandMMKV),
      // v2: replaced the ROM-milestone rungs with the cutting re-exposure ladder.
      // Rung IDs changed entirely, so old progress can't map — reset to the new set.
      version: 2,
      migrate: () => ({ rungs: DEFAULT_RUNGS }),
    }
  )
);
