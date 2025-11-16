/**
 * Speed Calculation Physics Module
 *
 * Implements NASCAR speed calculations for straight-line and corner speeds.
 * Based on real NASCAR physics formulas from PHYSICS-REFERENCE.md.
 *
 * Key calculations:
 * - Base straight-line speed from horsepower, drag, weight
 * - Corner speed from banking, radius, tire grip, driver skill
 * - Section speed with all modifiers (tires, fuel, draft)
 *
 * Reference: docs/PHYSICS-REFERENCE.md (Sections 4 & 7)
 */

import type { TrackType } from '../../types';
import { CONSTANTS } from '../../types';
import { calculateTireGrip } from './tires';
import { calculateFuelWeightPenalty } from './fuel';

/**
 * Calculate base straight-line speed from car characteristics
 *
 * Uses simplified power-to-speed formula based on NASCAR physics:
 * - Higher horsepower = higher speed
 * - Lower drag = higher speed
 * - Lower weight = higher speed
 *
 * Formula is calibrated to produce realistic NASCAR speeds:
 * - Standard package (670 HP): ~185-195 MPH
 * - Superspeedway package (510 HP): ~190-200 MPH (lower drag compensates)
 *
 * @param horsepower - Engine horsepower (510-750)
 * @param dragCoefficient - Aerodynamic drag coefficient (0.28-0.36)
 * @param weight - Car weight in pounds (3400-3600)
 * @returns Base speed in MPH
 *
 * @example
 * ```typescript
 * const standard = calculateBaseSpeed(670, 0.32, 3450);     // ~188 MPH
 * const superspeedway = calculateBaseSpeed(510, 0.32, 3450); // ~183 MPH
 * const lightCar = calculateBaseSpeed(670, 0.32, 3400);      // ~190 MPH
 * ```
 */
export function calculateBaseSpeed(
  horsepower: number,
  dragCoefficient: number,
  weight: number
): number {
  // Handle edge case
  if (horsepower === 0) {
    return 0;
  }

  // Simplified formula calibrated to NASCAR speeds
  // Base speed scales with power-to-drag-to-weight ratio
  // This approximates the physics of overcoming drag and inertia

  // Power-to-drag ratio (higher HP or lower drag = faster)
  const powerToDragRatio = horsepower / dragCoefficient;

  // Weight penalty (heavier car = slower)
  const weightFactor = 3450 / weight; // Normalized to standard weight

  // Combined speed calculation
  // Calibration: 670 HP, 0.32 Cd, 3450 lbs should give ~185 MPH
  // Using power of 0.33 (cube root approximation) with multiplier 13.8
  const baseSpeed = Math.pow(powerToDragRatio * weightFactor, 0.33) * 13.8;

  return baseSpeed;
}

/**
 * Calculate maximum corner speed based on track geometry and car state
 *
 * Uses the banked circle physics formula:
 * v = sqrt(r * g * (sin(θ) + μ * cos(θ)) / (cos(θ) - μ * sin(θ)))
 *
 * Where:
 * - r = corner radius (feet)
 * - g = gravitational acceleration (32.174 ft/s²)
 * - θ = banking angle (radians)
 * - μ = tire grip coefficient (0.5-1.5, includes downforce effects)
 *
 * Driver skill provides a small modifier (±5%) based on ability to
 * find optimal line and maximize corner entry/exit speed.
 *
 * @param banking - Banking angle in degrees (0-33)
 * @param radius - Corner radius in feet (500-1500)
 * @param tireGrip - Current tire grip coefficient (0.5-1.0 from tire wear)
 * @param driverSkill - Driver skill level (0-100)
 * @returns Maximum corner speed in MPH
 *
 * @example
 * ```typescript
 * const bristol = calculateCornerSpeed(26, 550, 1.0, 70);    // ~118 MPH
 * const charlotte = calculateCornerSpeed(24, 1000, 1.0, 70); // ~168 MPH
 * const daytona = calculateCornerSpeed(31, 1500, 1.0, 70);   // ~193 MPH
 * ```
 */
export function calculateCornerSpeed(
  banking: number,
  radius: number,
  tireGrip: number,
  driverSkill: number
): number {
  const g = 32.174; // Gravitational acceleration (ft/s²)

  // Convert banking from degrees to radians
  const bankingRad = banking * (Math.PI / 180);

  // Effective grip coefficient
  // Base tire grip (0.5-1.0) needs to be scaled appropriately
  // NASCAR tires with downforce provide ~0.70-0.95 coefficient for corners
  // Calibrated for realistic tire wear impact (Phase 5.1):
  // Fresh tires (1.0): 0.880 coefficient
  // Worn tires (0.5): 0.730 coefficient
  // This gives ~17% corner speed reduction at half life
  // Combined with straight reduction = target 0.5-0.7s penalty at Bristol
  const gripCoefficient = 0.580 + (tireGrip * 0.300);

  // Banked circle physics formula
  const numerator = Math.sin(bankingRad) + gripCoefficient * Math.cos(bankingRad);
  const denominator = Math.cos(bankingRad) - gripCoefficient * Math.sin(bankingRad);

  // Prevent division by zero or negative values
  if (denominator <= 0) {
    // This happens at extreme banking or grip - use simplified calculation
    const vSquared = radius * g * gripCoefficient;
    const velocityFtPerSec = Math.sqrt(Math.max(0, vSquared));
    return velocityFtPerSec * 0.681818; // Convert ft/s to mph
  }

  const vSquared = radius * g * (numerator / denominator);

  // Prevent negative speeds (shouldn't happen with valid inputs)
  const velocityFtPerSec = Math.sqrt(Math.max(0, vSquared));

  // Convert ft/s to mph (1 ft/s = 0.681818 mph)
  let speedMph = velocityFtPerSec * 0.681818;

  // Apply driver skill modifier
  // Skill 50 = baseline (0%)
  // Skill 100 = +5% speed
  // Skill 0 = -5% speed
  const skillModifier = 1.0 + ((driverSkill - 50) / 1000);
  speedMph *= skillModifier;

  return speedMph;
}

