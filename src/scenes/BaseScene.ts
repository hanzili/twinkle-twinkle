import { Scene } from 'phaser';
import { CursorManager } from '../utils/CursorManager';

/**
 * Energy levels for the player throughout the game
 */
export enum EnergyLevel {
    EMPTY = 'empty',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

/**
 * Base scene class that provides common functionality for all game scenes,
 * including cursor management, transitions, and other shared logic.
 */
export class BaseScene extends Scene {
    protected cursorManager: CursorManager;
    protected cursorInitialized: boolean = false;
    protected energyDisplay: Phaser.GameObjects.Image;
    private originalAddText: Function;

    constructor(key: string) {
        super(key);
    }

    /**
     * Default create method that runs in every scene
     * Child scenes should call super.create() at the beginning of their create method
     */
    create(): void {
        // Store the default font in the registry so it's available to all scenes
        this.registry.set('defaultFont', 'PressStart2P');

        // Override the add.text method to always use our font
        // This ensures all text created with this.add.text() uses our font
        if (!this.originalAddText) {
            this.originalAddText = this.add.text;

            // @ts-ignore - We're deliberately overriding the add.text method
            this.add.text = (x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) => {
                // Ensure style is an object
                const newStyle = style || {};

                // ALWAYS apply our font to all text objects, overriding any existing fontFamily
                newStyle.fontFamily = 'PressStart2P';

                // Call the original method with our enhanced style
                return this.originalAddText.call(this.add, x, y, text, newStyle);
            };
        }
    }

    /**
     * Get default font style configuration for text elements
     * This provides consistent text styling across all scenes
     * @param overrides Optional style properties to override defaults
     * @returns Text style configuration object
     */
    protected getDefaultFontStyle(overrides: Phaser.Types.GameObjects.Text.TextStyle = {}): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontFamily: 'PressStart2P',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            ...overrides
        };
    }

    /**
     * Initialize the custom cursor with consistent settings
     * Call this in the create() method of child scenes
     */
    protected initCursor(options?: { scale?: number, offsetX?: number, offsetY?: number }): void {
        if (this.cursorInitialized) return;

        const cursorOptions = {
            scale: 0.02,
            offsetX: 0,
            offsetY: 0,
            ...options
        };

        this.cursorManager = new CursorManager(this, cursorOptions);
        this.cursorManager.init();
        this.cursorInitialized = true;
    }

    /**
     * Display the energy indicator in the top right corner
     * @param level The energy level to display
     * @param options Optional configuration for the energy display
     */
    protected showEnergyLevel(
        level: EnergyLevel,
        options: { scale?: number, x?: number, y?: number } = {}
    ): void {
        // Remove any existing energy display
        if (this.energyDisplay) {
            this.energyDisplay.destroy();
        }

        // Configure position and scale (with defaults)
        const x = options.x ?? this.cameras.main.width - 110;
        const y = options.y ?? 70;
        const scale = options.scale ?? 0.1;

        // Create the energy indicator at the top right corner
        this.energyDisplay = this.add.image(x, y, `energy-${level}`);

        // Apply scaling
        this.energyDisplay.setScale(scale);

        // Ensure it's visible above other elements
        this.energyDisplay.setDepth(100);

        // Store the energy level in local storage for persistence between scenes
        localStorage.setItem('playerEnergyLevel', level);
    }

    /**
     * Get the current energy level from storage or default to LOW
     */
    protected getCurrentEnergyLevel(): EnergyLevel {
        const storedLevel = localStorage.getItem('playerEnergyLevel');
        if (storedLevel && Object.values(EnergyLevel).includes(storedLevel as EnergyLevel)) {
            return storedLevel as EnergyLevel;
        }
        return EnergyLevel.LOW; // Default to LOW if not set
    }

    /**
     * Clean up cursor and other resources when leaving this scene
     * This runs automatically when the scene stops
     */
    shutdown(): void {
        // Stop all audio when leaving the scene
        this.sound.stopAll();

        if (this.cursorManager) {
            this.cursorManager.destroy();
            this.cursorInitialized = false;
        }
    }

    /**
     * Helper method to transition to another scene with proper cursor cleanup
     */
    protected transitionToScene(sceneKey: string): void {
        // Stop all audio when transitioning
        this.sound.stopAll();

        if (this.cursorManager) {
            this.cursorManager.destroy();
            this.cursorInitialized = false;
        }

        this.scene.start(sceneKey);
    }
}
