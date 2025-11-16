/**
 * Driver Class Unit Tests
 *
 * Tests for the Driver class covering:
 * - Driver creation with default and custom skills
 * - Skill validation and clamping
 * - Mental state initialization and updates
 * - Performance modifier calculations
 * - XP gain and skill progression
 * - State retrieval for physics calculations
 *
 * Reference: docs/SPEC.md (Character Stats section)
 *            docs/EXAMPLES.md (Example 4: Mental State Performance Impact)
 */

import { describe, it, expect } from 'vitest';
import { Driver } from '../../../src/character/driver';
import type { DriverSkills, MentalState } from '../../../src/types';

describe('Driver Class', () => {
  describe('Driver Creation', () => {
    it('should create driver with default skills (50 for all)', () => {
      const driver = new Driver('test-1', 'Test Driver', '42');

      expect(driver.id).toBe('test-1');
      expect(driver.name).toBe('Test Driver');
      expect(driver.number).toBe('42');

      // All default skills should be 50
      expect(driver.skills.racecraft).toBe(50);
      expect(driver.skills.consistency).toBe(50);
      expect(driver.skills.aggression).toBe(50);
      expect(driver.skills.focus).toBe(50);
      expect(driver.skills.stamina).toBe(50);
      expect(driver.skills.composure).toBe(50);
      expect(driver.skills.draftSense).toBe(50);
      expect(driver.skills.tireManagement).toBe(50);
      expect(driver.skills.fuelManagement).toBe(50);
      expect(driver.skills.pitStrategy).toBe(50);
    });

    it('should create driver with custom skills', () => {
      const customSkills: Partial<DriverSkills> = {
        racecraft: 70,
        consistency: 65,
        aggression: 55,
        focus: 80,
      };

      const driver = new Driver('test-2', 'Custom Driver', '24', customSkills);

      expect(driver.skills.racecraft).toBe(70);
      expect(driver.skills.consistency).toBe(65);
      expect(driver.skills.aggression).toBe(55);
      expect(driver.skills.focus).toBe(80);

      // Unspecified skills should default to 50
      expect(driver.skills.stamina).toBe(50);
      expect(driver.skills.composure).toBe(50);
    });

    it('should clamp skills below 0 to 0', () => {
      const invalidSkills: Partial<DriverSkills> = {
        racecraft: -10,
        consistency: -5,
      };

      const driver = new Driver('test-3', 'Invalid Low', '1', invalidSkills);

      expect(driver.skills.racecraft).toBe(0);
      expect(driver.skills.consistency).toBe(0);
    });

    it('should clamp skills above 100 to 100', () => {
      const invalidSkills: Partial<DriverSkills> = {
        racecraft: 150,
        consistency: 105,
      };

      const driver = new Driver('test-4', 'Invalid High', '2', invalidSkills);

      expect(driver.skills.racecraft).toBe(100);
      expect(driver.skills.consistency).toBe(100);
    });

    it('should initialize with neutral mental state by default', () => {
      const driver = new Driver('test-5', 'Neutral Driver', '50');

      // Neutral values: confidence and frustration at 50, focus at 70, distraction low
      expect(driver.mentalState.confidence).toBe(50);
      expect(driver.mentalState.frustration).toBe(50);
      expect(driver.mentalState.focus).toBe(70);
      expect(driver.mentalState.distraction).toBe(10);
    });

    it('should accept custom initial mental state', () => {
      const customMentalState: Partial<MentalState> = {
        confidence: 80,
        frustration: 20,
        focus: 90,
      };

      const driver = new Driver('test-6', 'Confident Driver', '99', undefined, customMentalState);

      expect(driver.mentalState.confidence).toBe(80);
      expect(driver.mentalState.frustration).toBe(20);
      expect(driver.mentalState.focus).toBe(90);
      expect(driver.mentalState.distraction).toBe(10); // Default for unspecified
    });
  });

  describe('State Retrieval', () => {
    it('should return DriverState for physics calculations', () => {
      const driver = new Driver('test-7', 'State Test', '3');
      const state = driver.getState();

      expect(state).toHaveProperty('skills');
      expect(state).toHaveProperty('mentalState');
      expect(state.skills.racecraft).toBe(50);
      expect(state.mentalState.confidence).toBe(50);
    });

    it('should return current state reflecting any changes', () => {
      const driver = new Driver('test-8', 'Dynamic State', '4');

      // Update mental state
      driver.updateMentalState('good_lap', 1.0);

      const state = driver.getState();

      // Confidence should have increased from good lap
      expect(state.mentalState.confidence).toBeGreaterThan(50);
    });
  });

  describe('Mental State Updates', () => {
    it('should increase confidence on good lap', () => {
      const driver = new Driver('test-9', 'Good Lap', '5');
      const initialConfidence = driver.mentalState.confidence;

      driver.updateMentalState('good_lap', 1.0);

      expect(driver.mentalState.confidence).toBeGreaterThan(initialConfidence);
      expect(driver.mentalState.confidence).toBeLessThanOrEqual(100);
    });

    it('should increase frustration on bad lap', () => {
      const driver = new Driver('test-10', 'Bad Lap', '6');
      const initialFrustration = driver.mentalState.frustration;

      driver.updateMentalState('bad_lap', 1.0);

      expect(driver.mentalState.frustration).toBeGreaterThan(initialFrustration);
      expect(driver.mentalState.confidence).toBeLessThan(50); // Also decreases confidence
    });

    it('should increase confidence on successful pass', () => {
      const driver = new Driver('test-11', 'Passer', '7');
      const initialConfidence = driver.mentalState.confidence;

      driver.updateMentalState('pass', 1.0);

      expect(driver.mentalState.confidence).toBeGreaterThan(initialConfidence);
    });

    it('should increase frustration when getting passed', () => {
      const driver = new Driver('test-12', 'Got Passed', '8');
      const initialFrustration = driver.mentalState.frustration;

      driver.updateMentalState('got_passed', 1.0);

      expect(driver.mentalState.frustration).toBeGreaterThan(initialFrustration);
    });

    it('should severely impact mental state on crash', () => {
      const driver = new Driver('test-13', 'Crasher', '9');
      const initialConfidence = driver.mentalState.confidence;
      const initialFrustration = driver.mentalState.frustration;

      driver.updateMentalState('crash', 1.0);

      expect(driver.mentalState.confidence).toBeLessThan(initialConfidence - 10);
      expect(driver.mentalState.frustration).toBeGreaterThan(initialFrustration + 15);
    });

    it('should scale mental state changes by magnitude', () => {
      const driver1 = new Driver('test-14a', 'Small Magnitude', '10');
      const driver2 = new Driver('test-14b', 'Large Magnitude', '11');

      driver1.updateMentalState('good_lap', 0.5); // Half magnitude
      driver2.updateMentalState('good_lap', 2.0); // Double magnitude

      // Driver2 should have larger confidence increase
      expect(driver2.mentalState.confidence).toBeGreaterThan(driver1.mentalState.confidence);
    });

    it('should clamp mental state values to 0-100 range', () => {
      const driver = new Driver('test-15', 'Extreme', '12');

      // Multiple good laps to max confidence
      for (let i = 0; i < 20; i++) {
        driver.updateMentalState('good_lap', 1.0);
      }

      expect(driver.mentalState.confidence).toBeLessThanOrEqual(100);
      expect(driver.mentalState.confidence).toBeGreaterThanOrEqual(0);

      // Multiple bad events to min confidence
      for (let i = 0; i < 20; i++) {
        driver.updateMentalState('crash', 1.0);
      }

      expect(driver.mentalState.confidence).toBeLessThanOrEqual(100);
      expect(driver.mentalState.confidence).toBeGreaterThanOrEqual(0);
      expect(driver.mentalState.frustration).toBeLessThanOrEqual(100);
    });
  });

  describe('Mental State Decay', () => {
    it('should decay confidence toward neutral (50)', () => {
      const driver = new Driver('test-16', 'Decay Test', '13');
      driver.mentalState.confidence = 80;

      driver.applyMentalStateDecay(10); // 10 laps

      expect(driver.mentalState.confidence).toBeLessThan(80);
      expect(driver.mentalState.confidence).toBeGreaterThan(50);
    });

    it('should decay frustration toward neutral (50)', () => {
      const driver = new Driver('test-17', 'Frustration Decay', '14');
      driver.mentalState.frustration = 80;

      driver.applyMentalStateDecay(10);

      expect(driver.mentalState.frustration).toBeLessThan(80);
      expect(driver.mentalState.frustration).toBeGreaterThan(50);
    });

    it('should recover focus toward baseline (70)', () => {
      const driver = new Driver('test-18', 'Focus Recovery', '15');
      driver.mentalState.focus = 40;

      driver.applyMentalStateDecay(10);

      expect(driver.mentalState.focus).toBeGreaterThan(40);
    });

    it('should apply faster decay with more laps elapsed', () => {
      const driver1 = new Driver('test-19a', 'Short Decay', '16');
      const driver2 = new Driver('test-19b', 'Long Decay', '17');

      driver1.mentalState.confidence = 80;
      driver2.mentalState.confidence = 80;

      driver1.applyMentalStateDecay(5);
      driver2.applyMentalStateDecay(20);

      expect(driver2.mentalState.confidence).toBeLessThan(driver1.mentalState.confidence);
    });
  });

  describe('Performance Modifiers', () => {
    it('should return positive modifier for high confidence', () => {
      const driver = new Driver('test-20', 'High Confidence', '18');
      driver.mentalState.confidence = 85;
      driver.mentalState.frustration = 30;

      const modifier = driver.getPerformanceModifier();

      expect(modifier).toBeGreaterThan(1.0); // Performance boost
      expect(modifier).toBeLessThanOrEqual(1.08); // Max +8% per SPEC
    });

    it('should return negative modifier for high frustration', () => {
      const driver = new Driver('test-21', 'High Frustration', '19');
      driver.mentalState.confidence = 30;
      driver.mentalState.frustration = 85;

      const modifier = driver.getPerformanceModifier();

      expect(modifier).toBeLessThan(1.0); // Performance penalty
      expect(modifier).toBeGreaterThanOrEqual(0.92); // Max -8% per SPEC
    });

    it('should return neutral modifier for neutral mental state', () => {
      const driver = new Driver('test-22', 'Neutral', '20');
      driver.mentalState.confidence = 50;
      driver.mentalState.frustration = 50;

      const modifier = driver.getPerformanceModifier();

      expect(modifier).toBeCloseTo(1.0, 1); // Approximately 1.0
    });

    it('should combine confidence and frustration effects', () => {
      const driver = new Driver('test-23', 'Combined', '21');
      driver.mentalState.confidence = 80; // Positive effect
      driver.mentalState.frustration = 70; // Negative effect

      const modifier = driver.getPerformanceModifier();

      // Should be net effect of both
      expect(modifier).toBeLessThan(1.05); // Not full confidence bonus
      expect(modifier).toBeGreaterThan(0.95); // Not full frustration penalty
    });
  });

  describe('XP and Progression', () => {
    it('should gain XP and increase skills', () => {
      const driver = new Driver('test-24', 'XP Gain', '22');
      const initialRacecraft = driver.skills.racecraft;

      const leveled = driver.gainXP({ racecraft: 100 });

      expect(driver.skills.racecraft).toBeGreaterThan(initialRacecraft);
      expect(leveled).toBe(true); // Should indicate skill improvement
    });

    it('should distribute XP across multiple skills', () => {
      const driver = new Driver('test-25', 'Multi XP', '23');
      const initialRacecraft = driver.skills.racecraft;
      const initialConsistency = driver.skills.consistency;

      driver.gainXP({
        racecraft: 50,
        consistency: 50,
      });

      expect(driver.skills.racecraft).toBeGreaterThan(initialRacecraft);
      expect(driver.skills.consistency).toBeGreaterThan(initialConsistency);
    });

    it('should not exceed skill cap of 100', () => {
      const driver = new Driver('test-26', 'Skill Cap', '24', {
        racecraft: 95,
      });

      // Massive XP gain
      driver.gainXP({ racecraft: 10000 });

      expect(driver.skills.racecraft).toBeLessThanOrEqual(100);
    });

    it('should return false when no level up occurs', () => {
      const driver = new Driver('test-27', 'No Level', '25');

      // Small XP gain
      const leveled = driver.gainXP({ racecraft: 1 });

      expect(leveled).toBe(false);
    });

    it('should handle zero XP gain gracefully', () => {
      const driver = new Driver('test-28', 'Zero XP', '26');
      const initialSkills = { ...driver.skills };

      driver.gainXP({});

      expect(driver.skills).toEqual(initialSkills);
    });
  });
});
