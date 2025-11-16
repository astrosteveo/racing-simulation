# Character System Reference

**Last Updated:** 2025-11-16
**Phase:** Phase 3 - Complete

---

## Overview

Quick reference formulas, tables, and constants for the Character/RPG system.

**Purpose:** Provide lookup tables for XP requirements, skill effects, and mental state calculations.

---

## Skill Effect Formulas

### Core Skills

**Racecraft:**
```typescript
const lapTimeModifier = 1.0 + ((racecraft - 50) / 50) * 0.02;
// Range: 0.98x to 1.02x lap time (±2%)
```

**Consistency:**
```typescript
const lapVariance = 0.5 - (consistency / 100) * 0.4;
// Range: ±0.5s (low) to ±0.1s (high)
```

**Aggression:**
```typescript
const overtakingBonus = (aggression / 10) * 0.20;
// Range: 0% to +200% overtaking chance
const tireWearPenalty = aggression > 80 ? 0.05 : 0;
// Penalty: +5% tire wear at high aggression
```

**Focus:**
```typescript
const mistakeProbability = 0.10 * (1 - focus / 100);
// Range: 10% (low) to 0% (high)
```

**Stamina:**
```typescript
const focusDrainRate = (1.0 - stamina / 100) * 0.5;
// Range: 0.5/lap (low) to 0.0/lap (high)
```

**Composure:**
```typescript
const mentalRecoveryRate = composure / 100;
// Range: 0x to 1x recovery multiplier
```

### Specialized Skills

**Draft Sense:**
```typescript
const draftBonus = baseDraftBoost * (1 + draftSense / 200);
// Base 4 MPH → 4.0-6.0 MPH range
```

**Tire Management:**
```typescript
const tireWearMultiplier = 1.0 - (tireManagement / 100) * 0.30;
// Range: 1.0x (no reduction) to 0.7x (30% reduction)
```

**Fuel Management:**
```typescript
const fuelConsumptionMultiplier = 1.0 - (fuelManagement / 100) * 0.15;
// Range: 1.0x to 0.85x (15% reduction)
```

**Pit Strategy:**
- Unlocks advanced decision options at 60+ skill
- Provides strategic hints at 80+ skill

---

## Mental State Formulas

### Confidence

**Initial Confidence:**
```typescript
const baseConfidence = racecraft / 2; // 0-50
const recentPerformanceBonus = calculateRecentPerformance(); // 0-30
return Math.min(100, baseConfidence + recentPerformanceBonus);
```

**Lap Time Effect:**
```typescript
const confidenceModifier = 1.0 + ((confidence - 50) / 50) * 0.05;
// Range: 0.95x to 1.05x (±5%)
```

**State Changes:**
| Event | Confidence Change |
|-------|-------------------|
| Successful pass | +5 |
| Fast lap (top 3) | +3 |
| Leading race | +2 per lap |
| Being passed | -3 |
| Mistake/spin | -10 |
| Crash | -20 |

### Frustration

**Consistency Penalty:**
```typescript
const frustrationPenalty = frustration > 30
  ? (frustration / 100) * 0.10
  : 0;
// Range: 0% to -10% consistency
```

**State Changes:**
| Event | Frustration Change |
|-------|---------------------|
| Failed pass | +5 |
| Stuck in traffic (3+ laps) | +10 |
| Bad luck event | +15 |
| Successful maneuver | -5 |
| Clean racing (5 laps) | -3 |
| Caution period | -10 |

**Composure Effect:**
```typescript
const frustrationDecayRate = 1 + (composure / 100);
// Range: 1.0x to 2.0x decay speed
```

### Focus

**Initial Focus:**
```typescript
const initialFocus = (focus + stamina) / 2;
```

**Focus Drain:**
```typescript
const focusDrainPerLap = (1.0 - stamina / 100) * 0.5;
// Applied each lap during race
```

**Mistake Probability:**
```typescript
let baseMistakeChance = 0.05;
if (focus < 40) baseMistakeChance = 0.20;
else if (focus < 80) baseMistakeChance = 0.10;
```

### Distraction

**Lap Time Penalty:**
```typescript
const distractionPenalty = distraction > 30
  ? (distraction / 100) * 0.05
  : 0;
// Range: 0% to -5% lap time
```

---

## XP Progression Tables

### XP Requirements by Level

| Level Range | XP per Level | Cumulative XP | Est. Races |
|-------------|--------------|---------------|------------|
| 0-10 | 100 | 1,000 | 1-2 |
| 10-20 | 100 | 2,000 | 2-3 |
| 20-30 | 100 | 3,000 | 3-5 |
| 30-40 | 100 | 4,000 | 5-8 |
| 40-50 | 200-300 | 6,500 | 8-12 |
| 50-60 | 300-400 | 10,000 | 12-17 |
| 60-70 | 400-500 | 14,500 | 17-24 |
| 70-80 | 500-650 | 20,250 | 25-35 |
| 80-90 | 650-800 | 27,500 | 35-50 |
| 90-100 | 800-1000 | 36,500 | 50-75 |

