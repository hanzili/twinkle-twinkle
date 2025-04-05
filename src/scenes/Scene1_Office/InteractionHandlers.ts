import { Scene1_Office } from './index';
import { DialogSystem, DialogType } from './DialogSystem';
import { GameState } from './GameState';
import { TypingGame } from './TypingGame';

export class InteractionHandlers {
    private scene: Scene1_Office;
    private dialog: DialogSystem;
    private gameState: GameState;
    private typingGame: TypingGame;
    
    constructor(scene: Scene1_Office, dialog: DialogSystem, gameState: GameState) {
        this.scene = scene;
        this.dialog = dialog;
        this.gameState = gameState;
    }
    
    // Set the typing game reference (needed to avoid circular dependency)
    public setTypingGame(typingGame: TypingGame): void {
        this.typingGame = typingGame;
    }
    
    // Interaction handlers
    public handleComputerInteraction(): void {
        // First, clean up any existing dialogs
        this.dialog.hideDialog();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        if (!this.gameState.interactedObjects.has('computer')) {
            // Use the dialog system for the computer options
            this.dialog.showDialog("Time to finish this report...", DialogType.PROTAGONIST, [
                "Start typing mini-game",
                "Skip it for tomorrow"
            ], (choice) => {
                if (choice === "Start typing mini-game") {
                    // Start the typing mini-game
                    if (this.typingGame) {
                        this.typingGame.startReportMiniGame();
                    }
                } else {
                    this.dialog.showDialog("I'll just finish this tomorrow morning...", DialogType.PROTAGONIST);
                    this.gameState.playerChoices['computer'] = 'skipped';
                    this.gameState.interactedObjects.add('computer');
                    
                    // Check if player is ready to leave
                    this.gameState.checkReadyToLeave();
                }
            });
        } else {
            this.dialog.showDialog("You've already dealt with the report.", DialogType.NARRATION);
        }
    }
    
    public handleCoffeeInteraction(): void {
        // Hide any existing dialog first
        this.dialog.hideDialog();
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("This coffee is the only thing keeping me awake", DialogType.PROTAGONIST, [
            "Drink the coffee",
            "Leave it"
        ], (choice) => {
            if (choice === "Drink the coffee") {
                this.drinkCoffee();
                this.gameState.playerChoices['coffee'] = 'drink';
            } else {
                this.dialog.showDialog("I'm already too wired to sleep tonight anyway", DialogType.PROTAGONIST);
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
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("The plant looks thirsty...", DialogType.PROTAGONIST, [
            "Water the plant",
            "Ignore it"
        ], (choice) => {
            if (choice === "Water the plant") {
                this.waterPlant();
                this.gameState.playerChoices['plant'] = 'water';
            } else {
                this.dialog.showDialog("It'll survive another day without water", DialogType.PROTAGONIST);
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
        
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        if (!this.gameState.interactedObjects.has('fishtank')) {
            // Use the dialog system for fish tank
            this.dialog.showDialog("The fish is swimming in circles, just like my thoughts...", DialogType.PROTAGONIST, [
                "Feed the fish",
                "Tap the glass",
                "Just watch"
            ], (choice) => {
                if (choice === "Feed the fish") {
                    this.dialog.showDialog("I sprinkle some food for the fish. At least one of us is getting fed properly today.", DialogType.PROTAGONIST);
                    this.gameState.playerChoices['fishtank'] = 'feed';
                } else if (choice === "Tap the glass") {
                    this.dialog.showDialog("I tap on the glass. The fish darts away. I shouldn't disturb it.", DialogType.PROTAGONIST);
                    this.gameState.playerChoices['fishtank'] = 'tap';
                } else {
                    this.dialog.showDialog("I watch the fish move back and forth. There's something calming about it.", DialogType.PROTAGONIST);
                    this.gameState.playerChoices['fishtank'] = 'watch';
                }
                
                // Mark as interacted
                this.gameState.interactedObjects.add('fishtank');
                
                // Check if player is ready to leave
                this.gameState.checkReadyToLeave();
            });
        } else {
            this.dialog.showDialog("The fish seems content after our interaction.", DialogType.NARRATION);
        }
    }
    
    private drinkCoffee(): void {
        try {
            this.scene.sound.play('drink');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }
        
        this.dialog.showDialog("Ahh, the bitter taste of overtime... At least I feel more alert now.", DialogType.PROTAGONIST);
    }
    
    private waterPlant(): void {
        const objects = this.scene.getSceneObjects();
        
        // Add a visual animation for watering the plant
        this.scene.tweens.add({
            targets: objects.plantZone,
            scale: '*=1.05',
            duration: 1000,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.dialog.showDialog("The plant perks up a bit. It looks happier now.", DialogType.PROTAGONIST);
            }
        });
    }
} 