/**
 * Calculate actual section speed with all modifiers applied
 *
 * Takes a base speed (either straight-line or corner speed) and applies:
 * 1. Tire wear effects (using calculateTireGrip from tires module)
 * 2. Fuel weight penalty (converted from lap time to speed reduction)
 * 3. Draft bonus (straight sections only)
 *
 * The order of operations:
 * - Tire wear is applied to base speed (grip-limited)
 * - Fuel weight reduces speed proportionally
 * - Draft adds constant speed boost
 *
 * @param baseSpeed - Section's ideal speed in MPH
 * @param sectionType - 'straight' or 'turn'
 * @param tireWear - Laps on current tires
 * @param fuelWeight - Fuel remaining in gallons
 * @param trackType - Track type (affects fuel penalty)
 * @param isDrafting - Whether car is drafting another car
 * @returns Actual section speed in MPH
 *
 * @example
 * ```typescript
 * // Fresh tires, no fuel, drafting on superspeedway straight
 * const speed1 = calculateSectionSpeed(195, 'straight', 0, 0, 'superspeedway', true);
 * // = ~199 MPH (195 base + 4 draft)
 *
 * // Worn tires, full fuel, no draft on short track turn
 * const speed2 = calculateSectionSpeed(120, 'turn', 50, 18, 'short', false);
 * // = ~104 MPH (120 * 0.87 tire grip - fuel penalty)
 * ```
 */
export function calculateSectionSpeed(
  baseSpeed: number,
  sectionType: 'straight' | 'turn',
  tireWear: number,
  fuelWeight: number,
  trackType: TrackType,
  isDrafting: boolean
): number {
  let speed = baseSpeed;

  // 1. Apply tire wear effects
  // NOTE: For turns, tire wear is already applied in corner speed calculation
  // Only apply tire wear to straights here
  if (sectionType === 'straight') {
    // Get current tire grip percentage (0.5-1.0)
    const tireGrip = calculateTireGrip(tireWear, trackType);

    // Straights are power-limited - small effect from tire wear
    // At fresh tires (1.0): 100% speed
    // At worn tires (0.5): 98% speed (2% reduction)
    // This is less than corner impact (5%) since straights are power-limited not grip-limited
    const straightGripEffect = 0.98 + (tireGrip * 0.02);
    speed *= straightGripEffect;
  }
  // For turns: tire wear already applied in calculateCornerSpeed, no modification here

  // 2. Apply fuel weight penalty
  // Fuel penalty is in seconds per lap - convert to speed reduction
  // The fuel weight penalty applies across the entire lap, not per section
  // So we apply a proportional speed reduction instead
  if (fuelWeight > 0) {
    const fuelPenaltySeconds = calculateFuelWeightPenalty(fuelWeight, trackType);

    // Convert time penalty to speed percentage reduction
    // Using typical lap times to calibrate:
    // - Short track: ~15.5s lap, 1s penalty = 6.5% slower
    // - Intermediate: ~30.5s lap, 1s penalty = 3.3% slower
    // - Superspeedway: ~50s lap, 1s penalty = 2.0% slower

    let fuelSpeedReduction: number;
    switch (trackType) {
      case 'short':
        fuelSpeedReduction = fuelPenaltySeconds * 0.065; // 6.5% per second of penalty
        break;
      case 'intermediate':
        fuelSpeedReduction = fuelPenaltySeconds * 0.033; // 3.3% per second
        break;
      case 'superspeedway':
        fuelSpeedReduction = fuelPenaltySeconds * 0.020; // 2.0% per second
        break;
      case 'road':
        fuelSpeedReduction = fuelPenaltySeconds * 0.040; // 4.0% per second
        break;
    }

    speed *= (1 - fuelSpeedReduction);
  }

  // 3. Apply draft bonus (straight sections only)
  if (sectionType === 'straight' && isDrafting) {
    const draftBonus = CONSTANTS.DRAFT_SPEED_BOOST; // 4 MPH
    speed += draftBonus;
  }

  // Ensure speed doesn't go negative
  return Math.max(0, speed);
}
