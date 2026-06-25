# Comeback — Expo SDK 53

This project targets **Expo SDK 53** (React Native 0.79, New Architecture enabled).
Stack is intentionally pinned for native-module compatibility:

- react-native-vision-camera **v4** (NOT v5 — pose plugins target v4)
- react-native-mediapipe-posedetection (MediaPipe BlazePose, 33 landmarks)
- react-native-worklets-core (frame-processor worklets)

Requires a **custom dev build** (`npx expo run:android`) — Expo Go will not work
because of the native camera/pose modules. Test on a physical Android device.

SDK 53 docs: https://docs.expo.dev/versions/v53.0.0/
