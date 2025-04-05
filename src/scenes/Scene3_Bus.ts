import { BaseScene, EnergyLevel } from './BaseScene';

export class Scene3_Bus extends BaseScene {
    private background: Phaser.GameObjects.Image;
    private phoneRinging: Phaser.GameObjects.Image;
    private ignoreButton: Phaser.GameObjects.Container;
    private acceptButton: Phaser.GameObjects.Container;
    private postponeButton: Phaser.GameObjects.Container;

    constructor() {
        super('Scene3_Bus');
    }

    preload() {
        // Load scene-specific assets
        this.load.image('on_bus_bg', 'assets/scene3/on-bus-background.png');
        this.load.image('phone_ringing_bg', 'assets/scene3/phone-ringing-background.png');
        this.load.image('button', 'assets/scene3/button.png');
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
        
        // Step 1: Show on-bus background first
        this.background = this.add.image(centerX, centerY, 'on_bus_bg')
            .setDisplaySize(gameWidth, gameHeight)
            .setDepth(0);
        
        // Wait for 2 seconds before showing the phone ringing
        this.time.delayedCall(2000, () => {
            // Step 2: Show phone ringing background
            this.background.setVisible(false);
            this.phoneRinging = this.add.image(centerX, centerY, 'phone_ringing_bg')
                .setDisplaySize(gameWidth, gameHeight)
                .setDepth(0);
            
            // Wait for 2 seconds before showing the choices
            this.time.delayedCall(2000, () => {
                // Add choice buttons directly on the phone ringing background
                this.createChoiceButtons();
            }, [], this);
        }, [], this);
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
        // Store the player's choice
        const playerChoices = JSON.parse(localStorage.getItem('playerChoices') || '{}');
        playerChoices['phone_call'] = choice;
        localStorage.setItem('playerChoices', JSON.stringify(playerChoices));
        
        // Transition to the ending scene
        this.transitionToScene('Scene4_Ending');
    }
} 