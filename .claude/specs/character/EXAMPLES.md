# Character/RPG System Examples

**Last Updated:** 2025-11-16
**Phase:** Phase 3 - Content Migrated
**Status:** Active

---

## Overview

Test scenarios and examples demonstrating character progression, mental state dynamics, and skill effects on race performance.

**Purpose:**
- Define expected character behavior for validation
- Provide test cases for progression and mental state systems
- Document realistic skill progression pacing
- Validate mental state feedback loops

---

## Mental State Examples

### Example 1: Mental State Performance Impact

**Purpose:** Validate mental state effects on lap time performance

**Given:**
- **Driver:**
  - Racecraft: 70
  - Confidence: 25 (low - struggling)
  - Frustration: 75 (high - stuck in traffic)
  - Focus: 50 (medium - tired)
- **Track:** Charlotte Motor Speedway (intermediate)
- **Car:** 70% tire wear, 60% fuel

**Expected Outcome:**
- **Lap time:** Significantly slower than optimal
- **Performance penalties:**
  - Low confidence: -5% lap time
  - High frustration: -10% consistency, -5% focus
  - Effective skill reduction
- **Mistake probability:** 15-20% per lap
- **Mental state volatility:** High (mood swings likely)

**Calculation:**
```
Base lap time (Charlotte): 28.5s (skilled driver, good conditions)
Confidence penalty: 28.5s * 0.05 = 1.43s
Frustration penalty: 28.5s * 0.03 = 0.86s
Tire wear penalty: 28.5s * 0.08 = 2.28s
Total lap time: ~33.0s (+4.5s slower than optimal)
```

**Test assertion:**
```typescript
const goodMentalState = { confidence: 80, frustration: 20, focus: 80, distraction: 10 };
const poorMentalState = { confidence: 25, frustration: 75, focus: 50, distraction: 40 };

const goodTime = calculateLapTime(driver, charlotte, car, goodMentalState);
const poorTime = calculateLapTime(driver, charlotte, car, poorMentalState);

expect(poorTime).toBeGreaterThan(goodTime * 1.08);  // At least 8% slower
expect(poorTime).toBeLessThan(goodTime * 1.15);     // But not absurdly slow
```

---

### Example 2: Mental State Recovery Decision

**Purpose:** Validate mental state reset mechanics during caution

**Given:**
- **Driver:**
  - Frustration: 80 (very high)
  - Confidence: 40 (low)
  - Focus: 55 (degrading)
  - Composure: 65 (moderate recovery rate)
- **Race state:**
  - Caution flag (breathing room)
  - Position: 15th (dropped from 10th)
  - Laps remaining: 200

**Decision Prompt:**
```
You've been struggling. Use this caution to regroup?
1. Take deep breaths, refocus (reduce frustration)
2. Stay fired up, push harder (maintain aggression)
3. Review strategy with crew (balanced approach)

Default: Review strategy with crew
Time limit: 12 seconds
```

**Player chooses:** Option 1 (Refocus)

**Expected Outcome:**
```typescript
{
  optionChosen: "refocus",
  outcome: "success",
  effects: {
    mentalStateChange: {
      frustration: -20,          // Significant reduction
      focus: +10,                // Mental reset
      confidence: +5,            // Feels better
      distraction: -10           // Clarity restored
    }
  },
  xpGained: {
    composure: +20,              // Big composure XP
    focus: +10
  }
}
```

**Follow-up impact:**
```
Frustration: 80 - 20 = 60 (back to medium, penalties reduced)
Focus: 55 + 10 = 65 (better decision making)
Confidence: 40 + 5 = 45 (still low but improving)

Next 10 laps: Performance improves, lap times closer to pace
Chance to recover positions: Increased
```

**Test assertion:**
```typescript
const driver = createDriver({ frustration: 80, confidence: 40, focus: 55 });
const decision = generateMentalStateDecision(driver);
const result = evaluateDecision(decision, "refocus", driver);

expect(result.effects.mentalStateChange.frustration).toBeLessThan(0);
expect(driver.mentalState.frustration).toBeLessThan(80);
expect(result.xpGained.composure).toBeGreaterThan(0);
```

---

### Example 3: Positive Feedback Loop

**Purpose:** Demonstrate success breeding more success

**Scenario:** Driver gains confidence through successful passes

