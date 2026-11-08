# SAFE GUARD – Final Known Limitations

**Version**: 1.0.0 | **Date**: 2026-11-08

This document lists every known technical limitation of the SAFE GUARD application, with honest classification and recommended mitigations for the academic demonstration.

---

## Limitation 1 — Optical Fallback: Fixed Face Bounding Box

**Severity**: Medium  
**Affects**: EAR/MAR accuracy when MediaPipe CDN is unavailable

**Description**:  
When MediaPipe FaceMesh cannot load from the CDN (e.g., no internet), the optical fallback tracker uses a fixed bounding box (30%–70% horizontal, 20%–75% vertical of the canvas) to sample eye-region pixel luminance. If the driver's face is not centred in this region, the luminance sample may not correspond to their actual eyes.

**What was fixed in this session**:  
Previously, the optical fallback returned static (constant) landmark positions regardless of eye state. This has been fixed — `eyeLuminance` from actual canvas pixels now modulates the eyelid landmark vertical separation, so EAR responds to actual brightness changes from the webcam.

**Remaining limitation**:  
The face bounding box is fixed. If the driver is not centred in frame, the luminance patch may read clothing or background, not eyes.

**Mitigation for demo**:  
- Use MediaPipe (internet connection) for the main demonstration
- If offline, ensure the driver's face is centred in the camera
- The "🟡 Optical Fallback" badge in the HUD warns the user which mode is active

---

## Limitation 2 — Drowsiness Classifier: No Trained ML Model

**Severity**: High (academic transparency required)  
**Affects**: Claims about AI/ML in the project

**Description**:  
The `DriverDrowsinessClassifier` is a **deterministic rule-based system**, not a trained neural network. It applies physiological thresholds derived from Soukupová & Čech (2016) to EAR/MAR/pitch values. No dataset was used. No model weights were learned. Accuracy metrics (precision, recall, F1) cannot be claimed.

**Impact**:  
The system correctly detects sustained eye closure and yawning (via threshold rules), but it cannot:
- Adapt to individual driver physiological variation
- Generalise across different lighting conditions without MediaPipe
- Provide validated accuracy numbers

**Mitigation**:  
- Present honestly as a "physiological kinetic threshold classifier"
- Cite Soukupová & Čech (2016) for the threshold basis
- Do not claim "MobileNetV3", "CNN", or "AI model" without this qualification
- All documentation updated to reflect this accurately

---

## Limitation 3 — Supabase Cloud Integration: Not Verified

**Severity**: High (for production deployment)  
**Affects**: Authentication, data persistence, Realtime alerts

**Description**:  
The entire Supabase integration (authentication, PostgreSQL queries, RLS enforcement, Realtime channels) could not be tested because no live Supabase project credentials were available. All database operations ran against a local `mockDb` interface.

**What is verified**:
- Schema DDL is syntactically correct SQL
- RLS policies are correctly defined in SQL
- Client code calls correct Supabase API methods
- Mock DB tests pass

**What is not verified**:
- Cloud authentication with real user accounts
- RLS actually blocking unauthorised access on a live instance
- Realtime WebSocket push notifications to moderators
- Data persistence across sessions

**Mitigation for demo**:
- Create a free Supabase project (supabase.com)
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Run `supabase db push` to apply migrations
- Create test users for each role
- Test RLS by trying direct API calls with wrong auth tokens

---

## Limitation 4 — Audio Requires User Interaction First

**Severity**: Low  
**Affects**: First-run audio alert playback

**Description**:  
All modern browsers block `AudioContext.start()` until the user has interacted with the page (clicked or tapped). Until this gesture occurs, alarm sounds are silently queued.

**Mitigation for demo**:  
Click anywhere on the page (or the camera start button) before testing audio. The interaction unlock listener in `alarmSound.ts` handles this automatically.

---

## Limitation 5 — GPS Requires Browser Permission

**Severity**: Low  
**Affects**: Live map GPS pin

**Description**:  
`navigator.geolocation` requires explicit browser permission. If denied, the map falls back to the demo route only. No actual vehicle location is tracked.

