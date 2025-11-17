/**
 * CareerManager Tests
 *
 * Tests career state orchestration and progression
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CareerManager } from '../../../src/modes/career/CareerManager';
import type { RaceResults, XPGain, CareerSave } from '../../../src/types';
import fs from 'fs';
import path from 'path';

describe('CareerManager', () => {
  let manager: CareerManager;

  beforeEach(() => {
    manager = new CareerManager();
  });

  describe('startNewCareer', () => {
    it('creates a new career with rookie driver', () => {
      const career = manager.startNewCareer('Lightning McQueen', '95');

      expect(career.driverId).toContain('lightning-mcqueen');
      expect(career.driver.name).toBe('Lightning McQueen');
      expect(career.driver.number).toBe('95');
      expect(career.driver.isPlayer).toBe(true);
    });

    it('initializes rookie skills (30-40 range)', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      // All skills should be in rookie range
      Object.values(career.driver.skills).forEach((skill) => {
        expect(skill).toBeGreaterThanOrEqual(30);
        expect(skill).toBeLessThanOrEqual(40);
      });
    });

    it('starts at season 1, race 1', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      expect(career.season).toBe(1);
      expect(career.race).toBe(1);
    });

    it('starts with 0 championship points', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      expect(career.points).toBe(0);
    });

    it('unlocks starting tracks (bristol, charlotte, daytona)', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      expect(career.unlockedTracks).toContain('bristol');
      expect(career.unlockedTracks).toContain('charlotte');
      expect(career.unlockedTracks).toContain('daytona');
      expect(career.unlockedTracks).toHaveLength(3);
    });

    it('starts with empty race history', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      expect(career.raceHistory).toEqual([]);
    });

    it('initializes neutral mental state', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      expect(career.driver.mentalState.confidence).toBe(50);
      expect(career.driver.mentalState.frustration).toBe(50);
      expect(career.driver.mentalState.focus).toBe(50);
      expect(career.driver.mentalState.distraction).toBe(50);
    });

    it('initializes zero career stats', () => {
      const career = manager.startNewCareer('Test Driver', '1');

      expect(career.driver.stats.races).toBe(0);
      expect(career.driver.stats.wins).toBe(0);
      expect(career.driver.stats.top5).toBe(0);
      expect(career.driver.stats.top10).toBe(0);
    });
  });

  describe('loadCareer', () => {
    it('loads existing career state', () => {
      const existingSave: CareerSave = {
        driverId: 'test-driver',
        driver: {
          id: 'test-driver',
          name: 'Test Driver',
          number: '42',
          isPlayer: true,
          skills: {
            racecraft: 65,
            consistency: 60,
            aggression: 50,
            focus: 70,
            stamina: 65,
            composure: 60,
            draftSense: 55,
            tireManagement: 60,
            fuelManagement: 65,
            pitStrategy: 70,
          },
          mentalState: {
            confidence: 60,
            frustration: 40,
            focus: 70,
            distraction: 30,
          },
          stats: {
            races: 5,
            wins: 1,
            top5: 3,
            top10: 4,
            poles: 0,
            lapsLed: 125,
            avgFinish: 8.5,
          },
        },
        season: 1,
        race: 6,
        points: 175,
        unlockedTracks: ['bristol', 'charlotte', 'daytona'],
        raceHistory: [],
      };

      manager.loadCareer(existingSave);
      const loaded = manager.getCurrentState();

      expect(loaded.driverId).toBe('test-driver');
      expect(loaded.season).toBe(1);
      expect(loaded.race).toBe(6);
      expect(loaded.points).toBe(175);
      expect(loaded.driver.skills.racecraft).toBe(65);
    });
  });

  describe('getCurrentState', () => {
    it('returns current career save', () => {
      manager.startNewCareer('Test Driver', '1');
      const state = manager.getCurrentState();

      expect(state).toHaveProperty('driverId');
      expect(state).toHaveProperty('driver');
      expect(state).toHaveProperty('season');
      expect(state).toHaveProperty('race');
      expect(state).toHaveProperty('points');
      expect(state).toHaveProperty('unlockedTracks');
      expect(state).toHaveProperty('raceHistory');
    });

    it('returns immutable copy (modifications do not affect internal state)', () => {
      manager.startNewCareer('Test Driver', '1');
      const state1 = manager.getCurrentState();

      // Modify the returned state
      state1.points = 999;
      state1.race = 99;

      // Get state again - should be unchanged
      const state2 = manager.getCurrentState();
      expect(state2.points).toBe(0);
      expect(state2.race).toBe(1);
    });
  });

  describe('completeRace', () => {
    beforeEach(() => {
      manager.startNewCareer('Test Driver', '1');
    });

    it('awards championship points for a win', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 100 };
      const results: RaceResults = {
        finishPosition: 1,
        startPosition: 15,
        positionsGained: 14,
        lapsLed: 250,
        lapsCompleted: 500,
        fastestLap: 15.2,
        averageLap: 15.5,
        cleanLaps: 500,
        decisionsTotal: 5,
        decisionsCorrect: 4,
        xpGained: [mockXP],
      };

      manager.completeRace(results, true); // true = led most laps

      const state = manager.getCurrentState();
      // Win (40) + led lap (5) + most laps led (5) = 50
      expect(state.points).toBe(50);
    });

    it('increments race number after completion', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 50 };
      const results: RaceResults = {
        finishPosition: 10,
        startPosition: 15,
        positionsGained: 5,
        lapsLed: 0,
        lapsCompleted: 500,
        fastestLap: 15.8,
        averageLap: 16.0,
        cleanLaps: 490,
        decisionsTotal: 3,
        decisionsCorrect: 2,
        xpGained: [mockXP],
      };

      const beforeRace = manager.getCurrentState().race;
      manager.completeRace(results, false);
      const afterRace = manager.getCurrentState().race;

      expect(afterRace).toBe(beforeRace + 1);
    });

    it('adds result to race history', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 50 };
      const results: RaceResults = {
        finishPosition: 5,
        startPosition: 20,
        positionsGained: 15,
        lapsLed: 10,
        lapsCompleted: 500,
        fastestLap: 15.4,
        averageLap: 15.7,
        cleanLaps: 495,
        decisionsTotal: 4,
        decisionsCorrect: 3,
        xpGained: [mockXP],
      };

      manager.completeRace(results, false);
      const state = manager.getCurrentState();

      expect(state.raceHistory).toHaveLength(1);
      expect(state.raceHistory[0]).toEqual(results);
    });

    it('updates driver stats (races, top5, top10)', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 50 };
      const results: RaceResults = {
        finishPosition: 3,
        startPosition: 12,
        positionsGained: 9,
        lapsLed: 25,
        lapsCompleted: 500,
        fastestLap: 15.3,
        averageLap: 15.6,
        cleanLaps: 500,
        decisionsTotal: 5,
        decisionsCorrect: 5,
        xpGained: [mockXP],
      };

      manager.completeRace(results, false);
      const state = manager.getCurrentState();

      expect(state.driver.stats.races).toBe(1);
      expect(state.driver.stats.top5).toBe(1);
      expect(state.driver.stats.top10).toBe(1);
      expect(state.driver.stats.lapsLed).toBe(25);
    });

    it('updates driver stats for a win', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 150 };
      const results: RaceResults = {
        finishPosition: 1,
        startPosition: 5,
        positionsGained: 4,
        lapsLed: 400,
        lapsCompleted: 500,
        fastestLap: 15.1,
        averageLap: 15.4,
        cleanLaps: 500,
        decisionsTotal: 6,
        decisionsCorrect: 6,
        xpGained: [mockXP],
      };

      manager.completeRace(results, true);
      const state = manager.getCurrentState();

      expect(state.driver.stats.wins).toBe(1);
      expect(state.driver.stats.top5).toBe(1);
      expect(state.driver.stats.top10).toBe(1);
    });

    it('applies XP to driver skills', () => {
      const xpGains: XPGain[] = [
        { skill: 'racecraft', amount: 50 },
        { skill: 'consistency', amount: 30 },
      ];
      const results: RaceResults = {
        finishPosition: 8,
        startPosition: 15,
        positionsGained: 7,
        lapsLed: 5,
        lapsCompleted: 500,
        fastestLap: 15.6,
        averageLap: 15.9,
        cleanLaps: 485,
        decisionsTotal: 4,
        decisionsCorrect: 3,
        xpGained: xpGains,
      };

      const beforeSkills = { ...manager.getCurrentState().driver.skills };
      manager.completeRace(results, false);
      const afterSkills = manager.getCurrentState().driver.skills;

      // Skills should improve (exact amount depends on XP calculation, just verify increase)
      expect(afterSkills.racecraft).toBeGreaterThan(beforeSkills.racecraft);
      expect(afterSkills.consistency).toBeGreaterThan(beforeSkills.consistency);
    });

    it('accumulates points across multiple races', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };

      // Race 1: 10th place (27 pts)
      manager.completeRace(
        {
          finishPosition: 10,
          startPosition: 20,
          positionsGained: 10,
          lapsLed: 0,
          lapsCompleted: 500,
          fastestLap: 16.0,
          averageLap: 16.2,
          cleanLaps: 480,
          decisionsTotal: 3,
          decisionsCorrect: 2,
          xpGained: [mockXP],
        },
        false
      );

      expect(manager.getCurrentState().points).toBe(27);

      // Race 2: 5th place (32 pts)
      manager.completeRace(
        {
          finishPosition: 5,
          startPosition: 10,
          positionsGained: 5,
          lapsLed: 10,
          lapsCompleted: 500,
          fastestLap: 15.5,
          averageLap: 15.8,
          cleanLaps: 495,
          decisionsTotal: 4,
          decisionsCorrect: 4,
          xpGained: [mockXP],
        },
        false
      );

      // 27 + 32 (5th) + 5 (led laps) = 64
      expect(manager.getCurrentState().points).toBe(64);
    });
  });

  describe('isSeasonComplete', () => {
    beforeEach(() => {
      manager.startNewCareer('Test Driver', '1');
    });

    it('returns false at race 1', () => {
      expect(manager.isSeasonComplete()).toBe(false);
    });

    it('returns false at race 9', () => {
      // Simulate completing 8 races
      const mockXP: XPGain = { skill: 'racecraft', amount: 20 };
      for (let i = 0; i < 8; i++) {
        manager.completeRace(
          {
            finishPosition: 15,
            startPosition: 15,
            positionsGained: 0,
            lapsLed: 0,
            lapsCompleted: 500,
            fastestLap: 16.0,
            averageLap: 16.2,
            cleanLaps: 490,
            decisionsTotal: 2,
            decisionsCorrect: 1,
            xpGained: [mockXP],
          },
          false
        );
      }

      expect(manager.getCurrentState().race).toBe(9);
      expect(manager.isSeasonComplete()).toBe(false);
    });

    it('returns true after race 10', () => {
      // Complete all 10 races
      const mockXP: XPGain = { skill: 'racecraft', amount: 20 };
      for (let i = 0; i < 10; i++) {
        manager.completeRace(
          {
            finishPosition: 15,
            startPosition: 15,
            positionsGained: 0,
            lapsLed: 0,
            lapsCompleted: 500,
            fastestLap: 16.0,
            averageLap: 16.2,
            cleanLaps: 490,
            decisionsTotal: 2,
            decisionsCorrect: 1,
            xpGained: [mockXP],
          },
          false
        );
      }

      expect(manager.getCurrentState().race).toBe(11); // After race 10, increments to 11
      expect(manager.isSeasonComplete()).toBe(true);
    });
  });

  describe('advanceToNextSeason', () => {
    beforeEach(() => {
      manager.startNewCareer('Test Driver', '1');

      // Complete full season
      const mockXP: XPGain = { skill: 'racecraft', amount: 20 };
      for (let i = 0; i < 10; i++) {
        manager.completeRace(
          {
            finishPosition: 10,
            startPosition: 15,
            positionsGained: 5,
            lapsLed: 0,
            lapsCompleted: 500,
            fastestLap: 16.0,
            averageLap: 16.2,
            cleanLaps: 490,
            decisionsTotal: 2,
            decisionsCorrect: 1,
            xpGained: [mockXP],
          },
          false
        );
      }
    });

    it('increments season number', () => {
      const beforeSeason = manager.getCurrentState().season;
      manager.advanceToNextSeason();
      const afterSeason = manager.getCurrentState().season;

      expect(afterSeason).toBe(beforeSeason + 1);
    });

    it('resets race number to 1', () => {
      manager.advanceToNextSeason();
      const state = manager.getCurrentState();

      expect(state.race).toBe(1);
    });

    it('resets points to 0 for new season', () => {
      const pointsBeforeAdvance = manager.getCurrentState().points;
      expect(pointsBeforeAdvance).toBeGreaterThan(0); // Had points from races

      manager.advanceToNextSeason();
      const state = manager.getCurrentState();

      expect(state.points).toBe(0);
    });

    it('preserves race history from previous season', () => {
      const historyLength = manager.getCurrentState().raceHistory.length;
      expect(historyLength).toBe(10); // 10 races completed

      manager.advanceToNextSeason();
      const state = manager.getCurrentState();

      expect(state.raceHistory.length).toBe(historyLength); // History preserved
    });

    it('preserves driver progression (skills)', () => {
      const skillsBefore = { ...manager.getCurrentState().driver.skills };

      manager.advanceToNextSeason();
      const skillsAfter = manager.getCurrentState().driver.skills;

      // Skills should be preserved
      expect(skillsAfter.racecraft).toBe(skillsBefore.racecraft);
      expect(skillsAfter.consistency).toBe(skillsBefore.consistency);
    });
  });

  describe('save/load file persistence', () => {
    const testSavesDir = path.join(process.cwd(), 'saves');
    const testSaveId = 'test-career';
    const testSavePath = path.join(testSavesDir, `${testSaveId}.json`);
    const testBackupPath = path.join(testSavesDir, `${testSaveId}-backup.json`);

    beforeEach(() => {
      // Clean up any existing test files
      if (fs.existsSync(testSavePath)) fs.unlinkSync(testSavePath);
      if (fs.existsSync(testBackupPath)) fs.unlinkSync(testBackupPath);

      manager = new CareerManager();
    });

    afterEach(() => {
      // Clean up test files
      if (fs.existsSync(testSavePath)) fs.unlinkSync(testSavePath);
      if (fs.existsSync(testBackupPath)) fs.unlinkSync(testBackupPath);
    });

    it('creates saves directory if it does not exist', () => {
      manager.startNewCareer('Test Driver', '1');
      manager.save(testSaveId);

      expect(fs.existsSync(testSavesDir)).toBe(true);
    });

    it('saves career state to JSON file', () => {
      manager.startNewCareer('Test Driver', '1');
      manager.save(testSaveId);

      expect(fs.existsSync(testSavePath)).toBe(true);
    });

    it('save file contains valid JSON', () => {
      manager.startNewCareer('Test Driver', '1');
      manager.save(testSaveId);

      const fileContent = fs.readFileSync(testSavePath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      expect(parsed).toHaveProperty('driverId');
      expect(parsed).toHaveProperty('driver');
      expect(parsed).toHaveProperty('season');
      expect(parsed).toHaveProperty('race');
      expect(parsed).toHaveProperty('points');
    });

    it('loads career state from JSON file', () => {
      // Create and save a career
      const originalCareer = manager.startNewCareer('Lightning McQueen', '95');
      manager.save(testSaveId);

      // Create new manager and load
      const newManager = new CareerManager();
      newManager.load(testSaveId);
      const loadedCareer = newManager.getCurrentState();

      expect(loadedCareer.driver.name).toBe(originalCareer.driver.name);
      expect(loadedCareer.driver.number).toBe(originalCareer.driver.number);
      expect(loadedCareer.season).toBe(originalCareer.season);
      expect(loadedCareer.race).toBe(originalCareer.race);
      expect(loadedCareer.points).toBe(originalCareer.points);
    });

    it('save → load → state matches exactly (roundtrip test)', () => {
      // Create career with some progression
      manager.startNewCareer('Test Driver', '42');

      const mockXP: XPGain = { skill: 'racecraft', amount: 150 };
      manager.completeRace(
        {
          finishPosition: 1,
          startPosition: 10,
          positionsGained: 9,
          lapsLed: 350,
          lapsCompleted: 500,
          fastestLap: 15.1,
          averageLap: 15.4,
          cleanLaps: 500,
          decisionsTotal: 6,
          decisionsCorrect: 6,
          xpGained: [mockXP],
        },
        true
      );

      const originalState = manager.getCurrentState();
      manager.save(testSaveId);

      // Load into new manager
      const newManager = new CareerManager();
      newManager.load(testSaveId);
      const loadedState = newManager.getCurrentState();

      // Deep equality check
      expect(loadedState).toEqual(originalState);
    });

    it('creates backup before overwriting existing save', () => {
      // Create and save initial career
      manager.startNewCareer('Test Driver', '1');
      manager.save(testSaveId);

      const initialFileContent = fs.readFileSync(testSavePath, 'utf-8');

      // Complete a race and save again
      const mockXP: XPGain = { skill: 'racecraft', amount: 50 };
      manager.completeRace(
        {
          finishPosition: 5,
          startPosition: 15,
          positionsGained: 10,
          lapsLed: 10,
          lapsCompleted: 500,
          fastestLap: 15.5,
          averageLap: 15.8,
          cleanLaps: 495,
          decisionsTotal: 4,
          decisionsCorrect: 3,
          xpGained: [mockXP],
        },
        false
      );

      manager.save(testSaveId);

      // Backup should exist and contain the initial state
      expect(fs.existsSync(testBackupPath)).toBe(true);
      const backupContent = fs.readFileSync(testBackupPath, 'utf-8');
      expect(backupContent).toBe(initialFileContent);
    });

    it('handles corrupted save file gracefully', () => {
      // Write corrupted JSON to save file
      fs.mkdirSync(testSavesDir, { recursive: true });
      fs.writeFileSync(testSavePath, '{ invalid json }', 'utf-8');

      const newManager = new CareerManager();

      expect(() => {
        newManager.load(testSaveId);
      }).toThrow();
    });

    it('handles missing save file gracefully', () => {
      const newManager = new CareerManager();

      expect(() => {
        newManager.load('non-existent-save');
      }).toThrow(/not found|does not exist/i);
    });

    it('preserves all driver skills in save/load', () => {
      manager.startNewCareer('Test Driver', '1');
      const originalSkills = { ...manager.getCurrentState().driver.skills };

      manager.save(testSaveId);

      const newManager = new CareerManager();
      newManager.load(testSaveId);
      const loadedSkills = newManager.getCurrentState().driver.skills;

      expect(loadedSkills).toEqual(originalSkills);
    });

    it('preserves race history in save/load', () => {
      manager.startNewCareer('Test Driver', '1');

      // Complete a few races
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };
      for (let i = 0; i < 3; i++) {
        manager.completeRace(
          {
            finishPosition: 5 + i,
            startPosition: 15,
            positionsGained: 10 - i,
            lapsLed: i * 10,
            lapsCompleted: 500,
            fastestLap: 15.5,
            averageLap: 15.8,
            cleanLaps: 490,
            decisionsTotal: 3,
            decisionsCorrect: 2,
            xpGained: [mockXP],
          },
          false
        );
      }

      const originalHistory = manager.getCurrentState().raceHistory;
      manager.save(testSaveId);

      const newManager = new CareerManager();
      newManager.load(testSaveId);
      const loadedHistory = newManager.getCurrentState().raceHistory;

      expect(loadedHistory).toEqual(originalHistory);
      expect(loadedHistory).toHaveLength(3);
    });
  });

  describe('Track Unlocking System', () => {
    const testSaveId = 'test-unlock-save';
    const testSavesDir = path.join(process.cwd(), 'saves');
    const testSavePath = path.join(testSavesDir, `${testSaveId}.json`);
    const testBackupPath = path.join(testSavesDir, `${testSaveId}-backup.json`);

    beforeEach(() => {
      manager.startNewCareer('Test Driver', '1');
    });

    afterEach(() => {
      // Clean up test save files
      if (fs.existsSync(testSavePath)) {
        fs.unlinkSync(testSavePath);
      }
      if (fs.existsSync(testBackupPath)) {
        fs.unlinkSync(testBackupPath);
      }
    });

    it('starts with 3 tracks unlocked (bristol, charlotte, daytona)', () => {
      const state = manager.getCurrentState();

      expect(state.unlockedTracks).toContain('bristol');
      expect(state.unlockedTracks).toContain('charlotte');
      expect(state.unlockedTracks).toContain('daytona');
      expect(state.unlockedTracks).toHaveLength(3);
    });

    it('unlocks richmond and atlanta after top 10 finish', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };

      // Finish 10th (top 10)
      manager.completeRace(
        {
          finishPosition: 10,
          startPosition: 20,
          positionsGained: 10,
          lapsLed: 5,
          lapsCompleted: 500,
          fastestLap: 15.5,
          averageLap: 15.8,
          cleanLaps: 490,
          decisionsTotal: 3,
          decisionsCorrect: 2,
          xpGained: [mockXP],
        },
        false
      );

      const state = manager.getCurrentState();
      expect(state.unlockedTracks).toContain('richmond');
      expect(state.unlockedTracks).toContain('atlanta');
      expect(state.unlockedTracks).toHaveLength(5); // 3 initial + 2 unlocked
    });

    it('unlocks martinsville and texas after top 5 finish', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };

      // Finish 5th (top 5)
      manager.completeRace(
        {
          finishPosition: 5,
          startPosition: 15,
          positionsGained: 10,
          lapsLed: 10,
          lapsCompleted: 500,
          fastestLap: 15.3,
          averageLap: 15.6,
          cleanLaps: 495,
          decisionsTotal: 4,
          decisionsCorrect: 3,
          xpGained: [mockXP],
        },
        false
      );

      const state = manager.getCurrentState();

      // Top 5 also qualifies for top 10, so should unlock all tier 2 and tier 3
      expect(state.unlockedTracks).toContain('richmond');
      expect(state.unlockedTracks).toContain('atlanta');
      expect(state.unlockedTracks).toContain('martinsville');
      expect(state.unlockedTracks).toContain('texas');
      expect(state.unlockedTracks).toHaveLength(7); // 3 initial + 4 unlocked
    });

    it('unlocks watkins-glen after race win', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 50 };

      // Win the race
      manager.completeRace(
        {
          finishPosition: 1,
          startPosition: 10,
          positionsGained: 9,
          lapsLed: 350,
          lapsCompleted: 500,
          fastestLap: 15.1,
          averageLap: 15.4,
          cleanLaps: 500,
          decisionsTotal: 6,
          decisionsCorrect: 6,
          xpGained: [mockXP],
        },
        true
      );

      const state = manager.getCurrentState();

      // Win unlocks everything (top 10 + top 5 + win)
      expect(state.unlockedTracks).toContain('richmond');
      expect(state.unlockedTracks).toContain('atlanta');
      expect(state.unlockedTracks).toContain('martinsville');
      expect(state.unlockedTracks).toContain('texas');
      expect(state.unlockedTracks).toContain('watkins-glen');
      expect(state.unlockedTracks).toHaveLength(8); // 3 initial + 5 unlocked
    });

    it('does not unlock tracks if finish outside top 10', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 20 };

      // Finish 15th (outside top 10)
      manager.completeRace(
        {
          finishPosition: 15,
          startPosition: 20,
          positionsGained: 5,
          lapsLed: 0,
          lapsCompleted: 500,
          fastestLap: 16.0,
          averageLap: 16.2,
          cleanLaps: 480,
          decisionsTotal: 2,
          decisionsCorrect: 1,
          xpGained: [mockXP],
        },
        false
      );

      const state = manager.getCurrentState();

      // Should still have only the initial 3 tracks
      expect(state.unlockedTracks).toHaveLength(3);
      expect(state.unlockedTracks).toContain('bristol');
      expect(state.unlockedTracks).toContain('charlotte');
      expect(state.unlockedTracks).toContain('daytona');
    });

    it('does not duplicate tracks already unlocked', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };

      // First top 10 finish
      manager.completeRace(
        {
          finishPosition: 8,
          startPosition: 15,
          positionsGained: 7,
          lapsLed: 5,
          lapsCompleted: 500,
          fastestLap: 15.5,
          averageLap: 15.8,
          cleanLaps: 490,
          decisionsTotal: 3,
          decisionsCorrect: 2,
          xpGained: [mockXP],
        },
        false
      );

      const firstState = manager.getCurrentState();
      expect(firstState.unlockedTracks).toHaveLength(5); // 3 + 2

      // Second top 10 finish (should not add duplicates)
      manager.completeRace(
        {
          finishPosition: 9,
          startPosition: 12,
          positionsGained: 3,
          lapsLed: 8,
          lapsCompleted: 500,
          fastestLap: 15.6,
          averageLap: 15.9,
          cleanLaps: 485,
          decisionsTotal: 3,
          decisionsCorrect: 2,
          xpGained: [mockXP],
        },
        false
      );

      const secondState = manager.getCurrentState();
      expect(secondState.unlockedTracks).toHaveLength(5); // Still 5, no duplicates
    });

    it('unlocked tracks persist in save/load', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };

      // Unlock some tracks
      manager.completeRace(
        {
          finishPosition: 5,
          startPosition: 15,
          positionsGained: 10,
          lapsLed: 10,
          lapsCompleted: 500,
          fastestLap: 15.3,
          averageLap: 15.6,
          cleanLaps: 495,
          decisionsTotal: 4,
          decisionsCorrect: 3,
          xpGained: [mockXP],
        },
        false
      );

      const originalUnlocked = manager.getCurrentState().unlockedTracks;
      manager.save(testSaveId);

      // Load into new manager
      const newManager = new CareerManager();
      newManager.load(testSaveId);
      const loadedUnlocked = newManager.getCurrentState().unlockedTracks;

      expect(loadedUnlocked).toEqual(originalUnlocked);
      expect(loadedUnlocked).toHaveLength(7);
    });

    it('progressive unlocks work across multiple races', () => {
      const mockXP: XPGain = { skill: 'racecraft', amount: 30 };

      // Race 1: 15th place (no unlock)
      manager.completeRace(
        {
          finishPosition: 15,
          startPosition: 20,
          positionsGained: 5,
          lapsLed: 0,
          lapsCompleted: 500,
          fastestLap: 16.0,
          averageLap: 16.2,
          cleanLaps: 480,
          decisionsTotal: 2,
          decisionsCorrect: 1,
          xpGained: [mockXP],
        },
        false
      );
      expect(manager.getCurrentState().unlockedTracks).toHaveLength(3);

      // Race 2: 10th place (unlock tier 2)
      manager.completeRace(
        {
          finishPosition: 10,
          startPosition: 18,
          positionsGained: 8,
          lapsLed: 5,
          lapsCompleted: 500,
          fastestLap: 15.7,
          averageLap: 15.9,
          cleanLaps: 490,
          decisionsTotal: 3,
          decisionsCorrect: 2,
          xpGained: [mockXP],
        },
        false
      );
      expect(manager.getCurrentState().unlockedTracks).toHaveLength(5);

      // Race 3: 3rd place (unlock tier 3)
      manager.completeRace(
        {
          finishPosition: 3,
          startPosition: 12,
          positionsGained: 9,
          lapsLed: 50,
          lapsCompleted: 500,
          fastestLap: 15.2,
          averageLap: 15.5,
          cleanLaps: 498,
          decisionsTotal: 5,
          decisionsCorrect: 4,
          xpGained: [mockXP],
        },
        false
      );
      expect(manager.getCurrentState().unlockedTracks).toHaveLength(7);

      // Race 4: Win (unlock tier 4 - watkins glen)
      manager.completeRace(
        {
          finishPosition: 1,
          startPosition: 5,
          positionsGained: 4,
          lapsLed: 400,
          lapsCompleted: 500,
          fastestLap: 15.0,
          averageLap: 15.3,
          cleanLaps: 500,
          decisionsTotal: 6,
          decisionsCorrect: 6,
          xpGained: [mockXP],
        },
        true
      );

      const finalState = manager.getCurrentState();
      expect(finalState.unlockedTracks).toHaveLength(8);
      expect(finalState.unlockedTracks).toContain('watkins-glen');
    });
  });
});
