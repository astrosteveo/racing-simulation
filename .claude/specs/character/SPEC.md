# Character/RPG System Specification

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** Active - Phase 3 (Content Migrated, Ready for Use)
**Owner:** RPG Team

---

## Overview

NASCAR driver character progression system with skill development, mental state dynamics, XP progression, and career statistics.

**Purpose:** Provide meaningful progression and role-playing elements that affect race performance while maintaining realistic NASCAR racing simulation.

---

## Scope

### In Scope

- **Driver Skills** (10 skill categories, 0-100 scale)
  - Core skills: Racecraft, Consistency, Aggression, Focus, Stamina, Composure
  - Specialized skills: Draft Sense, Tire Management, Fuel Management, Pit Strategy

- **Mental State System** (dynamic during races)
  - Confidence: Self-belief affecting performance
  - Frustration: Negative emotions reducing performance
  - Focus: Concentration level affecting mistakes
  - Distraction: Mental noise reducing performance

- **XP and Progression**
  - Multiple XP sources (finish position, clean laps, passes, decisions)
  - Independent skill leveling with exponential XP requirements
  - Skill caps at 100 (mastery level)

- **Career Statistics**
  - Races, wins, top finishes tracking
  - Pole positions, laps led
  - Average finish calculation

### Out of Scope

- **Rival drivers** - Future enhancement
- **Team dynamics** - Future enhancement
- **Sponsor relationships** - Future enhancement
- **Multi-season championships** - Phase 2 feature

---

## Requirements

### Functional Requirements

1. **FR-1:** All 10 driver skills must affect race performance measurably
   - Racecraft: ±2% lap time
   - Consistency: Lap-to-lap variance (±0.5s to ±0.1s)
   - Mental state modifiers: Up to ±10% performance impact

2. **FR-2:** Mental state must change dynamically during races
   - Confidence increases on success, decreases on failure
   - Frustration builds from repeated failures
   - Focus drains over race duration
   - Mental state recovery during caution periods

3. **FR-3:** XP progression must reward multiple play styles
   - Finish position bonuses (top 10/5/3/1)
   - Clean lap bonuses
   - Successful decision bonuses
   - Position gained bonuses

4. **FR-4:** Skill progression must feel meaningful but not grindy
   - Early levels (0-40): Quick progress
   - Mid levels (40-70): Moderate progress
   - Late levels (70-100): Slow progress (mastery)

5. **FR-5:** Mental state must create positive/negative feedback loops
   - Success → Confidence → Better performance
   - Failure → Frustration → Worse performance
   - Recovery mechanics to break negative spirals

### Non-Functional Requirements

1. **NFR-1 Balance:** No single skill should dominate strategy
2. **NFR-2 Clarity:** Player should understand why skills matter
3. **NFR-3 Progression:** Noticeable improvement every 2-3 races
4. **NFR-4 Realism:** Mental state dynamics feel authentic to racing
5. **NFR-5 Testability:** All formulas unit-testable in isolation

---

## Design

### Character Stats

The driver has persistent stats that improve through XP/progression:

#### Core Skills (0-100 scale)

**Racecraft** - Overall racing ability
- **Affects:** Base lap time, overtaking success, accident avoidance
- **Progression:** Increases with race experience
- **Impact:** ±2% lap time modifier
- **Formula:** `lapTimeModifier = 1.0 + ((racecraft - 50) / 50) * 0.02`

**Consistency** - Ability to maintain pace
- **Affects:** Lap time variance, tire preservation, fuel efficiency
- **Progression:** Increases with clean laps, decreases with mistakes
- **Impact:** Lap-to-lap variance from ±0.5s (low) to ±0.1s (high)
- **Formula:** `lapVariance = 0.5 - (consistency / 100) * 0.4`

**Aggression** - Willingness to take risks
- **Affects:** Overtaking opportunities, tire wear rate, accident risk
- **Progression:** Modified by player decisions (risky vs safe choices)
- **Impact:** +20% overtaking chance per 10 points, +5% tire wear at 80+
- **Trade-off:** Higher aggression = more passes but more risk

**Focus** - Mental sharpness and concentration
- **Affects:** Decision quality, mistake frequency, stamina drain
- **Progression:** Decreases during long races, improves with experience
- **Impact:** Affects mistake probability: `mistakeProbability = 0.10 * (1 - focus / 100)`
- **Race Duration:** Drains 0.5-1.0 points per lap based on intensity

**Stamina** - Physical endurance
- **Affects:** Performance degradation over race distance, focus retention
- **Progression:** Improves slowly with race experience
- **Impact:** Determines focus drain rate over race
- **Formula:** `focusDrainRate = (1.0 - stamina / 100) * 0.5`

