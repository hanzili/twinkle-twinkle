import { Scene } from 'phaser';

export class Scene2_Skytrain extends Scene {
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
        // Add placeholder background
        const placeholderColor = 0x222222;
        this.background = this.add.rectangle(512, 384, 1024, 768, placeholderColor) as any;
        
        // Add text indicating we've reached the next scene
        this.add.text(512, 300, 'Walking to the Skytrain', { 
            fontFamily: 'Arial', 
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
                fontFamily: 'Arial', 
                fontSize: '22px', 
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
        } catch (e) {
            console.error('Error retrieving player choices', e);
        }
        
        // Add text to continue
        this.continueText = this.add.text(512, 600, 'This scene is a placeholder.\nClick anywhere to return to the main menu.', { 
            fontFamily: 'Arial', 
            fontSize: '24px', 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add input handler to go back to main menu
        this.input.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
} 