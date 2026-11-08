# SAFE GUARD – Final Demo Day Checklist

**For**: Academic demonstration and project submission  
**Date**: 2026-11-08

> [!IMPORTANT]
> Complete all **Pre-Demo Preparation** steps at least 30 minutes before the demonstration begins. Do not leave environment setup to the last minute.

---

## ⬛ Part 1 — Pre-Demo Preparation (30 Minutes Before)

### Environment
- [ ] **1.1** Confirm laptop has a working built-in webcam (or USB webcam plugged in and recognised by OS)
- [ ] **1.2** Confirm demo venue has internet access (needed for MediaPipe FaceMesh CDN)
- [ ] **1.3** Set browser zoom to 100% — go to `chrome://settings` → "Page zoom: 100%"
- [ ] **1.4** Close all other browser tabs and applications to maximise performance
- [ ] **1.5** Ensure laptop is plugged into power (not battery) to prevent CPU throttling
- [ ] **1.6** Open terminal: `cd "d:\SAFE GUARD AI" && npm run dev` — confirm server starts on port 3000

### Application Startup
- [ ] **1.7** Open Chrome or Edge — navigate to `http://localhost:3000`
- [ ] **1.8** The landing page loads without errors
- [ ] **1.9** Navigate to `/login` — confirm three role tabs appear (Driver / Moderator / Admin)
- [ ] **1.10** Click on the page once (anywhere) to unlock the browser AudioContext — this enables alarm sounds from the first alert onwards

### Camera Pre-Test
- [ ] **1.11** Navigate to `/driver` — camera permission prompt appears
- [ ] **1.12** Click **Allow** for camera access
- [ ] **1.13** Live video appears on canvas within 3 seconds
- [ ] **1.14** Check HUD badge: "🟢 MediaPipe" (connected) or "🟡 Optical Fallback" (offline)
- [ ] **1.15** FPS counter shows ≥ 20 FPS
- [ ] **1.16** Safety state shows **ALERT** initially (green badge)

---

## ⬛ Part 2 — Feature Demonstration Script

### 2A — Driver Monitoring (Camera)

- [ ] **2.1** Show live camera feed with HUD overlay — point out face bounding box, eye rings, mouth ellipse
- [ ] **2.2** Show real-time telemetry strip: EAR, MAR, Head Pitch/Yaw, Blink Count
- [ ] **2.3** Close eyes for ~2 seconds — observe EAR drops below threshold → DROWSY state (amber badge, audio beep)
- [ ] **2.4** Keep eyes closed for 3+ seconds — observe HIGHLY DROWSY state (red pulsing badge, siren)
- [ ] **2.5** Open eyes — confirm state returns to ALERT within 1–2 seconds (temporal smoothing)
- [ ] **2.6** Yawn or open mouth wide — observe MAR value increase and DROWSY trigger
- [ ] **2.7** Turn head sharply sideways — observe DISTRACTED alert after ~1.6 seconds sustained turn
- [ ] **2.8** Return head to centre — confirm distraction alert clears

### 2B — Sensitivity Calibration
- [ ] **2.9** Click the ⚙️ Sliders button — Calibration drawer opens
- [ ] **2.10** Adjust EAR threshold slider — demonstrate live effect on detection sensitivity
- [ ] **2.11** Close calibration drawer

### 2C — Low-Light Enhancement
- [ ] **2.12** Toggle **Low-Light Mode** button — camera image visibly brightens
- [ ] **2.13** Show that monitoring continues to work in enhanced mode

### 2D — Seat Belt Detection
- [ ] **2.14** Show seat belt badge in HUD ("Belt: Click to Declare" if torso not in frame)
- [ ] **2.15** Click the belt badge — cycle through FASTENED / UNFASTENED / auto states
- [ ] **2.16** When UNFASTENED — observe a short audio beep (distinct from drowsy siren)

### 2E — Emergency Detection (WebcamPostureMonitor)
- [ ] **2.17** Show the posture monitor panel (Head Drop, Velocity, Inactivity gauges)
- [ ] **2.18** Use the **Demo: Trigger Collapse** button — observe suspected collapse alert fires
- [ ] **2.19** Show emergency event appears in the notification log
- [ ] **2.20** Confirm event is labelled "Suspected Emergency – Not Medical Diagnosis"

### 2F — GPS & Live Map
- [ ] **2.21** Navigate to `/moderator` or `/admin` — open the Live Fleet Map
- [ ] **2.22** Allow browser location permission when prompted
- [ ] **2.23** Show GPS pin of current laptop location on the map (if permission granted)
- [ ] **2.24** Point to demo route — confirm it is labelled "[DEMO TRANSIT ROUTE WAYPOINT]"
- [ ] **2.25** Toggle animated route playback if available

