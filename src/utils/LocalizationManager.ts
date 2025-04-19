/**
 * LocalizationManager
 * 
 * Handles language selection and text retrieval for the game.
 * Implements the singleton pattern for global access.
 */

export type SupportedLanguage = 'en' | 'zh';

export class LocalizationManager {
  private static instance: LocalizationManager;
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Record<SupportedLanguage, Record<string, any>> = {
    en: {},
    zh: {}
  };

  /**
   * Private constructor (singleton pattern)
   */
  private constructor() {
    this.loadSavedLanguage();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): LocalizationManager {
    if (!LocalizationManager.instance) {
      LocalizationManager.instance = new LocalizationManager();
    }
    return LocalizationManager.instance;
  }

  /**
   * Change the current language and save preference
   */
  public async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      localStorage.setItem('preferred_language', lang);
      
      // Load language file if not already loaded
      if (Object.keys(this.translations[lang]).length === 0) {
        await this.loadLanguageFile(lang);
      }
    }
  }

  /**
   * Get text by key with optional parameter replacement
   * Handles nested keys with dot notation (e.g., "main_menu.start_game")
   */
  public getText(key: string, params?: Record<string, string>): string {
    // Get text by traversing the nested object structure
    const text = this.getNestedValue(this.translations[this.currentLanguage], key);
    
    // Fallback to English if translation missing and not already in English
    if (!text && this.currentLanguage !== 'en') {
      const englishText = this.getNestedValue(this.translations['en'], key);
      if (englishText) return this.applyParams(englishText, params);
    }
    
    // If we have a valid text, apply parameters and return
    if (text) return this.applyParams(text, params);
    
    // Fallback to key if no translation found
    return key;
  }

  /**
   * Helper function to get a value from a nested object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Apply parameter replacements to text
   */
  private applyParams(text: string, params?: Record<string, string>): string {
    if (!params) return text;
    
    let result = text;
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(`{${param}}`, value);
    });
    
    return result;
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Load saved language preference from localStorage
   */
  private loadSavedLanguage(): void {
    const saved = localStorage.getItem('preferred_language') as SupportedLanguage | null;
    if (saved && (saved === 'en' || saved === 'zh')) {
      this.currentLanguage = saved;
    }
    
    // Load the current language file
    this.loadLanguageFile(this.currentLanguage);
  }

  /**
   * Load language file from the server
   */
  private async loadLanguageFile(lang: SupportedLanguage): Promise<void> {
    try {
      const response = await fetch(`/assets/localization/${lang}.json`);
      if (response.ok) {
        this.translations[lang] = await response.json();
        console.log(`Loaded ${lang} translations:`, this.translations[lang]);
      } else {
        console.error(`Failed to load language file for ${lang}: ${response.statusText}`);
        this.translations[lang] = {};
      }
    } catch (error) {
      console.error(`Error loading language file for ${lang}:`, error);
      this.translations[lang] = {};
    }
  }
} 