**Mitigation**:  
Allow location access when prompted. The GPS status pill in the map UI shows current state.

---

## Limitation 6 — Seat Belt Detection Requires Torso in Webcam Frame

**Severity**: Medium  
**Affects**: Seat belt detection accuracy

**Description**:  
The seat belt luminance analyser samples a diagonal pixel band from shoulder to opposite hip. On a laptop with the webcam positioned at face level, the torso is usually outside the frame, triggering `UNKNOWN` status.

**Mitigation**:  
- Tilt the laptop screen forward to include chest in frame, OR
- Use the manual declaration toggle (click the seat belt badge) to confirm belt status
- The `UNKNOWN` state is accurately shown rather than a false FASTENED

---

## Limitation 7 — MediaPipe CDN Dependency

**Severity**: Low–Medium depending on demo environment  
**Affects**: Full 468-point landmark accuracy

**Description**:  
MediaPipe FaceMesh loads its WASM binary and model weights from `cdn.jsdelivr.net`. If the demo venue has a restricted network or firewall, MediaPipe will fail to load and the optical fallback activates.

**Mitigation**:  
- Test on the demo network in advance
- Download MediaPipe assets for local serving if network is restricted (see DEPLOYMENT_GUIDE.md)
- The optical fallback is now functional (fixed in this session) for basic EAR detection

---

## Limitation 8 — Head Pose Angles Are Geometric Approximations

**Severity**: Low  
**Affects**: Head pose estimation precision

**Description**:  
Head pose (yaw, pitch, roll) is computed from landmark coordinate ratios, not from a calibrated camera-projection (PnP solve). The angles are proportional estimates useful for detecting large movements (looking away, head nodding) but are not accurate absolute degrees.

**Mitigation**:  
Present as "head orientation indicators" rather than "precise 3D rotation angles". The distraction threshold (|yaw| > 28°) accounts for this approximation.

---

## Limitation 9 — No Multi-Camera Support

**Severity**: Very Low (academic scope)  
**Affects**: Users with multiple webcams

**Description**:  
The camera initialisation uses `facingMode: 'user'` which selects the default front camera. On laptops this is correct. External USB cameras may need explicit device selection.

---

## Limitation 10 — Emergency Detection is Not Medically Validated

**Severity**: Important for academic context  
**Affects**: Emergency detection claims

**Description**:  
Collapse detection, abnormal motion detection, and inactivity monitoring are based on geometric kinetic analysis of webcam landmark positions. They produce "suspected emergency indicators" only. They cannot:
- Confirm cardiac events
- Diagnose seizures
- Replace dedicated medical monitoring equipment

**Mitigation**:  
All emergency events are labelled "suspected" in the UI and documentation. Emergency detection is presented as a safety indicator that prompts human follow-up, not an autonomous medical diagnosis system.

---

## Summary Table

| # | Limitation | Severity | Demo Impact | Mitigation |
|---|-----------|---------|------------|-----------|
| 1 | Optical fallback fixed bounding box | Medium | Low (use MediaPipe if connected) | Use internet for demo; face centred |
| 2 | No trained ML classifier | High (transparency) | Low (correctly documented) | Present as threshold classifier |
| 3 | Supabase cloud not verified | High | Medium (use mock mode) | Set up Supabase project pre-demo |
| 4 | Audio requires user gesture | Low | Very low (click page once) | Click camera button first |
| 5 | GPS requires browser permission | Low | Low | Allow location when prompted |
| 6 | Seat belt detection needs torso | Medium | Low (manual toggle available) | Use manual declaration |
| 7 | MediaPipe CDN dependency | Low–Medium | Low (fallback available) | Test network in advance |
| 8 | Head pose geometric approximation | Low | Very low | Frame as "orientation indicators" |
| 9 | No multi-camera selection | Very low | None | N/A for single-webcam laptops |
| 10 | Emergency not medically validated | Important | None (correctly stated) | Label as "suspected indicators" |
