# TypeVision

> Master touch typing with AI-powered camera monitoring. Keep your eyes on the screen — we're watching.

TypeVision is a modern web-based touch typing trainer that uses webcam eye/gaze tracking to detect when users look down at their keyboard, enforcing proper touch typing habits through real-time feedback and penalties.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-orange.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)

---

## Project Vision

Traditional typing tutors only measure speed and accuracy. TypeVision goes further by using computer vision to ensure you're developing **true touch typing skills** — typing without looking at the keyboard. This builds muscle memory faster and creates lasting habits.

---

## Current Features (v0.1.0-alpha)

### Core Typing System
- [x] Real-time WPM (Words Per Minute) calculation
- [x] Accuracy tracking with error highlighting
- [x] Character-by-character feedback (correct/incorrect/current)
- [x] Multiple practice modes:
  - **Standard** — Classic sentences and pangrams
  - **Blind Mode** — Text hides as you type (builds confidence)
  - **Burst (30s)** — Short, fast-paced speed drills
  - **Common Words** — Practice with frequently used words
  - **Code Mode** — Programming syntax and special characters

### Camera & Eye Tracking
- [x] **MediaPipe Face Mesh** integration for head pose detection
- [x] **WebGazer.js** integration for accurate gaze tracking
- [x] Real-time head pitch angle visualization
- [x] Screen vs. keyboard detection
- [x] 9-point calibration system for WebGazer

### Penalty System
- [x] Visual screen flash when looking down
- [x] Audio warning feedback
- [x] Penalty counter per session
- [x] XP deduction for penalties
- [x] Cooldown to prevent penalty spam
- [x] "Eyes Up!" achievement for penalty-free sessions

### Gamification
- [x] XP (Experience Points) earned per exercise
- [x] Level progression system
- [x] Daily streak tracking
- [x] Achievement system with unlockable badges:
  - First Steps — Complete first exercise
  - Getting Started — Reach 30 WPM
  - Speed Demon — Reach 60 WPM
  - Perfectionist — 100% accuracy
  - Eyes Up! — No look penalties (with camera)
  - Dedicated — 7-day streak

### Virtual Keyboard
- [x] On-screen keyboard visualization
- [x] Home row key highlighting (F/J bumps)
- [x] Real-time key press feedback
- [x] Finger position guide
- [x] Error key highlighting

### Data Persistence
- [x] Progress saved to localStorage
- [x] Settings persistence
- [x] Best WPM tracking
- [x] Achievement unlocks saved

### UI/UX
- [x] Modern dark theme with accent colors
- [x] Responsive design (desktop/tablet/mobile)
- [x] Animated transitions and effects
- [x] Settings toggles (sound, flash, keyboard visibility)

---

## Roadmap — Planned Features

### Phase 1: Enhanced Learning (v0.2.0)
- [ ] **Adaptive Difficulty** — AI targets your weak keys
- [ ] **Structured Curriculum**
  - Home row basics (ASDF JKL;)
  - Top row introduction
  - Bottom row mastery
  - Numbers and symbols
  - Speed building exercises
- [ ] **Keyboard Heatmap** — Visual display of problem keys (red) vs mastered keys (green)
- [ ] **Error Correction Drills** — Focused practice on frequently missed keys
- [ ] **Proper Finger Placement Training** — Guided exercises for correct technique

### Phase 2: Advanced Camera Features (v0.3.0)
- [ ] **Hand Position Detection** — Verify home row finger placement
- [ ] **Posture Monitoring** — Detect slouching and warn user
- [ ] **Screen Distance Check** — Ensure proper viewing distance
- [ ] **"Honest Mode" Challenge** — Strict mode requiring zero keyboard glances
- [ ] **Hybrid Tracking** — Combine head pose + gaze for best accuracy

### Phase 3: Practice Modes (v0.4.0)
- [ ] **Endurance Mode** — 5-10 minute continuous typing
- [ ] **Number Pad Training** — Dedicated numpad exercises
- [ ] **Custom Text Import** — Paste your own practice text
- [ ] **Quote Library** — Famous quotes and literature excerpts
- [ ] **Contextual Vocabulary** — Industry-specific word sets (medical, legal, tech)
- [ ] **Timed Tests** — 1/2/5 minute standardized tests

### Phase 4: Analytics & Insights (v0.5.0)
- [ ] **Statistics Dashboard**
  - WPM trends over time (graphs)
  - Accuracy progression
  - Total practice time
  - Keys per finger breakdown
- [ ] **Session Replay** — Review your typing sessions
- [ ] **Goal Predictions** — "At this rate, you'll reach 60 WPM in 2 weeks"
- [ ] **Problem Key Analysis** — Detailed breakdown of weak spots
- [ ] **Export Data** — Download your progress as JSON/CSV

### Phase 5: Social & Multiplayer (v0.6.0)
- [ ] **User Accounts** — Cloud sync with authentication
- [ ] **Leaderboards**
  - Global rankings
  - Weekly/monthly competitions
  - Friend group boards
- [ ] **Real-time Multiplayer Races** — Compete head-to-head
- [ ] **Friend System** — Add friends, compare stats
- [ ] **Clubs/Groups** — Create or join typing clubs
- [ ] **Shareable Achievement Cards** — Social media sharing

### Phase 6: Accessibility & Health (v0.7.0)
- [ ] **Multiple Keyboard Layouts**
  - QWERTY (US/UK)
  - AZERTY (French)
  - QWERTZ (German)
  - Dvorak
  - Colemak
