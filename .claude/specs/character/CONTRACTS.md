# Character Contracts

**Sync Status:** ✅ Synced (Phase 3 Complete)
**Last Checked:** 2025-11-16
**Source of Truth:** `src/types.ts`

---

## Overview

TypeScript interfaces and types for the Character/RPG system. All character progression, skills, mental state, and XP systems use these contracts.

**Purpose:** Document character-related interfaces to ensure type safety and clear contracts between systems.

**Sync Process:** Run `npm run sync-contracts` to verify CONTRACTS.md matches `src/types.ts`

---

## Driver Skills Contract

### DriverSkills

**Purpose:** Define all 10 driver skill categories (0-100 scale)

**Definition:**
```typescript
export interface DriverSkills {
  // Core skills
  racecraft: number;        // Overall racing ability
  consistency: number;      // Ability to maintain pace
  aggression: number;       // Willingness to take risks
  focus: number;            // Mental sharpness
  stamina: number;          // Physical endurance
  composure: number;        // Emotional control under pressure

  // Specialized skills
  draftSense: number;       // Reading aerodynamic situations
  tireManagement: number;   // Preserving tire life
  fuelManagement: number;   // Efficient fuel usage
  pitStrategy: number;      // Understanding pit timing
}
```

**Properties:**

| Skill | Range | Affects | Progression Source |
|-------|-------|---------|-------------------|
| `racecraft` | 0-100 | ±2% lap time | Race experience |
| `consistency` | 0-100 | Lap variance (±0.5s to ±0.1s) | Clean laps |
| `aggression` | 0-100 | Overtaking +20% per 10 pts | Risky decisions |
| `focus` | 0-100 | Mistake probability (10% to 0%) | Experience |
| `stamina` | 0-100 | Focus drain rate | Race experience |
| `composure` | 0-100 | Mental state recovery rate | Experience |
| `draftSense` | 0-100 | +1-5% draft boost | Drafting maneuvers |
| `tireManagement` | 0-100 | -10 to -30% tire wear | Conservative driving |
| `fuelManagement` | 0-100 | -5 to -15% fuel consumption | Fuel-saving decisions |
| `pitStrategy` | 0-100 | Better pit decisions | Strategic pit calls |

**Validation:**
- All skills must be in range [0, 100]
- Skills cap at 100 (mastery)
- No skill degradation after reaching max

**Usage Example:**
```typescript
const rookieSkills: DriverSkills = {
  racecraft: 40,
  consistency: 45,
  aggression: 35,
  focus: 50,
  stamina: 45,
  composure: 40,
  draftSense: 30,
  tireManagement: 38,
  fuelManagement: 35,
  pitStrategy: 32
};
```

---

## Mental State Contract

### MentalState

**Purpose:** Dynamic attributes changing during each race (0-100 scale)

**Definition:**
```typescript
export interface MentalState {
  confidence: number;       // Self-belief, affects performance positively
  frustration: number;      // Annoyance/anger, affects performance negatively
  focus: number;            // Concentration level, affects mistakes
  distraction: number;      // Mental noise, reduces performance
}
```

**Properties:**

| Attribute | Range | Starting Value | Effects |
|-----------|-------|----------------|---------|
| `confidence` | 0-100 | Based on racecraft/recent performance | ±5-10% lap time |
| `frustration` | 0-100 | 0-20 (low) | -3 to -10% consistency/focus |
| `focus` | 0-100 | Based on focus/stamina skills | 5-40% mistake chance |
| `distraction` | 0-100 | 0-10 (low) | -2 to -5% lap time |

**State Evolution:**

**Confidence:**
- Increases: Successful pass (+5), fast lap (+3), leading (+2/lap)
- Decreases: Being passed (-3), mistake (-10), crash (-20)

**Frustration:**
- Increases: Failed pass (+5), stuck in traffic (+10), bad luck (+15)
- Decreases: Successful maneuver (-5), clean racing (-3), caution (-10)

**Focus:**
- Increases: Caution period (+15), mental reset (+20)
- Decreases: Race duration (-0.5 to -1.0/lap), high frustration (-2/lap)

**Distraction:**
- Increases: External events (+10), high frustration spillover (+5/lap)
- Decreases: Time (-2/lap), clean racing (-5/5 laps), mental reset (-20)

**Validation:**
```typescript
function validateMentalState(state: MentalState): boolean {
  return state.confidence >= 0 && state.confidence <= 100 &&
         state.frustration >= 0 && state.frustration <= 100 &&
         state.focus >= 0 && state.focus <= 100 &&
         state.distraction >= 0 && state.distraction <= 100;
}
```

---

## Career Statistics Contract

### CareerStats

**Purpose:** Track driver career performance metrics