**Initial State:**
- Confidence: 50 (neutral)
- Frustration: 30 (low)
- Focus: 70 (good)

**Event Sequence:**
1. **Successful pass (lap 10):**
   - Confidence: 50 → 55 (+5)
   - Lap time improved by +1%
2. **Another successful pass (lap 12):**
   - Confidence: 55 → 60 (+5)
   - Lap time improved by +2%
3. **Fast lap recorded (lap 15):**
   - Confidence: 60 → 63 (+3)
   - Frustration: 30 → 25 (-5)
4. **Leading race (laps 20-30):**
   - Confidence: 63 → 73 (+10 over 10 laps)
   - Peak performance state

**Result:** Virtuous cycle where success leads to better performance leads to more success

**Test validation:**
```typescript
let confidence = 50;
const events = [
  { type: 'pass', effect: +5 },
  { type: 'pass', effect: +5 },
  { type: 'fast-lap', effect: +3 },
  { type: 'leading', laps: 10, effectPerLap: +1 }
];

events.forEach(event => {
  if (event.type === 'leading') {
    confidence += event.laps * event.effectPerLap;
  } else {
    confidence += event.effect;
  }
});

expect(confidence).toBeGreaterThan(70);  // Should reach high confidence
```

---

### Example 4: Negative Feedback Loop

**Purpose:** Demonstrate struggle spiral and recovery

**Scenario:** Driver stuck in traffic, frustration building

**Initial State:**
- Confidence: 65 (good)
- Frustration: 20 (low)
- Focus: 75 (strong)

**Event Sequence:**
1. **Failed pass attempt (lap 50):**
   - Frustration: 20 → 25 (+5)
   - Confidence: 65 → 62 (-3)
2. **Failed pass attempt (lap 52):**
   - Frustration: 25 → 30 (+5)
   - Confidence: 62 → 59 (-3)
3. **Being passed (lap 55):**
   - Frustration: 30 → 35 (+5)
   - Confidence: 59 → 56 (-3)
   - Performance penalty begins (-2% lap time)
4. **Stuck in traffic (laps 56-65):**
   - Frustration: 35 → 45 (+10)
   - Focus: 75 → 70 (-5 from stress)
5. **Mental reset decision (lap 66):**
   - Player chooses to refocus
   - Frustration: 45 → 30 (-15)
   - Confidence: 56 → 58 (+2)
   - **Loop broken**

**Result:** Negative spiral interrupted by player intervention

**Test validation:**
```typescript
const initialState = { confidence: 65, frustration: 20, focus: 75 };
const failedPasses = 2;
const beingPassed = 1;
const stuckLaps = 10;

let state = { ...initialState };
state.frustration += failedPasses * 5 + beingPassed * 5 + 10;
state.confidence -= failedPasses * 3 + beingPassed * 3;
state.focus -= 5;

expect(state.frustration).toBeGreaterThan(40);  // Spiraled upward
expect(state.confidence).toBeLessThan(60);      // Dropped

// Apply mental reset
state.frustration -= 15;
state.confidence += 2;

expect(state.frustration).toBeLessThan(35);     // Recovery started
```

---

## Skill Progression Examples

### Example 5: Rookie First Race (Bristol 100 Laps)

**Purpose:** Validate rookie progression pacing

**Given:**
- **Driver:** All skills 40-50 (rookie)
- **Starting position:** 20th / 40
- **Track:** Bristol (0.533 miles, 100 laps)
- **AI field:** Mixed skills (30-80 range)

**Race Progression:**

**Laps 1-20:** Learning phase
- Confidence: 50 → 55 (gaining rhythm)
- Positions: 20th → 18th (passed 2 cars)
- Tire/Fuel: Normal degradation

**Laps 21-40:** First success
- Decision: Attempt pass (patient approach)
- Outcome: Success → 17th place
- Confidence: 55 → 62

**Lap 45:** Caution flag
- Decision: Pit (good call)
- Dropped to 24th but fresh tires
- Confidence: 62 → 58 (strategic patience)

**Laps 46-70:** Recovery with fresh tires
- Passes 11 cars (pace advantage)
- Positions: 24th → 13th
- Confidence: 58 → 70 (success breeds success)

**Laps 71-85:** Plateau
- Stuck in traffic (similar skill)
- Frustration: 20 → 40
- Mental state decision: Stay patient
- Frustration: 40 → 35

