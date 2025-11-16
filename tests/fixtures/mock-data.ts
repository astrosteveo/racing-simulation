/**
 * Mock Data Fixtures for Testing
 *
 * Shared test data for tracks, cars, and drivers
 * Used across unit and integration tests
 */

import type { Track, Car, Driver, CarState, DraftStatus } from '../../src/types';

// ============================================================================
// TRACKS
// ============================================================================

/**
 * Bristol Motor Speedway (Short Track)
 * 0.533 miles, high banking, 4-section simplified layout
 */
export const bristolTrack: Track = {
  id: 'bristol',
  name: 'Bristol Motor Speedway',
  nickname: 'The Last Great Colosseum',
  length: 0.533,
  type: 'short',
  banking: {
    turns: 26,
    straights: 0,
  },
  surface: 'concrete',
  surfaceGrip: 0.95,
  sections: [
    { type: 'turn', length: 440, banking: 26, radius: 250, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 700, idealLine: 140, surfaceGrip: 0.95 },
    { type: 'turn', length: 440, banking: 26, radius: 250, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 700, idealLine: 140, surfaceGrip: 0.95 },
  ],
  difficulty: 8,
  raceLaps: 500,
};

/**
 * Charlotte Motor Speedway (Intermediate)
 * 1.5 miles, moderate banking
 */
export const charlotteTrack: Track = {
  id: 'charlotte',
  name: 'Charlotte Motor Speedway',
  length: 1.5,
  type: 'intermediate',
  banking: {
    turns: 24,
    straights: 5,
  },
  surface: 'asphalt',
  surfaceGrip: 0.90,
  sections: [
    { type: 'turn', length: 1320, banking: 24, radius: 750, idealLine: 160, surfaceGrip: 0.90 },
    { type: 'straight', length: 1980, idealLine: 195, surfaceGrip: 0.90 },
    { type: 'turn', length: 1320, banking: 24, radius: 750, idealLine: 160, surfaceGrip: 0.90 },
    { type: 'straight', length: 1980, idealLine: 195, surfaceGrip: 0.90 },
  ],
  difficulty: 6,
  raceLaps: 400,
};

/**
 * Daytona International Speedway (Superspeedway)
 * 2.5 miles, high banking, pack racing
 */
export const daytonaTrack: Track = {
  id: 'daytona',
  name: 'Daytona International Speedway',
  length: 2.5,
  type: 'superspeedway',
  banking: {
    turns: 31,
    straights: 3,
  },
  surface: 'asphalt',
  surfaceGrip: 0.88,
  sections: [
    { type: 'turn', length: 1800, banking: 31, radius: 1000, idealLine: 180, surfaceGrip: 0.88 },
    { type: 'straight', length: 3800, idealLine: 200, surfaceGrip: 0.88 },
    { type: 'turn', length: 1800, banking: 31, radius: 1000, idealLine: 180, surfaceGrip: 0.88 },
    { type: 'straight', length: 3000, idealLine: 200, surfaceGrip: 0.88 },
  ],
  difficulty: 5,
  raceLaps: 200,
};

// ============================================================================
// CARS
// ============================================================================

/**
 * Standard NASCAR Cup Series Spec Car
 */
export const nascarCupCar: Car = {
  horsepower: 750,
  weight: 3400,
  dragCoefficient: 0.32,
  downforce: 1500,
  tireCompound: 'Goodyear Eagle',
  fuelCapacity: 18,
};

// ============================================================================
// DRIVERS
// ============================================================================

/**
 * Create a driver with default values + overrides
 */
