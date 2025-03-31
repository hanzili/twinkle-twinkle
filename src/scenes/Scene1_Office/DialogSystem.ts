import { Scene1_Office } from './index';

export class DialogSystem {
    private dialogBox: Phaser.GameObjects.Rectangle;
    private dialogText: Phaser.GameObjects.Text;
    private currentChoiceButtons: Phaser.GameObjects.Text[] = [];
    
    private scene: Scene1_Office;
    
    constructor(scene: Scene1_Office) {
        this.scene = scene;
    }
    
    public showDialog(text: string, choices?: string[], callback?: (choice: string) => void): void {
        // First, clear any existing dialog boxes or choice buttons
        this.hideDialog();
        
        // Create or show dialog box
        if (!this.dialogBox) {
            this.dialogBox = this.scene.add.rectangle(512, 650, 900, 150, 0x000000, 0.8);
            this.dialogText = this.scene.add.text(512, 650, text, { 
                fontFamily: 'Arial', 
                fontSize: '24px', 
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 850 }
            }).setOrigin(0.5);
        } else {
            this.dialogBox.setVisible(true);
            this.dialogText.setText(text).setVisible(true);
        }
        
        // If there are choices, display them
        if (choices && choices.length > 0) {
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            choices.forEach((choice, index) => {
                const yPos = 700 + (index * 40);
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
        // Hide the dialog box and text
        if (this.dialogBox && this.dialogText) {
            this.dialogBox.setVisible(false);
            this.dialogText.setVisible(false);
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