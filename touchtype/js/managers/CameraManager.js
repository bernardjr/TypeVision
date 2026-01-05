/**
 * CameraManager Class
 * Handles webcam access and face tracking using MediaPipe
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class CameraManager {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.faceMesh = null;
    this.camera = null;
    
    this.isEnabled = false;
    this.isLookingDown = false;
    this.headPitch = 0;
    
    // Configuration
    this.config = {
      lookDownThreshold: 15, // degrees
      videoWidth: 640,
      videoHeight: 480
    };

    // Callbacks
    this.onPitchUpdate = null;
    this.onLookingDown = null;
    this.onLookingUp = null;
  }

  /**
   * Initialize with DOM elements
   * @param {HTMLVideoElement} video - Video element
   * @param {HTMLCanvasElement} canvas - Canvas for overlay
   */
  init(video, canvas) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Request camera access and start face tracking
   * @returns {Promise<boolean>} Success status
   */
  async enable() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: this.config.videoWidth,
          height: this.config.videoHeight,
          facingMode: 'user'
        }
      });

      this.video.srcObject = stream;
      await this.video.play();
      
      this.isEnabled = true;
      await this._initFaceMesh();
      
      eventBus.emit(Events.CAMERA_ENABLED);
      return true;
    } catch (error) {
      console.error('CameraManager: Failed to enable camera', error);
      return false;
    }
  }

  /**
   * Disable camera and stop tracking
   */
  disable() {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }

    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }

    this.isEnabled = false;
    this.faceMesh = null;
    
    eventBus.emit(Events.CAMERA_DISABLED);
  }

  /**
   * Initialize MediaPipe Face Mesh
   * @private
   */
  async _initFaceMesh() {
    // Check if FaceMesh is available (loaded from CDN)
    if (typeof FaceMesh === 'undefined') {
      console.error('CameraManager: FaceMesh not loaded');
      return;
    }

    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults(this._onFaceResults.bind(this));

    // Check if Camera utility is available
    if (typeof Camera !== 'undefined') {
      this.camera = new Camera(this.video, {
        onFrame: async () => {
          if (this.faceMesh) {
            await this.faceMesh.send({ image: this.video });
          }
        },
        width: this.config.videoWidth,
        height: this.config.videoHeight
      });

      this.camera.start();
    }
  }

  /**
   * Handle face mesh results
   * @private
   */
  _onFaceResults(results) {
    if (!this.canvas || !this.ctx) return;

    // Set canvas size
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Calculate head pitch from key facial landmarks
      const pitch = this._calculateHeadPitch(landmarks);
      this.headPitch = pitch;

      // Check if looking down
      const wasLookingDown = this.isLookingDown;
      this.isLookingDown = pitch > this.config.lookDownThreshold;

      // Emit events
      eventBus.emit(Events.CAMERA_PITCH_UPDATE, { pitch });

      if (this.isLookingDown && !wasLookingDown) {
        eventBus.emit(Events.CAMERA_LOOKING_DOWN);
      } else if (!this.isLookingDown && wasLookingDown) {
        eventBus.emit(Events.CAMERA_LOOKING_UP);
      }

      // Draw visualization
      this._drawFacePoints(landmarks);
    }
  }

  /**
   * Calculate head pitch angle from landmarks
   * @private
   * @param {Array} landmarks - Face mesh landmarks
   * @returns {number} Pitch angle in degrees
   */
  _calculateHeadPitch(landmarks) {
    // Key landmark indices:
    // 4 - Nose tip
    // 10 - Forehead (top of face)
    // 152 - Chin (bottom of face)
    
    const noseTip = landmarks[4];
    const forehead = landmarks[10];
    const chin = landmarks[152];

    // Calculate face height (forehead to chin)
    const faceHeight = Math.abs(forehead.y - chin.y);
    
    // Calculate nose position relative to face
    // When looking straight: nose is about 40% down from forehead
    // When looking down: nose appears higher (percentage increases)
    const nosePosition = (noseTip.y - forehead.y) / faceHeight;

    // Convert to approximate degrees
    // Neutral position is around 0.4 (40%)
    const neutralPosition = 0.4;
    const pitch = (nosePosition - neutralPosition) * 150;

    return pitch;
  }

  /**
   * Draw face tracking visualization
   * @private
   */
  _drawFacePoints(landmarks) {
    const color = this.isLookingDown ? '#ff6b6b' : '#00f5d4';
    
    // Draw key points
    const keyPoints = [
      landmarks[4],   // Nose tip
      landmarks[10],  // Forehead
      landmarks[152]  // Chin
    ];

    this.ctx.fillStyle = color;
    keyPoints.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(
        point.x * this.canvas.width,
        point.y * this.canvas.height,
        4,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    });

    // Draw connecting line
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(
      landmarks[10].x * this.canvas.width,
      landmarks[10].y * this.canvas.height
    );
    this.ctx.lineTo(
      landmarks[4].x * this.canvas.width,
      landmarks[4].y * this.canvas.height
    );
    this.ctx.lineTo(
      landmarks[152].x * this.canvas.width,
      landmarks[152].y * this.canvas.height
    );
    this.ctx.stroke();
  }

  /**
   * Update configuration
   * @param {Object} config - New configuration values
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return {
      isEnabled: this.isEnabled,
      isLookingDown: this.isLookingDown,
      headPitch: this.headPitch
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.disable();
    this.video = null;
    this.canvas = null;
    this.ctx = null;
  }
}

// Export singleton instance
export const cameraManager = new CameraManager();
