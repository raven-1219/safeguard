# SAFE GUARD: AI Models, Computer Vision Algorithms & Technical Documentation

This document provides mathematical formulas, neural network architectures, pre-processing methods, confidence calculations, and technical limitations for all computer vision and machine learning components in **SAFE GUARD**.

---

## 1. Facial Landmark & Fatigue Extraction Engine

### 1.1 Eye Aspect Ratio (EAR) & Blink Analysis
- **Landmark Indices** (MediaPipe 468-point mesh):
  - Left Eye: Outer Corner $p_{33}$, Inner Corner $p_{133}$, Upper Eyelid $p_{160}, p_{158}$, Lower Eyelid $p_{144}, p_{153}$.
  - Right Eye: Outer Corner $p_{362}$, Inner Corner $p_{263}$, Upper Eyelid $p_{385}, p_{387}$, Lower Eyelid $p_{380}, p_{373}$.
- **Mathematical Formula**:
  $$\text{EAR} = \frac{\|p_2 - p_6\| + \|p_3 - p_5\|}{2 \|p_1 - p_4\|}$$
- **Thresholds**:
  - Nominal Open Eyes: $\text{EAR} \in [0.26, 0.35]$.
  - Eye Closed Threshold: $\text{EAR} < 0.21$ (user-calibratable between $0.15$ and $0.28$).
  - Natural Blink Duration: $100\text{ ms} - 350\text{ ms}$ ($3 - 10$ frames at $30\text{ FPS}$).
  - Drowsy Eye Flutter: Sustained closure $> 18$ frames ($\approx 0.6\text{s}$).
  - Critical Eye Closure (Sleep / Micro-sleep): Sustained closure $> 42$ frames ($\approx 1.4\text{s}$).

### 1.2 Mouth Aspect Ratio (MAR) & Yawn Detection
- **Landmark Indices**:
  - Left Corner $p_{78}$, Right Corner $p_{308}$, Top Lip $p_{13}$, Bottom Lip $p_{14}$.
- **Mathematical Formula**:
  $$\text{MAR} = \frac{\|p_{13} - p_{14}\|}{\|p_{78} - p_{308}\|}$$
- **Thresholds**:
  - Nominal Closed/Talking Mouth: $\text{MAR} \in [0.15, 0.35]$.
  - Yawning Threshold: $\text{MAR} > 0.65$ sustained for $\ge 20$ frames ($\approx 0.7\text{s}$).
  - Normal speech movements that momentarily exceed $0.5$ do not trigger an alert due to temporal persistence filtering.

### 1.3 Head Pose Estimation & Distraction Detection
- **Anchor Landmarks**: Nose tip ($p_1$), Chin ($p_{152}$), Forehead ($p_{10}$), Left Cheek ($p_{234}$), Right Cheek ($p_{454}$).
- **Calculations**:
  - **Yaw** (Horizontal turn left/right):
    $$\text{Yaw} \propto \frac{|x_{rightCheek} - x_{nose}| - |x_{leftCheek} - x_{nose}|}{|x_{rightCheek} - x_{leftCheek}|} \times 75^\circ$$
  - **Pitch** (Vertical nod up/down):
    $$\text{Pitch} \propto \left(0.60 - \frac{y_{nose} - y_{forehead}}{|y_{chin} - y_{forehead}|}\right) \times 120^\circ$$
  - **Roll** (Lateral tilt):
    $$\text{Roll} = \arctan2(\Delta y_{eyes}, \Delta x_{eyes}) \times \frac{180^\circ}{\pi}$$
- **Distraction Trigger**:
  - Driver looking away ($|\text{Yaw}| > 28^\circ$ or $\text{Pitch} < -22^\circ$ down towards mobile phone/lap) sustained continuously for $\ge 50$ frames ($\approx 1.6\text{s}$). Short glances at vehicle mirrors do not trigger distraction.

---

## 2. Drowsiness Classification Engine

> [!IMPORTANT]
> **Implementation Notice**: The drowsiness classifier in SAFE GUARD is a **deterministic Physiological Kinetic Model**, not a trained neural network.  
> No training dataset was used. No model weights were learned. Accuracy, precision, recall, and F1 scores cannot be claimed.  
> The classifier is documented accurately below. Do not describe it as a "CNN", "MobileNetV3", or "AI model" in academic submissions without this qualification.

### 2.1 Classification Approach: Physiological Kinetic Model

The classifier (`DriverDrowsinessClassifier` in `cnnClassifier.ts`) applies **calibrated deterministic thresholds** derived from established human physiology literature, specifically:

> Soukupová, T. & Čech, J. (2016). *Real-Time Eye Blink Detection using Facial Landmarks*. 21st Computer Vision Winter Workshop.

