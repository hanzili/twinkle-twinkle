import { BaseScene, EnergyLevel } from './BaseScene';
import { GameStateManager, Ending } from '../utils/GameStateManager';

// Dialog type enum similar to Scene1_Office
enum DialogType {
    NARRATION,
    PROTAGONIST
}

export class Scene3_Bus extends BaseScene {
    private background: Phaser.GameObjects.Image;
    private phoneRinging: Phaser.GameObjects.Image;
    private ignoreButton: Phaser.GameObjects.Container;
    private acceptButton: Phaser.GameObjects.Container;
    private postponeButton: Phaser.GameObjects.Container;
    private gameState: GameStateManager;
    
    // Narration elements
    private narrationBox: Phaser.GameObjects.Image;
    private protagonist: Phaser.GameObjects.Image;
    private dialogText: Phaser.GameObjects.Text;
    
    constructor() {
        super('Scene3_Bus');
        this.gameState = GameStateManager.getInstance();
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
        
        // Initialize custom cursor
        this.initCursor();
        
        // Display energy level (HIGH in this scene)
        this.showEnergyLevel(EnergyLevel.HIGH);
        
        // Setup narration elements
        this.setupNarration();
        
        // Step 1: Show on-bus background first
        this.background = this.add.image(centerX, centerY, 'on_bus_bg')
            .setDisplaySize(gameWidth, gameHeight)
            .setDepth(0);
        
        // Show initial dialog
        this.showDialog("Finally got on the SkyTrain... Almost home now.", DialogType.PROTAGONIST, () => {
            this.checkDialogAndContinue();
        });
    }
    
    private setupNarration() {
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
            wordWrap: { width: 900 }
        })
        .setOrigin(0.5)
        .setDepth(101)
        .setVisible(false);
    }
    
    private showDialog(text: string, type: DialogType, callback?: () => void): void {
        // First hide any existing dialog elements
        this.hideDialog();
        
        // Show appropriate dialog based on type
        if (type === DialogType.NARRATION) {
            this.narrationBox.setVisible(true);
        } else {
            this.protagonist.setVisible(true);
        }
        
        // Update and show text
        this.dialogText.setText(text);
        this.dialogText.setVisible(true);
        
        // Create a click handler to dismiss the dialog
        this.input.once('pointerdown', () => {
            this.hideDialog();
            if (callback) {
                callback();
            }
        });
    }
    
    private hideDialog(): void {
        // Hide dialog elements
        this.narrationBox.setVisible(false);
        this.protagonist.setVisible(false);
        this.dialogText.setVisible(false);
    }
    
    private checkDialogAndContinue(): void {
        // Check if player completed report in previous scene
        const choices = this.gameState.getAllChoices();
        const reportSkipped = choices['computer'] === 'skipped';
        
        if (reportSkipped) {
            // Show additional dialog about not finishing report
            this.showDialog(
                "Hope it's okay I didn't finish that report... I'll just go in early tomorrow to get it done.",
                DialogType.PROTAGONIST,
                () => {
                    this.continueToPhoneRinging();
                }
            );
        } else {
            // Continue directly to phone ringing
            this.continueToPhoneRinging();
        }
    }
    
    private continueToPhoneRinging(): void {
        // Show dialog about phone call
        this.showDialog(
            "Oh no, I hope it's not a call from work... Let me check.",
            DialogType.PROTAGONIST,
            () => {
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
                this.showDialog(
                    "What will you do with this call?",
                    DialogType.NARRATION,
                    () => {
                        this.createChoiceButtons();
                    }
                );
            }
        );
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
        this.gameState.recordChoice('phone_call', choice, scoreUpdates);
        
        // Continue to the ending scene
        this.transitionToScene('Scene4_Ending');
    }
} 