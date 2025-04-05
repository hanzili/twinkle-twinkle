/**
 * Possible ending types based on player choices.
 */
export enum Ending {
  BALANCED = 'balanced',    // Player makes balanced choices
  WORKAHOLIC = 'workaholic', // Player prioritizes work over personal needs
  CAREFREE = 'carefree',     // Player prioritizes personal freedom
  BURNOUT = 'burnout'        // Player ignores self-care
}

/**
 * GameStateManager handles tracking player choices and determining game outcomes.
 * This is a singleton class that can be accessed from anywhere in the game.
 */
export class GameStateManager {
  private static instance: GameStateManager;
  
  // Store all player choices here
  private choices: Record<string, any> = {};
  
  // Track scores for different ending paths
  private endingScores: Record<Ending, number> = {
    [Ending.BALANCED]: 0,
    [Ending.WORKAHOLIC]: 0, 
    [Ending.CAREFREE]: 0,
    [Ending.BURNOUT]: 0
  };

  // Private constructor for singleton pattern
  private constructor() {
    // Load any existing state from localStorage
    this.loadState();
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
   * Record a player choice and update relevant ending scores
   * @param key The decision identifier
   * @param value The choice made
   * @param scoreUpdates Optional map of ending scores to update
   */
  public recordChoice(key: string, value: any, scoreUpdates?: Partial<Record<Ending, number>>): void {
    // Store the choice
    this.choices[key] = value;
    
    // Update ending scores if provided
    if (scoreUpdates) {
      Object.entries(scoreUpdates).forEach(([ending, score]) => {
        if (score && ending in this.endingScores) {
          this.endingScores[ending as Ending] += score;
        }
      });
    }
    
    // Save to localStorage
    this.saveState();
  }

  /**
   * Get a specific player choice
   * @param key The decision identifier
   * @returns The value of the choice, or undefined if not made
   */
  public getChoice(key: string): any {
    return this.choices[key];
  }

  /**
   * Get all player choices
   * @returns Record of all choices
   */
  public getAllChoices(): Record<string, any> {
    return { ...this.choices };
  }

  /**
   * Determine the best ending based on current scores
   * @returns The ending type with the highest score
   */
  public determineEnding(): Ending {
    let highestScore = -1;
    let bestEnding = Ending.BALANCED; // Default ending
    
    Object.entries(this.endingScores).forEach(([ending, score]) => {
      if (score > highestScore) {
        highestScore = score;
        bestEnding = ending as Ending;
      }
    });
    
    return bestEnding;
  }

  /**
   * Check if two specific endings are tied for highest score
   * @returns Whether there's a tie
   */
  public hasTiedEndings(): boolean {
    const scores = Object.values(this.endingScores);
    const maxScore = Math.max(...scores);
    // Count how many times the max score appears
    return scores.filter(score => score === maxScore).length > 1;
  }

  /**
   * Get the current score for a specific ending
   * @param ending The ending type
   * @returns The current score for that ending
   */
  public getEndingScore(ending: Ending): number {
    return this.endingScores[ending] || 0;
  }

  /**
   * Get all ending scores
   * @returns Record of all ending scores
   */
  public getAllEndingScores(): Record<Ending, number> {
    return { ...this.endingScores };
  }

  /**
   * Reset all player choices and ending scores
   */
  public resetState(): void {
    this.choices = {};
    this.endingScores = {
      [Ending.BALANCED]: 0,
      [Ending.WORKAHOLIC]: 0,
      [Ending.CAREFREE]: 0,
      [Ending.BURNOUT]: 0
    };
    localStorage.removeItem('gameState');
  }

  /**
   * Save current state to localStorage
   */
  private saveState(): void {
    const state = {
      choices: this.choices,
      endingScores: this.endingScores
    };
    localStorage.setItem('gameState', JSON.stringify(state));
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.choices = state.choices || {};
      
      // Initialize default ending scores
      this.endingScores = {
        [Ending.BALANCED]: 0,
        [Ending.WORKAHOLIC]: 0,
        [Ending.CAREFREE]: 0,
        [Ending.BURNOUT]: 0
      };
      
      // Apply saved scores if they exist
      if (state.endingScores) {
        // Only update valid endings that exist in our enum
        Object.entries(state.endingScores).forEach(([ending, score]) => {
          if (ending in this.endingScores) {
            this.endingScores[ending as Ending] = score as number;
          }
        });
      }
    }
  }
} 