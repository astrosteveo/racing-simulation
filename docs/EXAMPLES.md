# Test Scenarios and Examples

This document contains concrete examples of game behavior that serve as both documentation and the basis for automated tests.

## Physics Calculation Examples

### Example 1: Clean Lap at Bristol

**Scenario:** Rookie driver with decent stats running a clean lap

**Given:**
- **Driver:**
  - Racecraft: 70
  - Consistency: 65
  - Confidence: 75 (high)
  - Frustration: 15 (low)
  - Focus: 80 (high)
- **Track:** Bristol Motor Speedway
  - Length: 0.533 miles
  - Banking: 26° (turns)
  - Type: Short track
- **Car:**
  - Tire wear: 100% (fresh tires)
  - Fuel: 100% (full tank)
- **Conditions:** No draft, clean air

**Expected Outcome:**
- **Lap time:** ~15.4 - 15.6 seconds
- **Calculation logic:**
  - Base corner speed for 26° banking at Bristol: ~120 MPH
  - Straight speed: ~140 MPH
  - Driver skill modifier: +2% (Racecraft 70)
  - Confidence modifier: +3% (Confidence 75)
  - Total lap time: Calculated from section speeds
- **Mental state changes:**
  - Confidence: +1 (clean lap)
  - Frustration: -1 (no incidents)

**Test assertion:**
```typescript
const lapTime = calculateLapTime(driver, bristol, car);
expect(lapTime).toBeGreaterThan(15.0);
expect(lapTime).toBeLessThan(16.0);
```

---

### Example 2: Tire Wear Impact

**Scenario:** Same driver, same track, but with worn tires

**Given:**
- Same as Example 1, except:
  - **Tire wear:** 50% (half life)

**Expected Outcome:**
- **Lap time:** ~16.0 - 16.3 seconds (+0.5-0.7s slower)
- **Calculation logic:**
  - Corner speed reduced by 50% tire grip loss
  - 100% grip → 50% grip = ~5-8% corner speed loss
  - Corner sections dominate Bristol lap time
  - Lap time increases accordingly
- **Mental state changes:**
  - Frustration: +2 (struggling with grip)
  - Confidence: -1 (car handling poorly)

**Test assertion:**
```typescript
const freshTires = calculateLapTime(driver, bristol, { tireWear: 100, fuel: 100 });
const wornTires = calculateLapTime(driver, bristol, { tireWear: 50, fuel: 100 });
expect(wornTires).toBeGreaterThan(freshTires);
expect(wornTires - freshTires).toBeGreaterThan(0.4);
expect(wornTires - freshTires).toBeLessThan(0.9);
```

---

### Example 3: Drafting Effect at Daytona

**Scenario:** Driver drafting another car on superspeedway

**Given:**
- **Driver:** Same stats as Example 1
- **Track:** Daytona International Speedway
  - Length: 2.5 miles
  - Banking: 31° (turns), 18° (tri-oval)
  - Type: Superspeedway
- **Car:** Fresh tires, full fuel
- **Draft:** 1.5 car lengths behind leader

**Expected Outcome:**
- **Speed boost:** +3-5 MPH in draft zone
- **Lap time improvement:** ~0.3-0.5 seconds faster
- **Fuel consumption:** -10% per lap
- **Calculation logic:**
  - Straight sections at Daytona ~1.5 miles of 2.5 total
  - Draft active on straights
  - Speed boost = f(distance behind leader)
  - Lap time reduction = speed boost * straight percentage

**Test assertion:**
```typescript
const noDraft = calculateLapTime(driver, daytona, car, { draft: false });
const withDraft = calculateLapTime(driver, daytona, car, { draft: true, draftDistance: 1.5 });
expect(noDraft - withDraft).toBeGreaterThan(0.2);
expect(noDraft - withDraft).toBeLessThan(0.6);

const fuelNoDraft = calculateFuelConsumption(1, false);
const fuelWithDraft = calculateFuelConsumption(1, true);
expect(fuelWithDraft).toBe(fuelNoDraft * 0.9);
```

