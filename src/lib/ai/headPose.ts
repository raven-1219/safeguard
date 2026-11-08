// ==============================================================================
// SAFE GUARD AI - Head Pose Estimation & Distraction Detection Engine
// Computes 3D Pitch, Yaw, and Roll from Face Mesh landmarks
// Highly responsive head movement and orientation tracking
// ==============================================================================

import { Point3D } from './faceLandmarks';

export interface HeadPoseResult {
  pitch: number;      // Positive = looking up, Negative = looking down
  yaw: number;        // Positive = looking right, Negative = looking left
  roll: number;       // Tilt sideways
  isDistracted: boolean;
  distractedFrames: number;
  direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UP';
}

export class HeadPoseEstimator {
  private distractedFrames = 0;
  // Calibrated sensitive thresholds for realistic laptop webcam field of view
  public yawThreshold = 14;           // Degrees turn left or right
  public pitchDownThreshold = -10;    // Degrees tilt down (phone/lap check)
  public pitchUpThreshold = 14;       // Degrees tilt up (ceiling check)
  public distractionFramesTrigger = 8; // ~0.25s of looking away triggers alert

  public estimatePose(landmarks: Point3D[]): HeadPoseResult {
    if (!landmarks || landmarks.length < 468) {
      return {
        pitch: 0,
        yaw: 0,
        roll: 0,
        isDistracted: false,
        distractedFrames: 0,
        direction: 'CENTER',
      };
    }

    const noseTip = landmarks[1];
    const chin = landmarks[152];
    const forehead = landmarks[10];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    // Horizontal yaw estimation:
    // Calculates the offset of the nose relative to the cheek midpoint
    const cheekSpan = Math.abs(rightCheek.x - leftCheek.x);
    let yaw = 0;
    if (cheekSpan > 0.02) {
      const cheekMidpointX = (leftCheek.x + rightCheek.x) / 2;
      const horizontalOffset = noseTip.x - cheekMidpointX;
      // Ratio from -1.0 to +1.0
      const yawRatio = horizontalOffset / (cheekSpan * 0.5);
      yaw = yawRatio * 52; // Scale to degrees (-52° to +52°)
    }

    // Vertical pitch estimation:
    // Compares nose vertical position relative to forehead and chin
    const faceHeight = Math.abs(chin.y - forehead.y);
    let pitch = 0;
    if (faceHeight > 0.02) {
      // Nominal centered nose vertical ratio is ~0.58
      const noseRel = (noseTip.y - forehead.y) / faceHeight;
      pitch = (0.58 - noseRel) * 110; // Positive = up, Negative = down
    }

    // Roll estimation: Eye tilt angle
    const leftEye = landmarks[33];
    const rightEye = landmarks[362];
    const dX = rightEye.x - leftEye.x;
    const dY = rightEye.y - leftEye.y;
    const roll = Math.atan2(dY, dX) * (180 / Math.PI);

    // Direction classification
    let direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UP' = 'CENTER';
    if (yaw < -this.yawThreshold) {
      direction = 'LEFT';
    } else if (yaw > this.yawThreshold) {
      direction = 'RIGHT';
    } else if (pitch < this.pitchDownThreshold) {
      direction = 'DOWN';
    } else if (pitch > this.pitchUpThreshold) {
      direction = 'UP';
    }

    const isLookingAway = direction !== 'CENTER';

    if (isLookingAway) {
      this.distractedFrames++;
    } else {
      // Faster recovery when looking straight ahead
      this.distractedFrames = Math.max(0, this.distractedFrames - 2);
    }

    const isDistracted = this.distractedFrames >= this.distractionFramesTrigger;

    return {
      pitch: Math.round(pitch * 10) / 10,
      yaw: Math.round(yaw * 10) / 10,
      roll: Math.round(roll * 10) / 10,
      isDistracted,
      distractedFrames: this.distractedFrames,
      direction,
    };
  }

  public reset() {
    this.distractedFrames = 0;
  }
}

export const headPoseEstimator = new HeadPoseEstimator();
