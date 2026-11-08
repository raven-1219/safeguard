# SAFE GUARD: Actionable Issues & Resolution Plan

This document details every specific technical deficiency identified during the codebase audit and outlines the concrete architectural fixes to be implemented.

---

## 1. High-Priority Issues

### Issue 1: Remove Hardware Simulations (ECG / Pulse Oximeter)
- **Problem**: `BioSensorSim.tsx` displayed simulated ECG waveforms and heart rates. The project scope is strictly laptop-only (webcam, speakers, browser geolocation). Simulating external IoT wearables is misleading.
- **Resolution**:
  1. Remove `BioSensorSim.tsx` from `src/components/simulation/`.
  2. Create `WebcamPostureMonitor.tsx` in `src/components/ai/` that visually displays real webcam-derived posture telemetry:
     - Head drop displacement angle
     - Upper-body movement velocity
     - Inactivity timer (seconds since last movement)
     - Suspected collapse and abnormal motion status flags
     - A clearly marked "Simulate Test Trigger" button for safe academic demonstration.
  3. Clean out simulated biometric fields from `src/lib/types/index.ts`.

### Issue 2: Integrate Real MediaPipe FaceMesh & Pose Execution
- **Problem**: In `CameraFeed.tsx`, the camera loop rendered the video feed but used synthetic landmarks for metrics.
- **Resolution**:
  1. Initialize the real `FaceMesh` and `Pose` from `@mediapipe/face_mesh` and `@mediapipe/pose` in `CameraFeed.tsx`.
  2. Implement an offline-resilient optical landmark tracker (using canvas luminosity, eye ROI bounding, and facial contour geometry) so detection succeeds even when CDN WASM binaries are blocked by network firewalls.
  3. Ensure camera tracks are cleanly stopped and garbage collected on unmount to prevent camera LED staying active.

### Issue 3: Architectural Transparency for Drowsiness Classification
- **Problem**: `cnnClassifier.ts` referred to a 16-feature dense neural network as "MobileNetV3 CNN". Calling scalar feature models a CNN without 2D image convolution or 1D temporal convolution is inaccurate.
- **Resolution**:
  1. Add a genuine 1D temporal convolutional architecture (`Conv1D`) over a rolling sequence of feature vectors (capturing temporal rate-of-change across successive frames), or accurately describe it as a Landmark-Vector Temporal Neural Classifier.
  2. Clearly document model input, output, preprocessing, and confidence calculations in `AI_MODEL_DOCUMENTATION.md`.

### Issue 4: Seat Belt Detection `UNKNOWN` State & Limitation Safeguards
- **Problem**: `seatBeltDetector.ts` produced binary `FASTENED` / `UNFASTENED` decisions based on a chest diagonal. On standard laptop webcams, the driver's chest is frequently out of the camera's field of view.
- **Resolution**:
  1. Add `UNKNOWN` state to `SeatBeltDetectionResult`.
  2. Check whether shoulder landmarks are visible in the frame. If upper chest coordinates are clipped outside the camera boundary, return `status: 'UNKNOWN'`, `isFastened: false`, `reason: 'Driver chest area outside webcam field-of-view'`.
  3. Allow manual confirmation toggle so drivers can declare seat belt status during laptop tests.

### Issue 5: Transparent GPS & Demonstration Route Distinction
- **Problem**: Fleet vehicle markers on `LiveFleetMap.tsx` used static coordinates around Hyderabad without clarifying whether they are simulated route markers or real GPS.
- **Resolution**:
  1. If browser `navigator.geolocation` provides coordinates, plot the real laptop location with a distinctive blue pin labeled "Current Station / Terminal Location".
  2. Clearly tag fleet bus markers as `[DEMO FLEET ROUTE: Sector 4 Corridor]`.
  3. Display an explicit status when geolocation permission is denied.

### Issue 6: Web Audio API Interaction Unlock & Alert Sound De-duplication
- **Problem**: Browsers block Web Audio API playback before user interaction. Continuous sirens could also loop excessively without control.
- **Resolution**:
  1. Add a global user-interaction listener that automatically resumes the `AudioContext` on the first user click anywhere on the page.
  2. Add debounce / rate-limiting to audio alarms, and stop alarms immediately when an alert is acknowledged or dismissed.

### Issue 7: Supabase Connection Banner & IndexedDB Queue
- **Problem**: When running without Supabase credentials, the app should clearly display a notice indicating local offline mode rather than pretending to sync to cloud.
- **Resolution**:
  1. Add a subtle top banner when `!isSupabaseConfigured`:
     `[LOCAL DEMO MODE: Running with offline persistent storage. Cloud sync inactive.]`
  2. Implement idempotency keys in `syncQueue.ts` to prevent duplicate writes during synchronization.

---

## 2. Execution Sequence

1. **Step 1**: Clean types in `src/lib/types/index.ts` (remove simulated biometric fields, add `UNKNOWN` to seat belt status).
2. **Step 2**: Create `WebcamPostureMonitor.tsx` and deprecate `BioSensorSim.tsx`.
3. **Step 3**: Upgrade `src/lib/ai/seatBeltDetector.ts` with `UNKNOWN` state and field-of-view checks.
4. **Step 4**: Upgrade `src/lib/ai/cnnClassifier.ts` with genuine temporal neural inference, multi-frame windowing, and transparent documentation.
5. **Step 5**: Upgrade `src/components/ai/CameraFeed.tsx` with real MediaPipe FaceMesh & Pose detection and offline canvas optical landmark tracker.
6. **Step 6**: Upgrade `src/lib/audio/alarmSound.ts` with user-interaction unlock and distinct alarm frequencies.
7. **Step 7**: Upgrade `src/components/maps/LiveFleetMap.tsx` with transparent GPS permission status and demo route labeling.
8. **Step 8**: Update `src/app/driver/page.tsx` with the new webcam posture monitor and seat belt controls.
9. **Step 9**: Upgrade `src/lib/offline/syncQueue.ts` with IndexedDB storage and idempotency keys.
10. **Step 10**: Verify and enhance all translations in `src/lib/i18n/dictionary.ts`.
11. **Step 11**: Test production build (`npm run build`) to ensure 0 errors.
12. **Step 12**: Complete all 13 comprehensive technical documentation files.

