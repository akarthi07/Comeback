import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCalibration,
  applyCalibration,
  CalibrationSession,
} from './calibrate.ts';

// Run with:  npm test

const approx = (got: number, want: number, tol = 1e-9) =>
  assert.ok(Math.abs(got - want) <= tol, `got ${got}, want ${want}`);

test('learns the systematic offset from steady straight-leg readings', () => {
  // A straight leg that consistently reads ~5deg of (false) flexion.
  const readings = [5, 4, 6, 5, 5, 4, 6, 5, 5, 5, 6, 4];
  const c = computeCalibration(readings);
  approx(c.offsetDeg, 5);
  assert.equal(c.ok, true);
  assert.ok(c.spreadDeg <= 5);
});

test('applyCalibration subtracts the offset and never goes negative', () => {
  approx(applyCalibration(90, 5), 85);
  approx(applyCalibration(45, 5), 40);
  approx(applyCalibration(3, 5), 0); // clamped, not -2
  assert.ok(Number.isNaN(applyCalibration(NaN, 5)));
});

test('too few samples => not ok (but still returns an offset)', () => {
  const c = computeCalibration([5, 5, 5]); // only 3
  approx(c.offsetDeg, 5);
  assert.equal(c.ok, false);
  assert.equal(c.sampleCount, 3);
});

test('an unsteady leg (large spread) => not ok', () => {
  // 12 samples but they swing wildly: the user was not holding still.
  const c = computeCalibration([0, 10, 2, 9, 1, 11, 3, 8, 0, 10, 2, 9]);
  assert.equal(c.sampleCount, 12);
  assert.ok(c.spreadDeg > 5);
  assert.equal(c.ok, false);
});

test('empty input => zero offset, not ok', () => {
  const c = computeCalibration([]);
  approx(c.offsetDeg, 0);
  assert.equal(c.ok, false);
});

test('CalibrationSession gates on confidence and NaN', () => {
  const s = new CalibrationSession(0.8);
  for (let i = 0; i < 12; i++) s.add(5, 0.95); // good
  s.add(40, 0.3); // low confidence -> ignored
  s.add(NaN, 0.99); // NaN -> ignored
  assert.equal(s.count, 12);
  const c = s.finalize();
  approx(c.offsetDeg, 5);
  assert.equal(c.ok, true);
});

test('CalibrationSession.reset clears collected samples', () => {
  const s = new CalibrationSession();
  for (let i = 0; i < 12; i++) s.add(5, 0.95);
  assert.equal(s.count, 12);
  s.reset();
  assert.equal(s.count, 0);
  assert.equal(s.finalize().ok, false);
});
