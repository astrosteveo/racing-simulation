/**
 * Race Simulation Engine
 *
 * Core race orchestration module that manages:
 * - Lap-by-lap simulation
 * - Position tracking and gap calculation
 * - Car state updates (tire wear, fuel consumption)
 * - Race results generation
 *
 * This is the primary interface between the game logic and the physics engine.
 * All race state flows through this class.
 *
 * Reference: docs/SPEC.md Section 4 (Race Simulation)
 */

import type {
  RaceSimulation,
  RaceConfig,
  RaceState,
  RaceResults,
  Position,
  Driver,
  CarState,
  Track,
  Decision,
  XPGain,
  DraftStatus,
  DriverState,
} from '../../types';
import { calculateLapTime } from '../physics/laptime';
import { calculateFuelConsumption } from '../physics/fuel';
import { calculateTireGrip } from '../physics/tires';
import { DecisionManager } from '../../events';

/**
 * Internal driver race state
 * Tracks all information for each driver during the race
 */
interface DriverRaceState {
  driver: Driver;
  carState: CarState;
  currentLapTime: number;
  fastestLap: number;
  totalTime: number; // Cumulative race time
  lapsLed: number;
  lapTimes: number[]; // History of lap times
}

/**
 * Race Engine Implementation
 * Implements the RaceSimulation interface
 */
export class RaceEngine implements RaceSimulation {
  // Configuration
  private config: RaceConfig | null = null;
  private track: Track | null = null;
  private totalLaps: number = 0;

  // Race state
  private currentLap: number = 0;
  private paused: boolean = false;
  private complete: boolean = false;

  // Driver states (keyed by driver ID)
  private driverStates: Map<string, DriverRaceState> = new Map();

  // Player tracking
  private playerDriverId: string | null = null;

  // Race data
  private positions: Position[] = [];
  private startingPosition: number = 1;

  // Decision system
  private decisionManager: DecisionManager = new DecisionManager();
  private pendingDecision: Decision | null = null;

  /**
   * Initialize race with configuration
   */
  initialize(config: RaceConfig): void {
    this.config = config;
    this.track = config.track;
    this.totalLaps = config.laps;
    this.currentLap = 0;
    this.complete = false;
    this.paused = false;
    this.driverStates.clear();
    this.positions = [];

    // Set up player driver
    this.playerDriverId = config.playerDriver.id;

    // Determine starting position
    const totalDrivers = 1 + config.aiDrivers.length;
    if (config.startingPosition !== undefined) {
      this.startingPosition = Math.max(1, Math.min(config.startingPosition, totalDrivers));
    } else {
      // Random starting position
      this.startingPosition = Math.floor(Math.random() * totalDrivers) + 1;
    }

    // Initialize all drivers
    this.initializeDriver(config.playerDriver, this.startingPosition);

    let position = 1;
    for (const aiDriver of config.aiDrivers) {
      // Skip the player's starting position
      if (position === this.startingPosition) {
        position++;
      }
      this.initializeDriver(aiDriver, position);
      position++;
    }

    // Build initial position array
    this.updatePositions();
  }

  /**
   * Initialize a single driver's race state
   */
  private initializeDriver(driver: Driver, startPosition: number): void {
    const state: DriverRaceState = {
      driver: { ...driver },
      carState: {
        tireWear: 100,
        fuelLevel: 100,
        damage: 0,
        inPit: false,
        lapsSincePit: 0,
      },
      currentLapTime: 0,
      fastestLap: Infinity,
      // Initialize totalTime based on starting position to preserve grid order
      // Each position gets +0.1s stagger (will be overwritten after first lap)
      totalTime: (startPosition - 1) * 0.1,
      lapsLed: 0,
      lapTimes: [],
    };

    this.driverStates.set(driver.id, state);
  }

  /**
   * Start the race
   */
  start(): void {
    if (this.currentLap === 0) {
      this.currentLap = 1;
    }
  }

  /**
   * Simulate one lap for all drivers
   */
  simulateLap(): void {
    if (this.complete || this.paused || !this.track) {
      return;
    }

    // Check if race is already complete before simulating
    if (this.currentLap > this.totalLaps) {
      this.complete = true;
      return;
    }

    // Simulate lap for each driver
    for (const [driverId, state] of this.driverStates) {
      this.simulateDriverLap(driverId, state);
    }

    // Update positions based on cumulative time
    this.updatePositions();

    // Update laps led
    this.updateLapsLed();

    // Check for decisions (after lap simulation)
    this.checkForDecision();

    // Advance to next lap
    this.currentLap++;

    // Check if race is complete
    if (this.currentLap > this.totalLaps) {
      this.complete = true;
    }
  }

