/**
 * Career Manager
 *
 * Orchestrates career mode progression:
 * - Create/load careers
 * - Process race completions
 * - Award championship points
 * - Manage driver progression
 * - Track season advancement
 */

import type { CareerSave, Driver, RaceResults, DriverSkills, XPGain } from '../../types';
import { calculateRacePoints } from './ChampionshipPoints';
import { isSeasonComplete as checkSeasonComplete } from './SeasonSchedule';

/**
 * Career Manager
 *
 * Maintains career state and orchestrates progression
 */
export class CareerManager {
  private careerState: CareerSave | null = null;

  /**
   * Start a new career
   *
   * @param driverName - Player driver name
   * @param driverNumber - Car number
   * @returns New career save
   */
  startNewCareer(driverName: string, driverNumber: string): CareerSave {
    // Generate driver ID from name
    const driverId = this.generateDriverId(driverName);

    // Create rookie driver
    const driver: Driver = this.createRookieDriver(driverId, driverName, driverNumber);

    // Initialize career
    this.careerState = {
      driverId,
      driver,
      season: 1,
      race: 1,
      points: 0,
      unlockedTracks: ['bristol', 'charlotte', 'daytona'],
      raceHistory: [],
    };

    return this.getCurrentState();
  }

  /**
   * Load existing career
   *
   * @param save - Career save to load
   */
  loadCareer(save: CareerSave): void {
    this.careerState = { ...save };
  }

  /**
   * Get current career state
   *
   * @returns Copy of current career save
   */
  getCurrentState(): CareerSave {
    if (!this.careerState) {
      throw new Error('No career loaded. Call startNewCareer() or loadCareer() first.');
    }

    // Return deep copy to prevent external modification
    return JSON.parse(JSON.stringify(this.careerState));
  }

  /**
   * Complete a race and update career state
   *
   * @param results - Race results
   * @param mostLapsLed - Whether player led most laps in race
   */
  completeRace(results: RaceResults, mostLapsLed: boolean): void {
    if (!this.careerState) {
      throw new Error('No career loaded.');
    }

    // Award championship points
    const pointsAwarded = calculateRacePoints(
      results.finishPosition,
      results.lapsLed,
      mostLapsLed
    );
    this.careerState.points += pointsAwarded.totalPoints;

    // Update driver stats
    this.updateDriverStats(results);

    // Apply XP to driver skills
    this.applyXP(results.xpGained);

    // Add to race history
    this.careerState.raceHistory.push(results);

    // Increment race number
    this.careerState.race += 1;
  }

  /**
   * Check if season is complete
   *
   * @returns True if all 10 races completed
   */
  isSeasonComplete(): boolean {
    if (!this.careerState) {
      return false;
    }
    return checkSeasonComplete(this.careerState.race - 1); // -1 because race increments after completion
  }

  /**
   * Advance to next season
   *
   * Resets race number and points, increments season
   */
  advanceToNextSeason(): void {
    if (!this.careerState) {
      throw new Error('No career loaded.');
    }

    this.careerState.season += 1;
    this.careerState.race = 1;
    this.careerState.points = 0;
    // Note: race history and driver progression are preserved
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate driver ID from name
   *
   * @param name - Driver name
   * @returns ID (lowercase, hyphenated)
   */
  private generateDriverId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Create a rookie driver with randomized skills (30-40 range)
   *
   * @param id - Driver ID
   * @param name - Driver name
   * @param number - Car number
   * @returns Rookie driver
   */
  private createRookieDriver(id: string, name: string, number: string): Driver {
    return {
      id,
      name,
      number,
      isPlayer: true,
      skills: {
        racecraft: this.randomRookieSkill(),
        consistency: this.randomRookieSkill(),
        aggression: this.randomRookieSkill(),
        focus: this.randomRookieSkill(),
        stamina: this.randomRookieSkill(),
        composure: this.randomRookieSkill(),
        draftSense: this.randomRookieSkill(),
        tireManagement: this.randomRookieSkill(),
        fuelManagement: this.randomRookieSkill(),
        pitStrategy: this.randomRookieSkill(),
      },
      mentalState: {
        confidence: 50,
        frustration: 50,
        focus: 50,
        distraction: 50,
      },
      stats: {
        races: 0,
        wins: 0,
        top5: 0,
        top10: 0,
        poles: 0,
        lapsLed: 0,
        avgFinish: 0,
      },
    };
  }

  /**
   * Generate random rookie skill level (30-40)
   *
   * @returns Skill value
   */
  private randomRookieSkill(): number {
    return Math.floor(Math.random() * 11) + 30; // 30-40 inclusive
  }

  /**
   * Update driver career statistics
   *
   * @param results - Race results
   */
  private updateDriverStats(results: RaceResults): void {
    if (!this.careerState) return;

    const stats = this.careerState.driver.stats;

    // Increment races
    stats.races += 1;

    // Update win/top5/top10 counts
    if (results.finishPosition === 1) {
      stats.wins += 1;
    }
    if (results.finishPosition <= 5) {
      stats.top5 += 1;
    }
    if (results.finishPosition <= 10) {
      stats.top10 += 1;
    }

    // Update laps led
    stats.lapsLed += results.lapsLed;

    // Update average finish (running average)
    stats.avgFinish =
      (stats.avgFinish * (stats.races - 1) + results.finishPosition) / stats.races;
  }

  /**
   * Apply XP gains to driver skills
   *
   * Formula: Every 100 XP = 1 skill point
   * Max skill: 100
   *
   * @param xpGains - XP awarded for each skill
   */
  private applyXP(xpGains: XPGain[]): void {
    if (!this.careerState) return;

    const skills = this.careerState.driver.skills;

    for (const gain of xpGains) {
      const skillKey = gain.skill as keyof DriverSkills;

      // Calculate skill point increase (100 XP = 1 point)
      const skillIncrease = gain.amount / 100;

      // Apply increase, cap at 100
      skills[skillKey] = Math.min(100, skills[skillKey] + skillIncrease);
    }
  }
}
