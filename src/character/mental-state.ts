/**
 * Mental State Management Module
 *
 * Pure functions for calculating and manipulating driver mental state.
 * These functions are separate from the Driver class to enable:
 * - Easier testing (pure functions)
 * - Reusability across driver types
 * - Clear separation of concerns
 *
 * Mental state affects performance through:
 * - Speed/lap time modifiers
 * - Skill effectiveness modifiers
 * - Decision quality factors
 *
 * Reference: docs/SPEC.md (Mental State System)
 *            docs/EXAMPLES.md (Example 4: Mental State Performance Impact)
 */

import type { MentalState, DriverSkills } from '../types';

/**
 * Clamp a value to the valid range [0, 100]
 */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate performance modifiers from mental state
 *
 * Returns three modifiers that affect different aspects of performance:
 * - speedModifier: Multiplier for lap time (0.92-1.08)
 * - skillModifier: Additive bonus to effective skill level (-10 to +10)
 * - decisionQuality: Quality factor for decisions (0.5-1.5)
 *
 * Mental state effects (from SPEC.md):
 * - Confidence: ±5% speed at extremes
 * - Frustration: up to -8% speed
 * - Focus: ±10 effective skill points
 * - Distraction: reduces decision quality
 *
 * @param mentalState - Current mental state
 * @returns Object with speedModifier, skillModifier, decisionQuality
 *
 * @example
 * ```typescript
 * const mentalState = { confidence: 80, frustration: 20, focus: 90, distraction: 10 };
 * const modifiers = calculateMentalStateModifier(mentalState);
 * // modifiers.speedModifier ≈ 1.05 (+5% faster)
 * // modifiers.skillModifier ≈ +8 (effective skill boost)
 * // modifiers.decisionQuality ≈ 1.3 (better decisions)
 * ```
 */
export function calculateMentalStateModifier(mentalState: MentalState): {
  speedModifier: number;
  skillModifier: number;
  decisionQuality: number;
} {
  // Speed modifier calculation
  let speedModifier = 1.0;

  // Confidence effect: ±5% based on deviation from neutral (50)
  // Confidence 100 → +5%, Confidence 0 → -5%
  const confidenceEffect = ((mentalState.confidence - 50) / 50) * 0.05;
  speedModifier += confidenceEffect;

  // Frustration penalty: up to -8% at frustration 100
  // Only applies above frustration 50 (neutral)
  const frustrationPenalty = Math.max(0, (mentalState.frustration - 50) / 50) * 0.08;
  speedModifier -= frustrationPenalty;

  // Distraction penalty: up to -3% at distraction 100
  const distractionPenalty = (mentalState.distraction / 100) * 0.03;
  speedModifier -= distractionPenalty;

  // Clamp to valid range: 0.92-1.08 (±8% total range per SPEC)
  speedModifier = clamp(speedModifier, 0.92, 1.08);

  // Skill modifier calculation
  // Focus affects effective skill level: ±10 points at extremes
  // Focus 100 → +10 skill, Focus 0 → -10 skill, Focus 70 (baseline) → 0
  const skillModifier = ((mentalState.focus - 70) / 30) * 10;

  // Decision quality calculation
  // Based on focus and distraction
  // High focus + low distraction = better decisions
  // Low focus + high distraction = worse decisions
  const focusFactor = mentalState.focus / 100; // 0.0-1.0
  const distractionFactor = mentalState.distraction / 100; // 0.0-1.0

  const decisionQuality = clamp(
    0.5 + (focusFactor * 0.8) - (distractionFactor * 0.3),
    0.5,
    1.5
  );

  return {
    speedModifier,
    skillModifier,
    decisionQuality,
  };
}

/**
 * Apply mental state change from race event
 *
 * Race events trigger immediate mental state changes:
 * - good_lap: +7 confidence, -3 frustration
 * - bad_lap: -4 confidence, +7 frustration
 * - pass: +4 confidence, -2 frustration
 * - got_passed: -2 confidence, +5 frustration
 * - crash: -15 confidence, +20 frustration, +10 distraction, -10 focus
 *
 * Changes scale with magnitude parameter (0.5-2.0 typical range).
 *
 * This function is PURE - it returns a new mental state object
 * without mutating the input.
 *
 * @param currentState - Current mental state
 * @param eventType - Type of event that occurred
 * @param magnitude - Scale factor for effect (default 1.0)
 * @returns New mental state after applying event
 *
 * @example
 * ```typescript
 * const state = { confidence: 50, frustration: 50, focus: 70, distraction: 10 };
 * const newState = applyMentalStateEvent(state, 'good_lap', 1.0);
 * // newState.confidence ≈ 57
 * // newState.frustration ≈ 47
 * ```
 */
