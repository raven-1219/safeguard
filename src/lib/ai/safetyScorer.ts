// ==============================================================================
// SAFE GUARD AI - Combined Driver Safety Score Engine (0 - 100)
// Integrates EAR, MAR, Head Pose, CNN Classification, and Seat Belt Status
// ==============================================================================

import { DriverSafetyState } from '../types';

export interface SafetyScoreInput {
  isEyeClosed: boolean;
  eyeClosedFrames: number;
  isYawning: boolean;
  isDistracted: boolean;
  isSeatBeltFastened: boolean;
  cnnState: DriverSafetyState;
  cnnConfidence: number;
  isCollapseDetected: boolean;
  isAbnormalMotion: boolean;
}

export interface SafetyScoreOutput {
  score: number;                   // 0 to 100
  state: DriverSafetyState;
  isCritical: boolean;
  reasons: string[];
}

export class SafetyScoreAggregator {
  private currentScore = 100;
  private violationHistory: string[] = [];

  public calculateScore(input: SafetyScoreInput): SafetyScoreOutput {
    let score = this.currentScore;
    const reasons: string[] = [];

    // Severe critical triggers immediately cap score
    if (input.isCollapseDetected) {
      score = 0;
      reasons.push('Driver Collapse Detected');
      this.currentScore = score;
      return { score: 0, state: 'HIGHLY DROWSY', isCritical: true, reasons };
    }

    if (input.isAbnormalMotion) {
      score = Math.min(score, 25);
      reasons.push('Abnormal Involuntary Movement');
    }

    // Eye closure duration penalty
    if (input.eyeClosedFrames > 35) {
      // Sustained closure > 1.2s
      score -= 35;
      reasons.push('Prolonged Eye Closure');
    } else if (input.eyeClosedFrames > 15) {
      score -= 15;
      reasons.push('Heavy Eye Flutter / Drowsy Blinks');
    }

    // Yawning penalty
    if (input.isYawning) {
      score -= 12;
      reasons.push('Frequent / Prolonged Yawning');
    }

    // Distraction penalty
    if (input.isDistracted) {
      score -= 18;
      reasons.push('Driver Distraction (Looking Away)');
    }

    // Seat belt penalty
    if (!input.isSeatBeltFastened) {
      score -= 20;
      reasons.push('Seat Belt Unbuckled');
    }

    // CNN Classifier reinforcement
    if (input.cnnState === 'HIGHLY DROWSY') {
      score = Math.min(score, 45);
      reasons.push('CNN Classifier: High Drowsiness Probability');
    } else if (input.cnnState === 'DROWSY') {
      score = Math.min(score, 68);
      reasons.push('CNN Classifier: Fatigue Signs');
    }

    // Attentive recovery: slowly climb back if driver is alert
    if (
      !input.isEyeClosed &&
      !input.isYawning &&
      !input.isDistracted &&
      input.isSeatBeltFastened &&
      input.cnnState === 'ALERT'
    ) {
      score = Math.min(100, score + 0.8);
    }

    // Bound score
    score = Math.max(0, Math.min(100, Math.round(score)));
    this.currentScore = score;

    // Determine state
    let state: DriverSafetyState = 'ALERT';
    if (score < 50 || input.eyeClosedFrames > 35) {
      state = 'HIGHLY DROWSY';
    } else if (score < 75 || input.eyeClosedFrames > 15 || input.isYawning) {
      state = 'DROWSY';
    }

    return {
      score,
      state,
      isCritical: state === 'HIGHLY DROWSY',
      reasons,
    };
  }

  public reset() {
    this.currentScore = 100;
    this.violationHistory = [];
  }
}

export const safetyScoreAggregator = new SafetyScoreAggregator();