**Laps 86-100:** Final push
- Tire strategy pays off
- Final position: **11th place** (+9 from start)

**Post-Race XP:**
```typescript
{
  startPosition: 20,
  finishPosition: 11,
  positionsGained: +9,
  cleanLaps: 92 / 100,
  decisionsCorrect: 4 / 5,

  xpGained: {
    racecraft: +80,        // Base race XP + position bonus
    consistency: +60,      // Clean laps bonus
    tireManagement: +50,   // Strategic pit stop
    pitStrategy: +40,      // Good pit decision
    composure: +30         // Mental state management
  },

  skillProgression: {
    racecraft: 40 → 43,
    consistency: 45 → 47,
    tireManagement: 38 → 41
  }
}
```

**Test assertion:**
```typescript
const race = simulateRace({
  track: bristol,
  laps: 100,
  driver: { skills: rookieSkills },
  aiField: generateAIField(40)
});

// Rookie should finish mid-pack
expect(race.finishPosition).toBeGreaterThan(5);
expect(race.finishPosition).toBeLessThan(25);

// Should gain significant XP (first race)
expect(race.xpGained.racecraft).toBeGreaterThan(50);

// Should show measurable improvement
expect(race.skillAfter.racecraft).toBeGreaterThan(race.skillBefore.racecraft);
```

---

### Example 6: Long Race Stamina Test (Charlotte 400 Laps)

**Purpose:** Validate focus degradation and stamina effects

**Given:**
- **Driver:** All skills 70-80 (experienced)
- **Starting position:** 8th / 40
- **Track:** Charlotte (1.5 miles, 400 laps = 600 miles)
- **AI field:** Competitive (60-90 skills)

**Expected Mental State Dynamics:**

**Focus degradation over 400 laps:**
```
Start (Lap 1):    Focus = 85
Lap 100:          Focus = 75  (stamina 75: -0.10/lap drain)
Lap 200:          Focus = 65  (continuous drain)
Lap 300:          Focus = 55  (fatigue setting in)
Lap 400:          Focus = 45  (significant fatigue)

With cautions (2-3 over race):
  Each caution: +15 focus restoration
  Final focus: ~55-60 (manageable)
```

**Stamina Skill Effect:**
```typescript
// Low stamina (50): -0.50 focus per lap
// Medium stamina (70): -0.25 focus per lap
// High stamina (90): -0.10 focus per lap

const focusDrainPerLap = (1.0 - stamina / 100) * 0.5;
const finalFocus = initialFocus - (laps * focusDrainPerLap);
```

**Test assertion:**
```typescript
const driver = { skills: { stamina: 75, focus: 85 } };
const laps = 400;
const focusDrainRate = (1.0 - driver.skills.stamina / 100) * 0.5;

let currentFocus = driver.skills.focus;
for (let lap = 0; lap < laps; lap++) {
  currentFocus -= focusDrainRate;
  if (lap % 100 === 0 && lap > 0) {
    // Caution restores focus
    currentFocus = Math.min(100, currentFocus + 15);
  }
}

expect(currentFocus).toBeGreaterThan(40);  // Should still have reasonable focus
expect(currentFocus).toBeLessThan(70);     // But noticeably fatigued
```

---

## Skill Effect Validation

### Example 7: Tire Management Impact

**Purpose:** Validate Tire Management skill effect on wear rate

**Scenario:** Compare tire wear over 50-lap stint

**Low Tire Management (30):**
```
Lap 0:  100% grip
Lap 10:  92% grip  (-0.8% per lap)
Lap 20:  84% grip
Lap 30:  76% grip
Lap 40:  68% grip
Lap 50:  60% grip  (40% degradation over 50 laps)
```

**High Tire Management (90):**
```
Lap 0:  100% grip
Lap 10:  94% grip  (-0.6% per lap)
Lap 20:  88% grip
Lap 30:  82% grip
Lap 40:  76% grip
Lap 50:  70% grip  (30% degradation over 50 laps)
```

**Benefit:** 10% less tire degradation = longer stints, fewer pit stops

**Formula:**
```typescript
const tireWearMultiplier = 1.0 - (tireManagement / 100) * 0.30;
const gripLoss = baseTireWear * tireWearMultiplier;
```

