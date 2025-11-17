/**
 * Career Race Runner
 *
 * Runs races in career mode context (simplified, no real-time rendering)
 */

import { RaceEngine } from '../../engine/simulation/race';
import { getDefaultSchedule, getRaceByNumber } from './SeasonSchedule';
import type { CareerSave, RaceResults, Track, XPGain, Driver, DriverSkills, MentalState } from '../../types';

// Track definitions (for career mode)
const bristolTrack: Track = {
  id: 'bristol',
  name: 'Bristol Motor Speedway',
  nickname: 'The Last Great Colosseum',
  length: 0.533,
  type: 'short',
  banking: {
    turns: 26,
    straights: 0,
  },
  surface: 'concrete',
  surfaceGrip: 0.95,
  sections: [
    { type: 'turn', length: 440, banking: 26, radius: 250, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 700, idealLine: 140, surfaceGrip: 0.95 },
    { type: 'turn', length: 440, banking: 26, radius: 250, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 700, idealLine: 140, surfaceGrip: 0.95 },
  ],
  difficulty: 8,
  raceLaps: 500,
};

const charlotteTrack: Track = {
  id: 'charlotte',
  name: 'Charlotte Motor Speedway',
  length: 1.5,
  type: 'intermediate',
  banking: {
    turns: 24,
    straights: 5,
  },
  surface: 'asphalt',
  surfaceGrip: 0.90,
  sections: [
    { type: 'turn', length: 1320, banking: 24, radius: 750, idealLine: 160, surfaceGrip: 0.90 },
    { type: 'straight', length: 1980, idealLine: 195, surfaceGrip: 0.90 },
    { type: 'turn', length: 1320, banking: 24, radius: 750, idealLine: 160, surfaceGrip: 0.90 },
    { type: 'straight', length: 1980, idealLine: 195, surfaceGrip: 0.90 },
  ],
  difficulty: 6,
  raceLaps: 400,
};

const daytonaTrack: Track = {
  id: 'daytona',
  name: 'Daytona International Speedway',
  nickname: 'The World Center of Racing',
  length: 2.5,
  type: 'superspeedway',
  banking: {
    turns: 31,
    straights: 3,
  },
  surface: 'asphalt',
  surfaceGrip: 0.93,
  sections: [
    { type: 'turn', length: 3000, banking: 31, radius: 1000, idealLine: 190, surfaceGrip: 0.93 },
    { type: 'straight', length: 3800, idealLine: 200, surfaceGrip: 0.93 },
    { type: 'turn', length: 3000, banking: 18, radius: 1100, idealLine: 180, surfaceGrip: 0.93 },
    { type: 'straight', length: 3400, idealLine: 200, surfaceGrip: 0.93 },
  ],
  difficulty: 4,
  raceLaps: 200,
};

/**
 * Career Race Runner
 *
 * Orchestrates race execution for career mode
 */
export class CareerRaceRunner {
  /**
   * Run a race for the current career state
   *
   * @param careerState - Current career save
   * @param raceNumber - Race number in season (1-10)
   * @returns Race results
   */
  runRace(careerState: CareerSave, raceNumber: number): RaceResults {
    const schedule = getDefaultSchedule();
    const raceInfo = getRaceByNumber(raceNumber, schedule);

    if (!raceInfo) {
      throw new Error(`Invalid race number: ${raceNumber}`);
    }

    // Get track based on race info
    const track = this.getTrack(raceInfo.trackId);

    // Career mode uses shortened races (50 laps for short/intermediate, 100 for superspeedway)
    const laps = track.type === 'superspeedway' ? 100 : 50;

    // Create AI field
    const aiDrivers = this.createAIField(39); // 39 AI drivers (40 total with player)

    // Create race configuration
    const raceConfig = {
      track,
      laps,
      playerDriver: careerState.driver,
      aiDrivers,
      startPosition: this.calculateStartingPosition(careerState),
    };

    // Initialize and run race
    const engine = new RaceEngine();
    engine.initialize(raceConfig);
    engine.start();

    // Run race to completion using lap-based simulation (fast, still uses real physics)
    while (!engine.isComplete()) {
      engine.simulateLap(); // One calculation per lap (uses calculateLapTime physics)

      // Handle decisions automatically (simple AI for career mode)
      const state = engine.getCurrentState();
      if (state.activeDecision) {
        // Auto-select first option for career mode (player can customize in quick race)
        const firstOption = state.activeDecision.options[0];
        if (firstOption) {
          engine.applyDecision(state.activeDecision, firstOption.id);
        }
      }
    }

    // Get results
    const baseResults = engine.getResults();

    // Calculate XP gains based on performance
    const xpGained = this.calculateXP(baseResults);

    return {
      ...baseResults,
      xpGained,
    };
  }

  /**
   * Get track by ID
   *
   * @param trackId - Track identifier
   * @returns Track object
   */
  private getTrack(trackId: string): Track {
    switch (trackId) {
      case 'bristol':
        return bristolTrack;
      case 'charlotte':
        return charlotteTrack;
      case 'daytona':
        return daytonaTrack;
      default:
        return bristolTrack; // Default to Bristol
    }
  }