export function applyMentalStateEvent(
  currentState: MentalState,
  eventType: 'good_lap' | 'bad_lap' | 'pass' | 'got_passed' | 'crash',
  magnitude: number = 1.0
): MentalState {
  // Create new state object (pure function - no mutation)
  const newState = { ...currentState };

  switch (eventType) {
    case 'good_lap':
      newState.confidence = clamp(newState.confidence + 7 * magnitude);
      newState.frustration = clamp(newState.frustration - 3 * magnitude);
      break;

    case 'bad_lap':
      newState.confidence = clamp(newState.confidence - 4 * magnitude);
      newState.frustration = clamp(newState.frustration + 7 * magnitude);
      break;

    case 'pass':
      newState.confidence = clamp(newState.confidence + 4 * magnitude);
      newState.frustration = clamp(newState.frustration - 2 * magnitude);
      break;

    case 'got_passed':
      newState.confidence = clamp(newState.confidence - 2 * magnitude);
      newState.frustration = clamp(newState.frustration + 5 * magnitude);
      break;

    case 'crash':
      newState.confidence = clamp(newState.confidence - 15 * magnitude);
      newState.frustration = clamp(newState.frustration + 20 * magnitude);
      newState.distraction = clamp(newState.distraction + 10 * magnitude);
      newState.focus = clamp(newState.focus - 10 * magnitude);
      break;
  }

  return newState;
}

/**
 * Apply natural mental state decay toward baseline
 *
 * Mental state values drift toward neutral/baseline over time:
 * - Confidence → 50 (neutral)
 * - Frustration → 50 (neutral)
 * - Focus → 70 (rested baseline)
 * - Distraction → 10 (minimal baseline)
 *
 * Decay rate determines how quickly values return to baseline.
 * Typical range: 0.05-0.2 per lap.
 *
 * This function is PURE - it returns a new mental state object
 * without mutating the input.
 *
 * @param currentState - Current mental state
 * @param decayRate - Decay rate per lap (default 0.1 = 10% movement toward baseline)
 * @returns New mental state after applying decay
 *
 * @example
 * ```typescript
 * const state = { confidence: 80, frustration: 70, focus: 50, distraction: 40 };
 * const newState = applyMentalStateDecay(state, 0.1);
 * // newState.confidence ≈ 77 (moved 10% toward 50)
 * // newState.frustration ≈ 68 (moved 10% toward 50)
 * // newState.focus ≈ 52 (moved 10% toward 70)
 * // newState.distraction ≈ 37 (moved 10% toward 10)
 * ```
 */
export function applyMentalStateDecay(
  currentState: MentalState,
  decayRate: number = 0.1
): MentalState {
  // Create new state object (pure function - no mutation)
  const newState = { ...currentState };

  // Decay confidence toward 50
  const confidenceDelta = (50 - newState.confidence) * decayRate;
  newState.confidence = clamp(newState.confidence + confidenceDelta);

  // Decay frustration toward 50
  const frustrationDelta = (50 - newState.frustration) * decayRate;
  newState.frustration = clamp(newState.frustration + frustrationDelta);

  // Recover focus toward 70 (rested baseline)
  const focusDelta = (70 - newState.focus) * decayRate;
  newState.focus = clamp(newState.focus + focusDelta);

  // Reduce distraction toward 10 (minimal baseline)
  const distractionDelta = (10 - newState.distraction) * decayRate;
  newState.distraction = clamp(newState.distraction + distractionDelta);

  return newState;
}

/**
 * Calculate mental resilience from driver skills
 *
 * Mental resilience determines how quickly a driver recovers from
 * negative mental states. Higher resilience = faster recovery.
 *
 * Primary factors:
 * - Focus skill: Mental sharpness and concentration
 * - Composure skill: Emotional control under pressure
 *
 * Returns a multiplier for decay rate:
 * - 0.5 = slow recovery (low resilience)
 * - 1.0 = normal recovery (average resilience)
 * - 2.0 = fast recovery (high resilience)
 *
 * @param skills - Driver skills
 * @returns Resilience multiplier (0.5-2.0)
 *
 * @example
 * ```typescript
 * const rookieSkills = { focus: 30, composure: 30, ... };
 * const veteranSkills = { focus: 90, composure: 90, ... };
 *
 * const rookieResilience = calculateMentalResilience(rookieSkills); // ≈ 0.6
 * const veteranResilience = calculateMentalResilience(veteranSkills); // ≈ 1.8
 * ```
 */
export function calculateMentalResilience(skills: DriverSkills): number {
  // Average of focus and composure skills (0-100)
  const mentalSkills = (skills.focus + skills.composure) / 2;

  // Map to resilience multiplier (0.5-2.0)
  // 0 skills → 0.5 multiplier (slow recovery)
  // 50 skills → 1.25 multiplier (normal recovery)
  // 100 skills → 2.0 multiplier (fast recovery)
  // Formula: 0.5 + (mentalSkills / 100) * 1.5
  const resilience = 0.5 + (mentalSkills / 100) * 1.5;

  return clamp(resilience, 0.5, 2.0);
}
