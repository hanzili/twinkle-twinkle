import {BaseScene, EnergyLevel} from '../BaseScene';
import {InteractionHandlers} from './InteractionHandlers';
import {TypingGame} from '../../minigames/TypingGame';
import {DialogManager, DialogType} from '../../utils/DialogManager';
import {GameStateManager} from '../../utils/GameStateManager';

export class Scene1_Office extends BaseScene {
    // Camera and background
    private camera: Phaser.Cameras.Scene2D.Camera;
    private background: Phaser.GameObjects.Image;

    // Interactive objects - using zones instead of images
    private computerZone: Phaser.GameObjects.Zone;
    private coffeeZone: Phaser.GameObjects.Zone;
    private plantZone: Phaser.GameObjects.Zone;
    private fishTankZone: Phaser.GameObjects.Zone;

    // Narration elements (kept for backward compatibility with getSceneObjects)
    private narrationBox: Phaser.GameObjects.Image;
    private protagonist: Phaser.GameObjects.Image;

    // Components
    private interactions: InteractionHandlers;
    private typingGame: TypingGame;
    // Replace with centralized managers - make these public so they can be accessed
    public dialogManager: DialogManager;
    public gameStateManager: GameStateManager;

    // For the glowHints
    private glowHints: Phaser.GameObjects.Graphics[] = [];

    // For clearing the glowHints
    public clearGlowHints(): void {
        for (const glow of this.glowHints) {
            glow.destroy();
        }
        this.glowHints = [];
    }


    constructor() {
        super('Scene1_Office');

        // Initialize managers
        this.dialogManager = DialogManager.getInstance();
        this.gameStateManager = GameStateManager.getInstance();
    }