Rather than learning from data, the classifier evaluates a **10-frame sliding temporal window** of physiological indicators and applies rule-based inference.

### 2.2 Classification Logic (Deterministic Thresholds)

**Input Feature Vector** (16-dimensional, evaluated per frame):

| Index | Feature | Source |
|-------|---------|--------|
| 0–1 | Left/Right EAR | MediaPipe / Optical fallback |
| 2 | Average EAR | Computed |
| 3 | MAR | MediaPipe / Optical fallback |
| 4–6 | Pitch, Yaw, Roll | Head pose geometry |
| 7 | Blink count | Temporal count |
| 8 | Eye closed frame ratio | Temporal count / 30 |
| 9 | Yawn ratio (0 or 1) | MAR threshold |
| 10–15 | Reserved (zeros) | — |

**Classification Rules** (evaluated over 10-frame window):

```
closure_fraction = (frames with avgEAR < 0.21) / 10

IF closure_fraction >= 0.70  OR  avgEAR < 0.19 AND closedRatio > 0.6  OR  pitch < −25°:
    → HIGHLY DROWSY  (P≈0.79)

ELSE IF closure_fraction >= 0.30  OR  avgEAR < 0.22  OR  yawning  OR  MAR > 0.65:
    → DROWSY  (P≈0.72)

ELSE:
    → ALERT  (P≈0.94)
```

### 2.3 Multi-Frame Temporal Smoothing
Probabilities are smoothed across a **12-frame rolling average** to suppress single-frame noise spikes:

- If $\bar{P}(\text{HIGHLY DROWSY}) > 0.42$: State is `HIGHLY DROWSY`
- Else if $\bar{P}(\text{DROWSY}) > 0.38$: State is `DROWSY`
- Else: State is `ALERT`

### 2.4 Honest Capability Statement

| Claim | Status |
|-------|--------|
| Trained on a dataset | ❌ No — no training data |
| Learned model weights | ❌ No — deterministic logic |
| Validated accuracy metrics | ❌ Not available |
| Responds to actual webcam input | ✅ Yes — via EAR/MAR from MediaPipe or optical fallback |
| Temporal noise suppression | ✅ Yes — 12-frame smoothing window |
| Classification method field | `Physiological_Kinetic_Model` |

---

## 3. Webcam-Based Health Emergency & Posture Detection

### 3.1 Indicators Monitored
1. **Sudden Head or Torso Collapse**:
   - Compares the driver's current head and mid-shoulder vertical coordinate ($Y$) against a rolling 1-second baseline.
   - If downward vertical displacement $\Delta Y > 0.22$ occurring in $< 0.5\text{s}$ followed by sustained slumped posture ($\ge 25$ frames), a `suspected_collapse` emergency event is generated.
2. **Abnormal Involuntary Motion (Convulsion / Tremor)**:
   - Tracks kinetic jerk (rate of change of upper-body velocity $\frac{d^2Y}{dt^2}$).
   - If high jerk ($\Delta \text{velocity} > 0.35$) repeats across $\ge 18$ consecutive windows, flags an `abnormal_motion` warning.
3. **Prolonged Inactivity / Unresponsiveness**:
   - Humans continuously make minor postural adjustments and breathing micro-movements.
   - If total movement variance drops below the micro-movement floor for $> 12$ seconds while on an active route, flags `prolonged_inactivity`.

### 3.2 Scientific Limitation Notice
These algorithms compute geometric kinetic anomalies from webcam video frames. They are **suspected emergency indicators**, not medical diagnosis, confirmed cardiac detection, or clinical seizure classification.

---

## 4. Seat Belt Contrast Analyzer & FOV Safeguard

### 4.1 Methodology
- Evaluates luminance gradient across a diagonal band from the driver's left shoulder to the opposite hip region.
- Because student laptop webcams are situated on desks and angled towards the face, the driver's chest is frequently outside the camera's field of view.
- **Safeguard**: If shoulder landmarks are not visible or are clipped below the bottom $15\%$ of the canvas, the detector returns:
  $$\text{status} = \text{'UNKNOWN'}, \quad \text{reason} = \text{'Chest region outside webcam field-of-view'}$$
- A manual confirmation toggle is provided so the driver can declare belt status when the webcam angle restricts torso visibility.

---

## 5. Low-Light Image Enhancement (CLAHE & Gamma Correction)

- Computes a 256-entry Look-Up Table (LUT) for gamma transform:
  $$\text{LUT}[i] = 255 \times \left(\frac{i}{255}\right)^\gamma, \quad \text{where } \gamma = 0.55$$
- Applies linear contrast normalization ($1.25\times$) and brightness offset ($+12$) in-place on video canvas `ImageData`.
- Enhances pupil and eyelid contour visibility during nighttime or poorly illuminated driving conditions.

