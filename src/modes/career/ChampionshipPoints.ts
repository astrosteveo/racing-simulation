/**
 * Championship Points Calculator
 *
 * NASCAR-style championship points calculation
 * - 1st place: 40 points, 2nd: 35, 3rd: 34, ..., 40th: 1
 * - Bonus: +5 for leading a lap
 * - Bonus: +5 for leading most laps
 * - Maximum: 50 points per race (win + both bonuses)
 */

/**
 * Points awarded for a race
 */
export interface PointsAwarded {
  finishPoints: number;       // Points for finish position
  lapsLedBonus: number;       // Bonus for leading a lap (+5 or 0)
  mostLapsLedBonus: number;   // Bonus for most laps led (+5 or 0)
  totalPoints: number;        // Total points earned
}

/**
 * NASCAR championship points table
 * Position -> Points
 */
const POINTS_TABLE: Record<number, number> = {
  1: 40,
  2: 35,
  3: 34,
  4: 33,
  5: 32,
  6: 31,
  7: 30,
  8: 29,
  9: 28,
  10: 27,
  11: 26,
  12: 25,
  13: 24,
  14: 23,
  15: 22,
  16: 21,
  17: 20,
  18: 19,
  19: 18,
  20: 17,
  21: 16,
  22: 15,
  23: 14,
  24: 13,
  25: 12,
  26: 11,
  27: 10,
  28: 9,
  29: 8,
  30: 7,
  31: 6,
  32: 5,
  33: 4,
  34: 3,
  35: 2,
  36: 1,
  37: 1,
  38: 1,
  39: 1,
  40: 1,
};

/**
 * Calculate championship points for a race finish
 *
 * @param finishPosition - Final position (1-40)
 * @param lapsLed - Number of laps led
 * @param mostLapsLed - Whether driver led most laps in race
 * @returns Points breakdown
 * @throws Error if position < 1 or lapsLed < 0
 */
export function calculateRacePoints(
  finishPosition: number,
  lapsLed: number,
  mostLapsLed: boolean
): PointsAwarded {
  // Validation
  if (finishPosition < 1) {
    throw new Error(`Invalid finish position: ${finishPosition}. Must be at least 1.`);
  }
  if (lapsLed < 0) {
    throw new Error(`Invalid laps led: ${lapsLed}. Cannot be negative.`);
  }

  // Get base points from table (any position beyond 40th gets 1 point)
  const finishPoints = POINTS_TABLE[finishPosition] ?? 1;

  // Calculate bonuses
  const lapsLedBonus = lapsLed > 0 ? 5 : 0;
  const mostLapsLedBonus = mostLapsLed ? 5 : 0;

  // Total points
  const totalPoints = finishPoints + lapsLedBonus + mostLapsLedBonus;

  return {
    finishPoints,
    lapsLedBonus,
    mostLapsLedBonus,
    totalPoints,
  };
}
