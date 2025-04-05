import { Scene1_Office } from './index';

export class DialogSystem {
    private dialogText?: Phaser.GameObjects.Text;
    private currentChoiceButtons: Phaser.GameObjects.Text[] = [];
    
    private scene: Scene1_Office;
    
    constructor(scene: Scene1_Office) {
        this.scene = scene;
    }
    
    public showDialog(text: string, choices?: string[], callback?: (choice: string) => void): void {
        // First, clear any existing dialog boxes or choice buttons
        this.hideDialog();
        
        // Show the narration elements (narration box and protagonist)
        this.scene.showNarration(true);
        
        // Get the narration box position for text positioning
        const sceneObjects = this.scene.getSceneObjects();
        const narrationBox = sceneObjects.narrator;
        
        // Create dialog text positioned on the narration box
        this.dialogText = this.scene.add.text(narrationBox.x + 100, narrationBox.y, text, { 
            fontSize: '24px', 
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: 550 }
        }).setOrigin(0, 0.5);
        
        // If there are choices, display them below the text
        if (choices && choices.length > 0) {
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            choices.forEach((choice, index) => {
                const yPos = narrationBox.y + 50 + (index * 40);
                const button = this.scene.add.text(narrationBox.x + 120, yPos, choice, { 
                    fontSize: '20px', 
                    color: '#ffff00',
                    backgroundColor: '#333333',
                    padding: { x: 10, y: 5 }
                })
                .setOrigin(0, 0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => button.setColor('#ff0000'))
                .on('pointerout', () => button.setColor('#ffff00'))
                .on('pointerdown', () => {
                    // Handle the choice via callback
                    if (callback) {
                        callback(choice);
                    }
                    // Remove all choice buttons
                    choiceButtons.forEach(btn => btn.destroy());
                    // Hide dialog after choice
                    this.hideDialog();
                });
                
                // Store the button in our array for later removal
                choiceButtons.push(button);
                
                // Also store the buttons in a scene property for cleanup
                if (!this.currentChoiceButtons) {
                    this.currentChoiceButtons = [];
                }
                this.currentChoiceButtons.push(button);
            });
        } else {
            // If no choices, hide dialog after a click
            this.scene.input.once('pointerdown', () => {
                this.hideDialog();
            });
        }
    }
    
    public hideDialog(): void {
        // Hide the narration elements
        this.scene.showNarration(false);
        
        // Destroy the dialog text
        if (this.dialogText) {
            this.dialogText.destroy();
            this.dialogText = undefined;
        }
        
        // Remove any existing choice buttons
        if (this.currentChoiceButtons && this.currentChoiceButtons.length > 0) {
            this.currentChoiceButtons.forEach(button => {
                if (button && button.active) {
                    button.destroy();
                }
            });
            this.currentChoiceButtons = [];
        }
    }
} 