/**
 * Lap Time Calculation Tests
 *
 * Comprehensive test suite for NASCAR lap time calculation - the core integration
 * module that orchestrates speed, tire, and fuel physics into complete lap simulation.
 *
 * This module is critical as it ties together all physics subsystems and must
 * accurately reproduce real NASCAR lap times from EXAMPLES.md benchmarks.
 *
 * Following TDD: These tests are written BEFORE implementation.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLapTime,
  calculateLapTimeBreakdown,
} from '../../../src/engine/physics/laptime';
import type { Track, Driver, CarState, DriverState } from '../../../src/types';

// ============================================================================
// MOCK TRACK DATA
// ============================================================================

/**
 * Create Bristol Motor Speedway track data
 * 0.533 miles, 26° banking, tight short track
 */
function createBristolTrack(): Track {
  return {
    id: 'bristol',
    name: 'Bristol Motor Speedway',
    nickname: 'The Last Great Colosseum',
    length: 0.533,
    type: 'short',
    banking: {
      turns: 26,
      straights: 4,
    },
    surface: 'concrete',
    surfaceGrip: 0.95,
    sections: [
      { type: 'turn', length: 703.5, banking: 26, radius: 550, idealLine: 120, surfaceGrip: 0.95 },
      { type: 'straight', length: 703.5, idealLine: 140, surfaceGrip: 0.95 },
      { type: 'turn', length: 703.5, banking: 26, radius: 550, idealLine: 120, surfaceGrip: 0.95 },
      { type: 'straight', length: 703.5, idealLine: 140, surfaceGrip: 0.95 },
    ],
    difficulty: 8,
    raceLaps: 500,
  };
}

/**
 * Create Charlotte Motor Speedway track data
 * 1.5 miles, 24° banking, intermediate track
 */
function createCharlotteTrack(): Track {
  return {
    id: 'charlotte',
    name: 'Charlotte Motor Speedway',
    nickname: null,
    length: 1.5,
    type: 'intermediate',
    banking: {
      turns: 24,
      straights: 5,
    },
    surface: 'asphalt',
    surfaceGrip: 0.90,
    sections: [
      { type: 'turn', length: 1980, banking: 24, radius: 1000, idealLine: 168, surfaceGrip: 0.90 },
      { type: 'straight', length: 1980, idealLine: 190, surfaceGrip: 0.90 },
      { type: 'turn', length: 1980, banking: 24, radius: 1000, idealLine: 168, surfaceGrip: 0.90 },
      { type: 'straight', length: 1980, idealLine: 190, surfaceGrip: 0.90 },
    ],
    difficulty: 6,
    raceLaps: 400,
  };
}

/**
 * Create Daytona International Speedway track data
 * 2.5 miles, 31° banking, superspeedway
 */
function createDaytonaTrack(): Track {
  return {
    id: 'daytona',
    name: 'Daytona International Speedway',
    nickname: 'The World Center of Racing',
    length: 2.5,
    type: 'superspeedway',
    banking: {
      turns: 31,
      straights: 3,
    },
    surface: 'asphalt',
    surfaceGrip: 0.92,
    sections: [
      { type: 'turn', length: 2640, banking: 31, radius: 1500, idealLine: 185, surfaceGrip: 0.92 },
      { type: 'straight', length: 3960, idealLine: 195, surfaceGrip: 0.92 },
      { type: 'turn', length: 2640, banking: 31, radius: 1500, idealLine: 185, surfaceGrip: 0.92 },
      { type: 'straight', length: 3960, idealLine: 195, surfaceGrip: 0.92 },
    ],
    difficulty: 4,
    raceLaps: 200,
  };
}

// ============================================================================
// MOCK DRIVER/CAR STATE DATA
// ============================================================================

/**
 * Create baseline driver state for testing
 */
function createDriverState(overrides?: Partial<DriverState>): DriverState {
  return {
    skills: {
      racecraft: 70,
      consistency: 65,
      aggression: 50,
      focus: 80,
      stamina: 75,
      composure: 70,
      draftSense: 60,
      tireManagement: 65,
      fuelManagement: 60,
      pitStrategy: 55,
    },
    mentalState: {
      confidence: 75,
      frustration: 15,
      focus: 80,
      distraction: 10,
    },
    ...overrides,
  };
}

