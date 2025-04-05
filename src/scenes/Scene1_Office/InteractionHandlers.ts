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
            const dialogText = this.scene.add.text(512, 620, "Time to finish this report...", { 
                fontSize: '24px', 
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 850 }
            }).setOrigin(0.5);
            
            // Create the two options with clear visibility
            const choices = [
                "Start typing mini-game",
                "Skip it for tomorrow"
            ];
            
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            choices.forEach((choice, index) => {
                const yPos = 660 + (index * 40);
                const button = this.scene.add.text(512, yPos, choice, { 
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
                    
                    if (choice === "Start typing mini-game") {
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
        
        this.dialog.showDialog("This coffee is the only thing keeping me awake", [
            "Drink the coffee",
            "Leave it"
        ], (choice) => {
            if (choice === "Drink the coffee") {
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
        
        this.dialog.showDialog("The plant looks thirsty...", [
            "Water the plant",
            "Ignore it"
        ], (choice) => {
            if (choice === "Water the plant") {
                this.waterPlant();
                this.gameState.playerChoices['plant'] = 'water';
            } else {
                this.dialog.showDialog("It'll survive another day without water");
                this.gameState.playerChoices['plant'] = 'ignore';
            }
            
            // Mark as interacted
            this.gameState.interactedObjects.add('plant');
            
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
            // Create a custom dialog for fish tank
            const dialogBox = this.scene.add.rectangle(512, 650, 900, 180, 0x000000, 0.8);
            const dialogText = this.scene.add.text(512, 620, "The fish is swimming in circles, just like my thoughts...", { 
                fontSize: '24px', 
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 850 }
            }).setOrigin(0.5);
            
            // Create choices
            const choices = [
                "Feed the fish",
                "Tap the glass",
                "Just watch"
            ];
            
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            choices.forEach((choice, index) => {
                const yPos = 660 + (index * 40);
                const button = this.scene.add.text(512, yPos, choice, { 
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
                    
                    if (choice === "Feed the fish") {
                        this.dialog.showDialog("I sprinkle some food for the fish. At least one of us is getting fed properly today.");
                        this.gameState.playerChoices['fishtank'] = 'feed';
                    } else if (choice === "Tap the glass") {
                        this.dialog.showDialog("I tap on the glass. The fish darts away. I shouldn't disturb it.");
                        this.gameState.playerChoices['fishtank'] = 'tap';
                    } else {
                        this.dialog.showDialog("I watch the fish move back and forth. There's something calming about it.");
                        this.gameState.playerChoices['fishtank'] = 'watch';
                    }
                    
                    // Mark as interacted
                    this.gameState.interactedObjects.add('fishtank');
                    
                    // Check if player is ready to leave
                    this.gameState.checkReadyToLeave();
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
            this.dialog.showDialog("The fish seems content after our interaction.");
        }
    }
    
    // Animation and effect methods
    private drinkCoffee(): void {
        const objects = this.scene.getSceneObjects();
        
        // Use camera effects instead of sprite animations
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
        // Visual feedback through dialog only
        this.scene.time.delayedCall(500, () => {
            this.dialog.showDialog("The plant perks up a bit. It looks happier now.");
        });
    }
} 