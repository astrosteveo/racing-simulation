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