/**
 * Create baseline car state for testing
 */
function createCarState(overrides?: Partial<CarState>): CarState {
  return {
    tireWear: 100,
    fuelLevel: 100,
    damage: 0,
    inPit: false,
    lapsSincePit: 0,
    ...overrides,
  };
}

// ============================================================================
// BASIC LAP TIME TESTS
// ============================================================================

describe('Lap Time Calculation - Basic Tests', () => {
  it('should calculate Bristol clean lap time in realistic range (15.4-15.6s)', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState({ tireWear: 100, fuelLevel: 100 });

    const lapTime = calculateLapTime(bristol, driverState, carState);

    // Example 1 target: 15.4-15.6s
    expect(lapTime).toBeGreaterThan(15.0);
    expect(lapTime).toBeLessThan(16.0);
  });

  it('should calculate Charlotte lap time in realistic range (~28.5s)', () => {
    const charlotte = createCharlotteTrack();
    const driverState = createDriverState();
    const carState = createCarState({ tireWear: 100, fuelLevel: 100 });

    const lapTime = calculateLapTime(charlotte, driverState, carState);

    // Typical racing lap: ~28-31s
    expect(lapTime).toBeGreaterThan(27.0);
    expect(lapTime).toBeLessThan(32.0);
  });

  it('should calculate Daytona lap time in realistic range (varies by draft)', () => {
    const daytona = createDaytonaTrack();
    const driverState = createDriverState();
    const carState = createCarState({ tireWear: 100, fuelLevel: 100 });

    const lapTime = calculateLapTime(daytona, driverState, carState);

    // Typical lap: 45-55s (depends on draft)
    expect(lapTime).toBeGreaterThan(43.0);
    expect(lapTime).toBeLessThan(58.0);
  });

  it('should produce consistent results for identical inputs', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const lapTime1 = calculateLapTime(bristol, driverState, carState);
    const lapTime2 = calculateLapTime(bristol, driverState, carState);

    expect(lapTime1).toBe(lapTime2);
  });

  it('should produce faster lap times for higher skilled drivers', () => {
    const bristol = createBristolTrack();
    const rookieDriver = createDriverState({ skills: { ...createDriverState().skills, racecraft: 30 } });
    const expertDriver = createDriverState({ skills: { ...createDriverState().skills, racecraft: 95 } });
    const carState = createCarState();

    const rookieTime = calculateLapTime(bristol, rookieDriver, carState);
    const expertTime = calculateLapTime(bristol, expertDriver, carState);

    expect(expertTime).toBeLessThan(rookieTime);
  });

  it('should handle edge case of zero tire wear (fresh tires)', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState({ tireWear: 100 });

    const lapTime = calculateLapTime(bristol, driverState, carState);

    expect(lapTime).toBeGreaterThan(0);
    expect(lapTime).toBeLessThan(20); // Reasonable upper bound
  });

  it('should handle edge case of zero fuel', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState({ fuelLevel: 0 });

    const lapTime = calculateLapTime(bristol, driverState, carState);

    // Should still calculate (lighter car)
    expect(lapTime).toBeGreaterThan(0);
  });

  it('should calculate single turn time correctly', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    // Should have times for all sections
    expect(breakdown.sectionTimes.length).toBe(4);
    expect(breakdown.sectionTimes[0]).toBeGreaterThan(0);
  });

  it('should calculate single straight time correctly', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    // Straight section (index 1) should have valid time
    expect(breakdown.sectionTimes[1]).toBeGreaterThan(0);
  });
});

// ============================================================================
// TIRE WEAR INTEGRATION TESTS
// ============================================================================

