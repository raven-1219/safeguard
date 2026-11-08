// ==============================================================================
// SAFE GUARD AI - Pose-Based Medical Emergency Detection Module
// Temporal analysis of sudden collapse, convulsion/abnormal motion, and inactivity
// ==============================================================================

import { Point3D } from './faceLandmarks';
import { PoseEmergencyTelemetry } from '../types';

export interface PoseLandmarksData {
  nose: Point3D;
  leftShoulder: Point3D;
  rightShoulder: Point3D;
  leftElbow?: Point3D;
  rightElbow?: Point3D;
  leftWrist?: Point3D;
  rightWrist?: Point3D;
  leftHip?: Point3D;
  rightHip?: Point3D;
}

export class PoseEmergencyDetector {
  private history: Array<{
    timestamp: number;
    headY: number;
    shoulderMidY: number;
    wristVelocity: number;
    overallMotion: number;
  }> = [];

  private lastSignificantMotionTime = Date.now();
  private collapseDetected = false;
  private collapseTriggerFrames = 0;
  private abnormalMotionCounter = 0;
  private inactivitySeconds = 0;

  // Thresholds
  private readonly COLLAPSE_DROP_VELOCITY = 0.22; // Fractional vertical drop in <0.5s
  private readonly COLLAPSE_SUSTAINED_FRAMES = 25; // Must stay collapsed for ~0.8s
  private readonly ABNORMAL_JERK_THRESHOLD = 0.35; // Erratic wrist/shoulder acceleration
  private readonly INACTIVITY_THRESHOLD_SECONDS = 12; // Inactivity on active trip

  public processPose(landmarks: any[]): PoseEmergencyTelemetry {
    if (!landmarks || landmarks.length < 25) {
      return {
        isAbnormalMotion: false,
        isSuspectedCollapse: false,
        isProlongedInactivity: false,
        motionVelocity: 0,
        headDropDegrees: 0,
        inactivitySeconds: 0,
      };
    }

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15] || leftShoulder;
    const rightWrist = landmarks[16] || rightShoulder;

    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2.0;
    const headY = nose.y;

    const now = Date.now();

    // Calculate motion since previous frame
    let wristVelocity = 0;
    let overallMotion = 0;

    if (this.history.length > 0) {
      const prev = this.history[this.history.length - 1];
      const dt = Math.max((now - prev.timestamp) / 1000, 0.016);
      const dyHead = (headY - prev.headY) / dt;
      const dyShoulder = (shoulderMidY - prev.shoulderMidY) / dt;

      overallMotion = Math.abs(dyHead) + Math.abs(dyShoulder);

      if (overallMotion > 0.03) {
        this.lastSignificantMotionTime = now;
      }
    }

    this.history.push({
      timestamp: now,
      headY,
      shoulderMidY,
      wristVelocity,
      overallMotion,
    });

    if (this.history.length > 45) {
      this.history.shift();
    }

    // 1. Sudden Collapse Detection:
    // Compare current head/shoulder position with baseline from ~1 second ago
    let isSuspectedCollapse = false;
    let headDropDegrees = 0;

    if (this.history.length >= 20) {
      const baseline = this.history[0];
      const verticalDrop = headY - baseline.headY; // Positive = downward in video coordinates
      headDropDegrees = Math.max(0, Math.round(verticalDrop * 120));

      // Head drops significantly below normal resting posture
      if (verticalDrop > this.COLLAPSE_DROP_VELOCITY) {
        this.collapseTriggerFrames++;
        if (this.collapseTriggerFrames >= this.COLLAPSE_SUSTAINED_FRAMES) {
          isSuspectedCollapse = true;
          this.collapseDetected = true;
        }
      } else {
        this.collapseTriggerFrames = Math.max(0, this.collapseTriggerFrames - 2);
        if (this.collapseTriggerFrames === 0) {
          this.collapseDetected = false;
        }
      }
    }

    // 2. Abnormal / Convulsive Movement Detection:
    // High-frequency alternating directional movement
    let isAbnormalMotion = false;
    if (this.history.length >= 15) {
      let highJerkCount = 0;
      for (let i = 1; i < this.history.length; i++) {
        const delta = Math.abs(this.history[i].overallMotion - this.history[i - 1].overallMotion);
        if (delta > this.ABNORMAL_JERK_THRESHOLD) {
          highJerkCount++;
        }
      }

      if (highJerkCount >= 8) {
        this.abnormalMotionCounter++;
      } else {
        this.abnormalMotionCounter = Math.max(0, this.abnormalMotionCounter - 1);
      }

      // Requires repeated pattern over multiple frame windows (avoids single frame false positive)
      isAbnormalMotion = this.abnormalMotionCounter >= 18;
    }

    // 3. Prolonged Inactivity Detection
    const inactiveDuration = (now - this.lastSignificantMotionTime) / 1000;
    this.inactivitySeconds = Math.round(inactiveDuration);
    const isProlongedInactivity = inactiveDuration > this.INACTIVITY_THRESHOLD_SECONDS;

    return {
      isAbnormalMotion,
      isSuspectedCollapse: isSuspectedCollapse || this.collapseDetected,
      isProlongedInactivity,
      motionVelocity: Math.round(overallMotion * 100) / 100,
      headDropDegrees,
      inactivitySeconds: this.inactivitySeconds,
    };
  }

  public reset() {
    this.history = [];
    this.lastSignificantMotionTime = Date.now();
    this.collapseDetected = false;
    this.collapseTriggerFrames = 0;
    this.abnormalMotionCounter = 0;
  }
}

export const poseEmergencyDetector = new PoseEmergencyDetector();

