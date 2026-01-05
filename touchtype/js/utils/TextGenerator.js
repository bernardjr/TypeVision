/**
 * TextGenerator Class
 * Provides text content for different typing modes
 */
export class TextGenerator {
  constructor() {
    // Sample texts organized by mode
    this.texts = {
      standard: [
        "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
        "How vexingly quick daft zebras jump! The five boxing wizards jump quickly.",
        "Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz.",
        "The job requires extra pluck and zeal from every young wage earner.",
        "A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.",
        "Crazy Frederick bought many very exquisite opal jewels.",
        "We promptly judged antique ivory buckles for the next prize.",
        "Sixty zippers were quickly picked from the woven jute bag.",
        "Amazingly few discotheques provide jukeboxes.",
        "Heavy boxes perform quick waltzes and jigs."
      ],
      
      words: [
        "the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us",
        "about after again air all along also an and another any are around as at away back be because been before being between both boy but by came can come could day did different do does done down each end even every few find first for from get give go good great had hand have he her here high him his home house how I if in into is it its just know large last left let life like line little live long look made make man many may me men might more most much must my name never new next no not now number of off old on one only or other our out over own part people place point put read right said same say see she should show small so some something sound still such take tell than that the their them then there these they thing think this those thought three through time to too two under up us use very want was water way we well went were what when where which while who why will with word work world would write year you your",
      ],

      code: [
        "function calculateSum(arr) { return arr.reduce((a, b) => a + b, 0); }",
        "const fetchData = async (url) => { const response = await fetch(url); return response.json(); };",
        "if (condition && value !== null) { console.log('Valid'); } else { throw new Error('Invalid'); }",
        "const users = data.filter(user => user.active).map(user => ({ id: user.id, name: user.name }));",
        "class Component extends React.Component { constructor(props) { super(props); this.state = {}; } }",
        "export default function App() { const [count, setCount] = useState(0); return <div>{count}</div>; }",
        "const router = express.Router(); router.get('/api/users', async (req, res) => { res.json(users); });",
        "interface User { id: number; name: string; email?: string; roles: string[]; }",
        "SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;",
        "git commit -m 'feat: add user authentication' && git push origin main"
      ],

      burst: [
        "Speed is key. Type fast. Do not look down. Keep your eyes up. Trust your fingers.",
        "Quick quick quick. Faster faster faster. No mistakes. Perfect accuracy. You can do it.",
        "Focus on the screen. Your hands know the way. Let muscle memory guide you.",
        "Short and fast. Brief but accurate. Speed without errors. That is the goal.",
        "Burst mode active. Type rapidly. Maintain precision. Every second counts."
      ],

      blind: [
        "Trust your muscle memory. Your fingers know where the keys are. Do not look.",
        "Home row is your anchor. Feel the bumps on F and J. Let your fingers dance.",
        "Close your eyes if you dare. The keyboard is memorized. You have got this.",
        "Blind typing builds confidence. Each keystroke is intentional. Focus on feeling.",
        "No peeking allowed. Your brain knows the layout. Just let it flow naturally."
      ],

      quotes: [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Stay hungry, stay foolish. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "It is during our darkest moments that we must focus to see the light. - Aristotle",
        "The only thing we have to fear is fear itself. - Franklin D. Roosevelt",
        "In the middle of difficulty lies opportunity. - Albert Einstein",
        "Life is what happens when you are busy making other plans. - John Lennon"
      ]
    };

    // Word frequency data for adaptive generation
    this.commonWords = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she'
    ];
  }

  /**
   * Get random text for a mode
   * @param {string} mode - Typing mode
   * @returns {string}
   */
  getText(mode = 'standard') {
    const texts = this.texts[mode] || this.texts.standard;
    return texts[Math.floor(Math.random() * texts.length)];
  }

  /**
   * Get all texts for a mode
   * @param {string} mode
   * @returns {Array<string>}
   */
  getAllTexts(mode = 'standard') {
    return this.texts[mode] || this.texts.standard;
  }

  /**
   * Generate text targeting specific characters
   * @param {Array<string>} targetChars - Characters to focus on
   * @param {number} length - Approximate word count
   * @returns {string}
   */
  generateTargeted(targetChars, length = 10) {
    const targetSet = new Set(targetChars.map(c => c.toLowerCase()));
    
    // Get all words containing target characters
    const allWords = this.texts.words[0].split(' ');
    const targetedWords = allWords.filter(word => 
      [...word].some(char => targetSet.has(char))
    );

    // If not enough targeted words, mix with common words
    const words = [];
    for (let i = 0; i < length; i++) {
      if (targetedWords.length > 0 && Math.random() > 0.3) {
        words.push(targetedWords[Math.floor(Math.random() * targetedWords.length)]);
      } else {
        words.push(this.commonWords[Math.floor(Math.random() * this.commonWords.length)]);
      }
    }

    return words.join(' ');
  }

  /**
   * Generate random words
   * @param {number} count - Number of words
   * @returns {string}
   */
  generateRandomWords(count = 15) {
    const allWords = this.texts.words[0].split(' ');
    const words = [];
    
    for (let i = 0; i < count; i++) {
      words.push(allWords[Math.floor(Math.random() * allWords.length)]);
    }

    return words.join(' ');
  }

  /**
   * Add custom text
   * @param {string} mode - Mode to add to
   * @param {string} text - Text to add
   */
  addText(mode, text) {
    if (!this.texts[mode]) {
      this.texts[mode] = [];
    }
    this.texts[mode].push(text);
  }

  /**
   * Get available modes
   * @returns {Array<string>}
   */
  getModes() {
    return Object.keys(this.texts);
  }

  /**
   * Get mode info
   * @param {string} mode
   * @returns {Object}
   */
  getModeInfo(mode) {
    const modeInfo = {
      standard: {
        name: 'Standard',
        description: 'Classic typing practice with varied sentences'
      },
      words: {
        name: 'Common Words',
        description: 'Practice with the most frequently used words'
      },
      code: {
        name: 'Code Mode',
        description: 'Programming syntax and special characters'
      },
      burst: {
        name: 'Burst',
        description: 'Short, fast-paced exercises for speed building'
      },
      blind: {
        name: 'Blind Mode',
        description: 'Build confidence without seeing what you type'
      },
      quotes: {
        name: 'Quotes',
        description: 'Famous quotes and inspirational text'
      }
    };

    return modeInfo[mode] || { name: mode, description: '' };
  }
}

// Export singleton instance
export const textGenerator = new TextGenerator();