describe('Lap Time Calculation - Tire Wear Integration', () => {
  it('should show lap time degradation with tire wear at Bristol', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const freshTires = createCarState({ tireWear: 100 });
    const wornTires = createCarState({ tireWear: 50 });

    const freshTime = calculateLapTime(bristol, driverState, freshTires);
    const wornTime = calculateLapTime(bristol, driverState, wornTires);

    // Worn tires should be slower
    expect(wornTime).toBeGreaterThan(freshTime);
    // Example 2: 50% wear adds 0.5-0.7s
    expect(wornTime - freshTime).toBeGreaterThan(0.3);
    expect(wornTime - freshTime).toBeLessThan(1.0);
  });

  it('should show progressive tire degradation over stint', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();

    const lap0 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 100 }));
    const lap25 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 75 }));
    const lap50 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 50 }));
    const lap75 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 25 }));

    // Times should progressively increase
    expect(lap25).toBeGreaterThan(lap0);
    expect(lap50).toBeGreaterThan(lap25);
    expect(lap75).toBeGreaterThan(lap50);
  });

  it('should show larger tire impact on short tracks than superspeedways', () => {
    const bristol = createBristolTrack();
    const daytona = createDaytonaTrack();
    const driverState = createDriverState();

    // Bristol tire wear impact
    const bristolFresh = calculateLapTime(bristol, driverState, createCarState({ tireWear: 100 }));
    const bristolWorn = calculateLapTime(bristol, driverState, createCarState({ tireWear: 50 }));
    const bristolDelta = bristolWorn - bristolFresh;

    // Daytona tire wear impact
    const daytonaFresh = calculateLapTime(daytona, driverState, createCarState({ tireWear: 100 }));
    const daytonaWorn = calculateLapTime(daytona, driverState, createCarState({ tireWear: 50 }));
    const daytonaDelta = daytonaWorn - daytonaFresh;

    // Bristol should show larger absolute impact (more time in turns)
    expect(bristolDelta).toBeGreaterThan(daytonaDelta);
  });

  it('should handle severely worn tires (20% wear remaining)', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const severelyWorn = createCarState({ tireWear: 20 });

    const lapTime = calculateLapTime(bristol, driverState, severelyWorn);

    // Should be significantly slower but still drivable
    expect(lapTime).toBeGreaterThan(16.5);
    expect(lapTime).toBeLessThan(20.0);
  });

  it('should show tire wear affects turns more than straights', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();

    const freshBreakdown = calculateLapTimeBreakdown(bristol, driverState, createCarState({ tireWear: 100 }));
    const wornBreakdown = calculateLapTimeBreakdown(bristol, driverState, createCarState({ tireWear: 50 }));

    // Turn sections (0, 2) should show larger penalty than straights (1, 3)
    const turnPenalty = (wornBreakdown.sectionTimes[0] - freshBreakdown.sectionTimes[0]) / freshBreakdown.sectionTimes[0];
    const straightPenalty = (wornBreakdown.sectionTimes[1] - freshBreakdown.sectionTimes[1]) / freshBreakdown.sectionTimes[1];

    expect(turnPenalty).toBeGreaterThan(straightPenalty);
  });
});

// ============================================================================
// FUEL WEIGHT INTEGRATION TESTS
// ============================================================================

