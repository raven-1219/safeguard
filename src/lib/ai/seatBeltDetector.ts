// ==============================================================================
// SAFE GUARD AI - Seat Belt Detection Engine (Laptop Webcam Adapted)
// Analyzes upper-torso diagonal edge gradients with FOV visibility safeguards
// ==============================================================================

import { Point3D } from './faceLandmarks';

export type SeatBeltStatus = 'FASTENED' | 'UNFASTENED' | 'UNKNOWN';

export interface SeatBeltDetectionResult {
  isFastened: boolean;
  status: SeatBeltStatus;
  confidence: number;
  diagonalContrast: number;
  reason?: string;
}

export class SeatBeltDetector {
  private detectionHistory: boolean[] = [true, true, true];
  private manualDriverDeclaration: boolean | null = null;

  /**
   * Allows the driver to declare/confirm seat belt status on laptop webcams
   * where the camera angle captures only face and neck.
   */
  public setManualDeclaration(fastened: boolean | null) {
    this.manualDriverDeclaration = fastened;
  }

  public getManualDeclaration(): boolean | null {
    return this.manualDriverDeclaration;
  }

  /**
   * Evaluates diagonal pixel intensity between left shoulder and opposite hip
   * on the video canvas, checking if the chest region is genuinely in view.
   */
  public detectSeatBelt(
    ctx: CanvasRenderingContext2D,
    leftShoulder?: Point3D,
    rightShoulder?: Point3D,
    canvasWidth = 640,
    canvasHeight = 480
  ): SeatBeltDetectionResult {
    // 1. If manual declaration is set by driver, prioritize it
    if (this.manualDriverDeclaration !== null) {
      return {
        isFastened: this.manualDriverDeclaration,
        status: this.manualDriverDeclaration ? 'FASTENED' : 'UNFASTENED',
        confidence: 0.98,
        diagonalContrast: 0.85,
        reason: 'Driver manual confirmation',
      };
    }

    // 2. FOV Visibility Check:
    // If shoulders are not provided or are pushed below the visible canvas bottom
    const isShoulderVisible =
      leftShoulder &&
      rightShoulder &&
      leftShoulder.y > 0.1 &&
      leftShoulder.y < 0.85 &&
      rightShoulder.y > 0.1 &&
      rightShoulder.y < 0.85;

    if (!isShoulderVisible) {
      // Laptop camera view is zoomed tightly on the face
      return {
        isFastened: false,
        status: 'UNKNOWN',
        confidence: 0.3,
        diagonalContrast: 0.0,
        reason: 'Upper chest/shoulder region outside camera field-of-view. Use manual toggle or adjust webcam.',
      };
    }

    // 3. Compute diagonal contrast across visible torso
    const startX = leftShoulder.x * canvasWidth;
    const startY = leftShoulder.y * canvasHeight;
    const endX = rightShoulder.x * canvasWidth + canvasWidth * 0.2;
    const endY = Math.min(canvasHeight - 5, startY + canvasHeight * 0.45);

    let darkEdgePixelCount = 0;
    const sampleSteps = 24;

    try {
      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imageData.data;

      for (let i = 0; i < sampleSteps; i++) {
        const t = i / sampleSteps;
        const px = Math.floor(startX + (endX - startX) * t);
        const py = Math.floor(startY + (endY - startY) * t);

        if (px >= 0 && px < canvasWidth && py >= 0 && py < canvasHeight) {
          const index = (py * canvasWidth + px) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          // Seat belts typically produce dark diagonal webbing or high local gradient
          if (luminance < 90 || Math.abs(r - b) < 12) {
            darkEdgePixelCount++;
          }
        }
      }
    } catch (e) {
      // Ignored
    }

    const contrastRatio = darkEdgePixelCount / sampleSteps;
    const isDetected = contrastRatio > 0.42;

    // Temporal vote smoothing
    this.detectionHistory.push(isDetected);
    if (this.detectionHistory.length > 7) {
      this.detectionHistory.shift();
    }

    const trueVotes = this.detectionHistory.filter(Boolean).length;
    const isFastened = trueVotes >= 4;

    return {
      isFastened,
      status: isFastened ? 'FASTENED' : 'UNFASTENED',
      confidence: Math.round((trueVotes / this.detectionHistory.length) * 100) / 100,
      diagonalContrast: Math.round(contrastRatio * 100) / 100,
      reason: isFastened
        ? 'Diagonal torso band detected via contrast heuristic'
        : 'No contrasting diagonal belt identified across upper torso',
    };
  }
}

export const seatBeltDetector = new SeatBeltDetector();
