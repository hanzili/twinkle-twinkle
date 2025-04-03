import { Scene1_Office } from './index';
import { DialogSystem } from './DialogSystem';
import { GameState } from './GameState';
import { InteractionHandlers } from './InteractionHandlers';

export class TypingGame {
    // Typing mini-game properties
    private typingGameActive: boolean = false;
    private typingGameText: Phaser.GameObjects.Text;
    private typingGameBackground: Phaser.GameObjects.Rectangle;
    private typingGameInput: Phaser.GameObjects.Text;
    private typingTargetText: string = '';
    private typingCurrentText: string = '';
    private typingGameCursor: Phaser.GameObjects.Rectangle;
    private typingGameCursorTimer: Phaser.Time.TimerEvent;
    private typingGameTimeLeft: number = 30; // 30 seconds
    private typingGameTimer: Phaser.GameObjects.Text;
    private typingGameTimeEvent: Phaser.Time.TimerEvent;
    private typingGameSuccessRate: number = 0.7; // 70% completion to succeed
    
    private scene: Scene1_Office;
    private dialog: DialogSystem;
    private gameState: GameState;
    
    constructor(scene: Scene1_Office, dialog: DialogSystem, gameState: GameState) {
        this.scene = scene;
        this.dialog = dialog;
        this.gameState = gameState;
        
        // Set the typing game reference in the interaction handlers to avoid circular dependency
        if (scene['interactions'] instanceof InteractionHandlers) {
            scene['interactions'].setTypingGame(this);
        }
    }
    