**Total to reach mastery (100):** ~50-75 races per skill

### XP Formula

```typescript
function xpRequired(currentLevel: number): number {
  // Level 0-40: Fast early progression
  if (currentLevel < 40) return 100;

  // Level 40-70: Moderate progression
  if (currentLevel < 70) return 200 + (currentLevel - 40) * 10;

  // Level 70-100: Slow mastery
  return 500 + (currentLevel - 70) * 16;
}
```

### XP Sources

| Source | Base XP | Applies To |
|--------|---------|------------|
| Race completion | 50-200 | Racecraft, Stamina |
| Win | +200 | Racecraft, Composure |
| Top 3 | +100 | Racecraft |
| Top 5 | +75 | Racecraft |
| Top 10 | +50 | Racecraft |
| Clean lap | +2 | Consistency |
| Successful pass | +10 | Racecraft, Aggression |
| Good decision | +20 | Relevant skill |
| Mental state mgmt | +30 | Composure, Focus |
| Drafting maneuver | +15 | Draft Sense |
| Conservative driving | +10 | Tire Management |
| Fuel-saving | +10 | Fuel Management |
| Strategic pit | +20 | Pit Strategy |

---

## Skill Progression Milestones

| Milestone | Skill Level | Description |
|-----------|-------------|-------------|
| Beginner | 0-30 | Learning basics |
| Amateur | 31-50 | Competent performance |
| Experienced | 51-70 | Consistent performance |
| Professional | 71-85 | High-level performance |
| Elite | 86-95 | Top-tier performance |
| Master | 96-100 | Peak performance |

---

## Mental State Thresholds

### Confidence Levels

| Range | Label | Effect |
|-------|-------|--------|
| 0-20 | Crushed | -10% lap time, very limited options |
| 21-39 | Low | -5% lap time, limited options |
| 40-59 | Neutral | Normal performance |
| 60-79 | Good | Normal+ performance |
| 80-100 | High | +5% lap time, bonus options |

### Frustration Levels

| Range | Label | Effect |
|-------|-------|--------|
| 0-30 | Low | Normal performance |
| 31-60 | Medium | -3% consistency, -3% focus |
| 61-80 | High | -10% consistency, -5% focus, risky bias |
| 81-100 | Extreme | Severe penalties, very risky |

### Focus Levels

| Range | Label | Effect |
|-------|-------|--------|
| 0-20 | Exhausted | 40% mistake chance, -50% decision time |
| 21-39 | Low | 20% mistake chance, -50% decision time |
| 40-59 | Moderate | 10% mistake chance |
| 60-79 | Good | 5% mistake chance |
| 80-100 | Sharp | 0-5% mistake chance |

---

## Implementation Constants

```typescript
export const CHARACTER_CONSTANTS = {
  // Skill ranges
  skillMin: 0,
  skillMax: 100,

  // XP progression
  xpBaseEarly: 100,         // Levels 0-40
  xpBaseMid: 200,           // Levels 40-70
  xpBaseLate: 500,          // Levels 70-100
  xpScaleMid: 10,           // Per level multiplier
  xpScaleLate: 16,          // Per level multiplier

  // Mental state ranges
  mentalMin: 0,
  mentalMax: 100,

  // Skill effects
  racecraftEffect: 0.02,    // ±2% lap time
  consistencyRange: 0.4,    // ±0.4s variance range
  aggressionBonus: 0.20,    // +20% per 10 points
  focusMistakeMax: 0.10,    // 10% max mistake chance
  staminaDrainMax: 0.5,     // Max focus drain/lap
  composureRecovery: 1.0,   // Recovery multiplier

  // Mental state effects
  confidenceEffect: 0.05,   // ±5% lap time
  frustrationPenalty: 0.10, // Up to -10% consistency
  distractionPenalty: 0.05, // Up to -5% lap time

  // Mental state changes
  passConfidence: 5,
  fastLapConfidence: 3,
  leadingConfidence: 2,
  failedPassFrustration: 5,
  cautionFocusRestore: 15,
  mentalResetEffect: 20,

  // Specialized skill effects
  draftSenseBonus: 0.50,        // Up to +50% draft bonus
  tireManagementReduction: 0.30, // Up to -30% wear
  fuelManagementReduction: 0.15  // Up to -15% consumption
};
```

---

## Usage Notes

**For Implementation:**
1. Use these formulas as source of truth
2. Constants defined for easy tuning
3. All effects stack multiplicatively where applicable

**For Balance:**
1. XP progression tested for 50-75 race mastery
2. Mental state effects significant but not overwhelming
3. Skill effects noticeable but not dominant

**For Testing:**
1. Validate formulas match reference
2. Check edge cases (0, 50, 100 skill values)
3. Ensure mental state thresholds work correctly

---

**Cross-references:**
- SPEC.md - Full character system design
- EXAMPLES.md - Test scenarios using these formulas
- CONTRACTS.md - Interface definitions
