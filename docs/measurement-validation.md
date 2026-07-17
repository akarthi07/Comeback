# Measurement Validation (Chunk 1.6 / 1.7)

**Status: GATE PASSED.** The knee-angle measurement was validated against a
goniometer reference and is trustworthy within a stated error band under a
standardized capture setup.

## The headline number

> **The phone reads within 3–5° of a goniometer** across the flexion range,
> repeatably, under the standardized setup below.

This is the credibility number for any demo or README. Do **not** claim finer
resolution than this — a single-camera 2D pose estimate has a real error floor,
and 3–5° is honest for it. Report it as a band, not a false-precise single value.

## How it was validated

- Reference angles from a manual goniometer / taped known angles
  (see `docs/validation-angle-sheet.html` for the printable reference).
- Phone reading compared to the reference across the flexion range
  (roughly straight → deep bend).
- Camera-position sensitivity checked (same true angle, varied phone
  height / distance / pitch) to find the setup that reads consistently.

## The standardized capture setup (what produces the 3–5°)

The reading is only trustworthy when captured the way it was validated. This is
the spec the capture UX (Chunk 3) and calibration (Chunk 1.4) exist to enforce:

1. **Side-on, in-plane.** Film the leg from the side so hip/knee/ankle lie in
   the camera plane. The depth (`z`) coordinate is ignored — it's unreliable.
2. **Whole body in frame.** The pose model is full-body; a close-up of just the
   leg collapses to low confidence. Step back until head-to-toe is visible.
3. **Phone held level (low pitch).** Between-session phone pitch is a documented
   source of longitudinal error. The app reads the accelerometer and blocks /
   warns when pitch is out of tolerance.
4. **Per-user calibration applied.** A one-time straight-leg calibration learns
   the constant offset (2D pose reads a few false degrees on a truly straight
   leg) and subtracts it from every reading. Captured during onboarding.
5. **Landmark confidence gate.** Hip/knee/ankle must all be visible above the
   confidence threshold before a measurement is accepted.

## What the app enforces to reproduce it

- **Quality gate** (`shared/capture/quality.ts`): landmark visibility, side-on
  heuristic, distance-in-range, phone pitch tolerance → a 0–1 score + the
  failing factor, surfaced live in the capture guide. Recording is blocked until
  it passes.
- **Calibration** (`shared/calibration/calibrate.ts`): per-user straight-leg
  offset, learned in onboarding, applied to every reading.
- **Pitch** (`shared/sensors/pitch.ts`): accelerometer pitch read + tolerance
  check.

## Honest framing

Comeback is a **companion, not a clearance tool.** The 3–5° band is good enough
to track a trend and see the readiness gap; it is not a medical device and does
not clear anyone to return to sport. Any public claim should state the error
band and this positioning explicitly.