    public startReportMiniGame(): void {
        // Reset mini-game state
        this.typingGameActive = false;
        this.typingGameTimeLeft = 30;
        this.typingCurrentText = '';
        
        // Clean up any existing elements
        if (this.typingGameBackground) this.typingGameBackground.destroy();
        if (this.typingGameText) this.typingGameText.destroy();
        if (this.typingGameInput) this.typingGameInput.destroy();
        if (this.typingGameCursor) this.typingGameCursor.destroy();
        if (this.typingGameTimer) this.typingGameTimer.destroy();
        
        // Hide dialog
        this.dialog.hideDialog();
        
        // Set up typing game background (a computer screen overlay)
        this.typingGameBackground = this.scene.add.rectangle(512, 384, 700, 400, 0x222222, 0.9);
        
        // Set of phrases to type - work-related sentences
        const phrases = [
            "The client has requested additional information about our services.",
            "Please review the attached documents before tomorrow's meeting.",
            "Our department needs to improve efficiency by 15% this quarter.",
            "I'll schedule a follow-up meeting to discuss next steps.",
            "The quarterly report shows strong growth in our key metrics."
        ];
        
        // Select a random phrase
        this.typingTargetText = phrases[Math.floor(Math.random() * phrases.length)];
        
        // Create text display for target text - what the player needs to type
        this.typingGameText = this.scene.add.text(512, 300, this.typingTargetText, {
            fontFamily: 'Courier',
            fontSize: '24px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);
        
        // Create text display for user input - what the player has typed so far
        this.typingGameInput = this.scene.add.text(512, 350, '', {
            fontFamily: 'Courier',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Create a simple blinking cursor
        this.typingGameCursor = this.scene.add.rectangle(
            512, 
            350, 
            2, 
            24, 
            0xffffff
        );
        
        // Make cursor blink
        this.typingGameCursorTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.typingGameCursor) {
                    this.typingGameCursor.visible = !this.typingGameCursor.visible;
                }
            },
            loop: true
        });
        
        // Create timer display
        this.typingGameTimer = this.scene.add.text(512, 200, `Time left: ${this.typingGameTimeLeft}s`, {
            fontSize: '20px',
            color: '#ffff00'
        }).setOrigin(0.5);
        
        // Start the countdown timer
        this.typingGameTimeEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.typingGameTimeLeft--;
                if (this.typingGameTimer) {
                    this.typingGameTimer.setText(`Time left: ${this.typingGameTimeLeft}s`);
                }
                
                // Time's up!
                if (this.typingGameTimeLeft <= 0) {
                    this.endTypingGame(false);
                }
            },
            repeat: this.typingGameTimeLeft
        });
        
        // Create title and instructions
        this.scene.add.text(512, 150, "COMPLETE THE REPORT", {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.scene.add.text(512, 450, "Type the text above exactly as shown", {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Add cancel button
        const cancelButton = this.scene.add.text(512, 500, "CANCEL", {
            fontSize: '20px',
            color: '#ff5555',
            backgroundColor: '#550000',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => cancelButton.setBackgroundColor('#770000'))
        .on('pointerout', () => cancelButton.setBackgroundColor('#550000'))
        .on('pointerdown', () => {
            this.endTypingGame(false);
        });
        
        // Enable keyboard input
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown', this.handleTypingKeypress, this);
        }
        
        // Mark game as active
        this.typingGameActive = true;
    }
    
    private handleTypingKeypress(event: KeyboardEvent): void {
        // If game is not active, ignore keypress
        if (!this.typingGameActive) return;
        
        // Get the key pressed
        const key = event.key;
        
        // Handle backspace
        if (key === 'Backspace') {
            this.typingCurrentText = this.typingCurrentText.slice(0, -1);
            this.updateTypingDisplay();
            return;
        }
        
        // Ignore non-printable characters (except space)
        if (key.length !== 1 && key !== ' ') {
            return;
        }
        
        // Add the key to the current text
        this.typingCurrentText += key;
        
        // Update the display
        this.updateTypingDisplay();
        
        // Check if player has completed the phrase
        if (this.typingCurrentText.length >= this.typingTargetText.length) {
            // Calculate accuracy
            const accuracy = this.calculateTypingAccuracy();
            
            // End game with success if accuracy is above threshold
            if (accuracy >= this.typingGameSuccessRate) {
                this.endTypingGame(true);
            }
        }
    }
    
    private updateTypingDisplay(): void {
        // If input field doesn't exist, exit
        if (!this.typingGameInput) return;
        
        // Simply update the text of the input field
        this.typingGameInput.setText(this.typingCurrentText);
        
        // Position the cursor at the end of the text
        if (this.typingGameCursor) {
            // Get the width of the current input text
            const bounds = this.typingGameInput.getBounds();
            const textWidth = bounds.width;
            
            // Position cursor just after the last character
            this.typingGameCursor.x = this.typingGameInput.x + (textWidth / 2) + 1;
            this.typingGameCursor.y = this.typingGameInput.y;
        }
    }
    
    private calculateTypingAccuracy(): number {
        // Count correct characters
        let correctChars = 0;
        const targetChars = this.typingTargetText.split('');
        const inputChars = this.typingCurrentText.split('');
        
        inputChars.forEach((char, index) => {
            if (index < targetChars.length && char === targetChars[index]) {
                correctChars++;
            }
        });
        
        // Calculate percentage correct
        return correctChars / this.typingTargetText.length;
    }
    
    private endTypingGame(success: boolean): void {
        // Stop the typing game
        this.typingGameActive = false;
        
        // Clean up all game elements
        if (this.typingGameBackground) this.typingGameBackground.destroy();
        if (this.typingGameText) this.typingGameText.destroy();
        if (this.typingGameInput) this.typingGameInput.destroy();
        if (this.typingGameCursor) this.typingGameCursor.destroy();
        if (this.typingGameTimer) this.typingGameTimer.destroy();
        
        // Store references to text elements we need to destroy
        const textElementsToDestroy: Phaser.GameObjects.Text[] = [];
        
        // Find all text elements created for the game
        this.scene.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                // Check for all game-related texts by their positions
                if ([150, 200, 300, 350, 450, 500].includes(Math.round(child.y))) {
                    textElementsToDestroy.push(child);
                }
            }
            
            // Also look for any other rectangles created for the game
            if (child instanceof Phaser.GameObjects.Rectangle && 
                child !== this.typingGameBackground && 
                child !== this.typingGameCursor) {
                child.destroy();
            }
        });
        
        // Destroy all found text elements
        textElementsToDestroy.forEach(textElement => {
            textElement.destroy();
        });
        
        // Stop timers
        if (this.typingGameCursorTimer) this.typingGameCursorTimer.remove();
        if (this.typingGameTimeEvent) this.typingGameTimeEvent.remove();
        
        // Remove keyboard listener
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown', this.handleTypingKeypress, this);
        }
        
        // Handle the result
        if (success) {
            this.dialog.showDialog("Finally done. One less thing to worry about.");
            this.gameState.playerChoices['computer'] = 'completed';
            this.gameState.interactedObjects.add('computer');
        } else {
            this.dialog.showDialog("I couldn't finish the report. I'll try again.");
        }
        
        // Check if player is ready to leave
        this.gameState.checkReadyToLeave();
    }
} 