**Definition:**
```typescript
export interface CareerStats {
  races: number;            // Total races run
  wins: number;             // Race victories
  top5: number;             // Top 5 finishes
  top10: number;            // Top 10 finishes
  poles: number;            // Pole positions (future)
  lapsLed: number;          // Total laps led
  avgFinish: number;        // Average finish position
}
```

**Properties:**

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `races` | `number` | ≥0 | Total races completed |
| `wins` | `number` | ≥0 | 1st place finishes |
| `top5` | `number` | ≥0 | 2nd-5th place finishes |
| `top10` | `number` | ≥0 | 6th-10th place finishes |
| `poles` | `number` | ≥0 | Pole positions (future feature) |
| `lapsLed` | `number` | ≥0 | Cumulative laps led |
| `avgFinish` | `number` | 1-40 | Calculated average finish |

**Average Finish Calculation:**
```typescript
function updateAvgFinish(stats: CareerStats, newFinish: number): number {
  if (stats.races === 0) return newFinish;
  return (stats.avgFinish * (stats.races - 1) + newFinish) / stats.races;
}
```

---

## XP Progression Contract

### XPGain

**Purpose:** Structure for awarding XP to specific skills

**Definition:**
```typescript
export interface XPGain {
  racecraft?: number;
  consistency?: number;
  aggression?: number;
  focus?: number;
  stamina?: number;
  composure?: number;
  draftSense?: number;
  tireManagement?: number;
  fuelManagement?: number;
  pitStrategy?: number;
}
```

**Properties:**
- All properties optional
- Only award XP to skills actually used/improved
- XP values: 10-200 per race depending on performance

**Usage Pattern:**
```typescript
// Award XP based on race performance
const xpGain: XPGain = {
  racecraft: 80,        // Base race XP
  consistency: 60,      // Clean laps bonus
  tireManagement: 50,   // Strategic pit timing
  pitStrategy: 40,      // Good pit decision
  composure: 30         // Mental state management
};

applyXPGain(driver, xpGain);
```

---

## Driver Contract

### Driver

**Purpose:** Complete driver definition combining skills, mental state, and stats

**Definition:**
```typescript
export interface Driver {
  id: string;               // Unique identifier
  name: string;             // Driver name
  number: string;           // Car number
  isPlayer: boolean;        // True if this is the player
  skills: DriverSkills;     // Current skill levels
  mentalState: MentalState; // Current mental state
  stats: CareerStats;       // Career statistics
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique ID (e.g., `'player'`, `'ai-1'`) |
| `name` | `string` | ✅ | Driver name (e.g., `'Kyle Rookie'`) |
| `number` | `string` | ✅ | Car number (e.g., `'42'`) |
| `isPlayer` | `boolean` | ✅ | True for human player |
| `skills` | `DriverSkills` | ✅ | All 10 skill values |
| `mentalState` | `MentalState` | ✅ | Current mental state |
| `stats` | `CareerStats` | ✅ | Career performance |

**Validation:**
```typescript
function validateDriver(driver: Driver): boolean {
  // Basic properties
  if (!driver.id || !driver.name || !driver.number) return false;

  // Skills validation
  if (!validateDriverSkills(driver.skills)) return false;

  // Mental state validation
  if (!validateMentalState(driver.mentalState)) return false;

  return true;
}
```

**Usage Example:**
```typescript
const player: Driver = {
  id: 'player',
  name: 'Kyle Rookie',
  number: '42',
  isPlayer: true,
  skills: {
    racecraft: 40,
    consistency: 45,
    aggression: 35,
    focus: 50,
    stamina: 45,
    composure: 40,
    draftSense: 30,
    tireManagement: 38,
    fuelManagement: 35,
    pitStrategy: 32
  },
  mentalState: {
    confidence: 50,
    frustration: 20,
    focus: 70,
    distraction: 10
  },
  stats: {
    races: 0,
    wins: 0,
    top5: 0,
    top10: 0,
    poles: 0,
    lapsLed: 0,
    avgFinish: 0
  }
};
```

---

## Cross-References

**Implementation:**
- `src/types.ts` - Source of truth for all interfaces
- `src/character/` - Character system implementation (future)

**Documentation:**
- `SPEC.md` - Character system algorithms and formulas
- `EXAMPLES.md` - Progression scenarios and test cases
- `REFERENCE.md` - XP tables and skill progression formulas

**Validation:**
- `scripts/sync-contracts.sh` - Verify sync with src/types.ts
- `tests/unit/character/*.test.ts` - Unit tests validating contracts

---

**Phase 3 Status:** ✅ Complete - All character interfaces documented
**Next Sync:** Run `npm run sync-contracts` after any `src/types.ts` changes
