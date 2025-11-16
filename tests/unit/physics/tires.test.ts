import { describe, it, expect } from 'vitest';
import {
  calculateTireGrip,
  calculateLapTimeFromTireWear,
  calculateTireWearRate,
} from '../../../src/engine/physics/tires';
import type { TrackType } from '../../../src/types';

describe('Tire Physics', () => {
  describe('calculateTireGrip', () => {
    it('should return 100% grip for fresh tires', () => {
      const grip = calculateTireGrip(0, 'short');
      expect(grip).toBe(1.0);
    });

    it('should degrade grip linearly over tire life - short track', () => {
      // Short track tire life: 100 laps
      const halfLife = calculateTireGrip(50, 'short');
      expect(halfLife).toBeCloseTo(0.75, 2); // 75% grip at halfway

      const endLife = calculateTireGrip(100, 'short');
      expect(endLife).toBeCloseTo(0.5, 2); // 50% grip at end of life
    });

    it('should degrade grip linearly over tire life - intermediate track', () => {
      // Intermediate tire life: 120 laps
      const halfLife = calculateTireGrip(60, 'intermediate');
      expect(halfLife).toBeCloseTo(0.75, 2);

      const endLife = calculateTireGrip(120, 'intermediate');
      expect(endLife).toBeCloseTo(0.5, 2);
    });

    it('should degrade grip linearly over tire life - superspeedway', () => {
      // Superspeedway tire life: 140 laps
      const halfLife = calculateTireGrip(70, 'superspeedway');
      expect(halfLife).toBeCloseTo(0.75, 2);

      const endLife = calculateTireGrip(140, 'superspeedway');
      expect(endLife).toBeCloseTo(0.5, 2);
    });

    it('should never go below 50% grip', () => {
      const overUsed = calculateTireGrip(200, 'short');
      expect(overUsed).toBe(0.5);
    });

    it('should match Example 2 from EXAMPLES.md - 50% tire wear', () => {
      // At 50% wear (half tire life), grip should be 75%
      const grip = calculateTireGrip(50, 'short');
      expect(grip).toBeCloseTo(0.75, 2);
    });
  });

  describe('calculateLapTimeFromTireWear', () => {
    const baseLapTime = 15.4; // Bristol baseline from Example 1

    it('should return base lap time for fresh tires (80%+ grip)', () => {
      const lapTime = calculateLapTimeFromTireWear(baseLapTime, 100);
      expect(lapTime).toBe(baseLapTime);

      const slightlyWorn = calculateLapTimeFromTireWear(baseLapTime, 85);
      expect(slightlyWorn).toBe(baseLapTime);
    });

    it('should add linear penalty for moderate wear (50-79% grip)', () => {
      // 75% grip = 25% wear = should be ~2% slower
      const moderateWear = calculateLapTimeFromTireWear(baseLapTime, 75);
      expect(moderateWear).toBeGreaterThan(baseLapTime);
      expect(moderateWear).toBeLessThan(baseLapTime * 1.08); // Max 8% penalty in this range

      // 50% grip = 50% wear = should be ~4% slower (matches Example 2)
      const highWear = calculateLapTimeFromTireWear(baseLapTime, 50);
      expect(highWear).toBeCloseTo(baseLapTime * 1.04, 2);
    });

    it('should add exponential penalty for severe wear (<50% grip)', () => {
      // Below 50% grip, penalty increases exponentially
      const severeWear = calculateLapTimeFromTireWear(baseLapTime, 30);
      expect(severeWear).toBeGreaterThan(baseLapTime * 1.10);

      const criticalWear = calculateLapTimeFromTireWear(baseLapTime, 10);
      expect(criticalWear).toBeGreaterThan(baseLapTime * 1.15);
    });

    it('should match Example 2 from EXAMPLES.md - tire wear impact', () => {
      // Example 2: Same driver, 50% tire wear should add 0.5-0.7s
      const freshTime = 15.5; // Example 1 lap time
      const wornGrip = 50; // 50% tire wear from Example 2

      const wornTime = calculateLapTimeFromTireWear(freshTime, wornGrip);

      // Expected: 16.0 - 16.3 seconds (+0.5-0.8s slower)
      expect(wornTime).toBeGreaterThan(15.9);
      expect(wornTime).toBeLessThan(16.4);

      // Difference should be in expected range
      const difference = wornTime - freshTime;
      expect(difference).toBeGreaterThan(0.4);
      expect(difference).toBeLessThan(0.9);
    });
  });

  describe('calculateTireWearRate', () => {
    it('should calculate wear per lap for short tracks', () => {
      const wearRate = calculateTireWearRate('short', 1.0, false);
      // 100 lap tire life means 1% wear per lap
      expect(wearRate).toBeCloseTo(1.0, 1);
    });

    it('should calculate wear per lap for intermediate tracks', () => {
      const wearRate = calculateTireWearRate('intermediate', 1.0, false);
      // 120 lap tire life means ~0.83% wear per lap
      expect(wearRate).toBeCloseTo(0.83, 1);
    });

    it('should calculate wear per lap for superspeedways', () => {
      const wearRate = calculateTireWearRate('superspeedway', 1.0, false);
      // 140 lap tire life means ~0.71% wear per lap
      expect(wearRate).toBeCloseTo(0.71, 1);
    });

    it('should increase wear rate with higher aggression', () => {
      const normalWear = calculateTireWearRate('short', 1.0, false);
      const aggressiveWear = calculateTireWearRate('short', 1.5, false);

      expect(aggressiveWear).toBeGreaterThan(normalWear);
      expect(aggressiveWear / normalWear).toBeCloseTo(1.5, 1);
    });

    it('should increase wear rate when racing side-by-side', () => {
      const cleanAirWear = calculateTireWearRate('short', 1.0, false);
      const sideBySideWear = calculateTireWearRate('short', 1.0, true);

      // Side-by-side adds 10% wear
      expect(sideBySideWear / cleanAirWear).toBeCloseTo(1.10, 2);
    });

    it('should combine aggression and side-by-side multipliers', () => {
      const baseWear = calculateTireWearRate('short', 1.0, false);
      const combinedWear = calculateTireWearRate('short', 1.5, true);

      // Should be 1.5x (aggression) * 1.1x (side-by-side) = 1.65x
      expect(combinedWear / baseWear).toBeCloseTo(1.65, 2);
    });
  });

  describe('Integration - Full tire lifecycle', () => {
    it('should simulate realistic tire degradation over a race', () => {
      const baseLapTime = 15.4; // Bristol
      const trackType: TrackType = 'short';
      let currentTireWear = 0;
      const lapTimes: number[] = [];

      // Simulate 80 laps
      for (let lap = 0; lap < 80; lap++) {
        const wearThisLap = calculateTireWearRate(trackType, 1.0, false);
        currentTireWear += wearThisLap;

        const gripPercentage = calculateTireGrip(lap, trackType) * 100;
        const lapTime = calculateLapTimeFromTireWear(baseLapTime, gripPercentage);

        lapTimes.push(lapTime);
      }

      // Lap 1 should be fastest
      expect(lapTimes[0]).toBe(baseLapTime);

      // Lap 80 should be slower than lap 1
      expect(lapTimes[79]).toBeGreaterThan(lapTimes[0]);

      // Lap times should generally trend slower
      const firstTenAvg = lapTimes.slice(0, 10).reduce((a, b) => a + b) / 10;
      const lastTenAvg = lapTimes.slice(70, 80).reduce((a, b) => a + b) / 10;
      expect(lastTenAvg).toBeGreaterThan(firstTenAvg);

      // By lap 80, should be about 0.4-0.5 seconds slower
      const degradation = lapTimes[79] - lapTimes[0];
      expect(degradation).toBeGreaterThan(0.3);
      expect(degradation).toBeLessThan(0.6);
    });
  });
});
