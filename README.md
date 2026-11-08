# SAFE GUARD: AI-Based Intelligent Driver Safety & Fleet Emergency Platform

**SAFE GUARD** is a complete, lightweight, production-structured web application designed for public transportation driver safety, posture health emergencies, and fleet vehicle monitoring.

The application operates **strictly on an ordinary laptop** using the integrated webcam, speakers, and browser-based computer vision without requiring external IoT or electronic hardware.

---

## 🚀 Key Highlights & Capabilities

- **Real-Time Webcam AI HUD**: In-browser facial and upper-body landmark tracking running at $\approx 30\text{ FPS}$.
- **Eye Aspect Ratio (EAR) & Blink Analysis**: Mathematically calibrated eye closure and blink frequency monitoring.
- **Mouth Aspect Ratio (MAR) & Yawn Detection**: Sustained yawning detection with temporal persistence filters.
- **Head Pose Estimation (Pitch, Yaw, Roll)**: 3D head angle calculation to detect off-road driver distraction.
- **1D Temporal Convolutional Neural Classifier**: Neural network evaluating 10-frame sequences of physiological feature vectors across 3 states: `ALERT`, `DROWSY`, and `HIGHLY DROWSY`.
- **Webcam-Based Emergency Indicators**: Sudden vertical collapse detection, abnormal involuntary motion detection, and prolonged inactivity timer.
- **Offline Web Audio Alarms**: Local multi-tone warning chimes and alternating emergency sirens functioning 100% without internet connectivity.
- **Seat Belt FOV Safeguards**: Contrast analysis with explicit `UNKNOWN` state when laptop webcam angle restricts chest visibility.
- **Low-Light Night Boost**: In-place LUT Gamma correction ($\gamma = 0.55$) and contrast stretching for dark cabin environments.
- **OpenStreetMap & Geolocation Tracker**: Live Leaflet fleet map with browser geolocation and simulated demo route waypoint playback.
- **3-Role Portals & Security**: Dedicated interfaces for Driver (`/driver`), Fleet Moderator (`/moderator`), and Administrator (`/admin`).
- **Complete Bilingual Localization**: Instant English and Telugu (తెలుగు) language switching with Noto Sans Telugu typography.
- **PostgreSQL & Row Level Security**: 12 relational database tables in `supabase/schema.sql` with strict data isolation.
- **IndexedDB Offline Event Queue**: Buffers events during network loss and synchronizes with idempotency keys upon reconnection.

---

## 📋 Comprehensive Technical Documentation Suite

The repository contains 13 detailed technical documents:

| Document | Description |
|---|---|
| [PROJECT_FINAL_AUDIT.md](file:///d:/SAFE%20GUARD%20AI/PROJECT_FINAL_AUDIT.md) | Exhaustive codebase audit and feature classification |
| [FEATURE_VERIFICATION_MATRIX.md](file:///d:/SAFE%20GUARD%20AI/FEATURE_VERIFICATION_MATRIX.md) | Technical status and verification evidence for every feature |
| [REMAINING_ISSUES.md](file:///d:/SAFE%20GUARD%20AI/REMAINING_ISSUES.md) | Specific deficiencies identified and architectural solutions |
| [SYSTEM_ARCHITECTURE.md](file:///d:/SAFE%20GUARD%20AI/SYSTEM_ARCHITECTURE.md) | Complete system architecture, edge vision pipeline, and cloud sync |
| [AI_MODEL_DOCUMENTATION.md](file:///d:/SAFE%20GUARD%20AI/AI_MODEL_DOCUMENTATION.md) | Formulas, neural topologies, thresholds, and confidence calculations |
| [DATABASE_DOCUMENTATION.md](file:///d:/SAFE%20GUARD%20AI/DATABASE_DOCUMENTATION.md) | 12 SQL tables, ER diagram, foreign keys, and RLS policies |
| [SECURITY_AND_PRIVACY.md](file:///d:/SAFE%20GUARD%20AI/SECURITY_AND_PRIVACY.md) | Zero-video upload policy, RBAC, secret management, and consent |
| [TESTING_REPORT.md](file:///d:/SAFE%20GUARD%20AI/TESTING_REPORT.md) | Test cases, physiological validation, and empirical results |
| [PERFORMANCE_REPORT.md](file:///d:/SAFE%20GUARD%20AI/PERFORMANCE_REPORT.md) | Measured bundle size, FPS, memory consumption, and optimizations |
| [DEPLOYMENT_GUIDE.md](file:///d:/SAFE%20GUARD%20AI/DEPLOYMENT_GUIDE.md) | Step-by-step local laptop and Vercel deployment instructions |
| [USER_GUIDE.md](file:///d:/SAFE%20GUARD%20AI/USER_GUIDE.md) | Operator guide for Driver, Moderator, and Administrator roles |
| [DEMO_GUIDE.md](file:///d:/SAFE%20GUARD%20AI/DEMO_GUIDE.md) | 18-step live demonstration and project defense script |
| [KNOWN_LIMITATIONS.md](file:///d:/SAFE%20GUARD%20AI/KNOWN_LIMITATIONS.md) | Transparent limitations and future vehicle scope |

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Locally
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

### 3. Build & Test Production Mode
```bash
npm run build
npm start
```

### 4. 1-Click Demo Profiles (Pre-configured)
- **Driver**: `driver.rajesh@safeguard.gov.in`
- **Moderator**: `moderator.priya@safeguard.gov.in`
- **Administrator**: `admin.director@safeguard.gov.in`
*(Password: any string e.g. `safeguard123`)*
# safeguard
