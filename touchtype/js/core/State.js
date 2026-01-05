/**
 * State Class
 * Centralized state management with change notifications
 */
import { EventEmitter } from './EventEmitter.js';

export class State extends EventEmitter {
  constructor(initialState = {}) {
    super();
    this._state = this._createProxy(initialState);
    this._history = [];
    this._maxHistory = 50;
  }

  /**
   * Create a reactive proxy for state object
   * @private
   */
  _createProxy(obj, path = '') {
    return new Proxy(obj, {
      get: (target, property) => {
        const value = target[property];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return this._createProxy(value, path ? `${path}.${property}` : property);
        }
        return value;
      },
      set: (target, property, value) => {
        const oldValue = target[property];
        if (oldValue !== value) {
          target[property] = value;
          const fullPath = path ? `${path}.${property}` : property;
          this.emit('change', { path: fullPath, oldValue, newValue: value });
          this.emit(`change:${fullPath}`, { oldValue, newValue: value });
        }
        return true;
      }
    });
  }

  /**
   * Get current state or specific path
   * @param {string} [path] - Dot notation path (e.g., 'typing.wpm')
   * @returns {any} State value
   */
  get(path) {
    if (!path) return this._state;
    
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, this._state);
  }

  /**
   * Set state value at path
   * @param {string} path - Dot notation path
   * @param {any} value - New value
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this._state);
    
    target[lastKey] = value;
  }

  /**
   * Update multiple state values at once
   * @param {Object} updates - Object with path:value pairs
   */
  update(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.set(path, value);
    });
  }

  /**
   * Reset state to initial or provided values
   * @param {Object} [newState] - Optional new state
   */
  reset(newState = {}) {
    Object.keys(this._state).forEach(key => {
      delete this._state[key];
    });
    Object.assign(this._state, newState);
    this.emit('reset', this._state);
  }

  /**
   * Subscribe to state changes
   * @param {string} path - State path to watch
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  watch(path, callback) {
    return this.on(`change:${path}`, callback);
  }
}

// Default application state structure
export const defaultState = {
  // Typing state
  typing: {
    currentText: '',
    typedText: '',
    startTime: null,
    errors: 0,
    totalChars: 0,
    correctChars: 0,
    isTyping: false,
    isComplete: false
  },

  // Current session stats
  stats: {
    wpm: 0,
    accuracy: 100,
    errors: 0,
    penalties: 0
  },

  // Camera state
  camera: {
    enabled: false,
    isLookingDown: false,
    headPitch: 0,
    penaltyCooldown: false
  },

  // Progress state
  progress: {
    xp: 0,
    totalXP: 0,
    level: 1,
    bestWPM: 0,
    streak: 1,
    achievements: []
  },

  // Settings
  settings: {
    soundEnabled: true,
    flashEnabled: true,
    keyboardVisible: true,
    currentMode: 'standard'
  },

  // UI state
  ui: {
    isStarted: false,
    showPenalty: false
  }
};

// Create singleton state instance
export const appState = new State(JSON.parse(JSON.stringify(defaultState)));
