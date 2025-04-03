import { BaseScene, EnergyLevel } from './BaseScene';

export class Scene4_Ending extends BaseScene {
    private background: Phaser.GameObjects.Image;
    private endingTitle: Phaser.GameObjects.Text;
    private endingDescription: Phaser.GameObjects.Text;
    private mainMenuButton: Phaser.GameObjects.Text;

    constructor() {
        super('Scene4_Ending');
    }

    preload() {
        // Load any ending-specific assets
        this.load.image('ending_bg', 'assets/background.png'); // Placeholder, reusing main background
    }

    create() {
        // Call parent create method to set up defaults including font override
        super.create();
        
        const placeholderColor = 0x111111; // Dark color for ending
        this.background = this.add.rectangle(512, 384, 1024, 768, placeholderColor) as any;
        
        // Initialize custom cursor
        this.initCursor();
        
        // Display energy level (fully charged in the ending)
        this.showEnergyLevel(EnergyLevel.HIGH);
        
        // Determine which ending to show based on player choices
        const playerChoices = JSON.parse(localStorage.getItem('playerChoices') || '{}');
        const ending = this.determineEnding(playerChoices);
        
        // Display ending title
        this.endingTitle = this.add.text(512, 200, ending.title, { 
            fontSize: '42px', 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        // Display ending description
        this.endingDescription = this.add.text(512, 350, ending.description, { 
            fontSize: '24px', 
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);
        
        // Display player's journey
        this.add.text(512, 500, 'Your Journey Summary:', { 
            fontSize: '20px', 
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Format and display the choices
        const choicesText = Object.entries(playerChoices)
            .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`)
            .join('\n');
        
        this.add.text(512, 560, choicesText, { 
            fontSize: '18px', 
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add button to return to main menu
        this.mainMenuButton = this.add.text(512, 680, 'Return to Main Menu', { 
            fontSize: '24px', 
            color: '#ffffff',
            backgroundColor: '#550000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.mainMenuButton.setBackgroundColor('#770000'))
        .on('pointerout', () => this.mainMenuButton.setBackgroundColor('#550000'))
        .on('pointerdown', () => {
            // Reset player state
            localStorage.removeItem('playerChoices');
            localStorage.removeItem('playerEnergyLevel');
            
            // Return to the main menu
            this.transitionToScene('MainMenu');
        });
    }
    
    private determineEnding(choices: Record<string, string>): { title: string, description: string } {
        // Count choices leading to each ending type
        let safeCount = 0;
        let overachieverCount = 0;
        let freedomCount = 0;
        let funnyCount = 0;
        
        // Process fish tank choice
        if (choices['fish_thought'] === 'safe') safeCount++;
        else if (choices['fish_thought'] === 'overachiever') overachieverCount++;
        else if (choices['fish_thought'] === 'freedom') freedomCount++;
        else if (choices['fish_thought'] === 'funny') funnyCount++;
        
        // Process computer report choice
        if (choices['computer'] === 'completed') overachieverCount++;
        else if (choices['computer'] === 'skipped') freedomCount++;
        
        // Process phone call choice
        if (choices['phone_call'] === 'block') freedomCount++;
        else if (choices['phone_call'] === 'answer') overachieverCount++;
        
        // Determine ending based on highest count (with tiebreakers)
        const counts = {
            safe: safeCount,
            overachiever: overachieverCount,
            freedom: freedomCount,
            funny: funnyCount
        };
        
        const maxCount = Math.max(...Object.values(counts));
        const ending = Object.keys(counts).find(key => counts[key as keyof typeof counts] === maxCount) || 'safe';
        
        // Return ending details
        switch (ending) {
            case 'overachiever':
                return {
                    title: 'The Overachiever Ending',
                    description: 'Kept grinding like a corporate mule; your KPI is a star.\n\nYou return to the office early the next day, report finished, ready for more work. Looking at the fish tank, you realize you are not so different from the fish - contained, but purposeful.'
                };
            case 'freedom':
                return {
                    title: 'The Freedom Ending',
                    description: 'You chose freedom.\n\nYou went to the beach, watched the ocean and the stars at night. Birds are visible in the scene. "I wish I knew where the birds were going..."'
                };
            case 'funny':
                return {
                    title: 'The Funny Ending',
                    description: 'You embraced your true nature...\n\nYou started taking off clothes, running to the zoo. You now live as a starfish at the aquarium, finally free from office life.'
                };
            case 'safe':
            default:
                return {
                    title: 'The Safe Harbor Ending',
                    description: 'You returned to your safe harbor.\n\nYou went home to rest; watched the new episode of The Fall Bikaru Alived and saw the stars.'
                };
        }
    }
} 