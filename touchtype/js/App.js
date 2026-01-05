/**
 * App Class
 * Main application controller - orchestrates all components
 */
import { eventBus, Events } from './core/EventEmitter.js';
import { appState, defaultState } from './core/State.js';
import { storageManager } from './managers/StorageManager.js';
import { audioManager } from './managers/AudioManager.js';
import { cameraManager } from './managers/CameraManager.js';
import { penaltyManager } from './managers/PenaltyManager.js';
import { typingEngine } from './components/TypingEngine.js';
import { Keyboard } from './components/Keyboard.js';
import { TextDisplay } from './components/TextDisplay.js';
import { AchievementSystem } from './components/AchievementSystem.js';
import { textGenerator } from './utils/TextGenerator.js';

export class App {
  constructor() {
    // Component instances
    this.keyboard = null;
    this.textDisplay = null;
    this.achievementSystem = null;
    
    // DOM element references
    this.elements = {};
    
    // Modes configuration
    this.modes = [
      { id: 'standard', name: 'Standard' },
      { id: 'blind', name: 'Blind Mode' },
      { id: 'burst', name: 'Burst (30s)' },
      { id: 'words', name: 'Common Words' },
      { id: 'code', name: 'Code Mode' }
    ];

    // Settings configuration
    this.settingsConfig = [
      { id: 'soundEnabled', label: 'Sound Effects', default: true },
      { id: 'flashEnabled', label: 'Penalty Screen Flash', default: true },
      { id: 'keyboardVisible', label: 'Show Keyboard', default: true }
    ];
  }

  /**
   * Initialize the application
   */
  async init() {
    this._cacheElements();
    this._loadSavedData();
    this._initComponents();
    this._setupEventListeners();
    this._renderUI();
    this._setNewText();
    this._updateUI();
  }

  /**
   * Cache DOM element references
   * @private
   */
  _cacheElements() {
    this.elements = {
      // Start screen
      startScreen: document.getElementById('startScreen'),
      startBtn: document.getElementById('startBtn'),
      
      // Main UI
      textDisplay: document.getElementById('textDisplay'),
      typingInput: document.getElementById('typingInput'),
      keyboard: document.getElementById('keyboard'),
      fingerGuide: document.getElementById('fingerGuide'),
      keyboardContainer: document.getElementById('keyboardContainer'),
      
      // Mode selector
      modeSelector: document.getElementById('modeSelector'),
      
      // Stats
      currentWPM: document.getElementById('currentWPM'),
      currentAccuracy: document.getElementById('currentAccuracy'),
      currentErrors: document.getElementById('currentErrors'),
      currentPenalties: document.getElementById('currentPenalties'),
      totalXP: document.getElementById('totalXP'),
      streak: document.getElementById('streak'),
      bestWPM: document.getElementById('bestWPM'),
      
      // Progress
      levelText: document.getElementById('levelText'),
      currentLevelXP: document.getElementById('currentLevelXP'),
      nextLevelXP: document.getElementById('nextLevelXP'),
      xpFill: document.getElementById('xpFill'),
      
      // Camera
      webcam: document.getElementById('webcam'),
      canvasOutput: document.getElementById('canvasOutput'),
      cameraContainer: document.getElementById('cameraContainer'),
      cameraOverlay: document.getElementById('cameraOverlay'),
      enableCameraBtn: document.getElementById('enableCameraBtn'),
      cameraStatus: document.getElementById('cameraStatus'),
      statusText: document.getElementById('statusText'),
      pitchIndicator: document.getElementById('pitchIndicator'),
      pitchBar: document.getElementById('pitchBar'),
      pitchLabel: document.getElementById('pitchLabel'),
      
      // Penalty
      penaltyOverlay: document.getElementById('penaltyOverlay'),
      penaltyMessage: document.getElementById('penaltyMessage'),
      
      // Settings & Achievements
      settingsContainer: document.getElementById('settingsContainer'),
      achievementsGrid: document.getElementById('achievementsGrid')
    };
  }