  /**
   * Simulate a single lap for a driver
   */
  private simulateDriverLap(driverId: string, state: DriverRaceState): void {
    if (!this.track) return;

    // Create driver state for physics engine
    const driverState: DriverState = {
      skills: state.driver.skills,
      mentalState: state.driver.mentalState,
    };

    // No draft for now (simplified - will add later)
    const noDraft: DraftStatus = {
      inDraft: false,
      distance: 10,
      speedBoost: 0,
      fuelSavings: 0,
    };

    // Calculate lap time using physics engine (BEFORE updating car state)
    const lapTime = calculateLapTime(this.track, driverState, state.carState);

    // Calculate fuel consumption
    const fuelUsed = calculateFuelConsumption(
      state.driver,
      this.track,
      state.carState,
      noDraft
    );

    // Update car state AFTER calculations
    state.carState.fuelLevel = Math.max(0, state.carState.fuelLevel - fuelUsed);
    state.carState.lapsSincePit++;
    state.carState.fuelConsumptionPerLap = fuelUsed;

    // Calculate tire wear based on NEW lap count
    const tireGripPercent = calculateTireGrip(state.carState.lapsSincePit, this.track.type);
    state.carState.tireWear = tireGripPercent * 100;

    // Update lap time tracking
    state.currentLapTime = lapTime;
    state.totalTime += lapTime;
    state.lapTimes.push(lapTime);

    // Update fastest lap
    if (lapTime < state.fastestLap) {
      state.fastestLap = lapTime;
    }
  }

  /**
   * Update position standings based on cumulative race time
   */
  private updatePositions(): void {
    if (!this.track) return;

    // Sort drivers by total time (ascending)
    const sorted = Array.from(this.driverStates.entries())
      .sort((a, b) => a[1].totalTime - b[1].totalTime);

    // Build position array
    this.positions = sorted.map(([driverId, state], index) => {
      const position = index + 1;
      const leader = sorted[0][1];
      const previous = index > 0 ? sorted[index - 1][1] : null;

      return {
        position,
        driverId,
        driverName: state.driver.name,
        lapTime: state.currentLapTime,
        gapToLeader: position === 1 ? 0 : state.totalTime - leader.totalTime,
        gapToNext: previous ? state.totalTime - previous.totalTime : 0,
        lapsLed: state.lapsLed,
      };
    });
  }

  /**
   * Update laps led counter for current leader
   */
  private updateLapsLed(): void {
    if (this.positions.length === 0) return;

    const leader = this.positions[0];
    const leaderState = this.driverStates.get(leader.driverId);

    if (leaderState) {
      leaderState.lapsLed++;
    }
  }

  /**
   * Get current race state
   */
  getCurrentState(): RaceState {
    const playerState = this.playerDriverId
      ? this.driverStates.get(this.playerDriverId)
      : null;

    const playerPosition = this.positions.find(
      (p) => p.driverId === this.playerDriverId
    )?.position ?? 1;

    const leaderPosition = this.positions.find((p) => p.position === 1);

    return {
      currentLap: this.currentLap,
      totalLaps: this.totalLaps,
      positions: this.positions,
      leaderLapTime: leaderPosition?.lapTime ?? 0,
      playerPosition,
      playerDriver: playerState?.driver ?? this.config!.playerDriver,
      playerCar: playerState?.carState ?? {
        tireWear: 100,
        fuelLevel: 100,
        damage: 0,
        inPit: false,
        lapsSincePit: 0,
      },
      track: this.track!,
      activeDecision: this.pendingDecision, // Check for active decision
      raceEvents: [], // Event system not yet implemented
      caution: false,
    };
  }

  /**
   * Check if a decision should be triggered
   * Called after each lap simulation
   */
  private checkForDecision(): void {
    // Don't check if there's already a pending decision
    if (this.pendingDecision) return;

    const state = this.getCurrentState();
    const decision = this.decisionManager.shouldTriggerDecision(state);

    if (decision) {
      this.pendingDecision = decision;
      // Race will pause externally when UI detects active decision
    }
  }

  /**
   * Apply player decision and update race state
   */
  applyDecision(decision: Decision, choice: string): void {
    if (!this.playerDriverId) return;

    const playerState = this.driverStates.get(this.playerDriverId);
    if (!playerState) return;

    // Evaluate the decision
    const result = this.decisionManager.evaluateDecision(
      decision,
      choice,
      playerState.driver
    );

    // Apply effects to race state
    this.applyDecisionEffects(result.effects, playerState);

    // Award XP to player driver
    this.applyXPGain(result.xpGained, playerState.driver);

    // Clear pending decision
    this.pendingDecision = null;
  }