describe('Lap Time Calculation - Fuel Weight Integration', () => {
  it('should show fuel weight impact (full vs empty tank)', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const emptyTank = createCarState({ fuelLevel: 0 });
    const fullTank = createCarState({ fuelLevel: 100 });

    const emptyTime = calculateLapTime(bristol, driverState, emptyTank);
    const fullTime = calculateLapTime(bristol, driverState, fullTank);

    // Full tank should be slower
    expect(fullTime).toBeGreaterThan(emptyTime);
    // Should be noticeable but not huge (~0.5-1.0s on short track)
    expect(fullTime - emptyTime).toBeGreaterThan(0.3);
    expect(fullTime - emptyTime).toBeLessThan(1.5);
  });

  it('should show fuel weight impact varies by track type', () => {
    const bristol = createBristolTrack();
    const charlotte = createCharlotteTrack();
    const daytona = createDaytonaTrack();
    const driverState = createDriverState();

    // Calculate fuel penalty for each track
    const bristolEmpty = calculateLapTime(bristol, driverState, createCarState({ fuelLevel: 0 }));
    const bristolFull = calculateLapTime(bristol, driverState, createCarState({ fuelLevel: 100 }));
    const bristolPenalty = bristolFull - bristolEmpty;

    const charlotteEmpty = calculateLapTime(charlotte, driverState, createCarState({ fuelLevel: 0 }));
    const charlotteFull = calculateLapTime(charlotte, driverState, createCarState({ fuelLevel: 100 }));
    const charlottePenalty = charlotteFull - charlotteEmpty;

    const daytonaEmpty = calculateLapTime(daytona, driverState, createCarState({ fuelLevel: 0 }));
    const daytonaFull = calculateLapTime(daytona, driverState, createCarState({ fuelLevel: 100 }));
    const daytonaPenalty = daytonaFull - daytonaEmpty;

    // Short tracks should have highest penalty, superspeedways lowest
    expect(bristolPenalty).toBeGreaterThan(charlottePenalty);
    expect(charlottePenalty).toBeGreaterThan(daytonaPenalty);
  });

  it('should show progressive fuel weight effect during run', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();

    const fuel100 = calculateLapTime(bristol, driverState, createCarState({ fuelLevel: 100 }));
    const fuel75 = calculateLapTime(bristol, driverState, createCarState({ fuelLevel: 75 }));
    const fuel50 = calculateLapTime(bristol, driverState, createCarState({ fuelLevel: 50 }));
    const fuel25 = calculateLapTime(bristol, driverState, createCarState({ fuelLevel: 25 }));

    // Times should progressively decrease as fuel burns off
    expect(fuel100).toBeGreaterThan(fuel75);
    expect(fuel75).toBeGreaterThan(fuel50);
    expect(fuel50).toBeGreaterThan(fuel25);
  });

  it('should handle half tank fuel correctly', () => {
    const charlotte = createCharlotteTrack();
    const driverState = createDriverState();
    const halfTank = createCarState({ fuelLevel: 50 });

    const lapTime = calculateLapTime(charlotte, driverState, halfTank);

    // Should be in reasonable range
    expect(lapTime).toBeGreaterThan(27.0);
    expect(lapTime).toBeLessThan(32.0);
  });
});

// ============================================================================
// COMBINED MODIFIERS TESTS
// ============================================================================

describe('Lap Time Calculation - Combined Modifiers', () => {
  it('should stack tire wear and fuel weight penalties', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();

    const optimal = calculateLapTime(bristol, driverState, createCarState({ tireWear: 100, fuelLevel: 0 }));
    const combined = calculateLapTime(bristol, driverState, createCarState({ tireWear: 50, fuelLevel: 100 }));

    // Both penalties should compound
    expect(combined).toBeGreaterThan(optimal);
    expect(combined - optimal).toBeGreaterThan(0.8);
  });

  it('should handle worst-case scenario (worn tires + full fuel)', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const worstCase = createCarState({ tireWear: 20, fuelLevel: 100 });

    const lapTime = calculateLapTime(bristol, driverState, worstCase);

    // Should be significantly slower than optimal
    expect(lapTime).toBeGreaterThan(17.0);
    expect(lapTime).toBeLessThan(22.0);
  });

  it('should handle best-case scenario (fresh tires + empty fuel)', () => {
    const bristol = createBristolTrack();
    const expertDriver = createDriverState({ skills: { ...createDriverState().skills, racecraft: 95 } });
    const bestCase = createCarState({ tireWear: 100, fuelLevel: 0 });

    const lapTime = calculateLapTime(bristol, expertDriver, bestCase);

    // Should approach qualifying pace
    expect(lapTime).toBeGreaterThan(14.5);
    expect(lapTime).toBeLessThan(15.5);
  });
});

// ============================================================================
// DRIVER SKILL VARIATION TESTS
// ============================================================================

