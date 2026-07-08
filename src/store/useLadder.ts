import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKV } from './storage';
import type { LadderRung } from './types';

/** Default comeback ladder — the rungs from protected motion back to full send. */
export const DEFAULT_RUNGS: LadderRung[] = [
  { id: 'r1', label: 'Pain-free full extension', targetFlexion: 5, done: false },
  { id: 'r2', label: 'Bend to 90°', targetFlexion: 90, done: false },
  { id: 'r3', label: 'Bend past 120°', targetFlexion: 120, done: false },
  { id: 'r4', label: 'Full deep bend (135°+)', targetFlexion: 135, done: false },
  { id: 'r5', label: 'Single-leg balance, 30s', done: false },
  { id: 'r6', label: 'Jog without thinking about it', done: false },
  { id: 'r7', label: 'Cut & pivot at speed', done: false },
];

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
    { name: 'comeback.ladder', storage: createJSONStorage(() => zustandMMKV) }
  )
);
