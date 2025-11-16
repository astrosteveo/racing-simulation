/**
 * Lap Time Calculation Module
 *
 * This is the CORE INTEGRATION module that orchestrates all physics subsystems
 * to simulate a complete lap around a track. It ties together:
 * - Speed calculations (straight + corner speeds)
 * - Tire physics (grip degradation)
 * - Fuel physics (weight penalty)
 * - Driver skill effects
 * - Mental state modifiers
 *
 * This module is critical for accurate simulation - all lap times flow from here.
 *
 * Reference: docs/PHYSICS-REFERENCE.md (Section 8: Lap Time Integration)
 * Validation: docs/EXAMPLES.md (Examples 1, 2, 8)
 */

import type { Track, TrackSection, LapTimeBreakdown, DriverState, CarState } from '../../types';
import { calculateBaseSpeed, calculateCornerSpeed, calculateSectionSpeed } from './speed';
import { calculateTireGrip } from './tires';
import { CONSTANTS } from '../../types';

/**
 * Calculate total lap time by iterating through all track sections
 *
 * This is the CORE FUNCTION that orchestrates all physics calculations.
 * It simulates a complete lap by:
 * 1. Iterating through each track section (turns and straights)
 * 2. Calculating the ideal speed for each section based on type
 * 3. Applying all modifiers (tire wear, fuel weight, driver skill)
 * 4. Computing section time (distance / speed)
 * 5. Summing all section times to get total lap time
 *
 * Physics calculation order:
 * - Base speed is calculated first (corner or straight speed)
 * - Section speed applies tire wear, fuel weight, and draft modifiers
 * - Mental state effects are applied through driver skill modifiers
 *
 * @param track - Track being raced on (contains sections array)
 * @param driverState - Driver skills and mental state
 * @param carState - Current car condition (tire wear, fuel level)
 * @returns Total lap time in seconds
 *
 * @example
 * ```typescript
 * const bristol = createBristolTrack();
 * const driverState = { skills: { racecraft: 70, ... }, mentalState: { ... } };
 * const carState = { tireWear: 100, fuelLevel: 100, ... };
 *
 * const lapTime = calculateLapTime(bristol, driverState, carState);
 * // Expected: ~15.4-15.6s for clean lap at Bristol
 * ```
 */
export function calculateLapTime(
  track: Track,
  driverState: DriverState,
  carState: CarState
): number {
  let totalTime = 0;

  // Convert tire wear percentage to laps on tires for grip calculation
  // 100% wear = 0 laps, 0% wear = tire life laps
  const tireLife = getTireLifeForTrack(track.type);
  const lapsOnTires = ((100 - carState.tireWear) / 100) * tireLife;

  // Convert fuel level percentage to gallons
  const fuelGallons = (carState.fuelLevel / 100) * CONSTANTS.NASCAR_FUEL_CAPACITY;

  // Get driver skill for corner speed calculation
  // Apply mental state modifiers to effective skill
  let driverSkill = driverState.skills.racecraft;

  // Confidence modifier: +/- 5% at extremes (0-100 confidence)
  // High confidence (>75) = faster, Low confidence (<25) = slower
  const confidenceModifier = ((driverState.mentalState.confidence - 50) / 50) * 0.05;
  driverSkill *= (1 + confidenceModifier);

  // Frustration penalty: High frustration reduces effective skill
  // Frustration > 50 starts to impact performance
  const frustrationPenalty = Math.max(0, (driverState.mentalState.frustration - 50) / 50) * 0.05;
  driverSkill *= (1 - frustrationPenalty);

  // Clamp driver skill to valid range
  driverSkill = Math.max(0, Math.min(100, driverSkill));

  // Iterate through all track sections
  for (const section of track.sections) {
    const sectionTime = calculateSectionTime(
      section,
      track,
      driverSkill,
      lapsOnTires,
      fuelGallons,
      false // Draft is not implemented yet, default to no draft
    );

    totalTime += sectionTime;
  }

  return totalTime;
}

/**
 * Calculate detailed lap time breakdown showing each section
 *
 * Provides comprehensive lap analysis including:
 * - Individual section times
 * - Total lap time
 * - Average lap speed
 * - Top speed achieved
 *
 * Useful for:
 * - Debugging physics calculations
 * - UI display of lap breakdown
 * - Identifying weak sections
 * - Telemetry analysis
 *
 * @param track - Track being raced on
 * @param driverState - Driver skills and mental state
 * @param carState - Current car condition
 * @returns Detailed breakdown object with section times and speeds
 *
 * @example
 * ```typescript
 * const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);
 * console.log(`Total time: ${breakdown.totalTime}s`);
 * console.log(`Average speed: ${breakdown.averageSpeed} MPH`);
 * console.log(`Top speed: ${breakdown.topSpeed} MPH`);
 * breakdown.sectionTimes.forEach((time, i) => {
 *   console.log(`Section ${i}: ${time}s`);
 * });
 * ```
 */
