# SAFE GUARD: User & Operator Guide

This user guide describes how to operate **SAFE GUARD** across its three core user roles: **Driver**, **Fleet Moderator**, and **Administrator**.

---

## 1. Authentication & Role Gateway

1. Open the application homepage at `http://localhost:3000` or navigate to `/login`.
2. Select your designated role tab:
   - **Driver**: For bus and transit operators running active monitoring.
   - **Moderator**: For fleet supervisors monitoring driver cohorts.
   - **Administrator**: For transport directors and security compliance officers.
3. Use the **1-Click Demo Profiles** or enter your assigned email and password:
   - Driver: `driver.rajesh@safeguard.gov.in`
   - Moderator: `moderator.priya@safeguard.gov.in`
   - Administrator: `admin.director@safeguard.gov.in`
4. Click **Sign In**.

---

## 2. Driver Portal (`/driver`)

### Starting Camera Monitoring
1. When navigating to `/driver`, your browser will prompt for camera access. Click **Allow**.
2. The live camera preview will initialize.
3. Facial landmark markers will appear on the screen:
   - Blue target rings on eye corners (turn red during eye closure).
   - Mouth contour (expands and turns red during sustained yawning).
   - 3D face bounding box (turns green for ALERT, amber for DROWSY, red for HIGHLY DROWSY).

### Monitoring Indicators & Controls
- **Safety Score Meter**: Displays real-time alertness grade ($0 - 100\%$).
- **Eye Aspect Ratio (EAR)**: Live numeric readout. If $\text{EAR} < 0.21$ continuously, audio warnings sound.
- **Seat Belt Status**: Shows Fastened or Unfastened. If camera angle is tight, click the seat belt pill to manually declare your status.
- **Low-Light Mode**: Click the **Low-Light Boost** button with the moon icon to activate gamma correction for night driving.
- **Trip Lifecycle**: Click **Start Active Trip** when departing depot, and click **Complete Trip** when reaching destination.

### Posture & Emergency Telemetry
- The lower card displays head drop angles, upper-body kinetic velocity, and micro-movement stillness.
- For academic demonstration, click **Test Suspected Collapse** or **Test Abnormal Movement** to safely simulate how emergency alerts propagate to supervisors.

---

## 3. Moderator Hub (`/moderator`)

### Supervising Assigned Drivers
1. View the KPI cards at the top showing total assigned drivers, active drivers on route, alert count, and active emergencies.
2. Use the search input or state filter buttons (`ALL`, `ALERT`, `DROWSY`, `HIGHLY DROWSY`) to isolate at-risk drivers.

### Live Fleet Map
- View the OpenStreetMap vehicle tracker plotting buses along their routes.
- Click any bus icon to view vehicle registration, model, active driver, and route name.
- Toggle **Simulate Route Transit** to demonstrate smooth bus movement along waypoints during project evaluation.

### Resolving Emergencies
1. When a critical incident occurs, a high-urgency **Emergency Broadcast** banner appears with an audio siren.
2. Click **Review** on the incident card.
3. The **Emergency Resolution Modal** opens showing timestamp, trigger source, and coordinates.
4. Click **Acknowledge Alert** to confirm receipt.
5. Enter action notes (e.g., *"Dispatched medical response unit, contacted depot manager"*) and click **Resolve & Clear Event**.

---

## 4. Administrator Command Center (`/admin`)

### Fleet Management
- **Add Driver**: Click **Register New Driver** to create driver profiles with phone numbers and language preferences.
- **Add Bus**: Click **Register Vehicle** to add new buses with license plate numbers, models, and passenger capacities.
- **Assign Driver to Bus**: Open the **Assignments** tab, select driver and vehicle, and click **Confirm Assignment**.

### Audit Logs & Compliance
- Open the **Audit Logs** tab to view tamper-evident records of registrations, assignments, and emergency resolutions with client IP addresses.

### Exporting Reports
- Click **Export Safety CSV** in the header to download a complete `.csv` report of all fleet trips, safety grades, and incident frequencies.

---

## 5. Bilingual Support (English & Telugu)

- Click the **Language Switcher** pill in the top navigation bar (`తెలుగు / English`).
- The entire interface, navigation, alerts, HUD metrics, forms, and certificate sheets switch instantly to authentic Telugu without requiring a page refresh.
- Your language preference is saved in your browser for future sessions.

