import { Scene1_Office } from './index';

// Dialog type enum to distinguish between narration and protagonist dialog
export enum DialogType {
    NARRATION,
    PROTAGONIST
}

export class DialogSystem {
    private dialogText?: Phaser.GameObjects.Text;
    private currentChoiceButtons: Phaser.GameObjects.Text[] = [];
    
    private scene: Scene1_Office;
    
    constructor(scene: Scene1_Office) {
        this.scene = scene;
    }
    
    public showDialog(text: string, type: DialogType = DialogType.NARRATION, choices?: string[], callback?: (choice: string) => void): void {
        // First, clear any existing dialog boxes or choice buttons
        this.hideDialog();
        
        // Get scene dimensions for center positioning
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;
        const centerX = gameWidth / 2;
        const dialogY = gameHeight - 200; // Match the position in setupNarration
        
        // Show appropriate dialog element based on type
        const sceneObjects = this.scene.getSceneObjects();
        
        // Set position and visibility of the active dialog box
        let dialogBox: Phaser.GameObjects.Image;
        let textOffsetY = -20; // Slight upward offset for text within box
        
        if (type === DialogType.NARRATION) {
            // Show narration box, hide protagonist
            sceneObjects.narrator.setVisible(true);
            sceneObjects.protagonist.setVisible(false);
            dialogBox = sceneObjects.narrator;
        } else {
            // Show protagonist, hide narration box
            sceneObjects.narrator.setVisible(false);
            sceneObjects.protagonist.setVisible(true);
            dialogBox = sceneObjects.protagonist;
        }
        
        // Create dialog text positioned within the dialog box
        // We create this text AFTER showing the dialog box to ensure proper layering
        this.dialogText = this.scene.add.text(centerX, dialogY + textOffsetY, text, { 
            fontSize: '24px', 
            color: '#000000',
            align: 'center',
            wordWrap: { width: 900 }
        })
        .setOrigin(0.5)
        .setDepth(101); // Set depth higher than dialog boxes
        
        // If there are choices, display them below the text
        if (choices && choices.length > 0) {
            const choiceButtons: Phaser.GameObjects.Text[] = [];
            
            // Position choices at the bottom of the dialog box
            const choiceStartY = dialogY + 40; // Starting position for choices
            
            choices.forEach((choice, index) => {
                const yPos = choiceStartY + (index * 40); // Position choices from top down
                const button = this.scene.add.text(centerX, yPos, choice, { 
                    fontSize: '20px', 
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                })
                .setOrigin(0.5)
                .setDepth(101) // Same depth as dialog text
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => button.setColor('#aaaaaa'))
                .on('pointerout', () => button.setColor('#ffffff'))
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
        
        // Debug - visualize dialog box bounds
        // this.visualizeDialogBounds(dialogBox);
    }
    
    // Debug helper to visualize bounds of dialog box
    private visualizeDialogBounds(dialogBox: Phaser.GameObjects.Image): void {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(
            dialogBox.x - dialogBox.displayWidth / 2,
            dialogBox.y - dialogBox.displayHeight / 2,
            dialogBox.displayWidth,
            dialogBox.displayHeight
        );
    }
    
    public hideDialog(): void {
        // Hide both narration elements
        const sceneObjects = this.scene.getSceneObjects();
        if (sceneObjects.narrator) {
            sceneObjects.narrator.setVisible(false);
        }
        if (sceneObjects.protagonist) {
            sceneObjects.protagonist.setVisible(false);
        }
        
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