- [ ] **Theme Options** — Light/dark/custom themes
- [ ] **Font Customization** — Size, family, spacing
- [ ] **Colorblind-Friendly Mode**
- [ ] **Break Reminders** — 20-30 minute interval notifications
- [ ] **Stretch Suggestions** — Hand/wrist exercises between sessions
- [ ] **Session Time Limits** — Prevent overuse

### Phase 7: Mobile & Desktop Apps (v1.0.0)
- [ ] **Progressive Web App (PWA)** — Installable, offline support
- [ ] **Electron Desktop App** — Native Windows/Mac/Linux
- [ ] **Mobile Optimization** — Touch-friendly interface
- [ ] **Bluetooth Keyboard Support** — Track external keyboards

---

## Project Structure

```
touchtype/
├── index.html                    # Main application entry point
├── webgazer-demo.html            # WebGazer.js standalone demo
├── README.md                     # This file
│
├── css/
│   ├── variables.css             # Design tokens (colors, spacing, fonts)
│   ├── base.css                  # Reset and fundamental styles
│   ├── components.css            # Reusable UI components
│   ├── layout.css                # Page structure and responsive grid
│   ├── keyboard.css              # Virtual keyboard styles
│   ├── camera.css                # Webcam section styles
│   └── animations.css            # Keyframes and animation classes
│
└── js/
    ├── main.js                   # Application entry point
    ├── App.js                    # Main controller (orchestrates everything)
    │
    ├── core/
    │   ├── EventEmitter.js       # Pub/sub pattern for component communication
    │   └── State.js              # Centralized state management
    │
    ├── managers/
    │   ├── StorageManager.js     # localStorage persistence layer
    │   ├── AudioManager.js       # Web Audio API sound effects
    │   ├── CameraManager.js      # MediaPipe face tracking
    │   ├── GazeManager.js        # WebGazer.js eye gaze tracking
    │   └── PenaltyManager.js     # Look-down penalty handling
    │
    ├── components/
    │   ├── TypingEngine.js       # Core typing logic and statistics
    │   ├── Keyboard.js           # Virtual keyboard visualization
    │   ├── TextDisplay.js        # Renders typing text with states
    │   └── AchievementSystem.js  # Achievement tracking and unlocking
    │
    └── utils/
        └── TextGenerator.js      # Sample texts for all practice modes
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Vanilla JavaScript (ES6+ Modules) |
| **Styling** | CSS3 with Custom Properties |
| **Face Detection** | MediaPipe Face Mesh |
| **Eye Tracking** | WebGazer.js |
| **Audio** | Web Audio API |
| **Storage** | localStorage |
| **Fonts** | Google Fonts (Outfit, JetBrains Mono) |

---

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam (for eye tracking features)

### Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/bernardjr/TypeVision.git
   cd TypeVision
   ```

2. **Serve the files**
   
   Since the app uses ES6 modules, you need to serve it via HTTP (not file://):
   
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Quick Start (No Server)

For a quick test without modules, open `webgazer-demo.html` directly in your browser — it's a standalone demo of the eye tracking feature.

---

## Usage Guide

### Basic Typing Practice

1. Click **"Begin Training"** on the start screen
2. Select a practice mode (Standard, Blind, Burst, etc.)
3. Click the input field and start typing
4. Watch your WPM and accuracy in real-time

### Enabling Eye Tracking

1. Click **"Enable Camera"** in the sidebar
2. Allow camera permissions when prompted
3. For best results with WebGazer.js:
   - Click **"Calibrate"** and follow the 9-point calibration
   - Look at each dot and click it
4. The system will now detect if you look down at the keyboard

### Understanding the Penalty System

- **Looking down triggers a penalty** (if camera is enabled)
- Penalties deduct XP and increment your penalty counter
- Complete sessions with **zero penalties** to earn the "Eyes Up!" achievement
- A 2-second cooldown prevents rapid-fire penalties

---

## Design Principles

### OOP Architecture
The codebase follows object-oriented principles:

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each class handles one concern |
| **Encapsulation** | Private methods prefixed with `_` |
| **Loose Coupling** | Components communicate via EventEmitter |
| **Observer Pattern** | Global event bus for state changes |
| **Singleton Pattern** | Managers export singleton instances |

### Event-Driven Communication
Components don't directly reference each other. Instead, they emit and listen to events:

```javascript
// Emitting an event
eventBus.emit(Events.TYPING_COMPLETE, stats);

// Listening to an event
eventBus.on(Events.CAMERA_LOOKING_DOWN, () => {
  penaltyManager.trigger();
});
```

---

## Configuration

### Camera Settings (GazeManager)
```javascript
gazeManager.setConfig({
  lookDownThreshold: 1.1,    // Y > 110% of viewport = looking down
  smoothingFactor: 0.3,      // Gaze position smoothing (0-1)
  showPrediction: false      // Show WebGazer prediction dot
});
```

### Penalty Settings (PenaltyManager)
```javascript
penaltyManager.setConfig({
  cooldownDuration: 2000,    // ms between penalties
  xpPenalty: 5,              // XP lost per penalty
  showFlash: true,           // Visual screen flash
  playSound: true            // Audio warning
});
```

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** — Open an issue describing the problem
2. **Suggest Features** — Open an issue with your idea
3. **Submit PRs** — Fork, create a branch, make changes, submit PR

### Development Guidelines
- Follow existing code style
- Use meaningful commit messages
- Test on multiple browsers
- Update documentation as needed


## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) — Face mesh and iris tracking
- [WebGazer.js](https://webgazer.cs.brown.edu/) — Webcam eye tracking library
- [Brown University HCI Lab](https://github.com/brownhci/WebGazer) — WebGazer research and development
- [Google Fonts](https://fonts.google.com/) — Outfit and JetBrains Mono fonts
