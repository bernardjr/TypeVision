/**
 * AdaptiveTextGenerator Class
 * Generates practice text targeting user's weak keys
 */

export class AdaptiveTextGenerator {
  constructor() {
    // Word pools organized by keys
    this.wordsByKey = {
      'a': ['call', 'make', 'take', 'place', 'face', 'large', 'party', 'stand', 'water', 'matter'],
      'b': ['before', 'number', 'ember', 'about', 'above', 'able', 'public', 'possible', 'maybe', 'subject'],
      'c': ['could', 'which', 'place', 'such', 'case', 'school', 'social', 'local', 'practice', 'choice'],
      'd': ['would', 'made', 'under', 'should', 'world', 'develop', 'modern', 'middle', 'consider', 'inside'],
      'e': ['there', 'were', 'between', 'every', 'these', 'never', 'people', 'general', 'present', 'several'],
      'f': ['first', 'after', 'before', 'different', 'office', 'often', 'effect', 'family', 'life', 'information'],
      'g': ['great', 'large', 'program', 'through', 'group', 'government', 'together', 'general', 'getting', 'organization'],
      'h': ['which', 'there', 'through', 'should', 'other', 'without', 'think', 'whether', 'change', 'happen'],
      'i': ['will', 'which', 'their', 'think', 'while', 'still', 'within', 'might', 'since', 'interview'],
      'j': ['just', 'major', 'project', 'subject', 'enjoy', 'journey'],
      'k': ['like', 'make', 'take', 'work', 'think', 'market', 'speak', 'network', 'thanks', 'knowledge'],
      'l': ['will', 'only', 'people', 'world', 'level', 'political', 'social', 'available', 'follow', 'until'],
      'm': ['most', 'more', 'time', 'them', 'some', 'same', 'make', 'many', 'member', 'movement'],
      'n': ['than', 'when', 'only', 'then', 'even', 'national', 'under', 'union', 'training', 'environment'],
      'o': ['into', 'over', 'more', 'some', 'most', 'often', 'other', 'work', 'world', 'information'],
      'p': ['people', 'part', 'place', 'point', 'public', 'practice', 'program', 'process', 'provide', 'special'],
      'q': ['question', 'quality', 'quite', 'quick', 'quarter', 'require'],
      'r': ['first', 'more', 'their', 'other', 'great', 'three', 'where', 'present', 'right', 'remember'],
      's': ['some', 'same', 'state', 'still', 'such', 'system', 'school', 'possible', 'seems', 'support'],
      't': ['that', 'there', 'this', 'state', 'other', 'after', 'between', 'still', 'thought', 'certain'],
      'u': ['under', 'such', 'would', 'study', 'use', 'usually', 'support', 'during', 'until', 'future'],
      'v': ['very', 'over', 'even', 'every', 'however', 'service', 'level', 'development', 'government', 'several'],
      'w': ['will', 'which', 'would', 'while', 'where', 'work', 'world', 'between', 'power', 'answer'],
      'x': ['next', 'example', 'experience', 'expect', 'exactly', 'explain'],
      'y': ['your', 'year', 'only', 'they', 'very', 'always', 'maybe', 'today', 'anything', 'yourself'],
      'z': ['size', 'organization', 'recognize', 'realize', 'amazing']
    };

    // Common bigrams (two-letter combinations)
    this.bigrams = {
      'th': ['the', 'that', 'this', 'there', 'think', 'through', 'another', 'other', 'without'],
      'he': ['the', 'there', 'these', 'when', 'where', 'whether', 'other', 'another', 'check'],
      'in': ['into', 'think', 'within', 'include', 'industry', 'information', 'training', 'morning'],
      'er': ['other', 'where', 'there', 'after', 'never', 'under', 'over', 'general', 'service'],
      'an': ['another', 'many', 'any', 'than', 'change', 'want', 'plan', 'understand', 'land'],
      're': ['there', 'where', 'were', 'more', 'great', 'require', 'represent', 'three', 'present'],
      'on': ['one', 'only', 'into', 'national', 'information', 'question', 'among', 'continue'],
      'at': ['that', 'what', 'state', 'national', 'information', 'education', 'create', 'later'],
      'en': ['then', 'when', 'even', 'been', 'between', 'general', 'open', 'environment', 'often'],
      'nd': ['and', 'under', 'hand', 'find', 'understand', 'stand', 'kind', 'around', 'second']
    };

    // Letter frequency patterns for natural text
    this.commonLetters = 'etaoinsrhldcumfpgwybvkxjqz'.split('');
  }

