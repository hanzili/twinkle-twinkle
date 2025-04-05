import { Scene1_Office } from './index';

export class GameState {
    // Game state tracking
    public interactedObjects: Set<string> = new Set();
    public playerChoices: Record<string, string> = {};
    public isReadyToLeave: boolean = false;
    
    private scene: Scene1_Office;
    
    constructor(scene: Scene1_Office) {
        this.scene = scene;
    }
    
    public markInteraction(objectId: string, choice?: string): void {
        // Mark an object as interacted with
        this.interactedObjects.add(objectId);
        
        // If choice is provided, record it
        if (choice) {
            this.playerChoices[objectId] = choice;
        }
        
        // Check if we're ready to leave
        this.checkReadyToLeave();
    }
    
    public checkReadyToLeave(): void {
        // Player must interact with mini-game computer and fish tank (mandatory) to be able to leave
        if (this.interactedObjects.has('computer') && this.interactedObjects.has('fishtank')) {
            if (!this.isReadyToLeave) {
                this.isReadyToLeave = true;
                
                // Show "Ready to leave" prompt
                this.scene.time.delayedCall(1000, () => {
                    const leaveButton = this.scene.add.text(512, 200, 'Ready to leave the office?', { 
                        fontSize: '28px', 
                        color: '#ffffff',
                        backgroundColor: '#550000',
                        padding: { x: 20, y: 10 }
                    })
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerover', () => leaveButton.setBackgroundColor('#770000'))
                    .on('pointerout', () => leaveButton.setBackgroundColor('#550000'))
                    .on('pointerdown', () => {
                        this.scene.leaveOffice();
                    });
                });
            }
        }
    }
} 