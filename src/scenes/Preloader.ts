import { Scene } from 'phaser';

export class Preloader extends Scene
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

        // Original assets
        this.load.image('logo', 'logo.png');
        this.load.image('background', 'background.png');
        
        // Office Escape game assets
        this.load.image('office_bg', 'office_background.png');
        this.load.image('computer', 'computer.png');
        this.load.image('iced_coffee', 'iced_coffee.png');
        this.load.image('plant', 'potted_plant.png');
        this.load.image('eye_mask', 'eye_mask.png');
        this.load.image('water_bottle', 'water_bottle.png');
        this.load.image('fishtank', 'fishtank.png');
        this.load.image('fish', 'fish.png');
        this.load.image('goji_berries', 'goji_berries.png');
        this.load.image('skytrain_bg', 'skytrain_background.png');
        
        // Animation spritesheets
        this.load.spritesheet('fish_animation', 'fish_animation.png', { 
            frameWidth: 64, 
            frameHeight: 32 
        });
        
        // Sound effects
        this.load.audio('click', 'click.mp3');
        this.load.audio('type', 'typing.mp3');
        this.load.audio('ambient_office', 'ambient_office.mp3');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
