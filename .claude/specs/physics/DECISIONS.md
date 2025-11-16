# Physics Architectural Decision Records

**Last Updated:** 2025-11-16

---

## ADR Template

### ADR-XXX: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Superseded | Deprecated]
**Deciders:** [Names/Roles]

**Context:**
What situation required a decision?

**Decision:**
What was decided?

**Consequences:**
Positive and negative outcomes of this decision.

**Alternatives Considered:**
1. Alternative A (why rejected)
2. Alternative B (why rejected)

**Related Decisions:**
- Links to related ADRs

---

## Active Decisions

### ADR-001: Pure Function Physics Pattern

**Date:** 2025-10-01
**Status:** Accepted
**Deciders:** Architecture Team

**Context:**
Need to decide between stateful physics engine (object-oriented) vs stateless pure functions.

**Decision:**
All physics calculations implemented as pure functions with no side effects.

```typescript
// Pure function - no state mutation
function calculateCornerSpeed(banking: number, radius: number, grip: number): number {
  return formula(banking, radius, grip);
}
```

**Consequences:**
**Positive:**
- Easily testable (no mocks needed)
- Predictable behavior
- No hidden dependencies
- Parallelizable
- Functional programming benefits

**Negative:**
- Must pass all parameters explicitly (no implicit state)
- Slight verbosity in function signatures

**Alternatives Considered:**
1. **Object-Oriented Physics Engine** (rejected)
   - Reason: State management complexity, harder to test, risk of side effects
2. **Singleton Pattern** (rejected)
   - Reason: Global state, testing difficulties, not parallelizable

**Related Decisions:**
- Aligns with overall layered architecture (Engine layer has no state)

---

### ADR-002: Calibration Factors vs Pure Formulas

**Date:** 2025-10-15
**Status:** Accepted
**Deciders:** Physics Team

**Context:**
Real NASCAR physics are complex. Should we use pure physics formulas (possibly inaccurate) or add calibration factors to match real data?

**Decision:**
Use simplified physics formulas with track-specific calibration factors.

**Implementation:**
```typescript
// Base formula (simplified physics)
const baseSpeed = calculateIdealSpeed(banking, radius);

// Calibration factor (tuned to real NASCAR data)
const calibratedSpeed = baseSpeed * trackCalibrationFactor;
```

**Consequences:**
**Positive:**
- Realistic results matching NASCAR data
- Easier to tune and adjust
- Can compensate for missing complexity (tire temp, etc.)
- Clear separation: formula logic vs tuning constants

**Negative:**
- Requires manual calibration per track
- Factors may mask underlying formula issues
- Risk of over-tuning (fitting to noise, not signal)

**Alternatives Considered:**
1. **Pure Physics Only** (rejected)
   - Reason: Too complex to model all NASCAR variables (tire temp, track rubber, etc.)
2. **Machine Learning Tuning** (deferred to Phase 4)
   - Reason: Overkill for current phase, harder to explain/validate

**Related Decisions:**
- ADR-003 (Validation targets)
- See `VALIDATION.md` for calibration targets

---

### ADR-003: Validation Targets from Real NASCAR Data

**Date:** 2025-10-20
**Status:** Accepted
**Deciders:** Physics Team, QA

**Context:**
How do we know if physics are "good enough"? Need objective success criteria.

**Decision:**
Define validation targets based on real NASCAR lap times and data.

**Targets:**
- Bristol: 15.5s ± 0.2s
- Charlotte: 29.5s ± 0.3s
- Daytona: 50.0s ± 0.5s

**Source:** `docs/EXAMPLES.md` (NASCAR race data, qualifying times)

**Consequences:**
**Positive:**
- Objective pass/fail criteria
- Realistic simulation
- Testable with automated tests
- Builds credibility (matches real NASCAR)

**Negative:**
- Tied to specific tracks (need validation for all tracks)
- Real NASCAR data has variance (weather, driver skill) - we use ideal conditions

**Alternatives Considered:**
1. **Arbitrary "feels right" tuning** (rejected)
   - Reason: Subjective, not testable, no grounding in reality
2. **Statistical distribution matching** (deferred to Phase 2)
   - Reason: More complex, requires full race data not just lap times

**Related Decisions:**
- ADR-002 (Calibration factors enable meeting these targets)

---

### ADR-004: Tire Wear as Piecewise Function

**Date:** 2025-11-12
**Status:** Accepted
**Deciders:** Physics Team

**Context:**
Initial tire wear formula was linear, but real NASCAR tires degrade differently at different wear levels.

**Decision:**
Use piecewise tire grip formula:
- Moderate wear (>60% grip): Gentle degradation (0.15 power)
- Severe wear (≤60% grip): Harsh degradation (0.7 power)

**Consequences:**
**Positive:**
- More realistic tire behavior
- Matches NASCAR "cliff" phenomenon (tires fall off suddenly)
- Better strategic decisions (when to pit?)

**Negative:**
- More complex formula
- Discontinuity at 60% boundary (acceptable)

**Alternatives Considered:**
1. **Linear degradation** (rejected - too simplistic)
2. **Exponential degradation** (tested, didn't match NASCAR data as well)

**Related Decisions:**
- See commit `37d73be` for implementation

---

## Proposed Decisions

None currently.

---

## Deprecated Decisions

None currently.

---

## Change Log

| Date | ADR | Change |
|------|-----|--------|
| 2025-11-16 | All | Initial ADRs documented (Phase 1) |

---

**TODO for Phase 2:**
- [ ] Document additional physics decisions from implementation
- [ ] Add ADRs for edge cases and calibration choices
- [ ] Link ADRs to specific commits/code locations
