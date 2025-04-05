import { Scene1_Office } from './index';
import { DialogSystem, DialogType } from './DialogSystem';
import { GameState } from './GameState';
import { InteractionHandlers } from './InteractionHandlers';

export class TypingGame {
    // Typing mini-game properties
    private typingGameActive: boolean = false;
    private typingGameBackground: Phaser.GameObjects.Image;
    private typingGameText: Phaser.GameObjects.Text;
    private typingGameInput: Phaser.GameObjects.Text;
    private typingTargetText: string = '';
    private typingCurrentText: string = '';
    
    private scene: Scene1_Office;
    private dialog: DialogSystem;
    private gameState: GameState;
    private originalBackgroundAlpha: number;
    
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
        this.typingCurrentText = '';
        
        // Clean up any existing elements
        if (this.typingGameBackground) this.typingGameBackground.destroy();
        if (this.typingGameText) this.typingGameText.destroy();
        if (this.typingGameInput) this.typingGameInput.destroy();
        
        // Hide dialog
        this.dialog.hideDialog();
        
        // Store original background alpha
        const sceneObjects = this.scene.getSceneObjects();
        this.originalBackgroundAlpha = sceneObjects.background.alpha;
        
        // Fade out the main scene background
        this.scene.tweens.add({
            targets: sceneObjects.background,
            alpha: 0.2,
            duration: 500,
            ease: 'Power2'
        });
        
        // Get screen dimensions
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // Set up typing game background (full screen image)
        this.typingGameBackground = this.scene.add.image(centerX, centerY, 'typing-background')
            .setDisplaySize(gameWidth, gameHeight)
            .setDepth(10);
        
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
        console.log('Target text to type:', this.typingTargetText);
        
        // Content area dimensions and positioning
        const contentWidth = 800;
        const contentStartY = centerY - 100;
        
        // Create text display for target text (gray) - aligned left, at top of content
        this.typingGameText = this.scene.add.text(centerX - contentWidth/2 + 40, contentStartY, this.typingTargetText, {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#888888',
            align: 'left',
            wordWrap: { width: contentWidth - 80 }
        })
        .setOrigin(0, 0)
        .setDepth(11);
        
        // Create text display for user input - positioned directly below target text
        const textHeight = this.typingGameText.height;
        this.typingGameInput = this.scene.add.text(centerX - contentWidth/2 + 40, contentStartY + 40 + textHeight, '', {
            fontFamily: 'Courier New',
            fontSize: '22px',
            color: '#000000',
            align: 'left',
            wordWrap: { width: contentWidth - 80 }
        })
        .setOrigin(0, 0)
        .setDepth(11);
        
        // Add a placeholder to show where text will appear
        this.typingGameInput.setText('|');
        
        // Create instructions - centered at bottom of content area
        const instructions = this.scene.add.text(centerX, centerY + 130, "Type the text above exactly as shown", {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(11);
        
        // Add cancel button
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
            this.endTypingGame(false);
        });
        
        // Add text to cancel button
        const cancelText = this.scene.add.text(centerX, centerY + 170, "CANCEL", {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setDepth(12);
        
        // Enable keyboard input - make sure we're using the main keyboard plugin
        if (this.scene.input && this.scene.input.keyboard) {
            console.log('Setting up keyboard input');
            this.scene.input.keyboard.enabled = true;
            this.scene.input.keyboard.on('keydown', this.handleTypingKeypress, this);
            
            // Try to ensure the game has focus
            if (this.scene.game.canvas) {
                this.scene.game.canvas.focus();
            }
        } else {
            console.error('Keyboard input not available');
        }
        
        // Mark game as active
        this.typingGameActive = true;
        console.log('Typing game started, ready for input');
    }
    
    private handleTypingKeypress(event: KeyboardEvent): void {
        // If game is not active, ignore keypress
        if (!this.typingGameActive) return;
        
        // Get the key pressed
        const key = event.key;
        console.log('Key pressed:', key);
        
        // Handle backspace
        if (key === 'Backspace') {
            this.typingCurrentText = this.typingCurrentText.slice(0, -1);
            this.updateTypingDisplay();
            return;
        }
        
        // Ignore certain non-printable characters
        if (key === 'Shift' || key === 'Control' || key === 'Alt' || 
            key === 'CapsLock' || key === 'Tab' || key === 'Escape' ||
            key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            return;
        }
        
        // For all other keys, add to the current text
        if (key.length === 1 || key === ' ' || key === 'Enter') {
            this.typingCurrentText += key;
        }
        
        // Play typing sound
        try {
            this.scene.sound.play('type');
        } catch (e) {
            console.log('Sound play failed, continuing without sound');
        }
        
        // Update the display
        this.updateTypingDisplay();
        
        // Check if player has completed the phrase
        if (this.typingCurrentText === this.typingTargetText) {
            this.endTypingGame(true);
        }
    }
    
    private updateTypingDisplay(): void {
        // If input field doesn't exist, exit
        if (!this.typingGameInput) return;
        
        // Make sure empty input shows a cursor character
        const displayText = this.typingCurrentText || '|';
        
        // Display the current input text with word wrapping
        this.typingGameInput.setText(displayText);
        
        // Make sure text is visible with high contrast
        this.typingGameInput.setColor('#000000');
        this.typingGameInput.setFontSize(22); // Larger font for better visibility
        
        // Log for debugging
        console.log('Current typed text:', this.typingCurrentText);
    }
    
    private endTypingGame(success: boolean): void {
        // Stop the typing game
        this.typingGameActive = false;
        
        // Get scene objects for restoring background
        const sceneObjects = this.scene.getSceneObjects();
        
        // Restore the original background alpha
        this.scene.tweens.add({
            targets: sceneObjects.background,
            alpha: this.originalBackgroundAlpha,
            duration: 500,
            ease: 'Power2'
        });
        
        // Clean up all game elements
        if (this.typingGameBackground) this.typingGameBackground.destroy();
        if (this.typingGameText) this.typingGameText.destroy();
        if (this.typingGameInput) this.typingGameInput.destroy();
        
        // Store references to elements we need to destroy
        const textElementsToDestroy: Phaser.GameObjects.Text[] = [];
        const graphicsToDestroy: Phaser.GameObjects.GameObject[] = [];
        
        // Find all elements created for the game
        this.scene.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                // Find all text elements with depth 11 or 12 (our typing game UI)
                if (child.depth === 11 || child.depth === 12) {
                    textElementsToDestroy.push(child);
                }
            }
            if (child instanceof Phaser.GameObjects.Rectangle || child instanceof Phaser.GameObjects.Graphics) {
                // Find all graphics elements with depth 11 or 12
                if (child.depth === 11 || child.depth === 12) {
                    graphicsToDestroy.push(child);
                }
            }
        });
        
        // Destroy all found elements
        textElementsToDestroy.forEach(textElement => {
            textElement.destroy();
        });
        
        graphicsToDestroy.forEach(graphic => {
            graphic.destroy();
        });
        
        // Remove keyboard listener
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown', this.handleTypingKeypress, this);
        }
        
        // Handle the result
        if (success) {
            this.dialog.showDialog("Finally done. One less thing to worry about.", DialogType.PROTAGONIST);
            this.gameState.playerChoices['computer'] = 'completed';
            this.gameState.interactedObjects.add('computer');
        } else {
            this.dialog.showDialog("I couldn't finish the report. I'll try again.", DialogType.PROTAGONIST);
        }
        
        // Check if player is ready to leave
        this.gameState.checkReadyToLeave();
    }
} 