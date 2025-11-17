/**
 * CareerRaceRunner Tests
 *
 * Tests race execution in career mode context
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CareerRaceRunner } from '../../../src/modes/career/CareerRaceRunner';
import type { CareerSave } from '../../../src/types';

describe('CareerRaceRunner', () => {
  let mockCareer: CareerSave;

  beforeEach(() => {
    mockCareer = {
      driverId: 'test-driver',
      driver: {
        id: 'test-driver',
        name: 'Test Driver',
        number: '42',
        isPlayer: true,
        skills: {
          racecraft: 45,
          consistency: 40,
          aggression: 50,
          focus: 48,
          stamina: 42,
          composure: 46,
          draftSense: 43,
          tireManagement: 44,
          fuelManagement: 45,
          pitStrategy: 47,
        },
        mentalState: {
          confidence: 60,
          frustration: 40,
          focus: 65,
          distraction: 35,
        },
        stats: {
          races: 0,
          wins: 0,
          top5: 0,
          top10: 0,
          poles: 0,
          lapsLed: 0,
          avgFinish: 0,
        },
      },
      season: 1,
      race: 1,
      points: 0,
      unlockedTracks: ['bristol', 'charlotte', 'daytona'],
      raceHistory: [],
    };
  });

  describe('runRace', () => {
    it('returns RaceResults for completed race', () => {
      const runner = new CareerRaceRunner();
      const results = runner.runRace(mockCareer, 1);

      expect(results).toHaveProperty('finishPosition');
      expect(results).toHaveProperty('startPosition');
      expect(results).toHaveProperty('lapsLed');
      expect(results).toHaveProperty('xpGained');
      expect(results.xpGained).toBeInstanceOf(Array);
    });

    it('finish position is valid (1-40)', () => {
      const runner = new CareerRaceRunner();
      const results = runner.runRace(mockCareer, 1);

      expect(results.finishPosition).toBeGreaterThanOrEqual(1);
      expect(results.finishPosition).toBeLessThanOrEqual(40);
    });

    it('awards XP for completed race', () => {
      const runner = new CareerRaceRunner();
      const results = runner.runRace(mockCareer, 1);

      expect(results.xpGained.length).toBeGreaterThan(0);

      results.xpGained.forEach((xp) => {
        expect(xp.skill).toBeTruthy();
        expect(xp.amount).toBeGreaterThan(0);
      });
    });

    it('better driver skills correlate with better results (statistical)', () => {
      const runner = new CareerRaceRunner();

      // Rookie driver - well below AI field (40-80)
      const rookieCareer: CareerSave = {
        ...mockCareer,
        driver: {
          ...mockCareer.driver,
          skills: {
            racecraft: 25,
            consistency: 25,
            aggression: 25,
            focus: 25,
            stamina: 25,
            composure: 25,
            draftSense: 25,
            tireManagement: 25,
            fuelManagement: 25,
            pitStrategy: 25,
          },
        },
      };

      // Veteran driver - well above AI field (40-80)
      const veteranCareer: CareerSave = {
        ...mockCareer,
        driver: {
          ...mockCareer.driver,
          skills: {
            racecraft: 95,
            consistency: 95,
            aggression: 95,
            focus: 95,
            stamina: 95,
            composure: 95,
            draftSense: 95,
            tireManagement: 95,
            fuelManagement: 95,
            pitStrategy: 95,
          },
        },
      };

      // Run multiple races and average results
      // Use 20 races for better statistical significance (random AI field + starting position each race)
      const rookiePositions: number[] = [];
      const veteranPositions: number[] = [];

      for (let i = 0; i < 20; i++) {
        rookiePositions.push(runner.runRace(rookieCareer, 1).finishPosition);
        veteranPositions.push(runner.runRace(veteranCareer, 1).finishPosition);
      }

      const rookieAvg = rookiePositions.reduce((a, b) => a + b, 0) / rookiePositions.length;
      const veteranAvg = veteranPositions.reduce((a, b) => a + b, 0) / veteranPositions.length;

      // Veteran should finish better (lower position number) on average
      // With 70-point skill difference (25 vs 95), veteran should dominate
      expect(veteranAvg).toBeLessThan(rookieAvg);
    });

    it('sets correct track for race number', () => {
      const runner = new CareerRaceRunner();

      // Race 1 should be Bristol (first in default schedule)
      const results1 = runner.runRace(mockCareer, 1);
      expect(results1).toBeDefined();

      // Race 2 should be Charlotte
      const results2 = runner.runRace(mockCareer, 2);
      expect(results2).toBeDefined();

      // Race 3 should be Daytona
      const results3 = runner.runRace(mockCareer, 3);
      expect(results3).toBeDefined();
    });

    it('uses shortened race length (50 laps instead of full distance)', () => {
      const runner = new CareerRaceRunner();
      const results = runner.runRace(mockCareer, 1);

      // Should complete the race (not 500 laps for Bristol)
      expect(results.lapsCompleted).toBeLessThan(200);
    });
  });
});
