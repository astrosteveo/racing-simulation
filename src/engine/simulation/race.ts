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

  // Real-time lap progression (for real-time mode)
  private lapProgress: Map<string, number> = new Map(); // 0-1 progress for each driver
  private lapStartTimes: Map<string, number> = new Map(); // Total race time when lap started
  private expectedLapTimes: Map<string, number> = new Map(); // Expected lap time for current lap

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

    // Clear real-time progression state
    this.lapProgress.clear();
    this.lapStartTimes.clear();
    this.expectedLapTimes.clear();

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
   * Pause the race simulation
   * Race will not progress until resume() is called
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume the race simulation after pause
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * Check if race is currently paused
   */
  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Get calculated lap time for a specific driver
   * Uses current car state and driver skills to calculate expected lap time
   *
   * @param driverId - Driver ID to calculate lap time for
   * @returns Expected lap time in seconds
   */
  getCalculatedLapTime(driverId: string): number {
    const driverState = this.driverStates.get(driverId);
    if (!driverState || !this.track) {
      return 0;
    }

    const state: DriverState = {
      skills: driverState.driver.skills,
      mentalState: driverState.driver.mentalState,
    };

    return calculateLapTime(this.track, state, driverState.carState);
  }

  /**
   * Get current lap progress for the player (0-1)
   * Returns fraction of current lap completed
   *
   * @returns Progress from 0 (lap start) to 1 (lap complete), or 0 if not started
   */
  getCurrentLapProgress(): number {
    if (!this.playerDriverId) {
      return 0;
    }

    return this.lapProgress.get(this.playerDriverId) || 0;
  }

  /**
   * Simulate race progression by a time increment (real-time mode)
   * Advances all drivers proportionally based on their expected lap times
   *
   * This method enables real-time racing where lap times match actual physics calculations.
   * Each driver progresses through their lap based on elapsed time vs expected lap time.
   *
   * @param elapsedMs - Time increment in milliseconds
   *
   * @example
   * ```typescript
   * // Real-time loop (100ms ticks)
   * const expectedLapTime = engine.getCalculatedLapTime(playerId);
   * for (let elapsed = 0; elapsed < expectedLapTime * 1000; elapsed += 100) {
   *   engine.simulateTick(100);
   *   updateUI(engine.getCurrentState());
   *   await sleep(100);
   * }
   * ```
   */
  simulateTick(elapsedMs: number): void {
    if (this.complete || this.paused || !this.track) {
      return;
    }

    const elapsedSeconds = elapsedMs / 1000;

    // Initialize lap progress for all drivers if this is the start of a lap
    for (const [driverId, driverState] of this.driverStates) {
      if (!this.lapProgress.has(driverId)) {
        // Initialize progress for this driver
        this.lapProgress.set(driverId, 0);
        this.lapStartTimes.set(driverId, driverState.totalTime);

        // Calculate expected lap time for this lap
        const state: DriverState = {
          skills: driverState.driver.skills,
          mentalState: driverState.driver.mentalState,
        };
        const expectedTime = calculateLapTime(this.track, state, driverState.carState);
        this.expectedLapTimes.set(driverId, expectedTime);
      }
    }

    // Advance each driver's progress
    const completedDrivers: string[] = [];

    for (const [driverId, driverState] of this.driverStates) {
      const currentProgress = this.lapProgress.get(driverId) || 0;
      const expectedLapTime = this.expectedLapTimes.get(driverId) || 1;

      // Calculate new progress (clamp to 1.0 maximum)
      const progressIncrement = elapsedSeconds / expectedLapTime;
      const newProgress = Math.min(1.0, currentProgress + progressIncrement);

      this.lapProgress.set(driverId, newProgress);

      // Track drivers who completed their lap this tick
      if (newProgress >= 1.0 && currentProgress < 1.0) {
        completedDrivers.push(driverId);
      }
    }

    // Update positions based on who's ahead
    this.updatePositionsRealTime();

    // Check if all drivers have completed their lap
    const allComplete = Array.from(this.lapProgress.values()).every((progress) => progress >= 1.0);

    // Finalize laps for drivers who just completed
    for (const driverId of completedDrivers) {
      const driverState = this.driverStates.get(driverId);
      if (driverState) {
        this.finalizeLap(driverId, driverState);
      }
    }

    // If all drivers completed, advance the lap
    if (allComplete) {
      // Advance to next lap
      this.currentLap++;

      // Check if race is complete
      if (this.currentLap > this.totalLaps) {
        this.complete = true;
      }

      // Check for decisions after lap completion
      if (!this.complete) {
        this.checkForDecision();
      }

      // Update laps led after lap completion
      this.updateLapsLed();
    }
  }

  /**
   * Finalize a lap for a driver when they cross the finish line
   * Updates car state, records lap time, etc.
   */
  private finalizeLap(driverId: string, state: DriverRaceState): void {
    if (!this.track) return;

    const expectedLapTime = this.expectedLapTimes.get(driverId) || 0;

    // Create driver state for fuel calculation
    const noDraft: DraftStatus = {
      inDraft: false,
      distance: 10,
      speedBoost: 0,
      fuelSavings: 0,
    };

    // Calculate fuel consumption
    const fuelUsed = calculateFuelConsumption(
      state.driver,
      this.track,
      state.carState,
      noDraft
    );

    // Update car state
    state.carState.fuelLevel = Math.max(0, state.carState.fuelLevel - fuelUsed);
    state.carState.lapsSincePit++;
    state.carState.fuelConsumptionPerLap = fuelUsed;

    // Calculate tire wear
    const tireGripPercent = calculateTireGrip(state.carState.lapsSincePit, this.track.type);
    state.carState.tireWear = tireGripPercent * 100;

    // Update lap time tracking
    state.currentLapTime = expectedLapTime;
    state.totalTime += expectedLapTime;
    state.lapTimes.push(expectedLapTime);

    // Update fastest lap
    if (expectedLapTime < state.fastestLap || state.fastestLap === 0) {
      state.fastestLap = expectedLapTime;
    }

    // Reset progress for next lap
    this.lapProgress.set(driverId, 0);
    this.lapStartTimes.set(driverId, state.totalTime);
  }

  /**
   * Update positions during real-time simulation
   * Positions are based on cumulative time + current lap progress
   */
  private updatePositionsRealTime(): void {
    const positionsArray: Position[] = [];

    for (const [driverId, state] of this.driverStates) {
      const progress = this.lapProgress.get(driverId) || 0;
      const expectedLapTime = this.expectedLapTimes.get(driverId) || 0;
      const currentLapTime = expectedLapTime * progress;

      // Effective time = total time + partial current lap
      const effectiveTime = state.totalTime + currentLapTime;

      positionsArray.push({
        position: 0, // Will be set after sorting
        driverId: driverId,
        driverName: state.driver.name,
        gap: 0, // Will be calculated after sorting
        lapTime: state.currentLapTime,
        fastestLap: state.fastestLap,
      });

      // Store effective time temporarily for sorting
      (positionsArray[positionsArray.length - 1] as any).effectiveTime = effectiveTime;
    }

    // Sort by effective time (lowest first = leader)
    positionsArray.sort((a, b) => {
      const timeA = (a as any).effectiveTime || 0;
      const timeB = (b as any).effectiveTime || 0;
      return timeA - timeB;
    });

    // Assign positions and calculate gaps
    const leaderTime = (positionsArray[0] as any).effectiveTime || 0;
    positionsArray.forEach((pos, index) => {
      pos.position = index + 1;
      const effectiveTime = (pos as any).effectiveTime || 0;
      pos.gap = index === 0 ? 0 : effectiveTime - leaderTime;

      // Clean up temporary field
      delete (pos as any).effectiveTime;
    });

    this.positions = positionsArray;
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
