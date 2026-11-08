# SAFE GUARD: 18-Step Live Academic Demonstration Script

This document provides a step-by-step procedure for conducting an end-to-end laptop demonstration and project defense evaluation of **SAFE GUARD**.

---

## Preparation
- **Hardware**: Student laptop with integrated webcam, speakers, and web browser.
- **Start Application**: Run `npm run dev` and navigate to `http://localhost:3000`.
- **Audio Check**: Ensure laptop speaker volume is audible.

---

## The 18-Step Demonstration Workflow

### Step 1: Administrator Authentication
- **Action**: Navigate to `/login`. Click the **Administrator** tab. Click the 1-click demo button for `Transit Safety Director`.
- **Expected Outcome**: Logged in with admin privileges and redirected to `/admin`.

### Step 2: Administrator Creates / Manages Fleets
- **Action**: On `/admin`, click **Register Vehicle**. Enter `AP 29 TA 9988`, Make `Tata Motors`, Model `Starbus EV`, Capacity `44`. Click **Submit**.
- **Expected Outcome**: New vehicle appears immediately in the Bus Fleet table; an audit log entry is created.

### Step 3: Administrator Assigns Driver to Vehicle & Moderator Group
- **Action**: On `/admin`, click the **Assignments** tab. Click **Assign Driver to Bus**. Select driver `Rajesh Kumar` and the newly registered bus. Click **Confirm Assignment**.
- **Expected Outcome**: Assignment is logged and visible in the assignments table.

### Step 4: Driver Authentication
- **Action**: In the top Navbar profile menu, switch active account to `Rajesh Kumar (Driver)`.
- **Expected Outcome**: Active role updates to `driver`, and user is navigated to `/driver`.

### Step 5: Driver Initiates Active Trip
- **Action**: Click the green **Start Active Trip** button in the top control bar.
- **Expected Outcome**: Trip timer starts ticking (`00:00:01`), trip status updates to "Active On Duty".

### Step 6: Driver Enables Webcam Monitoring
- **Action**: When browser prompts for camera access, click **Allow**.
- **Expected Outcome**: Webcam preview activates, camera status displays "AI Vision Active", and video feeds into the HUD.

### Step 7: AI Vision Landmark Tracking Begins
- **Action**: Sit upright in front of the laptop camera.
- **Expected Outcome**:
  - Green face bounding box tracks head.
  - Blue circles lock on eye corners ($\text{EAR} \approx 0.28 - 0.32$).
  - Mouth marker aligns on lips ($\text{MAR} \approx 0.22$).
  - Driver status reads `ALERT` (Green badge).

### Step 8: Controlled Drowsiness Detection Test
- **Action**: Close your eyes for $\approx 2$ seconds to simulate micro-sleep.
- **Expected Outcome**:
  - Eye target rings turn red.
  - EAR numeric readout drops below $0.21$.
  - State transitions from `ALERT` $\rightarrow$ `DROWSY` $\rightarrow$ `HIGHLY DROWSY` (Red pulsing badge).
  - Safety score meter drops from $100\%$ down towards $45\%$.

### Step 9: Laptop Local Audio Siren Alarm Sounds
- **Action**: Listen for speaker output during sustained eye closure.
- **Expected Outcome**: Web Audio API oscillator triggers a high-urgency alternating two-tone siren without requiring internet. Open eyes to observe alert silencing.

### Step 10: Event Persistence
- **Action**: Observe the **Personal Safety Events Log** on the right side of the Driver screen.
- **Expected Outcome**: New event entries (`DROWSY`, `HIGHLY_DROWSY`) appear with timestamps and EAR metrics.

### Step 11: Moderator Receives Real-Time Alert
- **Action**: Switch account via Navbar to `Priya Sharma (Fleet Moderator)`. Navigate to `/moderator`.
- **Expected Outcome**:
  - Active critical count increments.
  - Driver `Rajesh Kumar` is highlighted in the assigned driver grid with a red status badge.
  - The **Emergency Broadcast Incidents** stream displays the incident.

### Step 12: Moderator Acknowledges & Resolves Alert
- **Action**: Click **Review** on the incident card. Click **Acknowledge Alert**. Type resolution note: *"Contacted driver via radio depot dispatch. Driver confirmed awake after stop."* Click **Resolve & Clear Event**.
- **Expected Outcome**: Event status updates to `RESOLVED` with moderator timestamp and notes.

### Step 13: Safe Medical Emergency Simulation Test
- **Action**: Switch back to `/driver`. In the lower **Webcam Posture & Health Emergency Telemetry** card, click **Test Suspected Collapse**.
- **Expected Outcome**:
  - Suspected collapse alert triggers immediately with high-urgency audio.
  - Head drop displacement displays $> 30^\circ$.
  - Emergency event is queued and broadcast.

### Step 14: Administrator Views Fleet-Wide Audit Record
- **Action**: Switch account to `Transit Safety Director`. Open `/admin` and click the **Audit Logs** tab.
- **Expected Outcome**: View the full tamper-evident timeline of driver registration, vehicle assignments, and emergency incident resolutions with timestamps and client IP.

### Step 15: Driver Completes Trip
- **Action**: Return to `/driver` and click the red **Complete Trip** button.
- **Expected Outcome**: Trip status updates to `completed`. Final safety grade is calculated ($96\%$).

### Step 16: Safety Certificate & Report Generation
- **Action**: Navigate to `/reports`.
- **Expected Outcome**:
  - View the official Driver Safety & Performance Report certificate.
  - Click **Download Official File** to receive a verified `.txt` audit report.
  - Test print view preview (`Ctrl + P` / Print button).

### Step 17: Bilingual Language Switch Demonstration
- **Action**: In the top navigation bar, click **తెలుగు**.
- **Expected Outcome**:
  - The entire application interface translates instantly into authentic Telugu.
  - Navigation, HUD metrics, forms, and certificate headings display in Telugu font without text truncation.
  - Click **English** to switch back.

### Step 18: Offline Mode & Reconnection Sync Test
- **Action**:
  1. In browser Developer Tools $\rightarrow$ Network tab, select **Offline**.
  2. The top bar pill updates from `LIVE` to `OFFLINE`.
  3. Close eyes briefly on `/driver` to trigger a drowsiness event.
  4. Notice the audio alarm functions completely offline, and top bar displays `1 Pending Sync`.
  5. In Developer Tools, re-enable **Online**.
  6. Observe the offline queue automatically flushing stored events to the server with zero duplicates.

---

## Conclusion of Demonstration
The 18-step live demonstration confirms that SAFE GUARD operates strictly on a laptop webcam, produces real-time AI computer vision telemetry, protects driver safety with offline audio alarms, supports complete bilingual English and Telugu usage, and isolates multi-tenant roles securely.

