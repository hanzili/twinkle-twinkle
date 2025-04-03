import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/background.png');
        
        // Preload cursor images for early availability
        this.load.image('cursor_default', 'assets/cursor/cursor.png');
        this.load.image('cursor_pointer', 'assets/cursor/cursor_focus.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