### 2G — Moderator Dashboard
- [ ] **2.26** Navigate to `/moderator`
- [ ] **2.27** Show assigned drivers list, their current safety states
- [ ] **2.28** Show emergency acknowledgement button on any active alert

### 2H — Admin Dashboard
- [ ] **2.29** Navigate to `/admin`
- [ ] **2.30** Show Assignments tab — demonstrate driver-to-vehicle assignment form
- [ ] **2.31** Show system analytics charts (Recharts)
- [ ] **2.32** Show audit log entries

### 2I — Internationalisation
- [ ] **2.33** Click language switcher in Navbar — UI text changes language
- [ ] **2.34** Switch back to English

### 2J — Offline Mode
- [ ] **2.35** Show Navbar connection status banner ("Local Mode" when no Supabase credentials)
- [ ] **2.36** Show offline queue counter in Navbar (increments as events are logged)

### 2K — Reports & Export
- [ ] **2.37** Navigate to `/reports`
- [ ] **2.38** Show analytics charts and event tables
- [ ] **2.39** Click CSV export — file downloads successfully

---

## ⬛ Part 3 — Key Talking Points for Examiners

### On the AI/ML Component
> "The drowsiness classifier is a deterministic physiological kinetic model based on established Eye Aspect Ratio thresholds from Soukupová & Čech (2016). It evaluates a 10-frame sliding window with 12-frame temporal smoothing to suppress noise. Rather than claiming a trained neural network — which would require a labelled dataset — we implemented a verifiable, reproducible threshold system that accurately responds to webcam-derived facial geometry."

### On MediaPipe
> "MediaPipe FaceMesh is a Google open-source library that provides 468 3D facial landmarks from webcam frames entirely in the browser using WASM. SAFE GUARD uses these landmarks to compute EAR and MAR geometrically. When the CDN is unavailable, we fall back to a luminosity-based optical tracker that samples actual camera pixels to modulate the EAR estimate."

### On Emergency Detection
> "Emergency detection monitors kinetic changes in head and upper body position from webcam landmarks. It identifies sudden drops, abnormal repetitive motion, and prolonged inactivity. All alerts are explicitly classified as suspected emergency indicators — not medical diagnosis — which is the correct framing for a vision-based safety monitoring system."

### On Hardware
> "SAFE GUARD runs entirely on a standard laptop. There is no external hardware — no ECG sensors, no GPS modules, no Arduino or ESP32. The webcam, browser APIs, and laptop speakers are the only physical components needed."

### On Database
> "The application is designed for Supabase PostgreSQL with Row Level Security ensuring drivers can only access their own data. For this demonstration we are running in local mock mode. All the schema DDL and RLS policies are prepared and can be applied to a live Supabase project."

---

## ⬛ Part 4 — Post-Demo

- [ ] **4.1** Stop `npm run dev` server
- [ ] **4.2** Confirm `.env.local` is not shared publicly
- [ ] **4.3** Submit project repository including all documentation files:
  - `README.md`
  - `PROJECT_FINAL_AUDIT.md`
  - `FEATURE_VERIFICATION_MATRIX.md`
  - `AI_MODEL_DOCUMENTATION.md`
  - `DATABASE_DOCUMENTATION.md`
  - `SYSTEM_ARCHITECTURE.md`
  - `SECURITY_AND_PRIVACY.md`
  - `TESTING_REPORT.md`
  - `PERFORMANCE_REPORT.md`
  - `DEPLOYMENT_GUIDE.md`
  - `USER_GUIDE.md`
  - `DEMO_GUIDE.md`
  - `KNOWN_LIMITATIONS.md`
  - `FINAL_ACCEPTANCE_TEST_REPORT.md`
  - `FINAL_FEATURE_STATUS.md`
  - `AI_VALIDATION_RESULTS.md`
  - `DATABASE_INTEGRATION_RESULTS.md`
  - `BROWSER_COMPATIBILITY_REPORT.md`
  - `FINAL_KNOWN_LIMITATIONS.md`
  - `FINAL_DEMO_CHECKLIST.md` ← this file

---

## ⬛ Emergency Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank camera / black screen | Check browser permission: `chrome://settings/content/camera` → ensure site is Allowed |
| "No webcam detected" error | Plug in USB webcam; check Device Manager; try different browser |
| No audio alerts | Click anywhere on page first to unlock AudioContext; check system volume |
| MediaPipe badge shows "🟡 Optical Fallback" | Expected on restricted networks — monitoring still works |
| App won't start (`npm run dev` fails) | Run `npm install` first; check Node.js version ≥ 18 |
| Map shows no tiles | Check internet connection; Leaflet requires OpenStreetMap tile CDN |
| Login fails with Supabase error | App will fall back to local mock mode; use role switcher in Navbar |
| TypeScript build errors | Run `npm run build` and check output; verify no `.env.local` values missing |

