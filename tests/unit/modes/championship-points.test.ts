/**
 * Championship Points Calculator Tests
 *
 * Tests NASCAR-style championship points calculation
 */

import { describe, it, expect } from 'vitest';
import { calculateRacePoints, type PointsAwarded } from '../../../src/modes/career/ChampionshipPoints';

describe('ChampionshipPoints', () => {
  describe('calculateRacePoints', () => {
    describe('finish position points', () => {
      it('awards 40 points for 1st place', () => {
        const result = calculateRacePoints(1, 0, false);
        expect(result.finishPoints).toBe(40);
        expect(result.totalPoints).toBe(40);
      });

      it('awards 35 points for 2nd place', () => {
        const result = calculateRacePoints(2, 0, false);
        expect(result.finishPoints).toBe(35);
        expect(result.totalPoints).toBe(35);
      });

      it('awards 34 points for 3rd place', () => {
        const result = calculateRacePoints(3, 0, false);
        expect(result.finishPoints).toBe(34);
        expect(result.totalPoints).toBe(34);
      });

      it('awards 33 points for 4th place', () => {
        const result = calculateRacePoints(4, 0, false);
        expect(result.finishPoints).toBe(33);
        expect(result.totalPoints).toBe(33);
      });

      it('awards 32 points for 5th place', () => {
        const result = calculateRacePoints(5, 0, false);
        expect(result.finishPoints).toBe(32);
        expect(result.totalPoints).toBe(32);
      });

      it('awards 27 points for 10th place', () => {
        const result = calculateRacePoints(10, 0, false);
        expect(result.finishPoints).toBe(27);
        expect(result.totalPoints).toBe(27);
      });

      it('awards 17 points for 20th place', () => {
        const result = calculateRacePoints(20, 0, false);
        expect(result.finishPoints).toBe(17);
        expect(result.totalPoints).toBe(17);
      });

      it('awards 1 point for 40th place', () => {
        const result = calculateRacePoints(40, 0, false);
        expect(result.finishPoints).toBe(1);
        expect(result.totalPoints).toBe(1);
      });
    });

    describe('laps led bonus', () => {
      it('awards +5 bonus for leading at least 1 lap', () => {
        const result = calculateRacePoints(1, 1, false);
        expect(result.finishPoints).toBe(40);
        expect(result.lapsLedBonus).toBe(5);
        expect(result.totalPoints).toBe(45);
      });

      it('awards +5 bonus for leading 50 laps', () => {
        const result = calculateRacePoints(10, 50, false);
        expect(result.finishPoints).toBe(27);
        expect(result.lapsLedBonus).toBe(5);
        expect(result.totalPoints).toBe(32);
      });

      it('awards 0 bonus for leading 0 laps', () => {
        const result = calculateRacePoints(5, 0, false);
        expect(result.lapsLedBonus).toBe(0);
        expect(result.totalPoints).toBe(32);
      });
    });

    describe('most laps led bonus', () => {
      it('awards +5 bonus for leading most laps', () => {
        const result = calculateRacePoints(1, 250, true);
        expect(result.finishPoints).toBe(40);
        expect(result.lapsLedBonus).toBe(5);
        expect(result.mostLapsLedBonus).toBe(5);
        expect(result.totalPoints).toBe(50);
      });

      it('awards 0 bonus when not leading most laps', () => {
        const result = calculateRacePoints(1, 10, false);
        expect(result.mostLapsLedBonus).toBe(0);
      });
    });

    describe('combined bonuses', () => {
      it('awards maximum 50 points (win + both bonuses)', () => {
        const result = calculateRacePoints(1, 250, true);
        expect(result.finishPoints).toBe(40);
        expect(result.lapsLedBonus).toBe(5);
        expect(result.mostLapsLedBonus).toBe(5);
        expect(result.totalPoints).toBe(50);
      });

      it('awards 45 points for win + laps led bonus only', () => {
        const result = calculateRacePoints(1, 10, false);
        expect(result.totalPoints).toBe(45);
      });

      it('awards 45 points for win + most laps led bonus only', () => {
        const result = calculateRacePoints(1, 0, true);
        expect(result.totalPoints).toBe(45);
      });

      it('calculates points correctly for mid-pack finish with bonuses', () => {
        const result = calculateRacePoints(15, 5, false);
        expect(result.finishPoints).toBe(22);
        expect(result.lapsLedBonus).toBe(5);
        expect(result.mostLapsLedBonus).toBe(0);
        expect(result.totalPoints).toBe(27);
      });
    });

    describe('edge cases', () => {
      it('handles position beyond 40th (should award 1 point)', () => {
        const result = calculateRacePoints(43, 0, false);
        expect(result.finishPoints).toBe(1);
        expect(result.totalPoints).toBe(1);
      });

      it('validates position is at least 1', () => {
        expect(() => calculateRacePoints(0, 0, false)).toThrow();
      });

      it('validates laps led cannot be negative', () => {
        expect(() => calculateRacePoints(1, -5, false)).toThrow();
      });
    });

    describe('points breakdown structure', () => {
      it('returns correct PointsAwarded structure', () => {
        const result = calculateRacePoints(3, 10, true);

        expect(result).toHaveProperty('finishPoints');
        expect(result).toHaveProperty('lapsLedBonus');
        expect(result).toHaveProperty('mostLapsLedBonus');
        expect(result).toHaveProperty('totalPoints');

        expect(typeof result.finishPoints).toBe('number');
        expect(typeof result.lapsLedBonus).toBe('number');
        expect(typeof result.mostLapsLedBonus).toBe('number');
        expect(typeof result.totalPoints).toBe('number');
      });
    });
  });
});
