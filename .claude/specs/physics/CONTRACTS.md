# Physics Contracts

**Sync Status:** ✅ Synced (Phase 2 Complete)
**Last Checked:** 2025-11-16
**Source of Truth:** `src/types.ts`

---

## Overview

TypeScript interfaces and types specific to the Physics specification. All physics calculations use these contracts to ensure type safety and clear interfaces.

**Purpose:** Document the contracts (interfaces) that define physics-related data structures and ensure they remain synchronized with the implementation.

**Sync Process:** Run `npm run sync-contracts` to verify CONTRACTS.md matches `src/types.ts`

---

## Track System Contracts

### TrackType

**Purpose:** Categorize NASCAR track types

**Definition:**
```typescript
export type TrackType = 'short' | 'intermediate' | 'superspeedway' | 'road';
```

**Values:**
- `'short'` - Short tracks (≤1 mile): Bristol, Martinsville
- `'intermediate'` - Intermediate ovals (1-2 miles): Charlotte, Atlanta
- `'superspeedway'` - High-speed ovals (≥2.5 miles): Daytona, Talladega
- `'road'` - Road courses: Watkins Glen, COTA (future)

**Usage:** Determines tire life, fuel consumption rates, and calibration factors

---

### SurfaceType

**Purpose:** Track surface material affecting grip

**Definition:**
```typescript
export type SurfaceType = 'concrete' | 'asphalt';
```

**Values:**
- `'concrete'` - Concrete surface (e.g., Dover, Bristol)
- `'asphalt'` - Asphalt surface (majority of NASCAR tracks)

**Impact:** Affects base grip level and tire degradation rate

---

### TrackSection

**Purpose:** Individual track section for lap time calculation

**Definition:**
```typescript
export interface TrackSection {
  type: 'straight' | 'turn';
  length: number;           // Length in feet
  banking?: number;         // Banking angle in degrees (for turns)
  radius?: number;          // Turn radius in feet (for turns)
  idealLine: number;        // Ideal speed through section (MPH)
  surfaceGrip: number;      // Grip multiplier 0.8-1.0
}
```

**Properties:**

| Property | Type | Required | Range | Description |
|----------|------|----------|-------|-------------|
| `type` | `'straight' \| 'turn'` | ✅ | - | Section type determines calculation method |
| `length` | `number` | ✅ | >0 feet | Physical length of track section |
| `banking` | `number` | ⚠️ Turn only | 0-40° | Banking angle (Talladega: 33°, flat: 0°) |
| `radius` | `number` | ⚠️ Turn only | >0 feet | Turn radius for corner speed formula |
| `idealLine` | `number` | ✅ | >0 MPH | Reference speed through section |
| `surfaceGrip` | `number` | ✅ | 0.8-1.0 | Grip multiplier (1.0 = fresh asphalt) |

**Validation:**
- Turns MUST have `banking` and `radius`
- Straights typically have `banking = 0`, `radius` optional
- Sum of all section lengths should equal `track.length * 5280` (miles to feet)

**Usage Example:**
```typescript
const bristolTurn1: TrackSection = {
  type: 'turn',
  length: 700,        // feet
  banking: 26,        // degrees
  radius: 450,        // feet
  idealLine: 120,     // MPH
  surfaceGrip: 0.95
};
```

---

### Track

**Purpose:** Complete track definition for physics simulation

**Definition:**
```typescript
export interface Track {
  id: string;               // Unique identifier
  name: string;             // Full track name
  nickname?: string;        // Track nickname
  length: number;           // Track length in miles
  type: TrackType;          // Track category
  banking: {
    turns: number;          // Average turn banking in degrees
    straights: number;      // Straight banking in degrees
  };
  surface: SurfaceType;     // Track surface material
  surfaceGrip: number;      // Base grip level 0.8-1.0
  sections: TrackSection[]; // Track divided into sections
  difficulty: number;       // Difficulty rating 1-10
  raceLaps: number;         // Standard race distance in laps
}
```

