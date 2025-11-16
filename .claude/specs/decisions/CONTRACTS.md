# Decisions Contracts

**Sync Status:** ✅ Synced (Phase 4 Complete)
**Last Checked:** 2025-11-16
**Source of Truth:** `src/types.ts`

---

## Overview

TypeScript interfaces for the Decision/Event system. All decision prompts, outcomes, and effects use these contracts.

**Purpose:** Document decision-related interfaces to ensure type safety between decision system and other modules.

---

## Core Decision Contracts

### DecisionType

**Purpose:** Categorize decision types for routing and skill mapping

**Definition:**
```typescript
export type DecisionType =
  | 'pit-strategy'
  | 'passing'
  | 'traffic-management'
  | 'incident-response'
  | 'tire-management'
  | 'mental-state';
```

**Values:**
- `'pit-strategy'` - Pit timing and configuration decisions
- `'passing'` - Overtaking opportunity decisions
- `'traffic-management'` - Handling lapped cars
- `'incident-response'` - Emergency avoidance (2-4s time limit)
- `'tire-management'` - Pace vs tire preservation
- `'mental-state'` - Composure and focus management

---

### RiskLevel

**Purpose:** Classify decision option risk for outcome calculation

**Definition:**
```typescript
export type RiskLevel = 'low' | 'medium' | 'high';
```

**Impact on Success Probability:**
- `'low'`: No risk penalty (0%)
- `'medium'`: -5% success probability
- `'high'`: -15% success probability

---

### DecisionOutcome

**Purpose:** Result classification for effect application

**Definition:**
```typescript
export type DecisionOutcome = 'success' | 'neutral' | 'failure';
```

**Outcome Determination:**
- Roll random number [0, 1]
- Compare to calculated success probability
- `success` if roll ≤ probability
- `failure` if roll > probability
- `neutral` for safe/default choices

---

## Decision Option Contract

### DecisionOption

**Purpose:** Single choice within a decision

