import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

/** Single on-device key-value store (encrypted-capable, synchronous, fast). */
export const mmkv = createMMKV({ id: 'comeback.v1' });

/** Adapter so Zustand's persist middleware can write to MMKV. */
export const zustandMMKV: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};

/** Keys every persisted store uses — also the list wiped by a full reset. */
export const STORE_KEYS = [
  'comeback.goal',
  'comeback.calibration',
  'comeback.sessions',
  'comeback.confidence',
  'comeback.ladder',
] as const;

/** Nuke all persisted app data (used by Settings "reset" and dev tooling). */
export function clearAllStorage() {
  mmkv.clearAll();
}
