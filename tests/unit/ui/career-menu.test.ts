/**
 * CareerMenu Tests
 *
 * Tests career mode menu component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CareerMenu } from '../../../src/ui/console/components/CareerMenu';
import type { CareerSave } from '../../../src/types';

describe('CareerMenu', () => {
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
          races: 3,
          wins: 0,
          top5: 1,
          top10: 2,
          poles: 0,
          lapsLed: 45,
          avgFinish: 12.3,
        },
      },
      season: 1,
      race: 4,
      points: 95,
      unlockedTracks: ['bristol', 'charlotte', 'daytona'],
      raceHistory: [],
    };
  });

  describe('getMenuOptions', () => {
    it('returns career menu options', () => {
      const menu = new CareerMenu(mockCareer);
      const options = menu.getMenuOptions();

      expect(options.length).toBeGreaterThanOrEqual(4);

      const optionIds = options.map(o => o.id);
      expect(optionIds).toContain('next-race');
      expect(optionIds).toContain('standings');
      expect(optionIds).toContain('driver-profile');
      expect(optionIds).toContain('save-exit');
    });

    it('all options have labels and descriptions', () => {
      const menu = new CareerMenu(mockCareer);
      const options = menu.getMenuOptions();

      options.forEach((option) => {
        expect(option.label).toBeTruthy();
        expect(option.description).toBeTruthy();
      });
    });

    it('disables next-race when season is complete', () => {
      // Modify career to have completed 10 races
      const completedCareer = { ...mockCareer, race: 11 };
      const menu = new CareerMenu(completedCareer);
      const options = menu.getMenuOptions();

      const nextRace = options.find(o => o.id === 'next-race');
      expect(nextRace?.disabled).toBe(true);
    });

    it('enables next-race when season is in progress', () => {
      const menu = new CareerMenu(mockCareer);
      const options = menu.getMenuOptions();

      const nextRace = options.find(o => o.id === 'next-race');
      expect(nextRace?.disabled).toBeFalsy();
    });
  });

  describe('getTitle', () => {
    it('returns career title with driver info', () => {
      const menu = new CareerMenu(mockCareer);
      const title = menu.getTitle();

      expect(title).toBeTruthy();
      expect(title).toContain('Test Driver');
      expect(title).toContain('#42');
    });
  });

  describe('getPrompt', () => {
    it('returns menu prompt', () => {
      const menu = new CareerMenu(mockCareer);
      const prompt = menu.getPrompt();

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });
  });

  describe('getCareerSummary', () => {
    it('returns formatted career summary', () => {
      const menu = new CareerMenu(mockCareer);
      const summary = menu.getCareerSummary();

      expect(summary).toBeTruthy();
      expect(summary).toContain('Season 1');
      expect(summary).toContain('Race 4');
      expect(summary).toContain('95');
      expect(summary).toContain('points');
    });

    it('includes driver stats', () => {
      const menu = new CareerMenu(mockCareer);
      const summary = menu.getCareerSummary();

      expect(summary).toContain('3');
      expect(summary).toContain('races');
      expect(summary).toContain('12.3');
    });
  });
});
