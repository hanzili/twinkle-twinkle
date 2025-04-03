import { BaseScene, EnergyLevel } from './BaseScene';

export class Scene3_Bus extends BaseScene {
    private background: Phaser.GameObjects.Image;
    private continueText: Phaser.GameObjects.Text;

    constructor() {
        super('Scene3_Bus');
    }

    preload() {
        // Load any bus-specific assets
        this.load.image('bus_bg', 'assets/skytrain_background.png'); // Placeholder, using skytrain bg for now
    }

    create() {
        // Call parent create method to set up defaults including font override
        super.create();
        
        // Add placeholder background
        const placeholderColor = 0x333333; // Slightly different color from previous scene
        this.background = this.add.rectangle(512, 384, 1024, 768, placeholderColor) as any;
        
        // Initialize custom cursor
        this.initCursor();
        
        // Display energy level (HIGH in this scene)
        this.showEnergyLevel(EnergyLevel.HIGH);
        
        // Add scene title
        this.add.text(512, 300, 'On the Bus', { 
            fontSize: '36px', 
            color: '#ffffff' 
        }).setOrigin(0.5);
        
        // Add scene description
        this.add.text(512, 400, 'Time on the phone, protagonist almost falls asleep.\nA phone call comes in and wakes the protagonist up.', { 
            fontSize: '22px', 
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player choices
        this.add.text(512, 480, 'What do you want to do?', { 
            fontSize: '26px', 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Choice buttons
        const blockButton = this.add.text(512, 540, 'Block the call', { 
            fontSize: '20px', 
            color: '#ffff00',
            backgroundColor: '#550000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => blockButton.setBackgroundColor('#770000'))
        .on('pointerout', () => blockButton.setBackgroundColor('#550000'))
        .on('pointerdown', () => {
            this.proceedToEnding('block');
        });
        
        const answerButton = this.add.text(512, 600, 'Answer the call', { 
            fontSize: '20px', 
            color: '#ffff00',
            backgroundColor: '#550000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => answerButton.setBackgroundColor('#770000'))
        .on('pointerout', () => answerButton.setBackgroundColor('#550000'))
        .on('pointerdown', () => {
            this.proceedToEnding('answer');
        });
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