---

### Example 4: Mental State Performance Impact

**Scenario:** Driver with high frustration and low confidence

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
  - High frustration: -3% consistency, -5% focus
  - Effective skill reduction
- **Mistake probability:** 15% per lap
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
const goodMentalState = { confidence: 80, frustration: 20, focus: 80 };
const poorMentalState = { confidence: 25, frustration: 75, focus: 50 };

const goodTime = calculateLapTime(driver, charlotte, car, goodMentalState);
const poorTime = calculateLapTime(driver, charlotte, car, poorMentalState);

expect(poorTime).toBeGreaterThan(goodTime * 1.08);  // At least 8% slower
expect(poorTime).toBeLessThan(goodTime * 1.15);     // But not absurdly slow
```

---

## Decision Examples

### Example 5: Pit Strategy Decision - Optimal Choice

**Scenario:** Caution flag with 100 laps to go, player in 8th

**Given:**
- **Race state:**
  - Lap: 400 / 500
  - Position: 8th / 40
  - Laps since last pit: 85
- **Car state:**
  - Tire wear: 55%
  - Fuel: 45% (~90 laps remaining)
- **Driver:**
  - Pit Strategy skill: 75 (good)
- **Field:** Top 5 cars likely to stay out, 6-15 likely to pit

**Decision Prompt:**
```
Caution flag! Do you pit?
1. Pit now (4 tires + fuel)        [12 second stop]
2. Stay out (maintain track position)
3. Fuel only (quick stop)          [6 second stop]

Default: Pit now
Time limit: 10 seconds
```

**Optimal choice:** Option 1 (Pit now)

**Reasoning:**
- Tires at 55% will struggle for 100 laps
- Fuel at 45% is borderline for 100 laps (need ~90% buffer)
- Track position loss minimal (6-15 pitting anyway)
- Fresh tires + fuel = pace advantage later

**Outcome (if player chooses Option 1):**
```typescript
{
  optionChosen: "pit-now",
  outcome: "success",
  effects: {
    positionChange: -3,        // Drop to 11th during stops
    tireWear: 100,             // Fresh tires
    fuelLevel: 100,            // Full tank
    mentalStateChange: {
      confidence: +5,          // Good strategic call
      frustration: -5          // Relief from tire struggles
    }
  },
  xpGained: {
    pitStrategy: +15,          // Good decision
    racecraft: +5
  }
}
```

**Test assertion:**
```typescript
const decision = generatePitDecision(raceState, driver, car);
const result = evaluateDecision(decision, "pit-now", driver);

expect(result.outcome).toBe("success");
expect(result.effects.tireWear).toBe(100);
expect(result.effects.mentalStateChange.confidence).toBeGreaterThan(0);
```

---

### Example 6: Passing Decision - Risky Attempt

**Scenario:** Frustrated driver attempts risky pass

**Given:**
- **Race state:**
  - Lap: 250 / 500
  - Position: 12th / 40
  - Car ahead: 11th place, similar pace
- **Driver:**
  - Racecraft: 60 (developing)
  - Aggression: 75 (high)
  - Confidence: 55 (medium)
  - Frustration: 70 (high - stuck for 20 laps)
- **Track section:** Turn 2 at Bristol (tight, risky)

**Decision Prompt:**
```
Car #22 is slow in Turn 2. Attempt pass?
1. Aggressive pass (dive inside, high risk)
2. Patient approach (wait for mistake)
3. Stay behind and draft

Default: Patient approach
Time limit: 5 seconds
```

**Player chooses:** Option 1 (Aggressive pass)

**Outcome calculation:**
```typescript
pass_probability = base_chance(0.40) *
                  (attacker_skill / defender_skill) *  // 60/65 = 0.92
                  confidence_modifier(0.95) *          // Low confidence penalty
                  frustration_penalty(0.85)            // High frustration penalty
                = 0.40 * 0.92 * 0.95 * 0.85
                = 0.297  (~30% success chance)

