import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
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
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Office Escape', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Add button for Office Escape Scene 1
        this.officeSceneButton = this.add.text(512, 550, 'Start Office Escape', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
            backgroundColor: '#550000',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.officeSceneButton.setBackgroundColor('#770000'))
        .on('pointerout', () => this.officeSceneButton.setBackgroundColor('#550000'))
        .on('pointerdown', () => {
            this.scene.start('Scene1_Office');
        });
    }
}
