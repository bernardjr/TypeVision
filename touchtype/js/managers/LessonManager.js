/**
 * LessonManager Class
 * Manages structured curriculum with progressive lessons
 */
import { eventBus, Events } from '../core/EventEmitter.js';
import { storageManager } from './StorageManager.js';

export class LessonManager {
  constructor() {
    this.curriculum = this._buildCurriculum();
    this.currentLesson = null;
    this.lessonProgress = {}; // { lessonId: { completed: bool, stars: 1-3, bestWPM: 0 } }

    this._loadProgress();
  }

  /**
   * Build the lesson curriculum
   * @private
   * @returns {Object} Curriculum structure
   */
  _buildCurriculum() {
    return {
      // Level 1: Home Row Foundation
      homeRow: {
        id: 'homeRow',
        name: 'Home Row Mastery',
        description: 'Master the foundation of touch typing',
        icon: '🏠',
        lessons: [
          {
            id: 'hr-1',
            name: 'F and J Keys',
            description: 'Learn the anchor keys with bumps',
            keys: ['f', 'j'],
            targetAccuracy: 90,
            targetWPM: 15,
            text: 'fff jjj fjf jfj ffj jff fjfj jfjf'
          },
          {
            id: 'hr-2',
            name: 'D and K Keys',
            description: 'Expand to middle fingers',
            keys: ['f', 'j', 'd', 'k'],
            targetAccuracy: 90,
            targetWPM: 18,
            text: 'ddd kkk fdf kjk dkdk fkfk jdjd fjdk'
          },
          {
            id: 'hr-3',
            name: 'S and L Keys',
            description: 'Add ring fingers',
            keys: ['f', 'j', 'd', 'k', 's', 'l'],
            targetAccuracy: 90,
            targetWPM: 20,
            text: 'sss lll sls lsl sdsd lklk sfsl jkls'
          },
          {
            id: 'hr-4',
            name: 'A and Semicolon',
            description: 'Complete the home row',
            keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
            targetAccuracy: 85,
            targetWPM: 22,
            text: 'aaa ;;; a;a ;a; asdf jkl; fdsa ;lkj'
          },
          {
            id: 'hr-5',
            name: 'Home Row Words',
            description: 'Type real words using home row',
            keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
            targetAccuracy: 90,
            targetWPM: 25,
            text: 'sad dad lad fad salad flaskask flask fall all shall lasslass glass'
          }
        ]
      },

      // Level 2: Top Row Introduction
      topRow: {
        id: 'topRow',
        name: 'Top Row Training',
        description: 'Reach upward with confidence',
        icon: '⬆️',
        lessons: [
          {
            id: 'tr-1',
            name: 'R and U Keys',
            description: 'Reach up with index fingers',
            keys: ['r', 'u'],
            targetAccuracy: 85,
            targetWPM: 20,
            text: 'rrr uuu rur uru frfr juju far jug fur ruff'
          },
          {
            id: 'tr-2',
            name: 'E and I Keys',
            description: 'Reach up with middle fingers',
            keys: ['r', 'u', 'e', 'i'],
            targetAccuracy: 85,
            targetWPM: 22,
            text: 'eee iii ded kik rei due die red rue ride rude'
          },
          {
            id: 'tr-3',
            name: 'W and O Keys',
            description: 'Reach up with ring fingers',
            keys: ['r', 'u', 'e', 'i', 'w', 'o'],
            targetAccuracy: 85,
            targetWPM: 24,
            text: 'www ooo sws lol wow owe ore word work woke'
          },
          {
            id: 'tr-4',
            name: 'Q and P Keys',
            description: 'Complete the top row',
            keys: ['q', 'w', 'e', 'r', 'u', 'i', 'o', 'p'],
            targetAccuracy: 85,
            targetWPM: 26,
            text: 'qqq ppp qaq p;p quit quipoper pure equip proper'
          },
          {
            id: 'tr-5',
            name: 'Top Row Sentences',
            description: 'Practice with real sentences',
            keys: ['q', 'w', 'e', 'r', 'u', 'i', 'o', 'p'],
            targetAccuracy: 90,
            targetWPM: 28,
            text: 'we were supposed to read a proper report for our work'
          }
        ]
      },

      // Level 3: Bottom Row Mastery
      bottomRow: {
        id: 'bottomRow',
        name: 'Bottom Row Power',
        description: 'Master the lower reaches',
        icon: '⬇️',
        lessons: [
          {
            id: 'br-1',
            name: 'V and M Keys',
            description: 'Reach down with index fingers',
            keys: ['v', 'm'],
            targetAccuracy: 85,
            targetWPM: 20,
            text: 'vvv mmm fvf jmj vim vam move more time volume'
          },
          {
            id: 'br-2',
            name: 'C and Comma Keys',
            description: 'Reach down with middle fingers',
            keys: ['v', 'm', 'c', ','],
            targetAccuracy: 85,
            targetWPM: 22,
            text: 'ccc ,,, dcd k,k car cam come case cram cream'
          },
          {
            id: 'br-3',
            name: 'X and Period Keys',
            description: 'Reach down with ring fingers',
            keys: ['v', 'm', 'c', ',', 'x', '.'],
            targetAccuracy: 85,
            targetWPM: 24,
            text: 'xxx ... sxs l.l six mix exit exact text exam'
          },
          {
            id: 'br-4',
            name: 'Z and Slash Keys',
            description: 'Complete the bottom row',
            keys: ['z', 'x', 'c', 'v', 'm', ',', '.', '/'],
            targetAccuracy: 85,
            targetWPM: 26,
            text: 'zzz /// aza ;/; zone zero size maze amaze zeal'
          },
          {
            id: 'br-5',
            name: 'Full Alphabet Practice',
            description: 'Use all letter keys',
            keys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            targetAccuracy: 90,
            targetWPM: 30,
            text: 'the quick brown fox jumps over the lazy dog with grace and speed'
          }
        ]
      },

      // Level 4: Numbers Row
      numbersRow: {
        id: 'numbersRow',
        name: 'Numbers & Symbols',
        description: 'Expand to the number row',
        icon: '🔢',
        lessons: [
          {
            id: 'nr-1',
            name: 'Home Position Numbers',
            description: 'Numbers 4, 5, 6, 7',
            keys: ['4', '5', '6', '7'],
            targetAccuracy: 80,
            targetWPM: 18,
            text: '444 555 666 777 45 67 456 567 4567'
          },
          {
            id: 'nr-2',
            name: 'Left Hand Numbers',
            description: 'Numbers 1, 2, 3',
            keys: ['1', '2', '3', '4', '5'],
            targetAccuracy: 80,
            targetWPM: 20,
            text: '111 222 333 123 234 345 12345'
          },
          {
            id: 'nr-3',
            name: 'Right Hand Numbers',
            description: 'Numbers 8, 9, 0',
            keys: ['6', '7', '8', '9', '0'],
            targetAccuracy: 80,
            targetWPM: 20,
            text: '888 999 000 678 789 890 67890'
          },
          {
            id: 'nr-4',
            name: 'All Numbers',
            description: 'Practice all digits',
            keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            targetAccuracy: 85,
            targetWPM: 22,
            text: '0123456789 1234567890 9876543210 5678901234'
          },
          {
            id: 'nr-5',
            name: 'Mixed Text and Numbers',
            description: 'Combine letters and numbers',
            keys: 'abcdefghijklmnopqrstuvwxyz0123456789'.split(''),
            targetAccuracy: 90,
            targetWPM: 28,
            text: 'room 123 had 456 items and cost about 789 dollars in 2024'
          }
        ]
      },

      // Level 5: Speed Building
      speedBuilding: {
        id: 'speedBuilding',
        name: 'Speed Development',
        description: 'Build typing speed and fluency',
        icon: '⚡',
        lessons: [
          {
            id: 'sb-1',
            name: 'Common Words Sprint',
            description: 'Speed up with frequent words',
            keys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            targetAccuracy: 92,
            targetWPM: 35,
            text: 'the and for are but not you all can her was one our out day get has'
          },
          {
            id: 'sb-2',
            name: 'Phrase Fluency',
            description: 'Type common phrases quickly',
            keys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            targetAccuracy: 92,
            targetWPM: 38,
            text: 'in the for you and the to be or not it was on our way out from here'
          },
          {
            id: 'sb-3',
            name: 'Sentence Speed',
            description: 'Full sentences at speed',
            keys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            targetAccuracy: 93,
            targetWPM: 40,
            text: 'she walked into the room with confidence and began to speak clearly'
          },
          {
            id: 'sb-4',
            name: 'Paragraph Power',
            description: 'Sustained speed typing',
            keys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            targetAccuracy: 93,
            targetWPM: 45,
            text: 'the modern world requires strong typing skills for most careers and daily tasks so practice makes perfect'
          },
          {
            id: 'sb-5',
            name: 'Expert Challenge',
            description: 'Ultimate typing test',
            keys: 'abcdefghijklmnopqrstuvwxyz0123456789'.split(''),
            targetAccuracy: 95,
            targetWPM: 50,
            text: 'developing exceptional typing speed takes dedication but the rewards include increased productivity and career opportunities in 2024 and beyond'
          }
        ]
      }
    };
  }

