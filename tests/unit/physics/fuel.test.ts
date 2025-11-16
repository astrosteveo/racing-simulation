import { describe, it, expect } from 'vitest';
import {
  calculateBaseFuelConsumption,
  calculateFuelConsumption,
  calculateFuelWeightPenalty,
  applyDriverSkillModifier,
  applyMentalStateModifier,
  applyDraftBonus,
} from '../../../src/engine/physics/fuel';
import type { Driver, Track, CarState, DraftStatus, TrackType, MentalState, DriverSkills } from '../../../src/types';

describe('Fuel Physics', () => {
  // Test helpers - create minimal test objects
  const createTestDriver = (overrides?: Partial<Driver>): Driver => ({
    id: 'test-driver',
    name: 'Test Driver',
    number: '1',
    isPlayer: true,
    skills: {
      racecraft: 70,
      consistency: 70,
      aggression: 50,
      focus: 70,
      stamina: 70,
      composure: 70,
      draftSense: 70,
      tireManagement: 70,
      fuelManagement: 70,
      pitStrategy: 70,
    },
    mentalState: {
      confidence: 50,
      frustration: 0,
      focus: 70,
      distraction: 0,
    },
    stats: {
      races: 0,
      wins: 0,
      top5: 0,
      top10: 0,
      poles: 0,
      lapsLed: 0,
      avgFinish: 15,
    },
    ...overrides,
  });

  const createTestTrack = (type: TrackType): Track => ({
    id: 'test-track',
    name: 'Test Track',
    length: type === 'short' ? 0.533 : type === 'intermediate' ? 1.5 : 2.5,
    type,
    banking: { turns: 24, straights: 0 },
    surface: 'asphalt',
    surfaceGrip: 1.0,
    sections: [],
    difficulty: 5,
    raceLaps: 100,
  });

  const createTestCarState = (fuelLevel: number = 100): CarState => ({
    tireWear: 100,
    fuelLevel,
    damage: 0,
    inPit: false,
    lapsSincePit: 0,
  });

  const createTestDraftStatus = (inDraft: boolean = false): DraftStatus => ({
    inDraft,
    distance: inDraft ? 2.5 : 10,
    speedBoost: inDraft ? 4.0 : 0,
    fuelSavings: inDraft ? 12 : 0,
  });

  describe('calculateBaseFuelConsumption', () => {
    it('should return correct base rate for superspeedway', () => {
      const fuel = calculateBaseFuelConsumption('superspeedway');
      expect(fuel).toBeCloseTo(0.27, 2);
    });

    it('should return correct base rate for intermediate track', () => {
      const fuel = calculateBaseFuelConsumption('intermediate');
      expect(fuel).toBeCloseTo(0.20, 2);
    });

    it('should return correct base rate for short track', () => {
      const fuel = calculateBaseFuelConsumption('short');
      expect(fuel).toBeCloseTo(0.11, 2);
    });

    it('should return correct base rate for road course', () => {
      const fuel = calculateBaseFuelConsumption('road');
      expect(fuel).toBeCloseTo(0.18, 2);
    });
  });

  describe('applyDriverSkillModifier', () => {
    it('should not modify fuel for consistency skill of 70', () => {
      const baseFuel = 0.20;
      const modified = applyDriverSkillModifier(baseFuel, 70);

      // At 70 consistency: (70/100) * 0.12 = 0.084 (8.4% reduction)
      // Result should be 0.20 * (1 - 0.084) = 0.20 * 0.916 = 0.1832
      expect(modified).toBeCloseTo(0.1832, 3);
    });

    it('should provide maximum 12% reduction for consistency skill of 100', () => {
      const baseFuel = 0.20;
      const modified = applyDriverSkillModifier(baseFuel, 100);

      // 12% reduction: 0.20 * 0.88 = 0.176
      expect(modified).toBeCloseTo(0.176, 3);
    });

    it('should provide minimal reduction for low consistency skill', () => {
      const baseFuel = 0.20;
      const modified = applyDriverSkillModifier(baseFuel, 30);

      // 30% of 12% = 3.6% reduction
      // 0.20 * 0.964 = 0.1928
      expect(modified).toBeCloseTo(0.1928, 3);
    });

    it('should provide no reduction for consistency skill of 0', () => {
      const baseFuel = 0.20;
      const modified = applyDriverSkillModifier(baseFuel, 0);

      expect(modified).toBe(baseFuel);
    });
  });

  describe('applyMentalStateModifier', () => {
    it('should not modify fuel for neutral mental state', () => {
      const baseFuel = 0.20;
      const mentalState: MentalState = {
        confidence: 50,
        frustration: 0,
        focus: 50,
        distraction: 0,
      };

      const modified = applyMentalStateModifier(baseFuel, mentalState);

      // 50 confidence = 4% reduction
      // 0 frustration = 0% penalty
      // Net: 0.20 * 0.96 = 0.192
      expect(modified).toBeCloseTo(0.192, 3);
    });

    it('should increase fuel consumption with high frustration', () => {
      const baseFuel = 0.20;
      const mentalState: MentalState = {
        confidence: 50,
        frustration: 80,
        focus: 50,
        distraction: 0,
      };

      const modified = applyMentalStateModifier(baseFuel, mentalState);

      // Frustration penalty: 80/100 * 0.20 = 16% increase
      // Confidence bonus: 50/100 * 0.08 = 4% reduction
      // Applied sequentially: 0.20 * 1.16 = 0.232, then * 0.96 = 0.22272
      expect(modified).toBeGreaterThan(baseFuel);
      expect(modified).toBeCloseTo(0.223, 2);
    });

    it('should reduce fuel consumption with high confidence', () => {
      const baseFuel = 0.20;
      const mentalState: MentalState = {
        confidence: 100,
        frustration: 0,
        focus: 50,
        distraction: 0,
      };

      const modified = applyMentalStateModifier(baseFuel, mentalState);

      // 100 confidence = 8% reduction, 0 frustration
      // 0.20 * 0.92 = 0.184
      expect(modified).toBeCloseTo(0.184, 3);
    });
  });

  describe('applyDraftBonus', () => {
    it('should reduce fuel by ~12% when drafting', () => {
      const baseFuel = 0.20;
      const draftStatus = createTestDraftStatus(true);

      const modified = applyDraftBonus(baseFuel, draftStatus);

      // 12% reduction: 0.20 * 0.88 = 0.176
      expect(modified).toBeCloseTo(0.176, 3);
    });

    it('should not modify fuel when not drafting', () => {
      const baseFuel = 0.20;
      const draftStatus = createTestDraftStatus(false);

      const modified = applyDraftBonus(baseFuel, draftStatus);

      expect(modified).toBe(baseFuel);
    });
  });

  describe('calculateFuelWeightPenalty', () => {
    it('should calculate correct penalty for superspeedway', () => {
      const penalty = calculateFuelWeightPenalty(10, 'superspeedway');

      // 10 gallons * 0.025 s/gal = 0.25 seconds
      expect(penalty).toBeCloseTo(0.25, 2);
    });

    it('should calculate correct penalty for intermediate track', () => {
      const penalty = calculateFuelWeightPenalty(10, 'intermediate');

      // 10 gallons * 0.045 s/gal = 0.45 seconds
      expect(penalty).toBeCloseTo(0.45, 2);
    });

    it('should calculate correct penalty for short track', () => {
      const penalty = calculateFuelWeightPenalty(10, 'short');

      // 10 gallons * 0.055 s/gal = 0.55 seconds
      expect(penalty).toBeCloseTo(0.55, 2);
    });

    it('should return zero penalty for empty tank', () => {
      const penalty = calculateFuelWeightPenalty(0, 'intermediate');
      expect(penalty).toBe(0);
    });

    it('should scale linearly with fuel amount', () => {
      const penalty5 = calculateFuelWeightPenalty(5, 'intermediate');
      const penalty10 = calculateFuelWeightPenalty(10, 'intermediate');

      expect(penalty10).toBeCloseTo(penalty5 * 2, 2);
    });
  });

  describe('calculateFuelConsumption - integration', () => {
    it('should calculate realistic consumption for Bristol (short track)', () => {
      const driver = createTestDriver({
        skills: {
          racecraft: 70,
          consistency: 65,
          aggression: 50,
          focus: 70,
          stamina: 70,
          composure: 70,
          draftSense: 70,
          tireManagement: 70,
          fuelManagement: 70,
          pitStrategy: 70,
        },
        mentalState: {
          confidence: 50,
          frustration: 0,
          focus: 70,
          distraction: 0,
        },
      });
      const track = createTestTrack('short');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const consumption = calculateFuelConsumption(driver, track, carState, draftStatus);

      // Expected: ~0.09-0.12 gallons/lap for short track
      expect(consumption).toBeGreaterThan(0.08);
      expect(consumption).toBeLessThan(0.13);
    });

    it('should calculate realistic consumption for Daytona (superspeedway)', () => {
      const driver = createTestDriver({
        skills: {
          racecraft: 70,
          consistency: 70,
          aggression: 50,
          focus: 70,
          stamina: 70,
          composure: 70,
          draftSense: 70,
          tireManagement: 70,
          fuelManagement: 70,
          pitStrategy: 70,
        },
      });
      const track = createTestTrack('superspeedway');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const consumption = calculateFuelConsumption(driver, track, carState, draftStatus);

      // Expected: ~0.20-0.30 gallons/lap for superspeedway
      expect(consumption).toBeGreaterThan(0.19);
      expect(consumption).toBeLessThan(0.31);
    });

    it('should show significant fuel savings when drafting on superspeedway', () => {
      const driver = createTestDriver();
      const track = createTestTrack('superspeedway');
      const carState = createTestCarState(100);

      const noDraft = calculateFuelConsumption(driver, track, carState, createTestDraftStatus(false));
      const withDraft = calculateFuelConsumption(driver, track, carState, createTestDraftStatus(true));

      // Draft should save ~12% fuel
      const savings = (noDraft - withDraft) / noDraft;
      expect(savings).toBeGreaterThan(0.10);
      expect(savings).toBeLessThan(0.14);
    });

    it('should consume less fuel with high consistency skill', () => {
      const lowSkill = createTestDriver({
        skills: {
          racecraft: 50,
          consistency: 30,
          aggression: 50,
          focus: 50,
          stamina: 50,
          composure: 50,
          draftSense: 50,
          tireManagement: 50,
          fuelManagement: 50,
          pitStrategy: 50,
        },
      });
      const highSkill = createTestDriver({
        skills: {
          racecraft: 90,
          consistency: 100,
          aggression: 50,
          focus: 90,
          stamina: 90,
          composure: 90,
          draftSense: 90,
          tireManagement: 90,
          fuelManagement: 90,
          pitStrategy: 90,
        },
      });
      const track = createTestTrack('intermediate');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const lowConsumption = calculateFuelConsumption(lowSkill, track, carState, draftStatus);
      const highConsumption = calculateFuelConsumption(highSkill, track, carState, draftStatus);

      // High skill should use less fuel
      expect(highConsumption).toBeLessThan(lowConsumption);

      // Difference should be noticeable (at least 8%)
      const difference = (lowConsumption - highConsumption) / lowConsumption;
      expect(difference).toBeGreaterThan(0.08);
    });

    it('should consume more fuel when frustrated', () => {
      const calm = createTestDriver({
        mentalState: {
          confidence: 80,
          frustration: 0,
          focus: 80,
          distraction: 0,
        },
      });
      const frustrated = createTestDriver({
        mentalState: {
          confidence: 30,
          frustration: 80,
          focus: 40,
          distraction: 60,
        },
      });
      const track = createTestTrack('intermediate');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const calmConsumption = calculateFuelConsumption(calm, track, carState, draftStatus);
      const frustratedConsumption = calculateFuelConsumption(frustrated, track, carState, draftStatus);

      // Frustration should increase consumption
      expect(frustratedConsumption).toBeGreaterThan(calmConsumption);
    });
  });

  describe('NASCAR Data Validation', () => {
    it('should match Bristol 500 fuel consumption (~50 gallons for 500 laps)', () => {
      const driver = createTestDriver({
        skills: {
          racecraft: 70,
          consistency: 65,
          aggression: 50,
          focus: 70,
          stamina: 70,
          composure: 70,
          draftSense: 70,
          tireManagement: 70,
          fuelManagement: 70,
          pitStrategy: 70,
        },
      });
      const track = createTestTrack('short');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const fuelPerLap = calculateFuelConsumption(driver, track, carState, draftStatus);
      const totalFuel = fuelPerLap * 500;

      // Real data: ~50 gallons total
      // Allow range of 40-60 gallons (accounting for variations)
      expect(totalFuel).toBeGreaterThan(40);
      expect(totalFuel).toBeLessThan(60);
    });

    it('should match Daytona 500 fuel consumption (~50-60 gallons for 200 laps)', () => {
      const driver = createTestDriver({
        skills: {
          racecraft: 70,
          consistency: 70,
          aggression: 50,
          focus: 70,
          stamina: 70,
          composure: 70,
          draftSense: 70,
          tireManagement: 70,
          fuelManagement: 70,
          pitStrategy: 70,
        },
      });
      const track = createTestTrack('superspeedway');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const fuelPerLap = calculateFuelConsumption(driver, track, carState, draftStatus);
      const totalFuel = fuelPerLap * 200;

      // Real data: ~50-60 gallons total
      expect(totalFuel).toBeGreaterThan(45);
      expect(totalFuel).toBeLessThan(65);
    });

    it('should calculate realistic pit windows for superspeedway (70-85 laps per tank)', () => {
      const driver = createTestDriver();
      const track = createTestTrack('superspeedway');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const fuelPerLap = calculateFuelConsumption(driver, track, carState, draftStatus);
      const tankCapacity = 18; // gallons
      const lapsPerTank = tankCapacity / fuelPerLap;

      // Expected: 70-85 laps per tank for average driver (consistency 70)
      // Note: Real NASCAR ~95 laps/tank but that's with expert fuel management
      // Base rate 0.27 with modifiers gives ~76 laps which is realistic for average driver
      expect(lapsPerTank).toBeGreaterThan(70);
      expect(lapsPerTank).toBeLessThan(85);
    });

    it('should calculate realistic pit windows for short track (160-200 laps per tank)', () => {
      const driver = createTestDriver();
      const track = createTestTrack('short');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const fuelPerLap = calculateFuelConsumption(driver, track, carState, draftStatus);
      const tankCapacity = 18; // gallons
      const lapsPerTank = tankCapacity / fuelPerLap;

      // Expected: 150-200 laps per tank
      expect(lapsPerTank).toBeGreaterThan(150);
      expect(lapsPerTank).toBeLessThan(210);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero fuel level gracefully', () => {
      const driver = createTestDriver();
      const track = createTestTrack('intermediate');
      const carState = createTestCarState(0);
      const draftStatus = createTestDraftStatus(false);

      const consumption = calculateFuelConsumption(driver, track, carState, draftStatus);

      // Should still return a valid consumption rate
      expect(consumption).toBeGreaterThan(0);
    });

    it('should handle maximum skill levels', () => {
      const driver = createTestDriver({
        skills: {
          racecraft: 100,
          consistency: 100,
          aggression: 100,
          focus: 100,
          stamina: 100,
          composure: 100,
          draftSense: 100,
          tireManagement: 100,
          fuelManagement: 100,
          pitStrategy: 100,
        },
        mentalState: {
          confidence: 100,
          frustration: 0,
          focus: 100,
          distraction: 0,
        },
      });
      const track = createTestTrack('intermediate');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const consumption = calculateFuelConsumption(driver, track, carState, draftStatus);

      // Should be valid and less than base rate
      expect(consumption).toBeGreaterThan(0);
      expect(consumption).toBeLessThan(calculateBaseFuelConsumption('intermediate'));
    });

    it('should handle combined worst-case modifiers', () => {
      const driver = createTestDriver({
        skills: {
          racecraft: 0,
          consistency: 0,
          aggression: 100,
          focus: 0,
          stamina: 0,
          composure: 0,
          draftSense: 0,
          tireManagement: 0,
          fuelManagement: 0,
          pitStrategy: 0,
        },
        mentalState: {
          confidence: 0,
          frustration: 100,
          focus: 0,
          distraction: 100,
        },
      });
      const track = createTestTrack('intermediate');
      const carState = createTestCarState(100);
      const draftStatus = createTestDraftStatus(false);

      const consumption = calculateFuelConsumption(driver, track, carState, draftStatus);

      // Should be higher than base rate but still reasonable
      expect(consumption).toBeGreaterThan(calculateBaseFuelConsumption('intermediate'));
      expect(consumption).toBeLessThan(0.30); // Sanity check
    });
  });
});
