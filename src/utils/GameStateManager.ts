import * as Phaser from 'phaser';

/**
 * Possible ending types based on player choices.
 */
export enum Ending {
  BALANCED = 'balanced',    // Player makes balanced choices
  WORKAHOLIC = 'workaholic', // Player prioritizes work over personal needs
  CAREFREE = 'carefree',     // Player prioritizes personal freedom
  BURNOUT = 'burnout'        // Player ignores self-care
}

export interface GameState {
    interactedWith: { [key: string]: boolean };
    hasCompletedTypingGame: boolean;
    currentSceneId?: string;
    flags: { [key: string]: any };
}

const DEFAULT_STATE: GameState = {
    interactedWith: {},
    hasCompletedTypingGame: false,
    flags: {}
};

const LOCAL_STORAGE_KEY = 'game_progress';

/**
 * GameStateManager handles tracking player choices and determining game outcomes.
 * This is a singleton class that can be accessed from anywhere in the game.
 */
export class GameStateManager {
  private static instance: GameStateManager;
  
  private state: GameState;
  private stateResetForCurrentSession: boolean = false;
  
  // Player choices and game state
  private playerChoices: Record<string, string> = {};
  private interactedObjects: Set<string> = new Set();
  
  // Track scores for different ending paths
  private endingScores: Record<Ending, number> = {
    [Ending.BALANCED]: 0,
    [Ending.WORKAHOLIC]: 0, 
    [Ending.CAREFREE]: 0,
    [Ending.BURNOUT]: 0
  };

  // Private constructor for singleton pattern
  private constructor() {
    // Load state from localStorage or use default
    this.state = this.loadState();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Check if this is a new session and reset state if needed
   */
  public checkAndResetForNewSession(): void {
    if (!this.stateResetForCurrentSession) {
      // We're in a new session, reset the state
      this.stateResetForCurrentSession = true;
    }
  }

  /**
   * Reset state for Scene1-specific interactions
   */
  public resetForScene1(): void {
    // Clear specific interactions needed for Scene1 progression
    this.state.interactedWith = {};
    this.state.hasCompletedTypingGame = false;
    this.saveState();
  }

  /**
   * Record a player choice and update ending scores
   */
  public recordChoice(choiceId: string, choice: string, scoreUpdates?: Partial<Record<Ending, number>>): void {
    // Record the choice
    this.playerChoices[choiceId] = choice;
    
    // Save to localStorage for persistence
    localStorage.setItem('playerChoices', JSON.stringify(this.playerChoices));
    
    // Update ending scores if provided
    if (scoreUpdates) {
      for (const [ending, score] of Object.entries(scoreUpdates)) {
        this.endingScores[ending as Ending] += score;
      }
      localStorage.setItem('endingScores', JSON.stringify(this.endingScores));
    }
  }

  /**
   * Mark an object as interacted with
   */
  public markInteraction(objectId: string): void {
    this.state.interactedWith[objectId] = true;
    this.saveState();
  }

  /**
   * Check if an object has been interacted with
   */
  public hasInteractedWith(objectId: string): boolean {
    return !!this.state.interactedWith[objectId];
  }

  /**
   * Get all player choices
   */
  public getAllChoices(): Record<string, string> {
    return this.playerChoices;
  }

  /**
   * Get a specific player choice
   */
  public getChoice(choiceId: string): string | undefined {
    return this.playerChoices[choiceId];
  }

  /**
   * Determine the ending based on accumulated scores
   */
  public determineEnding(): Ending {
    // Find the ending with the highest score
    let highestScore = -1;
    let resultEnding = Ending.BALANCED;
    
    for (const [ending, score] of Object.entries(this.endingScores)) {
      if (score > highestScore) {
        highestScore = score;
        resultEnding = ending as Ending;
      }
    }
    
    return resultEnding;
  }

  /**
   * Set a custom flag
   */
  public setFlag(key: string, value: any): void {
    this.state.flags[key] = value;
    this.saveState();
  }

  /**
   * Get a custom flag
   */
  public getFlag(key: string): any {
    return this.state.flags[key];
  }

  /**
   * Set current scene
   */
  public setCurrentScene(sceneId: string): void {
    this.state.currentSceneId = sceneId;
    this.saveState();
  }

  /**
   * Get current scene
   */
  public getCurrentScene(): string | undefined {
    return this.state.currentSceneId;
  }

  /**
   * Mark typing game as completed
   */
  public markTypingGameCompleted(): void {
    this.state.hasCompletedTypingGame = true;
    this.saveState();
  }

  /**
   * Has typing game been completed
   */
  public hasCompletedTypingGame(): boolean {
    return this.state.hasCompletedTypingGame;
  }

  /**
   * Reset the entire game state
   */
  public resetState(): void {
    this.state = {...DEFAULT_STATE};
    this.stateResetForCurrentSession = true;
    
    // Clear local storage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  private loadState(): GameState {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      // If there's an error, use default state
    }
    return {...DEFAULT_STATE};
  }

  private saveState(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      // Handle localStorage errors (e.g., quota exceeded)
    }
  }

  /**
   * Get the current game state (for debugging)
   */
  public getState(): GameState {
    return {...this.state};
  }
} 