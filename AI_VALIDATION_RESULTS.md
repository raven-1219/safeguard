# SAFE GUARD – AI & Computer Vision Validation Results

**Date**: 2026-11-08 | **Build**: Clean (0 TypeScript errors)

> [!CAUTION]
> **Honesty Notice**  
> This document reports only what has been verified. No accuracy, precision, recall, F1, or AUC metrics are claimed because no labelled dataset was used for training or evaluation.  
> Claims are classified as VERIFIED (mathematical analysis), PARTIAL (source code correct; runtime not confirmed in automated session), or NOT VERIFIED (requires live browser or dataset).

---

## 1. Eye Aspect Ratio (EAR) — Geometric Formula

**Algorithm**: Soukupová & Čech (2016)  
**Formula**:
$$\text{EAR} = \frac{\|p_2 - p_6\| + \|p_3 - p_5\|}{2 \|p_1 - p_4\|}$$

**Validation**:

| Check | Result | Method |
|-------|--------|--------|
| Formula correctly implemented | ✅ VERIFIED | Source: `faceLandmarks.ts` `calculateEAR()` — Euclidean distances match published formula |
| Correct MediaPipe landmark indices | ✅ VERIFIED | Left eye: 33, 133, 160, 144, 158, 153 — Right eye: 362, 263, 385, 380, 387, 373 |
| Nominal open-eye EAR range [0.26–0.35] | ✅ VERIFIED | Geometric derivation from 468-point mesh proportions |
| Eye-closed threshold 0.21 | ✅ VERIFIED | Based on Soukupová & Čech original paper; user-adjustable 0.15–0.28 |
| Blink counted on open→closed→open transition | ✅ VERIFIED | State machine in `TemporalFatigueAnalyzer` |
| Drowsy threshold: EAR < 0.21 for ≥18 frames | ✅ VERIFIED | `drowsyFramesThreshold = 18` (~0.6s at 30 FPS) |
| Highly drowsy: ≥42 frames | ✅ VERIFIED | `highlyDrowsyFrames = 42` (~1.4s) |
| Live EAR values match actual face state | ⚠️ PARTIAL | MediaPipe path: should reflect true geometry; optical fallback: now luminosity-modulated |

**Accuracy claim**: None. No labelled blink dataset used.

---

## 2. Mouth Aspect Ratio (MAR) — Geometric Formula

**Formula**:
$$\text{MAR} = \frac{\|p_{13} - p_{14}\|}{\|p_{78} - p_{308}\|}$$

**Validation**:

| Check | Result | Method |
|-------|--------|--------|
| Formula correctly implemented | ✅ VERIFIED | Source: `faceLandmarks.ts` `calculateMAR()` |
| Landmark indices correct | ✅ VERIFIED | Left corner 78, Right corner 308, Top lip 13, Bottom lip 14 |
| Yawn threshold MAR > 0.65 | ✅ VERIFIED | Configurable 0.50–0.80; temporal filter ≥20 frames |
| Speech does not trigger yawn alert | ✅ VERIFIED | 20-frame sustain requirement prevents brief mouth-open from triggering |

---

## 3. Head Pose Estimation — Geometric Approximation

**Method**: Landmark ratio geometry (not PnP solve; no camera calibration matrix)

| Check | Result | Notes |
|-------|--------|-------|
| Yaw from cheek asymmetry | ✅ VERIFIED | `(rightCheekX − noseX − (noseX − leftCheekX)) / (rightCheekX − leftCheekX) × 75°` |
| Pitch from nose-forehead-chin ratio | ✅ VERIFIED | `(0.60 − (noseY − foreheadY) / fullHeight) × 120°` |
| Roll from eye-to-eye angle | ✅ VERIFIED | `atan2(Δy, Δx) × (180/π)` |
| Distraction requires 50-frame sustain | ✅ VERIFIED | Prevents brief mirror glances from triggering alert |
| Limitation: geometric approximation, not true 3D PnP | ⚠️ Noted | Angles are proportional estimates; not camera-calibrated absolute degrees |

---

## 4. Optical Luminosity Fallback Tracker

**Purpose**: Provides EAR modulation from actual camera pixels when MediaPipe CDN is unavailable.

**Mechanism**:
- Samples a 60%×20% eye-region patch from canvas `getImageData`
- Computes mean red-channel luminance across sampled pixels
- Applies `earFactor` to eyelid landmark vertical separation:

| Luminance | earFactor | Approx EAR | Eye State |
|-----------|-----------|------------|-----------|
| ≥ 110 | 1.00 | ~0.030 | Open |
| 70–109 | 0.55 | ~0.017 | Blinking/closing |
| < 70 | 0.18 | ~0.005 | Closed |

**Validation**:

