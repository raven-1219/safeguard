// ==============================================================================
// SAFE GUARD AI - Head Pose Estimation & Distraction Detection Engine
// Computes 3D Pitch, Yaw, and Roll from Face Mesh landmarks
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
  private readonly YAW_THRESHOLD = 28;      // Degrees away from center
  private readonly PITCH_DOWN_THRESHOLD = -22; // Looking down at phone/lap
  private readonly PITCH_UP_THRESHOLD = 25;    // Looking up at ceiling
  private readonly DISTRACTION_TRIGGER_FRAMES = 50; // ~1.6s of continuous inattention

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

    // Yaw estimation: asymmetry between nose tip and cheek boundaries
    const distToLeftCheek = Math.abs(noseTip.x - leftCheek.x);
    const distToRightCheek = Math.abs(noseTip.x - rightCheek.x);
    const cheekSpan = Math.abs(rightCheek.x - leftCheek.x);

    let yaw = 0;
    if (cheekSpan > 0.01) {
      const ratio = (distToRightCheek - distToLeftCheek) / cheekSpan;
      yaw = ratio * 75; // Approx degrees
    }

    // Pitch estimation: nose vertical ratio between forehead and chin
    const faceHeight = Math.abs(chin.y - forehead.y);
    let pitch = 0;
    if (faceHeight > 0.01) {
      const noseRel = (noseTip.y - forehead.y) / faceHeight;
      // Normal nominal noseRel is approx 0.60
      pitch = (0.60 - noseRel) * 120; // Inverted so looking down is negative
    }

    // Roll estimation: eye line angle
    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[362];
    const dX = rightEyeOuter.x - leftEyeOuter.x;
    const dY = rightEyeOuter.y - leftEyeOuter.y;
    const roll = Math.atan2(dY, dX) * (180 / Math.PI);

    // Direction classification
    let direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UP' = 'CENTER';
    if (yaw < -this.YAW_THRESHOLD) {
      direction = 'LEFT';
    } else if (yaw > this.YAW_THRESHOLD) {
      direction = 'RIGHT';
    } else if (pitch < this.PITCH_DOWN_THRESHOLD) {
      direction = 'DOWN';
    } else if (pitch > this.PITCH_UP_THRESHOLD) {
      direction = 'UP';
    }

    const isLookingAway = direction !== 'CENTER';

    if (isLookingAway) {
      this.distractedFrames++;
    } else {
      this.distractedFrames = Math.max(0, this.distractedFrames - 3);
    }

    const isDistracted = this.distractedFrames >= this.DISTRACTION_TRIGGER_FRAMES;

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

