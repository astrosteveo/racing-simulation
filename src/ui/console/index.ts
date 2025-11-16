/**
 * Console Renderer
 * Main UI renderer for terminal/console display
 * Implements UIRenderer interface
 */

import type { UIRenderer, RaceState, RaceResults, MenuOption, Decision } from '../../types';
import { renderLiveRaceDisplay } from './components/LiveRaceDisplay';
// renderRaceResults available in RaceResultsDisplay.ts for future advanced results rendering
// import { renderRaceResults } from './components/RaceResultsDisplay';
import { renderDriverStatusPanel } from './components/DriverStatusPanel';
import { showMenu, clearScreen, pressEnterToContinue } from './input/MenuHandler';

/**
 * Console-based UI renderer
 * Displays race state, results, and menus in terminal
 */
export class ConsoleRenderer implements UIRenderer {
  private displayWidth: number;
  private autoClear: boolean;

  constructor(options: { width?: number; autoClear?: boolean } = {}) {
    this.displayWidth = options.width || 60;
    this.autoClear = options.autoClear ?? true;
  }

  /**
   * Render current race state
   */
  render(state: RaceState): void {
    if (this.autoClear) {
      this.clear();
    }

    const display = renderLiveRaceDisplay(state, {
      standingsDepth: 10,
      width: this.displayWidth,
      showCarStatus: true,
      showMentalState: true,
    });

    console.log(display);
  }

  /**
   * Prompt player for decision
   * Returns chosen option ID
   */
  async promptDecision(decision: Decision): Promise<string> {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                   DECISION REQUIRED');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Lap ${decision.context.lap}`);
    console.log(decision.prompt);
    console.log('');

    const menuOptions: MenuOption[] = decision.options.map(opt => ({
      id: opt.id,
      label: opt.label,
      description: `${opt.description} (Risk: ${opt.riskLevel.toUpperCase()})`,
    }));

    const choice = await showMenu(menuOptions, 'Your decision:');
    return choice;
  }

  /**
   * Show race results
   */
  showResults(results: RaceResults): void {
    if (this.autoClear) {
      this.clear();
    }

    // Get track from results (we need to pass it)
    // For now, we'll create a simplified display
    // TODO: Store track reference or pass it separately

    const sections: string[] = [];

    sections.push('═'.repeat(this.displayWidth));
    sections.push('                      RACE RESULTS');
    sections.push('═'.repeat(this.displayWidth));
    sections.push('');

    sections.push(`FINISHING POSITION: P${results.finishPosition}  (${results.positionsGained > 0 ? '+' : ''}${results.positionsGained} from start)`);
    sections.push('');

    sections.push('RACE STATS:');
    sections.push(`  Started:      P${results.startPosition}`);
    sections.push(`  Finished:     P${results.finishPosition}`);
    sections.push(`  Laps Led:     ${results.lapsLed}`);
    sections.push(`  Laps Done:    ${results.lapsCompleted}`);
    sections.push(`  Clean Laps:   ${results.cleanLaps}`);
    sections.push('');

    if (Object.keys(results.xpGained).length > 0) {
      sections.push('XP GAINED:');
      Object.entries(results.xpGained).forEach(([skill, xp]) => {
        if (xp > 0) {
          const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
          sections.push(`  ${skillName}: +${xp}`);
        }
      });
      sections.push('');
    }

    sections.push('═'.repeat(this.displayWidth));

    console.log(sections.join('\n'));
  }

  /**
   * Show menu and get selection
   * Returns selected option ID
   */
  async showMenu(options: MenuOption[]): Promise<string> {
    return showMenu(options);
  }

  /**
   * Clear display
   */
  clear(): void {
    clearScreen();
  }

  /**
   * Display driver status panel
   * (Not part of UIRenderer interface, but useful utility)
   */
  showDriverStatus(state: RaceState): void {
    if (this.autoClear) {
      this.clear();
    }

    const display = renderDriverStatusPanel(state.playerDriver, {
      width: this.displayWidth,
      showSkills: true,
      showMentalState: true,
      showCareerStats: true,
    });

    console.log(display);
  }

  /**
   * Wait for user input before continuing
   */
  async waitForContinue(): Promise<void> {
    await pressEnterToContinue();
  }
}

// Export for convenience
export { ConsoleRenderer as default };
