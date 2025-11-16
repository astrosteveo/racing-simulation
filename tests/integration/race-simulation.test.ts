/**
 * Race Simulation Integration Tests
 *
 * Tests the full race simulation engine:
 * - Race initialization with config
 * - Lap-by-lap simulation
 * - Position tracking and gap calculation
 * - Race state management
 * - Results generation
 *
 * Reference: docs/SPEC.md Section 4 (Race Simulation)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RaceEngine } from '../../src/engine/simulation/race';
import {
  bristolTrack,
  nascarCupCar,
  createPlayerDriver,
  createAIField,
  createMockDriver,
} from '../fixtures/mock-data';
import type { RaceConfig, RaceState } from '../../src/types';

describe('RaceEngine', () => {
  let raceEngine: RaceEngine;

  beforeEach(() => {
    raceEngine = new RaceEngine();
  });

  describe('Initialization', () => {
    it('should initialize with valid RaceConfig', () => {
      const player = createPlayerDriver('Test Driver', '1', 'midpack');
      const aiField = createAIField(5); // Small field for testing

      const config: RaceConfig = {
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
      };

      expect(() => raceEngine.initialize(config)).not.toThrow();
    });

    it('should set up initial race state after initialization', () => {
      const player = createPlayerDriver('Test Driver', '1', 'midpack');
      const aiField = createAIField(3);

      const config: RaceConfig = {
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
      };

      raceEngine.initialize(config);
      const state = raceEngine.getCurrentState();

      expect(state).toBeDefined();
      expect(state.currentLap).toBe(0);
      expect(state.totalLaps).toBe(10);
      expect(state.track).toEqual(bristolTrack);
      expect(state.positions).toHaveLength(4); // player + 3 AI
      expect(state.caution).toBe(false);
    });

    it('should assign random starting positions if not specified', () => {
      const player = createPlayerDriver('Test Driver', '1', 'midpack');
      const aiField = createAIField(5);

      const config: RaceConfig = {
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
      };

      raceEngine.initialize(config);
      const state = raceEngine.getCurrentState();

      // Player should have a position between 1 and 6
      expect(state.playerPosition).toBeGreaterThanOrEqual(1);
      expect(state.playerPosition).toBeLessThanOrEqual(6);
    });

    it('should respect specified starting position', () => {
      const player = createPlayerDriver('Test Driver', '1', 'midpack');
      const aiField = createAIField(5);

      const config: RaceConfig = {
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
        startingPosition: 3,
      };

      raceEngine.initialize(config);
      const state = raceEngine.getCurrentState();

      expect(state.playerPosition).toBe(3);
    });
  });

  describe('Race Start', () => {
    it('should transition to lap 1 when race starts', () => {
      const player = createPlayerDriver();
      const aiField = createAIField(3);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();
      const state = raceEngine.getCurrentState();

      expect(state.currentLap).toBe(1);
    });
  });

  describe('Lap Simulation', () => {
    beforeEach(() => {
      const player = createPlayerDriver('Test Driver', '1', 'midpack');
      const aiField = createAIField(3);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();
    });

    it('should simulate a lap and increment lap counter', () => {
      const stateBefore = raceEngine.getCurrentState();
      expect(stateBefore.currentLap).toBe(1);

      raceEngine.simulateLap();
      const stateAfter = raceEngine.getCurrentState();

      expect(stateAfter.currentLap).toBe(2);
    });

    it('should calculate lap times for all drivers', () => {
      raceEngine.simulateLap();
      const state = raceEngine.getCurrentState();

      // Every driver should have a lap time
      state.positions.forEach((pos) => {
        expect(pos.lapTime).toBeGreaterThan(0);
        expect(pos.lapTime).toBeLessThan(30); // Reasonable lap time for Bristol
      });
    });

    it('should update positions based on lap times', () => {
      const initialState = raceEngine.getCurrentState();
      const initialPositions = initialState.positions.map((p) => p.position);

      // Simulate several laps
      for (let i = 0; i < 5; i++) {
        raceEngine.simulateLap();
      }

      const finalState = raceEngine.getCurrentState();
      const finalPositions = finalState.positions.map((p) => p.position);

      // Positions should still be 1-4 but may have changed order
      expect(finalPositions.sort()).toEqual([1, 2, 3, 4]);

      // Leader should have position 1
      const leader = finalState.positions.find((p) => p.position === 1);
      expect(leader).toBeDefined();
    });

    it('should calculate gaps to leader correctly', () => {
      raceEngine.simulateLap();
      const state = raceEngine.getCurrentState();

      const leader = state.positions.find((p) => p.position === 1);
      expect(leader?.gapToLeader).toBe(0); // Leader has no gap to leader

      const second = state.positions.find((p) => p.position === 2);
      expect(second?.gapToLeader).toBeGreaterThanOrEqual(0);
    });

    it('should calculate gaps to next car correctly', () => {
      raceEngine.simulateLap();
      const state = raceEngine.getCurrentState();

      const leader = state.positions.find((p) => p.position === 1);
      expect(leader?.gapToNext).toBe(0); // Leader has no car ahead

      const second = state.positions.find((p) => p.position === 2);
      expect(second?.gapToNext).toBeGreaterThanOrEqual(0);
    });

    it('should update car states (tire wear, fuel)', () => {
      const initialState = raceEngine.getCurrentState();
      const initialTireWear = initialState.playerCar.tireWear;
      const initialFuel = initialState.playerCar.fuelLevel;

      raceEngine.simulateLap();
      const finalState = raceEngine.getCurrentState();

      // Tire wear should decrease
      expect(finalState.playerCar.tireWear).toBeLessThan(initialTireWear);

      // Fuel should decrease
      expect(finalState.playerCar.fuelLevel).toBeLessThan(initialFuel);
    });

    it('should track laps led for each driver', () => {
      // Simulate multiple laps
      for (let i = 0; i < 5; i++) {
        raceEngine.simulateLap();
      }

      const state = raceEngine.getCurrentState();

      // At least one driver should have led laps
      const totalLapsLed = state.positions.reduce((sum, pos) => sum + pos.lapsLed, 0);
      expect(totalLapsLed).toBeGreaterThan(0);
      expect(totalLapsLed).toBeLessThanOrEqual(5); // Can't exceed total laps simulated
    });
  });

  describe('Race Completion', () => {
    it('should detect when race is complete', () => {
      const player = createPlayerDriver();
      const aiField = createAIField(2);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 3, // Short race
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();

      expect(raceEngine.isComplete()).toBe(false);

      // Simulate 3 laps
      raceEngine.simulateLap();
      raceEngine.simulateLap();
      raceEngine.simulateLap();

      expect(raceEngine.isComplete()).toBe(true);
    });

    it('should not allow simulating laps after race is complete', () => {
      const player = createPlayerDriver();
      const aiField = createAIField(2);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 2,
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();
      raceEngine.simulateLap();
      raceEngine.simulateLap();

      expect(raceEngine.isComplete()).toBe(true);

      // Attempting to simulate another lap should not crash or change state
      const stateBefore = raceEngine.getCurrentState();
      raceEngine.simulateLap();
      const stateAfter = raceEngine.getCurrentState();

      expect(stateAfter.currentLap).toBe(stateBefore.currentLap);
    });
  });

  describe('Race Results', () => {
    it('should generate race results when complete', () => {
      const player = createPlayerDriver('Test Driver', '1', 'midpack');
      const aiField = createAIField(3);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 3,
        playerDriver: player,
        aiDrivers: aiField,
        startingPosition: 2,
      });

      raceEngine.start();

      // Simulate race
      for (let i = 0; i < 3; i++) {
        raceEngine.simulateLap();
      }

      const results = raceEngine.getResults();

      expect(results).toBeDefined();
      expect(results.startPosition).toBe(2);
      expect(results.finishPosition).toBeGreaterThanOrEqual(1);
      expect(results.finishPosition).toBeLessThanOrEqual(4);
      expect(results.lapsCompleted).toBe(3);
      expect(results.fastestLap).toBeGreaterThan(0);
      expect(results.averageLap).toBeGreaterThan(0);
    });

    it('should calculate positions gained/lost correctly', () => {
      const player = createPlayerDriver('Test Driver', '1', 'veteran'); // High skill
      const aiField = createAIField(5).map(d => ({
        ...d,
        skills: { ...d.skills, racecraft: 40 }, // Lower AI skill
      }));

      raceEngine.initialize({
        track: bristolTrack,
        laps: 5,
        playerDriver: player,
        aiDrivers: aiField,
        startingPosition: 6, // Start last
      });

      raceEngine.start();

      // Simulate race
      for (let i = 0; i < 5; i++) {
        raceEngine.simulateLap();
      }

      const results = raceEngine.getResults();

      expect(results.startPosition).toBe(6);

      // High-skill driver should gain positions
      if (results.finishPosition < 6) {
        expect(results.positionsGained).toBeGreaterThan(0);
      }
    });

    it('should track fastest and average lap times', () => {
      const player = createPlayerDriver();
      const aiField = createAIField(2);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 5,
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();

      for (let i = 0; i < 5; i++) {
        raceEngine.simulateLap();
      }

      const results = raceEngine.getResults();

      // Fastest lap should be <= average lap
      expect(results.fastestLap).toBeLessThanOrEqual(results.averageLap);

      // Both should be reasonable for Bristol
      expect(results.fastestLap).toBeGreaterThan(10);
      expect(results.fastestLap).toBeLessThan(20);
      expect(results.averageLap).toBeGreaterThan(10);
      expect(results.averageLap).toBeLessThan(20);
    });
  });

  describe('Performance Variance', () => {
    it('should show skill difference affecting race outcomes', () => {
      const veteranPlayer = createPlayerDriver('Veteran', '1', 'veteran');
      const aiField = createAIField(5);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 10,
        playerDriver: veteranPlayer,
        aiDrivers: aiField,
        startingPosition: 6,
      });

      raceEngine.start();

      for (let i = 0; i < 10; i++) {
        raceEngine.simulateLap();
      }

      const veteranResults = raceEngine.getResults();

      // Now run with rookie
      const rookieEngine = new RaceEngine();
      const rookiePlayer = createPlayerDriver('Rookie', '1', 'rookie');

      rookieEngine.initialize({
        track: bristolTrack,
        laps: 10,
        playerDriver: rookiePlayer,
        aiDrivers: aiField,
        startingPosition: 6,
      });

      rookieEngine.start();

      for (let i = 0; i < 10; i++) {
        rookieEngine.simulateLap();
      }

      const rookieResults = rookieEngine.getResults();

      // Veteran should have faster average lap time
      expect(veteranResults.averageLap).toBeLessThan(rookieResults.averageLap);
    });
  });

  describe('Pause and Resume', () => {
    it('should pause and resume race simulation', () => {
      const player = createPlayerDriver();
      const aiField = createAIField(2);

      raceEngine.initialize({
        track: bristolTrack,
        laps: 10,
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();
      raceEngine.simulateLap();

      const lapBeforePause = raceEngine.getCurrentState().currentLap;

      raceEngine.pause();

      // Simulating while paused should not advance
      raceEngine.simulateLap();
      expect(raceEngine.getCurrentState().currentLap).toBe(lapBeforePause);

      raceEngine.resume();

      // Should advance after resume
      raceEngine.simulateLap();
      expect(raceEngine.getCurrentState().currentLap).toBe(lapBeforePause + 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single car race (time trial)', () => {
      const player = createPlayerDriver();

      raceEngine.initialize({
        track: bristolTrack,
        laps: 3,
        playerDriver: player,
        aiDrivers: [], // No AI
      });

      raceEngine.start();

      for (let i = 0; i < 3; i++) {
        raceEngine.simulateLap();
      }

      const results = raceEngine.getResults();

      expect(results.finishPosition).toBe(1);
      expect(results.startPosition).toBe(1);
      expect(results.positionsGained).toBe(0);
    });

    it('should handle large field (40 cars)', () => {
      const player = createPlayerDriver();
      const aiField = createAIField(39); // Full NASCAR field

      raceEngine.initialize({
        track: bristolTrack,
        laps: 2,
        playerDriver: player,
        aiDrivers: aiField,
      });

      raceEngine.start();

      // Should not crash with large field
      expect(() => {
        raceEngine.simulateLap();
        raceEngine.simulateLap();
      }).not.toThrow();

      const state = raceEngine.getCurrentState();
      expect(state.positions).toHaveLength(40);
    });
  });
});