  /**
   * Load lesson progress from storage
   * @private
   */
  _loadProgress() {
    const saved = storageManager.load('lessonProgress', {});
    this.lessonProgress = saved;
  }

  /**
   * Save lesson progress to storage
   * @private
   */
  _saveProgress() {
    storageManager.save('lessonProgress', this.lessonProgress);
  }

  /**
   * Get all curriculum categories
   * @returns {Array<Object>} Array of categories
   */
  getCategories() {
    return Object.values(this.curriculum).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      totalLessons: category.lessons.length,
      completedLessons: this._getCompletedCount(category.id)
    }));
  }

  /**
   * Get lessons for a specific category
   * @param {string} categoryId - Category ID
   * @returns {Array<Object>} Array of lessons with progress
   */
  getLessons(categoryId) {
    const category = this.curriculum[categoryId];
    if (!category) return [];

    return category.lessons.map((lesson, index) => {
      const progress = this.lessonProgress[lesson.id] || {};
      const prevLesson = index > 0 ? category.lessons[index - 1] : null;
      const isPrevCompleted = prevLesson
        ? this.lessonProgress[prevLesson.id]?.completed
        : true;

      return {
        ...lesson,
        progress: progress,
        locked: index > 0 && !isPrevCompleted,
        completed: progress.completed || false,
        stars: progress.stars || 0,
        bestWPM: progress.bestWPM || 0
      };
    });
  }

  /**
   * Get a specific lesson by ID
   * @param {string} lessonId - Lesson ID
   * @returns {Object|null} Lesson object
   */
  getLesson(lessonId) {
    for (const category of Object.values(this.curriculum)) {
      const lesson = category.lessons.find(l => l.id === lessonId);
      if (lesson) {
        const progress = this.lessonProgress[lessonId] || {};
        return {
          ...lesson,
          categoryId: category.id,
          categoryName: category.name,
          progress,
          completed: progress.completed || false,
          stars: progress.stars || 0,
          bestWPM: progress.bestWPM || 0
        };
      }
    }
    return null;
  }

  /**
   * Complete a lesson with results
   * @param {string} lessonId - Lesson ID
   * @param {Object} results - { wpm, accuracy }
   * @returns {Object} Completion data with stars earned
   */
  completeLesson(lessonId, results) {
    const lesson = this.getLesson(lessonId);
    if (!lesson) return null;

    const { wpm, accuracy } = results;

    // Calculate stars (1-3)
    let stars = 1;
    if (accuracy >= lesson.targetAccuracy && wpm >= lesson.targetWPM) {
      stars = 2; // Met both targets
    }
    if (accuracy >= lesson.targetAccuracy + 5 && wpm >= lesson.targetWPM + 5) {
      stars = 3; // Exceeded targets
    }

    // Update progress
    const existingProgress = this.lessonProgress[lessonId] || {};
    this.lessonProgress[lessonId] = {
      completed: true,
      stars: Math.max(stars, existingProgress.stars || 0),
      bestWPM: Math.max(wpm, existingProgress.bestWPM || 0),
      bestAccuracy: Math.max(accuracy, existingProgress.bestAccuracy || 0),
      attempts: (existingProgress.attempts || 0) + 1,
      lastCompleted: new Date().toISOString()
    };

    this._saveProgress();

    eventBus.emit(Events.LESSON_COMPLETE, {
      lessonId,
      stars,
      wpm,
      accuracy
    });

    return {
      lessonId,
      stars,
      isNewBest: wpm > (existingProgress.bestWPM || 0),
      unlockedNext: this._checkNextLessonUnlocked(lessonId)
    };
  }

  /**
   * Check if completing this lesson unlocked the next one
   * @private
   * @param {string} lessonId - Lesson ID
   * @returns {boolean}
   */
  _checkNextLessonUnlocked(lessonId) {
    for (const category of Object.values(this.curriculum)) {
      const lessonIndex = category.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1 && lessonIndex < category.lessons.length - 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get completed lesson count for a category
   * @private
   * @param {string} categoryId - Category ID
   * @returns {number}
   */
  _getCompletedCount(categoryId) {
    const category = this.curriculum[categoryId];
    if (!category) return 0;

    return category.lessons.filter(lesson =>
      this.lessonProgress[lesson.id]?.completed
    ).length;
  }

  /**
   * Get overall curriculum progress
   * @returns {Object} Progress statistics
   */
  getOverallProgress() {
    let totalLessons = 0;
    let completedLessons = 0;
    let totalStars = 0;
    let earnedStars = 0;

    Object.values(this.curriculum).forEach(category => {
      totalLessons += category.lessons.length;
      totalStars += category.lessons.length * 3; // Max 3 stars per lesson

      category.lessons.forEach(lesson => {
        const progress = this.lessonProgress[lesson.id];
        if (progress?.completed) {
          completedLessons++;
          earnedStars += progress.stars || 1;
        }
      });
    });

    return {
      totalLessons,
      completedLessons,
      totalStars,
      earnedStars,
      percentComplete: Math.round((completedLessons / totalLessons) * 100),
      starPercentage: Math.round((earnedStars / totalStars) * 100)
    };
  }

  /**
   * Get next recommended lesson
   * @returns {Object|null} Next lesson to practice
   */
  getNextLesson() {
    for (const category of Object.values(this.curriculum)) {
      for (const lesson of category.lessons) {
        const progress = this.lessonProgress[lesson.id];
        if (!progress || !progress.completed) {
          return this.getLesson(lesson.id);
        }
      }
    }
    return null; // All lessons completed!
  }

  /**
   * Reset all lesson progress
   */
  resetProgress() {
    this.lessonProgress = {};
    this._saveProgress();
    eventBus.emit(Events.LESSON_PROGRESS_RESET);
  }

  /**
   * Get lessons by difficulty level
   * @param {string} difficulty - 'beginner', 'intermediate', 'advanced'
   * @returns {Array<Object>} Filtered lessons
   */
  getLessonsByDifficulty(difficulty) {
    const difficultyMap = {
      beginner: ['homeRow'],
      intermediate: ['topRow', 'bottomRow'],
      advanced: ['numbersRow', 'speedBuilding']
    };

    const categories = difficultyMap[difficulty] || [];
    const lessons = [];

    categories.forEach(catId => {
      if (this.curriculum[catId]) {
        lessons.push(...this.getLessons(catId));
      }
    });

    return lessons;
  }
}

// Export singleton instance
export const lessonManager = new LessonManager();
