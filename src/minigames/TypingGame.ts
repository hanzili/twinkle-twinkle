import * as Phaser from 'phaser';
import { DialogManager, DialogType } from '../utils/DialogManager';
import { GameStateManager } from '../utils/GameStateManager';

export class TypingGame {
    private scene: Phaser.Scene;
    private dialogManager: DialogManager;
    private gameStateManager: GameStateManager;
    
    // Game state
    private active: boolean = false;
    private targetText: string = '';
    private currentInput: string = '';
    
    // UI elements
    private background: Phaser.GameObjects.Image | null = null;
    private textDisplay: Phaser.GameObjects.Text | null = null;
    private inputDisplay: Phaser.GameObjects.Text | null = null;
    private instructions: Phaser.GameObjects.Text | null = null;
    private keyboardListener: ((e: KeyboardEvent) => void) | null = null;
    
    // Constructor
    constructor(scene: Phaser.Scene, dialogManager: DialogManager, gameStateManager: GameStateManager) {
        this.scene = scene;
        this.dialogManager = dialogManager;
        this.gameStateManager = gameStateManager;
    }
    
    // Start the typing game
    public start(): void {
        // Select target text to type
        this.targetText = this.getRandomPrompt();
        
        // Setup UI
        this.createGameUI();
        
        // Setup keyboard input
        this.setupKeyboardInput();
        
        // Mark game as active
        this.active = true;
    }
    
    // Create UI elements for the typing game
    private createGameUI(): void {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background
        this.background = this.scene.add.image(centerX, centerY, 'typing-background')
            .setDisplaySize(width, height)
            .setDepth(10);
        
        // Text display area
        const contentWidth = 800;
        const contentY = centerY - 100;
        
        // Target text display
        this.textDisplay = this.scene.add.text(
            centerX - contentWidth/2 + 40, 
            contentY, 
            this.targetText, 
            {
                fontFamily: 'Courier New',
                fontSize: '20px',
                color: '#888888',
                align: 'left',
                wordWrap: { width: contentWidth - 80 }
            }
        )
        .setOrigin(0, 0)
        .setDepth(11);
        
        // User input display
        this.inputDisplay = this.scene.add.text(
            centerX - contentWidth/2 + 40, 
            contentY + 60, 
            '|', // Input cursor
            {
                fontFamily: 'Courier New',
                fontSize: '22px',
                color: '#000000',
                align: 'left',
                wordWrap: { width: contentWidth - 80 }
            }
        )
        .setOrigin(0, 0)
        .setDepth(11);
        
        // Instructions
        this.instructions = this.scene.add.text(
            centerX, 
            centerY + 130, 
            "Type the text above exactly as shown", 
            {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center'
            }
        )
        .setOrigin(0.5)
        .setDepth(11);
        
        // Cancel button
        const cancelButton = this.scene.add.rectangle(
            centerX,
            centerY + 170,
            80, 
            30,
            0x000000
        )
        .setDepth(11)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => cancelButton.fillColor = 0x333333)
        .on('pointerout', () => cancelButton.fillColor = 0x000000)
        .on('pointerdown', () => {
            this.end(false);
        });
        
        // Cancel button text
        this.scene.add.text(
            centerX, 
            centerY + 170, 
            "CANCEL", 
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(12);
    }
    
    // Setup keyboard input handling
    private setupKeyboardInput(): void {
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.enabled = true;
            
            // Create a keyboard listener
            this.keyboardListener = this.handleKeyPress.bind(this);
            this.scene.input.keyboard.on('keydown', this.keyboardListener);
            
            // Ensure the game has focus
            if (this.scene.game.canvas) {
                this.scene.game.canvas.focus();
            }
        }
    }
    
    // Handle key press events
    private handleKeyPress(event: KeyboardEvent): void {
        if (!this.active) return;
        
        const key = event.key;
        
        // Handle backspace
        if (key === 'Backspace') {
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateInputDisplay();
            return;
        }
        
        // Ignore non-printable characters
        if (key === 'Shift' || key === 'Control' || key === 'Alt' || 
            key === 'CapsLock' || key === 'Tab' || key === 'Escape' ||
            key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            return;
        }
        
        // Add character to input
        if (key.length === 1 || key === ' ' || key === 'Enter') {
            this.currentInput += key;
        }
        
        // Play typing sound
        try {
            this.scene.sound.play('type');
        } catch (e) {
            // Continue without sound if it fails
        }
        
        // Update the display
        this.updateInputDisplay();
        
        // Check if completed
        if (this.currentInput === this.targetText) {
            this.end(true);
        }
    }
    
    // Update the input display
    private updateInputDisplay(): void {
        if (!this.inputDisplay) return;
        
        // Add cursor character if empty
        const displayText = this.currentInput || '|';
        this.inputDisplay.setText(displayText);
    }
    
    // End the typing game
    private async end(success: boolean): Promise<void> {
        // Deactivate game
        this.active = false;
        
        // Clean up keyboard listener
        if (this.keyboardListener && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }
        
        // Clean up UI elements
        this.cleanup();
        
        // Mark typing game as completed in GameStateManager
        if (success) {
            this.gameStateManager.markTypingGameCompleted();
            await this.dialogManager.showDialog(
                "Perfect! I've completed the report. Now I can focus on other tasks.", 
                DialogType.PROTAGONIST
            );
        } else {
            await this.dialogManager.showDialog(
                "I'll have to continue this later. I need a break.", 
                DialogType.PROTAGONIST
            );
        }
        
        // Check if player has completed required interactions to leave
        this.checkIfCanLeave();
    }
    
    // Check if player can leave the office
    private checkIfCanLeave(): void {
        // Player must interact with computer and fish tank to be able to leave
        if (this.gameStateManager.hasInteractedWith('computer') && 
            this.gameStateManager.hasInteractedWith('fishtank')) {
            this.createLeaveButton();
        }
    }
    
    // Create a button to leave the office
    private createLeaveButton(): void {
        const centerX = this.scene.cameras.main.width / 2;
        
        // Create the leave button
        const leaveButton = this.scene.add.text(centerX, 200, 'Ready to leave the office?', { 
            fontSize: '28px', 
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => leaveButton.setBackgroundColor('#333333'))
        .on('pointerout', () => leaveButton.setBackgroundColor('#000000'))
        .on('pointerdown', () => {
            // Call the leaveOffice method on the scene
            if (this.scene.hasOwnProperty('leaveOffice')) {
                (this.scene as any).leaveOffice();
            }
        });
    }
    
    // Clean up all UI elements
    private cleanup(): void {
        // Remove all game objects
        [
            this.background,
            this.textDisplay,
            this.inputDisplay,
            this.instructions
        ].forEach(obj => {
            if (obj) obj.destroy();
        });
        
        // Clear references
        this.background = null;
        this.textDisplay = null;
        this.inputDisplay = null;
        this.instructions = null;
        
        // Remove any remaining objects
        this.scene.children.each(child => {
            if (child instanceof Phaser.GameObjects.Text && child.depth === 11) {
                child.destroy();
            }
            if (child instanceof Phaser.GameObjects.Rectangle && child.depth === 11) {
                child.destroy();
            }
        });
    }
    
    // Get a random typing prompt
    private getRandomPrompt(): string {
        const prompts = [
            "The quarterly report shows significant growth in key metrics.",
            "Please review the attached document before our meeting tomorrow.",
            "I would like to discuss the project timeline at your convenience.",
            "Thank you for your prompt response to our inquiry.",
            "We should schedule a follow-up meeting next week."
        ];
        
        return prompts[Math.floor(Math.random() * prompts.length)];
    }
} 