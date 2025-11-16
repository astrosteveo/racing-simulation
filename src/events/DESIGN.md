# Decision System Architecture

## Overview

The Decision System presents timed strategic choices to the player during races. Outcomes are calculated based on driver skills, mental state, and race context.

## Design Principles

1. **Skill-based outcomes** - Success probability based on relevant driver skills
2. **Context-aware** - Decisions triggered at appropriate race moments
3. **Risk/reward balance** - Higher risk = greater potential reward/penalty
4. **Mental state integration** - Outcomes affect confidence, frustration, focus
5. **Testable** - Pure functions for outcome calculation

## Architecture

```
DecisionManager (implements DecisionManager interface)
├── DecisionGenerator (creates decisions based on race state)
├── DecisionEvaluator (calculates outcomes based on skills)
└── DecisionLibrary (predefined decision templates)
```

## Decision Types

### 1. Pit Strategy (`pit-strategy`)
**When:** Lap 50+, tires < 60% OR fuel < 40%
**Skills:** `pitStrategy`, `racecraft`
**Options:**
- Pit now (4 tires + fuel) - Safe, loses track position
- Stay out - Risky if low on tires/fuel
- Fuel only - Quick stop, compromises tires

### 2. Passing Opportunity (`passing`)
**When:** Been behind same car for 10+ laps
**Skills:** `racecraft`, `aggression`, `focus`
**Options:**
- Aggressive pass - High risk, high reward
- Patient approach - Wait for mistake
- Stay behind and draft - Safe, maintain position

### 3. Mental State Management (`mental-state`)
**When:** Frustration > 70 OR distraction > 60
**Skills:** `composure`, `focus`
**Options:**
- Push harder - Risk more mistakes
- Calm down and focus - Lose time but recover mentally
- Maintain current pace - Neutral

### 4. Tire Management (`tire-management`)
**When:** Tires < 50%, laps to next pit window > 20
**Skills:** `tireManagement`, `consistency`
**Options:**
- Conserve tires (slow down) - Save tires, lose positions
- Manage carefully - Balance speed and wear
- Push through - Fast but increases wear

## Outcome Calculation

### Success Probability Formula

```typescript
baseChance = 50% // Default 50/50

// Skill modifier (primary skill)
skillBonus = (driverSkill - 50) * 0.5  // -25% to +25%

// Mental state modifier
mentalModifier = (confidence - frustration) * 0.1  // -10% to +10%

// Risk adjustment
riskPenalty = riskLevel === 'high' ? -15% :
              riskLevel === 'medium' ? -5% : 0%

successChance = clamp(baseChance + skillBonus + mentalModifier + riskPenalty, 5%, 95%)
```

### Outcomes

**Success:**
- Positive effects (positions gained, mental boost, XP)
- Message: "Great move! You gained 2 positions"

**Neutral:**
- Minimal effects (maintained position, slight mental change)
- Message: "Steady choice, no change"

**Failure:**
- Negative effects (positions lost, frustration increase, possible damage)
- Message: "Risky move didn't pay off. Lost 1 position"

## Effects Application

### Position Changes
- Success on passing: +1 to +3 positions
- Failure on passing: -1 position or no change
- Pit timing: Track position depends on field behavior

### Mental State Changes
- **Confidence:** +5 to +15 on success, -5 to -10 on failure
- **Frustration:** -10 on success, +10 to +20 on failure
- **Focus:** +5 on calm decisions, -5 on aggressive failures
- **Distraction:** -10 on focus decisions, +5 on failures

### Car State Changes
- **Tire wear:** Aggressive = +5% wear, Conservative = -3% wear
- **Fuel:** Efficient driving = -2% consumption
- **Damage:** Failed aggressive moves = 5-15% damage

## XP Rewards

Good decisions earn XP in relevant skills:

- **Pit Strategy Decision:** +10 to +20 `pitStrategy` XP
- **Successful Pass:** +15 `racecraft` XP, +5 `aggression` XP
- **Tire Management:** +10 `tireManagement` XP
- **Mental Recovery:** +10 `composure` XP

## Decision Trigger Logic

```typescript
shouldTriggerDecision(state: RaceState): Decision | null {
  // Don't trigger decisions too frequently
  if (state.currentLap - lastDecisionLap < 10) return null;

  // Check pit window
  if (needsPit(state.playerCar, state.currentLap)) {
    return generatePitDecision(state);
  }

  // Check stuck behind car
  if (stuckBehindCar(state, 10)) {
    return generatePassingDecision(state);
  }

  // Check mental state crisis
  if (state.playerDriver.mentalState.frustration > 70) {
    return generateMentalStateDecision(state);
  }

  // Check tire management
  if (tiresCritical(state.playerCar, state.lapsToGo)) {
    return generateTireManagementDecision(state);
  }

  return null;
}
```

## Integration with Race Engine

1. **After each lap:** Call `DecisionManager.shouldTriggerDecision()`
2. **If decision triggered:** Pause race loop, call `UIRenderer.promptDecision()`
3. **Get player choice:** Wait for input (with timeout)
4. **Evaluate:** Call `DecisionManager.evaluateDecision()`
5. **Apply effects:** Update `RaceState` with decision results
6. **Continue race:** Resume lap simulation

## Testing Strategy

### Unit Tests
- Test decision generation logic
- Test outcome probability calculations
- Test effect application

### Integration Tests
- Test decision flow in race context
- Test multiple decisions in sequence
- Test timeout behavior

### Example Test Cases
```typescript
describe('DecisionEvaluator', () => {
  it('should favor skilled drivers for risky decisions', () => {
    const skilledDriver = { racecraft: 85, ... };
    const rookieDriver = { racecraft: 35, ... };

    const decision = createPassingDecision();
    const choice = 'aggressive-pass';

    const skillResult = evaluateDecision(decision, choice, skilledDriver);
    const rookieResult = evaluateDecision(decision, choice, rookieDriver);

    expect(skillResult.outcome).toBe('success');
    expect(rookieResult.outcome).toBe('failure');
  });
});
```

## Implementation Order

1. ✅ Design document (this file)
2. Decision templates (library of predefined decisions)
3. DecisionEvaluator (outcome calculation)
4. DecisionGenerator (context-based triggering)
5. DecisionManager (orchestration)
6. Integration with RaceEngine
7. UI connection (already stubbed)
8. Tests for all components
9. End-to-end race with decisions

## Success Criteria

- ✅ Decisions trigger at appropriate race moments
- ✅ Outcomes based on driver skills (not random)
- ✅ Effects applied correctly to race state
- ✅ UI displays decision prompts with countdown
- ✅ Tests validate decision logic
- ✅ Player can complete race with multiple decisions