  /**
   * Generate text targeting specific weak keys
   * @param {Array<string>} weakKeys - Array of keys to target
   * @param {number} wordCount - Number of words to generate
   * @returns {string} Generated practice text
   */
  generateForWeakKeys(weakKeys, wordCount = 15) {
    if (!weakKeys || weakKeys.length === 0) {
      return this.generateGeneral(wordCount);
    }

    const words = [];
    const usedWords = new Set();

    // Target each weak key proportionally
    for (let i = 0; i < wordCount; i++) {
      const targetKey = weakKeys[i % weakKeys.length];
      const candidates = this.wordsByKey[targetKey] || [];

      if (candidates.length > 0) {
        // Pick a random word that hasn't been used recently
        let word;
        let attempts = 0;
        do {
          word = candidates[Math.floor(Math.random() * candidates.length)];
          attempts++;
        } while (usedWords.has(word) && attempts < 10);

        words.push(word);
        usedWords.add(word);

        // Clear used words periodically to allow repetition
        if (usedWords.size > wordCount / 2) {
          usedWords.clear();
        }
      }
    }

    return words.join(' ') + '.';
  }

  /**
   * Generate text for specific bigram practice
   * @param {string} bigram - Two-letter combination to practice
   * @param {number} wordCount - Number of words
   * @returns {string} Generated text
   */
  generateForBigram(bigram, wordCount = 10) {
    const candidates = this.bigrams[bigram.toLowerCase()] || [];
    if (candidates.length === 0) {
      return this.generateGeneral(wordCount);
    }

    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }

    return words.join(' ') + '.';
  }

  /**
   * Generate drill focusing on a single key
   * @param {string} key - The key to drill
   * @param {number} repetitions - Number of words
   * @returns {string} Drill text
   */
  generateKeyDrill(key, repetitions = 8) {
    const words = this.wordsByKey[key.toLowerCase()] || ['the', 'and', 'for'];
    const drillWords = [];

    for (let i = 0; i < repetitions; i++) {
      drillWords.push(words[i % words.length]);
    }

    return drillWords.join(' ') + '.';
  }

  /**
   * Generate text combining multiple weak keys with natural flow
   * @param {Array<string>} weakKeys - Keys to target
   * @param {number} sentenceCount - Number of sentences
   * @returns {string} Natural-feeling practice text
   */
  generateNaturalText(weakKeys, sentenceCount = 3) {
    const sentences = [];

    for (let i = 0; i < sentenceCount; i++) {
      const wordsInSentence = 8 + Math.floor(Math.random() * 7); // 8-14 words
      const sentence = this.generateForWeakKeys(weakKeys, wordsInSentence);

      // Capitalize first letter
      const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      sentences.push(capitalized);
    }

    return sentences.join(' ');
  }

  /**
   * Generate general practice text (fallback)
   * @param {number} wordCount - Number of words
   * @returns {string} Practice text
   */
  generateGeneral(wordCount = 15) {
    const commonWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
      'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
      'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
      'its', 'let', 'put', 'say', 'she', 'too', 'use', 'may', 'well', 'also',
      'back', 'even', 'good', 'hand', 'high', 'keep', 'kind', 'know', 'last'
    ];

    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }

    return words.join(' ') + '.';
  }

  /**
   * Generate progressive difficulty text
   * Starts easy, gradually adds more challenging keys
   * @param {number} level - Difficulty level (1-10)
   * @returns {string} Practice text
   */
  generateProgressive(level) {
    const wordCount = 12 + level * 2;

    // Level 1-3: Common letters only
    if (level <= 3) {
      const easyKeys = ['e', 't', 'a', 'o', 'i', 'n'];
      return this.generateForWeakKeys(easyKeys, wordCount);
    }

    // Level 4-6: Add more variety
    if (level <= 6) {
      const mediumKeys = ['s', 'r', 'h', 'l', 'd', 'c', 'u'];
      return this.generateForWeakKeys(mediumKeys, wordCount);
    }

    // Level 7-10: Include all keys
    return this.generateGeneral(wordCount);
  }

  /**
   * Generate error correction drill
   * Creates pairs of similar words to practice distinction
   * @param {string} problematicKey - The key causing errors
   * @returns {string} Drill text
   */
  generateErrorCorrectionDrill(problematicKey) {
    const key = problematicKey.toLowerCase();
    const words = this.wordsByKey[key] || [];

    if (words.length < 4) {
      return this.generateKeyDrill(key, 8);
    }

    // Create alternating pattern for focused practice
    const drill = [];
    for (let i = 0; i < 4; i++) {
      drill.push(words[i % words.length]);
      drill.push(words[(i + 1) % words.length]);
    }

    return drill.join(' ') + '.';
  }

  /**
   * Get word pool for a specific key (for testing/debugging)
   * @param {string} key - The key
   * @returns {Array<string>} Words containing that key
   */
  getWordsForKey(key) {
    return this.wordsByKey[key.toLowerCase()] || [];
  }
}

// Export singleton instance
export const adaptiveTextGenerator = new AdaptiveTextGenerator();
