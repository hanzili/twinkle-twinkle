import {BaseScene, EnergyLevel} from './BaseScene';
import {DialogManager, DialogType} from '../utils/DialogManager';
import {GameStateManager} from '../utils/GameStateManager';

// Define thought types for ending determination
enum ThoughtType {
    SAFE = 'safe',
    OVERACHIEVER = 'overachiever',
    FREEDOM = 'freedom'
}

// Define thought data structure
interface Thought {
    text: string;
    type: ThoughtType;
}

export class Scene2_Skytrain extends BaseScene {
    private backgrounds: Phaser.GameObjects.Image[] = [];
    private currentBackgroundIndex: number = 0;
    private backgroundTimer: Phaser.Time.TimerEvent;
    private thoughtTimer: Phaser.Time.TimerEvent;
    private thoughtsSelected: Record<ThoughtType, number> = {
        [ThoughtType.SAFE]: 0,
        [ThoughtType.OVERACHIEVER]: 0,
        [ThoughtType.FREEDOM]: 0
    };
    private thoughtCount: number = 0;
    private maxThoughts: number = 3; // Player can select this many thoughts
    // Define the height range for thought bubbles
    private minBubbleY: number = 200; // Top boundary for bubbles
    private maxBubbleY: number = 500; // Bottom boundary for bubbles
    private thoughts: Thought[] = [
        {text: "I am so hungry, I need to order something from uber", type: ThoughtType.SAFE},
        {
            text: "Omg I'm stressed…how am I going to finish the report…",
            type: ThoughtType.OVERACHIEVER
        },
        {
            text: "There's a new episode of The Fall Bikaru Alived is out. I'm excited!",
            type: ThoughtType.SAFE
        },
        {text: "I feel so trapped in this dead end job.", type: ThoughtType.FREEDOM},
        {text: "My cat/dog is missing me. Need to get home quick", type: ThoughtType.SAFE},
        {
            text: "I heard Steven got a promotion. I need to work harder.",
            type: ThoughtType.OVERACHIEVER
        },
        {
            text: "I wish I could just run away and start a bubble tea shop",
            type: ThoughtType.FREEDOM
        }
    ];

    // Add centralized managers
    private dialogManager: DialogManager;
    private gameStateManager: GameStateManager;

    // To avoid playing post-thought-dialog again
    private hasStartedTransition: boolean = false;

    constructor() {
        super('Scene2_Skytrain');

        // Initialize managers
        this.dialogManager = DialogManager.getInstance();
        this.gameStateManager = GameStateManager.getInstance();
    }

    create() {
        // Call parent create method to set up defaults including font override
        super.create();

        // Stop the sound from scene 1
        const bgm1 = this.sound.get('bgm1');
        if (bgm1 && bgm1.isPlaying) {
            bgm1.stop();
        }

        // Play the music for scene 2
        try {
            this.sound.play('bgm2', {loop: true, volume: 0.3});
            this.sound.play('rain', {loop: true, volume: 0.6});
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }

        // Setup dimensions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Initialize the dialog manager with this scene
        this.dialogManager.init(this);

        // Adjust the bubble height boundaries based on game height
        this.minBubbleY = gameHeight * 0.20;
        this.maxBubbleY = gameHeight * 0.30;

        // Create all 5 background images (initially hidden except the first one)
        for (let i = 1; i <= 5; i++) {
            const bg = this.add.image(centerX, centerY, `background-${i}`)
                .setDisplaySize(gameWidth, gameHeight)
                .setDepth(0);

            // Only show the first background initially
            bg.setVisible(i === 1);

            // Store reference to background
            this.backgrounds.push(bg);
        }

        // Start the background animation loop
        this.backgroundTimer = this.time.addEvent({
            delay: 300, // Switch every 300ms for faster animation
            callback: this.switchBackground,
            callbackScope: this,
            loop: true
        });

        // Initialize custom cursor using BaseScene method
        this.initCursor();

        // Display energy level (MEDIUM in this scene)
        this.showEnergyLevel(EnergyLevel.MEDIUM);

        // Play background music
        try {
            this.sound.play('bgm2', {loop: true, volume: 0.5});
        } catch (e) {
            console.log('Background music playback failed, continuing without music');
        }

        // Show counter for thought selection
        this.createThoughtCounter();

        // Start spawning thoughts
        this.thoughtTimer = this.time.addEvent({
            delay: 1500, // New thought every 1.5 seconds
            callback: this.spawnThought,
            callbackScope: this,
            loop: true
        });

        // Shuffle thoughts array for randomness
        this.shuffleThoughts();

        this.playSceneIntroDialog();
    }

