/**
 * TypingEngine Class
 * Core typing logic - text management, input handling, statistics
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class TypingEngine {
  constructor() {
    this.currentText = '';
    this.typedText = '';
    this.startTime = null;
    this.endTime = null;
    
    // Statistics
    this.totalChars = 0;
    this.correctChars = 0;
    this.errors = 0;
    
    // State
    this.isTyping = false;
    this.isComplete = false;
    this.currentMode = 'standard';
  }

  /**
   * Set new text for typing
   * @param {string} text - Text to type
   */
  setText(text) {
    this.reset();
    this.currentText = text;
  }

  /**
   * Reset engine state
   */
  reset() {
    this.typedText = '';
    this.startTime = null;
    this.endTime = null;
    this.totalChars = 0;
    this.correctChars = 0;
    this.errors = 0;
    this.isTyping = false;
    this.isComplete = false;
    
    eventBus.emit(Events.TYPING_RESET);
  }

  /**
   * Process typed input
   * @param {string} input - Current input value
   * @returns {Object} Result of input processing
   */
  processInput(input) {
    // Start timer on first input
    if (!this.startTime && input.length > 0) {
      this.startTime = Date.now();
      this.isTyping = true;
      eventBus.emit(Events.TYPING_START);
    }

    const result = {
      isCorrect: true,
      char: '',
      expectedChar: '',
      stats: null
    };

    // Check if new character was added
    if (input.length > this.typedText.length) {
      const newChar = input[input.length - 1];
      const expectedChar = this.currentText[input.length - 1];
      
      result.char = newChar;
      result.expectedChar = expectedChar;
      result.isCorrect = newChar === expectedChar;

      this.totalChars++;
      
      if (result.isCorrect) {
        this.correctChars++;
        eventBus.emit(Events.TYPING_INPUT, { correct: true, char: newChar });
      } else {
        this.errors++;
        eventBus.emit(Events.TYPING_ERROR, { typed: newChar, expected: expectedChar });
        eventBus.emit(Events.TYPING_INPUT, { correct: false, char: newChar });
      }
    }

    this.typedText = input;
    result.stats = this.getStats();

    // Check completion
    if (input.length >= this.currentText.length) {
      this.complete();
    }

    eventBus.emit(Events.STATS_UPDATE, result.stats);
    return result;
  }

  /**
   * Mark typing as complete
   */
  complete() {
    if (this.isComplete) return;
    
    this.endTime = Date.now();
    this.isTyping = false;
    this.isComplete = true;
    
    const finalStats = this.getStats();
    eventBus.emit(Events.TYPING_COMPLETE, finalStats);
  }

  /**
   * Calculate current statistics
   * @returns {Object} Current stats
   */
  getStats() {
    let wpm = 0;
    let accuracy = 100;
    
    if (this.startTime && this.typedText.length > 0) {
      const timeElapsed = ((this.endTime || Date.now()) - this.startTime) / 1000 / 60;
      const wordsTyped = this.correctChars / 5; // Standard: 5 chars = 1 word
      wpm = Math.round(wordsTyped / timeElapsed) || 0;
    }

    if (this.totalChars > 0) {
      accuracy = Math.round((this.correctChars / this.totalChars) * 100);
    }

    return {
      wpm,
      accuracy,
      errors: this.errors,
      correctChars: this.correctChars,
      totalChars: this.totalChars,
      progress: this.currentText.length > 0 
        ? (this.typedText.length / this.currentText.length) * 100 
        : 0,
      timeElapsed: this.startTime 
        ? ((this.endTime || Date.now()) - this.startTime) / 1000 
        : 0,
      isComplete: this.isComplete
    };
  }

  /**
   * Get character states for rendering
   * @returns {Array<Object>} Array of character states
   */
  getCharacterStates() {
    return this.currentText.split('').map((char, index) => {
      let state = 'pending';
      
      if (index < this.typedText.length) {
        state = this.typedText[index] === char ? 'correct' : 'incorrect';
      } else if (index === this.typedText.length) {
        state = 'current';
      }

      return {
        char,
        state,
        index
      };
    });
  }

  /**
   * Get current position in text
   * @returns {number}
   */
  getCurrentPosition() {
    return this.typedText.length;
  }

  /**
   * Get expected next character
   * @returns {string|null}
   */
  getExpectedChar() {
    const pos = this.typedText.length;
    return pos < this.currentText.length ? this.currentText[pos] : null;
  }

  /**
   * Check if engine is active
   * @returns {boolean}
   */
  isActive() {
    return this.isTyping && !this.isComplete;
  }

  /**
   * Set typing mode
   * @param {string} mode - Mode name
   */
  setMode(mode) {
    this.currentMode = mode;
  }

  /**
   * Get current mode
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
  }
}

// Export singleton instance
export const typingEngine = new TypingEngine();