export function createMockDriver(
  id: string,
  name: string,
  number: string,
  skillOverrides: Partial<{
    racecraft: number;
    consistency: number;
    aggression: number;
    focus: number;
    stamina: number;
    composure: number;
    draftSense: number;
    tireManagement: number;
    fuelManagement: number;
    pitStrategy: number;
  }> = {}
): Driver {
  return {
    id,
    name,
    number,
    isPlayer: false,
    skills: {
      racecraft: skillOverrides.racecraft ?? 50,
      consistency: skillOverrides.consistency ?? 50,
      aggression: skillOverrides.aggression ?? 50,
      focus: skillOverrides.focus ?? 50,
      stamina: skillOverrides.stamina ?? 50,
      composure: skillOverrides.composure ?? 50,
      draftSense: skillOverrides.draftSense ?? 50,
      tireManagement: skillOverrides.tireManagement ?? 50,
      fuelManagement: skillOverrides.fuelManagement ?? 50,
      pitStrategy: skillOverrides.pitStrategy ?? 50,
    },
    mentalState: {
      confidence: 50,
      frustration: 50,
      focus: 50,
      distraction: 50,
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
  };
}

/**
 * Skilled veteran driver (80s across the board)
 */
export const veteranDriver: Driver = createMockDriver('veteran', 'Dale Veteran', '43', {
  racecraft: 80,
  consistency: 80,
  aggression: 70,
  focus: 85,
  stamina: 80,
  composure: 85,
  draftSense: 80,
  tireManagement: 75,
  fuelManagement: 80,
  pitStrategy: 85,
});

/**
 * Rookie driver (40s across the board)
 */
export const rookieDriver: Driver = createMockDriver('rookie', 'New Rookie', '00', {
  racecraft: 40,
  consistency: 40,
  aggression: 60,
  focus: 45,
  stamina: 50,
  composure: 40,
  draftSense: 35,
  tireManagement: 40,
  fuelManagement: 40,
  pitStrategy: 35,
});

/**
 * Mid-tier driver (60s - realistic average)
 */
export const midTierDriver: Driver = createMockDriver('midpack', 'Mid Pack', '21', {
  racecraft: 60,
  consistency: 60,
  aggression: 55,
  focus: 60,
  stamina: 65,
  composure: 60,
  draftSense: 55,
  tireManagement: 60,
  fuelManagement: 60,
  pitStrategy: 58,
});

/**
 * Create player driver with custom settings
 */
export function createPlayerDriver(
  name: string = 'Player One',
  number: string = '1',
  skillLevel: 'rookie' | 'midpack' | 'veteran' = 'midpack'
): Driver {
  const baseSkills = skillLevel === 'rookie' ? 40 : skillLevel === 'veteran' ? 80 : 60;

  const driver = createMockDriver('player', name, number, {
    racecraft: baseSkills,
    consistency: baseSkills,
    aggression: baseSkills,
    focus: baseSkills,
    stamina: baseSkills,
    composure: baseSkills,
    draftSense: baseSkills,
    tireManagement: baseSkills,
    fuelManagement: baseSkills,
    pitStrategy: baseSkills,
  });

  driver.isPlayer = true;
  return driver;
}

// ============================================================================
// CAR STATES
// ============================================================================

/**
 * Fresh car state (new tires, full fuel)
 */
export const freshCarState: CarState = {
  tireWear: 100,
  fuelLevel: 100,
  damage: 0,
  inPit: false,
  lapsSincePit: 0,
};

/**
 * Worn car state (50% tires, 50% fuel)
 */
export const wornCarState: CarState = {
  tireWear: 50,
  fuelLevel: 50,
  damage: 0,
  inPit: false,
  lapsSincePit: 50,
};

/**
 * Critical car state (low on everything)
 */
export const criticalCarState: CarState = {
  tireWear: 20,
  fuelLevel: 15,
  damage: 10,
  inPit: false,
  lapsSincePit: 80,
};

// ============================================================================
// DRAFT STATUS
// ============================================================================

/**
 * No draft (running alone)
 */
export const noDraft: DraftStatus = {
  inDraft: false,
  distance: 10,
  speedBoost: 0,
  fuelSavings: 0,
};

/**
 * Full draft (tight pack racing)
 */
export const fullDraft: DraftStatus = {
  inDraft: true,
  distance: 1.5,
  speedBoost: 4.0,
  fuelSavings: 0.10,
};

/**
 * Partial draft (a few car lengths back)
 */
export const partialDraft: DraftStatus = {
  inDraft: true,
  distance: 3.0,
  speedBoost: 2.0,
  fuelSavings: 0.05,
};

// ============================================================================
// AI DRIVER FIELD
// ============================================================================

/**
 * Create a field of AI drivers with varied skill levels
 */
export function createAIField(count: number = 39): Driver[] {
  const drivers: Driver[] = [];

  // Distribution: 20% elite, 30% good, 35% average, 15% struggling
  const eliteCount = Math.floor(count * 0.2);
  const goodCount = Math.floor(count * 0.3);
  const averageCount = Math.floor(count * 0.35);
  const strugglingCount = count - eliteCount - goodCount - averageCount;

  let driverNum = 2;

  // Elite drivers (75-85 skill)
  for (let i = 0; i < eliteCount; i++) {
    const skill = 75 + Math.random() * 10;
    drivers.push(
      createMockDriver(`ai-elite-${i}`, `Elite Driver ${driverNum}`, `${driverNum}`, {
        racecraft: skill,
        consistency: skill,
        aggression: skill - 5,
        focus: skill,
        draftSense: skill,
      })
    );
    driverNum++;
  }

  // Good drivers (60-75 skill)
  for (let i = 0; i < goodCount; i++) {
    const skill = 60 + Math.random() * 15;
    drivers.push(
      createMockDriver(`ai-good-${i}`, `Good Driver ${driverNum}`, `${driverNum}`, {
        racecraft: skill,
        consistency: skill,
        aggression: skill,
        focus: skill,
        draftSense: skill - 5,
      })
    );
    driverNum++;
  }

  // Average drivers (45-60 skill)
  for (let i = 0; i < averageCount; i++) {
    const skill = 45 + Math.random() * 15;
    drivers.push(
      createMockDriver(`ai-average-${i}`, `Average Driver ${driverNum}`, `${driverNum}`, {
        racecraft: skill,
        consistency: skill,
        aggression: skill + 5,
        focus: skill,
        draftSense: skill,
      })
    );
    driverNum++;
  }

  // Struggling drivers (35-50 skill)
  for (let i = 0; i < strugglingCount; i++) {
    const skill = 35 + Math.random() * 15;
    drivers.push(
      createMockDriver(`ai-struggling-${i}`, `Backmarker ${driverNum}`, `${driverNum}`, {
        racecraft: skill,
        consistency: skill - 5,
        aggression: skill + 10,
        focus: skill,
        draftSense: skill - 5,
      })
    );
    driverNum++;
  }

  return drivers;
}