    private async playSceneIntroDialog(): Promise<void> {
        await this.dialogManager.showDialogSequence([
            {
                text: "The streets are so empty tonight.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "Guess it’s just too late.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "When you walk alone on streets like this… your mind won’t stop running.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "Thoughts are fleeting… I just want to hold onto something and make sense of it all.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "Help she sort through her thoughts. What is she really thinking?" +
                    "Pay attention to your choices. They may affect the ending.",
                type: DialogType.NARRATION
            }
        ]);
    }

    private async playPostThoughtDialog(): Promise<void> {
        await this.dialogManager.showDialogSequence([
            {
                text: "My mind feels clearer now.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "Sometimes, knowing what you think and want really matters.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "But people often act against their own thoughts.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "I guess no one wants to be the one train that derails in a world that’s running smoothly.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "...",
                type: DialogType.PROTAGONIST
            },
            {
                text: "Ah — there’s the station.",
                type: DialogType.PROTAGONIST
            }
        ]);
}



    // Method to switch to the next background in the animation sequence
    private switchBackground(): void {
        // Hide the current background
        this.backgrounds[this.currentBackgroundIndex].setVisible(false);

        // Move to the next background
        this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % 5;

        // Show the new current background
        this.backgrounds[this.currentBackgroundIndex].setVisible(true);
    }

