import { Scene } from 'phaser';
import { InteractionHandlers } from './InteractionHandlers';
import { TypingGame } from './TypingGame';
import { DialogSystem } from './DialogSystem';
import { GameState } from './GameState';

export class Scene1_Office extends Scene {
    // Camera and background
    private camera: Phaser.Cameras.Scene2D.Camera;
    private background: Phaser.GameObjects.Image;
    
    // Interactive objects
    private computer: Phaser.GameObjects.Sprite;
    private icedCoffee: Phaser.GameObjects.Sprite;
    private pottedPlant: Phaser.GameObjects.Sprite;
    private eyeMask: Phaser.GameObjects.Sprite;
    private waterBottle: Phaser.GameObjects.Sprite;
    private fishTank: Phaser.GameObjects.Sprite;
    
    // UI elements
    private clock: Phaser.GameObjects.Text;
    private tutorialText: Phaser.GameObjects.Text;
    private objectiveText: Phaser.GameObjects.Text;
    
    // Components
    private interactions: InteractionHandlers;
    private typingGame: TypingGame;
    private dialog: DialogSystem;
    private gameState: GameState;
    
    constructor() {
        super('Scene1_Office');
    }
    
    preload() {
        // Load scene assets
        this.load.image('office_bg', 'assets/office_background.png');
        this.load.image('computer', 'assets/computer.png');
        this.load.image('iced_coffee', 'assets/iced_coffee.png');
        this.load.image('plant', 'assets/potted_plant.png');
        this.load.image('eye_mask', 'assets/eye_mask.png');
        this.load.image('water_bottle', 'assets/water_bottle.png');
        this.load.image('fishtank', 'assets/fishtank.png');
        this.load.image('fish', 'assets/fish.png');
        this.load.image('goji_berries', 'assets/goji_berries.png');
        
        // Load animation frames
        this.load.spritesheet('fish_animation', 'assets/fish_animation.png', { 
            frameWidth: 64, 
            frameHeight: 32 
        });
        
        // Load audio
        this.load.audio('click', 'assets/click.mp3');
        this.load.audio('type', 'assets/typing.mp3');
        this.load.audio('ambient_office', 'assets/ambient_office.mp3');
    }
    
    create() {
        // Setup camera and background
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x333333);
        
        // Add office background
        this.background = this.add.image(512, 384, 'office_bg');
        
        // Add clock showing 6:30 PM
        this.clock = this.add.text(900, 100, '6:30 PM', { 
            fontFamily: 'Arial', 
            fontSize: '28px', 
            color: '#ffffff' 
        });
        
        // Initialize game state
        this.gameState = new GameState(this);
        
        // Initialize components
        this.dialog = new DialogSystem(this);
        this.interactions = new InteractionHandlers(this, this.dialog, this.gameState);
        this.typingGame = new TypingGame(this, this.dialog, this.gameState);
        
        // Create interactive objects
        this.createInteractiveObjects();
        
        // Setup tutorial and objective
        this.setupTutorial();
        
        // Setup ambient office sounds - wrapped in try/catch
        try {
            this.sound.play('ambient_office', { loop: true, volume: 0.3 });
        } catch (e) {
            console.log('Ambient audio playback failed, continuing without sound');
        }
    }
    
    private createInteractiveObjects() {
        // Add computer with job report
        this.computer = this.add.sprite(400, 350, 'computer')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleComputerInteraction());
            
        // Add iced coffee
        this.icedCoffee = this.add.sprite(600, 300, 'iced_coffee')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleCoffeeInteraction());
            
        // Add potted plant
        this.pottedPlant = this.add.sprite(700, 400, 'plant')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handlePlantInteraction());
            
        // Add eye mask
        this.eyeMask = this.add.sprite(300, 400, 'eye_mask')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleEyeMaskInteraction());
            
        // Add water bottle and goji berries
        this.waterBottle = this.add.sprite(550, 380, 'water_bottle')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleWaterBottleInteraction());
            
        // Add fish tank (mandatory interaction)
        this.fishTank = this.add.sprite(250, 300, 'fishtank')
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleFishTankInteraction());
        
        try {
            // Create fish animation
            this.anims.create({
                key: 'fish_swim',
                frames: this.anims.generateFrameNumbers('fish_animation', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
            
            // Add the fish to the tank
            const fish = this.add.sprite(250, 300, 'fish_animation')
                .play('fish_swim');
        } catch (e) {
            console.error('Failed to create fish animation, using static fish instead', e);
            // Fallback to static fish
            const fish = this.add.sprite(250, 300, 'fish');
        }
    }
    
    private setupTutorial() {
        // Create a semi-transparent black rectangle for tutorial text
        const tutorialBg = this.add.rectangle(512, 100, 800, 80, 0x000000, 0.7);
        
        // Add tutorial text
        this.tutorialText = this.add.text(512, 100, 
            'Click on objects to interact with them. Complete your work before leaving.',
            { 
                fontFamily: 'Arial', 
                fontSize: '24px', 
                color: '#ffffff',
                align: 'center' 
            }
        ).setOrigin(0.5);
        
        // Create objective text
        this.objectiveText = this.add.text(512, 50, 
            'Objective: Finish your work and prepare to leave the office',
            { 
                fontFamily: 'Arial', 
                fontSize: '20px', 
                color: '#ffff00',
                align: 'center' 
            }
        ).setOrigin(0.5);
        
        // Make tutorial disappear after 5 seconds
        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: [tutorialBg, this.tutorialText],
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        });
    }
    
    public leaveOffice() {
        // Save player choices for use in later scenes
        localStorage.setItem('playerChoices', JSON.stringify(this.gameState.playerChoices));
        
        // Transition animation - dimming lights
        this.tweens.add({
            targets: this.background,
            alpha: 0.2,
            duration: 2000,
            ease: 'Power2'
        });
        
        // Elevator door closing animation
        const leftDoor = this.add.rectangle(412, 384, 200, 768, 0x333333).setAlpha(0);
        const rightDoor = this.add.rectangle(612, 384, 200, 768, 0x333333).setAlpha(0);
        
        this.tweens.add({
            targets: [leftDoor, rightDoor],
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Start next scene
                this.scene.start('Scene2_Skytrain');
            }
        });
        
        this.tweens.add({
            targets: leftDoor,
            x: 512 - 100,
            duration: 2000,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: rightDoor,
            x: 512 + 100,
            duration: 2000,
            ease: 'Power2'
        });
    }
    
    // Getters for components to access
    public getSceneObjects() {
        return {
            computer: this.computer,
            icedCoffee: this.icedCoffee,
            pottedPlant: this.pottedPlant,
            eyeMask: this.eyeMask,
            waterBottle: this.waterBottle,
            fishTank: this.fishTank,
            camera: this.camera,
            background: this.background
        };
    }
} 