**Properties:**

| Property | Type | Required | Range | Description |
|----------|------|----------|-------|-------------|
| `id` | `string` | ✅ | - | Unique track ID (e.g., `'bristol'`) |
| `name` | `string` | ✅ | - | Official name (e.g., `'Bristol Motor Speedway'`) |
| `nickname` | `string` | ❌ | - | Short name (e.g., `'The Last Great Colosseum'`) |
| `length` | `number` | ✅ | 0.5-3.0 miles | Track length |
| `type` | `TrackType` | ✅ | - | Track category |
| `banking.turns` | `number` | ✅ | 0-40° | Average turn banking |
| `banking.straights` | `number` | ✅ | 0-20° | Straight banking |
| `surface` | `SurfaceType` | ✅ | - | Surface material |
| `surfaceGrip` | `number` | ✅ | 0.8-1.0 | Base grip multiplier |
| `sections` | `TrackSection[]` | ✅ | ≥4 sections | Track sections for lap calc |
| `difficulty` | `number` | ✅ | 1-10 | Difficulty rating |
| `raceLaps` | `number` | ✅ | >0 | Standard race length |

**Validation:**
- `sections` must include at least 4 sections (2 turns, 2 straights typical)
- Total section lengths should sum to `length * 5280` feet
- `surfaceGrip` affects tire wear and corner speeds

**Usage Example:**
```typescript
const bristol: Track = {
  id: 'bristol',
  name: 'Bristol Motor Speedway',
  nickname: 'The Last Great Colosseum',
  length: 0.533,
  type: 'short',
  banking: { turns: 26, straights: 4 },
  surface: 'concrete',
  surfaceGrip: 0.95,
  sections: [ /* 8 sections */ ],
  difficulty: 8,
  raceLaps: 500
};
```

---

## Car System Contracts

### Car

**Purpose:** NASCAR car specifications (relatively static)

**Definition:**
```typescript
export interface Car {
  horsepower: number;       // Engine horsepower (~750)
  weight: number;           // Car weight in pounds (~3400)
  dragCoefficient: number;  // Aerodynamic drag (~0.32)
  downforce: number;        // Downforce value
  tireCompound: string;     // Tire type/compound
  fuelCapacity: number;     // Fuel tank capacity in gallons (~18)
}
```

**Properties:**

| Property | Type | Required | NASCAR Spec | Description |
|----------|------|----------|-------------|-------------|
| `horsepower` | `number` | ✅ | 670 (std), 510 (SS) | Engine horsepower |
| `weight` | `number` | ✅ | 3450 lbs | Minimum weight with driver |
| `dragCoefficient` | `number` | ✅ | 0.32 | Aerodynamic drag coefficient |
| `downforce` | `number` | ✅ | 2000-500 lbs | Downforce at 200 MPH |
| `tireCompound` | `string` | ✅ | - | Tire compound identifier |
| `fuelCapacity` | `number` | ✅ | 18 gallons | Fuel tank capacity |

**NASCAR Standards:**
- Standard package: 670 HP, 2000 lbs downforce
- Superspeedway package: 510 HP, 500 lbs downforce
- All cars use same weight minimum (3450 lbs with driver)

**Usage:** Generally constant across all cars; used in physics calculations

---

### CarState

**Purpose:** Dynamic car condition during race

**Definition:**
```typescript
export interface CarState {
  tireWear: number;         // Tire condition 0-100%
  fuelLevel: number;        // Fuel remaining 0-100%
  damage: number;           // Damage level 0-100%
  inPit: boolean;           // Currently in pit lane
  lapsSincePit: number;     // Laps since last pit stop
  fuelConsumptionPerLap?: number; // Last lap fuel consumption in gallons (optional tracking)
}
```

**Properties:**

