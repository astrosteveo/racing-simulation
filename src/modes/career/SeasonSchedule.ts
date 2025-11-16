/**
 * Season Schedule
 *
 * Defines the 10-race season structure and provides navigation helpers
 */

/**
 * Single race in a season
 */
export interface SeasonRace {
  raceNumber: number;    // Race number in season (1-10)
  trackId: string;       // Track identifier
  laps: number;          // Number of laps for this race
}

/**
 * Default 10-race season schedule
 *
 * Starts with 3 unlocked tracks (Bristol, Charlotte, Daytona)
 * then adds variety with different track types
 */
const DEFAULT_SCHEDULE: SeasonRace[] = [
  // Race 1: Bristol (short track) - UNLOCKED
  {
    raceNumber: 1,
    trackId: 'bristol',
    laps: 500,
  },
  // Race 2: Charlotte (intermediate) - UNLOCKED
  {
    raceNumber: 2,
    trackId: 'charlotte',
    laps: 250,
  },
  // Race 3: Daytona (superspeedway) - UNLOCKED
  {
    raceNumber: 3,
    trackId: 'daytona',
    laps: 200,
  },
  // Race 4: Return to short track
  {
    raceNumber: 4,
    trackId: 'bristol',
    laps: 500,
  },
  // Race 5: Intermediate oval
  {
    raceNumber: 5,
    trackId: 'charlotte',
    laps: 250,
  },
  // Race 6: Superspeedway
  {
    raceNumber: 6,
    trackId: 'daytona',
    laps: 200,
  },
  // Race 7: Short track
  {
    raceNumber: 7,
    trackId: 'bristol',
    laps: 500,
  },
  // Race 8: Intermediate
  {
    raceNumber: 8,
    trackId: 'charlotte',
    laps: 250,
  },
  // Race 9: Superspeedway
  {
    raceNumber: 9,
    trackId: 'daytona',
    laps: 200,
  },
  // Race 10: Championship finale at intermediate
  {
    raceNumber: 10,
    trackId: 'charlotte',
    laps: 250,
  },
];

/**
 * Get the default season schedule (10 races)
 *
 * @returns Array of 10 season races
 */
export function getDefaultSchedule(): SeasonRace[] {
  // Return a copy to prevent external modification
  return DEFAULT_SCHEDULE.map((race) => ({ ...race }));
}

/**
 * Get the next race in the schedule
 *
 * @param currentRace - Current race number
 * @param schedule - Season schedule
 * @returns Next race or null if season complete
 */
export function getNextRace(
  currentRace: number,
  schedule: SeasonRace[]
): SeasonRace | null {
  const nextRaceNumber = currentRace + 1;
  return getRaceByNumber(nextRaceNumber, schedule);
}

/**
 * Get a specific race by number
 *
 * @param raceNumber - Race number to find (1-10)
 * @param schedule - Season schedule
 * @returns Race or null if not found
 */
export function getRaceByNumber(
  raceNumber: number,
  schedule: SeasonRace[]
): SeasonRace | null {
  if (raceNumber < 1 || raceNumber > schedule.length) {
    return null;
  }
  return schedule.find((race) => race.raceNumber === raceNumber) ?? null;
}

/**
 * Check if season is complete
 *
 * @param currentRace - Current race number
 * @returns True if all 10 races completed
 */
export function isSeasonComplete(currentRace: number): boolean {
  return currentRace >= 10;
}