**Composure** - Emotional control under pressure
- **Affects:** Mental state recovery rate, decision making under stress
- **Progression:** Improves with experience, decreases with repeated failures
- **Impact:** Mental state recovery speed: `recoveryRate = composure / 100`
- **Benefit:** High composure breaks negative feedback loops faster

#### Specialized Skills (0-100 scale)

**Draft Sense** - Reading aerodynamic situations
- **Affects:** Efficiency of drafting, slingshot timing
- **Progression:** Improves with successful drafting maneuvers
- **Impact:** +1-5% draft speed boost based on skill
- **Formula:** `draftBonus = baseDraftBoost * (1 + draftSense / 200)`

**Tire Management** - Preserving tire life
- **Affects:** Tire degradation rate, grip retention
- **Progression:** Improves with conservative driving, pit strategy execution
- **Impact:** -10% to -30% tire wear rate at high skill
- **Formula:** `tireWearMultiplier = 1.0 - (tireManagement / 100) * 0.3`

**Fuel Management** - Efficient fuel usage
- **Affects:** Fuel consumption rate, ability to stretch fuel runs
- **Progression:** Improves with fuel-saving decisions
- **Impact:** -5% to -15% fuel consumption at high skill
- **Formula:** `fuelConsumptionMultiplier = 1.0 - (fuelManagement / 100) * 0.15`

**Pit Strategy** - Understanding when to pit
- **Affects:** Quality of pit timing decisions
- **Progression:** Improves with successful pit calls
- **Impact:** Better decision options, clearer strategic information
- **Benefit:** Unlocks advanced pit strategy options at 60+ skill

---

### XP and Progression

**XP Sources:**

| Source | Base XP | Conditions |
|--------|---------|------------|
| Race completion | 50-200 | Varies by track difficulty |
| Win | +200 | 1st place finish |
| Top 3 | +100 | 2nd-3rd place |
| Top 5 | +75 | 4th-5th place |
| Top 10 | +50 | 6th-10th place |
| Clean lap | +2 | No incidents, no mistakes |
| Successful pass | +10 | Per position gained |
| Good decision | +20 | Successful strategic choice |
| Mental state management | +30 | Maintained composure under pressure |

**Skill Advancement:**

**XP Requirements (Exponential Curve):**
```typescript
function xpRequired(currentLevel: number): number {
  // Level 0-40: 100 XP per level (fast early progression)
  if (currentLevel < 40) return 100;

  // Level 40-70: 200-500 XP per level (moderate)
  if (currentLevel < 70) return 200 + (currentLevel - 40) * 10;

  // Level 70-100: 500-1000 XP per level (slow mastery)
  return 500 + (currentLevel - 70) * 16;
}
```

**Progression Pacing:**
- **Race 1:** Rookie driver (all skills 30-40)
- **Race 10:** Developing driver (skills 45-55)
- **Race 50:** Experienced driver (skills 65-75)
- **Race 100:** Veteran driver (skills 80-90)
- **Race 200+:** Master driver (skills approaching 100)

**XP Distribution Strategy:**
- **Primary skills:** Racecraft, Consistency get most XP from racing
- **Specialized skills:** Only improve through specific actions
  - Draft Sense: Drafting maneuvers
  - Tire Management: Conservative tire usage
  - Fuel Management: Fuel-saving techniques
  - Pit Strategy: Strategic pit decisions

**Skill Caps:**
- All skills cap at 100 (mastery)
- Reaching 100 unlocks "Mastery Bonus" visual indicator
- Continued play after 100 maintains skill (no degradation)

---

### Mental State System

**Dynamic attributes that change during each race:**

#### Confidence (0-100)

**Starting Value:**
```typescript
function initialConfidence(driver: Driver): number {
  const baseConfidence = driver.skills.racecraft / 2; // 0-50
  const recentPerformanceBonus = calculateRecentPerformance(); // 0-30
  return Math.min(100, baseConfidence + recentPerformanceBonus);
}
```

**Increases From:**
- Successful pass: +5
- Fast lap (top 3 lap time): +3
- Good decision outcome: +5
- Leading race: +2 per lap
- Gaining positions: +1 per position

**Decreases From:**
- Being passed: -3
- Mistake/spin: -10
- Crash: -20
- Losing positions: -2 per position
- Poor decision outcome: -5

**Performance Effects:**
- **High (80+):** +5% lap time improvement, better decision options available
- **Medium (40-79):** Normal performance
- **Low (0-39):** -5% lap time penalty, +20% mistake chance, limited decision options

