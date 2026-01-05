/**
 * TextDisplay Class
 * Renders the typing text with character states
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class TextDisplay {
  constructor(container) {
    this.container = container;
    this.currentMode = 'standard';
    this.penaltyActive = false;
  }

  /**
   * Render character states to display
   * @param {Array<Object>} characterStates - Array of {char, state, index}
   */
  render(characterStates) {
    const html = characterStates.map(({ char, state }) => {
      let displayChar = char;
      
      // In blind mode, hide typed characters
      if (this.currentMode === 'blind' && (state === 'correct' || state === 'incorrect')) {
        displayChar = '•';
      }

      // Handle space display
      if (char === ' ') {
        displayChar = '&nbsp;';
      }

      return `<span class="char ${state}">${displayChar}</span>`;
    }).join('');

    this.container.innerHTML = html;
  }

  /**
   * Set display mode
   * @param {string} mode - Mode name
   */
  setMode(mode) {
    this.currentMode = mode;
  }

  /**
   * Show penalty effect
   */
  showPenalty() {
    if (this.penaltyActive) return;
    
    this.penaltyActive = true;
    this.container.classList.add('penalty-active');
    
    setTimeout(() => {
      this.container.classList.remove('penalty-active');
      this.penaltyActive = false;
    }, 300);
  }

  /**
   * Clear display
   */
  clear() {
    this.container.innerHTML = '';
    this.container.classList.remove('penalty-active');
    this.penaltyActive = false;
  }

  /**
   * Scroll to current position if needed
   */
  scrollToCurrent() {
    const current = this.container.querySelector('.char.current');
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