| Property | Type | Required | Range | Description |
|----------|------|----------|-------|-------------|
| `tireWear` | `number` | ✅ | 0-100% | Tire grip remaining (100 = fresh, 0 = destroyed) |
| `fuelLevel` | `number` | ✅ | 0-100% | Fuel as % of capacity (18 gal max) |
| `damage` | `number` | ✅ | 0-100% | Damage level (0 = pristine, 100 = DNF) |
| `inPit` | `boolean` | ✅ | - | Currently pitting |
| `lapsSincePit` | `number` | ✅ | ≥0 | Laps since pit stop |
| `fuelConsumptionPerLap` | `number` | ❌ | >0 gallons | Optional tracking |

**State Evolution:**
- `tireWear` decreases over laps (degradation rate per track type)
- `fuelLevel` decreases per lap (consumption rate per track type)
- `damage` increases from incidents (contact, spins)
- Reset after pit stop: `tireWear = 100`, `fuelLevel = 100`, `lapsSincePit = 0`

**Usage in Physics:**
- Tire wear affects corner speed (linear degradation)
- Fuel level affects lap time (weight penalty: 0.03s/gallon)
- Damage affects performance (future enhancement)

---

## Physics Calculation Contracts

### PhysicsParams

**Purpose:** Aggregate parameters for physics calculations

**Definition:**
```typescript
export interface PhysicsParams {
  horsepower: number;
  weight: number;
  dragCoefficient: number;
  downforce: number;
  banking: number;
  radius: number;
  tireGrip: number;         // 0.0-1.0
  fuelWeight: number;       // Additional weight from fuel
  driverSkill: number;      // Driver skill modifier
  mentalStateModifier: number; // Mental state effect
}
```

**Properties:**

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `horsepower` | `number` | 500-750 HP | Engine power |
| `weight` | `number` | 3450-3600 lbs | Car + fuel weight |
| `dragCoefficient` | `number` | 0.28-0.36 | Aero drag |
| `downforce` | `number` | 500-2000 lbs | Downforce at speed |
| `banking` | `number` | 0-40° | Track banking angle |
| `radius` | `number` | >0 feet | Turn radius |
| `tireGrip` | `number` | 0.5-1.0 | Tire grip (1.0 = fresh, 0.5 = worn) |
| `fuelWeight` | `number` | 0-112 lbs | Fuel weight (18 gal × 6.2 lbs/gal) |
| `driverSkill` | `number` | 0.9-1.1 | Skill multiplier (1.0 = average) |
| `mentalStateModifier` | `number` | 0.85-1.15 | Mental state effect |

**Usage:** Passed to physics calculation functions to compute section speeds and lap times

---

### DraftStatus

**Purpose:** Aerodynamic drafting state

**Definition:**
```typescript
export interface DraftStatus {
  inDraft: boolean;         // Currently drafting
  distance: number;         // Distance to car ahead (car lengths)
  speedBoost: number;       // Speed increase from draft (MPH)
  fuelSavings: number;      // Fuel consumption reduction (%)
}
```

**Properties:**

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `inDraft` | `boolean` | - | True if within draft zone (≤2.5 car lengths) |
| `distance` | `number` | 0-10+ lengths | Distance to car ahead |
| `speedBoost` | `number` | 0-5 MPH | Speed increase from draft |
| `fuelSavings` | `number` | 0-10% | Fuel consumption reduction |

**Calculation:**
- Optimal draft: 1.5 car lengths → 4 MPH boost
- Draft zone: 0-2.5 car lengths
- Beyond 2.5 lengths: no draft effect
- Fuel savings: 10% when drafting

**Usage:** Applied to straight sections at superspeedways

---

### LapTimeBreakdown

**Purpose:** Detailed lap time analysis