**Formula:**
```typescript
const lapTimeModifier = 1.0 + ((confidence - 50) / 50) * 0.05;
```

---

#### Frustration (0-100)

**Starting Value:** Low (0-20)

**Increases From:**
- Failed pass attempt: +5
- Stuck in traffic (3+ laps): +10
- Bad luck event (tire failure): +15
- Poor decision outcome: +8
- Being lapped: +20

**Decreases From:**
- Successful maneuver: -5
- Clean racing (5 laps): -3
- Good decision: -5
- Caution period: -10
- Time passage: -1 per lap (slow natural decay)

**Composure Effect:**
```typescript
const frustrationDecayRate = 1 + (driver.skills.composure / 100);
```

**Performance Effects:**
- **Low (0-30):** Normal performance
- **Medium (31-60):** -3% to Consistency, -3% to Focus
- **High (61-100):** -10% to Consistency, -5% to Focus, +15% risky decision bias

**Formula:**
```typescript
const consistencyPenalty = frustration > 30 ? (frustration / 100) * 0.10 : 0;
```

---

#### Focus (0-100)

**Starting Value:**
```typescript
const initialFocus = (driver.skills.focus + driver.skills.stamina) / 2;
```

**Increases From:**
- Caution period (rest): +15
- Good mental state (low frustration + high confidence): +5 per lap
- Mental reset decision: +20

**Decreases From:**
- Race duration: -0.5 to -1.0 per lap (based on stamina)
- High frustration: -2 per lap
- Mistakes: -5 per mistake
- Close battles: -3 per lap in side-by-side racing

**Stamina Impact:**
```typescript
const focusDrainPerLap = (1.0 - driver.skills.stamina / 100) * 1.0;
```

**Performance Effects:**
- **High (80+):** Normal decision time, 5% mistake chance
- **Medium (40-79):** Normal performance, 10% mistake chance
- **Low (0-39):** Reduced decision time (-50%), +20% mistake chance, reaction delays

---

#### Distraction (0-100)

**Starting Value:** Low (0-10)

**Increases From:**
- External events: +10
- High frustration spillover: +5 per lap if frustration > 70
- Sustained low focus: +3 per lap if focus < 30
- Series of mistakes: +8 per mistake

**Decreases From:**
- Time: -2 per lap (natural decay)
- Clean racing: -5 per 5 clean laps
- Confidence gains: -5 when confidence increases
- Mental reset decision: -20

**Performance Effects:**
- **Low (0-30):** Normal performance
- **Medium (31-60):** -2% lap time, slower reactions
- **High (61-100):** -5% lap time, decision penalties, +25% mistake risk

**Formula:**
```typescript
const lapTimePenalty = distraction > 30 ? (distraction / 100) * 0.05 : 0;
```

---

### Mental State Interactions

**Positive Feedback Loop (Success):**
```
Good pass → +Confidence → Better performance → More good passes → Higher confidence
                ↓
           -Frustration → Better decisions → Cleaner racing
```

**Negative Feedback Loop (Struggle):**
```
Failed pass → +Frustration → Worse performance → More failed passes → Higher frustration
                   ↓
            -Confidence → Risky decisions → More mistakes → -Focus
```

**Recovery Mechanics:**

1. **Caution Periods:**
   - Reset focus: +15
   - Reduce frustration: -10
   - Slight confidence boost: +5
   - Break negative momentum

2. **Successful Decisions:**
   - Boost confidence: +5
   - Reduce distraction: -5
   - Validate player skill

3. **Clean Laps (5+ consecutive):**
   - Gradually reduce frustration: -3 per 5 laps
   - Restore confidence: +2 per 5 laps
   - Mental reset from consistency

4. **High Composure Skill:**
   - Faster recovery from all mental state penalties
   - Recovery rate: `baseRecovery * (1 + composure / 100)`
   - Breaks negative feedback loops more effectively

---

## Career Statistics

**Tracked Metrics:**

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

**Stat Updates:**
- Updated after each race completion
- Displayed in post-race summary
- Used for calculating initial confidence

**Average Finish Calculation:**
```typescript
function updateAvgFinish(stats: CareerStats, newFinish: number): number {
  return (stats.avgFinish * (stats.races - 1) + newFinish) / stats.races;
}
```

---

## Progression and Unlocks

### Track Unlocks

- **Start:** 1-2 tracks available (Bristol, Charlotte)
- **Unlock Condition:** Finish top 10 in previous track
- **Milestone Unlocks:** Win at certain tracks to unlock special tracks
- **Track Difficulty:** Harder tracks provide more XP

