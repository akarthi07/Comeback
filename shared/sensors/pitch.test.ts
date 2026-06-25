import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pitchDegFromAccel, evaluatePitch } from './pitch.ts';

// Run with:  npm test

const approx = (got: number, want: number, tol = 1e-6) =>
  assert.ok(Math.abs(got - want) <= tol, `got ${got}, want ${want}`);

const G = 9.81;

test('upright phone (gravity along -y) reads pitch ~0', () => {
  approx(pitchDegFromAccel(0, -G, 0), 0);
});

test('phone lying flat (gravity along z) reads pitch ~90', () => {
  approx(pitchDegFromAccel(0, 0, G), 90);
});

test('a 30-degree forward tilt reads ~30', () => {
  // gravity split between -y (upright component) and z (tilt component)
  const g = { y: -G * Math.cos((30 * Math.PI) / 180), z: G * Math.sin((30 * Math.PI) / 180) };
  approx(pitchDegFromAccel(0, g.y, g.z), 30);
});

test('a backward tilt reads negative pitch (sign preserved)', () => {
  const z = -G * Math.sin((20 * Math.PI) / 180);
  const y = -G * Math.cos((20 * Math.PI) / 180);
  approx(pitchDegFromAccel(0, y, z), -20);
});

test('a zero-magnitude reading is NaN (unusable sensor data)', () => {
  assert.ok(Number.isNaN(pitchDegFromAccel(0, 0, 0)));
});

test('evaluatePitch passes a level phone and blocks a tilted one', () => {
  assert.equal(evaluatePitch(5).ok, true);
  assert.equal(evaluatePitch(-8).ok, true);
  const blocked = evaluatePitch(20);
  assert.equal(blocked.ok, false);
  assert.match(blocked.message, /level/);
  assert.equal(blocked.deviationDeg, 20);
});

test('evaluatePitch respects a custom tolerance', () => {
  assert.equal(evaluatePitch(10, 5).ok, false); // 10 > 5
  assert.equal(evaluatePitch(4, 5).ok, true);
});

test('evaluatePitch treats NaN pitch as unreadable -> not ok', () => {
  const r = evaluatePitch(NaN);
  assert.equal(r.ok, false);
  assert.match(r.message, /cannot read/);
});

test('accel -> pitch -> gate composes end to end', () => {
  // ~25deg tilt, default tolerance 12 -> should block
  const pitch = pitchDegFromAccel(0, -G * Math.cos((25 * Math.PI) / 180), G * Math.sin((25 * Math.PI) / 180));
  approx(pitch, 25);
  assert.equal(evaluatePitch(pitch).ok, false);
});
