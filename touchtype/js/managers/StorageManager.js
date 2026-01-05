/**
 * StorageManager Class
 * Handles all localStorage operations for persistence
 */
export class StorageManager {
  constructor(namespace = 'typevision') {
    this.namespace = namespace;
  }

  /**
   * Generate namespaced key
   * @private
   */
  _getKey(key) {
    return `${this.namespace}_${key}`;
  }

  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON stringified)
   * @returns {boolean} Success status
   */
  save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this._getKey(key), serialized);
      return true;
    } catch (error) {
      console.error(`StorageManager: Error saving "${key}"`, error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  load(key, defaultValue = null) {
    try {
      const serialized = localStorage.getItem(this._getKey(key));
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized);
    } catch (error) {
      console.error(`StorageManager: Error loading "${key}"`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    try {
      localStorage.removeItem(this._getKey(key));
      return true;
    } catch (error) {
      console.error(`StorageManager: Error removing "${key}"`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  exists(key) {
    return localStorage.getItem(this._getKey(key)) !== null;
  }

  /**
   * Clear all namespaced data
   */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.namespace)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Save progress data
   * @param {Object} progress - Progress object
   */
  saveProgress(progress) {
    this.save('progress', {
      totalXP: progress.totalXP,
      level: progress.level,
      xp: progress.xp,
      bestWPM: progress.bestWPM,
      streak: progress.streak,
      achievements: progress.achievements,
      lastPlayed: new Date().toISOString()
    });
  }

  /**
   * Load progress data
   * @returns {Object|null}
   */
  loadProgress() {
    return this.load('progress', null);
  }

  /**
   * Save settings
   * @param {Object} settings - Settings object
   */
  saveSettings(settings) {
    this.save('settings', settings);
  }

  /**
   * Load settings
   * @returns {Object|null}
   */
  loadSettings() {
    return this.load('settings', null);
  }

  /**
   * Add session to history
   * @param {Object} session - Session data
   */
  addSessionToHistory(session) {
    const history = this.load('history', []);
    history.unshift({
      ...session,
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 sessions
    if (history.length > 50) {
      history.pop();
    }
    this.save('history', history);
  }

  /**
   * Get session history
   * @param {number} limit - Max sessions to return
   * @returns {Array}
   */
  getHistory(limit = 10) {
    const history = this.load('history', []);
    return history.slice(0, limit);
  }

  /**
   * Calculate and update streak
   * @returns {number} Current streak
   */
  updateStreak() {
    const progress = this.loadProgress();
    if (!progress) return 1;

    const lastPlayed = progress.lastPlayed ? new Date(progress.lastPlayed) : null;
    const now = new Date();
    
    if (!lastPlayed) return 1;

    const daysSinceLastPlayed = Math.floor(
      (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPlayed === 0) {
      // Same day, keep streak
      return progress.streak || 1;
    } else if (daysSinceLastPlayed === 1) {
      // Next day, increment streak
      return (progress.streak || 0) + 1;
    } else {
      // Streak broken
      return 1;
    }
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
