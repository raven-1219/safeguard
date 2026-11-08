// ==============================================================================
// SAFE GUARD AI - Offline Web Audio API Synthesizer Engine
// Generates instant, 100% offline audio warnings without network or external MP3s
// ==============================================================================

type AlarmType = 'warning' | 'high_drowsiness' | 'emergency' | 'seatbelt' | 'distraction';

class AudioManager {
  private ctx: AudioContext | null = null;
  private activeOscillator: OscillatorNode | null = null;
  private activeGain: GainNode | null = null;
  private sirenInterval: any = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-unlock AudioContext on first user interaction anywhere on the window
      const unlockAudio = () => {
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().then(() => {
            this.isUnlocked = true;
          });
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Plays a single short distinct chime for minor events (distraction, yawn, seatbelt)
  public playBeep(frequency = 880, durationMs = 250, type: OscillatorType = 'sine') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio playBeep error:', e);
    }
  }

  // Continuous high-urgency alternating siren for HIGHLY DROWSY or EMERGENCY
  public startSiren(type: AlarmType = 'high_drowsiness') {
    if (this.isMuted || this.activeOscillator) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'emergency' ? 'sawtooth' : 'triangle';

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.activeOscillator = osc;
      this.activeGain = gain;

      let high = false;
      const baseFreq = type === 'emergency' ? 950 : 750;
      const modFreq = type === 'emergency' ? 1400 : 1100;

      this.sirenInterval = setInterval(() => {
        if (!this.activeOscillator || !this.ctx) return;
        const target = high ? baseFreq : modFreq;
        this.activeOscillator.frequency.cancelScheduledValues(this.ctx.currentTime);
        this.activeOscillator.frequency.linearRampToValueAtTime(target, this.ctx.currentTime + 0.15);
        high = !high;
      }, 200);
    } catch (e) {
      console.warn('Audio startSiren error:', e);
    }
  }

  public acknowledgeAlert() {
    this.stopAlarm();
  }

  public stopAlarm() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.activeOscillator && this.ctx) {
      try {
        this.activeGain?.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        this.activeOscillator.stop(this.ctx.currentTime + 0.06);
        this.activeOscillator.disconnect();
      } catch (e) {
        // Ignored
      }
      this.activeOscillator = null;
      this.activeGain = null;
    }
  }
}

export const audioManager = new AudioManager();