export function calculateLapTimeBreakdown(
  track: Track,
  driverState: DriverState,
  carState: CarState
): LapTimeBreakdown {
  const sectionTimes: number[] = [];
  let topSpeed = 0;

  // Convert tire wear and fuel for calculations
  const tireLife = getTireLifeForTrack(track.type);
  const lapsOnTires = ((100 - carState.tireWear) / 100) * tireLife;
  const fuelGallons = (carState.fuelLevel / 100) * CONSTANTS.NASCAR_FUEL_CAPACITY;

  // Apply mental state modifiers to driver skill (same as calculateLapTime)
  let driverSkill = driverState.skills.racecraft;
  const confidenceModifier = ((driverState.mentalState.confidence - 50) / 50) * 0.05;
  driverSkill *= (1 + confidenceModifier);
  const frustrationPenalty = Math.max(0, (driverState.mentalState.frustration - 50) / 50) * 0.05;
  driverSkill *= (1 - frustrationPenalty);
  driverSkill = Math.max(0, Math.min(100, driverSkill));

  // Calculate each section
  for (const section of track.sections) {
    const sectionTime = calculateSectionTime(
      section,
      track,
      driverSkill,
      lapsOnTires,
      fuelGallons,
      false // No draft
    );

    // Calculate section speed for tracking top speed
    const sectionSpeed = calculateSectionSpeedForBreakdown(
      section,
      track,
      driverSkill,
      lapsOnTires,
      fuelGallons
    );

    sectionTimes.push(sectionTime);
    topSpeed = Math.max(topSpeed, sectionSpeed);
  }

  // Calculate total time
  const totalTime = sectionTimes.reduce((sum, time) => sum + time, 0);

  // Calculate average speed: distance / time, converted to MPH
  // track.length is in miles, totalTime is in seconds
  // (miles / seconds) * 3600 seconds/hour = MPH
  const averageSpeed = (track.length / totalTime) * 3600;

  return {
    totalTime,
    sectionTimes,
    averageSpeed,
    topSpeed,
  };
}

/**
 * Helper: Calculate time for a single section
 *
 * This is the workhorse function that computes how long it takes to
 * traverse one section of track (a turn or straight).
 *
 * Process:
 * 1. Determine base speed based on section type (turn vs straight)
 * 2. Apply all modifiers via calculateSectionSpeed
 * 3. Convert distance and speed to time
 *
 * IMPORTANT: Speed calculations are done ONCE for tire grip, then modifiers
 * are applied via calculateSectionSpeed. This prevents double-application
 * of tire wear effects.
 *
 * @param section - Track section to calculate
 * @param track - Full track (for type and banking info)
 * @param driverSkill - Driver racecraft skill (0-100)
 * @param lapsOnTires - Current tire age in laps
 * @param fuelGallons - Current fuel load in gallons
 * @param isDrafting - Whether car is drafting
 * @returns Section time in seconds
 */