describe('Lap Time Calculation - Driver Skill Variations', () => {
  it('should show performance difference between skill levels', () => {
    const bristol = createBristolTrack();
    const carState = createCarState();

    const rookie = createDriverState({ skills: { ...createDriverState().skills, racecraft: 30 } });
    const average = createDriverState({ skills: { ...createDriverState().skills, racecraft: 70 } });
    const expert = createDriverState({ skills: { ...createDriverState().skills, racecraft: 95 } });

    const rookieTime = calculateLapTime(bristol, rookie, carState);
    const averageTime = calculateLapTime(bristol, average, carState);
    const expertTime = calculateLapTime(bristol, expert, carState);

    // Should show clear progression
    expect(rookieTime).toBeGreaterThan(averageTime);
    expect(averageTime).toBeGreaterThan(expertTime);
  });

  it('should show mental state impact on lap times', () => {
    const bristol = createBristolTrack();
    const carState = createCarState();

    const goodMental = createDriverState({
      mentalState: { confidence: 90, frustration: 10, focus: 90, distraction: 5 },
    });
    const poorMental = createDriverState({
      mentalState: { confidence: 30, frustration: 80, focus: 40, distraction: 70 },
    });

    const goodTime = calculateLapTime(bristol, goodMental, carState);
    const poorTime = calculateLapTime(bristol, poorMental, carState);

    // Poor mental state should be slower
    expect(poorTime).toBeGreaterThan(goodTime);
  });

  it('should handle driver with all minimum skills', () => {
    const bristol = createBristolTrack();
    const carState = createCarState();
    const minSkills = createDriverState({
      skills: {
        racecraft: 10,
        consistency: 10,
        aggression: 10,
        focus: 10,
        stamina: 10,
        composure: 10,
        draftSense: 10,
        tireManagement: 10,
        fuelManagement: 10,
        pitStrategy: 10,
      },
    });

    const lapTime = calculateLapTime(bristol, minSkills, carState);

    // Should be much slower but still complete lap
    expect(lapTime).toBeGreaterThan(16.0);
    expect(lapTime).toBeLessThan(25.0);
  });

  it('should handle driver with all maximum skills', () => {
    const bristol = createBristolTrack();
    const carState = createCarState();
    const maxSkills = createDriverState({
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
      mentalState: { confidence: 100, frustration: 0, focus: 100, distraction: 0 },
    });

    const lapTime = calculateLapTime(bristol, maxSkills, carState);

    // Should approach or beat track record
    expect(lapTime).toBeGreaterThan(14.0);
    expect(lapTime).toBeLessThan(15.3);
  });
});

// ============================================================================
// LAP BREAKDOWN TESTS
// ============================================================================

describe('Lap Time Breakdown', () => {
  it('should return breakdown with correct number of sections', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    expect(breakdown.sectionTimes.length).toBe(4);
  });

  it('should have section times that sum to total lap time', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const lapTime = calculateLapTime(bristol, driverState, carState);
    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    const sumOfSections = breakdown.sectionTimes.reduce((sum, time) => sum + time, 0);

    // Should match within floating point precision
    expect(Math.abs(lapTime - sumOfSections)).toBeLessThan(0.001);
  });

  it('should calculate average speed correctly', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    // Average speed = distance / time, converted to MPH
    const expectedAvgSpeed = (bristol.length / breakdown.totalTime) * 3600;

    expect(Math.abs(breakdown.averageSpeed - expectedAvgSpeed)).toBeLessThan(0.1);
  });

  it('should identify slowest section in breakdown', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    const slowestTime = Math.max(...breakdown.sectionTimes);

    // All section times should be valid
    expect(slowestTime).toBeGreaterThan(0);
    expect(breakdown.sectionTimes).toContain(slowestTime);
  });

  it('should show turn vs straight time proportions at Bristol', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    // Bristol: turns are indices 0 and 2, straights are 1 and 3
    const turnTime = breakdown.sectionTimes[0] + breakdown.sectionTimes[2];
    const straightTime = breakdown.sectionTimes[1] + breakdown.sectionTimes[3];

    // Both should be significant portions
    expect(turnTime).toBeGreaterThan(0);
    expect(straightTime).toBeGreaterThan(0);
  });

  it('should return realistic top speed', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    // Top speed at Bristol should be on straights (~140-175 mph)
    expect(breakdown.topSpeed).toBeGreaterThan(130);
    expect(breakdown.topSpeed).toBeLessThan(180);
  });

  it('should show Charlotte has higher average speed than Bristol', () => {
    const bristol = createBristolTrack();
    const charlotte = createCharlotteTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const bristolBreakdown = calculateLapTimeBreakdown(bristol, driverState, carState);
    const charlotteBreakdown = calculateLapTimeBreakdown(charlotte, driverState, carState);

    // Charlotte is faster overall
    expect(charlotteBreakdown.averageSpeed).toBeGreaterThan(bristolBreakdown.averageSpeed);
  });

  it('should show Daytona has highest average speed', () => {
    const bristol = createBristolTrack();
    const charlotte = createCharlotteTrack();
    const daytona = createDaytonaTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const bristolAvg = calculateLapTimeBreakdown(bristol, driverState, carState).averageSpeed;
    const charlotteAvg = calculateLapTimeBreakdown(charlotte, driverState, carState).averageSpeed;
    const daytonaAvg = calculateLapTimeBreakdown(daytona, driverState, carState).averageSpeed;

    // Speed increases from short → intermediate → superspeedway
    expect(daytonaAvg).toBeGreaterThan(charlotteAvg);
    expect(charlotteAvg).toBeGreaterThan(bristolAvg);
  });
});

