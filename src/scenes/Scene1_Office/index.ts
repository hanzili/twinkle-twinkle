import { BaseScene, EnergyLevel } from '../BaseScene';
import { InteractionHandlers } from './InteractionHandlers';
import { TypingGame } from './TypingGame';
import { DialogSystem } from './DialogSystem';
import { GameState } from './GameState';

export class Scene1_Office extends BaseScene {
    // Camera and background
    private camera: Phaser.Cameras.Scene2D.Camera;
    private background: Phaser.GameObjects.Image;
    
    // Interactive objects - using generic GameObject to allow for rectangles
    private miniGame: Phaser.GameObjects.GameObject;
    private coffee: Phaser.GameObjects.GameObject;
    private plant: Phaser.GameObjects.GameObject;
    private fishTank: Phaser.GameObjects.GameObject;
    
    // Narration elements
    private narrationBox: Phaser.GameObjects.Image;
    private protagonist: Phaser.GameObjects.Image;
    
    // UI elements
    private tutorialText: Phaser.GameObjects.Text;
    
    // Components
    private interactions: InteractionHandlers;
    private typingGame: TypingGame;
    private dialog: DialogSystem;
    private gameState: GameState;
    
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
        
        // Create interactive objects with new assets
        this.createInteractiveObjects();
        
        // Setup tutorial (only the temporary info text)
        this.setupTutorial();
        
        // Setup ambient office sounds - wrapped in try/catch
        try {
            this.sound.play('ambient_office', { loop: true, volume: 0.3 });
        } catch (e) {
            console.log('Ambient audio playback failed, continuing without sound');
        }
    }
    
    private setupNarration() {
        // Add narration box at the bottom of the screen (initially hidden)
        const gameHeight = this.cameras.main.height;
        this.narrationBox = this.add.image(960, gameHeight - 180, 'narration').setVisible(false);
        
        // Add protagonist image for dialog (initially hidden)
        this.protagonist = this.add.image(400, gameHeight - 180, 'protagonist').setVisible(false);
        
        // Scale the narration elements appropriately
        this.narrationBox.setScale(0.8);
        this.protagonist.setScale(0.5);
    }
    
    private createInteractiveObjects() {
        // Create invisible clickable zones over where items appear in the background
        
        // Central computer/monitor - clickable area
        this.miniGame = this.add.rectangle(960, 400, 300, 200, 0x000000, 0.01) as any;
        this.miniGame.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleComputerInteraction());
            
        // Coffee cup area - left side
        this.coffee = this.add.rectangle(550, 500, 100, 100, 0x000000, 0.01) as any;
        this.coffee.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleCoffeeInteraction());
            
        // Plant area - right side
        this.plant = this.add.rectangle(1300, 500, 150, 150, 0x000000, 0.01) as any;
        this.plant.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handlePlantInteraction());
            
        // Fish tank area - left side
        this.fishTank = this.add.rectangle(350, 350, 150, 150, 0x000000, 0.01) as any;
        this.fishTank.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.interactions.handleFishTankInteraction());
    }
    
    private setupTutorial() {
        // Create a semi-transparent black rectangle for tutorial text
        const tutorialBg = this.add.rectangle(960, 150, 1200, 80, 0x000000, 0.7);
        
        // Add tutorial text
        this.tutorialText = this.add.text(960, 150, 
            'Click on objects to interact with them. Complete your work before leaving.',
            { 
                fontSize: '24px', 
                color: '#ffffff',
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
        
        // Elevator door closing animation - adjusted for 1920x1080
        const leftDoor = this.add.rectangle(860, 540, 400, 1080, 0x333333).setAlpha(0);
        const rightDoor = this.add.rectangle(1060, 540, 400, 1080, 0x333333).setAlpha(0);
        
        this.tweens.add({
            targets: [leftDoor, rightDoor],
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Increase energy level to MEDIUM for the next scene
                localStorage.setItem('playerEnergyLevel', EnergyLevel.MEDIUM);
                // Use the BaseScene's transitionToScene method
                this.transitionToScene('Scene2_Skytrain');
            }
        });
        
        this.tweens.add({
            targets: leftDoor,
            x: 960 - 200,
            duration: 2000,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: rightDoor,
            x: 960 + 200,
            duration: 2000,
            ease: 'Power2'
        });
    }
    
    // Getters for components to access
    public getSceneObjects() {
        return {
            miniGame: this.miniGame,
            coffee: this.coffee,
            plant: this.plant,
            fishTank: this.fishTank,
            narrator: this.narrationBox,
            protagonist: this.protagonist,
            camera: this.camera,
            background: this.background
        };
    }
    
    // Method to show the narration elements
    public showNarration(visible: boolean) {
        if (this.narrationBox) {
            this.narrationBox.setVisible(visible);
        }
        if (this.protagonist) {
            this.protagonist.setVisible(visible);
        }
    }
} 