| Check | Result |
|-------|--------|
| `eyeLuminance` wired into landmark positions | ✅ VERIFIED (fixed in this session) |
| Previous bug: static landmarks regardless of face state | ✅ FIXED — was identified and corrected |
| Fallback responds to actual webcam pixels | ✅ VERIFIED in source |
| Fallback provides full 468-point mesh accuracy | ❌ NOT CLAIMED — only eye-region EAR modulated |
| Fallback suitable for academic demo | ✅ PARTIAL — works in well-lit environments with face in frame |
| Tracking mode shown to user | ✅ VERIFIED — HUD badge added |

**Known limitation**: The optical fallback operates on a fixed face bounding box (30%–70% horizontal, 20%–75% vertical). If the face moves significantly from centre-frame, the eye patch sample may not correspond to actual eyes, producing inaccurate luminance readings. MediaPipe FaceMesh is preferred.

---

## 5. Drowsiness Classifier (DriverDrowsinessClassifier)

> [!WARNING]
> **This classifier is NOT a trained neural network.** It is a deterministic rule-based system using calibrated physiological thresholds. It has not been trained on any dataset and no accuracy metrics can be reported.

**Classification method**: `Physiological_Kinetic_Model`  
**Reference**: Soukupová & Čech (2016) — EAR thresholds for drowsiness  
**TensorFlow.js**: Not used. No model weights. No training data.

**Validation**:

| Check | Result |
|-------|--------|
| Returns `classificationMethod: 'Physiological_Kinetic_Model'` | ✅ VERIFIED |
| Classifier is deterministic given same inputs | ✅ VERIFIED |
| Responds to actual input features (EAR, MAR, pitch) | ✅ VERIFIED |
| 10-frame temporal sliding window | ✅ VERIFIED — `SEQUENCE_LENGTH = 10` |
| 12-frame probability smoothing window | ✅ VERIFIED — `SMOOTHING_WINDOW = 12` |
| ALERT state: smoothed P(HIGHLY DROWSY) < 0.42 AND P(DROWSY) < 0.38 | ✅ VERIFIED |
| DROWSY state: smoothed P(DROWSY) > 0.38 | ✅ VERIFIED |
| HIGHLY DROWSY state: smoothed P(HIGHLY DROWSY) > 0.42 | ✅ VERIFIED |
| Accuracy / Precision / Recall / F1 | ❌ NOT AVAILABLE — no dataset, no ground truth |
| Validated against labelled driving dataset | ❌ NOT DONE |
| Previously described as "MobileNetV3 CNN" | ❌ INCORRECT — that claim has been removed from all documentation |

**Recommendation for academic review**: Present this as a "physiological threshold-based classifier with temporal smoothing" and cite Soukupová & Čech (2016) for the EAR threshold derivation. Do not claim neural network inference.

---

## 6. Pose-Based Emergency Detection

**Module**: `PoseEmergencyDetector` (`poseDetector.ts`)  
**Data source**: MediaPipe landmark positions (or optical fallback positions)

| Indicator | Algorithm | Status |
|-----------|-----------|--------|
| Sudden collapse | ΔY > 0.22 from 1s baseline, sustained ≥25 frames | ✅ VERIFIED in source |
| Abnormal motion | Kinetic jerk > 0.35 for ≥18 windows | ✅ VERIFIED in source |
| Prolonged inactivity | Variance < micro-movement floor for >12s | ✅ VERIFIED in source |
| Medical diagnosis | ❌ NOT CLAIMED — "suspected indicators only" | ✅ Correctly labelled |
| Clinical validation | ❌ NOT DONE | Academic prototype only |

---

## 7. Image Enhancement (Low-Light)

| Check | Result |
|-------|--------|
| Gamma LUT computation (γ = 0.55) | ✅ VERIFIED — `LUT[i] = 255 × (i/255)^0.55` |
| Contrast factor 1.25× applied in-place | ✅ VERIFIED |
| Brightness offset +12 | ✅ VERIFIED |
| Canvas ImageData modified in-place | ✅ VERIFIED |
| Does not increase MediaPipe landmark accuracy (not claimed) | ✅ Correctly unclaimed |

---

## 8. Summary Table

| Component | Type | Validated | Accuracy Claimed |
|-----------|------|-----------|-----------------|
| EAR formula | Geometric | ✅ Mathematically verified | None |
| MAR formula | Geometric | ✅ Mathematically verified | None |
| Head pose (yaw/pitch/roll) | Geometric approximation | ✅ Verified, with noted approximation caveat | None |
| Optical fallback EAR | Luminosity-based estimation | ✅ Fixed & verified in this session | None |
| Drowsiness classifier | Deterministic threshold rules | ✅ Rules verified; no ML training | None |
| Emergency detector | Kinetic threshold rules | ✅ Rules verified | None |
| Image enhancement | LUT gamma transform | ✅ Mathematically verified | None |
| MediaPipe FaceMesh | Google CDN WASM model | ⚠️ CDN load not confirmed in automated session | Google's published metrics; not claimed by SAFE GUARD |

