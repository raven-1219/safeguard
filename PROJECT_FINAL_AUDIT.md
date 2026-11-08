# SAFE GUARD: Comprehensive Codebase & Feature Audit Report

**Audit Date**: Current Academic Session  
**Application**: SAFE GUARD – AI-Based Intelligent Driver Safety, Health Emergency and Real-Time Vehicle Monitoring System  
**Deployment Target**: Laptop Webcam & Browser (Vercel-compatible Next.js 14 App Router)

---

## 1. Executive Summary

This audit evaluates the codebase of SAFE GUARD to determine the gap between user-facing interfaces and underlying technical implementations. The goal is to transition the project from a prototype state to an authentic, reliable, laptop-only academic software project ready for live demonstration and defense.

### Key Audit Findings:
1. **Webcam Landmark Processing**: The preliminary camera implementation rendered video but relied on synthesized mathematical fluctuations rather than wiring the `@mediapipe/face_mesh` and `@mediapipe/pose` packages to video frames. Real MediaPipe pipeline execution is required.
2. **AI Drowsiness Model**: The classification module in `cnnClassifier.ts` executed a 1D dense neural network across 16 geometric scalars. Calling this a "MobileNetV3 CNN" is technically inaccurate. Architectural clarity and genuine temporal convolution / feature classification are required.
3. **Medical Emergency Detection**: The previous version included a hardware-simulated ECG/wearable component (`BioSensorSim.tsx`), which violates the strict laptop-only project scope. Emergency detection must be 100% webcam-based (pose sudden collapse, abnormal high-frequency movement/convulsion, unresponsiveness).
4. **Seat Belt Detection**: The current heuristic sampled pixels diagonally across a default chest box without an `UNKNOWN` state. Because laptop webcams capture mostly head-and-shoulders, an `UNKNOWN` state and honest heuristic labeling are needed.
5. **GPS & Telemetry**: Hardcoded demo fleet coordinates in Hyderabad must be clearly labeled as `[DEMO FLEET SIMULATION]`, and real laptop location must use browser Geolocation API with graceful denial handling.
6. **Supabase & Offline Sync**: The database schema in `supabase/schema.sql` is comprehensive (12 tables with RLS). The client must clearly indicate connection status (`ONLINE CLOUD` vs `OFFLINE LOCAL DEMO`) rather than silently faking cloud sync. The offline queue needs idempotency keys.

---

## 2. Component-by-Component Audit

### 2.1 Dependencies & Configuration (`package.json`, `next.config.mjs`)
- **Status**: Compatible.
- **Packages**: Next.js 14.2.18, React 18.3.1, `@mediapipe/face_mesh`, `@mediapipe/pose`, `@mediapipe/camera_utils`, `@tensorflow/tfjs`, `leaflet`, `recharts`, `lucide-react`, `tailwindcss`.
- **Finding**: Dependencies are clean and lightweight. Build completes in $<60\text{s}$.

### 2.2 Routes & Pages
- `/` (Landing & Role Gateway): Implemented with direct role entry.
- `/login`: Implemented with role tabs, form validation, and demo credentials.
- `/driver`: Live monitoring view; needs real MediaPipe landmark stream and removal of simulated ECG widget.
- `/moderator`: Assigned driver grid, live map, emergency resolution modal; functioning with mockDb.
- `/admin`: Fleet management, user registry, security audit logs, CSV export; functioning.
- `/reports`: Printable official certificate and text download; functioning.
- `/api/events`, `/api/trips`, `/api/reports`: Functional serverless endpoints.

### 2.3 Computer Vision & AI Modules (`src/lib/ai/*`)
- `faceLandmarks.ts`: EAR and MAR formulas are mathematically correct. Blink and yawn temporal state machines are sound.
- `headPose.ts`: 3D Pitch, Yaw, Roll geometry calculated from facial landmarks. Sound.
- `cnnClassifier.ts`: Dense neural network on 16 features. Needs transparent architectural renaming and documentation.
- `poseDetector.ts`: Vertical collapse drop and jerk variance formulas implemented.
- `seatBeltDetector.ts`: Heuristic diagonal line contrast. Needs `UNKNOWN` state and field-of-view safeguards.
- `imageEnhance.ts`: Gamma correction LUT and contrast stretching implemented.

### 2.4 Alert Engine (`src/lib/audio/alarmSound.ts`)
- Web Audio API synthesizer generates local audio without external audio files. Needs user-gesture unlock handling to prevent browser autoplay blocks.

### 2.5 Data Layer & RLS (`supabase/schema.sql`, `src/lib/supabase/*`)
- 12 tables defined with constraints and RLS policies.
- Client fallback store (`mockDb`) functions well for testing without cloud credentials.
- Transparent banner needed when cloud credentials are not supplied.

---

## 3. Scope Cleanup Plan

1. **Deprecate & Remove Hardware Simulation**:
   - Delete `src/components/simulation/BioSensorSim.tsx`.
   - Remove simulated ECG/heart-rate fields from `src/lib/types/index.ts`.
   - Replace with `WebcamPostureMonitor.tsx` focusing strictly on webcam-based head collapse, posture displacement, and unresponsiveness.
2. **Activate Real MediaPipe Detection**:
   - Wire `@mediapipe/face_mesh` and `@mediapipe/pose` directly to the `<video>` element canvas stream in `CameraFeed.tsx` with a reliable offline canvas optical fallback.
3. **Upgrade Seat Belt Detection**:
   - Add `UNKNOWN` state when shoulders/chest are out of frame.
4. **Upgrade Audio Alarm Manager**:
   - Ensure AudioContext resumes upon first user click, and add distinct alert frequencies.
5. **Update Documentation**:
   - Complete all 13 required technical documents honestly reflecting actual implementations.

