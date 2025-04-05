import { BaseScene } from './BaseScene';
import { GameStateManager, Ending } from '../utils/GameStateManager';

// Dialog type enum similar to other scenes
enum DialogType {
    NARRATION,
    PROTAGONIST
}

export class Scene4_Ending extends BaseScene {
    private gameState: GameStateManager;
    private background: Phaser.GameObjects.Image;
    private restartButton: Phaser.GameObjects.Container;
    
    // Dialog elements
    private narrationBox: Phaser.GameObjects.Image;
    private protagonist: Phaser.GameObjects.Image;
    private dialogText: Phaser.GameObjects.Text;

    constructor() {
        super('Scene4_Ending');
        this.gameState = GameStateManager.getInstance();
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
        
        // Setup dimensions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // Determine the ending based on player choices
        const ending = this.gameState.determineEnding();
        
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
        
        // The restart button will be created after the dialog is dismissed
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
            wordWrap: { width: 1500 }
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
    
    private showEndingDialog(ending: Ending): void {
        // Combine the title and description into a single dialog
        const combinedText = `${this.getEndingTitle(ending)}\n\n${this.getEndingDescription(ending)}`;
        
        // Show combined text in a single dialog, and show the restart button when dialog is dismissed
        this.showDialog(
            combinedText,
            DialogType.NARRATION,
            () => {
                // After dialog is dismissed, show the restart button
                this.createRestartButton(
                    this.cameras.main.width / 2, 
                    this.cameras.main.height - 100
                );
            }
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
    
    private getEndingDescription(ending: Ending): string {
        switch (ending) {
            case Ending.BALANCED:
                return "You've found a healthy balance between work and personal life. Your career progresses steadily while you maintain good mental health.";
            case Ending.WORKAHOLIC:
                return "You've prioritized work above all else. Your career advances rapidly, but at what cost to your personal life?";
            case Ending.CAREFREE:
                return "You've chosen freedom and personal fulfillment over professional expectations. Life is enjoyable, though your career trajectory is uncertain.";
            case Ending.BURNOUT:
                return "You've pushed yourself too hard without proper self-care. The stress has caught up with you, leading to burnout.";
            default:
                return "Your journey has come to an end. Your choices have shaped your destiny.";
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
        this.restartButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Reset game state
                this.gameState.resetState();
                
                // Return to main menu
                this.transitionToScene('MainMenu');
            });
    }
} 