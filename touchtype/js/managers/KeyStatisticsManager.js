/**
 * KeyStatisticsManager Class
 * Tracks per-key statistics: accuracy, timing, errors, success rate
 */
import { eventBus, Events } from '../core/EventEmitter.js';
import { storageManager } from './StorageManager.js';

export class KeyStatisticsManager {
  constructor() {
    this.keyStats = {}; // { 'a': { correct: 10, total: 12, avgTime: 250, errors: 2 }, ... }
    this.sessionStats = {}; // Current session only
    this.lastKeyTime = null;

    this._loadStats();
    this._setupListeners();
  }

  /**
   * Load saved key statistics from storage
   * @private
   */
  _loadStats() {
    const saved = storageManager.load('keyStats', {});
    this.keyStats = saved;
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupListeners() {
    // Listen to typing events
    eventBus.on(Events.TYPING_INPUT, (data) => {
      this._recordKeyPress(data);
    });

    // Save stats on exercise completion
    eventBus.on(Events.TYPING_COMPLETE, () => {
      this._saveStats();
    });

    // Reset session stats on new exercise
    eventBus.on(Events.TYPING_RESET, () => {
      this.sessionStats = {};
      this.lastKeyTime = null;
    });
  }

  /**
   * Record a key press
   * @private
   * @param {Object} data - { correct: boolean, char: string }
   */
  _recordKeyPress(data) {
    const { correct, char } = data;
    const now = Date.now();

    // Calculate time since last key
    const timeSinceLastKey = this.lastKeyTime ? now - this.lastKeyTime : 0;
    this.lastKeyTime = now;

    // Initialize if doesn't exist
    if (!this.keyStats[char]) {
      this.keyStats[char] = {
        correct: 0,
        total: 0,
        avgTime: 0,
        errors: 0,
        lastPracticed: now
      };
    }

    if (!this.sessionStats[char]) {
      this.sessionStats[char] = {
        correct: 0,
        total: 0,
        times: []
      };
    }

    // Update stats
    const keyData = this.keyStats[char];
    const sessionData = this.sessionStats[char];

    keyData.total++;
    sessionData.total++;

    if (correct) {
      keyData.correct++;
      sessionData.correct++;
    } else {
      keyData.errors++;
    }

    // Track timing (only for correct keypresses)
    if (correct && timeSinceLastKey > 0 && timeSinceLastKey < 2000) {
      sessionData.times.push(timeSinceLastKey);

      // Update average time (exponential moving average)
      if (keyData.avgTime === 0) {
        keyData.avgTime = timeSinceLastKey;
      } else {
        keyData.avgTime = keyData.avgTime * 0.8 + timeSinceLastKey * 0.2;
      }
    }

    keyData.lastPracticed = now;
  }

  /**
   * Save statistics to storage
   * @private
   */
  _saveStats() {
    storageManager.save('keyStats', this.keyStats);
  }

  /**
   * Get accuracy for a specific key (0-100)
   * @param {string} key - The key character
   * @returns {number} Accuracy percentage
   */
  getKeyAccuracy(key) {
    const stats = this.keyStats[key];
    if (!stats || stats.total === 0) return 100; // Default to 100 if no data
    return Math.round((stats.correct / stats.total) * 100);
  }

  /**
   * Get average time for a key in milliseconds
   * @param {string} key - The key character
   * @returns {number} Average time in ms
   */
  getKeyTime(key) {
    const stats = this.keyStats[key];
    return stats ? Math.round(stats.avgTime) : 0;
  }

  /**
   * Get total attempts for a key
   * @param {string} key - The key character
   * @returns {number} Total attempts
   */
  getKeyTotal(key) {
    const stats = this.keyStats[key];
    return stats ? stats.total : 0;
  }

  /**
   * Get all keys sorted by accuracy (worst first)
   * @param {number} minAttempts - Minimum attempts to include
   * @returns {Array<Object>} Sorted array of { key, accuracy, total }
   */
  getWeakKeys(minAttempts = 5) {
    const keys = Object.keys(this.keyStats)
      .filter(key => this.keyStats[key].total >= minAttempts)
      .map(key => ({
        key,
        accuracy: this.getKeyAccuracy(key),
        total: this.keyStats[key].total,
        errors: this.keyStats[key].errors,
        avgTime: this.keyStats[key].avgTime
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    return keys;
  }

  /**
   * Get top N weakest keys
   * @param {number} n - Number of keys to return
   * @returns {Array<string>} Array of key characters
   */
  getTopWeakKeys(n = 5) {
    return this.getWeakKeys().slice(0, n).map(item => item.key);
  }

  /**
   * Get all keys sorted by speed (slowest first)
   * @param {number} minAttempts - Minimum attempts to include
   * @returns {Array<Object>} Sorted array of { key, avgTime, accuracy }
   */
  getSlowKeys(minAttempts = 5) {
    const keys = Object.keys(this.keyStats)
      .filter(key => this.keyStats[key].total >= minAttempts && this.keyStats[key].avgTime > 0)
      .map(key => ({
        key,
        avgTime: this.keyStats[key].avgTime,
        accuracy: this.getKeyAccuracy(key),
        total: this.keyStats[key].total
      }))
      .sort((a, b) => b.avgTime - a.avgTime);

    return keys;
  }

  /**
   * Get heatmap data for all keys
   * Returns normalized scores (0-1) for visualization
   * @returns {Object} { 'a': 0.95, 'b': 0.67, ... }
   */
  getHeatmapData() {
    const heatmap = {};
    const allKeys = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

    allKeys.forEach(key => {
      const stats = this.keyStats[key];
      if (!stats || stats.total < 3) {
        heatmap[key] = 1; // No data = neutral
      } else {
        // Normalize accuracy to 0-1 scale
        heatmap[key] = this.getKeyAccuracy(key) / 100;
      }
    });

    return heatmap;
  }

  /**
   * Get detailed stats for a specific key
   * @param {string} key - The key character
   * @returns {Object|null} Detailed statistics or null
   */
  getKeyDetails(key) {
    const stats = this.keyStats[key];
    if (!stats) return null;

    return {
      key,
      accuracy: this.getKeyAccuracy(key),
      total: stats.total,
      correct: stats.correct,
      errors: stats.errors,
      avgTime: Math.round(stats.avgTime),
      lastPracticed: stats.lastPracticed
    };
  }

  /**
   * Get statistics for current session
   * @returns {Object} Session statistics
   */
  getSessionStats() {
    const stats = {};
    Object.keys(this.sessionStats).forEach(key => {
      const data = this.sessionStats[key];
      stats[key] = {
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 100,
        total: data.total,
        avgTime: data.times.length > 0
          ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length)
          : 0
      };
    });
    return stats;
  }

  /**
   * Reset all statistics
   */
  resetAll() {
    this.keyStats = {};
    this.sessionStats = {};
    this._saveStats();
    eventBus.emit(Events.KEY_STATS_RESET);
  }

  /**
   * Get overall statistics summary
   * @returns {Object} Summary statistics
   */
  getSummary() {
    const allKeys = Object.keys(this.keyStats);
    if (allKeys.length === 0) {
      return {
        totalKeys: 0,
        avgAccuracy: 100,
        weakestKey: null,
        strongestKey: null,
        totalPresses: 0
      };
    }

    let totalCorrect = 0;
    let totalPresses = 0;
    let weakestKey = null;
    let strongestKey = null;
    let lowestAccuracy = 100;
    let highestAccuracy = 0;

    allKeys.forEach(key => {
      const stats = this.keyStats[key];
      totalCorrect += stats.correct;
      totalPresses += stats.total;

      const accuracy = this.getKeyAccuracy(key);
      if (stats.total >= 5) {
        if (accuracy < lowestAccuracy) {
          lowestAccuracy = accuracy;
          weakestKey = key;
        }
        if (accuracy > highestAccuracy) {
          highestAccuracy = accuracy;
          strongestKey = key;
        }
      }
    });

    return {
      totalKeys: allKeys.length,
      avgAccuracy: Math.round((totalCorrect / totalPresses) * 100),
      weakestKey,
      strongestKey,
      totalPresses
    };
  }
}

// Export singleton instance
export const keyStatsManager = new KeyStatisticsManager();