**Definition:**
```typescript
export interface LapTimeBreakdown {
  totalTime: number;        // Total lap time
  sectionTimes: number[];   // Time for each section
  sectionSpeeds: number[];  // Speed through each section
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `totalTime` | `number` | Total lap time in seconds |
| `sectionTimes` | `number[]` | Time array for each track section |
| `sectionSpeeds` | `number[]` | Speed array for each track section (MPH) |

**Usage:** Debug physics calculations, identify slow sections, optimize lap times

---

## Validation Rules

### Track Validation

**Required Checks:**
```typescript
function validateTrack(track: Track): boolean {
  // Track length realistic
  if (track.length < 0.5 || track.length > 3.0) return false;

  // Banking angles realistic
  if (track.banking.turns < 0 || track.banking.turns > 40) return false;

  // Surface grip valid
  if (track.surfaceGrip < 0.8 || track.surfaceGrip > 1.0) return false;

  // Sections sum to track length
  const totalLength = track.sections.reduce((sum, s) => sum + s.length, 0);
  const expectedLength = track.length * 5280; // miles to feet
  if (Math.abs(totalLength - expectedLength) > 100) return false;

  return true;
}
```

### CarState Validation

**Required Checks:**
```typescript
function validateCarState(state: CarState): boolean {
  // Percentages in range
  if (state.tireWear < 0 || state.tireWear > 100) return false;
  if (state.fuelLevel < 0 || state.fuelLevel > 100) return false;
  if (state.damage < 0 || state.damage > 100) return false;

  // Laps non-negative
  if (state.lapsSincePit < 0) return false;

  return true;
}
```

---

## Contract Change Process

### Proposing Changes

1. **Document rationale** - Why is the change needed?
2. **Impact analysis** - What breaks if we change this?
3. **Migration plan** - How do we update existing code?
4. **Test updates** - What tests need modification?

### Change History

| Date | Interface | Change | Impact | Status |
|------|-----------|--------|--------|--------|
| 2025-11-16 | All | Phase 2 - Initial documentation | None (docs only) | ✅ Complete |

---

## Usage Examples

### Creating a Track

```typescript
import { Track, TrackSection, TrackType } from './types';

const bristol: Track = {
  id: 'bristol',
  name: 'Bristol Motor Speedway',
  length: 0.533,
  type: 'short',
  banking: { turns: 26, straights: 4 },
  surface: 'concrete',
  surfaceGrip: 0.95,
  sections: [
    { type: 'turn', length: 700, banking: 26, radius: 450, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 600, idealLine: 140, surfaceGrip: 0.95 },
    // ... more sections
  ],
  difficulty: 8,
  raceLaps: 500
};
```

### Updating CarState

```typescript
import { CarState } from './types';

let carState: CarState = {
  tireWear: 100,
  fuelLevel: 100,
  damage: 0,
  inPit: false,
  lapsSincePit: 0
};

// After 10 laps (short track)
carState = {
  ...carState,
  tireWear: 90,  // 1% per lap typical
  fuelLevel: 88, // ~1.2% per lap (18 gal / 150 laps)
  lapsSincePit: 10
};
```

### Using PhysicsParams

```typescript
import { PhysicsParams } from './types';
import { calculateCornerSpeed } from './engine/physics/speed';

const params: PhysicsParams = {
  horsepower: 670,
  weight: 3450 + (10 * 6.2), // car + 10 gallons fuel
  dragCoefficient: 0.32,
  downforce: 2000,
  banking: 26,
  radius: 450,
  tireGrip: 0.95,
  fuelWeight: 10 * 6.2,
  driverSkill: 1.05,  // 5% above average
  mentalStateModifier: 1.0
};

const cornerSpeed = calculateCornerSpeed(params);
```

---

## Cross-References

**Implementation:**
- `src/types.ts` - Source of truth for all interfaces
- `src/engine/physics/` - Physics calculations using these contracts

**Documentation:**
- `SPEC.md` - Physics algorithms and formulas
- `REFERENCE.md` - NASCAR constants and specifications
- `EXAMPLES.md` - Test scenarios using these interfaces

**Validation:**
- `scripts/sync-contracts.sh` - Verify sync with src/types.ts
- `tests/unit/physics/*.test.ts` - Unit tests validating contracts

---

**Phase 2 Status:** ✅ Complete - All physics interfaces documented
**Next Sync:** Run `npm run sync-contracts` after any `src/types.ts` changes
