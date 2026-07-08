import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKV } from './storage';
import type { Calibration } from './types';

interface CalibrationState {
  calibration: Calibration | null;
  setCalibration: (c: Calibration) => void;
  clearCalibration: () => void;
}

export const useCalibration = create<CalibrationState>()(
  persist(
    (set) => ({
      calibration: null,
      setCalibration: (calibration) => set({ calibration }),
      clearCalibration: () => set({ calibration: null }),
    }),
    { name: 'comeback.calibration', storage: createJSONStorage(() => zustandMMKV) }
  )
);
