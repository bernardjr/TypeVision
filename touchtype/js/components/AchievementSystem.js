/**
 * AchievementSystem Class
 * Manages achievements, unlocking, and display
 */
import { eventBus, Events } from '../core/EventEmitter.js';

export class AchievementSystem {
  constructor(container) {
    this.container = container;
    this.unlockedAchievements = new Set();
    
    // Achievement definitions
    this.achievements = new Map([
      ['first-lesson', {
        id: 'first-lesson',
        name: 'First Steps',
        description: 'Complete your first typing exercise',
        icon: '🎯',
        condition: (stats) => stats.exercisesCompleted >= 1
      }],
      ['speed-30', {
        id: 'speed-30',
        name: 'Getting Started',
        description: 'Reach 30 WPM',
        icon: '🚀',
        condition: (stats) => stats.bestWPM >= 30
      }],
      ['speed-60', {
        id: 'speed-60',
        name: 'Speed Demon',
        description: 'Reach 60 WPM',
        icon: '⚡',
        condition: (stats) => stats.bestWPM >= 60
      }],
      ['speed-100', {
        id: 'speed-100',
        name: 'Lightning Fingers',
        description: 'Reach 100 WPM',
        icon: '💨',
        condition: (stats) => stats.bestWPM >= 100
      }],
      ['accuracy-100', {
        id: 'accuracy-100',
        name: 'Perfectionist',
        description: 'Complete an exercise with 100% accuracy',
        icon: '💎',
        condition: (stats) => stats.perfectExercises >= 1
      }],
      ['eyes-up', {
        id: 'eyes-up',
        name: 'Eyes Up!',
        description: 'Complete an exercise with camera on and no look penalties',
        icon: '👀',
        condition: (stats) => stats.noPenaltyExercises >= 1
      }],
      ['streak-7', {
        id: 'streak-7',
        name: 'Dedicated',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        condition: (stats) => stats.streak >= 7
      }],
      ['streak-30', {
        id: 'streak-30',
        name: 'Committed',
        description: 'Maintain a 30-day streak',
        icon: '🏆',
        condition: (stats) => stats.streak >= 30
      }],
      ['night-owl', {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Practice after midnight',
        icon: '🦉',
        condition: (stats) => stats.nightSessions >= 1
      }],
      ['early-bird', {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Practice before 6 AM',
        icon: '🌅',
        condition: (stats) => stats.earlySessions >= 1
      }],
      ['marathon', {
        id: 'marathon',
        name: 'Marathon Typist',
        description: 'Type for 30 minutes in one session',
        icon: '🏃',
        condition: (stats) => stats.longestSession >= 30
      }],
      ['code-master', {
        id: 'code-master',
        name: 'Code Master',
        description: 'Complete 10 code typing exercises',
        icon: '💻',
        condition: (stats) => stats.codeExercises >= 10
      }]
    ]);

    this._setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    eventBus.on(Events.TYPING_COMPLETE, (stats) => {
      this.checkAchievements(stats);
    });
  }

  /**
   * Load unlocked achievements from array
   * @param {Array<string>} achievementIds
   */
  loadUnlocked(achievementIds = []) {
    this.unlockedAchievements = new Set(achievementIds);
    this.render();
  }

  /**
   * Check if any new achievements should be unlocked
   * @param {Object} stats - Current statistics
   * @returns {Array<Object>} Newly unlocked achievements
   */
  checkAchievements(stats) {
    const newlyUnlocked = [];

    this.achievements.forEach((achievement, id) => {
      if (!this.unlockedAchievements.has(id) && achievement.condition(stats)) {
        this.unlock(id);
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  /**
   * Unlock an achievement
   * @param {string} id - Achievement ID
   */
  unlock(id) {
    if (this.unlockedAchievements.has(id)) return;
    
    const achievement = this.achievements.get(id);
    if (!achievement) return;

    this.unlockedAchievements.add(id);
    
    // Update UI
    const el = this.container.querySelector(`[data-achievement="${id}"]`);
    if (el) {
      el.classList.add('unlocked', 'just-unlocked');
      setTimeout(() => el.classList.remove('just-unlocked'), 500);
    }

    eventBus.emit(Events.ACHIEVEMENT_UNLOCKED, achievement);
  }

  /**
   * Check if achievement is unlocked
   * @param {string} id
   * @returns {boolean}
   */
  isUnlocked(id) {
    return this.unlockedAchievements.has(id);
  }

  /**
   * Get all unlocked achievement IDs
   * @returns {Array<string>}
   */
  getUnlocked() {
    return Array.from(this.unlockedAchievements);
  }

  /**
   * Get achievement info
   * @param {string} id
   * @returns {Object|null}
   */
  getAchievement(id) {
    return this.achievements.get(id) || null;
  }

  /**
   * Get progress towards achievements
   * @param {Object} stats
   * @returns {Array<Object>}
   */
  getProgress(stats) {
    return Array.from(this.achievements.values()).map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.has(achievement.id)
    }));
  }

  /**
   * Render achievements grid
   */
  render() {
    // Get first 6 achievements for display
    const displayAchievements = Array.from(this.achievements.values()).slice(0, 6);
    
    this.container.innerHTML = displayAchievements.map(achievement => {
      const isUnlocked = this.unlockedAchievements.has(achievement.id);
      return `
        <div 
          class="achievement ${isUnlocked ? 'unlocked' : ''}" 
          data-achievement="${achievement.id}"
          title="${achievement.name}: ${achievement.description}"
        >
          ${achievement.icon}
        </div>
      `;
    }).join('');
  }

  /**
   * Get total count
   * @returns {Object}
   */
  getCounts() {
    return {
      total: this.achievements.size,
      unlocked: this.unlockedAchievements.size
    };
  }
}
