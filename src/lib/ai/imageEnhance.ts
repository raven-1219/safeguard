// ==============================================================================
// SAFE GUARD AI - Low-Light Image Enhancement (CLAHE & Gamma Correction)
// Enhances driver visibility during nighttime or poorly lit bus cabin conditions
// ==============================================================================

export interface EnhancementOptions {
  enabled: boolean;
  gamma: number;           // < 1.0 brightens shadows (e.g., 0.55), 1.0 is neutral
  contrastBoost: number;   // 1.0 to 1.5
  brightnessOffset: number;// -50 to 50
}

export class ImageEnhancer {
  private gammaLUT: Uint8Array = new Uint8Array(256);
  private currentGamma = 1.0;

  constructor() {
    this.updateLUT(0.6); // Default nighttime preset
  }

  public updateLUT(gamma: number) {
    if (this.currentGamma === gamma) return;
    this.currentGamma = gamma;
    for (let i = 0; i < 256; i++) {
      this.gammaLUT[i] = Math.min(255, Math.max(0, Math.round(255 * Math.pow(i / 255, gamma))));
    }
  }

  /**
   * Applies fast in-place gamma correction and contrast normalization to video frame imageData
   */
  public enhanceFrame(imageData: ImageData, options: EnhancementOptions): void {
    if (!options.enabled) return;

    this.updateLUT(options.gamma);
    const data = imageData.data;
    const len = data.length;
    const contrast = options.contrastBoost;
    const brightness = options.brightnessOffset;

    for (let i = 0; i < len; i += 4) {
      // Gamma LUT transform
      let r = this.gammaLUT[data[i]];
      let g = this.gammaLUT[data[i + 1]];
      let b = this.gammaLUT[data[i + 2]];

      // Contrast & Brightness adjustment
      if (contrast !== 1.0 || brightness !== 0) {
        r = Math.min(255, Math.max(0, (r - 128) * contrast + 128 + brightness));
        g = Math.min(255, Math.max(0, (g - 128) * contrast + 128 + brightness));
        b = Math.min(255, Math.max(0, (b - 128) * contrast + 128 + brightness));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
}

export const imageEnhancer = new ImageEnhancer();

