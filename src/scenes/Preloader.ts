import { Scene } from 'phaser';
import { BaseScene } from './BaseScene';

export class Preloader extends BaseScene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game
        this.load.setPath('assets');
        
        // Load new start game screens
        this.load.image('start-game-1', 'start-game/start-game-1.png');
        this.load.image('start-game-2', 'start-game/start-game-2.png');
        this.load.image('start-game-3', 'start-game/start-game-3.png');
        this.load.image('start-game-4', 'start-game/start-game-4.png');
        this.load.image('start-game-5', 'start-game/start-game-5.png');
        this.load.image('start-game-button', 'start-game/start-game-button.png');
        
        // New office scene assets
        this.load.image('office_background', 'scene1/background.png');
        this.load.image('coffee', 'scene1/coffee.png');
        this.load.image('fish-tank', 'scene1/fish-tank.png');
        this.load.image('plant', 'scene1/plant.png'); 
        this.load.image('mini-game', 'scene1/mini-game.png');
        this.load.image('typing-background', 'scene1/typing-background.png');
        this.load.image('narration', 'dialog/narration.png');
        this.load.image('protagonist', 'dialog/protagonist.png');
        
        // Font preloading
        // WebFont.load is not built into Phaser, but we can make sure our custom font is loaded
        // through the CSS and check it here
        const fontLoadedCheck = () => {
            if (document.fonts && document.fonts.check('12px PressStart2P')) {
                console.log('PressStart2P font confirmed loaded by Preloader');
            } else {
                console.warn('PressStart2P font not detected, game text may use fallback fonts');
            }
        };
        
        // Check font after a brief delay to allow for CSS loading
        this.time.delayedCall(500, fontLoadedCheck);
        
        // Energy level icons
        this.load.image('energy-empty', 'energy-bar/energy-empty.png');
        this.load.image('energy-low', 'energy-bar/energy-low.png');
        this.load.image('energy-medium', 'energy-bar/energy-medium.png');
        this.load.image('energy-high', 'energy-bar/energy-high.png');
    
        
        // Sound effects
        this.load.audio('click', 'click.mp3');
        this.load.audio('type', 'typing.mp3');
        this.load.audio('ambient_office', 'ambient_office.mp3');
    }

    create ()
    {
        // Call parent create method to set up defaults including font override
        super.create();
        
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