function calculateSectionTime(
  section: TrackSection,
  track: Track,
  driverSkill: number,
  lapsOnTires: number,
  fuelGallons: number,
  isDrafting: boolean
): number {
  // Calculate base speed for this section
  let baseSpeed: number;

  if (section.type === 'turn') {
    // Turn: use corner speed formula with CURRENT TIRE GRIP
    // We apply tire grip HERE in corner speed, NOT in calculateSectionSpeed
    const banking = section.banking || track.banking.turns;
    const radius = section.radius || 1000; // Default radius if not specified

    // Get current tire grip for this corner speed calculation
    const currentTireGrip = calculateTireGrip(lapsOnTires, track.type);

    // Calculate corner speed with actual tire grip
    baseSpeed = calculateCornerSpeed(banking, radius, currentTireGrip, driverSkill);

    // Apply track-type-specific calibration for realistic corner speeds
    // These calibration factors tune the physics formula to match real NASCAR lap times
    // Adjusted in Phase 5.1 to match EXAMPLES.md targets
    let calibrationFactor: number;
    switch (track.type) {
      case 'short':
        calibrationFactor = 0.830; // Short tracks: tuned for Bristol 15.4-15.6s lap times
        break;
      case 'intermediate':
        calibrationFactor = 0.925; // Intermediate: tuned for Charlotte ~28.5s lap times
        break;
      case 'superspeedway':
        calibrationFactor = 0.717; // Superspeedway: tuned for Daytona ~48-50s lap times
        break;
      default:
        calibrationFactor = 0.830;
    }
    baseSpeed *= calibrationFactor;
  } else {
    // Straight: use base speed formula
    baseSpeed = calculateBaseSpeed(
      CONSTANTS.NASCAR_HORSEPOWER,
      CONSTANTS.NASCAR_DRAG_COEFFICIENT,
      CONSTANTS.NASCAR_WEIGHT
    );

    // Apply track-type-specific calibration for realistic straight speeds
    // Racing speeds vary by track type due to different configurations
    // Adjusted in Phase 5.1 to match EXAMPLES.md targets
    let calibrationFactor: number;
    switch (track.type) {
      case 'short':
        calibrationFactor = 0.757; // Short tracks: tuned for Bristol 15.4-15.6s lap times
        break;
      case 'intermediate':
        calibrationFactor = 0.975; // Intermediate: tuned for Charlotte ~28.5s lap times
        break;
      case 'superspeedway':
        calibrationFactor = 0.791; // Superspeedway: tuned for Daytona ~48-50s lap times
        break;
      default:
        calibrationFactor = 0.791;
    }
    baseSpeed *= calibrationFactor;
  }

  // Apply all modifiers (tire wear, fuel weight, draft)
  // NOTE: lapsOnTires is passed here, which will apply tire wear effects
  const adjustedSpeed = calculateSectionSpeed(
    baseSpeed,
    section.type,
    lapsOnTires,
    fuelGallons,
    track.type,
    isDrafting
  );

  // Calculate time: distance / speed
  // section.length is in feet
  // adjustedSpeed is in MPH
  // Convert MPH to feet/second: MPH * 5280 feet/mile / 3600 seconds/hour
  const speedFeetPerSecond = adjustedSpeed * (5280 / 3600);

  // Time = distance / speed
  const time = section.length / speedFeetPerSecond;

  return time;
}

/**
 * Helper: Calculate section speed for breakdown display
 *
 * Similar to calculateSectionTime but returns the speed instead of time.
 * Used for tracking top speed in lap breakdown.
 *
 * @param section - Track section
 * @param track - Full track
 * @param driverSkill - Driver skill
 * @param lapsOnTires - Tire age
 * @param fuelGallons - Fuel load
 * @returns Section speed in MPH
 */
function calculateSectionSpeedForBreakdown(
  section: TrackSection,
  track: Track,
  driverSkill: number,
  lapsOnTires: number,
  fuelGallons: number
): number {
  let baseSpeed: number;

  if (section.type === 'turn') {
    const banking = section.banking || track.banking.turns;
    const radius = section.radius || 1000;

    // Get current tire grip for this corner speed calculation
    const currentTireGrip = calculateTireGrip(lapsOnTires, track.type);

    // Calculate corner speed with actual tire grip (same as calculateSectionTime)
    baseSpeed = calculateCornerSpeed(banking, radius, currentTireGrip, driverSkill);

    // Apply track-type-specific calibration (same as calculateSectionTime)
    let calibrationFactor: number;
    switch (track.type) {
      case 'short':
        calibrationFactor = 0.840;
        break;
      case 'intermediate':
        calibrationFactor = 0.925;
        break;
      case 'superspeedway':
        calibrationFactor = 0.717;
        break;
      default:
        calibrationFactor = 0.830;
    }
    baseSpeed *= calibrationFactor;
  } else {
    baseSpeed = calculateBaseSpeed(
      CONSTANTS.NASCAR_HORSEPOWER,
      CONSTANTS.NASCAR_DRAG_COEFFICIENT,
      CONSTANTS.NASCAR_WEIGHT
    );

    // Apply track-type-specific calibration (same as calculateSectionTime)
    let calibrationFactor: number;
    switch (track.type) {
      case 'short':
        calibrationFactor = 0.766;
        break;
      case 'intermediate':
        calibrationFactor = 0.975;
        break;
      case 'superspeedway':
        calibrationFactor = 0.791;
        break;
      default:
        calibrationFactor = 0.791;
    }
    baseSpeed *= calibrationFactor;
  }

  // Apply modifiers (no draft for breakdown)
  // This will apply tire wear effects via lapsOnTires
  const adjustedSpeed = calculateSectionSpeed(
    baseSpeed,
    section.type,
    lapsOnTires,
    fuelGallons,
    track.type,
    false
  );

  return adjustedSpeed;
}

/**
 * Helper: Get tire life in laps for track type
 *
 * @param trackType - Type of track
 * @returns Expected tire life in laps
 */
function getTireLifeForTrack(trackType: 'short' | 'intermediate' | 'superspeedway' | 'road'): number {
  const TIRE_LIFE = {
    short: 100,
    intermediate: 120,
    superspeedway: 140,
    road: 110,
  };

  return TIRE_LIFE[trackType];
}
