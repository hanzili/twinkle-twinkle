import { BaseScene, EnergyLevel } from '../BaseScene';
import { InteractionHandlers } from './InteractionHandlers';
import { TypingGame } from './TypingGame';
import { DialogSystem, DialogType } from './DialogSystem';
import { GameState } from './GameState';

export class Scene1_Office extends BaseScene {
    // Camera and background
    private camera: Phaser.Cameras.Scene2D.Camera;
    private background: Phaser.GameObjects.Image;
    
    // Interactive objects - using zones instead of images
    private computerZone: Phaser.GameObjects.Zone;
    private coffeeZone: Phaser.GameObjects.Zone;
    private plantZone: Phaser.GameObjects.Zone;
    private fishTankZone: Phaser.GameObjects.Zone;
    
    // Narration elements
    private narrationBox: Phaser.GameObjects.Image;
    private protagonist: Phaser.GameObjects.Image;
    
    // Components
    private interactions: InteractionHandlers;
    private typingGame: TypingGame;
    private dialog: DialogSystem;
    private gameState: GameState;
    
    // Scene state
    private initialDialogShown: boolean = false;
    
    constructor() {
        super('Scene1_Office');
    }
    
    preload() {
        // Scene1_Office specific assets can be loaded here if needed
        // Most assets are already loaded in the Preloader
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
        this.background = this.add.image(gameWidth/2, gameHeight/2, 'office_background');
        this.background.setDisplaySize(gameWidth, gameHeight);
        
        // Initialize game state
        this.gameState = new GameState(this);
        
        // Initialize narration components
        this.setupNarration();
        
        // Initialize components
        this.dialog = new DialogSystem(this);
        this.interactions = new InteractionHandlers(this, this.dialog, this.gameState);
        this.typingGame = new TypingGame(this, this.dialog, this.gameState);
        
        // Initialize custom cursor using BaseScene method
        this.initCursor();
        
        // Display the energy level (starting at LOW in the first scene)
        this.showEnergyLevel(EnergyLevel.LOW);
        
        // Create interactive objects with their actual sprites
        this.createInteractiveObjects();
        
        // Setup ambient office sounds - wrapped in try/catch
        try {
            this.sound.play('ambient_office', { loop: true, volume: 0.3 });
        } catch (e) {
            console.log('Ambient audio playback failed, continuing without sound');
        }
        
        // Show initial dialog
        this.showInitialDialog();
        
        // Add development shortcut button to go directly to Scene2_Skytrain
        // this.createDevelopmentButton();
    }
    
    private showInitialDialog(): void {
        // First dialog - protagonist dialog
        this.dialog.showDialog("Overtime again... It's already past 9 PM.", DialogType.PROTAGONIST, undefined, (choice) => {
            // Show second dialog immediately after first is dismissed
            setTimeout(() => {
                this.dialog.showDialog(
                    "This is so hard. There's still so much I'm not good at... How long will it take for me to finally get used to this job?", 
                    DialogType.PROTAGONIST
                );
                this.initialDialogShown = true;
            }, 100); // Small delay to ensure first dialog is fully dismissed
        });
    }
    
    private setupNarration() {
        // Get scene dimensions for center positioning
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const centerX = gameWidth / 2;
        
        // Position dialog boxes at the bottom third of the screen rather than center
        // This keeps them from obscuring the main gameplay area
        const dialogY = gameHeight - 450;

        console.log(centerX, dialogY);
        
        // Add narration box and protagonist image (initially hidden)
        this.narrationBox = this.add.image(centerX, dialogY, 'narration')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100); // Ensure dialog appears above other elements
            
        this.protagonist = this.add.image(centerX, dialogY, 'protagonist')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100); // Ensure dialog appears above other elements
    }
    
    private createInteractiveObjects() {
        // Create interactive zones on top of the background image
        // The background already has the visual elements, we just need to make them interactive
        
        // Central computer/monitor zone
        this.computerZone = this.add.zone(800, 320, 300, 250).setInteractive({ useHandCursor: true });
        this.computerZone.on('pointerdown', () => this.interactions.handleComputerInteraction());
        
        // Coffee cup zone
        this.coffeeZone = this.add.zone(660, 700, 100, 100).setInteractive({ useHandCursor: true });
        this.coffeeZone.on('pointerdown', () => this.interactions.handleCoffeeInteraction());
        
        // Plant zone
        this.plantZone = this.add.zone(350, 500, 150, 200).setInteractive({ useHandCursor: true });
        this.plantZone.on('pointerdown', () => this.interactions.handlePlantInteraction());
        
        // Fish tank zone
        this.fishTankZone = this.add.zone(1700, 600, 150, 200).setInteractive({ useHandCursor: true });
        this.fishTankZone.on('pointerdown', () => this.interactions.handleFishTankInteraction());
        
        // Visualize the zones during development (comment out for production)
        // this.visualizeZones([this.computerZone, this.coffeeZone, this.plantZone, this.fishTankZone]);
    }
    
    // Helper method to visualize interaction zones during development
    private visualizeZones(zones: Phaser.GameObjects.Zone[]) {
        zones.forEach(zone => {
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0xff0000);
            graphics.strokeRect(
                zone.x - zone.width / 2, 
                zone.y - zone.height / 2, 
                zone.width, 
                zone.height
            );
        });
    }
    
    public leaveOffice() {
        // Save player choices for use in later scenes
        localStorage.setItem('playerChoices', JSON.stringify(this.gameState.playerChoices));
        
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
                // Use the BaseScene's transitionToScene method
                this.transitionToScene('Scene2_Skytrain');
            }
        });
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
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => button.setFillStyle(0x555555))
        .on('pointerout', () => button.setFillStyle(0x333333))
        .on('pointerdown', () => {
            console.log('Development shortcut: Going directly to Scene2_Skytrain');
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
} 