/**
 * Decision Manager
 * Orchestrates decision generation and evaluation during races
 */

import type { Decision, DecisionManager as IDecisionManager, RaceState, Driver, DecisionResult } from '../types';
import { evaluateDecision } from './decision-evaluator';
import {
  createPitStrategyDecision,
  createPassingDecision,
  createMentalStateDecision,
  createTireManagementDecision,
  createTrafficDecision,
} from './decision-library';

/**
 * Decision Manager implementation
 * Checks race state and triggers appropriate decisions
 */
export class DecisionManager implements IDecisionManager {
  private lastDecisionLap: number = 0;
  private minLapsBetweenDecisions: number = 10;
  private lapsStuckBehind: Map<number, number> = new Map();

  /**
   * Check if a decision should be triggered based on current race state
   */
  shouldTriggerDecision(state: RaceState): Decision | null {
    // Don't trigger decisions too frequently
    if (state.currentLap - this.lastDecisionLap < this.minLapsBetweenDecisions) {
      return null;
    }

    // Don't trigger in first 5 laps or last 2 laps (too chaotic)
    if (state.currentLap < 5 || state.currentLap >= state.totalLaps - 2) {
      return null;
    }

    const context = {
      lap: state.currentLap,
      position: state.playerPosition,
      lapsToGo: state.totalLaps - state.currentLap,
      gapToLeader: state.positions.find(p => p.driverId === state.playerDriver.id)?.gapToLeader || 0,
      gapToNext: state.positions.find(p => p.driverId === state.playerDriver.id)?.gapToNext || 0,
      tireWear: state.playerCar.tireWear,
      fuelLevel: state.playerCar.fuelLevel,
      mentalState: state.playerDriver.mentalState,
    };

    // Priority 1: Mental state crisis (frustration or distraction too high)
    if (this.needsMentalStateManagement(state)) {
      this.lastDecisionLap = state.currentLap;
      return createMentalStateDecision(context);
    }

    // Priority 2: Pit window (tires or fuel critical)
    if (this.needsPit(state)) {
      this.lastDecisionLap = state.currentLap;
      return createPitStrategyDecision(context);
    }

    // Priority 3: Stuck behind car (passing opportunity)
    const lapsStuck = this.checkIfStuckBehindCar(state);
    if (lapsStuck >= 12) {
      this.lastDecisionLap = state.currentLap;
      return createPassingDecision(context, lapsStuck);
    }

    // Priority 4: Tire management (tires wearing but not critical yet)
    if (this.needsTireManagement(state)) {
      this.lastDecisionLap = state.currentLap;
      return createTireManagementDecision(context);
    }

    // No decision needed
    return null;
  }

  /**
   * Evaluate a player's decision choice
   */
  evaluateDecision(decision: Decision, choice: string, driver: Driver): DecisionResult {
    return evaluateDecision(decision, choice, driver);
  }

  /**
   * Check if player needs pit stop
   */
  private needsPit(state: RaceState): boolean {
    const { tireWear, fuelLevel, lapsSincePit } = state.playerCar;
    const lapsToGo = state.totalLaps - state.currentLap;

    // Pit if tires below 40% or fuel below 30%
    if (tireWear < 40 || fuelLevel < 30) {
      return true;
    }

    // Pit if it's been 60+ laps and tires < 60%
    if (lapsSincePit >= 60 && tireWear < 60) {
      return true;
    }

    // Pit if fuel won't last to end of race
    const fuelNeeded = lapsToGo * 0.5; // Approximate fuel per lap
    if (fuelLevel < fuelNeeded && lapsToGo > 20) {
      return true;
    }

    return false;
  }

  /**
   * Check if player needs mental state management
   */
  private needsMentalStateManagement(state: RaceState): boolean {
    const { frustration, distraction } = state.playerDriver.mentalState;

    // Trigger if frustration is very high
    if (frustration > 75) {
      return true;
    }

    // Trigger if distraction is too high
    if (distraction > 65) {
      return true;
    }

    // Trigger if both are moderately high
    if (frustration > 60 && distraction > 50) {
      return true;
    }

    return false;
  }

  /**
   * Check if player needs tire management decision
   */
  private needsTireManagement(state: RaceState): boolean {
    const { tireWear } = state.playerCar;
    const lapsToGo = state.totalLaps - state.currentLap;

    // Tires at 50% with 30+ laps to go = need to manage
    if (tireWear < 55 && lapsToGo > 30) {
      return true;
    }

    // Tires at 60% with 50+ laps to go
    if (tireWear < 65 && lapsToGo > 50) {
      return true;
    }

    return false;
  }

  /**
   * Check if player is stuck behind the same car
   * Returns number of laps stuck, or 0 if not stuck
   */
  private checkIfStuckBehindCar(state: RaceState): number {
    const playerPos = state.playerPosition;

    // Not stuck if in 1st place
    if (playerPos === 1) {
      this.lapsStuckBehind.clear();
      return 0;
    }

    // Check if we've been in this position for multiple laps
    const currentStuckLaps = this.lapsStuckBehind.get(playerPos) || 0;
    this.lapsStuckBehind.clear();
    this.lapsStuckBehind.set(playerPos, currentStuckLaps + 1);

    return currentStuckLaps + 1;
  }

  /**
   * Reset decision manager state (for new race)
   */
  reset(): void {
    this.lastDecisionLap = 0;
    this.lapsStuckBehind.clear();
  }
}

// Export for convenience
export { evaluateDecision } from './decision-evaluator';
export * from './decision-library';
