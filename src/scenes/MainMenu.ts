import { GameObjects } from 'phaser';
import { BaseScene, EnergyLevel } from './BaseScene';

export class MainMenu extends BaseScene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    officeSceneButton: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // Call parent create method to set up defaults
        super.create();
        
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Office Escape', 
            this.getDefaultFontStyle({
                fontSize: '26px',
                stroke: '#000000', 
                strokeThickness: 8
            })
        ).setOrigin(0.5);

        // Initialize custom cursor using BaseScene method
        this.initCursor();
        
        // No energy bar on the main menu

        // Add button for Office Escape Scene 1
        this.officeSceneButton = this.add.text(512, 550, 'Start Office Escape', 
            this.getDefaultFontStyle({
                fontSize: '18px',
                backgroundColor: '#550000',
                padding: { x: 20, y: 10 }
            })
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.officeSceneButton.setBackgroundColor('#770000'))
        .on('pointerout', () => this.officeSceneButton.setBackgroundColor('#550000'))
        .on('pointerdown', () => {
            // Reset the player's energy level when starting a new game
            localStorage.setItem('playerEnergyLevel', EnergyLevel.LOW);
            
            // Use the BaseScene's transitionToScene method
            this.transitionToScene('Scene1_Office');
        });
    }
}
