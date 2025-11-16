/**
 * Driver Class - RPG Character System
 *
 * Represents a driver (player or AI) with skills, mental state, and progression.
 * This is the core RPG layer that sits on top of the physics simulation.
 *
 * Key features:
 * - Skill-based character progression (10 skills, 0-100 scale)
 * - Dynamic mental state affecting performance
 * - XP gain and skill advancement
 * - Mental state updates based on race events
 * - Natural mental state decay toward neutral
 *
 * Reference: docs/SPEC.md (Character Stats, Mental State System)
 *            docs/ARCHITECTURE.md (Character Layer)
 */

import type {
  Driver as IDriver,
  DriverSkills,
  MentalState,
  DriverState,
  CareerStats,
  XPGain,
} from '../types';
import { CONSTANTS } from '../types';

/**
 * Clamp a value to the valid range [0, 100]
 */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Driver class representing the player or AI character
 *
 * Manages all driver-specific state including:
 * - Persistent skills that improve through XP
 * - Dynamic mental state that changes during races
 * - Career statistics tracking
 */
export class Driver implements IDriver {
  id: string;
  name: string;
  number: string;
  isPlayer: boolean;
  skills: DriverSkills;
  mentalState: MentalState;
  stats: CareerStats;

  /**
   * Create a new driver
   *
   * @param id - Unique driver identifier
   * @param name - Driver name
   * @param number - Car number
   * @param skills - Optional custom skill levels (defaults to 50 for all)
   * @param initialMentalState - Optional initial mental state (defaults to neutral)
   * @param isPlayer - Whether this is the player's driver (default false)
   */
  constructor(
    id: string,
    name: string,
    number: string,
    skills?: Partial<DriverSkills>,
    initialMentalState?: Partial<MentalState>,
    isPlayer: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.isPlayer = isPlayer;

    // Initialize skills with defaults (50) and apply any custom values
    this.skills = {
      racecraft: clamp(skills?.racecraft ?? 50),
      consistency: clamp(skills?.consistency ?? 50),
      aggression: clamp(skills?.aggression ?? 50),
      focus: clamp(skills?.focus ?? 50),
      stamina: clamp(skills?.stamina ?? 50),
      composure: clamp(skills?.composure ?? 50),
      draftSense: clamp(skills?.draftSense ?? 50),
      tireManagement: clamp(skills?.tireManagement ?? 50),
      fuelManagement: clamp(skills?.fuelManagement ?? 50),
      pitStrategy: clamp(skills?.pitStrategy ?? 50),
    };

    // Initialize mental state with defaults (neutral)
    // Neutral: confidence 50, frustration 50, focus 70, distraction 10
    this.mentalState = {
      confidence: clamp(initialMentalState?.confidence ?? 50),
      frustration: clamp(initialMentalState?.frustration ?? 50),
      focus: clamp(initialMentalState?.focus ?? 70),
      distraction: clamp(initialMentalState?.distraction ?? 10),
    };

    // Initialize career stats
    this.stats = {
      races: 0,
      wins: 0,
      top5: 0,
      top10: 0,
      poles: 0,
      lapsLed: 0,
      avgFinish: 0,
    };
  }

  /**
   * Get current driver state for physics calculations
   *
   * Returns a simplified interface containing only what the physics
   * engine needs (skills and mental state).
   *
   * @returns DriverState object for physics engine
   */
  getState(): DriverState {
    return {
      skills: this.skills,
      mentalState: this.mentalState,
    };
  }

  /**
   * Update mental state based on race event
   *
   * Race events affect driver's psychological state:
   * - good_lap: +confidence, -frustration
   * - bad_lap: -confidence, +frustration
   * - pass: +confidence, -frustration (small)
   * - got_passed: +frustration, -confidence (small)
   * - crash: major -confidence, major +frustration
   *
   * @param event - Type of race event
   * @param magnitude - Scale factor for the effect (default 1.0)
   */
  updateMentalState(
    event: 'good_lap' | 'bad_lap' | 'pass' | 'got_passed' | 'crash',
    magnitude: number = 1.0
  ): void {
    switch (event) {
      case 'good_lap':
        this.mentalState.confidence = clamp(this.mentalState.confidence + 7 * magnitude);
        this.mentalState.frustration = clamp(this.mentalState.frustration - 3 * magnitude);
        break;

      case 'bad_lap':
        this.mentalState.confidence = clamp(this.mentalState.confidence - 4 * magnitude);
        this.mentalState.frustration = clamp(this.mentalState.frustration + 7 * magnitude);
        break;

      case 'pass':
        this.mentalState.confidence = clamp(this.mentalState.confidence + 4 * magnitude);
        this.mentalState.frustration = clamp(this.mentalState.frustration - 2 * magnitude);
        break;

      case 'got_passed':
        this.mentalState.confidence = clamp(this.mentalState.confidence - 2 * magnitude);
        this.mentalState.frustration = clamp(this.mentalState.frustration + 5 * magnitude);
        break;

      case 'crash':
        this.mentalState.confidence = clamp(this.mentalState.confidence - 15 * magnitude);
        this.mentalState.frustration = clamp(this.mentalState.frustration + 20 * magnitude);
        this.mentalState.distraction = clamp(this.mentalState.distraction + 10 * magnitude);
        this.mentalState.focus = clamp(this.mentalState.focus - 10 * magnitude);
        break;
    }
  }

