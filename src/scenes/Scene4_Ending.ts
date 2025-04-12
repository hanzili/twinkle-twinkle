import {BaseScene} from './BaseScene';
import {GameStateManager, Ending} from '../utils/GameStateManager';
import {DialogManager, DialogType} from '../utils/DialogManager';

export class Scene4_Ending extends BaseScene {
    private gameStateManager: GameStateManager;
    private dialogManager: DialogManager;
    private background: Phaser.GameObjects.Image;
    private restartButton: Phaser.GameObjects.Container;

    // Dialog elements
    private narrationBox: Phaser.GameObjects.Image;
    private protagonist: Phaser.GameObjects.Image;
    private dialogText: Phaser.GameObjects.Text;

    constructor() {
        super('Scene4_Ending');
        this.gameStateManager = GameStateManager.getInstance();
        this.dialogManager = DialogManager.getInstance();
    }

    preload() {
        // Load ending-specific background images
        this.load.image('escape_ending_bg', 'assets/ending/escape-ending.png');
        this.load.image('fun_ending_bg', 'assets/ending/fun-ending.png');
        this.load.image('overachiever_ending_bg', 'assets/ending/overachiever-ending.png');
        this.load.image('default_ending_bg', 'assets/office_background.png'); // Fallback background
        this.load.image('button', 'assets/scene3/button.png');

        // Load dialog assets if not already loaded
        if (!this.textures.exists('narration')) {
            this.load.image('narration', 'assets/dialog/narration.png');
        }
        if (!this.textures.exists('protagonist')) {
            this.load.image('protagonist', 'assets/dialog/protagonist.png');
        }
    }

    create() {
        // Call parent create method to set up defaults including font override
        super.create();

        // Play the background music
        this.sound.play('bgm2', {loop: true, volume: 0.3});

        // Setup dimensions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        // Initialize dialog manager with this scene
        this.dialogManager.init(this);

        // Determine the ending based on player choices
        const ending = this.gameStateManager.determineEnding();

        // Add background based on ending type
        this.background = this.add.image(centerX, centerY, this.getEndingBackground(ending))
            .setDisplaySize(gameWidth, gameHeight)
            .setDepth(0);

        // Initialize custom cursor
        this.initCursor();

        // Set up dialog system
        this.setupDialog();

        // Show ending dialog
        this.showEndingDialog(ending);
    }

    private setupDialog() {
        // Get scene dimensions for center positioning
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;

        // Position dialog boxes at the bottom third of the screen
        const dialogY = gameHeight - 250;

        // Add narration box and protagonist image (initially hidden)
        this.narrationBox = this.add.image(centerX, dialogY - 200, 'narration')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100); // Ensure dialog appears above other elements

