# Decision/Event System Specification

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** Active - Phase 4 (Content Migrated, Ready for Use)
**Owner:** Gameplay Team

---

## Overview

Timed strategic decision system that presents context-aware choices to players during races. Outcomes are calculated based on driver skills, mental state, and risk level.

**Purpose:** Provide meaningful player agency through skill-based decisions that affect race outcomes and character progression.

---

## Scope

### In Scope

- **6 Decision Types:**
  - Pit Strategy (timing, tire/fuel choices)
  - Passing Opportunities (aggressive vs patient)
  - Traffic Management (handling lapped cars)
  - Incident Response (split-second avoidance)
  - Tire Management (pace vs preservation)
  - Mental State Management (composure under pressure)

- **Outcome Calculation:**
  - Skill-based success probability
  - Mental state modifiers
  - Risk/reward balance
  - Deterministic testing support

- **Effect System:**
  - Position changes (+/- positions)
  - Mental state impacts (confidence, frustration)
  - Car state changes (tire wear, fuel, damage)
  - XP rewards for good decisions

- **Trigger Logic:**
  - Context-aware decision generation
  - Frequency limits (avoid spam)
  - Priority system for multiple conditions

### Out of Scope

- **Weather-related decisions** - Phase 2 feature
- **Teammate coordination** - Future enhancement
- **Pit crew quality** - Future enhancement
- **Setup adjustments during race** - Future enhancement

---

## Requirements

### Functional Requirements

1. **FR-1:** Decisions must trigger at appropriate race moments
   - Pit decisions when fuel/tires low
   - Passing decisions when stuck behind cars
   - Mental state decisions when frustration/distraction high

2. **FR-2:** Outcomes must be skill-based, not random
   - High-skill drivers succeed more often on risky choices
   - Low-skill drivers fail more often
   - Mental state affects success probability

3. **FR-3:** Time limits must scale with decision complexity
   - Routine decisions: 10-15 seconds
   - Tactical decisions: 5-8 seconds
   - Emergency decisions: 2-4 seconds
   - Reduced time under stress (low focus/high frustration)

4. **FR-4:** Effects must be applied consistently
   - Position changes reflect strategic outcomes
   - Mental state changes create feedback loops
   - XP rewards encourage good decision-making

5. **FR-5:** Default options must be conservative
   - Auto-selected if player doesn't respond
   - Prevents catastrophic failures from timeout
   - Allows learning without punishment

### Non-Functional Requirements

1. **NFR-1 Testability:** Outcome calculation must be deterministic for testing
2. **NFR-2 Balance:** No decision type should dominate strategy
3. **NFR-3 Frequency:** 1-3 decisions per 10 laps (not overwhelming)
4. **NFR-4 Clarity:** Players understand why decisions succeeded/failed
5. **NFR-5 Performance:** Decision evaluation <1ms per decision

---

## Design

### Architecture

```
DecisionManager (implements DecisionManager interface)
├── DecisionGenerator (creates decisions based on race state)
├── DecisionEvaluator (calculates outcomes based on skills)
└── DecisionLibrary (predefined decision templates)
```

**Design Principles:**
1. **Skill-based outcomes** - Success probability based on relevant driver skills
2. **Context-aware** - Decisions triggered at appropriate race moments
3. **Risk/reward balance** - Higher risk = greater potential reward/penalty
4. **Mental state integration** - Outcomes affect confidence, frustration, focus
5. **Testable** - Pure functions for outcome calculation

---

## Decision Types

### 1. Pit Strategy (`pit-strategy`)

**Trigger Conditions:**
- Lap 50+ AND (tires < 60% OR fuel < 40%)
- Caution flag with pit window opportunity
- Strategic pit window approaching

**Prompt:** "Do you want to pit this lap?"

**Options:**
1. **Pit now (4 tires + fuel)** - Risk: Low
   - Lose track position during stop
   - Gain fresh tires and full fuel
   - Safe, conservative choice
2. **Stay out** - Risk: Medium/High
   - Maintain track position
   - Risk running out of fuel/worn tires
   - Gamble on caution or others pitting
3. **Fuel only (splash and go)** - Risk: Medium
   - Quick stop (~6s vs ~12s)
   - Compromise: fuel solved, tires still worn
   - Tactical middle ground

**Relevant Skills:**
- `pitStrategy` (primary): Decision quality, strategic insight
- `racecraft`: Overall racing sense

