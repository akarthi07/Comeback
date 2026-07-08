import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKV } from './storage';
import type { ConfidenceCheck } from './types';

interface ConfidenceState {
  checks: ConfidenceCheck[];
  addCheck: (c: ConfidenceCheck) => void;
  removeCheck: (id: string) => void;
  replaceAll: (c: ConfidenceCheck[]) => void;
  clearChecks: () => void;
}

const byDateDesc = (a: ConfidenceCheck, b: ConfidenceCheck) => b.dateISO.localeCompare(a.dateISO);

export const useConfidence = create<ConfidenceState>()(
  persist(
    (set, get) => ({
      checks: [],
      addCheck: (c) => set({ checks: [c, ...get().checks].sort(byDateDesc) }),
      removeCheck: (id) => set({ checks: get().checks.filter((x) => x.id !== id) }),
      replaceAll: (checks) => set({ checks: [...checks].sort(byDateDesc) }),
      clearChecks: () => set({ checks: [] }),
    }),
    { name: 'comeback.confidence', storage: createJSONStorage(() => zustandMMKV) }
  )
);