**Definition:**
```typescript
export interface DecisionOption {
  id: string;               // Unique option identifier
  label: string;            // Short label (for UI)
  description: string;      // Detailed description
  riskLevel: RiskLevel;     // Risk assessment
  skillRequirements?: Partial<DriverSkills>; // Skills that affect outcome
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique ID (e.g., `'aggressive-pass'`) |
| `label` | `string` | ✅ | Short text (e.g., `'Aggressive pass'`) |
| `description` | `string` | ✅ | Full explanation |
| `riskLevel` | `RiskLevel` | ✅ | Risk classification |
| `skillRequirements` | `Partial<DriverSkills>` | ❌ | Relevant skills (optional) |

**Example:**
```typescript
const aggressivePass: DecisionOption = {
  id: 'aggressive-pass',
  label: 'Aggressive pass',
  description: 'Dive inside, force the issue',
  riskLevel: 'high',
  skillRequirements: {
    racecraft: 60,  // Minimum recommended skill
    aggression: 50
  }
};
```

---

## Race Context Contract

### RaceContext

**Purpose:** Current race situation for context-aware decision generation

**Definition:**
```typescript
export interface RaceContext {
  lap: number;              // Current lap
  position: number;         // Current position
  lapsToGo: number;         // Laps remaining
  gapToLeader: number;      // Gap to leader (seconds)
  gapToNext: number;        // Gap to car ahead (seconds)
  tireWear: number;         // Current tire condition (0-100%)
  fuelLevel: number;        // Current fuel level (0-100%)
  mentalState: MentalState; // Current mental state
}
```

**Properties:**

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `lap` | `number` | ≥1 | Current lap number |
| `position` | `number` | 1-40 | Current race position |
| `lapsToGo` | `number` | ≥0 | Laps remaining in race |
| `gapToLeader` | `number` | ≥0 seconds | Time behind leader |
| `gapToNext` | `number` | ≥0 seconds | Time behind car ahead |
| `tireWear` | `number` | 0-100% | Tire grip remaining |
| `fuelLevel` | `number` | 0-100% | Fuel as % of capacity |
| `mentalState` | `MentalState` | - | Current mental state |

**Usage:** Passed to decision generator to determine which decisions to trigger

---

## Decision Contract

### Decision

**Purpose:** Complete decision prompt for player

**Definition:**
```typescript
export interface Decision {
  id: string;               // Unique decision ID
  type: DecisionType;       // Decision category
  prompt: string;           // Question/situation description
  options: DecisionOption[]; // Available choices
  timeLimit: number;        // Seconds to decide
  defaultOption: string;    // Default choice ID (if timeout)
  context: RaceContext;     // Current race situation
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique ID (e.g., `'pit-lap-50'`) |
| `type` | `DecisionType` | ✅ | Decision category |
| `prompt` | `string` | ✅ | Situation description |
| `options` | `DecisionOption[]` | ✅ | 2-4 choices |
| `timeLimit` | `number` | ✅ | Seconds to decide (2-15s) |
| `defaultOption` | `string` | ✅ | Safe choice ID |
| `context` | `RaceContext` | ✅ | Race situation |

**Validation:**
- Must have 2-4 options
- `defaultOption` must match one of `options[].id`
- `timeLimit` must be positive
- `prompt` should be clear and actionable

**Example:**
```typescript
const passingDecision: Decision = {
  id: 'pass-lap-45',
  type: 'passing',
  prompt: 'Car ahead is slow in turn 2. Attempt pass?',
  options: [aggressivePass, patientApproach, draftBehind],
  timeLimit: 6,
  defaultOption: 'patient-approach',
  context: {
    lap: 45,
    position: 8,
    lapsToGo: 55,
    gapToLeader: -8.2,
    gapToNext: 0.3,
    tireWear: 75,
    fuelLevel: 60,
    mentalState: { confidence: 65, frustration: 30, focus: 70, distraction: 20 }
  }
};
```

---

## Effect Contracts

### DecisionEffects

**Purpose:** Changes to race state from decision outcome

**Definition:**
```typescript
export interface DecisionEffects {
  positionChange?: number;  // Positions gained/lost
  mentalStateChange?: Partial<MentalState>; // Mental state adjustments
  tireWearChange?: number;  // Tire condition change
  fuelChange?: number;      // Fuel level change
  damageChange?: number;    // Damage sustained
}
```

**Properties:**

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `positionChange` | `number` | -5 to +5 | Positions gained (positive) or lost (negative) |
| `mentalStateChange` | `Partial<MentalState>` | - | Changes to confidence, frustration, etc. |
| `tireWearChange` | `number` | -10 to +10% | Tire wear increase (positive) or preservation (negative) |
| `fuelChange` | `number` | -10 to +5% | Fuel consumption change |
| `damageChange` | `number` | 0 to +15% | Damage from failed maneuvers |

**All properties optional** - Only include effects that apply

**Example:**
```typescript
const successfulPass: DecisionEffects = {
  positionChange: +2,        // Gained 2 positions
  mentalStateChange: {
    confidence: +10,         // Confidence boost
    frustration: -5          // Reduced frustration
  }
};

const failedAggressivePass: DecisionEffects = {
  positionChange: -1,        // Lost 1 position
  mentalStateChange: {
    confidence: -8,          // Confidence hit
    frustration: +15         // Increased frustration
  },
  damageChange: +5           // Minor damage from contact
};
```

---

## Result Contract

### DecisionResult

**Purpose:** Complete outcome of evaluating a decision

**Definition:**
```typescript
export interface DecisionResult {
  optionChosen: string;     // Option ID selected
  outcome: DecisionOutcome; // Success/neutral/failure
  effects: DecisionEffects; // What changed
  xpGained: XPGain;         // XP earned from decision
  message?: string;         // Outcome description (optional)
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `optionChosen` | `string` | ✅ | Option ID player selected |
| `outcome` | `DecisionOutcome` | ✅ | Result classification |
| `effects` | `DecisionEffects` | ✅ | Changes to race state |
| `xpGained` | `XPGain` | ✅ | Skill XP rewards |
| `message` | `string` | ❌ | Optional outcome text |

**Example:**
```typescript
const passResult: DecisionResult = {
  optionChosen: 'aggressive-pass',
  outcome: 'success',
  effects: {
    positionChange: +2,
    mentalStateChange: {
      confidence: +10,
      frustration: -5
    }
  },
  xpGained: {
    racecraft: +15,
    aggression: +5
  },
  message: 'Great move! You gained 2 positions'
};
```

---

## Manager Contract

### DecisionManager

**Purpose:** Decision system orchestration interface

**Definition:**
```typescript
export interface DecisionManager {
  shouldTriggerDecision(state: RaceState): Decision | null;
  evaluateDecision(decision: Decision, optionId: string, driver: Driver): DecisionResult;
}
```

**Methods:**

**`shouldTriggerDecision(state: RaceState): Decision | null`**
- Check race state for decision triggers
- Return decision if conditions met
- Return null if no decision needed
- Enforces cooldown (10 laps minimum)

**`evaluateDecision(decision, optionId, driver): DecisionResult`**
- Calculate outcome based on skills and risk
- Generate effects based on outcome
- Award XP for good decisions
- Return complete result

---

## Cross-References

**Implementation:**
- `src/types.ts` - Source of truth for all interfaces
- `src/events/` - Decision system implementation

**Documentation:**
- `SPEC.md` - Decision types and outcome formulas
- `EXAMPLES.md` - Decision scenarios and test cases
- `REFERENCE.md` - Quick reference tables

**Validation:**
- `scripts/sync-contracts.sh` - Verify sync with src/types.ts
- `tests/unit/events/*.test.ts` - Unit tests

---

**Phase 4 Status:** ✅ Complete - All decision interfaces documented
**Next Sync:** Run `npm run sync-contracts` after any `src/types.ts` changes