### Driver Advancement Milestones

| Milestone | Requirement | Reward |
|-----------|-------------|--------|
| First Win | Win any race | +100 bonus XP, achievement unlocked |
| Skill Master | Reach 100 in any skill | Special visual indicator |
| Triple Crown | Win Bristol, Charlotte, Daytona | Legendary status |
| Veteran | Complete 50 races | +10% XP gain permanently |
| Champion | Win season championship | Career mode unlocked |

### Future Unlocks (Out of Scope - Phase 2)

- Car liveries/schemes
- Historical tracks
- Legendary AI drivers
- Special challenge races
- Rival driver storylines

---

## Integration with Other Systems

### Physics System Interaction

**How Character Affects Physics:**

```typescript
// Racecraft affects lap time
const racecraftModifier = 1.0 + ((driver.skills.racecraft - 50) / 50) * 0.02;

// Mental state affects lap time
const confidenceModifier = 1.0 + ((driver.mentalState.confidence - 50) / 50) * 0.05;
const frustrationPenalty = driver.mentalState.frustration > 30
  ? (driver.mentalState.frustration / 100) * 0.10
  : 0;

// Combined modifier
const finalLapTimeModifier = racecraftModifier * confidenceModifier * (1 - frustrationPenalty);
```

### Decision System Interaction

**How Character Affects Decisions:**

- High Pit Strategy skill unlocks better decision options
- Low confidence limits available choices
- High frustration biases toward risky decisions
- Low focus reduces decision time window

**How Decisions Affect Character:**

- Successful decisions: +confidence, +XP to relevant skill
- Failed decisions: +frustration, -confidence
- Mental reset decisions: restore focus, reduce distraction

---

## Dependencies

**None** - Character system is independent (parallel to physics)

**Used By:**
- `physics/` - Character skills modify physics calculations
- `decisions/` - Character state affects decision availability and outcomes
- `ui/` - Displays character state, skills, progression
- `game-modes/` - Orchestrates XP gains and career tracking

---

## Validation

### Success Criteria

- [ ] All 10 skills measurably affect gameplay
- [ ] Mental state creates meaningful feedback loops
- [ ] Progression feels rewarding (noticeable every 2-3 races)
- [ ] Mental state recovery mechanics work effectively
- [ ] XP distribution rewards multiple play styles
- [ ] 95%+ test pass rate for character module

### Test Strategy

**Unit Tests:**
- `tests/unit/character/skills.test.ts` - Skill effects on performance
- `tests/unit/character/mental-state.test.ts` - Mental state dynamics
- `tests/unit/character/progression.test.ts` - XP and leveling
- `tests/unit/character/stats.test.ts` - Career stat tracking

**Integration Tests:**
- Character + Physics integration
- Character + Decisions integration
- Full race progression simulation

**Balance Tests:**
- Progression pacing (races to reach milestones)
- Mental state feedback loop strength
- Skill impact magnitude validation

---

## Future Enhancements

**Phase 2:**
- Rival drivers with personality traits
- Team dynamics and crew chief interactions
- Sponsor relationships and objectives

**Phase 3:**
- Multi-season championship tracking
- Driver aging and retirement
- Historical driver comparisons

**Phase 4:**
- Custom driver creation (appearance, background)
- Driver rivalries with narrative events
- Legacy system (retired driver hall of fame)

---

## Migration Notes

**Phase 3:** ✅ Complete (2025-11-16)
- ✅ Extracted character/RPG content from `docs/SPEC.md`
- ✅ Documented all skill effects and formulas
- ✅ Detailed mental state system mechanics
- ✅ XP progression and advancement formulas
- ✅ Career statistics tracking

**Benefits Achieved:**
- **Token efficiency:** ~70% reduction for character-only work
- **Clear scope:** Character system isolated from physics/UI
- **Comprehensive formulas:** All skill/mental state calculations documented
- **Ready for testing:** Complete specification for character module

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-16 | 1.0 | Phase 3 - Content migrated from monolithic docs |

---

## Cross-References

**Within Character Spec:**
- `CONTRACTS.md` - Interface documentation (Driver, DriverSkills, MentalState, XPGain)
- `EXAMPLES.md` - Progression scenarios and mental state examples
- `REFERENCE.md` - Skill progression tables and formulas

**External References:**
- `src/character/` - Implementation code (future)
- `tests/unit/character/` - Unit tests (future)
- `.claude/specs/physics/` - Physics spec (character modifies physics calculations)
- `.claude/specs/decisions/` - Decision spec (character affects decision options)
