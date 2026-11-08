// ==============================================================================
// SAFE GUARD AI - Face Landmark Processing & Metric Calculations
// Eye Aspect Ratio (EAR), Mouth Aspect Ratio (MAR), Blink & Yawn Analytics
// ==============================================================================

export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

// MediaPipe 468-point Face Mesh indices for eyes & mouth
export const LEFT_EYE_INDICES = {
  cornerOuter: 33,
  cornerInner: 133,
  top1: 160,
  bottom1: 144,
  top2: 158,
  bottom2: 153,
};

export const RIGHT_EYE_INDICES = {
  cornerOuter: 362,
  cornerInner: 263,
  top1: 385,
  bottom1: 380,
  top2: 387,
  bottom2: 373,
};

export const MOUTH_INDICES = {
  leftCorner: 78,
  rightCorner: 308,
  topLip: 13,
  bottomLip: 14,
  topLip2: 82,
  bottomLip2: 312,
  topLip3: 87,
  bottomLip3: 317,
};

// Euclidean distance between two points
export function distance2D(p1: Point3D, p2: Point3D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate Eye Aspect Ratio for given eye landmarks
export function calculateEAR(landmarks: Point3D[], isRight = false): number {
  const idx = isRight ? RIGHT_EYE_INDICES : LEFT_EYE_INDICES;
  const pOuter = landmarks[idx.cornerOuter];
  const pInner = landmarks[idx.cornerInner];
  const pTop1 = landmarks[idx.top1];
  const pBottom1 = landmarks[idx.bottom1];
  const pTop2 = landmarks[idx.top2];
  const pBottom2 = landmarks[idx.bottom2];

  if (!pOuter || !pInner || !pTop1 || !pBottom1 || !pTop2 || !pBottom2) {
    return 0.3; // Default nominal EAR
  }

  const v1 = distance2D(pTop1, pBottom1);
  const v2 = distance2D(pTop2, pBottom2);
  const horiz = distance2D(pOuter, pInner);

  if (horiz === 0) return 0.3;
  return (v1 + v2) / (2.0 * horiz);
}

// Calculate Mouth Aspect Ratio (MAR) to detect yawning
export function calculateMAR(landmarks: Point3D[]): number {
  const pLeft = landmarks[MOUTH_INDICES.leftCorner];
  const pRight = landmarks[MOUTH_INDICES.rightCorner];
  const pTop = landmarks[MOUTH_INDICES.topLip];
  const pBottom = landmarks[MOUTH_INDICES.bottomLip];

  if (!pLeft || !pRight || !pTop || !pBottom) {
    return 0.2;
  }

  const vertical = distance2D(pTop, pBottom);
  const horizontal = distance2D(pLeft, pRight);

  if (horizontal === 0) return 0.2;
  return vertical / horizontal;
}

// Stateful Blink & Yawn Detector with temporal smoothing
export class TemporalFatigueAnalyzer {
  private eyeClosedFrames = 0;
  private yawnFrames = 0;
  private blinkCount = 0;
  private lastBlinkTimestamp = Date.now();
  private eyeState: 'OPEN' | 'CLOSED' = 'OPEN';
  private eyeClosedHistory: number[] = [];

  // Configurable thresholds
  public earThreshold = 0.21;       // Below this value eye is closed
  public marThreshold = 0.65;       // Above this mouth is open wide (yawning)
  public drowsyFramesThreshold = 18; // ~0.6s at 30fps
  public highlyDrowsyFrames = 42;    // ~1.4s sustained eye closure

  public update(landmarks: Point3D[], fps = 30) {
    const leftEar = calculateEAR(landmarks, false);
    const rightEar = calculateEAR(landmarks, true);
    const avgEar = (leftEar + rightEar) / 2.0;
    const mar = calculateMAR(landmarks);

    const isClosed = avgEar < this.earThreshold;

    // Track consecutive closed frames
    if (isClosed) {
      this.eyeClosedFrames++;
      if (this.eyeState === 'OPEN') {
        this.eyeState = 'CLOSED';
      }
    } else {
      if (this.eyeState === 'CLOSED') {
        // Registered a completed blink
        this.blinkCount++;
        this.eyeState = 'OPEN';
      }
      this.eyeClosedFrames = 0;
    }

    // Track yawning
    const isYawning = mar > this.marThreshold;
    if (isYawning) {
      this.yawnFrames++;
    } else {
      this.yawnFrames = Math.max(0, this.yawnFrames - 2);
    }

    // Keep 60 seconds rolling window for blink rate
    const now = Date.now();
    if (now - this.lastBlinkTimestamp > 60000) {
      this.blinkCount = Math.floor(this.blinkCount * 0.5); // Decay
      this.lastBlinkTimestamp = now;
    }

    const isProlongedClosure = this.eyeClosedFrames >= this.highlyDrowsyFrames;
    const isDrowsyClosure = this.eyeClosedFrames >= this.drowsyFramesThreshold;
    const isSustainedYawn = this.yawnFrames >= 20;

    return {
      avgEar,
      leftEar,
      rightEar,
      mar,
      isEyeClosed: isClosed,
      eyeClosedFrames: this.eyeClosedFrames,
      isDrowsyClosure,
      isProlongedClosure,
      isYawning: isSustainedYawn,
      blinkCount: this.blinkCount,
    };
  }

  public reset() {
    this.eyeClosedFrames = 0;
    this.yawnFrames = 0;
    this.blinkCount = 0;
    this.eyeState = 'OPEN';
  }
}

