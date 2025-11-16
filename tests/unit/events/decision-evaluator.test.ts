import { describe, it, expect } from 'vitest';
import { evaluateDecision } from '../../../src/events/decision-evaluator';
import { createPassingDecision, createPitStrategyDecision, createMentalStateDecision } from '../../../src/events/decision-library';
import { createMockDriver } from '../../fixtures/mock-data';
import type { RaceContext, Driver } from '../../../src/types';

describe('DecisionEvaluator', () => {
  const createTestContext = (overrides: Partial<RaceContext> = {}): RaceContext => ({
    lap: 100,
    position: 10,
    lapsToGo: 100,
    gapToLeader: 5.5,
    gapToNext: 0.5,
    tireWear: 75,
    fuelLevel: 60,
    mentalState: {
      confidence: 50,
      frustration: 50,
      focus: 50,
      distraction: 50,
    },
    ...overrides,
  });

  describe('evaluateDecision', () => {
    it('should throw error for invalid choice ID', () => {
      const driver = createMockDriver('test', 'Test Driver', '1', { racecraft: 70 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      expect(() => {
        evaluateDecision(decision, 'invalid-choice', driver);
      }).toThrow('Invalid choice ID: invalid-choice');
    });

    it('should return valid DecisionResult structure', () => {
      const driver = createMockDriver('test', 'Test Driver', '1', { racecraft: 70 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      const result = evaluateDecision(decision, 'patient-pass', driver);

      expect(result).toHaveProperty('optionChosen');
      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('effects');
      expect(result).toHaveProperty('xpGained');
      expect(result).toHaveProperty('message');

      expect(['success', 'neutral', 'failure']).toContain(result.outcome);
    });
  });

  describe('Skill-based outcomes', () => {
    it('should favor skilled drivers for risky decisions', () => {
      const skilledDriver = createMockDriver('skilled', 'Veteran', '1', { racecraft: 95, aggression: 90, focus: 85 });
      const rookieDriver = createMockDriver('rookie', 'Newbie', '2', { racecraft: 25, aggression: 30, focus: 20 });
      const context = createTestContext({ mentalState: { confidence: 50, frustration: 50, focus: 50, distraction: 50 } });
      const decision = createPassingDecision(context, 10);

      // Run multiple times to check probability distribution
      const skilledResults = Array.from({ length: 100 }, () =>
        evaluateDecision(decision, 'aggressive-pass', skilledDriver)
      );

      const rookieResults = Array.from({ length: 100 }, () =>
        evaluateDecision(decision, 'aggressive-pass', rookieDriver)
      );

      const skilledSuccesses = skilledResults.filter(r => r.outcome === 'success').length;
      const rookieSuccesses = rookieResults.filter(r => r.outcome === 'success').length;

      // Skilled driver should succeed significantly more often
      expect(skilledSuccesses).toBeGreaterThan(rookieSuccesses + 20);
      expect(skilledSuccesses).toBeGreaterThan(50); // High skill should succeed >50% of the time
      expect(rookieSuccesses).toBeLessThan(40); // Low skill should fail often
    });

    it('should consider mental state in outcome calculation', () => {
      const driver = createMockDriver('test', 'Test', '1', { racecraft: 60, aggression: 60, focus: 60 });

      const confidentContext = createTestContext({
        mentalState: { confidence: 90, frustration: 10, focus: 80, distraction: 20 },
      });

      const frustratedContext = createTestContext({
        mentalState: { confidence: 20, frustration: 90, focus: 40, distraction: 70 },
      });

      const confidentDecision = createPassingDecision(confidentContext, 10);
      const frustratedDecision = createPassingDecision(frustratedContext, 10);

      const confidentResults = Array.from({ length: 100 }, () =>
        evaluateDecision(confidentDecision, 'aggressive-pass', driver)
      );

      const frustratedResults = Array.from({ length: 100 }, () =>
        evaluateDecision(frustratedDecision, 'aggressive-pass', driver)
      );

      const confidentSuccesses = confidentResults.filter(r => r.outcome === 'success').length;
      const frustratedSuccesses = frustratedResults.filter(r => r.outcome === 'success').length;

      // Confident driver should succeed more
      expect(confidentSuccesses).toBeGreaterThan(frustratedSuccesses + 15);
    });
  });

  describe('Pit Strategy Decisions', () => {
    it('should reset tire wear and fuel for full pit stop', () => {
      const driver = createMockDriver('test', 'Test', '1', { pitStrategy: 70 });
      const context = createTestContext({ tireWear: 30, fuelLevel: 25 });
      const decision = createPitStrategyDecision(context);

      const result = evaluateDecision(decision, 'pit-full', driver);

      expect(result.effects.tireWearChange).toBe(100);
      expect(result.effects.fuelChange).toBe(100);
      expect(result.effects.positionChange).toBeLessThanOrEqual(-2); // Lost positions
    });

    it('should only reset fuel for fuel-only pit', () => {
      const driver = createMockDriver('test', 'Test', '1', { pitStrategy: 70 });
      const context = createTestContext({ tireWear: 50, fuelLevel: 20 });
      const decision = createPitStrategyDecision(context);

      const result = evaluateDecision(decision, 'fuel-only', driver);

      expect(result.effects.fuelChange).toBe(100);
      expect(result.effects.tireWearChange).toBeLessThan(0); // Tires actually wear more
    });

    it('should award pit strategy XP for successful pit decisions', () => {
      const driver = createMockDriver('test', 'Test', '1', { pitStrategy: 85 });
      const context = createTestContext();
      const decision = createPitStrategyDecision(context);

      // Run multiple times to get at least one success
      const results = Array.from({ length: 20 }, () =>
        evaluateDecision(decision, 'pit-full', driver)
      );

      const successResult = results.find(r => r.outcome === 'success');
      expect(successResult).toBeDefined();
      expect(successResult!.xpGained.pitStrategy).toBeGreaterThan(0);
    });
  });

  describe('Passing Decisions', () => {
    it('should gain position on successful aggressive pass', () => {
      const driver = createMockDriver('test', 'Test', '1', { racecraft: 90, aggression: 85, focus: 80 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 15);

      // Run multiple times to get a success
      const results = Array.from({ length: 50 }, () =>
        evaluateDecision(decision, 'aggressive-pass', driver)
      );

      const successResult = results.find(r => r.outcome === 'success');
      expect(successResult).toBeDefined();
      expect(successResult!.effects.positionChange).toBe(1);
      expect(successResult!.effects.mentalStateChange?.confidence).toBeGreaterThan(0);
    });

    it('should lose position and take damage on failed aggressive pass', () => {
      const driver = createMockDriver('test', 'Test', '1', { racecraft: 20, aggression: 30, focus: 25 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      // Run multiple times to get a failure
      const results = Array.from({ length: 50 }, () =>
        evaluateDecision(decision, 'aggressive-pass', driver)
      );

      const failureResult = results.find(r => r.outcome === 'failure');
      expect(failureResult).toBeDefined();
      expect(failureResult!.effects.positionChange).toBeLessThanOrEqual(0);
      expect(failureResult!.effects.damageChange).toBeGreaterThan(0);
      expect(failureResult!.effects.mentalStateChange?.frustration).toBeGreaterThan(0);
    });

    it('should award racecraft XP for passing decisions', () => {
      const driver = createMockDriver('test', 'Test', '1', { racecraft: 85 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      const results = Array.from({ length: 20 }, () =>
        evaluateDecision(decision, 'patient-pass', driver)
      );

      const successResult = results.find(r => r.outcome === 'success');
      expect(successResult).toBeDefined();
      expect(successResult!.xpGained.racecraft).toBeGreaterThan(0);
    });
  });

  describe('Mental State Decisions', () => {
    it('should reduce frustration on successful calm-down decision', () => {
      const driver = createMockDriver('test', 'Test', '1', { composure: 80, focus: 75 });
      const context = createTestContext({
        mentalState: { confidence: 40, frustration: 80, focus: 50, distraction: 60 },
      });
      const decision = createMentalStateDecision(context);

      const results = Array.from({ length: 20 }, () =>
        evaluateDecision(decision, 'calm-down', driver)
      );

      const successResult = results.find(r => r.outcome === 'success');
      expect(successResult).toBeDefined();
      expect(successResult!.effects.mentalStateChange?.frustration).toBeLessThan(0);
      expect(successResult!.effects.mentalStateChange?.focus).toBeGreaterThan(0);
    });

    it('should award composure XP for mental state management', () => {
      const driver = createMockDriver('test', 'Test', '1', { composure: 85 });
      const context = createTestContext({
        mentalState: { confidence: 40, frustration: 75, focus: 50, distraction: 60 },
      });
      const decision = createMentalStateDecision(context);

      const results = Array.from({ length: 20 }, () =>
        evaluateDecision(decision, 'calm-down', driver)
      );

      const successResult = results.find(r => r.outcome === 'success');
      expect(successResult).toBeDefined();
      expect(successResult!.xpGained.composure).toBeGreaterThan(0);
    });
  });

  describe('Outcome Messages', () => {
    it('should provide descriptive messages for all outcomes', () => {
      const driver = createMockDriver('test', 'Test', '1', { racecraft: 60 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      const result = evaluateDecision(decision, 'aggressive-pass', driver);

      expect(result.message).toBeDefined();
      expect(result.message!.length).toBeGreaterThan(10);
      expect(typeof result.message).toBe('string');
    });
  });

  describe('XP Distribution', () => {
    it('should award more XP for successful outcomes than neutral', () => {
      const skilledDriver = createMockDriver('skilled', 'Veteran', '1', { racecraft: 95 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      const results = Array.from({ length: 30 }, () =>
        evaluateDecision(decision, 'patient-pass', skilledDriver)
      );

      const successResult = results.find(r => r.outcome === 'success');
      const neutralResult = results.find(r => r.outcome === 'neutral');

      if (successResult && neutralResult) {
        const successXP = Object.values(successResult.xpGained).reduce((sum, val) => sum + val, 0);
        const neutralXP = Object.values(neutralResult.xpGained).reduce((sum, val) => sum + val, 0);

        expect(successXP).toBeGreaterThan(neutralXP);
      }
    });

    it('should award no XP for failed outcomes', () => {
      const rookieDriver = createMockDriver('rookie', 'Newbie', '2', { racecraft: 15 });
      const context = createTestContext();
      const decision = createPassingDecision(context, 10);

      const results = Array.from({ length: 50 }, () =>
        evaluateDecision(decision, 'aggressive-pass', rookieDriver)
      );

      const failureResult = results.find(r => r.outcome === 'failure');
      expect(failureResult).toBeDefined();

      const totalXP = Object.values(failureResult!.xpGained).reduce((sum, val) => sum + val, 0);
      expect(totalXP).toBe(0);
    });
  });
});
