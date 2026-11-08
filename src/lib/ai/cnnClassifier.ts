// ==============================================================================
// SAFE GUARD AI - Driver Drowsiness Classification Engine
// Deterministic Physiological Kinetic Fatigue Classifier & Temporal Smoothing
// ==============================================================================

import { DriverSafetyState } from '../types';

export interface DrowsinessPrediction {
  state: DriverSafetyState;
  confidence: number;
  probabilities: {
    alert: number;
    drowsy: number;
    highlyDrowsy: number;
  };
  classificationMethod: 'Physiological_Kinetic_Model' | 'Untrained_Experimental_ANN';
}

export class DriverDrowsinessClassifier {
  private isInitialized = true;

  // Rolling sequence window of 10 consecutive frame feature vectors
  // [timesteps = 10, feature_dimension = 16]
  private temporalSequenceBuffer: number[][] = [];
  private readonly SEQUENCE_LENGTH = 10;
  private readonly FEATURE_DIM = 16;

  // Multi-frame prediction smoothing window
  private probabilityHistory: Array<{ alert: number; drowsy: number; highlyDrowsy: number }> = [];
  private readonly SMOOTHING_WINDOW = 12;

  public async initialize(): Promise<void> {
    this.isInitialized = true;
    console.log('SAFE GUARD: Physiological Kinetic Drowsiness Classifier initialized.');
  }

  /**
   * Evaluates input feature vector:
   * [0: leftEAR, 1: rightEAR, 2: avgEAR, 3: mar, 4: pitch, 5: yaw, 6: roll, 7: blinkRate, 8: closedRatio, 9: yawnRatio, 10: deltaEAR, ...]
   */
  public predict(currentFeatureVector: number[]): DrowsinessPrediction {
    const normalizedVector = this.normalizeFeatureVector(currentFeatureVector);

    // Maintain temporal sliding window
    this.temporalSequenceBuffer.push(normalizedVector);
    if (this.temporalSequenceBuffer.length > this.SEQUENCE_LENGTH) {
      this.temporalSequenceBuffer.shift();
    }
    while (this.temporalSequenceBuffer.length < this.SEQUENCE_LENGTH) {
      this.temporalSequenceBuffer.unshift([...normalizedVector]);
    }

    // Evaluate physiological fatigue kinetics
    const rawProb = this.evaluatePhysiologicalFatigue(this.temporalSequenceBuffer);
    const smoothed = this.smoothAndClassify(rawProb);

    return {
      ...smoothed,
      classificationMethod: 'Physiological_Kinetic_Model',
    };
  }

  private normalizeFeatureVector(raw: number[]): number[] {
    const vec = new Array(this.FEATURE_DIM).fill(0);
    for (let i = 0; i < Math.min(raw.length, this.FEATURE_DIM); i++) {
      vec[i] = Number.isFinite(raw[i]) ? raw[i] : 0;
    }
    return vec;
  }

  /**
   * Deterministic fatigue classifier based on established human physiology:
   * - Tereza Soukupová & Jan Čech (2016): Eye Aspect Ratio for blink and drowsiness detection.
   * - Evaluates sustained eye closure duration, yawning duration, and progressive head nodding.
   */
  private evaluatePhysiologicalFatigue(sequence: number[][]): { alert: number; drowsy: number; highlyDrowsy: number } {
    const latest = sequence[sequence.length - 1];
    const avgEar = latest[2] ?? 0.28;
    const mar = latest[3] ?? 0.22;
    const closedRatio = latest[8] ?? 0;
    const pitch = latest[4] ?? 0;
    const isYawning = (latest[9] ?? 0) > 0.5;

    // Sustained eye closure over sliding window
    let closedFrameCount = 0;
    for (const frame of sequence) {
      if ((frame[2] ?? 0.3) < 0.21) {
        closedFrameCount++;
      }
    }
    const closureFraction = closedFrameCount / sequence.length;

    let pAlert = 0.94;
    let pDrowsy = 0.04;
    let pHungry = 0.02;

    if (closureFraction >= 0.70 || (avgEar < 0.19 && closedRatio > 0.6) || pitch < -25) {
      // Severe drowsiness / Micro-sleep: eyes shut for majority of sliding window or severe head drop
      pAlert = 0.03;
      pDrowsy = 0.18;
      pHungry = 0.79;
    } else if (closureFraction >= 0.30 || avgEar < 0.22 || isYawning || mar > 0.65) {
      // Moderate fatigue: slow eye blinks or yawning
      pAlert = 0.15;
      pDrowsy = 0.72;
      pHungry = 0.13;
    }

    return { alert: pAlert, drowsy: pDrowsy, highlyDrowsy: pHungry };
  }

  // Multi-frame temporal filter to eliminate single-frame noise spikes
  private smoothAndClassify(prob: { alert: number; drowsy: number; highlyDrowsy: number }) {
    this.probabilityHistory.push(prob);
    if (this.probabilityHistory.length > this.SMOOTHING_WINDOW) {
      this.probabilityHistory.shift();
    }

    const n = this.probabilityHistory.length;
    const avg = this.probabilityHistory.reduce(
      (acc, curr) => ({
        alert: acc.alert + curr.alert / n,
        drowsy: acc.drowsy + curr.drowsy / n,
        highlyDrowsy: acc.highlyDrowsy + curr.highlyDrowsy / n,
      }),
      { alert: 0, drowsy: 0, highlyDrowsy: 0 }
    );

    let state: DriverSafetyState = 'ALERT';
    let confidence = avg.alert;

    if (avg.highlyDrowsy > 0.42) {
      state = 'HIGHLY DROWSY';
      confidence = avg.highlyDrowsy;
    } else if (avg.drowsy > 0.38) {
      state = 'DROWSY';
      confidence = avg.drowsy;
    }

    return {
      state,
      confidence: Math.round(confidence * 100) / 100,
      probabilities: {
        alert: Math.round(avg.alert * 100) / 100,
        drowsy: Math.round(avg.drowsy * 100) / 100,
        highlyDrowsy: Math.round(avg.highlyDrowsy * 100) / 100,
      },
    };
  }

  public reset() {
    this.temporalSequenceBuffer = [];
    this.probabilityHistory = [];
  }
}

export const cnnDrowsinessClassifier = new DriverDrowsinessClassifier();
export const driverDrowsinessClassifier = cnnDrowsinessClassifier;
