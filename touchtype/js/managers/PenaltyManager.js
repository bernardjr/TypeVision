/**
 * PenaltyManager Class
 * Handles penalties when user looks down at keyboard
 */
import { eventBus, Events } from '../core/EventEmitter.js';
import { audioManager } from './AudioManager.js';

export class PenaltyManager {
  constructor() {
    this.penaltyCount = 0;
    this.isOnCooldown = false;
    this.isEnabled = true;
    
    // Configuration
    this.config = {
      cooldownDuration: 2000,  // ms between penalties
      xpPenalty: 5,            // XP lost per penalty
      showFlash: true,
      playSound: true
    };

    // DOM elements (set via init)
    this.overlayEl = null;
    this.messageEl = null;

    this._setupEventListeners();
  }

  /**
   * Initialize with DOM elements
   * @param {HTMLElement} overlay - Penalty overlay element
   * @param {HTMLElement} message - Penalty message element
   */
  init(overlay, message) {
    this.overlayEl = overlay;
    this.messageEl = message;
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    eventBus.on(Events.CAMERA_LOOKING_DOWN, () => {
      this.trigger();
    });

    eventBus.on(Events.TYPING_RESET, () => {
      this.reset();
    });

    eventBus.on(Events.SETTING_CHANGED, ({ setting, value }) => {
      if (setting === 'flashEnabled') {
        this.config.showFlash = value;
      }
      if (setting === 'soundEnabled') {
        this.config.playSound = value;
      }
    });
  }

  /**
   * Trigger a penalty
   * @returns {boolean} Whether penalty was applied
   */
  trigger() {
    if (!this.isEnabled || this.isOnCooldown) {
      return false;
    }

    this.penaltyCount++;
    this.isOnCooldown = true;

    // Visual feedback
    if (this.config.showFlash) {
      this._showPenaltyEffect();
    }

    // Audio feedback
    if (this.config.playSound) {
      audioManager.playPenalty();
    }

    // Emit event
    eventBus.emit(Events.PENALTY_TRIGGERED, {
      count: this.penaltyCount,
      xpLost: this.config.xpPenalty
    });

    // Start cooldown
    setTimeout(() => {
      this.isOnCooldown = false;
    }, this.config.cooldownDuration);

    return true;
  }

  /**
   * Show penalty visual effect
   * @private
   */
  _showPenaltyEffect() {
    if (!this.overlayEl || !this.messageEl) return;

    this.overlayEl.classList.add('active');
    this.messageEl.classList.add('active');

    setTimeout(() => {
      this.overlayEl.classList.remove('active');
      this.messageEl.classList.remove('active');
    }, 800);
  }

  /**
   * Reset penalty count
   */
  reset() {
    this.penaltyCount = 0;
    this.isOnCooldown = false;
  }

  /**
   * Get current penalty count
   * @returns {number}
   */
  getCount() {
    return this.penaltyCount;
  }

  /**
   * Enable/disable penalties
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Update configuration
   * @param {Object} config
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if there were no penalties in current session
   * @returns {boolean}
   */
  isPerfect() {
    return this.penaltyCount === 0;
  }
}

// Export singleton instance
export const penaltyManager = new PenaltyManager();