    // Create a counter to show how many thoughts can be selected
    private createThoughtCounter(): void {
        const gameWidth = this.cameras.main.width;

        // Add instruction text
        this.add.text(gameWidth / 2, 50, "Select your thoughts", {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add counter text
        this.add.text(gameWidth / 2, 80, `${this.thoughtCount}/${this.maxThoughts}`, {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setName('thoughtCounter');
    }

    // Shuffle the thoughts array for randomness
    private shuffleThoughts(): void {
        // Fisher-Yates shuffle
        for (let i = this.thoughts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.thoughts[i], this.thoughts[j]] = [this.thoughts[j], this.thoughts[i]];
        }
    }

    // Spawn a random thought that floats across the screen
    private spawnThought(): void {
        if (this.thoughtCount >= this.maxThoughts) {
            // If player has selected max thoughts, proceed to next scene
            this.goToNextScene();
            return;
        }

        const gameWidth = this.cameras.main.width;

        // Pick a random thought from the list
        const thoughtIndex = Math.floor(Math.random() * this.thoughts.length);
        const thought = this.thoughts[thoughtIndex];

        // Choose a random thought bubble style (1-3)
        const bubbleStyle = Math.floor(Math.random() * 3) + 1;

        // Create a temporary bubble to get dimensions
        const tempBubble = this.add.image(0, 0, `thought-bubble-${bubbleStyle}`);
        const bubbleScale = 8.0;
        tempBubble.setScale(bubbleScale);
        const bubbleWidth = tempBubble.displayWidth;
        const bubbleHeight = tempBubble.displayHeight;
        tempBubble.destroy();

        // Generate a random Y position within the allowed range
        const yPos = Math.random() * (this.maxBubbleY - this.minBubbleY) + this.minBubbleY;

        // Initial X position for the thought bubble
        const initialX = gameWidth + 200;

        // Create the thought bubble
        const bubble = this.add.image(0, 0, `thought-bubble-${bubbleStyle}`)
            .setScale(bubbleScale)
            .setDepth(10);

        // Create the thought text
        const text = this.add.text(0, -40, thought.text, {
            fontFamily: 'Courier New',
            fontSize: '17px',
            color: '#000000',
            align: 'center',
            wordWrap: {width: 280}
        }).setOrigin(0.5).setDepth(11);

        // Group the bubble and text in a container positioned correctly
        const container = this.add.container(initialX, yPos, [bubble, text]);

        // Set interactive area with appropriate size
        container.setSize(bubbleWidth, bubbleHeight);
        container.setInteractive();

        // Store the thought type in the container for reference
        container.setData('type', thought.type);
        container.setData('selected', false);

        // Add a click handler
        container.on('pointerdown', () => {
            if (this.thoughtCount < this.maxThoughts && !container.getData('selected')) {
                this.selectThought(container, thought.type);
            }
        });

        // Move the thought across the screen
        this.tweens.add({
            targets: container,
            x: -2500, // Move past the left edge of the screen
            duration: 12000, // 12 seconds to cross
            ease: 'Linear',
            onComplete: () => {
                // Clean up when offscreen
                container.destroy();
            }
        });
    }

    // Handle when a player selects a thought
    private selectThought(container: Phaser.GameObjects.Container, type: ThoughtType): void {
        // ✅ Play selection sound
        try {
            this.sound.play('selection', {volume: 20});
        } catch (e) {
            console.warn('Selection sound failed to play:', e);
        }

        // Mark as selected
        container.setData('selected', true);

        // Highlight the selection
        const bubble = container.getAt(0) as Phaser.GameObjects.Image;
        bubble.setTint(0xCCCCCC);

        // Record the selection
        this.thoughtsSelected[type]++;
        this.thoughtCount++;

        // Store the choice in GameStateManager
        this.gameStateManager.setFlag(`thought_${type}`, this.thoughtsSelected[type]);

        // Update counter
        const counter = this.children.getByName('thoughtCounter') as Phaser.GameObjects.Text;
        if (counter) {
            counter.setText(`${this.thoughtCount}/${this.maxThoughts}`);
        }

        // Check if we've reached the max
        if (this.thoughtCount >= this.maxThoughts) {
            // Add a delay before proceeding to next scene
            this.time.delayedCall(2000, this.goToNextScene, [], this);
        }
    }

    private fadeOutAndTransition(): void {
    if (this.tweens.getTweensOf(this.backgroundTimer).length > 0) {
        return;
    }

    this.backgroundTimer.destroy();
    this.thoughtTimer.destroy();

    const fadeRect = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000
    ).setAlpha(0).setDepth(100);

    this.tweens.add({
        targets: fadeRect,
        alpha: 1,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
            this.recordFinalThoughtScores();
            this.dialogManager.cleanup();
            this.transitionToScene('Scene3_Bus');
        }
    });
}


    // Proceed to the next scene
    private async goToNextScene(): Promise<void> {
        // First play the dialog
        if (this.hasStartedTransition) return; // to avoid repetition
            this.hasStartedTransition = true;
        await this.playPostThoughtDialog();

        // Transit to the next plot
        this.fadeOutAndTransition();
}


    // Record final thought scores to determine the ending
    private recordFinalThoughtScores(): void {
        // Determine the dominant thought type
        let dominantType = ThoughtType.SAFE; // Default
        let highestScore = this.thoughtsSelected[ThoughtType.SAFE];

        if (this.thoughtsSelected[ThoughtType.OVERACHIEVER] > highestScore) {
            dominantType = ThoughtType.OVERACHIEVER;
            highestScore = this.thoughtsSelected[ThoughtType.OVERACHIEVER];
        }

        if (this.thoughtsSelected[ThoughtType.FREEDOM] > highestScore) {
            dominantType = ThoughtType.FREEDOM;
        }

        // Record the dominant thought type
        this.gameStateManager.setFlag('dominant_thought', dominantType);
    }

    // Clean up when leaving the scene
    shutdown(): void {
        // Stop timers to prevent memory leaks
        if (this.backgroundTimer) this.backgroundTimer.destroy();
        if (this.thoughtTimer) this.thoughtTimer.destroy();

        // Clean up dialog manager before leaving the scene
        this.dialogManager.cleanup();

        // Call parent shutdown
        super.shutdown();
    }
}
