import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreCaptureQuality, type CaptureFrame, type PoseLandmark } from './quality.ts';

// Run with:  npm test

const lm = (x: number, y: number, confidence = 0.95): PoseLandmark => ({ x, y, confidence });

/** A clean, ideal side-on capture (portrait 1080x1920). Override fields per test. */
function goodFrame(overrides: Partial<CaptureFrame> = {}): CaptureFrame {
  return {
    measuredLeg: 'left',
    leftHip: lm(540, 760),
    leftKnee: lm(540, 1160),
    leftAnkle: lm(540, 1560),
    // right leg almost directly behind the left -> hips overlap -> side-on
    rightHip: lm(555, 760),
    rightKnee: lm(555, 1160),
    rightAnkle: lm(555, 1560),
    imageWidth: 1080,
    imageHeight: 1920,
    pitchDeg: 2,
    ...overrides,
  };
}

test('ideal side-on capture passes with a high score', () => {
  const r = scoreCaptureQuality(goodFrame());
  assert.equal(r.passed, true);
  assert.equal(r.failedFactor, null);
  assert.ok(r.score > 0.95, `score ${r.score}`);
  assert.equal(r.factors.pitch.evaluated, true);
});

test('front-facing pose fails the side-on factor', () => {
  const r = scoreCaptureQuality(goodFrame({ leftHip: lm(380, 760), rightHip: lm(700, 760) }));
  assert.equal(r.passed, false);
  assert.equal(r.failedFactor, 'sideOn');
  assert.equal(r.factors.sideOn.ok, false);
  // other factors still fine
  assert.equal(r.factors.distance.ok, true);
  assert.equal(r.factors.landmarksVisible.ok, true);
});

test('standing too far away fails the distance factor', () => {
  const r = scoreCaptureQuality(
    goodFrame({
      leftHip: lm(540, 900),
      leftKnee: lm(540, 1000),
      leftAnkle: lm(540, 1100), // leg spans only ~200px of 1920
      rightHip: lm(548, 900),
    })
  );
  assert.equal(r.passed, false);
  assert.equal(r.failedFactor, 'distance');
  assert.match(r.factors.distance.detail, /closer/);
});

test('a weak landmark fails the visibility factor', () => {
  const r = scoreCaptureQuality(goodFrame({ leftAnkle: lm(540, 1560, 0.3) }));
  assert.equal(r.passed, false);
  assert.equal(r.failedFactor, 'landmarksVisible');
  assert.equal(r.factors.landmarksVisible.score, 0); // below the floor
});

test('a tilted phone fails the pitch factor', () => {
  const r = scoreCaptureQuality(goodFrame({ pitchDeg: 30 }));
  assert.equal(r.passed, false);
  assert.equal(r.failedFactor, 'pitch');
  assert.match(r.factors.pitch.detail, /level/);
});

test('pitch is skipped (not failed) when no accelerometer value is supplied', () => {
  const r = scoreCaptureQuality(goodFrame({ pitchDeg: undefined }));
  assert.equal(r.factors.pitch.evaluated, false);
  assert.equal(r.passed, true); // a good frame still passes without pitch
  assert.equal(r.failedFactor, null);
});

test('overall score is the weakest link, and the worst failing factor is reported', () => {
  // Slightly off side-on AND slightly too far: both fail, side-on is worse.
  const r = scoreCaptureQuality(
    goodFrame({
      leftHip: lm(454, 760),
      leftKnee: lm(540, 1048),
      leftAnkle: lm(540, 1336), // leg ~582px -> frac ~0.30, just under the band
      rightHip: lm(626, 760),
    })
  );
  assert.equal(r.passed, false);
  assert.equal(r.factors.sideOn.ok, false);
  assert.equal(r.factors.distance.ok, false);
  assert.equal(r.failedFactor, 'sideOn'); // lower score than distance
  // score equals the minimum factor score
  const minFactor = Math.min(
    r.factors.landmarksVisible.score,
    r.factors.sideOn.score,
    r.factors.distance.score,
    r.factors.pitch.score
  );
  assert.ok(Math.abs(r.score - minFactor) < 1e-9);
});
