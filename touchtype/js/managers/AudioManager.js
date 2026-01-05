/**
 * AudioManager Class
 * Handles all audio/sound effects using Web Audio API
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.volume = 0.5;
    this._initialized = false;
  }

  /**
   * Initialize AudioContext (must be called after user interaction)
   */
  init() {
    if (this._initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this._initialized = true;
      this._setupEventListeners();
    } catch (error) {
      console.error('AudioManager: Failed to initialize AudioContext', error);
    }
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    eventBus.on(Events.SETTING_CHANGED, ({ setting, value }) => {
      if (setting === 'soundEnabled') {
        this.enabled = value;
      }
    });
  }

  /**
   * Resume AudioContext if suspended (browsers require user gesture)
   */
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Create and play a tone
   * @private
   */
  _playTone(frequency, duration, type = 'sine', gainValue = 0.1) {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gainValue * this.volume;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + duration
    );
    oscillator.stop(this.context.currentTime + duration);
  }

  /**
   * Play correct keystroke sound
   */
  playCorrect() {
    this._playTone(800, 0.08, 'sine', 0.1);
  }

  /**
   * Play error keystroke sound
   */
  playError() {
    this._playTone(200, 0.15, 'square', 0.1);
  }

  /**
   * Play penalty/warning sound
   */
  playPenalty() {
    if (!this.enabled || !this.context) return;

    // Two-tone warning sound
    const oscillator1 = this.context.createOscillator();
    const oscillator2 = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator1.type = 'sawtooth';
    oscillator2.type = 'square';
    oscillator1.frequency.value = 150;
    oscillator2.frequency.value = 100;
    gainNode.gain.value = 0.2 * this.volume;

    const now = this.context.currentTime;
    oscillator1.start(now);
    oscillator2.start(now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    oscillator1.stop(now + 0.3);
    oscillator2.stop(now + 0.3);
  }

  /**
   * Play level up sound
   */
  playLevelUp() {
    if (!this.enabled || !this.context) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._playTone(freq, 0.2, 'sine', 0.15);
      }, i * 100);
    });
  }

  /**
   * Play achievement unlock sound
   */
  playAchievement() {
    if (!this.enabled || !this.context) return;

    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._playTone(freq, 0.15, 'triangle', 0.12);
      }, i * 80);
    });
  }

  /**
   * Play exercise complete sound
   */
  playComplete() {
    if (!this.enabled || !this.context) return;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this._playTone(freq, 0.25, 'sine', 0.1);
      }, i * 150);
    });
  }

  /**
   * Play click sound for UI interactions
   */
  playClick() {
    this._playTone(1000, 0.05, 'sine', 0.05);
  }

  /**
   * Set master volume
   * @param {number} value - Volume 0-1
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  /**
   * Enable/disable audio
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this._initialized = false;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
