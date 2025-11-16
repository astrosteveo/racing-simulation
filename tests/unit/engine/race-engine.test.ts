/**
 * Race Engine Unit Tests
 *
 * Tests core RaceEngine functionality:
 * - Pause/Resume capability
 * - Real-time lap progression
 * - State management
 *
 * These are unit tests focused on individual RaceEngine methods.
 * See race-simulation.test.ts for full integration tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RaceEngine } from '../../../src/engine/simulation/race';
import {
  bristolTrack,
  createPlayerDriver,
  createAIField,
} from '../../fixtures/mock-data';
import type { RaceConfig } from '../../../src/types';

describe('RaceEngine - Pause/Resume Functionality', () => {
  let raceEngine: RaceEngine;
  let basicConfig: RaceConfig;

  beforeEach(() => {
    raceEngine = new RaceEngine();

    const player = createPlayerDriver('Test Driver', '1', 'midpack');
    const aiField = createAIField(3);

    basicConfig = {
      track: bristolTrack,
      laps: 10,
      playerDriver: player,
      aiDrivers: aiField,
    };
  });

  describe('pause()', () => {
    it('should pause the race simulation', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      expect(raceEngine.isPaused()).toBe(false);

      raceEngine.pause();

      expect(raceEngine.isPaused()).toBe(true);
    });

    it('should prevent lap simulation when paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Simulate one lap normally
      raceEngine.simulateLap();
      const stateAfterFirstLap = raceEngine.getCurrentState();
      expect(stateAfterFirstLap.currentLap).toBe(2); // start() sets to 1, simulateLap() advances to 2

      // Pause and try to simulate
      raceEngine.pause();
      raceEngine.simulateLap();
      const stateWhilePaused = raceEngine.getCurrentState();

      // Lap should not advance while paused
      expect(stateWhilePaused.currentLap).toBe(2);
    });
  });

  describe('resume()', () => {
    it('should resume the race simulation after pause', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();
      raceEngine.pause();

      expect(raceEngine.isPaused()).toBe(true);

      raceEngine.resume();

      expect(raceEngine.isPaused()).toBe(false);
    });

    it('should allow lap simulation after resume', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Simulate one lap
      raceEngine.simulateLap();
      expect(raceEngine.getCurrentState().currentLap).toBe(2); // start() sets to 1, simulateLap() advances to 2

      // Pause
      raceEngine.pause();
      raceEngine.simulateLap();
      expect(raceEngine.getCurrentState().currentLap).toBe(2); // Should not advance while paused

      // Resume and simulate
      raceEngine.resume();
      raceEngine.simulateLap();
      const stateAfterResume = raceEngine.getCurrentState();

      // Lap should advance after resume
      expect(stateAfterResume.currentLap).toBe(3);
    });
  });

  describe('isPaused()', () => {
    it('should return false when race is not paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      expect(raceEngine.isPaused()).toBe(false);
    });

    it('should return true when race is paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();
      raceEngine.pause();

      expect(raceEngine.isPaused()).toBe(true);
    });

    it('should return false after resume', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();
      raceEngine.pause();
      raceEngine.resume();

      expect(raceEngine.isPaused()).toBe(false);
    });
  });

  describe('Pause/Resume State Preservation', () => {
    it('should preserve race state while paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Simulate a few laps
      raceEngine.simulateLap();
      raceEngine.simulateLap();
      raceEngine.simulateLap();

      const stateBeforePause = raceEngine.getCurrentState();

      // Pause
      raceEngine.pause();

      const stateDuringPause = raceEngine.getCurrentState();

      // State should be identical
      expect(stateDuringPause.currentLap).toBe(stateBeforePause.currentLap);
      expect(stateDuringPause.playerPosition).toBe(stateBeforePause.playerPosition);
      expect(stateDuringPause.positions).toEqual(stateBeforePause.positions);
    });

    it('should maintain car state (tire/fuel) while paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Simulate several laps to degrade tires and use fuel
      for (let i = 0; i < 5; i++) {
        raceEngine.simulateLap();
      }

      const stateBeforePause = raceEngine.getCurrentState();
      const tireWearBefore = stateBeforePause.playerCar.tireWear;
      const fuelLevelBefore = stateBeforePause.playerCar.fuelLevel;

      // Pause for "a while" (simulate multiple simulateLap calls)
      raceEngine.pause();
      raceEngine.simulateLap();
      raceEngine.simulateLap();
      raceEngine.simulateLap();

      const stateDuringPause = raceEngine.getCurrentState();

      // Car state should not change while paused
      expect(stateDuringPause.playerCar.tireWear).toBe(tireWearBefore);
      expect(stateDuringPause.playerCar.fuelLevel).toBe(fuelLevelBefore);
    });
  });

  describe('Edge Cases', () => {
    it('should handle pause before race starts', () => {
      raceEngine.initialize(basicConfig);

      expect(() => raceEngine.pause()).not.toThrow();
      expect(raceEngine.isPaused()).toBe(true);
    });

    it('should handle resume when not paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      expect(() => raceEngine.resume()).not.toThrow();
      expect(raceEngine.isPaused()).toBe(false);
    });

    it('should handle multiple pause/resume cycles', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      for (let i = 0; i < 5; i++) {
        raceEngine.pause();
        expect(raceEngine.isPaused()).toBe(true);

        raceEngine.resume();
        expect(raceEngine.isPaused()).toBe(false);
      }
    });
  });
});

describe('RaceEngine - Real-Time Lap Progression', () => {
  let raceEngine: RaceEngine;
  let basicConfig: RaceConfig;

  beforeEach(() => {
    raceEngine = new RaceEngine();

    const player = createPlayerDriver('Test Driver', '1', 'midpack');
    const aiField = createAIField(2); // Small field for faster tests

    basicConfig = {
      track: bristolTrack,
      laps: 3, // Short race for testing
      playerDriver: player,
      aiDrivers: aiField,
    };
  });

  describe('getCalculatedLapTime()', () => {
    it('should return calculated lap time for a driver', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const playerId = basicConfig.playerDriver.id;
      const lapTime = raceEngine.getCalculatedLapTime(playerId);

      // Bristol lap times should be around 15-18 seconds
      expect(lapTime).toBeGreaterThan(14);
      expect(lapTime).toBeLessThan(20);
    });

    it('should return 0 for invalid driver ID', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const lapTime = raceEngine.getCalculatedLapTime('invalid-id');
      expect(lapTime).toBe(0);
    });
  });

  describe('getCurrentLapProgress()', () => {
    it('should return 0 at start of lap', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const progress = raceEngine.getCurrentLapProgress();
      expect(progress).toBe(0);
    });

    it('should return progress between 0 and 1 during lap', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Simulate partial lap (500ms of a ~15s lap = ~3%)
      raceEngine.simulateTick(500);

      const progress = raceEngine.getCurrentLapProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });

    it('should reset to 0 after completing lap', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const playerId = basicConfig.playerDriver.id;
      const lapTime = raceEngine.getCalculatedLapTime(playerId);

      // Simulate entire lap plus a bit more
      raceEngine.simulateTick(lapTime * 1000 + 100);

      const progress = raceEngine.getCurrentLapProgress();
      expect(progress).toBe(0); // Reset for next lap
    });
  });

  describe('simulateTick()', () => {
    it('should advance lap progress based on elapsed time', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Get expected lap time
      const playerId = basicConfig.playerDriver.id;
      const expectedLapTime = raceEngine.getCalculatedLapTime(playerId);

      // Simulate 50% of lap time
      raceEngine.simulateTick((expectedLapTime * 1000) / 2);

      const progress = raceEngine.getCurrentLapProgress();

      // Should be approximately 50% complete (within 10% margin for rounding)
      expect(progress).toBeGreaterThan(0.4);
      expect(progress).toBeLessThan(0.6);
    });

    it('should advance currentLap when all drivers complete', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      expect(raceEngine.getCurrentState().currentLap).toBe(1);

      // Get slowest driver's lap time (longest time needed)
      const allDriverIds = [
        basicConfig.playerDriver.id,
        ...basicConfig.aiDrivers.map((d) => d.id),
      ];
      const maxLapTime = Math.max(
        ...allDriverIds.map((id) => raceEngine.getCalculatedLapTime(id))
      );

      // Simulate entire lap for all drivers
      raceEngine.simulateTick(maxLapTime * 1000 + 100);

      const state = raceEngine.getCurrentState();
      expect(state.currentLap).toBe(2); // Advanced to lap 2
    });

    it('should mark race as complete after final lap', () => {
      const shortRace: RaceConfig = {
        ...basicConfig,
        laps: 1, // Single lap race
      };

      raceEngine.initialize(shortRace);
      raceEngine.start();

      expect(raceEngine.isComplete()).toBe(false);

      // Get slowest driver's lap time
      const allDriverIds = [
        shortRace.playerDriver.id,
        ...shortRace.aiDrivers.map((d) => d.id),
      ];
      const maxLapTime = Math.max(
        ...allDriverIds.map((id) => raceEngine.getCalculatedLapTime(id))
      );

      // Complete the only lap
      raceEngine.simulateTick(maxLapTime * 1000 + 100);

      expect(raceEngine.isComplete()).toBe(true);
    });

    it('should not advance when paused', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      raceEngine.pause();
      raceEngine.simulateTick(1000);

      const progress = raceEngine.getCurrentLapProgress();
      expect(progress).toBe(0); // No progress while paused
    });

    it('should update positions during lap based on progress', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Simulate partial lap
      raceEngine.simulateTick(1000);

      const state = raceEngine.getCurrentState();

      // Should have positions assigned (even mid-lap)
      expect(state.positions).toHaveLength(3); // player + 2 AI
      expect(state.positions[0].position).toBe(1); // Leader
      expect(state.positions[1].position).toBe(2);
      expect(state.positions[2].position).toBe(3);
    });

    it('should degrade tires after lap completion', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const stateBeforeLap = raceEngine.getCurrentState();
      const tireWearBefore = stateBeforeLap.playerCar.tireWear;

      // Complete entire lap
      const playerId = basicConfig.playerDriver.id;
      const lapTime = raceEngine.getCalculatedLapTime(playerId);
      const allDriverIds = [
        basicConfig.playerDriver.id,
        ...basicConfig.aiDrivers.map((d) => d.id),
      ];
      const maxLapTime = Math.max(
        ...allDriverIds.map((id) => raceEngine.getCalculatedLapTime(id))
      );

      raceEngine.simulateTick(maxLapTime * 1000 + 100);

      const stateAfterLap = raceEngine.getCurrentState();
      const tireWearAfter = stateAfterLap.playerCar.tireWear;

      // Tires should have degraded
      expect(tireWearAfter).toBeLessThan(tireWearBefore);
    });

    it('should consume fuel after lap completion', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const stateBeforeLap = raceEngine.getCurrentState();
      const fuelBefore = stateBeforeLap.playerCar.fuelLevel;

      // Complete entire lap
      const allDriverIds = [
        basicConfig.playerDriver.id,
        ...basicConfig.aiDrivers.map((d) => d.id),
      ];
      const maxLapTime = Math.max(
        ...allDriverIds.map((id) => raceEngine.getCalculatedLapTime(id))
      );

      raceEngine.simulateTick(maxLapTime * 1000 + 100);

      const stateAfterLap = raceEngine.getCurrentState();
      const fuelAfter = stateAfterLap.playerCar.fuelLevel;

      // Fuel should have been consumed
      expect(fuelAfter).toBeLessThan(fuelBefore);
    });
  });

  describe('Real-Time Integration', () => {
    it('should simulate race in real-time with multiple ticks', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      const playerId = basicConfig.playerDriver.id;
      const expectedLapTime = raceEngine.getCalculatedLapTime(playerId);
      const tickInterval = 100; // 100ms ticks

      let totalElapsed = 0;
      const progressUpdates: number[] = [];

      // Simulate lap with 100ms ticks
      while (totalElapsed < expectedLapTime * 1000) {
        raceEngine.simulateTick(tickInterval);
        totalElapsed += tickInterval;

        const progress = raceEngine.getCurrentLapProgress();
        progressUpdates.push(progress);
      }

      // Should have multiple progress updates
      expect(progressUpdates.length).toBeGreaterThan(10);

      // Progress should increase over time (check first half vs second half)
      const firstHalf = progressUpdates.slice(0, progressUpdates.length / 2);
      const secondHalf = progressUpdates.slice(progressUpdates.length / 2);
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      expect(avgSecond).toBeGreaterThan(avgFirst);
    });

    it('should handle mixed tick sizes', () => {
      raceEngine.initialize(basicConfig);
      raceEngine.start();

      // Mix of different tick sizes
      raceEngine.simulateTick(50);
      raceEngine.simulateTick(200);
      raceEngine.simulateTick(100);
      raceEngine.simulateTick(500);

      const progress = raceEngine.getCurrentLapProgress();

      // Total: 850ms of ~15s lap = ~5.7%
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(0.2);
    });
  });
});
