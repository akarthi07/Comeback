export * from './types';
export { useGoal } from './useGoal';
export { useCalibration } from './useCalibration';
export { useSessions } from './useSessions';
export { useConfidence } from './useConfidence';
export { useLadder, DEFAULT_RUNGS } from './useLadder';
export * from './selectors';
export { mmkv, clearAllStorage } from './storage';

import { useGoal } from './useGoal';
import { useCalibration } from './useCalibration';
import { useSessions } from './useSessions';
import { useConfidence } from './useConfidence';
import { useLadder } from './useLadder';
import { clearAllStorage } from './storage';

/** Wipe everything: persisted MMKV data and in-memory store state. */
export function resetAllData() {
  clearAllStorage();
  useGoal.getState().clearGoal();
  useCalibration.getState().clearCalibration();
  useSessions.getState().clearSessions();
  useConfidence.getState().clearChecks();
  useLadder.getState().resetLadder();
}
