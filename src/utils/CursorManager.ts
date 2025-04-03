/**
 * CursorManager - Manages custom cursor throughout the game
 * Replaces default browser cursor with custom game cursor images
 */
export class CursorManager {
    private scene: Phaser.Scene;
    private cursorSprite: Phaser.GameObjects.Image | null = null;
    private isInitialized: boolean = false;
    private cursorScale: number = 0.5; // Scale for cursor size
    private offsetX: number = 0; // X offset from pointer position
    private offsetY: number = 0; // Y offset from pointer position

    /**
     * Initialize the CursorManager with a scene reference
     * @param scene The current Phaser scene
     * @param options Optional configuration
     */
    constructor(scene: Phaser.Scene, options?: { scale?: number, offsetX?: number, offsetY?: number }) {
        this.scene = scene;
        
        // Apply optional configuration
        if (options) {
            if (options.scale) this.cursorScale = options.scale;
            if (options.offsetX !== undefined) this.offsetX = options.offsetX;
            if (options.offsetY !== undefined) this.offsetY = options.offsetY;
        }
    }

    /**
     * Initialize custom cursors
     */
    init(): void {
        if (this.isInitialized) return;
        
        // Hide the default browser cursor
        this.scene.game.canvas.style.cursor = 'none';
        
        // Create a cursor sprite that follows the pointer
        this.cursorSprite = this.scene.add.image(0, 0, 'cursor_default');
        this.cursorSprite.setOrigin(0, 0); // Set origin to top-left
        this.cursorSprite.setDepth(1000); // Ensure cursor is always on top
        this.cursorSprite.setScale(this.cursorScale); // Apply scaling
        
        // Update cursor position on pointer move
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.cursorSprite) {
                this.cursorSprite.x = pointer.x + this.offsetX;
                this.cursorSprite.y = pointer.y + this.offsetY;
            }
        });
        
        // Add listeners for gameobject interactions
        this.scene.input.on('gameobjectover', () => {
            this.setPointerCursor();
        });
        
        this.scene.input.on('gameobjectout', () => {
            this.setDefaultCursor();
        });
        
        // Make cursor visible on scene start
        this.updatePosition(
            this.scene.input.activePointer.x,
            this.scene.input.activePointer.y
        );
        
        this.isInitialized = true;
    }
    
    /**
     * Manually update cursor position
     */
    updatePosition(x: number, y: number): void {
        if (this.cursorSprite) {
            this.cursorSprite.x = x + this.offsetX;
            this.cursorSprite.y = y + this.offsetY;
        }
    }
    
    /**
     * Switch to the default cursor
     */
    setDefaultCursor(): void {
        if (this.cursorSprite) {
            this.cursorSprite.setTexture('cursor_default');
        }
    }
    
    /**
     * Switch to the pointer/hand cursor
     */
    setPointerCursor(): void {
        if (this.cursorSprite) {
            this.cursorSprite.setTexture('cursor_pointer');
        }
    }
    
    /**
     * Adjust the scale of the cursor
     */
    setScale(scale: number): void {
        this.cursorScale = scale;
        if (this.cursorSprite) {
            this.cursorSprite.setScale(scale);
        }
    }
    
    /**
     * Clean up event listeners when no longer needed
     */
    destroy(): void {
        if (this.cursorSprite) {
            this.cursorSprite.destroy();
            this.cursorSprite = null;
        }
        
        // Restore default cursor
        if (this.scene && this.scene.game && this.scene.game.canvas) {
            this.scene.game.canvas.style.cursor = 'default';
        }
        
        this.isInitialized = false;
    }
} 