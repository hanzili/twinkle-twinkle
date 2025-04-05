# Twinkle Twinkle

*A minimalist narrative puzzle game with a monochromatic aesthetic, exploring a late night at the office and the choices that define us*

## Game Overview

"Twinkle Twinkle" is a narrative-driven game with a striking black and white visual style that follows a protagonist's journey as they prepare to leave work and navigate their commute home. Through various interactions and choices, players shape the protagonist's mindset and ultimate fate, leading to one of four possible endings.

The game explores themes of work-life balance, personal identity, and the small decisions that collectively define our lives. As the protagonist progresses from office to home, their energy level gradually increases, symbolizing the recharged spirit away from work.

## Features

- **Minimalist Black and White Aesthetic**: Clean, high-contrast visuals focusing on essential elements
- **Interactive Office Environment**: Interact with various objects in the office that reveal insights about the protagonist's life
- **Simplified Typing Mini-Game**: Complete a work report through a streamlined typing challenge
- **Meaningful Choices**: Every interaction shapes the character's mindset and influences the final outcome
- **Multiple Endings**: Four distinct endings based on your choices throughout the game
- **Energy Level System**: Visual representation of the protagonist's energy level as they progress through the game
- **Custom Cursor**: Pixel art cursor that changes based on interactivity
- **Atmospheric Design**: Immersive visuals and thoughtful dialog that establish the late-night office setting

## How to Play

### Controls
- **Mouse**: Click on objects to interact with them
- **Keyboard**: Type during the typing mini-game

### Gameplay
1. **Explore the Office**: Click on various objects in the office to interact with them
2. **Make Choices**: Select dialog options that reflect your character's mindset
3. **Complete Tasks**: Finish the typing mini-game (or choose to skip it)
4. **Prepare to Leave**: After interacting with key objects, the option to leave the office will appear
5. **Journey Home**: Navigate subsequent scenes on your commute home
   - The Skytrain scene where thoughts float across the screen
   - The Bus scene where you receive a phone call
6. **Discover Your Ending**: Your choices throughout the game determine which of the four endings you'll experience

### Key Interactions
- **Computer**: Complete a typing mini-game to finish your work report
- **Fish Tank**: Contemplate your situation while feeding the office fish
- **Coffee Cup**: Decide whether to finish your coffee
- **Potted Plant**: Choose whether to water the neglected office plant
- **Eye Mask**: Consider using it for a quick rest
- **Water Bottle**: Decide between plain water or brewing goji berries

### Energy System
As you progress through the game, the energy meter in the top right corner will fill up:
- **Office Scene**: Low energy (tired from work)
- **Skytrain Scene**: Medium energy (starting to recharge)
- **Bus Scene**: High energy (almost fully recharged)
- **Ending Scene**: Full energy (completely recharged)

## Endings

The game features four possible conclusions based on your choices:

1. **The Safe Harbor Ending**: Return to your comfortable routine
2. **The Overachiever Ending**: Embrace the corporate lifestyle
3. **The Freedom Ending**: Break away from the constraints of office life
4. **The Funny Ending**: Take an unexpected and humorous turn

