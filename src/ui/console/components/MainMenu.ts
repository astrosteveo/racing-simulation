/**
 * Main Menu Component
 *
 * Main game menu with options for different game modes
 */

import type { MenuOption } from '../../../types';

/**
 * Main Menu
 *
 * Provides the primary game navigation
 */
export class MainMenu {
  /**
   * Get menu options
   *
   * @returns Array of menu options
   */
  getMenuOptions(): MenuOption[] {
    return [
      {
        id: 'quick-race',
        label: 'Quick Race',
        description: 'Jump into a single race',
      },
      {
        id: 'career-mode',
        label: 'Career Mode',
        description: 'Start or continue your racing career',
      },
      {
        id: 'settings',
        label: 'Settings',
        description: 'Configure game settings',
      },
      {
        id: 'quit',
        label: 'Quit',
        description: 'Exit the game',
      },
    ];
  }

  /**
   * Get menu title
   *
   * @returns Game title
   */
  getTitle(): string {
    return 'NASCAR RPG RACING SIMULATION';
  }

  /**
   * Get menu prompt
   *
   * @returns Prompt text
   */
  getPrompt(): string {
    return 'What would you like to do?';
  }
}