**Outcome Factors:**
- Fuel remaining vs laps to go
- Tire condition vs race pace
- Position on track (lead lap vs lapped)
- Field behavior (who else is pitting)

**Default:** Pit if fuel < 20% or tires < 40%

---

### 2. Passing Opportunities (`passing`)

**Trigger Conditions:**
- Been behind same car for 10+ laps
- Speed differential >2 MPH
- Track section suitable for passing

**Prompt:** "Car ahead is slow in turn 2. Attempt pass?"

**Options:**
1. **Aggressive pass** - Risk: High
   - Dive inside, force the issue
   - High reward: +1-3 positions if successful
   - High penalty: Contact, spin, or no change if failed
2. **Patient approach** - Risk: Low
   - Wait for mistake or better opportunity
   - Moderate reward: +1 position eventually
   - Safe: Minimal risk of contact
3. **Stay behind and draft** - Risk: None
   - Build run for later attempt
   - Reward: Maintain position, draft fuel savings
   - Conservative: No positions lost

**Relevant Skills:**
- `racecraft` (primary): Overtaking ability
- `aggression`: Risk tolerance, willingness to commit
- `focus`: Mistake avoidance during maneuver

**Outcome Factors:**
- Tire grip differential (fresh vs worn)
- Mental state (confidence enables risk, frustration biases aggression)
- Track section (straights easier than corners)
- Speed differential (larger gap = easier pass)

**Default:** Patient approach

---

### 3. Traffic Management (`traffic-management`)

**Trigger Conditions:**
- Lapped car ahead blocking line
- Blue flag situation
- Lap time being impacted by slower traffic

**Prompt:** "Lapped car ahead blocking your line. How to handle?"

**Options:**
1. **Aggressive move** - Risk: High
   - Quick but risky
   - Force way past
   - Risk contact with lapped car
2. **Signal and wait** - Risk: Low
   - Safer, loses time
   - Rely on blue flag respect
   - Conservative approach
3. **Find alternate line** - Risk: Medium
   - Moderate risk/reward
   - Use different racing line
   - Tactical solution

**Relevant Skills:**
- `racecraft` (primary): Traffic navigation
- `focus`: Awareness of surroundings
- `composure`: Patience under frustration

**Outcome Factors:**
- Current mental state (frustration makes aggressive bias)
- Championship implications (safety vs risk)
- Lapped car behavior (respectful vs blocking)

**Default:** Signal and wait

---

### 4. Incident Response (`incident-response`)

**Trigger Conditions:**
- Car spun ahead
- Accident developing
- Debris on track

**Prompt:** "Car spun ahead! Which line?"

**Options:**
1. **High line** - Risk: Medium
   - Avoids smoke, possible debris
   - Longer distance
   - Safer visibility
2. **Low line** - Risk: High
   - Shorter distance
   - Possible contact with spinning car
   - Faster if clear
3. **Brake hard** - Risk: Low
   - Safest, avoid incident entirely
   - Lose positions to cars behind
   - Conservative choice

**Relevant Skills:**
- `focus` (primary): Reaction time, awareness
- `racecraft`: Decision-making under pressure
- `composure`: Calm under stress

**Outcome Factors:**
- Focus level (low focus = reduced decision time -50%)
- Reflexes (derived from driver skills)
- Confidence (affects risk tolerance)

**Default:** Brake hard

**Time Limit:** 2-4 seconds (emergency decision)

---

### 5. Tire Management (`tire-management`)

**Trigger Conditions:**
- Tires < 50% AND laps to next pit window > 20
- Tire wear rate exceeding expected
- Strategic tire conservation needed

**Prompt:** "Tires at 60%, 50 laps remain. Adjust driving?"

**Options:**
1. **Push hard** - Risk: Medium
   - Maintain pace, faster wear
   - Risk being forced to pit early
   - Aggressive choice
2. **Conserve tires** - Risk: Low
   - Slower pace, preserve grip
   - May lose positions short-term
   - Strategic long-term play
3. **Balanced approach** - Risk: Low
   - Moderate pace/wear
   - Compromise solution
   - Default choice

**Relevant Skills:**
- `tireManagement` (primary): Preservation ability
- `consistency`: Even pace reduces wear
- `focus`: Smooth driving technique

**Outcome Factors:**
- Track position (leading vs chasing)
- Fuel strategy (coordinating pit windows)
- Tire wear rate (aggressive driving compounds wear)

**Default:** Balanced approach

---

### 6. Mental State Management (`mental-state`)

