import { BaseScene, EnergyLevel } from './BaseScene';

export class Scene2_Skytrain extends BaseScene {
    private background: Phaser.GameObjects.Image;
    private continueText: Phaser.GameObjects.Text;

    constructor() {
        super('Scene2_Skytrain');
    }

    preload() {
        // Load basic assets
        this.load.image('skytrain_bg', 'assets/skytrain_background.png');
    }

    create() {
        // Call parent create method to set up defaults including font override
        super.create();
        
        // Add placeholder background
        const placeholderColor = 0x222222;
        this.background = this.add.rectangle(512, 384, 1024, 768, placeholderColor) as any;
        
        // Initialize custom cursor using BaseScene method
        this.initCursor();
        
        // Display energy level (MEDIUM in this scene)
        this.showEnergyLevel(EnergyLevel.MEDIUM);
        
        // Add text indicating we've reached the next scene
        this.add.text(512, 300, 'Walking to the Skytrain', { 
            fontSize: '36px', 
            color: '#ffffff' 
        }).setOrigin(0.5);
        
        // Add information about player's choices from previous scene
        try {
            const playerChoices = JSON.parse(localStorage.getItem('playerChoices') || '{}');
            const choicesText = Object.keys(playerChoices).map(key => 
                `${key}: ${playerChoices[key]}`
            ).join('\n');
            
            this.add.text(512, 400, 'Your choices so far:\n' + choicesText, { 
                fontSize: '22px', 
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
        } catch (e) {
            console.error('Error retrieving player choices', e);
        }
        
        // Add text to continue
        this.continueText = this.add.text(512, 600, 'Click anywhere to continue to the Bus scene', { 
            fontSize: '24px', 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add input handler to go to the next scene
        this.input.on('pointerdown', () => {
            // Increase energy level for the next scene
            localStorage.setItem('playerEnergyLevel', EnergyLevel.HIGH);
            // Go to the Bus scene
            this.transitionToScene('Scene3_Bus');
        });
    }
} 