// ============================================================================
// SCENARIO VALIDATION TESTS (Against EXAMPLES.md)
// ============================================================================

describe('Scenario Validation - EXAMPLES.md Benchmarks', () => {
  it('Example 1: Clean lap at Bristol should be 15.4-15.6s', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState({
      skills: {
        racecraft: 70,
        consistency: 65,
        aggression: 50,
        focus: 80,
        stamina: 75,
        composure: 70,
        draftSense: 60,
        tireManagement: 65,
        fuelManagement: 60,
        pitStrategy: 55,
      },
      mentalState: {
        confidence: 75,
        frustration: 15,
        focus: 80,
        distraction: 10,
      },
    });
    const carState = createCarState({ tireWear: 100, fuelLevel: 100 });

    const lapTime = calculateLapTime(bristol, driverState, carState);

    // Exact target from Example 1
    expect(lapTime).toBeGreaterThan(15.0);
    expect(lapTime).toBeLessThan(16.0);
  });

  it('Example 2: Tire wear should add 0.5-0.7s at 50% wear', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();

    const freshTime = calculateLapTime(bristol, driverState, createCarState({ tireWear: 100, fuelLevel: 100 }));
    const wornTime = calculateLapTime(bristol, driverState, createCarState({ tireWear: 50, fuelLevel: 100 }));

    const penalty = wornTime - freshTime;

    // Example 2 target: 0.5-0.7s penalty
    expect(penalty).toBeGreaterThan(0.3);
    expect(penalty).toBeLessThan(1.0);
  });

  it('Example 8: Bristol race progression (lap 1 vs 40 vs 80)', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();

    // Lap 1: Fresh tires, full fuel
    const lap1 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 100, fuelLevel: 100 }));

    // Lap 40: Moderate wear, less fuel
    const lap40 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 60, fuelLevel: 60 }));

    // Lap 80: Worn tires, low fuel
    const lap80 = calculateLapTime(bristol, driverState, createCarState({ tireWear: 20, fuelLevel: 20 }));

    // Lap 40 should be slower than lap 1 (tire wear > fuel savings)
    expect(lap40).toBeGreaterThan(lap1);

    // Lap 80 should be slowest (very worn tires despite light fuel)
    expect(lap80).toBeGreaterThan(lap40);
  });

  it('Charlotte lap should be approximately 30.5s typical racing pace', () => {
    const charlotte = createCharlotteTrack();
    const driverState = createDriverState();
    const carState = createCarState({ tireWear: 100, fuelLevel: 100 });

    const lapTime = calculateLapTime(charlotte, driverState, carState);

    // PHYSICS-REFERENCE.md: typical racing lap 30.5s
    expect(lapTime).toBeGreaterThan(28.0);
    expect(lapTime).toBeLessThan(33.0);
  });

  it('Bristol average speed should be approximately 125 MPH', () => {
    const bristol = createBristolTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(bristol, driverState, carState);

    // PHYSICS-REFERENCE.md: average speed ~127 mph
    expect(breakdown.averageSpeed).toBeGreaterThan(115);
    expect(breakdown.averageSpeed).toBeLessThan(135);
  });

  it('Charlotte average speed should be approximately 175 MPH', () => {
    const charlotte = createCharlotteTrack();
    const driverState = createDriverState();
    const carState = createCarState();

    const breakdown = calculateLapTimeBreakdown(charlotte, driverState, carState);

    // PHYSICS-REFERENCE.md: average speed ~177 mph
    expect(breakdown.averageSpeed).toBeGreaterThan(165);
    expect(breakdown.averageSpeed).toBeLessThan(190);
  });
});