  /**
   * Load saved data from storage
   * @private
   */
  _loadSavedData() {
    // Load progress
    const savedProgress = storageManager.loadProgress();
    if (savedProgress) {
      appState.update({
        'progress.totalXP': savedProgress.totalXP || 0,
        'progress.level': savedProgress.level || 1,
        'progress.xp': savedProgress.xp || 0,
        'progress.bestWPM': savedProgress.bestWPM || 0,
        'progress.streak': storageManager.updateStreak(),
        'progress.achievements': savedProgress.achievements || []
      });
    }

    // Load settings
    const savedSettings = storageManager.loadSettings();
    if (savedSettings) {
      appState.update({
        'settings.soundEnabled': savedSettings.soundEnabled ?? true,
        'settings.flashEnabled': savedSettings.flashEnabled ?? true,
        'settings.keyboardVisible': savedSettings.keyboardVisible ?? true,
        'settings.currentMode': savedSettings.currentMode || 'standard'
      });
    }
  }

  /**
   * Initialize all components
   * @private
   */
  _initComponents() {
    // Initialize keyboard
    this.keyboard = new Keyboard(
      this.elements.keyboard,
      this.elements.fingerGuide
    );
    this.keyboard.render();

    // Initialize text display
    this.textDisplay = new TextDisplay(this.elements.textDisplay);

    // Initialize achievement system
    this.achievementSystem = new AchievementSystem(this.elements.achievementsGrid);
    this.achievementSystem.loadUnlocked(appState.get('progress.achievements'));
    this.achievementSystem.render();

    // Initialize camera manager
    cameraManager.init(this.elements.webcam, this.elements.canvasOutput);

    // Initialize penalty manager
    penaltyManager.init(this.elements.penaltyOverlay, this.elements.penaltyMessage);

    // Initialize audio (needs user interaction first)
    audioManager.setEnabled(appState.get('settings.soundEnabled'));
  }

