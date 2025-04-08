import { GameObjects } from 'phaser';
import { BaseScene, EnergyLevel } from './BaseScene';

export class MainMenu extends BaseScene
{
    private currentFrame: number = 1;
    private maxFrames: number = 5;
    private animationSpeed: number = 350; // faster animation (milliseconds between frames)
    private titleScreen: GameObjects.Image;
    private startButton: GameObjects.Image;
    private animationTimer: Phaser.Time.TimerEvent;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // Call parent create method to set up defaults
        super.create();

        // Set background to black
        this.cameras.main.setBackgroundColor('#000000');

        // Play background music
        try {
            this.sound.play('bgm1', { loop: true, volume: 0.5 });
        } catch (e) {
            console.log('Background music playback failed, continuing without music');
        }

        // Create initial title screen image centered in screen
        this.titleScreen = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'start-game-1'
        );

        // Calculate scale to fit screen while maintaining aspect ratio
        const screenRatio = this.cameras.main.width / this.cameras.main.height;
        const imageRatio = this.titleScreen.width / this.titleScreen.height;

        if (screenRatio > imageRatio) {
            // Screen is wider than the image
            this.titleScreen.setScale(
                this.cameras.main.height / this.titleScreen.height * 0.9
            );
        } else {
            // Screen is taller than the image
            this.titleScreen.setScale(
                this.cameras.main.width / this.titleScreen.width * 0.9
            );
        }

        // Start the animation sequence
        this.startTitleAnimation();

        // Add the start button positioned at the bottom right of the screen
        // Position it with some margin from the edges
        const buttonX = this.cameras.main.width - 600; // Right margin
        const buttonY = this.cameras.main.height - 150; // Bottom margin

        this.startButton = this.add.image(
            buttonX,
            buttonY,
            'start-game-button'
        );

        // Make the button much smaller
        this.startButton.setScale(0.15); // Reduce to 15% of original size

        // Add "START" text on the button with smaller font size
        const startText = this.add.text(
            buttonX,
            buttonY,
            'START',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Group the button and text for hover effects
        const buttonGroup = [this.startButton, startText];

        // Make the button interactive with hover effects
        this.startButton
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.startButton.setScale(0.17); // Slightly larger on hover
                startText.setScale(1.1); // Scale up the text too
                // Add a slight bobbing animation on hover
                this.tweens.add({
                    targets: buttonGroup,
                    y: '-=2', // Smaller bobbing effect for smaller button
                    duration: 500,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            })
            .on('pointerout', () => {
                this.startButton.setScale(0.15); // Back to normal size
                startText.setScale(1.0); // Reset text scale
                // Stop all tweens affecting the button group
                this.tweens.killTweensOf(buttonGroup);
                // Reset positions
                this.startButton.y = buttonY;
                startText.y = buttonY;
            })
            .on('pointerdown', () => {
                // Stop the animation timer
                if (this.animationTimer) {
                    this.animationTimer.remove();
                }

                // Play click sound if available
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.log('Sound play failed, continuing without sound');
                }

                // Zoom in effect on the button and text
                this.tweens.add({
                    targets: buttonGroup,
                    scale: '*=1.3', // Smaller zoom effect for the smaller button
                    alpha: 0,
                    duration: 250, // Faster animation
                    ease: 'Sine.easeOut'
                });

                // Fade out effect
                this.cameras.main.fade(800, 0, 0, 0, false, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        // Reset the player's energy level when starting a new game
                        localStorage.setItem('playerEnergyLevel', EnergyLevel.LOW);

                        // Use the BaseScene's transitionToScene method
                        this.transitionToScene('Scene1_Office');
                    }
                });
            });

        // Initialize custom cursor using BaseScene method
        this.initCursor();
    }

    /**
     * Start the title screen animation sequence
     */
    private startTitleAnimation(): void {
        // Set up the animation timer to cycle through frames
        this.animationTimer = this.time.addEvent({
            delay: this.animationSpeed,
            callback: this.updateTitleFrame,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Update the title screen to the next frame in the animation sequence
     */
    private updateTitleFrame(): void {
        // Increment frame counter
        this.currentFrame++;

        // Loop back to first frame if we've shown all frames
        if (this.currentFrame > this.maxFrames) {
            this.currentFrame = 1;
        }

        // Update the image texture
        this.titleScreen.setTexture('start-game-' + this.currentFrame);
    }

    /**
     * Clean up resources when scene is shut down
     */
    shutdown(): void {
        // Stop the animation timer
        if (this.animationTimer) {
            this.animationTimer.remove();
        }

        // Kill all tweens
        this.tweens.killAll();

        // Call parent shutdown to clean up cursor and other resources
        super.shutdown();
    }
}