  /**
   * Apply natural mental state decay over time
   *
   * Mental state values drift toward neutral/baseline:
   * - Confidence → 50 (neutral)
   * - Frustration → 50 (neutral)
   * - Focus → 70 (rested baseline)
   * - Distraction → 10 (minimal baseline)
   *
   * Decay rate is influenced by mental resilience (composure + focus skills).
   *
   * @param lapsElapsed - Number of laps elapsed since last decay
   */
  applyMentalStateDecay(lapsElapsed: number): void {
    // Calculate mental resilience from skills
    // Higher composure and focus = faster recovery
    const resilience = (this.skills.composure + this.skills.focus) / 200; // 0.0 - 1.0

    // Base decay rate: 0.05 per lap (5% movement toward neutral per lap)
    // Modified by resilience: 0.025 to 0.075 per lap
    const decayRatePerLap = 0.05 * (0.5 + resilience);

    // Apply decay for each lap elapsed
    for (let i = 0; i < lapsElapsed; i++) {
      // Decay confidence toward 50
      const confidenceDelta = (50 - this.mentalState.confidence) * decayRatePerLap;
      this.mentalState.confidence = clamp(this.mentalState.confidence + confidenceDelta);

      // Decay frustration toward 50
      const frustrationDelta = (50 - this.mentalState.frustration) * decayRatePerLap;
      this.mentalState.frustration = clamp(this.mentalState.frustration + frustrationDelta);

      // Recover focus toward 70
      const focusDelta = (70 - this.mentalState.focus) * decayRatePerLap;
      this.mentalState.focus = clamp(this.mentalState.focus + focusDelta);

      // Reduce distraction toward 10
      const distractionDelta = (10 - this.mentalState.distraction) * decayRatePerLap;
      this.mentalState.distraction = clamp(this.mentalState.distraction + distractionDelta);
    }
  }

  /**
   * Get performance modifier from current mental state
   *
   * Calculates a multiplier (0.92-1.08) representing the overall
   * performance impact of mental state.
   *
   * - High confidence: up to +5% performance
   * - High frustration: up to -8% performance
   * - Combined effect: ±8% total range (per SPEC.md)
   *
   * @returns Performance multiplier (0.92-1.08)
   */
  getPerformanceModifier(): number {
    let modifier = 1.0;

    // Confidence effect: ±5% based on deviation from neutral (50)
    // Confidence 100 → +5%, Confidence 0 → -5%
    const confidenceEffect = ((this.mentalState.confidence - 50) / 50) * 0.05;
    modifier += confidenceEffect;

    // Frustration penalty: up to -8% at frustration 100
    // Frustration kicks in above 50, scales to -8% at 100
    const frustrationPenalty = Math.max(0, (this.mentalState.frustration - 50) / 50) * 0.08;
    modifier -= frustrationPenalty;

    // Clamp to valid range: 0.92-1.08
    return clamp(modifier, 0.92, 1.08);
  }

  /**
   * Gain XP and update skill levels
   *
   * XP gain structure:
   * - Small XP (1-10): Minimal skill increase
   * - Medium XP (10-50): Noticeable skill increase
   * - Large XP (50-100+): Significant skill increase
   *
   * Skills are capped at 100 (mastery).
   *
   * @param xp - XP gain object specifying XP for each skill
   * @returns True if any skill leveled up, false otherwise
   */
  gainXP(xp: XPGain): boolean {
    let leveled = false;

    // Apply XP to each skill
    for (const [skillName, xpAmount] of Object.entries(xp)) {
      if (xpAmount && xpAmount > 0) {
        const currentSkill = this.skills[skillName as keyof DriverSkills];

        // Convert XP to skill points
        // Formula: XP / (10 * current_skill) = points gained
        // This creates exponential growth: higher skills need more XP
        const skillGain = xpAmount / (10 * Math.max(1, currentSkill / 10));

        // Apply skill gain
        const newSkill = clamp(currentSkill + skillGain);

        // Update skill
        this.skills[skillName as keyof DriverSkills] = newSkill;

        // Check if skill improved meaningfully (at least 0.1 points)
        if (newSkill - currentSkill >= 0.1) {
          leveled = true;
        }
      }
    }

    return leveled;
  }
}