  /**
   * Apply decision effects to race state
   */
  private applyDecisionEffects(
    effects: any,
    playerState: DriverRaceState
  ): void {
    // Apply position change
    if (effects.positionChange) {
      // Note: Position changes are approximate - actual positions update on next lap
      // This could be enhanced to immediately adjust totalTime
    }

    // Apply mental state changes
    if (effects.mentalStateChange) {
      const ms = playerState.driver.mentalState;
      Object.entries(effects.mentalStateChange).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const currentValue = ms[key as keyof typeof ms];
          if (typeof currentValue === 'number') {
            ms[key as keyof typeof ms] = Math.max(0, Math.min(100, currentValue + value));
          }
        }
      });
    }

    // Apply tire wear change
    if (effects.tireWearChange !== undefined) {
      if (effects.tireWearChange === 100) {
        // Reset to 100% (pit stop)
        playerState.carState.tireWear = 100;
        playerState.carState.lapsSincePit = 0;
      } else {
        // Apply change
        playerState.carState.tireWear = Math.max(
          0,
          Math.min(100, playerState.carState.tireWear + effects.tireWearChange)
        );
      }
    }

    // Apply fuel change
    if (effects.fuelChange !== undefined) {
      if (effects.fuelChange === 100) {
        // Reset to 100% (pit stop)
        playerState.carState.fuelLevel = 100;
      } else {
        // Apply change
        playerState.carState.fuelLevel = Math.max(
          0,
          Math.min(100, playerState.carState.fuelLevel + effects.fuelChange)
        );
      }
    }

    // Apply damage
    if (effects.damageChange) {
      playerState.carState.damage = Math.max(
        0,
        Math.min(100, playerState.carState.damage + effects.damageChange)
      );
    }
  }

  /**
   * Apply XP gain to driver skills
   */
  private applyXPGain(xpGain: XPGain, driver: Driver): void {
    Object.entries(xpGain).forEach(([skill, xp]) => {
      if (xp > 0) {
        // XP system is handled by the Driver class
        // For now, we just track that XP was earned
        // Full XP/level system will be in career mode
      }
    });
  }

  /**
   * Check if race is complete
   */
  isComplete(): boolean {
    return this.complete;
  }

  /**
   * Get final race results
   */
  getResults(): RaceResults {
    const playerState = this.playerDriverId
      ? this.driverStates.get(this.playerDriverId)
      : null;

    if (!playerState) {
      throw new Error('Cannot get results: Player driver not found');
    }

    const playerPosition = this.positions.find(
      (p) => p.driverId === this.playerDriverId
    )?.position ?? 1;

    const fastestLap = playerState.fastestLap === Infinity ? 0 : playerState.fastestLap;
    const averageLap =
      playerState.lapTimes.length > 0
        ? playerState.lapTimes.reduce((sum, t) => sum + t, 0) / playerState.lapTimes.length
        : 0;

    const cleanLaps = playerState.lapTimes.length; // Simplified - no incidents yet

    // Calculate XP gain based on performance (simplified)
    const xpGained: XPGain = this.calculateXPGain(
      playerPosition,
      this.startingPosition,
      playerState.lapsLed
    );

    return {
      finishPosition: playerPosition,
      startPosition: this.startingPosition,
      positionsGained: this.startingPosition - playerPosition,
      lapsLed: playerState.lapsLed,
      lapsCompleted: playerState.lapTimes.length,
      fastestLap,
      averageLap,
      cleanLaps,
      decisionsTotal: 0, // Decision system not yet implemented
      decisionsCorrect: 0,
      xpGained,
    };
  }

  /**
   * Calculate XP gained from race performance
   * Simplified implementation - will be refined in Phase 4
   */
  private calculateXPGain(
    finishPosition: number,
    startPosition: number,
    lapsLed: number
  ): XPGain {
    const positionsGained = startPosition - finishPosition;

    // Base XP for completing race
    let racecraftXP = 10;
    let consistencyXP = 10;

    // Bonus for good finish
    if (finishPosition <= 5) {
      racecraftXP += (6 - finishPosition) * 5;
    }

    // Bonus for positions gained
    if (positionsGained > 0) {
      racecraftXP += positionsGained * 2;
    }

    // Bonus for leading laps
    if (lapsLed > 0) {
      racecraftXP += lapsLed * 0.5;
    }

    // Consistency XP for completing race
    consistencyXP += 5;

    return {
      racecraft: racecraftXP,
      consistency: consistencyXP,
      focus: 5,
    };
  }

  /**
   * Pause race simulation
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume race simulation
   */
  resume(): void {
    this.paused = false;
  }
}
