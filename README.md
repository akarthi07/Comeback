# Comeback

**Rehab tracks your knee. Comeback tracks your knee *and* your head — and shows you the gap between them.**

Most ACL rehab tools measure the body: range of motion, strength, symmetry. But
the research is clear that *psychological* readiness — how much an athlete
actually trusts the knee — is what predicts a real return to sport, and it lags
the body the whole way back. Comeback measures both, on a phone, and makes the
**Readiness Gap** between physical recovery and confidence impossible to ignore.

---

## What it does

- **Measures knee range of motion** from the phone camera using on-device pose
  estimation — no wearables, no clinic. Side-on, guided, quality-gated capture.
- **Tracks psychological readiness** with the **ACL-RSI**, the validated 12-item
  return-to-sport confidence scale (emotions / confidence / risk appraisal).
- **Shows the Readiness Gap** — physical recovery and confidence on one time
  axis, so "your body is ahead of your head" becomes a picture, not a feeling.
- **Guides re-exposure** with a cutting-confidence ladder (gym → game), the
  graded steps back to the movement most ACL athletes fear.

## Measurement accuracy (the honest number)

> **The knee-angle reading is validated to within 3–5° of a goniometer**, across
> the flexion range, under a standardized side-on setup.

That's an honest error band for a single-camera 2D measurement — good enough to
track a trend and see the gap. It is **not** claimed to be finer. Details and the
capture spec: [`docs/measurement-validation.md`](docs/measurement-validation.md).

**Comeback is a companion, not a clearance tool.** It is not a medical device
and does not clear anyone to return to sport. Return-to-play decisions belong to
the athlete and their clinicians.

## How the measurement stays trustworthy

- **Per-user calibration** — a one-time straight-leg capture learns the constant
  offset (2D pose reads a few false degrees on a truly straight leg) and
  subtracts it from every reading.
- **Capture-quality gate** — landmark visibility, side-on heuristic, distance,
  and phone pitch are checked live; recording is blocked until the shot is good.
- **Pure, tested engine** — all the "trustworthy number" logic lives in
  [`shared/`](shared/) with no UI or native deps, proven with unit tests
  (`npm test`).

## Stack

- **Expo SDK 53**, React Native 0.79, New Architecture — custom dev build
  (Expo Go won't work; native camera/pose modules).
- **react-native-vision-camera v4** + a MediaPipe/ML Kit BlazePose frame-processor
  plugin (33 landmarks) via **react-native-worklets-core**.
- **Zustand + MMKV** for fast, synchronous on-device persistence.
- **React Navigation**, **IBM Plex Sans/Mono**, `react-native-svg` charts.
- Measurement engine: **pure TypeScript** in `shared/`, tested with `node:test`.

## Run it

Requires **Android Studio (JDK 21)** and a **64-bit Android device** (arm64 —
the pose engine is 64-bit only) with USB debugging on.

```bash
npm install
npx expo run:android      # first build compiles the camera + pose engine (~10 min)
```

For JS-only changes after the first native build, just start Metro:

```bash
npx expo start --dev-client
```

Run the engine's unit tests and type check:

```bash
npm test
npm run typecheck
```

## Try the demo without real data

New installs start empty. To explore the full product with a believable 8-week
comeback: onboard via **"Explore with sample data"**, or open **Settings (⋯ on the
Dashboard) → Load sample data**. See [`docs/demo-script.md`](docs/demo-script.md)
for the scripted 3-minute walkthrough.

## Project layout

```
shared/        Pure measurement + scale logic (kneeAngle, calibration, quality,
               pitch, rep extremes, ACL-RSI) + unit tests. No React/native.
src/
  screens/     Dashboard, Measure, Confidence, Trend, Ladder, Onboarding, Settings
  measure/     Camera + pose overlay + capture flow
  onboarding/  Goal setup + straight-leg calibration
  confidence/  ACL-RSI flow + result
  content/     Curated cutting-ladder content
  store/       Zustand + MMKV stores and selectors
  theme/       Design tokens (monochrome + one green, IBM Plex)
docs/          Measurement validation report, demo script, angle sheet
```

## Screens

_Screenshots: Dashboard (Readiness Gap), Measure (live knee angle), Confidence
(ACL-RSI), Trend (the gap over time), Ladder. — to be captured from device._

---

*Not medical, legal, or regulatory advice. Validate clinical claims, health-data
handling, and device-classification questions with qualified professionals before
any public release.*
