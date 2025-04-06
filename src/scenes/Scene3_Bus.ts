import { BaseScene, EnergyLevel } from './BaseScene';
import { GameStateManager, Ending } from '../utils/GameStateManager';
import { DialogManager, DialogType } from '../utils/DialogManager';

export class Scene3_Bus extends BaseScene {
    private background: Phaser.GameObjects.Image;
    private phoneRinging: Phaser.GameObjects.Image;
    private ignoreButton: Phaser.GameObjects.Container;
    private acceptButton: Phaser.GameObjects.Container;
    private postponeButton: Phaser.GameObjects.Container;
    
    // Use centralized managers
    private gameStateManager: GameStateManager;
    private dialogManager: DialogManager;
    
    constructor() {
        super('Scene3_Bus');
        this.gameStateManager = GameStateManager.getInstance();
        this.dialogManager = DialogManager.getInstance();
    }

    preload() {
        // Load scene-specific assets
        this.load.image('on_bus_bg', 'assets/scene3/on-bus-background.png');
        this.load.image('phone_ringing_bg', 'assets/scene3/phone-ringing-background.png');
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
        
        // Setup dimensions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // Initialize dialog manager with this scene
        this.dialogManager.init(this);
        
        // Initialize custom cursor
        this.initCursor();
        
        // Display energy level (HIGH in this scene)
        this.showEnergyLevel(EnergyLevel.HIGH);
        
        // Step 1: Show on-bus background first
        this.background = this.add.image(centerX, centerY, 'on_bus_bg')
            .setDisplaySize(gameWidth, gameHeight)
            .setDepth(0);
        
        // Show initial dialog and continue to next step
        this.showInitialDialog();
    }
    
    private async showInitialDialog(): Promise<void> {
        // Show the first dialog
        await this.dialogManager.showDialog(
            "Finally got on the SkyTrain... Almost home now.",
            DialogType.PROTAGONIST
        );
        
        // Continue to next step
        this.checkDialogAndContinue();
    }
    
    private async checkDialogAndContinue(): Promise<void> {
        // Check if player completed report in previous scene
        const reportSkipped = !this.gameStateManager.hasCompletedTypingGame();
        
        if (reportSkipped) {
            // Show additional dialog about not finishing report
            await this.dialogManager.showDialog(
                "Hope it's okay I didn't finish that report... I'll just go in early tomorrow to get it done.",
                DialogType.PROTAGONIST
            );
        }
        
        // Continue to phone ringing
        this.continueToPhoneRinging();
    }
    
    private async continueToPhoneRinging(): Promise<void> {
        // Show dialog about phone call
        await this.dialogManager.showDialog(
            "Oh no, I hope it's not a call from work... Let me check.",
            DialogType.PROTAGONIST
        );
        
        // Step 2: Show phone ringing background
        this.background.setVisible(false);
        this.phoneRinging = this.add.image(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'phone_ringing_bg'
        )
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(0);
        
        // Show narration about what to do with the call
        await this.dialogManager.showDialog(
            "What will you do with this call?",
            DialogType.NARRATION
        );
        
        // Show choice buttons
        this.createChoiceButtons();
    }
    
    private createChoiceButtons(): void {
        // Get the right side position (about 80% of screen width)
        const rightSideX = this.cameras.main.width * 0.85;
        
        // Position buttons in a vertical column on the right side of the screen
        this.createButton(rightSideX, this.cameras.main.height * 0.55, 'Ignore the call', 'ignore');
        this.createButton(rightSideX, this.cameras.main.height * 0.65, 'Answer and accept the task', 'accept');
        this.createButton(rightSideX, this.cameras.main.height * 0.75, 'Answer and ask to finish the rest tomorrow', 'postpone');
    }
    
    private createButton(x: number, y: number, text: string, choice: string): Phaser.GameObjects.Container {
        // Create button image and scale it down
        const buttonImg = this.add.image(0, 0, 'button').setScale(0.10);
        
        // Create text with smaller font size to fit the scaled button
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '16px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: buttonImg.displayWidth - 20 }
        }).setOrigin(0.5);
        
        // Create container with button image and text
        const container = this.add.container(x, y, [buttonImg, buttonText]);
        
        // Set size based on the scaled button image for interaction
        container.setSize(buttonImg.displayWidth, buttonImg.displayHeight);
        
        // Make interactive
        container.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.proceedToEnding(choice);
            });
        
        return container;
    }
    
    private proceedToEnding(choice: string): void {
        // Define score updates based on the choice
        const scoreUpdates: Partial<Record<Ending, number>> = {};
        
        switch(choice) {
            case 'ignore':
                // Ignoring work increases carefree score but might lead to burnout
                scoreUpdates[Ending.CAREFREE] = 2;
                scoreUpdates[Ending.BURNOUT] = 1;
                break;
                
            case 'accept':
                // Accepting additional work increases workaholic score
                scoreUpdates[Ending.WORKAHOLIC] = 3;
                scoreUpdates[Ending.BURNOUT] = 1;
                break;
                
            case 'postpone':
                // Postponing work is a balanced approach
                scoreUpdates[Ending.BALANCED] = 3;
                break;
        }
        
        // Record the choice with the centralized game state manager
        this.gameStateManager.recordChoice('phone_call', choice, scoreUpdates);
        
        // Clean up dialog manager before transition
        this.dialogManager.cleanup();
        
        // Continue to the ending scene
        this.transitionToScene('Scene4_Ending');
    }
    
    // Clean up when leaving the scene
    shutdown(): void {
        // Clean up dialog manager before leaving
        this.dialogManager.cleanup();
        
        // Call parent shutdown
        super.shutdown();
    }
} 