/**
 * Mental State System Unit Tests
 *
 * Tests for mental state calculation and manipulation functions:
 * - Performance modifier calculations
 * - Event-based state changes
 * - Natural decay toward neutral
 * - Mental resilience calculations
 *
 * Reference: docs/SPEC.md (Mental State System section)
 *            docs/EXAMPLES.md (Example 4: Mental State Performance Impact)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMentalStateModifier,
  applyMentalStateEvent,
  applyMentalStateDecay,
  calculateMentalResilience,
} from '../../../src/character/mental-state';
import type { MentalState, DriverSkills } from '../../../src/types';

describe('Mental State System', () => {
  describe('calculateMentalStateModifier', () => {
    it('should provide positive speed modifier for high confidence', () => {
      const mentalState: MentalState = {
        confidence: 85,
        frustration: 20,
        focus: 80,
        distraction: 10,
      };

      const modifier = calculateMentalStateModifier(mentalState);

      expect(modifier.speedModifier).toBeGreaterThan(1.0);
      expect(modifier.speedModifier).toBeLessThanOrEqual(1.08); // Max 8% per SPEC
    });

    it('should provide negative speed modifier for high frustration', () => {
      const mentalState: MentalState = {
        confidence: 25,
        frustration: 85,
        focus: 50,
        distraction: 60,
      };

      const modifier = calculateMentalStateModifier(mentalState);

      expect(modifier.speedModifier).toBeLessThan(1.0);
      expect(modifier.speedModifier).toBeGreaterThanOrEqual(0.92); // Max -8% per SPEC
    });

    it('should provide neutral modifier for neutral mental state', () => {
      const mentalState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const modifier = calculateMentalStateModifier(mentalState);

      expect(modifier.speedModifier).toBeCloseTo(1.0, 2);
      expect(modifier.skillModifier).toBeCloseTo(0, 1);
    });

    it('should boost skill modifier with high focus', () => {
      const mentalState: MentalState = {
        confidence: 70,
        frustration: 30,
        focus: 95,
        distraction: 5,
      };

      const modifier = calculateMentalStateModifier(mentalState);

      expect(modifier.skillModifier).toBeGreaterThan(0);
      expect(modifier.skillModifier).toBeLessThanOrEqual(10); // Max +10 skill points
    });

    it('should reduce skill modifier with low focus', () => {
      const mentalState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 30,
        distraction: 70,
      };

      const modifier = calculateMentalStateModifier(mentalState);

      expect(modifier.skillModifier).toBeLessThan(0);
    });

    it('should affect decision quality based on focus and distraction', () => {
      const highFocus: MentalState = {
        confidence: 60,
        frustration: 40,
        focus: 90,
        distraction: 10,
      };

      const lowFocus: MentalState = {
        confidence: 60,
        frustration: 40,
        focus: 30,
        distraction: 70,
      };

      const goodDecision = calculateMentalStateModifier(highFocus);
      const poorDecision = calculateMentalStateModifier(lowFocus);

      expect(goodDecision.decisionQuality).toBeGreaterThan(poorDecision.decisionQuality);
    });

    it('should match Example 4 from EXAMPLES.md (high confidence vs high frustration)', () => {
      const goodMentalState: MentalState = {
        confidence: 80,
        frustration: 20,
        focus: 80,
        distraction: 10,
      };

      const poorMentalState: MentalState = {
        confidence: 25,
        frustration: 75,
        focus: 50,
        distraction: 60,
      };

      const goodModifier = calculateMentalStateModifier(goodMentalState);
      const poorModifier = calculateMentalStateModifier(poorMentalState);

      // Good state should be at least 8% faster than poor state
      const performanceDiff = goodModifier.speedModifier / poorModifier.speedModifier;
      expect(performanceDiff).toBeGreaterThanOrEqual(1.08);
      expect(performanceDiff).toBeLessThanOrEqual(1.15); // But not absurdly different
    });
  });

  describe('applyMentalStateEvent', () => {
    it('should increase confidence on good lap', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateEvent(initialState, 'good_lap', 1.0);

      expect(newState.confidence).toBeGreaterThan(initialState.confidence);
      expect(newState.confidence).toBeGreaterThan(55);
      expect(newState.confidence).toBeLessThan(65);
    });

    it('should increase frustration and decrease confidence on bad lap', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateEvent(initialState, 'bad_lap', 1.0);

      expect(newState.frustration).toBeGreaterThan(initialState.frustration);
      expect(newState.confidence).toBeLessThan(initialState.confidence);
    });

    it('should increase confidence on successful pass', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateEvent(initialState, 'pass', 1.0);

      expect(newState.confidence).toBeGreaterThan(initialState.confidence);
      expect(newState.frustration).toBeLessThan(initialState.frustration); // Small reduction
    });

    it('should increase frustration when getting passed', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateEvent(initialState, 'got_passed', 1.0);

      expect(newState.frustration).toBeGreaterThan(initialState.frustration);
      expect(newState.confidence).toBeLessThanOrEqual(initialState.confidence);
    });

    it('should severely impact mental state on crash', () => {
      const initialState: MentalState = {
        confidence: 70,
        frustration: 30,
        focus: 80,
        distraction: 10,
      };

      const newState = applyMentalStateEvent(initialState, 'crash', 1.0);

      expect(newState.confidence).toBeLessThan(initialState.confidence - 10);
      expect(newState.frustration).toBeGreaterThan(initialState.frustration + 15);
      expect(newState.distraction).toBeGreaterThan(initialState.distraction);
    });

    it('should scale changes by magnitude parameter', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const smallChange = applyMentalStateEvent(initialState, 'good_lap', 0.5);
      const largeChange = applyMentalStateEvent(initialState, 'good_lap', 2.0);

      const smallDiff = smallChange.confidence - initialState.confidence;
      const largeDiff = largeChange.confidence - initialState.confidence;

      expect(largeDiff).toBeGreaterThan(smallDiff * 3); // Roughly 4x larger
    });

    it('should clamp values to 0-100 range', () => {
      const extremeHigh: MentalState = {
        confidence: 95,
        frustration: 95,
        focus: 95,
        distraction: 95,
      };

      const extremeLow: MentalState = {
        confidence: 5,
        frustration: 5,
        focus: 5,
        distraction: 5,
      };

      const afterGoodLap = applyMentalStateEvent(extremeHigh, 'good_lap', 3.0);
      const afterBadLap = applyMentalStateEvent(extremeLow, 'bad_lap', 3.0);

      // All values should be clamped to 0-100
      expect(afterGoodLap.confidence).toBeLessThanOrEqual(100);
      expect(afterGoodLap.confidence).toBeGreaterThanOrEqual(0);
      expect(afterBadLap.frustration).toBeLessThanOrEqual(100);
      expect(afterBadLap.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should return new object without mutating original', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const originalValues = { ...initialState };
      applyMentalStateEvent(initialState, 'good_lap', 1.0);

      expect(initialState).toEqual(originalValues);
    });
  });

  describe('applyMentalStateDecay', () => {
    it('should decay high confidence toward neutral (50)', () => {
      const initialState: MentalState = {
        confidence: 85,
        frustration: 40,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateDecay(initialState, 0.1);

      expect(newState.confidence).toBeLessThan(initialState.confidence);
      expect(newState.confidence).toBeGreaterThan(50);
    });

    it('should decay low confidence toward neutral (50)', () => {
      const initialState: MentalState = {
        confidence: 20,
        frustration: 40,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateDecay(initialState, 0.1);

      expect(newState.confidence).toBeGreaterThan(initialState.confidence);
      expect(newState.confidence).toBeLessThan(50);
    });

    it('should decay high frustration toward neutral (50)', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 85,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateDecay(initialState, 0.1);

      expect(newState.frustration).toBeLessThan(initialState.frustration);
      expect(newState.frustration).toBeGreaterThan(50);
    });

    it('should recover focus toward baseline (70)', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 40,
        distraction: 10,
      };

      const newState = applyMentalStateDecay(initialState, 0.1);

      expect(newState.focus).toBeGreaterThan(initialState.focus);
      expect(newState.focus).toBeLessThanOrEqual(70);
    });

    it('should reduce distraction toward low baseline (10)', () => {
      const initialState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 60,
      };

      const newState = applyMentalStateDecay(initialState, 0.1);

      expect(newState.distraction).toBeLessThan(initialState.distraction);
      expect(newState.distraction).toBeGreaterThanOrEqual(10);
    });

    it('should apply faster decay with higher decay rate', () => {
      const initialState: MentalState = {
        confidence: 85,
        frustration: 85,
        focus: 40,
        distraction: 60,
      };

      const slowDecay = applyMentalStateDecay(initialState, 0.05);
      const fastDecay = applyMentalStateDecay(initialState, 0.20);

      expect(Math.abs(fastDecay.confidence - 50)).toBeLessThan(Math.abs(slowDecay.confidence - 50));
      expect(Math.abs(fastDecay.frustration - 50)).toBeLessThan(Math.abs(slowDecay.frustration - 50));
    });

    it('should not change neutral state significantly', () => {
      const neutralState: MentalState = {
        confidence: 50,
        frustration: 50,
        focus: 70,
        distraction: 10,
      };

      const newState = applyMentalStateDecay(neutralState, 0.1);

      expect(newState.confidence).toBeCloseTo(50, 0);
      expect(newState.frustration).toBeCloseTo(50, 0);
      expect(newState.focus).toBeCloseTo(70, 0);
      expect(newState.distraction).toBeCloseTo(10, 0);
    });

    it('should return new object without mutating original', () => {
      const initialState: MentalState = {
        confidence: 85,
        frustration: 30,
        focus: 60,
        distraction: 20,
      };

      const originalValues = { ...initialState };
      applyMentalStateDecay(initialState, 0.1);

      expect(initialState).toEqual(originalValues);
    });
  });

  describe('calculateMentalResilience', () => {
    it('should return higher resilience for higher focus skill', () => {
      const highFocus: Partial<DriverSkills> = {
        focus: 90,
        composure: 50,
      };

      const lowFocus: Partial<DriverSkills> = {
        focus: 30,
        composure: 50,
      };

      const highResilience = calculateMentalResilience(highFocus as DriverSkills);
      const lowResilience = calculateMentalResilience(lowFocus as DriverSkills);

      expect(highResilience).toBeGreaterThan(lowResilience);
    });

    it('should be influenced by composure skill', () => {
      const highComposure: Partial<DriverSkills> = {
        focus: 50,
        composure: 90,
      };

      const lowComposure: Partial<DriverSkills> = {
        focus: 50,
        composure: 30,
      };

      const highResilience = calculateMentalResilience(highComposure as DriverSkills);
      const lowResilience = calculateMentalResilience(lowComposure as DriverSkills);

      expect(highResilience).toBeGreaterThan(lowResilience);
    });

    it('should return value in reasonable range (0.5-2.0)', () => {
      const averageSkills: Partial<DriverSkills> = {
        focus: 50,
        composure: 50,
      };

      const resilience = calculateMentalResilience(averageSkills as DriverSkills);

      expect(resilience).toBeGreaterThanOrEqual(0.5);
      expect(resilience).toBeLessThanOrEqual(2.0);
    });

    it('should return approximately 1.25 for average skills', () => {
      const averageSkills: Partial<DriverSkills> = {
        focus: 50,
        composure: 50,
        racecraft: 50,
        consistency: 50,
        aggression: 50,
        stamina: 50,
        draftSense: 50,
        tireManagement: 50,
        fuelManagement: 50,
        pitStrategy: 50,
      };

      const resilience = calculateMentalResilience(averageSkills as DriverSkills);

      expect(resilience).toBeCloseTo(1.25, 1);
    });
  });
});
