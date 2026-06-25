import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RepTracker, type FrameSample } from './extremes.ts';

// Run with:  npm test   (uses Node's built-in test runner + type stripping)

const good = (flexionDeg: number): FrameSample => ({ flexionDeg, confidence: 1 });

/** Feed a list of flexion values, all high-confidence. */
function feed(tracker: RepTracker, values: number[]): void {
  for (const v of values) tracker.add(good(v));
}

test('captures max flexion and max extension across a full rep', () => {
  const t = new RepTracker();
  // Hold straight, ramp into a deep bend, hold, ramp back to straight, hold.
  // Extremes are held long enough (>= window) that the median reaches them.
  feed(t, [0, 0, 0, 0, 0]); // straight
  feed(t, [15, 30, 45, 60, 75]); // bending
  feed(t, [90, 90, 90, 90, 90]); // held at the bottom
  feed(t, [75, 60, 45, 30, 15]); // straightening
  feed(t, [0, 0, 0, 0, 0]); // straight again

  const e = t.extremes()!;
  assert.equal(e.maxFlexionDeg, 90);
  assert.equal(e.minFlexionDeg, 0);
  assert.equal(e.rangeDeg, 90);
  assert.equal(e.acceptedFrames, 25);
});

test('a single glitch frame does NOT set a false maximum (median rejects it)', () => {
  const t = new RepTracker();
  feed(t, [0, 0, 0, 0, 0]); // a stable straight leg
  t.add(good(175)); // one wild outlier frame
  feed(t, [0, 0, 0, 0]); // back to straight

  const e = t.extremes()!;
  assert.equal(e.maxFlexionDeg, 0); // the 175 spike never registered
});

test('low-confidence frames are ignored (never affect extremes)', () => {
  const t = new RepTracker(); // default minConfidence 0.8
  feed(t, [0, 0, 0, 0, 0]);
  // Real bend, but the pose was not confident -> must not count.
  for (let i = 0; i < 5; i++) t.add({ flexionDeg: 90, confidence: 0.5 });

  const e = t.extremes()!;
  assert.equal(e.maxFlexionDeg, 0);
  assert.equal(e.acceptedFrames, 5); // only the 5 good straight frames
});

test('NaN flexion is ignored', () => {
  const t = new RepTracker();
  feed(t, [10, 10, 10]);
  t.add({ flexionDeg: NaN, confidence: 1 });
  const e = t.extremes()!;
  assert.equal(e.acceptedFrames, 3);
  assert.equal(e.maxFlexionDeg, 10);
});

test('extremes() is null before any accepted frame', () => {
  const t = new RepTracker();
  assert.equal(t.extremes(), null);
  assert.ok(Number.isNaN(t.smoothedFlexionDeg));
  t.add({ flexionDeg: 45, confidence: 0.1 }); // rejected
  assert.equal(t.extremes(), null);
});

test('reset() clears state for a fresh rep', () => {
  const t = new RepTracker();
  feed(t, [0, 45, 90, 90, 90]);
  assert.ok(t.extremes() !== null);
  t.reset();
  assert.equal(t.extremes(), null);
  assert.ok(Number.isNaN(t.smoothedFlexionDeg));
});

test('window size of 1 means no smoothing (raw min/max)', () => {
  const t = new RepTracker({ smoothingWindow: 1 });
  feed(t, [0, 100, 0]); // with no smoothing, the 100 is a real max
  const e = t.extremes()!;
  assert.equal(e.maxFlexionDeg, 100);
  assert.equal(e.minFlexionDeg, 0);
});
