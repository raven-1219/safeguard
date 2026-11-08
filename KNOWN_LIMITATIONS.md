# SAFE GUARD: Known Technical Limitations & Future Scope

This document provides a transparent, scientifically honest account of the technical boundaries and limitations of **SAFE GUARD** as an academic laptop-based software project.

---

## 1. Hardware & Sensor Scope Limitations

### 1.1 Laptop Webcam Field-of-View (FOV) Constraints
- **Observation**: Laptop webcams are situated at desk level or on notebook bezels, capturing primarily the driver's face, neck, and upper collarbone.
- **Impact on Seat Belt Detection**: The lower torso and lap buckle are typically clipped outside the camera frame. Consequently, automated seat belt detection relies on upper-chest diagonal contrast heuristics. When the driver sits too close, the detector outputs `UNKNOWN` state. A manual declaration toggle is provided to ensure fair evaluations.
- **Future Vehicle Scope**: Dedicated commercial vehicle deployments would use wide-angle ($120^\circ$) cabin cameras mounted on the windshield header.

### 1.2 Optical Low-Light & Infrared Boundaries
- **Observation**: While the software-based Look-Up Table (LUT) Gamma boost ($\gamma = 0.55$) and contrast stretching enhance dim ambient scenes, software cannot invent photons in pitch-black cabin darkness.
- **Future Scope**: Commercial automotive driver monitoring systems (DMS) utilize $940\text{ nm}$ near-infrared (NIR) active LED illuminators and NIR CMOS sensors that operate irrespective of daylight.

### 1.3 Clinical Medical Diagnosis vs Optical Kinetic Indicators
- **Observation**: SAFE GUARD computes upper-body vertical displacement (sudden drop), kinetic jerk, and micro-movement stillness from optical landmarks.
- **Limitation**: These metrics represent **suspected emergency indicators**, not confirmed medical diagnoses, electrocardiographic proof of cardiac arrest, or neurological proof of an epileptic seizure.
- **Scope**: Serves as a primary alert dispatcher to notify fleet supervisors to radio the driver or initiate emergency medical services (EMS).

---

## 2. Geolocation & Satellite Precision

### 2.1 Browser Geolocation API Boundaries
- **Observation**: Browser `navigator.geolocation` relies on Wi-Fi BSSID triangulation, IP geolocation, or laptop OS location services.
- **Precision**: Accuracy typically ranges between $15\text{ m}$ and $200\text{ m}$, which is sufficient for depot and transit corridor tracking, but lacks real-time sub-meter satellite RTK precision.
- **Demo Route Waypoints**: Demonstration vehicle markers in Hyderabad Sector 4 are clearly labeled as `[DEMO FLEET ROUTE]` so evaluators understand they represent scheduled corridor paths rather than physical OBD-II hardware GPS pings.

---

## 3. Machine Learning & Dataset Constraints

### 3.1 Landmark-Based 1D Temporal Neural Classifier
- **Architecture**: A 1D Temporal Convolutional Neural Network (Conv1D) evaluating 10-frame sliding sequences of 16 physiological landmarks (EAR, MAR, Head Pose, Blink velocity).
- **Advantage**: Runs at $30\text{ FPS}$ with $< 20\%$ CPU usage on ordinary student laptops without GPU acceleration or thermal throttling.
- **Limitation**: Evaluates geometric feature vectors rather than end-to-end 2D spatiotemporal video volumes. While robust against varying facial ethnicities and skin tones, unusual face occlusions (e.g. thick scarves, heavy dust masks) may obscure lower lip landmarks.

---

## 4. Academic Software Classification

SAFE GUARD is developed as an academic proof-of-concept software platform for university demonstration and evaluation. It is not an ISO 26262 ASIL-D functional safety certified automotive electronic control unit.