roll = random(0, 1) = 0.65  // Failed
```

**Outcome (failure):**
```typescript
{
  optionChosen: "aggressive-pass",
  outcome: "failure",
  effects: {
    positionChange: 0,           // No position gained
    mentalStateChange: {
      confidence: -5,            // Failed pass hurts confidence
      frustration: +10,          // Frustration increases
      distraction: +5            // Getting emotional
    }
  },
  xpGained: {
    racecraft: +2,               // Minor XP for attempt
    aggression: +5               // Learning aggression limits
  }
}
```

**Mental state update:**
```
New frustration: 70 + 10 = 80 (HIGH - performance penalties active)
New confidence: 55 - 5 = 50 (now at medium-low)
Distraction: 10 + 5 = 15 (mild)

Next lap time penalty: -8% from high frustration
```

**Test assertion:**
```typescript
const decision = generatePassingDecision(raceState, driver, targetCar);
const driver = createDriver({ frustration: 70, confidence: 55 });

// Simulate multiple attempts to test probability
const outcomes = [];
for (let i = 0; i < 100; i++) {
  const result = evaluateDecision(decision, "aggressive-pass", driver);
  outcomes.push(result.outcome);
}

const successRate = outcomes.filter(o => o === 'success').length / 100;
expect(successRate).toBeGreaterThan(0.20);  // Not impossible
expect(successRate).toBeLessThan(0.40);     // But low due to frustration
```

---

### Example 7: Mental State Management Decision

**Scenario:** Driver given chance to reset mentally during caution

**Given:**
- **Driver:**
  - Frustration: 80 (very high)
  - Confidence: 40 (low)
  - Focus: 55 (degrading)
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

**Outcome:**
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
const driver = createDriver({ frustration: 80, confidence: 40 });
const decision = generateMentalStateDecision(driver);
const result = evaluateDecision(decision, "refocus", driver);

expect(result.effects.mentalStateChange.frustration).toBeLessThan(0);
expect(driver.mentalState.frustration).toBeLessThan(80);
expect(result.xpGained.composure).toBeGreaterThan(0);
```

---

## Full Race Examples

### Example 8: Short Race at Bristol (100 laps)

**Scenario:** Rookie driver's first career race

**Given:**
- **Driver:** All skills 40-50 (rookie)
- **Starting position:** 20th / 40
- **Track:** Bristol (0.533 miles, 100 laps = 53.3 miles)
- **AI field:** Mixed skills (30-80 range)

**Race progression:**

**Laps 1-20:** Learning phase
- Driver cautious, consistent lap times
- Confidence: 50 → 55 (gaining rhythm)
- Positions: 20th → 18th (passed 2 slower cars)
- Tire wear: 100% → 85%
- Fuel: 100% → 75%

**Laps 21-40:** First challenge
- Decision: Attempt pass on 17th place car
- Chooses: Patient approach (default)
- Outcome: Success! 17th place
- Confidence: 55 → 62
- Positions: 18th → 17th

**Lap 45:** Caution flag
- Decision: Pit or stay out?
- Tire wear: 65%, Fuel: 45%
- Chooses: Pit (good call)
- Outcome: Drops to 24th, but fresh tires
- Confidence: 62 → 58 (lost positions but strategic)

**Laps 46-70:** Recovery phase
- Fresh tires = pace advantage
- Passes 6 cars over 25 laps
- Positions: 24th → 18th → 15th → 13th
- Confidence: 58 → 70 (success breeds confidence)
- Tire wear: 100% → 70%

**Laps 71-85:** Plateau
- Caught in traffic with similar-skilled drivers
- Frustration: 20 → 40 (stuck)
- Positions: 13th (no movement)

