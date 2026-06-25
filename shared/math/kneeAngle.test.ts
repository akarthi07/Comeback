import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jointAngleDeg, kneeFlexionDeg, type Point2D } from './kneeAngle.ts';

// Run with:  npm test   (uses Node's built-in test runner + type stripping)

const approx = (got: number, want: number, tol = 1e-6) =>
  assert.ok(Math.abs(got - want) <= tol, `got ${got}, want ${want}`);

test('straight leg (collinear) reads ~180 interior / 0 flexion', () => {
  approx(jointAngleDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }), 180);
  approx(kneeFlexionDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }), 0);
});

test('right angle at the knee reads 90 interior / 90 flexion', () => {
  approx(jointAngleDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }), 90);
  approx(kneeFlexionDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }), 90);
});

test('45 degrees of bend reads 45 flexion', () => {
  approx(kneeFlexionDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 2 }), 45);
});

test('nearly folded reads ~180 flexion', () => {
  approx(kneeFlexionDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 0.1 }), 180);
});

test('flexion is invariant to camera rotation (no z, in-plane)', () => {
  const a = (37 * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const rot = (p: Point2D): Point2D => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c });
  approx(
    kneeFlexionDeg(rot({ x: 0, y: 0 }), rot({ x: 0, y: 1 }), rot({ x: 1, y: 1 })),
    90
  );
});

test('degenerate input (zero-length segment) returns NaN, not a wrong number', () => {
  assert.ok(Number.isNaN(jointAngleDeg({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })));
  assert.ok(Number.isNaN(kneeFlexionDeg({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })));
});
