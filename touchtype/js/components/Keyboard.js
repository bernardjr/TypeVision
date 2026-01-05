/**
 * Keyboard Class
 * Virtual keyboard visualization component
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class Keyboard {
  constructor(container, fingerGuideContainer = null) {
    this.container = container;
    this.fingerGuideContainer = fingerGuideContainer;
    this.keys = new Map();
    this.visible = true;
    
    // Keyboard layout
    this.layout = [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
      [' ']
    ];

    // Home row keys (have tactile bumps on F and J)
    this.homeKeys = new Set(['A', 'S', 'D', 'F', 'J', 'K', 'L', ';']);

    // Finger assignments for guide
    this.fingerAssignments = {
      left: {
        pinky: ['`', '1', 'Q', 'A', 'Z'],
        ring: ['2', 'W', 'S', 'X'],
        middle: ['3', 'E', 'D', 'C'],
        index: ['4', '5', 'R', 'T', 'F', 'G', 'V', 'B']
      },
      right: {
        index: ['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M'],
        middle: ['8', 'I', 'K', ','],
        ring: ['9', 'O', 'L', '.'],
        pinky: ['0', '-', '=', 'P', '[', ']', '\\', ';', "'", '/']
      },
      thumb: [' ']
    };

    this._setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    eventBus.on(Events.TYPING_INPUT, ({ correct, char }) => {
      this.highlightKey(char, !correct);
    });

    eventBus.on(Events.KEY_PRESSED, ({ key }) => {
      this.highlightKey(key);
    });

    eventBus.on(Events.KEY_ERROR, ({ key }) => {
      this.highlightKey(key, true);
    });
  }

  /**
   * Render the keyboard to the container
   */
  render() {
    this.container.innerHTML = '';
    this.keys.clear();

    this.layout.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'keyboard-row';

      row.forEach(key => {
        const keyEl = this._createKeyElement(key);
        this.keys.set(key.toUpperCase(), keyEl);
        rowEl.appendChild(keyEl);
      });

      this.container.appendChild(rowEl);
    });

    // Render finger guide if container provided
    if (this.fingerGuideContainer) {
      this._renderFingerGuide();
    }
  }

  /**
   * Create a key element
   * @private
   */
  _createKeyElement(key) {
    const keyEl = document.createElement('div');
    keyEl.className = 'key';
    keyEl.dataset.key = key;
    
    // Display character
    keyEl.textContent = key === ' ' ? '␣' : key;

    // Add special classes
    if (key === ' ') {
      keyEl.classList.add('space');
    }
    
    if (this.homeKeys.has(key)) {
      keyEl.classList.add('home-key');
    }

    return keyEl;
  }

  /**
   * Render finger guide below keyboard
   * @private
   */
  _renderFingerGuide() {
    this.fingerGuideContainer.innerHTML = '';

    const fingers = [
      { name: 'Pinky', class: 'finger-pinky' },
      { name: 'Ring', class: 'finger-ring' },
      { name: 'Middle', class: 'finger-middle' },
      { name: 'Index', class: 'finger-index' },
      { name: 'Thumb', class: 'finger-thumb' },
      { name: 'Index', class: 'finger-index' },
      { name: 'Middle', class: 'finger-middle' },
      { name: 'Ring', class: 'finger-ring' },
      { name: 'Pinky', class: 'finger-pinky' }
    ];

    fingers.forEach(finger => {
      const indicator = document.createElement('span');
      indicator.className = `finger-indicator ${finger.class}`;
      indicator.textContent = finger.name;
      this.fingerGuideContainer.appendChild(indicator);
    });
  }

  /**
   * Highlight a key
   * @param {string} char - Character to highlight
   * @param {boolean} isError - Whether it's an error
   */
  highlightKey(char, isError = false) {
    const key = char.toUpperCase();
    const keyEl = this.keys.get(key);
    
    if (keyEl) {
      const className = isError ? 'error' : 'active';
      keyEl.classList.add(className);
      
      setTimeout(() => {
        keyEl.classList.remove('active', 'error');
      }, 150);
    }
  }

  /**
   * Show specific key as the next expected key
   * @param {string} char - Expected character
   */
  showExpectedKey(char) {
    // Remove previous expected
    this.keys.forEach(keyEl => {
      keyEl.classList.remove('expected');
    });

    const key = char?.toUpperCase();
    const keyEl = this.keys.get(key);
    
    if (keyEl) {
      keyEl.classList.add('expected');
    }
  }

  /**
   * Get finger assignment for a key
   * @param {string} key - Key character
   * @returns {Object|null} Finger info
   */
  getFingerForKey(key) {
    const upperKey = key.toUpperCase();
    
    // Check left hand
    for (const [finger, keys] of Object.entries(this.fingerAssignments.left)) {
      if (keys.includes(upperKey)) {
        return { hand: 'left', finger };
      }
    }

    // Check right hand
    for (const [finger, keys] of Object.entries(this.fingerAssignments.right)) {
      if (keys.includes(upperKey)) {
        return { hand: 'right', finger };
      }
    }

    // Check thumb
    if (this.fingerAssignments.thumb.includes(upperKey)) {
      return { hand: 'either', finger: 'thumb' };
    }

    return null;
  }

  /**
   * Set keyboard visibility
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.visible = visible;
    this.container.closest('.keyboard-container').style.display = 
      visible ? 'block' : 'none';
  }

  /**
   * Toggle visibility
   */
  toggle() {
    this.setVisible(!this.visible);
  }

  /**
   * Reset keyboard state
   */
  reset() {
    this.keys.forEach(keyEl => {
      keyEl.classList.remove('active', 'error', 'expected');
    });
  }
}