    create() {
        // Call parent create method to set up defaults including font override
        super.create();

        // Setup camera and background
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        // Add office background filling the entire screen
        // The background is the source of truth for item positions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        this.background = this.add.image(gameWidth / 2, gameHeight / 2, 'office_background');
        this.background.setDisplaySize(gameWidth, gameHeight);

        // Reset interactions for Scene1 to ensure objects can be interacted with
        this.gameStateManager.resetForScene1();

        // Initialize dialog manager with this scene
        this.dialogManager.init(this);

        // Set up placeholder narration elements for backward compatibility
        this.setupNarration();

        // Initialize components with new managers
        this.interactions = new InteractionHandlers(this, this.dialogManager, this.gameStateManager);
        this.typingGame = new TypingGame(this, this.dialogManager, this.gameStateManager);

        // Set the typing game reference in the interaction handlers
        this.interactions.setTypingGame(this.typingGame);

        // Initialize custom cursor using BaseScene method
        this.initCursor();

        // Display the energy level (starting at LOW in the first scene)
        this.showEnergyLevel(EnergyLevel.LOW);

        // Create interactive objects with their actual sprites
        this.createInteractiveObjects();

        // Setup ambient office sounds and background music - wrapped in try/catch
        try {
            this.sound.play('bgm1', {loop: true, volume: 0.3});
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        // Show initial dialog
        this.showInitialDialog();
    }

    private async showInitialDialog(): Promise<void> {
    await this.dialogManager.showDialog(
        "...It's just me in the office again.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "Overtime again... It's already past 9pm.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "My shoulders ache. My eyes feel dry. I’m so tired.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "When I was in school, I used to imagine the future. I thought once I started working, I’d become a cool, free adult.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "I thought I’d become the kind of successful grown-up every kid dreams about.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "Wearing nice clothes to work, meeting friends on the weekends, traveling the world when I had time off.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "I even pictured myself living in a high-rise by the sea, where I could look up after a long day and see the quiet ocean at night.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "But now I’m just sharing a cheap apartment far from the sea with roommates.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "I don’t even have the energy to dress up or go out anymore.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "The more I live, the farther I seem from the person I once imagined I’d be.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "If my younger self saw me now... I think she’d be disappointed.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "This is so hard. There’s still so much I’m not good at... How long will it take for me to finally get used to this job?",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "...",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "I just want to go home...",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "But I haven’t finished everything for today. I can’t leave yet.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "I should check my email and feed my fish before I leave.",
        DialogType.PROTAGONIST
    );

    await this.dialogManager.showDialog(
        "Explore her workspace following the icons, and help her finish the last few tasks.",
        DialogType.NARRATION
    );
}


    private setupNarration() {
        // This method now just initializes placeholder objects for backward compatibility
        // The actual dialog rendering is handled by DialogManager
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;
        const dialogY = gameHeight - 450;

        // Add narration box and protagonist image (initially hidden)
        // These are kept for backward compatibility with getSceneObjects
        this.narrationBox = this.add.image(centerX, dialogY, 'narration')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100);

        this.protagonist = this.add.image(centerX, dialogY, 'protagonist')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100);
    }

    private createInteractiveObjects() {
        // Create interactive zones on top of the background image
        // The background already has the visual elements, we just need to make them interactive

        // Central computer/monitor zone
        this.computerZone = this.add.zone(800, 320, 300, 250).setInteractive({useHandCursor: true});
        this.computerZone.on('pointerdown', () => {
            this.interactions.handleComputerInteraction();
        });
        this.addGlowHint(this.computerZone.x, this.computerZone.y);

        // Coffee cup zone
        this.coffeeZone = this.add.zone(660, 700, 100, 100).setInteractive({useHandCursor: true});
        this.coffeeZone.on('pointerdown', () => {
            this.interactions.handleCoffeeInteraction();
        });
        this.addGlowHint(this.coffeeZone.x, this.coffeeZone.y);

        // Plant zone
        this.plantZone = this.add.zone(350, 500, 150, 200).setInteractive({useHandCursor: true});
        this.plantZone.on('pointerdown', () => {
            this.interactions.handlePlantInteraction();
        });
        this.addGlowHint(this.plantZone.x, this.plantZone.y);

        // Fish tank zone
        this.fishTankZone = this.add.zone(1700, 600, 150, 200).setInteractive({useHandCursor: true});
        this.fishTankZone.on('pointerdown', () => {
            this.interactions.handleFishTankInteraction();
        });
        this.addGlowHint(this.fishTankZone.x, this.fishTankZone.y);
    }

    public leaveOffice() {
        // No need to save player choices directly - GameStateManager handles that

        // Create a black overlay for fade effect
        const fadeOverlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        ).setAlpha(0).setDepth(1000);

        // Simple fade to black transition
        this.tweens.add({
            targets: fadeOverlay,
            alpha: 1,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                // Increase energy level to MEDIUM for the next scene
                localStorage.setItem('playerEnergyLevel', EnergyLevel.MEDIUM);
                // Clean up dialog manager before transition
                this.dialogManager.cleanup();
                // Use the BaseScene's transitionToScene method
                this.transitionToScene('Scene2_Skytrain');
            }
        });
    }

    public recreateGlowHints(): void {
        this.clearGlowHints(); // optional: reset
        this.addGlowHint(this.computerZone.x, this.computerZone.y);
        this.addGlowHint(this.coffeeZone.x, this.coffeeZone.y);
        this.addGlowHint(this.plantZone.x, this.plantZone.y);
        this.addGlowHint(this.fishTankZone.x, this.fishTankZone.y);
    }


    // Add a development button for quick scene navigation during testing
    private createDevelopmentButton(): void {
        const button = this.add.rectangle(
            100, // Position in top-left area
            60,
            180,
            40,
            0x333333
        )
            .setDepth(1000) // Very high depth to appear above everything
            .setAlpha(0.8)
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => button.setFillStyle(0x555555))
            .on('pointerout', () => button.setFillStyle(0x333333))
            .on('pointerdown', () => {
                this.leaveOffice();
            });

        // Add text label to the button
        this.add.text(100, 60, "DEV: GO TO SCENE 2", {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(1000);
    }

    // Getters for components to access
    public getSceneObjects() {
        return {
            computerZone: this.computerZone,
            coffeeZone: this.coffeeZone,
            plantZone: this.plantZone,
            fishTankZone: this.fishTankZone,
            narrator: this.narrationBox,
            protagonist: this.protagonist,
            camera: this.camera,
            background: this.background
        };
    }

    // Clean up when leaving the scene
    shutdown(): void {
        // Clean up dialog manager before leaving the scene
        this.dialogManager.cleanup();
        super.shutdown();
    }

    /**
     * Adds a glowing circular hint at the specified position to draw user attention.
     */
    protected addGlowHint(x: number, y: number): void {
        const glow: Phaser.GameObjects.Graphics = this.add.graphics();

        glow.fillStyle(0xffd700, 1); // Golden yellow, fully opaque
        glow.fillCircle(0, 0, 12);   // Circle radius 12 for better visibility
        glow.setPosition(x, y);
        glow.setDepth(999); // Ensure it appears above all interactive zones

        // Set a brighter glowing effect
        glow.setAlpha(0.9);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        // Add a pulsing (breathing) animation effect
        this.tweens.add({
            targets: glow,
            alpha: {from: 0.4, to: 1},    // Pulse between dim and bright
            scale: {from: 1, to: 1.4},    // Scale up and down
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Save to array so we can remove them later
        this.glowHints.push(glow);

    }

}
