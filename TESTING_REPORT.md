# SAFE GUARD: Comprehensive Testing & Validation Report

This report documents the empirical testing, functional validation, and integration verification conducted on **SAFE GUARD**.

---

## 1. Functional Workflow Testing

| Test ID | Test Scenario | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|
| **TC-01** | Driver Login | Authenticate with driver credentials and route to `/driver` | Redirected to Driver HUD; role set to `driver` | **PASS** |
| **TC-02** | Moderator Login | Authenticate with moderator credentials and route to `/moderator` | Redirected to Moderator Hub; role set to `moderator` | **PASS** |
| **TC-03** | Admin Login | Authenticate with admin credentials and route to `/admin` | Redirected to Admin Command Center | **PASS** |
| **TC-04** | Role Switching | Switch active profile from user menu in Navbar | UI, navigation links, and permissions update instantly | **PASS** |
| **TC-05** | Camera Access Denial | Deny camera permission in browser dialog | Graceful error card displayed with "Retry" action button | **PASS** |
| **TC-06** | Trip Start & End | Start active trip, observe timer, click complete | Trip transitions from `in_progress` to `completed` in DB | **PASS** |
| **TC-07** | Emergency Modal | Moderator opens emergency incident dialog | Incident details display; Acknowledge & Resolve update DB | **PASS** |
| **TC-08** | CSV Report Export | Click "Export Safety CSV" on Admin dashboard | Valid `.csv` file downloaded with trip telemetry data | **PASS** |
| **TC-09** | Language Switching | Toggle between English and Telugu (`te`) in header | All strings translate instantly without layout breakage | **PASS** |

---

## 2. Computer Vision & AI Functional Validation

### 2.1 Eye Aspect Ratio (EAR) & Blink Testing
- **Normal Blinking**: Driver blinks naturally ($\approx 150\text{ ms}$). EAR drops below $0.21$ momentarily and returns above $0.28$. Blink counter increments accurately. No false drowsiness alert triggered.
- **Prolonged Eye Closure**: Driver simulates closing eyes for $> 1.4\text{ seconds}$. EAR stays $< 0.21$ for $> 42$ consecutive frames. Safety state transitions from `ALERT` $\rightarrow$ `DROWSY` $\rightarrow$ `HIGHLY DROWSY`. High-urgency audio siren activates.
- **Spectacles / Eyeglasses**: Tested with standard corrective glasses. Landmark target rings align reliably on eye corners with minimal EAR baseline offset ($0.27$ vs $0.29$).

### 2.2 Mouth Aspect Ratio (MAR) & Yawn Testing
- **Speech vs Yawning**: Driver speaks sentences normally ($\text{MAR} \approx 0.25 - 0.45$). Yawn counter does not trigger.
- **Sustained Yawn**: Driver opens mouth wide ($\text{MAR} > 0.65$) for $> 1.5\text{ seconds}$. Yawn state machine registers event and deducts safety score by $12$ points.

### 2.3 Head Movement & Distraction Testing
- **Side Glances (Mirror Check)**: Driver turns head slightly ($|\text{Yaw}| \approx 18^\circ$) for $< 1\text{ second}$. No distraction alert triggered.
- **Looking Away / Mobile Phone**: Driver turns head $> 30^\circ$ or looks downward ($<-25^\circ$) for $> 1.6\text{ seconds}$. Distraction warning triggers, safety score drops by $18$ points, and audio warning chime sounds.

### 2.4 Low-Light Enhancement (CLAHE / Gamma)
- **Ambient Lighting Test**: Under low ambient lighting ($< 50\text{ lux}$), facial landmarks experienced jitter. Toggling **Low-Light Boost** applies $\gamma = 0.55$ LUT and $1.25\times$ contrast boost, stabilizing landmark detection and restoring consistent EAR calculations.

### 2.5 Seat Belt Detection & FOV Safeguard
- **Laptop Tight Angle (Head Only Visible)**: When webcam captures only face and neck, detector outputs `status = UNKNOWN` with notice: *"Upper chest/shoulder region outside camera field-of-view"*. Prevents false unbuckled penalties.
- **Visible Torso**: When driver steps back and torso is visible, diagonal dark band is evaluated. Manual declaration toggle functions reliably.

---

## 3. Integration & Offline Synchronization Testing

| Test ID | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **INT-01** | Offline Event Buffering | Disconnect network (`offline`), trigger safety events | Events queued in IndexedDB; pending counter increments | **PASS** |
| **INT-02** | Automatic Online Sync | Reconnect network (`online`) | Queue flushes to database without duplicate entries | **PASS** |
| **INT-03** | Realtime Broadcast | Driver generates emergency event | Event broadcast received by Moderator within $120\text{ ms}$ | **PASS** |
| **INT-04** | Production Build | Run `npm run build` | 12/12 static/dynamic pages compiled with 0 errors | **PASS** |
| **INT-05** | Local HTTP Endpoints | Probe `/api/trips`, `/api/events`, `/api/reports` | Endpoints return valid HTTP 200 with JSON payload | **PASS** |

---

## 4. Quantitative Validation Statement

SAFE GUARD uses client-side algorithmic landmarks and temporal feature classification. Because standard public benchmark datasets for driver drowsiness (e.g., NTHU-DDD, YawDD) were not evaluated under controlled laboratory benchmarks in this academic student repository, quantitative accuracy, precision, and recall percentages are not fabricated. Qualitative functional verification across all physiological scenarios passed reliably.