**Trigger Conditions:**
- Frustration > 70 OR distraction > 60
- After series of failed maneuvers
- Performance declining due to mental state

**Prompt:** "Frustration building after 3 failed passes. Response?"

**Options:**
1. **Take a breath, refocus** - Risk: Low
   - Reduces frustration significantly (-20)
   - Restores focus (+10)
   - May lose positions while calming
2. **Keep pushing** - Risk: Medium
   - Maintain position
   - Frustration continues/increases
   - Risk further mistakes
3. **Get aggressive** - Risk: High
   - All-or-nothing approach
   - Could succeed brilliantly or fail spectacularly
   - High variance outcome

**Relevant Skills:**
- `composure` (primary): Emotional control, recovery rate
- `focus`: Mental clarity
- `stamina`: Mental endurance

**Outcome Factors:**
- Composure skill (high composure = faster recovery)
- Current mental state levels
- Race importance (championship pressure)

**Default:** Take a breath

---

## Outcome Calculation

### Success Probability Formula

```typescript
function calculateSuccessProbability(
  decision: Decision,
  optionChosen: DecisionOption,
  driver: Driver
): number {
  // Base chance: 50/50
  let baseChance = 0.50;

  // Skill modifier (primary skill for decision type)
  const primarySkill = getPrimarySkill(decision.type, driver.skills);
  const skillBonus = (primarySkill - 50) * 0.005; // -0.25 to +0.25

  // Mental state modifier
  const confidence = driver.mentalState.confidence;
  const frustration = driver.mentalState.frustration;
  const mentalModifier = ((confidence - frustration) / 100) * 0.10; // -0.10 to +0.10

  // Risk adjustment
  const riskPenalty = optionChosen.riskLevel === 'high' ? -0.15 :
                      optionChosen.riskLevel === 'medium' ? -0.05 : 0;

  // Calculate final probability
  const successChance = baseChance + skillBonus + mentalModifier + riskPenalty;

  // Clamp to 5-95% (always some chance of success/failure)
  return Math.max(0.05, Math.min(0.95, successChance));
}
```

**Skill Mapping by Decision Type:**
| Decision Type | Primary Skill | Secondary Skills |
|---------------|---------------|------------------|
| `pit-strategy` | `pitStrategy` | `racecraft` |
| `passing` | `racecraft` | `aggression`, `focus` |
| `traffic-management` | `racecraft` | `focus`, `composure` |
| `incident-response` | `focus` | `racecraft`, `composure` |
| `tire-management` | `tireManagement` | `consistency`, `focus` |
| `mental-state` | `composure` | `focus`, `stamina` |

---

## Effect System

### Outcome Types

**Success:**
- Positive effects (positions gained, mental boost, XP)
- Reinforces good decision-making
- Message: "Great move! You gained 2 positions"

**Neutral:**
- Minimal effects (maintained position, slight mental change)
- Safe outcome, no major gain or loss
- Message: "Steady choice, no change"

**Failure:**
- Negative effects (positions lost, frustration increase, possible damage)
- Consequence of risk or poor execution
- Message: "Risky move didn't pay off. Lost 1 position"

### Effect Magnitudes

**Position Changes:**
- Success on passing: +1 to +3 positions
- Failure on passing: -1 position or no change
- Pit timing: Depends on field behavior (+/- 3-5 positions)

**Mental State Changes:**
- **Confidence:** +5 to +15 on success, -5 to -10 on failure
- **Frustration:** -10 on success, +10 to +20 on failure
- **Focus:** +5 on calm decisions, -5 on aggressive failures
- **Distraction:** -10 on focus decisions, +5 on failures

**Car State Changes:**
- **Tire wear:** Aggressive = +5% wear, Conservative = -3% wear
- **Fuel:** Efficient driving = -2% consumption
- **Damage:** Failed aggressive moves = 5-15% damage

### XP Rewards

Good decisions earn XP in relevant skills:

| Decision Type | Success XP | Skill(s) |
|---------------|------------|----------|
| Pit Strategy | +10 to +20 | `pitStrategy` |
| Successful Pass | +15 | `racecraft` |
| Aggressive Pass | +5 | `aggression` |
| Tire Management | +10 | `tireManagement` |
| Mental Recovery | +10 to +20 | `composure`, `focus` |
| Calm Decision | +10 | `composure` |

---

## Decision Timing

### Frequency Limits

**Decision frequency:** 1-3 decisions per 10 laps (varies by race situation)

**Cooldown:** Minimum 10 laps between decisions (prevents spam)

