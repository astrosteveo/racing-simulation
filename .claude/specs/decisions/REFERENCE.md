# Decision System Reference

**Last Updated:** 2025-11-16
**Phase:** Phase 4 - Complete

---

## Decision Types Quick Reference

| Type | Primary Skill | Time Limit | Trigger Condition | Risk Penalty |
|------|---------------|------------|-------------------|--------------|
| `pit-strategy` | `pitStrategy` | 10-15s | Lap 50+, tires<60% OR fuel<40% | Low: 0%, Med: -5% |
| `passing` | `racecraft` | 5-8s | Stuck behind 10+ laps | High: -15% |
| `traffic-management` | `racecraft` | 5-8s | Lapped car blocking | Med: -5% |
| `incident-response` | `focus` | 2-4s | Car spun ahead | High: -15% |
| `tire-management` | `tireManagement` | 10-15s | Tires<50%, 20+ laps to pit | Low: 0% |
| `mental-state` | `composure` | 8-12s | Frustration>70 OR distraction>60 | Low: 0% |

---

## Success Probability Formula

```typescript
baseChance = 0.50  // 50/50
skillBonus = (primarySkill - 50) * 0.005  // -25% to +25%
mentalMod = ((confidence - frustration) / 100) * 0.10  // -10% to +10%
riskPenalty = {low: 0%, medium: -5%, high: -15%}

successChance = clamp(baseChance + skillBonus + mentalMod + riskPenalty, 5%, 95%)
```

---

## Effect Magnitudes

### Position Changes
- Success passing: +1 to +3
- Failure passing: -1 or 0
- Pit timing: +/- 3-5 (depends on field)

### Mental State Changes
- Confidence: +5 to +15 (success), -5 to -10 (failure)
- Frustration: -10 (success), +10 to +20 (failure)
- Focus: +5 (calm decisions), -5 (aggressive failures)
- Distraction: -10 (focus decisions), +5 (failures)

### Car State Changes
- Tire wear: +5% (aggressive), -3% (conservative)
- Fuel: -2% (efficient driving)
- Damage: 5-15% (failed aggressive)

### XP Rewards
- Pit Strategy: +10 to +20
- Successful Pass: +15 racecraft, +5 aggression
- Tire Management: +10
- Mental Recovery: +10 to +20 composure/focus

---

## Stress Time Modifiers

Base decision time reduced by:
- Low focus (<40): -30%
- High frustration (>60): -20%
- High distraction (>60): -25%

---

**Cross-references:** SPEC.md (detailed formulas), EXAMPLES.md (test scenarios)
