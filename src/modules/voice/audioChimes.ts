/**
 * Synthetic Earcon Synthesizer using Web Audio API
 * Provides low-latency auditory cues for visually impaired commuters
 */

class AudioChimesManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public play(type: 'next-stop' | 'approaching' | 'arrival' | 'wrong-bus' | 'tap' | 'sos' | 'success') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (type) {
        case 'tap': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'next-stop': {
          // Ascending two-tone chime (520Hz -> 659Hz)
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'approaching': {
          // Warning chime: 3 quick ascending pings
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.1);
          osc.frequency.setValueAtTime(659.25, now + 0.2);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }

        case 'arrival': {
          // Celebratory chord sequence
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
          osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }

        case 'wrong-bus': {
          // Low dissonance buzz
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(196, now + 0.15);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'sos': {
          // High piercing siren tone
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.linearRampToValueAtTime(1320, now + 0.25);
          osc.frequency.linearRampToValueAtTime(880, now + 0.5);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        }

        case 'success': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
      }
    } catch {
      // AudioContext fallback silently if browser permissions or background tab
    }
  }
}

export const audioChimes = new AudioChimesManager();
