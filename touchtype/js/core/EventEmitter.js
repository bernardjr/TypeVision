/**
 * EventEmitter Class
 * Provides publish/subscribe pattern for loose coupling between components
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event only once
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler to remove
   */
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to handlers
   */
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} [event] - Optional event name
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }
}

// Create a global event bus for cross-component communication
export const eventBus = new EventEmitter();

// Event constants for type safety
export const Events = {
  // Typing events
  TYPING_START: 'typing:start',
  TYPING_INPUT: 'typing:input',
  TYPING_COMPLETE: 'typing:complete',
  TYPING_ERROR: 'typing:error',
  TYPING_RESET: 'typing:reset',

  // Camera events
  CAMERA_ENABLED: 'camera:enabled',
  CAMERA_DISABLED: 'camera:disabled',
  CAMERA_LOOKING_DOWN: 'camera:lookingDown',
  CAMERA_LOOKING_UP: 'camera:lookingUp',
  CAMERA_PITCH_UPDATE: 'camera:pitchUpdate',

  // Penalty events
  PENALTY_TRIGGERED: 'penalty:triggered',

  // Progress events
  XP_GAINED: 'progress:xpGained',
  LEVEL_UP: 'progress:levelUp',
  ACHIEVEMENT_UNLOCKED: 'progress:achievementUnlocked',

  // Mode events
  MODE_CHANGED: 'mode:changed',

  // Settings events
  SETTING_CHANGED: 'settings:changed',

  // UI events
  STATS_UPDATE: 'ui:statsUpdate',
  KEY_PRESSED: 'ui:keyPressed',
  KEY_ERROR: 'ui:keyError',
};
