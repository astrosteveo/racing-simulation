/**
 * Fuel Consumption Physics Module
 *
 * Implements NASCAR fuel consumption and weight penalty calculations.
 * Based on real NASCAR data and physics research from the Explore agent.
 *
 * Key Research Findings:
 * - NASCAR engines use BSFC ~0.50 (naturally aspirated)
 * - Fuel consumption varies significantly by track type
 * - Drafting provides 10-12% fuel savings
 * - Driver skill (consistency) affects fuel efficiency by up to 12%
 * - Mental state (frustration/confidence) impacts fuel usage
 * - Fuel weight adds 0.025-0.055 seconds per gallon depending on track
 *
 * Reference: Explore agent research report on fuel consumption physics
 */

import type { TrackType, Driver, Track, CarState, DraftStatus, MentalState } from '../../types';
import { CONSTANTS } from '../../types';

/**
 * Base fuel consumption rates by track type (gallons per lap)
 *
 * These values are derived from real NASCAR data:
 * - Superspeedway: High speed, constant throttle, ~0.27 gal/lap
 * - Intermediate: Balanced speed/braking, ~0.20 gal/lap
 * - Short track: Frequent braking/acceleration, ~0.11 gal/lap
 * - Road course: Complex with elevation changes, ~0.18 gal/lap
 */
const BASE_FUEL_CONSUMPTION: Record<TrackType, number> = {
  superspeedway: CONSTANTS.FUEL_BASE_SUPERSPEEDWAY,
  intermediate: CONSTANTS.FUEL_BASE_INTERMEDIATE,
  short: CONSTANTS.FUEL_BASE_SHORT,
  road: CONSTANTS.FUEL_BASE_ROAD,
};

/**
 * Fuel weight penalty by track type (seconds per gallon)
 *
 * Weight affects performance differently by track:
 * - Short tracks: Heavy braking/acceleration = highest penalty (0.055s/gal)
 * - Intermediate: Balanced = moderate penalty (0.045s/gal)
 * - Superspeedway: High speed dominates = lowest penalty (0.025s/gal)
 * - Road course: Complex layout = moderate-high penalty (0.040s/gal)
 */
const FUEL_WEIGHT_PENALTY: Record<TrackType, number> = {
  superspeedway: CONSTANTS.FUEL_WEIGHT_PENALTY_SUPERSPEEDWAY,
  intermediate: CONSTANTS.FUEL_WEIGHT_PENALTY_INTERMEDIATE,
  short: CONSTANTS.FUEL_WEIGHT_PENALTY_SHORT,
  road: CONSTANTS.FUEL_WEIGHT_PENALTY_ROAD,
};

/**
 * Calculate base fuel consumption for a track type
 *
 * Returns the baseline fuel consumption rate before any modifiers are applied.
 * This represents fuel consumption for an average driver (consistency 70)
 * in clean air (no draft) with neutral mental state.
 *
 * @param trackType - Type of track
 * @returns Base fuel consumption in gallons per lap
 *
 * @example
 * ```typescript
 * const superspeedway = calculateBaseFuelConsumption('superspeedway'); // 0.27 gal/lap
 * const short = calculateBaseFuelConsumption('short');                 // 0.11 gal/lap
 * ```
 */
export function calculateBaseFuelConsumption(trackType: TrackType): number {
  return BASE_FUEL_CONSUMPTION[trackType];
}

/**
 * Apply driver skill modifier to fuel consumption
 *
 * Higher consistency skill = smoother inputs = better fuel economy.
 * Maximum benefit: 12% reduction at 100 consistency
 *
 * Formula: reduction = (consistency / 100) * 0.12
 *
 * @param baseFuel - Base fuel consumption (gallons)
 * @param consistency - Driver consistency skill (0-100)
 * @returns Modified fuel consumption
 *
 * @example
 * ```typescript
 * const base = 0.20;
 * const novice = applyDriverSkillModifier(base, 30);   // 0.1928 (3.6% reduction)
 * const average = applyDriverSkillModifier(base, 70);  // 0.1832 (8.4% reduction)
 * const expert = applyDriverSkillModifier(base, 100);  // 0.176 (12% reduction)
 * ```
 */
export function applyDriverSkillModifier(baseFuel: number, consistency: number): number {
  const skillReduction = (consistency / 100) * CONSTANTS.FUEL_SKILL_MAX_BONUS;
  return baseFuel * (1 - skillReduction);
}

/**
 * Apply mental state modifiers to fuel consumption
 *
 * Mental state affects driving efficiency:
 * - Frustration: Aggressive inputs, more throttle → increased consumption (up to 20%)
 * - Confidence: Smooth driving, optimal lines → decreased consumption (up to 8%)
 *
 * Modifiers are applied sequentially:
 * 1. Apply frustration penalty
 * 2. Apply confidence bonus
 *
 * @param baseFuel - Base fuel consumption (gallons)
 * @param mentalState - Current mental state
 * @returns Modified fuel consumption
 *
 * @example
 * ```typescript
 * const base = 0.20;
 * const calm = { confidence: 100, frustration: 0, focus: 80, distraction: 0 };
 * const result1 = applyMentalStateModifier(base, calm); // 0.184 (8% reduction from confidence)
 *
 * const frustrated = { confidence: 30, frustration: 80, focus: 40, distraction: 60 };
 * const result2 = applyMentalStateModifier(base, frustrated); // ~0.223 (net increase)
 * ```
 */