**Lap 80:** Mental state decision
- Frustration at 40, confidence at 65
- Chooses: Stay patient
- Outcome: Frustration reduced to 35

**Laps 86-100:** Final push
- Tire strategy paying off (opponents' tires worn)
- Passes 2 more cars
- Final position: **11th place**

**Post-race:**
```typescript
{
  startPosition: 20,
  finishPosition: 11,
  positionsGained: +9,
  lapsLed: 0,
  fastestLap: 15.8,
  averageLap: 16.2,
  cleanLaps: 92 / 100,
  decisionsCorrect: 4 / 5,

  xpGained: {
    racecraft: +80,
    consistency: +60,
    tireManagement: +50,
    pitStrategy: +40,
    composure: +30
  },

  newSkills: {
    racecraft: 40 → 43,
    consistency: 45 → 47,
    tireManagement: 38 → 41
  }
}
```

**Test assertion:**
```typescript
const race = new RaceSimulation({
  track: bristol,
  laps: 100,
  driver: rookieDriver,
  aiField: generateAIField(40)
});

const results = race.simulate({ headless: true });

// Rookie should finish mid-pack
expect(results.finishPosition).toBeGreaterThan(5);
expect(results.finishPosition).toBeLessThan(25);

// Should gain XP
expect(results.xpGained.racecraft).toBeGreaterThan(50);

// Should have reasonable lap times
expect(results.fastestLap).toBeGreaterThan(15.0);
expect(results.fastestLap).toBeLessThan(17.0);
```

---

### Example 9: Long Race at Charlotte (400 laps)

**Scenario:** Experienced driver running full distance race

**Given:**
- **Driver:** All skills 70-80 (experienced)
- **Starting position:** 8th / 40
- **Track:** Charlotte (1.5 miles, 400 laps = 600 miles)
- **AI field:** Competitive (60-90 skills)

**Expected patterns:**

**Tire strategy:**
- ~80-100 lap tire life at Charlotte
- 4-5 pit stops required
- Fresh tire advantage: ~0.5s per lap

**Fuel strategy:**
- ~100 laps per tank
- Potential fuel-only stop strategy
- Fuel weight: -0.02s per lap per 10% fuel

**Mental state dynamics:**
- Focus degradation over 400 laps (stamina test)
  - Start: 85
  - Lap 100: 75
  - Lap 200: 65
  - Lap 300: 55 (if no cautions)
  - Lap 400: 45
- Confidence fluctuations based on battles
- Frustration spikes during traffic

**Decision count:** ~15-20 decisions over race
- 4-5 pit decisions
- 8-10 passing opportunities
- 2-3 traffic management
- 1-2 mental state resets

**Possible finish range:** 5th - 12th
- Top 5: Excellent execution, good luck
- 6-10: Solid race, good strategy
- 11-15: Struggled or bad luck
- 16+: Major mistakes or mechanical issues

**Test assertion:**
```typescript
const race = new RaceSimulation({
  track: charlotte,
  laps: 400,
  driver: experiencedDriver,
  aiField: generateCompetitiveField(40)
});

const results = race.simulate({ headless: true });

// Experienced driver should finish top half
expect(results.finishPosition).toBeLessThan(20);

// Should complete most laps clean
expect(results.cleanLaps / results.lapsCompleted).toBeGreaterThan(0.85);

// Should make good decisions
expect(results.decisionsCorrect / results.decisionsTotal).toBeGreaterThan(0.60);

// Lap times should be competitive
expect(results.averageLap).toBeLessThan(results.slowestAIAverage);
```

---

## Edge Cases and Error Conditions

### Example 10: Out of Fuel

**Scenario:** Driver miscalculates fuel, runs out

**Given:**
- Lap 495 / 500 (5 laps to go)
- Position: 6th (running well)
- Fuel: 0%

**Expected:**
- Speed drops dramatically (no power)
- Falls to last place within 1 lap
- Race effectively over
- Finish position: ~35-40th
- Mental state: Confidence crashes, frustration maxes

**Outcome:**
```typescript
{
  finishPosition: 37,
  issue: "out-of-fuel",
  lapOccurred: 495,
  mentalState: {
    confidence: 10,    // Devastated
    frustration: 95    // Extremely frustrated
  },
  xpGained: {
    fuelManagement: -20,  // Negative XP for mistake
    pitStrategy: +50       // Hard lesson learned
  }
}
```

---

### Example 11: Perfect Lap (All Optimal Conditions)

**Scenario:** Expert driver, perfect conditions, qualifying run

**Given:**
- **Driver:** All skills 95-100 (expert)
- **Track:** Bristol
- **Car:** Fresh tires (100%), light fuel (20%)
- **Mental state:** Confidence 100, Focus 100, no frustration
- **Conditions:** Clean air, no traffic

**Expected:**
- **Lap time:** ~15.0 - 15.2 seconds (near track record)
- **Calculation:** All bonuses stacked
  - Expert racecraft: +5% speed
  - Perfect confidence: +5% speed
  - Fresh tires: +0% (baseline)
  - Light fuel: +0.1s improvement
  - Clean air: +0% (baseline)

**Test assertion:**
```typescript
const expertDriver = createDriver({ allSkills: 100 });
expertDriver.mentalState = { confidence: 100, frustration: 0, focus: 100 };

const perfectLap = calculateLapTime(expertDriver, bristol, {
  tireWear: 100,
  fuel: 20
});

// Should be significantly faster than rookie
const rookieLap = calculateLapTime(rookieDriver, bristol, { tireWear: 100, fuel: 20 });

expect(perfectLap).toBeLessThan(15.3);
expect(perfectLap).toBeLessThan(rookieLap * 0.95);  // At least 5% faster
```

---

### Example 12: Worst Case Lap

**Scenario:** Struggling driver, everything going wrong

**Given:**
- **Driver:** Low skills (30-40), rookie
- **Mental state:** Confidence 10, Frustration 95, Focus 30, Distraction 80
- **Car:** Tires 20% (nearly dead), Fuel 100% (heavy)
- **Conditions:** Stuck in traffic, turbulent air

**Expected:**
- **Lap time:** ~17.5 - 18.5 seconds (very slow)
- **Mistake probability:** 40% per lap
- **Calculation:** All penalties stacked
  - Low skill: -5% speed
  - Terrible mental state: -15% speed
  - Worn tires: -10% corner speed
  - Heavy fuel: -0.2s
  - Traffic: -2% speed

**Test assertion:**
```typescript
const strugglingDriver = createDriver({ allSkills: 35 });
strugglingDriver.mentalState = {
  confidence: 10,
  frustration: 95,
  focus: 30,
  distraction: 80
};

const worstLap = calculateLapTime(strugglingDriver, bristol, {
  tireWear: 20,
  fuel: 100
});

expect(worstLap).toBeGreaterThan(17.0);
expect(worstLap).toBeGreaterThan(perfectLap * 1.15);  // At least 15% slower
```

---

## Using These Examples

### As Documentation
These examples explain how the game should work to players, designers, and developers.

### As Test Cases
Each example should have corresponding automated tests:

```typescript
describe('Physics Examples', () => {
  it('Example 1: Clean lap at Bristol', () => { /* test code */ });
  it('Example 2: Tire wear impact', () => { /* test code */ });
  // ...
});

describe('Decision Examples', () => {
  it('Example 5: Optimal pit strategy', () => { /* test code */ });
  // ...
});
```

### As Validation
Run these scenarios during development to verify the simulation behaves correctly.

### As Regression Tests
If behavior changes unexpectedly, these tests will catch it.

---

**These examples are the contract between design and implementation. If the code produces these outcomes, the simulation is working correctly.**