## Installation & Running the Game

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:8080`

### Production Build

To create a production build:
```
npm run build
```

The built files will be in the `dist` folder, ready to be deployed to any web server.

## Technical Details

This game is built with:
- [Phaser 3](https://phaser.io/) - HTML5 game framework
- [TypeScript](https://www.typescriptlang.org/) - For type-safe code
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## Code Architecture

### Project Structure

```
office-escape-game/
├── public/            # Static assets folder
│   ├── assets/        # Game assets (images, audio)
│   │   ├── cursor/    # Custom cursor images
│   │   └── energy-bar/ # Energy level indicators
│   └── style.css      # Global styles
├── src/               # Source code
│   ├── main.ts        # Entry point that initializes the game
│   ├── scenes/        # Game scenes
│   │   ├── BaseScene.ts       # Base scene with shared functionality
│   │   ├── Boot.ts            # Initial loading screen
│   │   ├── Preloader.ts       # Asset preloader
│   │   ├── MainMenu.ts        # Main menu screen
│   │   ├── Scene1_Office/     # Main office scene (modular structure)
│   │   │   ├── index.ts               # Main scene class
│   │   │   ├── GameState.ts           # Tracks game state and player choices
│   │   │   ├── DialogSystem.ts        # Handles dialog display and choices
│   │   │   ├── InteractionHandlers.ts # Manages object interactions
│   │   │   └── TypingGame.ts          # Typing mini-game implementation
│   │   ├── Scene2_Skytrain.ts  # Second game scene (skytrain)
│   │   ├── Scene3_Bus.ts       # Third game scene (bus ride)
│   │   ├── Scene4_Ending.ts    # Final scene with multiple endings
│   │   ├── Game.ts             # Additional game logic
│   │   └── GameOver.ts         # End screen
│   └── utils/             # Utility classes
│       └── CursorManager.ts    # Custom cursor management
├── vite/              # Vite configuration
└── index.html         # HTML entry point
```

### Core Components

#### Base Architecture

- **BaseScene**: Provides common functionality for all game scenes:
  - Custom cursor management with consistent behavior
  - Energy level display and tracking
  - Scene transition handling
  - Standardized cleanup processes

- **CursorManager**: Manages the custom cursor throughout the game:
  - Replaces the default browser cursor with pixel art
  - Switches between normal and interactive cursor states
  - Handles cursor scaling and positioning
  - Ensures proper cleanup between scene transitions

#### Scene Management

- **main.ts**: Initializes the Phaser game with configuration settings and registers all scenes.
- **Boot.ts**: The first scene that loads minimal assets needed for the preloader.
- **Preloader.ts**: Loads all game assets with a progress bar.
- **MainMenu.ts**: Displays the main menu with a start game button.

#### Game Progression Scenes

- **Scene1_Office**: The starting scene with the protagonist at work (low energy)
- **Scene2_Skytrain**: Transit scene after leaving work (medium energy)
- **Scene3_Bus**: Final transit scene before reaching home (high energy)
- **Scene4_Ending**: Ending scene based on player choices (full energy)

#### Office Scene Components

The office scene uses a modular architecture for better code organization:

- **Scene1_Office/index.ts**: Main scene class that:
  - Sets up the office environment and visual elements
  - Initializes all sub-components
  - Manages transitions between scenes
  - Provides access to scene objects via getter methods

- **GameState.ts**: State management system that:
  - Tracks which objects the player has interacted with
  - Records player choices throughout the game
  - Determines when the player is ready to leave the office
  - Stores data that influences the game ending

- **DialogSystem.ts**: Dialog management that:
  - Creates and displays dialog boxes with text
  - Handles dialog choice button
  - Manages the dialog flow and callbacks
  - Ensures only one dialog is visible at a time

- **InteractionHandlers.ts**: Interaction logic that:
  - Defines what happens when players click on each object
  - Manages object-specific animations and effects
  - Creates custom dialogs for complex interactions like the fish tank
  - Updates game state based on player choices

- **TypingGame.ts**: Mini-game implementation that:
  - Creates a minimalist black and white typing interface
  - Handles keyboard input during the mini-game
  - Uses a simple match completion system
  - Updates game state based on mini-game outcome

### Logic Flow

1. **Game Initialization and Main Menu**:
   - Game starts → Boot → Preloader → MainMenu
   - Player starts game → Energy level initialized to LOW

2. **Scene Progression and Energy System**:
   - Scene1_Office (LOW energy) → Scene2_Skytrain (MEDIUM energy) → Scene3_Bus (HIGH energy) → Scene4_Ending

3. **Player Choice Flow**:
   - Office scene: Interact with objects, complete/skip typing mini-game, feed fish
   - Skytrain scene: Select thoughts that define character mindset
   - Bus scene: Decide how to handle the unexpected phone call
   - Ending scene: View one of four endings based on accumulated choices

4. **Ending Determination**:
   - Each choice contributes toward one of four ending types
   - The ending with the most accumulated points is selected
   - Choices from all scenes factor into the final outcome

### Dependencies

#### External Libraries
- **Phaser 3.88.2**: Core game engine providing scene management, sprites, input handling
- **TypeScript 5.4.5**: Type system for safer code
- **Vite 5.3.1**: Build tool and development server

#### Internal Dependencies
- **BaseScene** ← parent of → **All game scenes**
- **CursorManager** ← used by → **BaseScene**
- **GameState** ← depends on → **Scene1_Office** (for accessing scene objects)
- **DialogSystem** ← depends on → **Scene1_Office** (for adding UI elements)
- **InteractionHandlers** ← depends on → **DialogSystem**, **GameState**, **TypingGame**
- **TypingGame** ← depends on → **DialogSystem**, **GameState**

#### Asset Dependencies
- Custom cursor images (cursor.png, cursor_focus.png)
- Energy level indicators (energy-empty.png, energy-low.png, energy-medium.png, energy-high.png)
- Sprite sheets for animations (fish_animation.png)
- Background images (office_background.png, skytrain_background.png, typing-background.png)
- Object sprites (computer.png, iced_coffee.png, etc.)
- Audio files (click.mp3, typing.mp3, ambient_office.mp3)

This architecture follows a component-based design that separates concerns while allowing necessary communication between parts of the system. The modular approach makes it easier to maintain and extend the game with new features or scenes.

## Visual Design

The game features a distinctive minimalist black and white aesthetic:

- **Monochromatic UI**: All interface elements use a strict black and white color scheme
- **High Contrast**: Clear visual hierarchy with strong contrast between elements
- **Simplified Visuals**: Focus on essential information without color distractions
- **Typography Focus**: Emphasis on clear typography for narrative immersion

This stark visual approach complements the game's themes of work-life balance and binary choices, while creating a unique atmospheric experience.

## Credits

- **Game Design & Development**: [Your Name/Team]
- **Artwork**: Original pixel art and monochromatic assets
- **Sound Effects**: Creative Commons licensed audio
- **Special Thanks**: To everyone who tested the game and provided feedback

---

*Twinkle Twinkle is a story about finding your own path in life, one click at a time.*