  /**
   * Setup all event listeners
   * @private
   */
  _setupEventListeners() {
    // Start button
    this.elements.startBtn.addEventListener('click', () => this._startApp());

    // Typing input
    this.elements.typingInput.addEventListener('input', (e) => this._handleInput(e));
    this.elements.typingInput.addEventListener('focus', () => audioManager.init());

    // Camera button
    this.elements.enableCameraBtn.addEventListener('click', () => this._enableCamera());

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === this.elements.typingInput) {
        this.keyboard.highlightKey(e.key);
      }
    });

    // Event bus listeners
    this._setupEventBusListeners();
  }

  /**
   * Setup event bus listeners
   * @private
   */
  _setupEventBusListeners() {
    // Stats update
    eventBus.on(Events.STATS_UPDATE, (stats) => {
      this._updateCurrentStats(stats);
    });

    // Typing complete
    eventBus.on(Events.TYPING_COMPLETE, (stats) => {
      this._handleExerciseComplete(stats);
    });

    // Camera events
    eventBus.on(Events.CAMERA_PITCH_UPDATE, ({ pitch }) => {
      this._updatePitchIndicator(pitch);
    });

    eventBus.on(Events.CAMERA_LOOKING_DOWN, () => {
      this._updateCameraStatus(true);
      this.textDisplay.showPenalty();
    });

    eventBus.on(Events.CAMERA_LOOKING_UP, () => {
      this._updateCameraStatus(false);
    });

    // Penalty events
    eventBus.on(Events.PENALTY_TRIGGERED, ({ count }) => {
      this.elements.currentPenalties.textContent = count;
    });

    // Achievement events
    eventBus.on(Events.ACHIEVEMENT_UNLOCKED, (achievement) => {
      audioManager.playAchievement();
    });

    // Level up
    eventBus.on(Events.LEVEL_UP, () => {
      audioManager.playLevelUp();
    });
  }

  /**
   * Render dynamic UI elements
   * @private
   */
  _renderUI() {
    this._renderModeSelector();
    this._renderSettings();
  }

  /**
   * Render mode selector buttons
   * @private
   */
  _renderModeSelector() {
    const currentMode = appState.get('settings.currentMode');
    
    this.elements.modeSelector.innerHTML = this.modes.map(mode => `
      <button 
        class="mode-btn ${mode.id === currentMode ? 'active' : ''}" 
        data-mode="${mode.id}"
      >
        ${mode.name}
      </button>
    `).join('');

    // Add click handlers
    this.elements.modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => this._changeMode(btn.dataset.mode));
    });
  }

  /**
   * Render settings toggles
   * @private
   */
  _renderSettings() {
    this.elements.settingsContainer.innerHTML = this.settingsConfig.map(setting => {
      const isActive = appState.get(`settings.${setting.id}`);
      return `
        <div class="settings-row">
          <span class="settings-label">${setting.label}</span>
          <div class="toggle ${isActive ? 'active' : ''}" data-setting="${setting.id}"></div>
        </div>
      `;
    }).join('');

    // Add click handlers
    this.elements.settingsContainer.querySelectorAll('.toggle').forEach(toggle => {
      toggle.addEventListener('click', () => this._toggleSetting(toggle.dataset.setting));
    });
  }

  /**
   * Start the application (hide start screen)
   * @private
   */
  _startApp() {
    this.elements.startScreen.classList.add('hidden');
    this.elements.typingInput.focus();
    audioManager.init();
    audioManager.resume();
  }

  /**
   * Handle typing input
   * @private
   */
  _handleInput(e) {
    const result = typingEngine.processInput(e.target.value);
    
    // Update text display
    this.textDisplay.render(typingEngine.getCharacterStates());

    // Play sound
    if (result.char) {
      if (result.isCorrect) {
        audioManager.playCorrect();
      } else {
        audioManager.playError();
      }
    }
  }

  /**
   * Set new text for typing
   * @private
   */
  _setNewText() {
    const mode = appState.get('settings.currentMode');
    const text = textGenerator.getText(mode);
    
    typingEngine.setText(text);
    typingEngine.setMode(mode);
    this.textDisplay.setMode(mode);
    this.textDisplay.render(typingEngine.getCharacterStates());
    
    this.elements.typingInput.value = '';
    this.elements.typingInput.disabled = false;
    
    penaltyManager.reset();
    this.elements.currentPenalties.textContent = '0';
  }

  /**
   * Change typing mode
   * @private
   */
  _changeMode(mode) {
    appState.set('settings.currentMode', mode);
    
    // Update UI
    this.elements.modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Set new text
    this._setNewText();
    
    // Save settings
    this._saveSettings();

    eventBus.emit(Events.MODE_CHANGED, { mode });
  }

  /**
   * Toggle a setting
   * @private
   */
  _toggleSetting(settingId) {
    const currentValue = appState.get(`settings.${settingId}`);
    const newValue = !currentValue;
    
    appState.set(`settings.${settingId}`, newValue);

    // Update toggle UI
    const toggle = this.elements.settingsContainer.querySelector(`[data-setting="${settingId}"]`);
    if (toggle) {
      toggle.classList.toggle('active', newValue);
    }

    // Apply setting
    this._applySetting(settingId, newValue);
    
    // Save settings
    this._saveSettings();

    eventBus.emit(Events.SETTING_CHANGED, { setting: settingId, value: newValue });
  }

  /**
   * Apply a setting change
   * @private
   */
  _applySetting(settingId, value) {
    switch (settingId) {
      case 'soundEnabled':
        audioManager.setEnabled(value);
        break;
      case 'keyboardVisible':
        this.keyboard.setVisible(value);
        break;
      // flashEnabled is handled by PenaltyManager via event
    }
  }

  /**
   * Save settings to storage
   * @private
   */
  _saveSettings() {
    storageManager.saveSettings({
      soundEnabled: appState.get('settings.soundEnabled'),
      flashEnabled: appState.get('settings.flashEnabled'),
      keyboardVisible: appState.get('settings.keyboardVisible'),
      currentMode: appState.get('settings.currentMode')
    });
  }

  /**
   * Enable camera
   * @private
   */
  async _enableCamera() {
    const success = await cameraManager.enable();
    
    if (success) {
      this.elements.cameraOverlay.classList.add('hidden');
      this.elements.cameraStatus.classList.remove('hidden');
      this.elements.pitchIndicator.classList.remove('hidden');
      appState.set('camera.enabled', true);
    } else {
      alert('Could not access camera. Please ensure camera permissions are granted.');
    }
  }

  /**
   * Update camera status display
   * @private
   */
  _updateCameraStatus(isLookingDown) {
    const container = this.elements.cameraContainer;
    const status = this.elements.cameraStatus;
    const statusText = this.elements.statusText;

    if (isLookingDown) {
      container.classList.add('looking-down');
      container.classList.remove('camera-good');
      status.classList.remove('good');
      status.classList.add('warning');
      statusText.textContent = 'Looking down!';
    } else {
      container.classList.remove('looking-down');
      container.classList.add('camera-good');
      status.classList.add('good');
      status.classList.remove('warning');
      statusText.textContent = 'Eyes on screen';
    }
  }

  /**
   * Update pitch indicator
   * @private
   */
  _updatePitchIndicator(pitch) {
    const pitchPercent = Math.min(100, Math.max(0, 50 + pitch * 2));
    this.elements.pitchBar.style.width = `${pitchPercent}%`;
    this.elements.pitchLabel.textContent = `${Math.round(pitch)}°`;
    
    if (pitch > 15) {
      this.elements.pitchBar.classList.add('warning');
    } else {
      this.elements.pitchBar.classList.remove('warning');
    }
  }

  /**
   * Update current session stats display
   * @private
   */
  _updateCurrentStats(stats) {
    this.elements.currentWPM.textContent = stats.wpm;
    this.elements.currentAccuracy.textContent = stats.accuracy;
    this.elements.currentErrors.textContent = stats.errors;
  }

  /**
   * Handle exercise completion
   * @private
   */
  _handleExerciseComplete(stats) {
    this.elements.typingInput.disabled = true;
    audioManager.playComplete();

    // Calculate XP
    let xpEarned = Math.round(stats.wpm * (stats.accuracy / 100) * 2);
    
    // Bonus for no penalties with camera on
    if (penaltyManager.isPerfect() && appState.get('camera.enabled')) {
      xpEarned = Math.round(xpEarned * 1.5);
      this.achievementSystem.unlock('eyes-up');
    }

    // Update progress
    const currentXP = appState.get('progress.xp') + xpEarned;
    const currentLevel = appState.get('progress.level');
    const xpNeeded = currentLevel * 100;

    if (currentXP >= xpNeeded) {
      // Level up
      appState.set('progress.level', currentLevel + 1);
      appState.set('progress.xp', currentXP - xpNeeded);
      eventBus.emit(Events.LEVEL_UP);
    } else {
      appState.set('progress.xp', currentXP);
    }

    appState.set('progress.totalXP', appState.get('progress.totalXP') + xpEarned);

    // Update best WPM
    if (stats.wpm > appState.get('progress.bestWPM')) {
      appState.set('progress.bestWPM', stats.wpm);
    }

    // Check achievements
    this.achievementSystem.unlock('first-lesson');
    if (stats.wpm >= 30) this.achievementSystem.unlock('speed-30');
    if (stats.wpm >= 60) this.achievementSystem.unlock('speed-60');
    if (stats.wpm >= 100) this.achievementSystem.unlock('speed-100');
    if (stats.accuracy === 100) this.achievementSystem.unlock('accuracy-100');

    // Save progress
    this._saveProgress();
    this._updateUI();

    // Reset for next round after delay
    setTimeout(() => {
      this._setNewText();
    }, 2000);
  }

  /**
   * Save progress to storage
   * @private
   */
  _saveProgress() {
    storageManager.saveProgress({
      totalXP: appState.get('progress.totalXP'),
      level: appState.get('progress.level'),
      xp: appState.get('progress.xp'),
      bestWPM: appState.get('progress.bestWPM'),
      streak: appState.get('progress.streak'),
      achievements: this.achievementSystem.getUnlocked()
    });
  }

  /**
   * Update all UI elements from state
   * @private
   */
  _updateUI() {
    const progress = appState.get('progress');
    
    // Header stats
    this.elements.totalXP.textContent = progress.totalXP;
    this.elements.streak.textContent = progress.streak;
    this.elements.bestWPM.textContent = progress.bestWPM;
    
    // Progress section
    this.elements.levelText.textContent = `Level ${progress.level}`;
    this.elements.currentLevelXP.textContent = progress.xp;
    const xpNeeded = progress.level * 100;
    this.elements.nextLevelXP.textContent = xpNeeded;
    this.elements.xpFill.style.width = `${(progress.xp / xpNeeded) * 100}%`;

    // Apply saved settings
    const settings = appState.get('settings');
    this._applySetting('keyboardVisible', settings.keyboardVisible);
  }
}
