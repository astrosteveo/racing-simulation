/**
 * Tire Physics Module
 *
 * Implements NASCAR tire degradation and performance impact calculations.
 * Based on real NASCAR tire behavior and physics research.
 *
 * Reference: docs/PHYSICS-REFERENCE.md (Section 1: Tire Physics)
 */

import type { TrackType } from '../../types';

/**
 * Tire life constants by track type (in laps)
 */
const TIRE_LIFE: Record<TrackType, number> = {
  short: 100,          // Short tracks (Bristol, Martinsville)
  intermediate: 120,   // Intermediate tracks (Charlotte, Atlanta)
  superspeedway: 140,  // Superspeedways (Daytona, Talladega)
  road: 110,          // Road courses (approximate)
};

/**
 * Calculate current tire grip as a percentage
 *
 * Tire grip degrades linearly from 100% (fresh) to 50% (worn out).
 * Minimum grip is capped at 50% - tires never go completely dead.
 *
 * @param lapsOnTires - Number of laps completed on current tire set
 * @param trackType - Type of track (affects tire life)
 * @returns Grip level from 0.5 to 1.0 (50% to 100%)
 *
 * @example
 * ```typescript
 * const freshGrip = calculateTireGrip(0, 'short');        // 1.0 (100%)
 * const halfLife = calculateTireGrip(50, 'short');        // 0.75 (75%)
 * const endOfLife = calculateTireGrip(100, 'short');      // 0.5 (50%)
 * const overused = calculateTireGrip(200, 'short');       // 0.5 (50% floor)
 * ```
 */
export function calculateTireGrip(
  lapsOnTires: number,
  trackType: TrackType
): number {
  const tireLife = TIRE_LIFE[trackType];

  // Linear degradation from 100% to 50% over tire life
  // Formula: grip = 1.0 - (laps / tireLife) * 0.5
  // Clamped to minimum of 0.5 (50% grip floor)
  const gripRemaining = Math.max(0.5, 1.0 - (lapsOnTires / tireLife) * 0.5);

  return gripRemaining;
}

/**
 * Calculate lap time penalty from tire wear
 *
 * Tire wear affects lap time in a non-linear fashion:
 * - Fresh tires (80%+ grip): No penalty (baseline performance)
 * - Moderate wear (50-79% grip): Linear penalty up to 5%
 * - Severe wear (<50% grip): Exponential penalty up to 20%
 *
 * @param baseLapTime - Ideal lap time with fresh tires (seconds)
 * @param tireGripPercentage - Current tire grip (0-100)
 * @returns Adjusted lap time in seconds
 *
 * @example
 * ```typescript
 * const base = 15.4; // Bristol lap time
 * const fresh = calculateLapTimeFromTireWear(base, 100);    // 15.4s (no penalty)
 * const moderate = calculateLapTimeFromTireWear(base, 65);  // ~15.6s (+1.3%)
 * const worn = calculateLapTimeFromTireWear(base, 30);      // ~16.8s (+9%)
 * ```
 */
export function calculateLapTimeFromTireWear(
  baseLapTime: number,
  tireGripPercentage: number
): number {
  // Fresh tires (80%+ grip) - no penalty
  if (tireGripPercentage >= 80) {
    return baseLapTime;
  }

  // Moderate wear (50-79% grip) - linear penalty
  if (tireGripPercentage >= 50) {
    // Penalty scales from 0% at 80% grip to ~4% at 50% grip
    // Adjusted to match Example 2: 50% grip should add 0.5-0.7s on 15.5s lap
    // wearPenalty = (1.0 - grip/100) * 0.08
    // At 75% grip: (1.0 - 0.75) * 0.08 = 0.02 (2% penalty)
    // At 50% grip: (1.0 - 0.50) * 0.08 = 0.04 (4% penalty)
    const wearPenalty = (1.0 - tireGripPercentage / 100) * 0.08;
    return baseLapTime * (1 + wearPenalty);
  }

  // Severe wear (<50% grip) - exponential degradation
  // Penalty increases rapidly below 50% grip
  // At 30% grip: ~9% penalty
  // At 10% grip: ~17% penalty
  const severePenalty = Math.pow((1.0 - tireGripPercentage / 100), 1.5) * 0.20;
  return baseLapTime * (1 + severePenalty);
}

/**
 * Calculate tire wear rate per lap
 *
 * Base wear rate depends on track type. Multipliers can increase wear:
 * - Aggression: Higher aggression = faster wear
 * - Side-by-side racing: +10% wear
 *
 * @param trackType - Type of track
 * @param aggressionMultiplier - Driver aggression (1.0 = normal, 1.5 = aggressive)
 * @param isRacingSideBySide - Whether car is wheel-to-wheel with another
 * @returns Percentage of tire life consumed per lap
 *
 * @example
 * ```typescript
 * const normal = calculateTireWearRate('short', 1.0, false);     // ~1.0% per lap
 * const aggressive = calculateTireWearRate('short', 1.5, false); // ~1.5% per lap
 * const sideBySide = calculateTireWearRate('short', 1.0, true);  // ~1.1% per lap
 * const both = calculateTireWearRate('short', 1.5, true);        // ~1.65% per lap
 * ```
 */
export function calculateTireWearRate(
  trackType: TrackType,
  aggressionMultiplier: number,
  isRacingSideBySide: boolean
): number {
  const tireLife = TIRE_LIFE[trackType];

  // Base wear rate: 100% / tire life = percentage per lap
  // Short track (100 laps): 1.0% per lap
  // Intermediate (120 laps): 0.833% per lap
  // Superspeedway (140 laps): 0.714% per lap
  let wearRate = 100 / tireLife;

  // Apply aggression multiplier
  wearRate *= aggressionMultiplier;

  // Apply side-by-side racing penalty (+10% wear)
  if (isRacingSideBySide) {
    wearRate *= 1.10;
  }

  return wearRate;
}

/**
 * Calculate section speed adjustment from tire wear
 *
 * Tire wear affects corners more than straights:
 * - Corners are grip-limited: linear correlation with tire grip
 * - Straights are power-limited: reduced correlation (50% + 50% * grip)
 *
 * @param baseSpeed - Section's ideal speed (MPH)
 * @param tireGrip - Current tire grip (0.5-1.0)
 * @param isTurn - Whether this section is a turn
 * @returns Adjusted speed for section
 *
 * @example
 * ```typescript
 * const turnSpeed = calculateSectionSpeedFromTireWear(120, 0.75, true);
 * // = 90 mph (75% of 120 - grip-limited)
 *
 * const straightSpeed = calculateSectionSpeedFromTireWear(140, 0.75, false);
 * // = 122.5 mph (87.5% of 140 - power-limited)
 * ```
 */
export function calculateSectionSpeedFromTireWear(
  baseSpeed: number,
  tireGrip: number,
  isTurn: boolean
): number {
  if (isTurn) {
    // Corners are grip-limited - linear correlation
    return baseSpeed * tireGrip;
  } else {
    // Straights are power-limited - reduced effect
    // Formula: 50% baseline + 50% scaled by grip
    // At 100% grip: 0.5 + 0.5 * 1.0 = 1.0 (full speed)
    // At 50% grip: 0.5 + 0.5 * 0.5 = 0.75 (75% speed)
    const straightWearEffect = 0.5 + (tireGrip * 0.5);
    return baseSpeed * straightWearEffect;
  }
}
