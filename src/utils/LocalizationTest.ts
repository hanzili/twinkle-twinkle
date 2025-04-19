/**
 * Simple test for the LocalizationManager
 * This can be run from the browser console to verify functionality
 */

import { LocalizationManager } from './LocalizationManager';

export class LocalizationTest {
  public static async runTest(): Promise<void> {
    console.log("=== Running Localization Test ===");
    
    const locManager = LocalizationManager.getInstance();
    
    // Test English (default)
    console.log("Current language:", locManager.getCurrentLanguage());
    console.log("Start Game text:", locManager.getText("main_menu.start_game"));
    console.log("Dialog 1:", locManager.getText("scene1.intro.dialog1"));
    
    // Test parameter replacement
    console.log("With params:", locManager.getText("scene1.intro.dialog1", { name: "Player" }));
    
    // Test missing key
    console.log("Missing key:", locManager.getText("missing.key"));
    
    // Test changing to Chinese
    console.log("=== Changing to Chinese ===");
    await locManager.setLanguage('zh');
    
    console.log("Current language:", locManager.getCurrentLanguage());
    console.log("Start Game text:", locManager.getText("main_menu.start_game"));
    console.log("Dialog 1:", locManager.getText("scene1.intro.dialog1"));
    
    // Test changing back to English
    console.log("=== Changing back to English ===");
    await locManager.setLanguage('en');
    
    console.log("Current language:", locManager.getCurrentLanguage());
    console.log("Start Game text:", locManager.getText("main_menu.start_game"));
    
    console.log("=== Test Complete ===");
  }
} 