import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKV } from './storage';
import type { Goal } from './types';

interface GoalState {
  goal: Goal | null;
  setGoal: (g: Goal) => void;
  updateGoal: (patch: Partial<Goal>) => void;
  clearGoal: () => void;
}

export const useGoal = create<GoalState>()(
  persist(
    (set, get) => ({
      goal: null,
      setGoal: (goal) => set({ goal }),
      updateGoal: (patch) => {
        const cur = get().goal;
        if (cur) set({ goal: { ...cur, ...patch } });
      },
      clearGoal: () => set({ goal: null }),
    }),
    { name: 'comeback.goal', storage: createJSONStorage(() => zustandMMKV) }
  )
);
