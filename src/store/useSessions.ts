import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKV } from './storage';
import type { MeasurementSession } from './types';

interface SessionsState {
  sessions: MeasurementSession[];
  addSession: (s: MeasurementSession) => void;
  removeSession: (id: string) => void;
  /** Bulk replace — used by mock seeding and imports. */
  replaceAll: (s: MeasurementSession[]) => void;
  clearSessions: () => void;
}

const byDateDesc = (a: MeasurementSession, b: MeasurementSession) =>
  b.dateISO.localeCompare(a.dateISO);

export const useSessions = create<SessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: (s) => set({ sessions: [s, ...get().sessions].sort(byDateDesc) }),
      removeSession: (id) => set({ sessions: get().sessions.filter((x) => x.id !== id) }),
      replaceAll: (sessions) => set({ sessions: [...sessions].sort(byDateDesc) }),
      clearSessions: () => set({ sessions: [] }),
    }),
    { name: 'comeback.sessions', storage: createJSONStorage(() => zustandMMKV) }
  )
);
