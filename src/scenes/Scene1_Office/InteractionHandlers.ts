import { Scene1_Office } from './index';
import { DialogSystem } from './DialogSystem';
import { GameState } from './GameState';
import { TypingGame } from './TypingGame';

export class InteractionHandlers {
    private scene: Scene1_Office;
    private dialog: DialogSystem;
    private gameState: GameState;
    private typingGame: TypingGame;
    
    // Track all custom dialogs
    private activeCustomDialogs: {
        box?: Phaser.GameObjects.Rectangle,
        text?: Phaser.GameObjects.Text,
        buttons?: Phaser.GameObjects.Text[]
    } = {};
    
    constructor(scene: Scene1_Office, dialog: DialogSystem, gameState: GameState) {
        this.scene = scene;
        this.dialog = dialog;
        this.gameState = gameState;
    }
    
    // Set the typing game reference (needed to avoid circular dependency)
    public setTypingGame(typingGame: TypingGame): void {
        this.typingGame = typingGame;
    }
    
    // Clean up any active custom dialogs
    private cleanupCustomDialogs(): void {
        if (this.activeCustomDialogs.box && this.activeCustomDialogs.box.active) {
            this.activeCustomDialogs.box.destroy();
        }
        
        if (this.activeCustomDialogs.text && this.activeCustomDialogs.text.active) {
            this.activeCustomDialogs.text.destroy();
        }
        
        if (this.activeCustomDialogs.buttons && this.activeCustomDialogs.buttons.length > 0) {
            this.activeCustomDialogs.buttons.forEach(button => {
                if (button && button.active) {
                    button.destroy();
                }
            });
        }
        
        // Reset the tracking object
        this.activeCustomDialogs = {};
    }
    
