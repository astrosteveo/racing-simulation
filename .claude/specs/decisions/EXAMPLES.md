# Decision System Examples

**Last Updated:** 2025-11-16
**Phase:** Phase 4 - Content Migrated
**Status:** Active

---

## Overview

Test scenarios demonstrating decision system behavior, outcome calculation, and effect application.

**Purpose:**
- Validate skill-based outcome calculation
- Test risk/reward balance
- Verify mental state integration
- Document expected decision behavior

---

## Pit Strategy Examples

### Example 1: Optimal Pit Decision

**Purpose:** Validate pit strategy success with good timing

**Given:**
- Lap: 400/500, Position: 8th, Laps since pit: 85
- Tire wear: 55%, Fuel: 45%
- Driver: Pit Strategy 75, Racecraft 70
- Field: Top 5 stay out, 6-15 pit

**Decision:** Pit now vs Stay out vs Fuel only

**Player chooses:** Pit now

**Expected Outcome:** Success
- Position: 8th → 11th (temporary drop)
- Tires/Fuel: 100%
- Confidence: +5, Frustration: -5
- XP: +15 pitStrategy, +5 racecraft

**Test:**
```typescript
const result = evaluateDecision(pitDecision, 'pit-now', driver);
expect(result.outcome).toBe('success');
expect(result.effects.tireWear).toBe(100);
```

---

## Passing Examples

### Example 2: Risky Pass (High Frustration)

**Purpose:** Validate frustration impact on passing decisions

**Given:**
- Lap: 250/500, Position: 12th
- Driver: Racecraft 60, Aggression 75, Confidence 55, Frustration 70
- Been stuck behind #22 for 20 laps

**Decision:** Aggressive pass vs Patient vs Draft

**Player chooses:** Aggressive pass

**Success Probability:**
```
Base: 50%
Skill (racecraft 60): +5%
Mental (conf 55 - frust 70): -1.5%
Risk (high): -15%
Total: 38.5%
```

**Likely Outcome:** Failure
- Position: 12th → 13th (fell back)
- Confidence: -8, Frustration: +15
- Damage: +5%

**Test:**
```typescript
const prob = calculateSuccessProbability(passDecision, 'aggressive', driver);
expect(prob).toBeLessThan(0.50); // Frustration hurts chances
```

---

## Mental State Examples

### Example 3: Mental Reset Decision

**Purpose:** Validate composure skill effect on mental recovery

**Given:**
- Frustration: 80, Confidence: 40, Focus: 55
- Driver: Composure 65
- After 3 failed pass attempts

**Decision:** Refocus vs Keep pushing vs Get aggressive

**Player chooses:** Refocus

**Expected Outcome:** Success
- Frustration: -20, Focus: +10, Confidence: +5
- XP: +20 composure, +10 focus
- May lose 1 position (short-term cost)

**Recovery Rate:**
```
Base recovery: -20 frustration
Composure bonus: 65% → faster recovery
Total: -20 frustration, +10 focus
```

**Test:**
```typescript
const result = evaluateDecision(mentalDecision, 'refocus', driver);
expect(result.effects.mentalStateChange.frustration).toBeLessThan(0);
expect(result.xpGained.composure).toBeGreaterThan(0);
```

---

## Outcome Probability Validation

### Example 4: Skill Impact on Success

**Purpose:** Validate higher skill = higher success rate

**Scenario:** Same passing decision, different skill levels

**Rookie Driver (Racecraft 35):**
```
Success probability: 50% + (-7.5%) + 0% - 15% = 27.5%
```

**Skilled Driver (Racecraft 85):**
```
Success probability: 50% + (+17.5%) + 0% - 15% = 52.5%
```

**Difference:** Skilled driver ~2x more likely to succeed

**Test:**
```typescript
const rookieProb = calculateSuccessProbability(decision, option, rookieDriver);
const skilledProb = calculateSuccessProbability(decision, option, skilledDriver);

expect(skilledProb).toBeGreaterThan(rookieProb * 1.5);
```

---

## Risk/Reward Examples

### Example 5: Risk Level Impact

**Purpose:** Validate risk penalty on success probability

**Driver:** Racecraft 70 (neutral), Good mental state

**Low Risk Option:**
```
Success: 50% + 10% + 0% + 0% = 60%
Reward: +1 position, +5 confidence
```

**Medium Risk Option:**
```
Success: 50% + 10% + 0% - 5% = 55%
Reward: +2 positions, +8 confidence
```

**High Risk Option:**
```
Success: 50% + 10% + 0% - 15% = 45%
Reward: +3 positions, +12 confidence
Failure: -1 position, -10 confidence, +5% damage
```

**Test:**
```typescript
expect(lowRiskProb).toBeGreaterThan(mediumRiskProb);
expect(mediumRiskProb).toBeGreaterThan(highRiskProb);
```

---

## Migrated from docs/EXAMPLES.md (Examples 5-7)
## Extended with outcome probability validation
## Cross-references: SPEC.md (formulas), REFERENCE.md (tables)
