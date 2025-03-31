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
        
        // Nullify any existing elements to ensure clean state
        this.typingGameBackground = null as unknown as Phaser.GameObjects.Rectangle;
        this.typingGameText = null as unknown as Phaser.GameObjects.Text;
        this.typingGameInput = null as unknown as Phaser.GameObjects.Text;
        this.typingGameCursor = null as unknown as Phaser.GameObjects.Rectangle;
        this.typingGameTimer = null as unknown as Phaser.GameObjects.Text;
        
        // Hide dialog
        this.dialog.hideDialog();
        
        // Set up typing game background (a computer screen overlay)
        this.typingGameBackground = this.scene.add.rectangle(512, 384, 700, 400, 0x222222, 0.9);
        
        // Set of phrases to type - work-related sentences
        const phrases = [
            "The quarterly report shows strong growth in our key metrics.",
            "Please review the attached documents before tomorrow's meeting.",
            "Our department needs to improve efficiency by 15% this quarter.",
            "I'll schedule a follow-up meeting to discuss next steps.",
            "The client has requested additional information about our services."
        ];
        
        // Select a random phrase
        this.typingTargetText = phrases[Math.floor(Math.random() * phrases.length)];
        
        // Create text display for target text
        this.typingGameText = this.scene.add.text(512, 300, this.typingTargetText, {
            fontFamily: 'Courier',
            fontSize: '24px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);
        
        // Create initial empty text display for user input
        this.typingGameInput = this.scene.add.text(512, 350, '', {
            fontFamily: 'Courier',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);
        
        // Add a blinking cursor
        this.typingGameCursor = this.scene.add.rectangle(
            512, 
            350, 
            2, 
            24, 
            0xffffff
        );
        
        // Create text display for timer
        this.typingGameTimer = this.scene.add.text(512, 200, `Time left: ${this.typingGameTimeLeft}s`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create a title for the game
        this.scene.add.text(512, 150, "COMPLETE THE REPORT", {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add instructions
        this.scene.add.text(512, 450, "Type the text above exactly as shown", {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Make the cursor blink
        this.typingGameCursorTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.typingGameCursor) {
                    this.typingGameCursor.visible = !this.typingGameCursor.visible;
                }
            },
            loop: true
        });
        
        // Start countdown timer
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
        
        // Flag that we're in the game
        this.typingGameActive = true;
        
        // Set up keyboard input - handle null case
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown', this.handleTypingKeypress, this);
        }
        
        // Add a cancel button
        const cancelButton = this.scene.add.text(512, 500, "CANCEL", {
            fontFamily: 'Arial',
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
        
        // Indicate that typing has started with audio
        try {
            this.scene.sound.play('type', { volume: 0.3 });
        } catch (e) {
            console.log('Typing audio failed to play');
        }
    }
    
    private handleTypingKeypress(event: KeyboardEvent): void {
        // If the game is not active, ignore keypress
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
        
        // Update display
        this.updateTypingDisplay();
        
        // Play typing sound
        try {
            this.scene.sound.play('click', { volume: 0.1 });
        } catch (e) {
            // Ignore audio errors
        }
        
        // Check if the player has finished typing the phrase
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
        // Ensure objects exist before using them
        if (!this.typingGameInput || !this.typingGameCursor) return;
        
        // Clean up all previous character text objects first
        this.scene.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && 
                child.y === 350 && 
                child !== this.typingGameInput && 
                child !== this.typingGameText) {
                child.destroy();
            }
        });
        
        // Empty the main input text object (we'll use it just as a container)
        if (this.typingGameInput) {
            this.typingGameInput.setText('');
        }
        
        // Get target and input characters
        const targetChars = this.typingTargetText.split('');
        const inputChars = this.typingCurrentText.split('');
        
        // Calculate total width for centering
        const charWidth = 20; // Width of a single character in Courier
        const totalWidth = inputChars.length * charWidth;
        const startX = 512 - (totalWidth / 2);
        
        // Create text objects for each character with proper spacing
        inputChars.forEach((char, index) => {
            const isCorrect = index < targetChars.length && char === targetChars[index];
            const color = isCorrect ? '#00ff00' : '#ff0000'; // Green for correct, red for incorrect
            
            // Calculate precise position for this character
            const xPos = startX + (index * charWidth);
            
            // Create text object for this character
            this.scene.add.text(xPos, 350, char, {
                fontFamily: 'Courier',
                fontSize: '24px',
                color: color,
                fixedWidth: charWidth // Add fixed width to ensure consistent spacing
            }).setOrigin(0.5, 0.5); // Center align both horizontally and vertically
        });
        
        // Update cursor position to be after the last character
        if (this.typingGameCursor) {
            this.typingGameCursor.x = startX + (inputChars.length * charWidth);
            this.typingGameCursor.y = 350;
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
        
        // Track all elements created for the typing game that need to be cleaned up
        const elementsToDestroy: (Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle)[] = [];
        
        // Clean up all text objects created for the typing game
        // This includes title, target text, input, instructions, and individual characters
        this.scene.children.list.forEach(child => {
            // Check if it's a text object at any of our known y-positions
            if (child instanceof Phaser.GameObjects.Text) {
                // Check if it's at the positions of typing game elements (y values)
                // 150 = title, 200 = timer, 300 = target text, 350 = input, 450 = instructions, 500 = cancel
                if ([150, 200, 300, 350, 450, 500].includes(child.y) || 
                    (child.y === 350 && child !== this.typingGameInput)) {
                    elementsToDestroy.push(child);
                }
            }
            
            // Check if it's a rectangle for the cursor or other typing game elements
            if (child instanceof Phaser.GameObjects.Rectangle) {
                // The background rectangle is at position 384 and the cursor is at 350
                if (child === this.typingGameBackground || child === this.typingGameCursor) {
                    elementsToDestroy.push(child);
                }
            }
        });
        
        // Destroy all identified elements
        elementsToDestroy.forEach(element => {
            if (element && element.active) {
                element.destroy();
            }
        });
        
        // Nullify references after destroying
        this.typingGameBackground = null as unknown as Phaser.GameObjects.Rectangle;
        this.typingGameText = null as unknown as Phaser.GameObjects.Text;
        this.typingGameInput = null as unknown as Phaser.GameObjects.Text;
        this.typingGameCursor = null as unknown as Phaser.GameObjects.Rectangle;
        this.typingGameTimer = null as unknown as Phaser.GameObjects.Text;
        
        // Stop events
        if (this.typingGameCursorTimer) this.typingGameCursorTimer.remove();
        if (this.typingGameTimeEvent) this.typingGameTimeEvent.remove();
        
        // Remove keyboard listener with null check
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown', this.handleTypingKeypress, this);
        }
        
        // Make sure the computer is interactive again if game was unsuccessful
        if (!success) {
            // Get the scene objects including the computer
            const sceneObjects = this.scene.getSceneObjects();
            if (sceneObjects && sceneObjects.computer) {
                // Re-enable interaction on the computer
                sceneObjects.computer.setInteractive({ useHandCursor: true });
                
                // Clear any transparent overlays that might be blocking interaction
                // by removing any Rectangle/Text objects that overlap with the computer
                const computerBounds = sceneObjects.computer.getBounds();
                this.scene.children.list.forEach(child => {
                    // Only check game objects that have position properties
                    if (child !== sceneObjects.computer && 
                        (child instanceof Phaser.GameObjects.Rectangle || 
                         child instanceof Phaser.GameObjects.Text)) {
                        
                        // Check if this object is invisible (alpha near 0) and overlapping the computer
                        if (child.alpha < 0.1 && 
                            child.x >= computerBounds.x && 
                            child.x <= computerBounds.x + computerBounds.width &&
                            child.y >= computerBounds.y && 
                            child.y <= computerBounds.y + computerBounds.height) {
                            
                            // Destroy potential invisible overlapping objects
                            child.destroy();
                        }
                    }
                });
            }
        }
        
        // Show result
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