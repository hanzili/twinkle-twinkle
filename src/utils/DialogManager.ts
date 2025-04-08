import * as Phaser from 'phaser';

// Dialog type enum to distinguish between narration and protagonist dialog
export enum DialogType {
    NARRATION,
    PROTAGONIST,
    CHOICE
}

export class DialogManager {
    private static instance: DialogManager;

    // Dialog elements
    private dialogText?: Phaser.GameObjects.Text;
    private narrationBox?: Phaser.GameObjects.Image;
    private protagonistBox?: Phaser.GameObjects.Image;
    private currentChoiceButtons: Phaser.GameObjects.Text[] = [];

    // Current scene reference
    private currentScene?: Phaser.Scene;

    // Private constructor (singleton pattern)
    private constructor() {
    }

    /**
     * Get the singleton instance of DialogManager
     */
    public static getInstance(): DialogManager {
        if (!DialogManager.instance) {
            DialogManager.instance = new DialogManager();
        }
        return DialogManager.instance;
    }

    /**
     * Initialize the dialog manager with a scene
     * Must be called when entering a new scene that uses dialogs
     */
    public init(scene: Phaser.Scene): void {
        this.currentScene = scene;
        this.setupDialogElements();
    }

    /**
     * Setup dialog elements for the current scene
     */
    private setupDialogElements(): void {
        if (!this.currentScene) return;

        const gameWidth = this.currentScene.cameras.main.width;
        const gameHeight = this.currentScene.cameras.main.height;
        const centerX = gameWidth / 2;
        const dialogY = gameHeight - 450;

        // Clean up existing elements first
        this.cleanup();

        // Create dialog boxes if they don't exist
        this.narrationBox = this.currentScene.add.image(centerX, dialogY, 'narration')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100);

        this.protagonistBox = this.currentScene.add.image(centerX, dialogY, 'protagonist')
            .setVisible(false)
            .setScale(0.5)
            .setDepth(100);

        // Create dialog text field
        this.dialogText = this.currentScene.add.text(centerX, dialogY + 250, '', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#000000',
            align: 'center',
            wordWrap: {width: 900}
        })
            .setOrigin(0.5)
            .setDepth(101)
            .setVisible(false);
    }

    private dialogClickBlocker?: Phaser.GameObjects.Rectangle;


    /**
     * Show dialog with optional choices and callback
     * Returns a Promise that resolves when dialog is dismissed or a choice is made
     */
    public showDialog(text: string, type: DialogType = DialogType.NARRATION, choices?: string[]): Promise<string> {
        return new Promise((resolve) => {
            // Clear any existing dialog
            this.hideDialog();

            if (!this.currentScene) {
                console.error("DialogManager: No current scene set");
                resolve("");
                return;
            }

            // Check if elements are properly initialized
            if (!this.dialogText || !this.narrationBox || !this.protagonistBox) {
                // Try to re-initialize
                this.setupDialogElements();

                // Check again after re-initialization
                if (!this.dialogText || !this.narrationBox || !this.protagonistBox) {
                    console.error("DialogManager: Failed to initialize dialog elements, cannot show dialog");
                    resolve("");
                    return;
                }
            }

            // Show the appropriate dialog box
            if (type === DialogType.NARRATION) {
                this.narrationBox?.setVisible(true);
                this.protagonistBox?.setVisible(false);
            } else {
                this.narrationBox?.setVisible(false);
                this.protagonistBox?.setVisible(true);
            }

            // Set the dialog text
            if (this.dialogText) {
                this.dialogText.setText(text);
                this.dialogText.setVisible(true);
            }

            // If there are choices, display them
            // 添加遮罩层，防止点击其他区域触发交互
            this.dialogClickBlocker = this.currentScene.add.rectangle(
                this.currentScene.cameras.main.width / 2,
                this.currentScene.cameras.main.height / 2,
                this.currentScene.cameras.main.width,
                this.currentScene.cameras.main.height,
                0x000000,
                0 // 完全透明
            )
                .setDepth(99)
                .setInteractive();

            if (choices && choices.length > 0) {
                const choiceButtons: Phaser.GameObjects.Text[] = [];

                // Position choices at the bottom of the dialog box
                const choiceStartY = (this.dialogText?.y || 0) + 60;

                choices.forEach((choice, index) => {
                    if (!this.currentScene) return;

                    const yPos = choiceStartY + (index * 40);

                    const button = this.currentScene.add.text(
                        this.currentScene.cameras.main.width / 2,
                        yPos,
                        choice,
                        {
                            fontSize: '20px',
                            color: '#ffffff',
                            backgroundColor: '#000000',
                            padding: {x: 10, y: 5}
                        }
                    )
                        .setOrigin(0.5)
                        .setDepth(101)
                        .setInteractive({useHandCursor: true})
                        .on('pointerover', () => button.setColor('#aaaaaa'))
                        .on('pointerout', () => button.setColor('#ffffff'))
                        .on('pointerdown', () => {
                            this.dialogClickBlocker?.destroy();
                            this.dialogClickBlocker = undefined;

                            // Remove all choice buttons
                            choiceButtons.forEach(btn => btn.destroy());

                            // Hide dialog
                            this.hideDialog();

                            // Resolve the promise with the selected choice
                            resolve(choice);
                        });

                    // Store buttons for cleanup
                    choiceButtons.push(button);
                    this.currentChoiceButtons.push(button);
                });
            } else {
                this.dialogClickBlocker.once('pointerdown', () => {
                    this.dialogClickBlocker?.destroy();
                    this.dialogClickBlocker = undefined;

                    this.hideDialog();
                    resolve("");
                });
            }

        });
    }

    /**
     * Hide and clean up all dialog elements
     */
    public hideDialog(): void {
        // Hide dialog boxes
        this.narrationBox?.setVisible(false);
        this.protagonistBox?.setVisible(false);

        // Hide dialog text
        if (this.dialogText) {
            this.dialogText.setVisible(false);
        }

        // Remove any existing choice buttons
        if (this.currentChoiceButtons.length > 0) {
            this.currentChoiceButtons.forEach(button => {
                if (button && button.active) {
                    button.destroy();
                }
            });
            this.currentChoiceButtons = [];
        }

        if (this.dialogClickBlocker) {
            this.dialogClickBlocker.destroy();
            this.dialogClickBlocker = undefined;
        }

    }

    /**
     * Clean up all dialog elements (call when changing scenes)
     */
    public cleanup(): void {
        this.hideDialog();

        // Destroy all elements
        this.dialogText?.destroy();
        this.narrationBox?.destroy();
        this.protagonistBox?.destroy();

        // Reset references
        this.dialogText = undefined;
        this.narrationBox = undefined;
        this.protagonistBox = undefined;
    }

    /**
     * Show a sequence of dialogs one after another
     * Returns a Promise that resolves when all dialogs are complete
     */
    public async showDialogSequence(dialogSequence: {
        text: string,
        type?: DialogType,
        choices?: string[]
    }[]): Promise<string[]> {
        const results: string[] = [];

        for (const dialog of dialogSequence) {
            const result = await this.showDialog(
                dialog.text,
                dialog.type || DialogType.NARRATION,
                dialog.choices
            );
            results.push(result);
        }

        return results;
    }
}