**Test assertion:**
```typescript
const lowSkill = { tireManagement: 30 };
const highSkill = { tireManagement: 90 };

const lowWear = calculateTireWear(50, lowSkill);
const highWear = calculateTireWear(50, highSkill);

expect(highWear).toBeGreaterThan(lowWear);  // More grip remaining
expect(highWear - lowWear).toBeCloseTo(10, 1);  // ~10% difference
```

---

### Example 8: Draft Sense Effect

**Purpose:** Validate Draft Sense skill on drafting efficiency

**Scenario:** Superspeedway drafting bonus

**Base draft bonus:** 4 MPH at optimal distance

**Low Draft Sense (40):**
```
Draft bonus = 4 * (1 + 40 / 200) = 4 * 1.20 = 4.8 MPH
```

**High Draft Sense (90):**
```
Draft bonus = 4 * (1 + 90 / 200) = 4 * 1.45 = 5.8 MPH
```

**Benefit:** +1 MPH extra draft speed = significant lap time advantage

**Test assertion:**
```typescript
const baseDraftBoost = 4; // MPH

function getDraftBonus(draftSense: number): number {
  return baseDraftBoost * (1 + draftSense / 200);
}

expect(getDraftBonus(40)).toBeCloseTo(4.8, 1);
expect(getDraftBonus(90)).toBeCloseTo(5.8, 1);
```

---

## Progression Pacing Validation

### Example 9: XP Requirements by Level

**Purpose:** Validate exponential XP curve

**XP Requirements Table:**

| Level Range | XP per Level | Total XP to Reach | Races Required (Est) |
|-------------|--------------|-------------------|----------------------|
| 0-40 | 100 | 4,000 | 5-10 |
| 40-50 | 200-300 | 2,500 | 3-5 |
| 50-60 | 300-400 | 3,500 | 4-7 |
| 60-70 | 400-500 | 4,500 | 6-9 |
| 70-80 | 500-650 | 5,750 | 8-12 |
| 80-90 | 650-800 | 7,250 | 10-15 |
| 90-100 | 800-1000 | 9,000 | 12-18 |

**Total races to mastery (0-100):** ~50-75 races per skill

**Test assertion:**
```typescript
function xpRequired(level: number): number {
  if (level < 40) return 100;
  if (level < 70) return 200 + (level - 40) * 10;
  return 500 + (level - 70) * 16;
}

expect(xpRequired(20)).toBe(100);    // Fast early
expect(xpRequired(50)).toBe(300);    // Moderate
expect(xpRequired(80)).toBe(660);    // Slow mastery
expect(xpRequired(95)).toBe(900);    // Very slow
```

---

## Edge Cases

### Mental State Extremes

**Maximum Confidence (100):**
- +10% lap time bonus
- Unlock "Hot Streak" special options
- Risk: Overconfidence (potential mistakes)

**Zero Confidence (0):**
- -10% lap time penalty
- Limited decision options
- Requires mental reset to recover

**Maximum Frustration (100):**
- -15% consistency
- Extremely risky decision bias
- High mistake probability (30%)

**Zero Focus (0):**
- Decision time reduced to 2 seconds
- 40% mistake chance per lap
- Performance severely degraded

### Skill Caps

**Skill at 100 (Mastery):**
- Continued XP gains have no effect
- Skill remains at 100 (no degradation)
- "Master" visual indicator shown

**Multiple Skills at 100:**
- Rare achievement ("Complete Driver")
- Requires 75-100+ races across all skills
- Visual recognition in career stats

---

## Usage Notes

**For Test Development:**
1. Use examples as templates for unit tests
2. Validate mental state ranges and effects
3. Test skill progression pacing
4. Verify XP formulas match specifications

**For Balance Tuning:**
1. Adjust XP requirements if progression too fast/slow
2. Tune mental state effect magnitudes
3. Balance skill impact on performance
4. Ensure no single skill dominates

**For Documentation:**
1. Examples define "correct" character behavior
2. Reference when debugging character systems
3. Update examples if game balance changes

---

**Migrated from:** `docs/EXAMPLES.md` (Examples 4, 7, 8, 9)
**Extended with:** Skill effect validation, XP pacing, edge cases
**Cross-references:** SPEC.md (formulas), REFERENCE.md (tables), CONTRACTS.md (interfaces)
