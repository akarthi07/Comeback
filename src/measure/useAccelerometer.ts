import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { pitchDegFromAccel } from '../../shared/sensors/pitch';

/**
 * Subscribe to the accelerometer and report phone pitch (deg from upright) for
 * the capture quality gate. Returns undefined while inactive/unavailable so the
 * quality engine simply skips the pitch factor rather than failing it.
 */
export function useAccelerometer(active: boolean): number | undefined {
  const [pitch, setPitch] = useState<number | undefined>(undefined);
  const lastRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active) {
      setPitch(undefined);
      return;
    }
    Accelerometer.setUpdateInterval(150);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const deg = pitchDegFromAccel(x, y, z);
      if (Number.isNaN(deg)) return;
      // light smoothing so the prompt doesn't flicker
      const prev = lastRef.current;
      const next = prev === undefined ? deg : prev * 0.7 + deg * 0.3;
      lastRef.current = next;
      setPitch(next);
    });
    return () => sub.remove();
  }, [active]);

  return pitch;
}