        this.protagonist = this.add.image(centerX, dialogY - 200, 'protagonist')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100); // Ensure dialog appears above other elements

        // Add text field for dialog
        this.dialogText = this.add.text(centerX, dialogY + 50, '', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#000000',
            align: 'center',
            wordWrap: {width: 1500}
        })
            .setOrigin(0.5)
            .setDepth(101)
            .setVisible(false);
    }

    private async showEndingDialog(ending: Ending): Promise<void> {
        await this.getEndingDescription(ending); // ✅ 内部会自己 showDialogSequence

        // After dialog is dismissed, show the restart button
        this.createRestartButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100
        );
    }

    private getEndingBackground(ending: Ending): string {
        switch (ending) {
            case Ending.CAREFREE:
                return 'escape_ending_bg';
            case Ending.BURNOUT:
                return 'fun_ending_bg';
            case Ending.WORKAHOLIC:
                return 'overachiever_ending_bg';
            case Ending.BALANCED:
            default:
                return 'default_ending_bg';
        }
    }

    private getEndingTitle(ending: Ending): string {
        switch (ending) {
            case Ending.BALANCED:
                return "The Balanced Life";
            case Ending.WORKAHOLIC:
                return "The Workaholic";
            case Ending.CAREFREE:
                return "The Free Spirit";
            case Ending.BURNOUT:
                return "The Burnout";
            default:
                return "The End";
        }
    }

    private async getEndingDescription(ending: Ending): Promise<string> {
        switch (ending) {
            case Ending.BALANCED:
                await this.dialogManager.showDialog("The Balanced Life", DialogType.NARRATION);

                await this.dialogManager.showDialogSequence([
                    {text: "You made it home.", type: DialogType.NARRATION},
                    {
                        text: "You changed into your pajamas. Played with your cat.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You realized—your cat, your home... these are your safe harbors.",
                        type: DialogType.NARRATION
                    },

                    // 🎵 Optional: play heartbeat sound here
                    {text: "Your heartbeat is steady right now.", type: DialogType.NARRATION},
                    {text: "You smiled, just a little.", type: DialogType.NARRATION},
                    {
                        text: "You stared into your cat’s eyes. They sparkled.",
                        type: DialogType.NARRATION
                    },
                    {text: "Twinkle twinkle.", type: DialogType.NARRATION}
                ]);
                return "";
                break;

            case Ending.WORKAHOLIC:
                await this.dialogManager.showDialog("The Workaholic", DialogType.NARRATION);

                await this.dialogManager.showDialogSequence([
                    {text: "You made it home.", type: DialogType.NARRATION},
                    {text: "But you opened your laptop again.", type: DialogType.NARRATION},
                    {
                        text: "You worked until midnight to finish the report.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You forgot about your urge to escape. You started working harder and harder.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "The stars on your performance chart kept rising. They twinkled at the very top.",
                        type: DialogType.NARRATION
                    },

                    // 🎵 Optional: play heartbeat sound here
                    {
                        text: "But your heartbeat got faster from all the late nights.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "Sometimes, you wonder if your health is okay.",
                        type: DialogType.NARRATION
                    }
                ]);
                return "";
                break;
            case Ending.CAREFREE:
                await this.dialogManager.showDialog("The Free Spirit", DialogType.NARRATION);

                try {
                    this.sound.play('ocean');
                } catch (e) {
                    console.warn('ocean sound missing');
                }
                await this.dialogManager.showDialogSequence([
                    {
                        text: "You walked alone to the sea late at night.",
                        type: DialogType.NARRATION
                    },
                    {text: "The waves crashed softly in the dark.", type: DialogType.NARRATION},
                    {
                        text: "Everything was so quiet it almost scared you.",
                        type: DialogType.NARRATION
                    },

                    {
                        text: "You looked up—and saw a high-rise by the sea, the exact one from your childhood dreams.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "Warm lights glowed through the grand windows. For a second... you almost cried.",
                        type: DialogType.NARRATION
                    },

                    {
                        text: "Then you remembered the little fish you keep in the office.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You think... maybe you’ll go back, just to bring it home.",
                        type: DialogType.NARRATION
                    },
                    {text: "Let it swim in a bigger tank. Freely.", type: DialogType.PROTAGONIST},

                    // 🎵 Optional: play heartbeat sound here
                    {text: "You don’t know what’s next.", type: DialogType.NARRATION},
                    {
                        text: "But you hear your heartbeat, steady and alive.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You’re breathing. You’re alive. And for now, you’re free.",
                        type: DialogType.NARRATION
                    },

                    {
                        text: "The stars above the shore twinkle, twinkle.",
                        type: DialogType.PROTAGONIST
                    }
                ]);
                return "";
                break;

            case Ending.BURNOUT:
                await this.dialogManager.showDialog("The Starfish Ending", DialogType.NARRATION);

                await this.dialogManager.showDialogSequence([
                    {
                        text: "You made a choice that went against your own heart. Your brain overheated.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You stopped thinking. Got off the train and broke into the aquarium.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You ran through the halls, stripping your clothes off.",
                        type: DialogType.NARRATION
                    },

                    // 🎵 Optional: play heartbeat sound here
                    {
                        text: "Your heart pounded wildly with excitement.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "You leapt into the starfish tank—and became one of them.",
                        type: DialogType.NARRATION
                    },
                    {
                        text: "There’s no difference now between you and the stars above.",
                        type: DialogType.NARRATION
                    },
                    {text: "You wave your limbs gently.", type: DialogType.NARRATION},
                    {text: "Twinkle twinkle", type: DialogType.PROTAGONIST}
                ]);
                return "";
                break;

            default:
                await this.dialogManager.showDialog(
                    "Your journey has come to an end. Your choices have shaped your destiny.",
                    DialogType.NARRATION
                );
                return "";
                break;
        }
    }

    private createRestartButton(x: number, y: number): void {
        // Create button image
        const buttonImg = this.add.image(0, 0, 'button').setScale(0.2);

        // Create text
        const buttonText = this.add.text(0, 0, "Play Again", {
            fontSize: '20px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // Create container with button image and text
        this.restartButton = this.add.container(x, y, [buttonImg, buttonText]);

        // Set size based on the button image for interaction
        this.restartButton.setSize(buttonImg.displayWidth, buttonImg.displayHeight);

        // Make interactive
        this.restartButton.setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                // Reset game state
                this.gameStateManager.resetState();

                // Clean up dialog manager
                this.dialogManager.cleanup();

                // Return to main menu
                this.transitionToScene('MainMenu');
            });
    }

    // Clean up when leaving the scene
    shutdown(): void {
        // Clean up dialog manager before leaving
        this.dialogManager.cleanup();

        // Call parent shutdown
        super.shutdown();
    }
}