  /**
   * Calculate starting position based on career progression
   *
   * @param careerState - Current career save
   * @returns Starting position (1-40)
   */
  private calculateStartingPosition(careerState: CareerSave): number {
    // Rookie drivers start further back
    const averageSkill =
      Object.values(careerState.driver.skills).reduce((a, b) => a + b, 0) / 10;

    // Skills 30-40 (rookie) → start 25-35
    // Skills 50-60 (midpack) → start 15-25
    // Skills 70+ (veteran) → start 5-15

    if (averageSkill < 45) {
      return Math.floor(Math.random() * 11) + 25; // 25-35
    } else if (averageSkill < 65) {
      return Math.floor(Math.random() * 11) + 15; // 15-25
    } else {
      return Math.floor(Math.random() * 11) + 5; // 5-15
    }
  }

  /**
   * Calculate XP gains from race performance
   *
   * @param results - Race results
   * @returns Array of XP gains
   */
  private calculateXP(results: RaceResults): XPGain[] {
    // Base XP scales with finish position (1st = 100, 40th = 10)
    const baseXP = Math.max(10, 110 - results.finishPosition * 2.5);

    // Bonus for positions gained
    const positionBonus = Math.max(0, results.positionsGained * 3);

    // Bonus for laps led
    const lapLeadBonus = Math.min(30, results.lapsLed * 0.5);

    // Bonus for clean racing
    const cleanRacingBonus =
      results.lapsCompleted > 0
        ? (results.cleanLaps / results.lapsCompleted) * 20
        : 0;

    // Bonus for good decisions
    const decisionBonus =
      results.decisionsTotal > 0
        ? (results.decisionsCorrect / results.decisionsTotal) * 20
        : 0;

    const totalXP = baseXP + positionBonus + lapLeadBonus + cleanRacingBonus + decisionBonus;

    // Distribute XP across skills based on race performance
    const xpGains: XPGain[] = [
      { skill: 'racecraft', amount: totalXP * 0.25 + positionBonus * 0.5 },
      { skill: 'consistency', amount: totalXP * 0.15 + cleanRacingBonus },
      { skill: 'focus', amount: totalXP * 0.15 + decisionBonus },
      { skill: 'draftSense', amount: totalXP * 0.1 },
      { skill: 'tireManagement', amount: totalXP * 0.1 },
      { skill: 'fuelManagement', amount: totalXP * 0.1 },
      { skill: 'pitStrategy', amount: totalXP * 0.15 + decisionBonus * 0.5 },
    ];

    // Add randomness to make progression feel organic
    return xpGains.map((xp) => ({
      ...xp,
      amount: xp.amount * (0.8 + Math.random() * 0.4), // ±20% variance
    }));
  }

  /**
   * Create AI driver field
   *
   * @param count - Number of AI drivers to create
   * @returns Array of AI drivers
   */
  private createAIField(count: number): Driver[] {
    const aiDrivers: Driver[] = [];
    const firstNames = ['Dale', 'Richard', 'Jeff', 'Jimmie', 'Tony', 'Kyle', 'Kevin', 'Brad', 'Joey', 'Chase', 'Denny', 'Martin', 'Ryan', 'Kurt', 'Carl', 'Matt', 'Kasey', 'Clint', 'Austin', 'Erik'];
    const lastNames = ['Earnhardt', 'Petty', 'Gordon', 'Johnson', 'Stewart', 'Busch', 'Harvick', 'Keselowski', 'Logano', 'Elliott', 'Hamlin', 'Truex', 'Blaney', 'Smith', 'Edwards', 'Kenseth', 'Kahne', 'Bowyer', 'Dillon', 'Jones'];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[i % firstNames.length] || 'Driver';
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length] || String(i);
      const number = String(i + 2); // Start at #2 (player is usually #1 or their choice)

      // Vary skill levels (30-80 range)
      const baseSkill = 40 + Math.random() * 40;

      const skills: DriverSkills = {
        racecraft: baseSkill + (Math.random() - 0.5) * 10,
        consistency: baseSkill + (Math.random() - 0.5) * 10,
        aggression: baseSkill + (Math.random() - 0.5) * 10,
        focus: baseSkill + (Math.random() - 0.5) * 10,
        stamina: baseSkill + (Math.random() - 0.5) * 10,
        composure: baseSkill + (Math.random() - 0.5) * 10,
        draftSense: baseSkill + (Math.random() - 0.5) * 10,
        tireManagement: baseSkill + (Math.random() - 0.5) * 10,
        fuelManagement: baseSkill + (Math.random() - 0.5) * 10,
        pitStrategy: baseSkill + (Math.random() - 0.5) * 10,
      };

      const mentalState: MentalState = {
        confidence: 50 + Math.random() * 20,
        frustration: 40 + Math.random() * 20,
        focus: 50 + Math.random() * 20,
        distraction: 40 + Math.random() * 20,
      };

      const stats = {
        races: 0,
        wins: 0,
        top5: 0,
        top10: 0,
        poles: 0,
        lapsLed: 0,
        avgFinish: 0,
      };

      aiDrivers.push({
        id: `ai-${i + 1}`,
        name: `${firstName} ${lastName}`,
        number,
        isPlayer: false,
        skills,
        mentalState,
        stats,
      });
    }

    return aiDrivers;
  }
}
