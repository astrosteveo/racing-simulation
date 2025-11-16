# Physics Examples & Test Scenarios

**Last Updated:** 2025-11-16
**Phase:** Phase 1 - Foundation (Template Created)

---

## Overview

Test scenarios and examples demonstrating expected physics behavior.

**Purpose:**
- Define expected outcomes for validation
- Provide test cases for automated testing
- Document realistic NASCAR scenarios

---

## Example Format

### Example N: [Scenario Name]

**Purpose:** What this tests/demonstrates

**Given:**
- Precondition 1
- Precondition 2

**When:**
- Action or calculation performed

**Then:**
- Expected outcome 1
- Expected outcome 2

**Test Code:**
```typescript
it('should...', () => {
  // Test implementation
});
```

---

## TODO for Phase 2

**Migrate from `docs/EXAMPLES.md`:**
- Extract physics-specific examples (Examples 1-4)
- Example 1: Clean lap at Bristol
- Example 2: Tire wear impact
- Example 3: Drafting effect at Daytona
- Example 4: Mental state performance impact (physics portion only)

**New Examples to Add:**
- Fuel weight impact demonstration
- Corner speed with different banking angles
- Side-by-side racing penalties
- Fresh tire advantage scenarios

---

## Validation Targets Table

**TODO:** Migrate validation targets from `docs/EXAMPLES.md`

| Scenario | Target Value | Tolerance | Current | Status |
|----------|--------------|-----------|---------|--------|
| Bristol clean lap | 15.5s | ±0.2s | 15.4s | ✅ Pass |
| Charlotte clean lap | 29.5s | ±0.3s | 29.6s | ✅ Pass |
| Daytona clean lap | 50.0s | ±0.5s | 50.2s | ✅ Pass |
| Tire wear (50 laps) | +0.5-0.7s | - | TBD | ⏳ Pending |
| Draft speed boost | +3-5 mph | - | TBD | ⏳ Pending |
| Fuel weight (full tank) | +0.54s | - | TBD | ⏳ Pending |

---

**Phase 1 Status:** Template created, awaiting Phase 2 content migration