export function applyMentalStateModifier(baseFuel: number, mentalState: MentalState): number {
  let modified = baseFuel;

  // Apply frustration penalty (increases fuel consumption)
  const frustrationPenalty = (mentalState.frustration / 100) * CONSTANTS.FUEL_FRUSTRATION_MAX_PENALTY;
  modified *= (1 + frustrationPenalty);

  // Apply confidence bonus (decreases fuel consumption)
  const confidenceBonus = (mentalState.confidence / 100) * CONSTANTS.FUEL_CONFIDENCE_MAX_BONUS;
  modified *= (1 - confidenceBonus);

  return modified;
}

/**
 * Apply drafting fuel savings
 *
 * Drafting reduces aerodynamic drag by 22-27%, which translates to
 * approximately 10-12% fuel savings (drag is ~50% of power at high speeds).
 *
 * The draft effect is already calculated in the DraftStatus object
 * and represents the actual fuel savings percentage for the current
 * drafting situation.
 *
 * @param baseFuel - Base fuel consumption (gallons)
 * @param draftStatus - Current draft situation
 * @returns Modified fuel consumption
 *
 * @example
 * ```typescript
 * const base = 0.27; // superspeedway
 * const noDraft = { inDraft: false, distance: 10, speedBoost: 0, fuelSavings: 0 };
 * const withDraft = { inDraft: true, distance: 2.5, speedBoost: 4, fuelSavings: 12 };
 *
 * applyDraftBonus(base, noDraft);     // 0.27 (no change)
 * applyDraftBonus(base, withDraft);   // 0.2376 (12% savings)
 * ```
 */
export function applyDraftBonus(baseFuel: number, draftStatus: DraftStatus): number {
  if (!draftStatus.inDraft) {
    return baseFuel;
  }

  const savingsPercent = draftStatus.fuelSavings / 100;
  return baseFuel * (1 - savingsPercent);
}

/**
 * Calculate lap time penalty from fuel weight
 *
 * Fuel weight affects performance through:
 * - Reduced acceleration (more mass to move)
 * - Slower cornering (more centripetal force needed)
 * - Longer braking distances (more inertia)
 *
 * Effect varies by track type:
 * - Short tracks: Heavy braking/acceleration zones = highest penalty
 * - Intermediate: Balanced = moderate penalty
 * - Superspeedway: Speed dominates = lowest penalty
 *
 * Formula: penalty = fuelGallons * penaltyPerGallon[trackType]
 *
 * @param fuelGallons - Current fuel load in gallons
 * @param trackType - Type of track
 * @returns Lap time penalty in seconds
 *
 * @example
 * ```typescript
 * // Full tank (18 gallons) on short track:
 * const shortPenalty = calculateFuelWeightPenalty(18, 'short');
 * // = 18 * 0.055 = 0.99 seconds
 *
 * // Half tank (9 gallons) on superspeedway:
 * const speedwayPenalty = calculateFuelWeightPenalty(9, 'superspeedway');
 * // = 9 * 0.025 = 0.225 seconds
 * ```
 */
export function calculateFuelWeightPenalty(fuelGallons: number, trackType: TrackType): number {
  return fuelGallons * FUEL_WEIGHT_PENALTY[trackType];
}

/**
 * Calculate fuel consumption per lap (MAIN FUNCTION)
 *
 * This is the primary fuel calculation function that combines all factors:
 * 1. Base consumption rate for track type
 * 2. Driver skill modifier (consistency)
 * 3. Mental state effects (frustration/confidence)
 * 4. Draft bonus (if applicable)
 *
 * The function applies modifiers in a specific order to ensure
 * realistic cumulative effects.
 *
 * @param driver - Driver object with skills and mental state
 * @param track - Track being raced on
 * @param carState - Current car state (unused but kept for interface compatibility)
 * @param draftStatus - Current drafting situation
 * @returns Fuel consumption for this lap in gallons
 *
 * @example
 * ```typescript
 * const driver = {
 *   skills: { consistency: 70, ... },
 *   mentalState: { confidence: 50, frustration: 0, ... },
 *   ...
 * };
 * const track = { type: 'intermediate', ... };
 * const carState = { fuelLevel: 80, ... };
 * const draftStatus = { inDraft: true, fuelSavings: 12, ... };
 *
 * const fuel = calculateFuelConsumption(driver, track, carState, draftStatus);
 * // Result: ~0.15-0.18 gallons/lap (depending on exact modifiers)
 * ```
 */
export function calculateFuelConsumption(
  driver: Driver,
  track: Track,
  carState: CarState,
  draftStatus: DraftStatus
): number {
  // 1. Get base consumption for track type
  let fuel = calculateBaseFuelConsumption(track.type);

  // 2. Apply driver skill modifier (consistency affects fuel efficiency)
  fuel = applyDriverSkillModifier(fuel, driver.skills.consistency);

  // 3. Apply mental state modifiers (frustration/confidence)
  fuel = applyMentalStateModifier(fuel, driver.mentalState);

  // 4. Apply draft bonus (if drafting)
  fuel = applyDraftBonus(fuel, draftStatus);

  return fuel;
}
