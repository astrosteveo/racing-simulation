/**
 * Season Schedule Tests
 *
 * Tests 10-race season structure and navigation
 */

import { describe, it, expect } from 'vitest';
import {
  getDefaultSchedule,
  getNextRace,
  getRaceByNumber,
  isSeasonComplete,
  type SeasonRace,
} from '../../../src/modes/career/SeasonSchedule';

describe('SeasonSchedule', () => {
  describe('getDefaultSchedule', () => {
    it('returns a 10-race schedule', () => {
      const schedule = getDefaultSchedule();
      expect(schedule).toHaveLength(10);
    });

    it('includes Bristol as race 1', () => {
      const schedule = getDefaultSchedule();
      expect(schedule[0].raceNumber).toBe(1);
      expect(schedule[0].trackId).toBe('bristol');
      expect(schedule[0].laps).toBe(500);
    });

    it('includes Charlotte as race 2', () => {
      const schedule = getDefaultSchedule();
      expect(schedule[1].raceNumber).toBe(2);
      expect(schedule[1].trackId).toBe('charlotte');
      expect(schedule[1].laps).toBe(250);
    });

    it('includes Daytona as race 3', () => {
      const schedule = getDefaultSchedule();
      expect(schedule[2].raceNumber).toBe(3);
      expect(schedule[2].trackId).toBe('daytona');
      expect(schedule[2].laps).toBe(200);
    });

    it('has sequential race numbers from 1 to 10', () => {
      const schedule = getDefaultSchedule();
      schedule.forEach((race, index) => {
        expect(race.raceNumber).toBe(index + 1);
      });
    });

    it('all races have valid lap counts', () => {
      const schedule = getDefaultSchedule();
      schedule.forEach((race) => {
        expect(race.laps).toBeGreaterThan(0);
        expect(race.laps).toBeLessThanOrEqual(500);
      });
    });

    it('all races have trackId strings', () => {
      const schedule = getDefaultSchedule();
      schedule.forEach((race) => {
        expect(typeof race.trackId).toBe('string');
        expect(race.trackId.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getNextRace', () => {
    const schedule = getDefaultSchedule();

    it('returns race 2 when current race is 1', () => {
      const nextRace = getNextRace(1, schedule);
      expect(nextRace).not.toBeNull();
      expect(nextRace?.raceNumber).toBe(2);
    });

    it('returns race 5 when current race is 4', () => {
      const nextRace = getNextRace(4, schedule);
      expect(nextRace).not.toBeNull();
      expect(nextRace?.raceNumber).toBe(5);
    });

    it('returns race 10 when current race is 9', () => {
      const nextRace = getNextRace(9, schedule);
      expect(nextRace).not.toBeNull();
      expect(nextRace?.raceNumber).toBe(10);
    });

    it('returns null when current race is 10 (season complete)', () => {
      const nextRace = getNextRace(10, schedule);
      expect(nextRace).toBeNull();
    });

    it('returns null when current race is beyond 10', () => {
      const nextRace = getNextRace(15, schedule);
      expect(nextRace).toBeNull();
    });

    it('handles race 0 as beginning (returns race 1)', () => {
      const nextRace = getNextRace(0, schedule);
      expect(nextRace).not.toBeNull();
      expect(nextRace?.raceNumber).toBe(1);
    });
  });

  describe('getRaceByNumber', () => {
    const schedule = getDefaultSchedule();

    it('returns race 1 when requested', () => {
      const race = getRaceByNumber(1, schedule);
      expect(race).not.toBeNull();
      expect(race?.raceNumber).toBe(1);
      expect(race?.trackId).toBe('bristol');
    });

    it('returns race 10 when requested', () => {
      const race = getRaceByNumber(10, schedule);
      expect(race).not.toBeNull();
      expect(race?.raceNumber).toBe(10);
    });

    it('returns null for race 0', () => {
      const race = getRaceByNumber(0, schedule);
      expect(race).toBeNull();
    });

    it('returns null for race 11 (beyond schedule)', () => {
      const race = getRaceByNumber(11, schedule);
      expect(race).toBeNull();
    });

    it('returns null for negative race number', () => {
      const race = getRaceByNumber(-1, schedule);
      expect(race).toBeNull();
    });
  });

  describe('isSeasonComplete', () => {
    it('returns false for race 1', () => {
      expect(isSeasonComplete(1)).toBe(false);
    });

    it('returns false for race 5', () => {
      expect(isSeasonComplete(5)).toBe(false);
    });

    it('returns false for race 9', () => {
      expect(isSeasonComplete(9)).toBe(false);
    });

    it('returns true for race 10', () => {
      expect(isSeasonComplete(10)).toBe(true);
    });

    it('returns true for race beyond 10', () => {
      expect(isSeasonComplete(11)).toBe(true);
      expect(isSeasonComplete(15)).toBe(true);
    });
  });

  describe('SeasonRace structure', () => {
    it('has correct interface structure', () => {
      const schedule = getDefaultSchedule();
      const race = schedule[0];

      expect(race).toHaveProperty('raceNumber');
      expect(race).toHaveProperty('trackId');
      expect(race).toHaveProperty('laps');

      expect(typeof race.raceNumber).toBe('number');
      expect(typeof race.trackId).toBe('string');
      expect(typeof race.laps).toBe('number');
    });
  });

  describe('schedule consistency', () => {
    it('returns same schedule on multiple calls', () => {
      const schedule1 = getDefaultSchedule();
      const schedule2 = getDefaultSchedule();

      expect(schedule1).toHaveLength(schedule2.length);
      schedule1.forEach((race, index) => {
        expect(race.raceNumber).toBe(schedule2[index].raceNumber);
        expect(race.trackId).toBe(schedule2[index].trackId);
        expect(race.laps).toBe(schedule2[index].laps);
      });
    });
  });
});
