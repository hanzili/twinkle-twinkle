import {Scene1_Office} from './index';
import {DialogManager, DialogType} from '../../utils/DialogManager';
import {GameStateManager} from '../../utils/GameStateManager';
import {TypingGame} from '../../minigames/TypingGame';

export class InteractionHandlers {
    private scene: Scene1_Office;
    private dialogManager: DialogManager;
    private gameStateManager: GameStateManager;
    private typingGame: TypingGame | null = null;

    constructor(scene: Scene1_Office, dialogManager: DialogManager, gameStateManager: GameStateManager) {
        this.scene = scene;
        this.dialogManager = dialogManager;
        this.gameStateManager = gameStateManager;
    }

    // Set the typing game reference (needed to avoid circular dependency)
    public setTypingGame(typingGame: TypingGame): void {
        this.typingGame = typingGame;
    }

    public handleDoorInteraction = async (): Promise<void> => {
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        await this.dialogManager.showDialog(
            "It's too early to leave work. I should get some tasks done first.",
            DialogType.PROTAGONIST
        );
    }

    public handleCoffeeInteraction = async (): Promise<void> => {
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        if (this.gameStateManager.hasInteractedWith('coffee')) {
            await this.dialogManager.showDialog(
                "I've already had my coffee today. Any more and I'll be too jittery.",
                DialogType.PROTAGONIST
            );
            return;
        }

        this.gameStateManager.markInteraction('coffee');

        await this.dialogManager.showDialogSequence([
            {
                text: "I could use some coffee to help me focus on work.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "You take a sip of coffee. Energy +1",
                type: DialogType.NARRATION
            }
        ]);
    }

    public handleComputerInteraction = async (): Promise<void> => {

        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        if (this.gameStateManager.hasInteractedWith('computer')) {
            await this.dialogManager.showDialog(
                "I've already checked my email. I should focus on other tasks.",
                DialogType.PROTAGONIST
            );
            return;
        }

        this.gameStateManager.markInteraction('computer');

        const dialogResult = await this.dialogManager.showDialogSequence([
            {
                text: "I should check my emails before starting the day.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "You have several unread emails. The most urgent one is from your boss asking for the quarterly report.",
                type: DialogType.NARRATION
            },
            {
                text: "What should I do?",
                type: DialogType.CHOICE,
                choices: [
                    "Start working on the report immediately",
                    "Check other emails first",
                    "Take a break to gather my thoughts"
                ]
            }
        ]);

        const choice = dialogResult[2]; // The index of the choice dialog
        if (choice === "Start working on the report immediately") {
            await this.startTypingGame();
        } else if (choice === "Check other emails first") {
            await this.dialogManager.showDialog(
                "The other emails can wait. I should prioritize the report for my boss.",
                DialogType.PROTAGONIST
            );
            await this.startTypingGame();
        } else {
            await this.dialogManager.showDialog(
                "I'll take a quick moment to collect my thoughts before diving in.",
                DialogType.PROTAGONIST
            );
            await this.startTypingGame();
        }
    }

    public handlePlantInteraction = async (): Promise<void> => {

        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        if (this.gameStateManager.hasInteractedWith('plant')) {
            await this.dialogManager.showDialog(
                "I've already watered the plant today.",
                DialogType.PROTAGONIST
            );
            return;
        }

        this.gameStateManager.markInteraction('plant');

        await this.dialogManager.showDialogSequence([
            {
                text: "My little desk plant could use some water.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "You water the plant. It seems happier now.",
                type: DialogType.NARRATION
            }
        ]);
    }

    public handleFishTankInteraction = async (): Promise<void> => {

        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        if (this.gameStateManager.hasInteractedWith('fishtank')) {
            await this.dialogManager.showDialog(
                "I've already fed the fish today.",
                DialogType.PROTAGONIST
            );
            return;
        }

        this.gameStateManager.markInteraction('fishtank');

        await this.dialogManager.showDialogSequence([
            {
                text: "Time to feed my fish friend.",
                type: DialogType.PROTAGONIST
            },
            {
                text: "You sprinkle some fish food into the tank. The fish swims excitedly.",
                type: DialogType.NARRATION
            }
        ]);

        // Check if player can leave after interacting with the fish tank
        this.checkIfCanLeave();
    }

    private async startTypingGame(): Promise<void> {
        await this.dialogManager.showDialog(
            "Let me focus and get this report done.",
            DialogType.PROTAGONIST
        );

        // Hide dialog before starting game
        this.dialogManager.hideDialog();

        // Clear all glow hints before starting the typing game
        this.scene.clearGlowHints();

        // Start the typing game
        if (this.typingGame) {
            this.typingGame.start();
        } else {
            console.error('TypingGame not initialized');
        }
    }

    // Check if player has completed required interactions to leave
    private checkIfCanLeave(): void {
        // Player must interact with computer and fish tank to be able to leave
        if (this.gameStateManager.hasInteractedWith('computer') &&
            this.gameStateManager.hasInteractedWith('fishtank')) {
            this.createLeaveButton();
        }
    }

    // Create a button to leave the office
    private createLeaveButton(): void {
        try {
            this.scene.sound.play('click');
        } catch (e) {
            console.log('Audio playback failed, continuing without sound');
        }

        const centerX = this.scene.cameras.main.width / 2;

        // Create the leave button
        const leaveButton = this.scene.add.text(centerX, 200, 'Ready to leave the office?', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {x: 20, y: 10}
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => leaveButton.setBackgroundColor('#333333'))
            .on('pointerout', () => leaveButton.setBackgroundColor('#000000'))
            .on('pointerdown', () => {
                this.scene.leaveOffice();
            });
    }
}