    // Interaction handlers
    public handleComputerInteraction(): void {
        // First, clean up any existing dialogs
        this.dialog.hideDialog();
        this.cleanupCustomDialogs();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        if (!this.gameState.interactedObjects.has('computer')) {
            // Create a custom dialog box for the computer options
            const dialogBox = this.scene.add.rectangle(512, 650, 900, 180, 0x000000, 0.8);
            const dialogText = this.scene.add.text(512, 620, "The work is never-ending...", { 
                fontFamily: 'Arial', 
                fontSize: '24px', 
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 850 }
            }).setOrigin(0.5);
            
            // Create the two options with clear visibility
            const choices = [
                "Complete the report (start mini-game)",
                "Skip it for tomorrow"
            ];
            
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            choices.forEach((choice, index) => {
                const yPos = 660 + (index * 40);
                const button = this.scene.add.text(512, yPos, choice, { 
                    fontFamily: 'Arial', 
                    fontSize: '20px',
                    color: '#ffff00',
                    backgroundColor: '#333333',
                    padding: { x: 10, y: 5 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => button.setColor('#ff0000'))
                .on('pointerout', () => button.setColor('#ffff00'))
                .on('pointerdown', () => {
                    // Clean up UI
                    this.cleanupCustomDialogs();
                    
                    if (choice === "Complete the report (start mini-game)") {
                        // Start the typing mini-game
                        if (this.typingGame) {
                            this.typingGame.startReportMiniGame();
                        }
                    } else {
                        this.dialog.showDialog("I'll just finish this tomorrow morning...");
                        this.gameState.playerChoices['computer'] = 'skipped';
                        this.gameState.interactedObjects.add('computer');
                        
                        // Check if player is ready to leave
                        this.gameState.checkReadyToLeave();
                    }
                });
                
                choiceButtons.push(button);
            });
            
            // Store the active dialogs for cleanup
            this.activeCustomDialogs = {
                box: dialogBox,
                text: dialogText,
                buttons: choiceButtons
            };
        } else {
            this.dialog.showDialog("You've already dealt with the report.");
        }
    }
    
    public handleCoffeeInteraction(): void {
        // Hide any existing dialog first
        this.dialog.hideDialog();
        this.cleanupCustomDialogs();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("This is the only thing keeping me awake right now", [
            "Drink the rest",
            "Leave it"
        ], (choice) => {
            if (choice === "Drink the rest") {
                this.drinkCoffee();
                this.gameState.playerChoices['coffee'] = 'drink';
            } else {
                this.dialog.showDialog("I'm already too wired to sleep tonight anyway");
                this.gameState.playerChoices['coffee'] = 'leave';
            }
            
            // Mark as interacted
            this.gameState.interactedObjects.add('coffee');
            
            // Check if player is ready to leave
            this.gameState.checkReadyToLeave();
        });
    }
    
    public handlePlantInteraction(): void {
        // Hide any existing dialog first
        this.dialog.hideDialog();
        this.cleanupCustomDialogs();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("The plant is just like me…", [
            "Water the plant",
            "Ignore it"
        ], (choice) => {
            if (choice === "Water the plant") {
                this.waterPlant();
                this.gameState.playerChoices['plant'] = 'water';
            } else {
                this.dialog.showDialog("Maybe we're both beyond saving at this point");
                this.gameState.playerChoices['plant'] = 'ignore';
            }
            
            // Mark as interacted
            this.gameState.interactedObjects.add('plant');
            
            // Check if player is ready to leave
            this.gameState.checkReadyToLeave();
        });
    }
    
    public handleEyeMaskInteraction(): void {
        // Hide any existing dialog first
        this.dialog.hideDialog();
        this.cleanupCustomDialogs();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("Perfect for 'resting' my eyes", [
            "Try it on",
            "Pack it away"
        ], (choice) => {
            if (choice === "Try it on") {
                this.tryEyeMask();
                this.gameState.playerChoices['eyemask'] = 'try';
            } else {
                this.dialog.showDialog("Better save this for the commute");
                this.gameState.playerChoices['eyemask'] = 'pack';
            }
            
            // Mark as interacted
            this.gameState.interactedObjects.add('eyemask');
            
            // Check if player is ready to leave
            this.gameState.checkReadyToLeave();
        });
    }
    
    public handleWaterBottleInteraction(): void {
        // Hide any existing dialog first
        this.dialog.hideDialog();
        this.cleanupCustomDialogs();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("You're getting older after all...", [
            "Brew goji berries",
            "Drink plain water"
        ], (choice) => {
            if (choice === "Brew goji berries") {
                this.brewGojiBerries();
                this.gameState.playerChoices['water'] = 'goji';
            } else {
                this.dialog.showDialog("No time for health rituals today");
                this.gameState.playerChoices['water'] = 'plain';
            }
            
            // Mark as interacted
            this.gameState.interactedObjects.add('water');
            
            // Check if player is ready to leave
            this.gameState.checkReadyToLeave();
        });
    }
    
    public handleFishTankInteraction(): void {
        // Hide any existing dialog first
        this.dialog.hideDialog();
        this.cleanupCustomDialogs();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        if (!this.gameState.interactedObjects.has('fishtank')) {
            // Create a taller dialog box to fit all four options
            const dialogBox = this.scene.add.rectangle(512, 650, 900, 250, 0x000000, 0.8);
            const dialogText = this.scene.add.text(512, 580, "The poor fish is trapped… just swimming in circles", { 
                fontFamily: 'Arial', 
                fontSize: '24px', 
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 850 }
            }).setOrigin(0.5);
            
            // Create the four option buttons with more space between them
            const choices = [
                "But at least it's safe and cared for",
                "It's a comfortable prison, like this office",
                "Still, it's doing what it's supposed to do",
                "I wonder if fish dream of being something else"
            ];
            
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            choices.forEach((choice, index) => {
                const yPos = 620 + (index * 35); // Reduced vertical spacing to fit all options
                const button = this.scene.add.text(512, yPos, choice, { 
                    fontFamily: 'Arial', 
                    fontSize: '18px', // Slightly smaller font to fit better
                    color: '#ffff00',
                    backgroundColor: '#333333',
                    padding: { x: 10, y: 5 }
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => button.setColor('#ff0000'))
                .on('pointerout', () => button.setColor('#ffff00'))
                .on('pointerdown', () => {
                    // Record choice based on selection
                    if (choice.includes("safe and cared for")) {
                        this.gameState.playerChoices['fish_thought'] = 'safe';
                    } else if (choice.includes("comfortable prison")) {
                        this.gameState.playerChoices['fish_thought'] = 'freedom';
                    } else if (choice.includes("what it's supposed to do")) {
                        this.gameState.playerChoices['fish_thought'] = 'overachiever';
                    } else if (choice.includes("dream of being something else")) {
                        this.gameState.playerChoices['fish_thought'] = 'funny';
                    }
                    
                    // Clean up UI
                    this.cleanupCustomDialogs();
                    
                    // Mark as interacted
                    this.gameState.interactedObjects.add('fishtank');
                    
                    // Check if player is ready to leave
                    this.gameState.checkReadyToLeave();
                });
                
                // Store the button for later cleanup
                choiceButtons.push(button);
            });
            
            // Store the active dialogs for cleanup
            this.activeCustomDialogs = {
                box: dialogBox,
                text: dialogText,
                buttons: choiceButtons
            };
        } else {
            this.dialog.showDialog("The fish seems content after being fed.");
        }
    }
    
    // Animation and effect methods
    private drinkCoffee(): void {
        const objects = this.scene.getSceneObjects();
        
        // Show drinking animation or effect
        this.scene.tweens.add({
            targets: objects.icedCoffee,
            alpha: 0.3,
            y: '-=10',
            duration: 1000,
            ease: 'Power2'
        });
        
        // Brighten screen slightly to show energy boost
        this.scene.tweens.add({
            targets: objects.camera,
            brightness: 1.2,
            duration: 1000,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                this.dialog.showDialog("That hit the spot. I feel more alert now.");
            }
        });
    }
    
    private waterPlant(): void {
        const objects = this.scene.getSceneObjects();
        
        // Show watering animation or visual cue
        this.scene.tweens.add({
            targets: objects.pottedPlant,
            scale: 1.1,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                this.dialog.showDialog("At least one of us is getting proper care");
            }
        });
    }
    
    private tryEyeMask(): void {
        // Screen goes dark briefly
        const darkOverlay = this.scene.add.rectangle(512, 384, 1024, 768, 0x000000);
        
        // Brief dream sequence
        this.scene.time.delayedCall(1000, () => {
            // Show brief dream imagery and then fade back
            this.dialog.showDialog("*You drift into a momentary daydream*");
            
            // Fade back after 5 seconds
            this.scene.time.delayedCall(3000, () => {
                darkOverlay.destroy();
                this.dialog.showDialog("That was nice... but back to reality.");
            });
        });
    }
    
    private brewGojiBerries(): void {
        const objects = this.scene.getSceneObjects();
        
        // Visual of berries being added to water
        const gojiBerries = this.scene.add.image(objects.waterBottle.x + 20, objects.waterBottle.y - 20, 'goji_berries');
        
        // Animation of berries going into bottle
        this.scene.tweens.add({
            targets: gojiBerries,
            x: objects.waterBottle.x,
            y: objects.waterBottle.y,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Change water bottle color to reddish
                objects.waterBottle.setTint(0xff9999);
                this.dialog.showDialog("Health before everything else");
            }
        });
    }
} 