**Priority:** If multiple conditions met, highest priority triggers first:
1. Emergency (incident-response)
2. Critical (mental-state if frustration >80)
3. Strategic (pit-strategy during caution)
4. Tactical (passing, traffic, tire-management)

### Time Limits

**By Decision Complexity:**
- Routine decisions (pit strategy, tire mgmt): 10-15 seconds
- Tactical decisions (passing, traffic): 5-8 seconds
- Emergency decisions (incidents): 2-4 seconds
- Mental state decisions: 8-12 seconds

**Stress Modifiers (Reduced Time):**
- Low focus (<40): -30% decision time
- High frustration (>60): -20% decision time
- High distraction (>60): -25% decision time

**Example:**
```
Base decision time: 10 seconds
Driver focus: 30 (low)
Adjusted time: 10 * 0.70 = 7 seconds
```

---

## Integration Points

### With Character System

**Dependencies:**
- Driver skills determine success probability
- Mental state modifies outcomes
- XP rewards improve skills

**Effects:**
- Decision outcomes change mental state
- Mental state affects future decision success
- Feedback loops (positive/negative spirals)

### With Physics System

**Dependencies:**
- Tire/fuel state determines decision triggers
- Car state affects decision context

**Effects:**
- Decisions change car state (tire wear, fuel, damage)
- Physics calculations use updated car state

### With Race Engine

**Integration Flow:**
1. **After each lap:** Call `DecisionManager.shouldTriggerDecision()`
2. **If decision triggered:** Pause race loop
3. **Present decision:** Call `UIRenderer.promptDecision()`
4. **Get player choice:** Wait for input (with timeout)
5. **Evaluate:** Call `DecisionManager.evaluateDecision()`
6. **Apply effects:** Update `RaceState` with results
7. **Continue race:** Resume lap simulation

---

## Testing Strategy

### Unit Tests

**Decision Generation:**
- Test trigger conditions
- Test priority system
- Test cooldown logic

**Outcome Calculation:**
- Test success probability formula
- Test skill bonus calculations
- Test mental state modifiers
- Test risk adjustments

**Effect Application:**
- Test position changes
- Test mental state updates
- Test car state changes
- Test XP rewards

### Integration Tests

- Test decision flow in race context
- Test multiple decisions in sequence
- Test timeout behavior (default option)
- Test decision frequency limits

---

## Dependencies

**Depends On:**
- `character/` - Driver skills and mental state
- `physics/` - Car state (tires, fuel) for triggers

**Used By:**
- `game-modes/` - Orchestrates decision flow during races
- `ui/` - Displays decision prompts and results

---

## Validation

### Success Criteria

- [ ] Decisions trigger at appropriate race moments
- [ ] Outcomes based on driver skills (not random)
- [ ] High-skill drivers succeed more often on risky choices
- [ ] Effects applied correctly to race state
- [ ] XP rewards encourage skill development
- [ ] 95%+ test pass rate for decisions module

---

## Future Enhancements

**Phase 2:**
- Weather-related decisions (rain tire choice, visibility)
- Teammate coordination (blocking, drafting help)
- Pit crew quality variations

**Phase 3:**
- Setup adjustments during race (downforce, tire pressure)
- Advanced pit strategy (overcut, undercut tactics)
- Multi-car incident decisions

---

## Migration Notes

**Phase 4:** ✅ Complete (2025-11-16)
- ✅ Migrated from `.claude/design/decision-system.md`
- ✅ Extracted decision types from `docs/SPEC.md`
- ✅ Documented outcome calculation formulas
- ✅ Specified effect system
- ✅ Integration points defined

**Benefits Achieved:**
- **Token efficiency:** ~65% reduction for decisions-only work
- **Complete specification:** All 6 decision types documented
- **Outcome formulas:** Skill-based calculation fully specified
- **Ready for implementation:** Clear architecture and integration

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-16 | 1.0 | Phase 4 - Content migrated from design doc and monolithic docs |

---

## Cross-References

**Within Decisions Spec:**
- `CONTRACTS.md` - Interface documentation (Decision, DecisionOption, DecisionResult, etc.)
- `EXAMPLES.md` - Decision scenarios and test cases
- `REFERENCE.md` - Decision type reference table, outcome probabilities

**External References:**
- `src/events/` - Implementation code
- `tests/unit/events/` - Unit tests
- `.claude/specs/character/` - Character spec (skills, mental state)
- `.claude/specs/physics/` - Physics spec (car state)
