/**
 * GazeManager Class
 * Uses WebGazer.js for accurate eye gaze tracking
 * Detects when user is looking at screen vs keyboard
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class GazeManager {
  constructor() {
    this.isEnabled = false;
    this.isCalibrated = false;
    this.isLookingDown = false;
    this.currentGaze = { x: 0, y: 0 };
    this.webgazer = null;
    
    // Configuration
    this.config = {
      // Y position threshold - if gaze Y is beyond this % of viewport, user is looking down
      lookDownThreshold: 1.1, // 110% of viewport height
      // Minimum confidence to consider a prediction valid
      minConfidence: 0.5,
      // Smoothing factor for gaze position (0-1, higher = more smoothing)
      smoothingFactor: 0.3,
      // Number of calibration points required
      calibrationPoints: 9,
      // Show WebGazer's prediction visualization
      showPrediction: false
    };

    // Smoothed gaze position
    this._smoothedGaze = { x: 0, y: 0 };
    
    // Calibration state
    this._calibrationData = [];
    this._isCalibrating = false;
  }

  /**
   * Initialize WebGazer
   * Must be called after WebGazer script is loaded
   */
  async init() {
    // Check if WebGazer is available
    if (typeof webgazer === 'undefined') {
      console.error('GazeManager: WebGazer.js not loaded');
      return false;
    }

    this.webgazer = webgazer;

    try {
      // Configure WebGazer
      this.webgazer
        .setRegression('ridge') // Use ridge regression for predictions
        .setTracker('TFFacemesh') // Use TensorFlow FaceMesh for face detection
        .showVideoPreview(false) // We'll handle video display ourselves
        .showPredictionPoints(this.config.showPrediction)
        .applyKalmanFilter(true); // Smooth predictions

      // Set up gaze listener
      this.webgazer.setGazeListener((data, elapsedTime) => {
        this._onGazeUpdate(data, elapsedTime);
      });

      return true;
    } catch (error) {
      console.error('GazeManager: Failed to initialize WebGazer', error);
      return false;
    }
  }

  /**
   * Start gaze tracking
   */
  async start() {
    if (!this.webgazer) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    try {
      await this.webgazer.begin();
      this.isEnabled = true;
      eventBus.emit(Events.CAMERA_ENABLED);
      return true;
    } catch (error) {
      console.error('GazeManager: Failed to start', error);
      return false;
    }
  }

  /**
   * Stop gaze tracking
   */
  stop() {
    if (this.webgazer) {
      this.webgazer.end();
    }
    this.isEnabled = false;
    eventBus.emit(Events.CAMERA_DISABLED);
  }

  /**
   * Pause gaze tracking temporarily
   */
  pause() {
    if (this.webgazer) {
      this.webgazer.pause();
    }
  }

  /**
   * Resume gaze tracking
   */
  resume() {
    if (this.webgazer) {
      this.webgazer.resume();
    }
  }

  /**
   * Handle gaze update from WebGazer
   * @private
   */
  _onGazeUpdate(data, elapsedTime) {
    if (!data) return;

    const { x, y } = data;
    
    // Apply smoothing
    this._smoothedGaze.x = this._lerp(this._smoothedGaze.x, x, this.config.smoothingFactor);
    this._smoothedGaze.y = this._lerp(this._smoothedGaze.y, y, this.config.smoothingFactor);

    this.currentGaze = { ...this._smoothedGaze };

    // Check if looking at screen or below (keyboard)
    const viewportHeight = window.innerHeight;
    const threshold = viewportHeight * this.config.lookDownThreshold;
    
    const wasLookingDown = this.isLookingDown;
    
    // User is looking down if:
    // 1. Y position is below the viewport threshold
    // 2. Y position is negative (above screen - rare but possible)
    // 3. X position is way off screen (not paying attention)
    this.isLookingDown = (
      y > threshold || 
      y < -50 || 
      x < -100 || 
      x > window.innerWidth + 100
    );

    // Emit events on state change
    if (this.isLookingDown && !wasLookingDown) {
      eventBus.emit(Events.CAMERA_LOOKING_DOWN);
    } else if (!this.isLookingDown && wasLookingDown) {
      eventBus.emit(Events.CAMERA_LOOKING_UP);
    }

    // Always emit pitch update for UI
    const normalizedY = Math.min(1, Math.max(0, y / viewportHeight));
    eventBus.emit(Events.CAMERA_PITCH_UPDATE, { 
      pitch: normalizedY * 100, // 0-100 representing screen position
      x: this.currentGaze.x,
      y: this.currentGaze.y
    });
  }

  /**
   * Linear interpolation helper
   * @private
   */
  _lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Start calibration process
   * @param {Function} onPointRequired - Callback when user needs to look at a point
   * @param {Function} onComplete - Callback when calibration is complete
   */
  async startCalibration(onPointRequired, onComplete) {
    this._isCalibrating = true;
    this._calibrationData = [];

    // Generate calibration points (3x3 grid)
    const points = this._generateCalibrationPoints();
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      // Notify UI to show point
      if (onPointRequired) {
        await onPointRequired(point, i + 1, points.length);
      }
      
      // Wait for user to click (WebGazer auto-calibrates on click)
      await this._waitForClick();
      
      this._calibrationData.push(point);
    }

    this._isCalibrating = false;
    this.isCalibrated = true;

    if (onComplete) {
      onComplete();
    }
  }

  /**
   * Generate calibration points across screen
   * @private
   */
  _generateCalibrationPoints() {
    const padding = 50;
    const w = window.innerWidth - padding * 2;
    const h = window.innerHeight - padding * 2;

    return [
      { x: padding, y: padding },                    // Top-left
      { x: padding + w / 2, y: padding },            // Top-center
      { x: padding + w, y: padding },                // Top-right
      { x: padding, y: padding + h / 2 },            // Middle-left
      { x: padding + w / 2, y: padding + h / 2 },    // Center
      { x: padding + w, y: padding + h / 2 },        // Middle-right
      { x: padding, y: padding + h },                // Bottom-left
      { x: padding + w / 2, y: padding + h },        // Bottom-center
      { x: padding + w, y: padding + h },            // Bottom-right
    ];
  }

  /**
   * Wait for user click
   * @private
   */
  _waitForClick() {
    return new Promise(resolve => {
      const handler = () => {
        document.removeEventListener('click', handler);
        resolve();
      };
      document.addEventListener('click', handler);
    });
  }

  /**
   * Add manual calibration point
   * Call this when user clicks while looking at that position
   */
  addCalibrationPoint(x, y) {
    if (this.webgazer) {
      // WebGazer automatically records calibration on clicks
      // This is for manual calibration if needed
      this.webgazer.recordScreenPosition(x, y);
    }
  }

  /**
   * Clear calibration data
   */
  clearCalibration() {
    if (this.webgazer) {
      this.webgazer.clearData();
    }
    this.isCalibrated = false;
    this._calibrationData = [];
  }

  /**
   * Get current gaze position
   */
  getCurrentGaze() {
    return { ...this.currentGaze };
  }

  /**
   * Get prediction from WebGazer on demand
   */
  async getPrediction() {
    if (!this.webgazer) return null;
    return await this.webgazer.getCurrentPrediction();
  }

  /**
   * Check if gaze is within a specific element
   * @param {HTMLElement} element - DOM element to check
   */
  isLookingAtElement(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const { x, y } = this.currentGaze;

    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  /**
   * Get video element used by WebGazer
   */
  getVideoElement() {
    if (this.webgazer) {
      return this.webgazer.getVideoElement();
    }
    return null;
  }

  /**
   * Set configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
    
    if (this.webgazer && config.showPrediction !== undefined) {
      this.webgazer.showPredictionPoints(config.showPrediction);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isEnabled: this.isEnabled,
      isCalibrated: this.isCalibrated,
      isLookingDown: this.isLookingDown,
      gaze: { ...this.currentGaze }
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
    this.webgazer = null;
  }
}

// Export singleton
export const gazeManager = new GazeManager();
