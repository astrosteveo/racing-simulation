/**
 * Career Menu Component
 *
 * Career mode menu with driver stats and race options
 */

import type { MenuOption, CareerSave } from '../../../types';
import { isSeasonComplete } from '../../../modes/career/SeasonSchedule';

/**
 * Career Menu
 *
 * Provides career mode navigation with contextual information
 */
export class CareerMenu {
  private careerState: CareerSave;

  /**
   * Create a CareerMenu
   *
   * @param careerState - Current career save state
   */
  constructor(careerState: CareerSave) {
    this.careerState = careerState;
  }

  /**
   * Get menu options
   *
   * @returns Array of menu options
   */
  getMenuOptions(): MenuOption[] {
    const seasonComplete = isSeasonComplete(this.careerState.race - 1);

    return [
      {
        id: 'next-race',
        label: 'Next Race',
        description: seasonComplete
          ? 'Season complete! Advance to next season first'
          : `Race ${this.careerState.race} of 10`,
        disabled: seasonComplete,
      },
      {
        id: 'standings',
        label: 'Championship Standings',
        description: 'View your season standings',
      },
      {
        id: 'driver-profile',
        label: 'Driver Profile',
        description: 'View skills and career stats',
      },
      {
        id: 'season-schedule',
        label: 'Season Schedule',
        description: 'View race calendar',
      },
      {
        id: 'save-exit',
        label: 'Save & Exit',
        description: 'Return to main menu',
      },
    ];
  }

  /**
   * Get menu title
   *
   * @returns Title with driver info
   */
  getTitle(): string {
    const { driver } = this.careerState;
    return `CAREER MODE - ${driver.name} #${driver.number}`;
  }

  /**
   * Get menu prompt
   *
   * @returns Prompt text
   */
  getPrompt(): string {
    return 'What would you like to do?';
  }

  /**
   * Get formatted career summary
   *
   * @returns Multi-line summary of career progress
   */
  getCareerSummary(): string {
    const { season, race, points, driver } = this.careerState;
    const { stats } = driver;

    const lines = [
      `Season ${season} - Race ${race}/10`,
      `Championship points: ${points}`,
      '',
      `Career stats:`,
      `  races: ${stats.races} | wins: ${stats.wins} | top 5: ${stats.top5} | top 10: ${stats.top10}`,
      `  average finish: ${stats.avgFinish.toFixed(1)}`,
      `  laps led: ${stats.lapsLed}`,
    ];

    return lines.join('\n');
  }
}
