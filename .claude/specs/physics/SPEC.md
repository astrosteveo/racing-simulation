# Physics Engine Specification

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** Active - Phase 1 (Structure Created, Content Pending Migration)
**Owner:** Physics Team

---

## Overview

NASCAR Cup Series car physics simulation engine for calculating realistic lap times, tire degradation, fuel consumption, and aerodynamic effects.

**Purpose:** Provide the foundational physics calculations that drive race outcomes, ensuring simulation accuracy matches real NASCAR data.

---

## Scope

### In Scope

- **Tire Physics**
  - Grip degradation over lap life
  - Track-specific wear rates (short/intermediate/superspeedway)
  - Impact on corner speeds and lap times

- **Fuel System**
  - Fuel consumption rates by track type
  - Fuel weight impact on lap times
  - Drafting fuel savings

- **Aerodynamics**
  - Drafting speed boost and optimal distance
  - Downforce calculations at speed
  - Side-by-side racing penalties

- **Lap Time Calculation**
  - Section-by-section track simulation
  - Banking effects on corner speed
  - Integration of tire/fuel/aero effects

- **Corner Speed Formula**
  - Banking angle physics
  - Tire grip coefficients
  - Downforce integration

### Out of Scope

- **Weather effects** (rain, temperature) - Phase 2 feature
- **Mechanical failures** (engine, suspension) - Phase 2 feature
- **Telemetry/data collection** - UI spec responsibility
- **Setup variations** (downforce, gear ratios) - Future enhancement

---

## Requirements

### Functional Requirements

1. **FR-1:** System must calculate lap times within ±0.2s of NASCAR validation targets
   - Bristol: 15.5s ± 0.2s
   - Charlotte: 29.5s ± 0.3s
   - Daytona: 50.0s ± 0.5s

2. **FR-2:** Tire wear must degrade grip linearly from 100% (fresh) to 50% (worn) over tire life
   - Short track life: 80-100 laps
   - Intermediate life: 100-120 laps
   - Superspeedway life: 120-150 laps

3. **FR-3:** Drafting must provide 3-5 mph speed boost at optimal distance (1.5 car lengths)

4. **FR-4:** Fuel weight must add 0.03s per gallon per lap

5. **FR-5:** Corner speed must scale with banking angle per real NASCAR physics

### Non-Functional Requirements

1. **NFR-1 Performance:** Calculate lap time in <1ms per driver per lap
2. **NFR-2 Test

ability:** All formulas must be unit-testable in isolation
3. **NFR-3 Accuracy:** Physics calculations must match real NASCAR data within tolerances
4. **NFR-4 Maintainability:** Calibration factors separated from core formulas
5. **NFR-5 Documentation:** All constants documented with NASCAR reference sources

---

## Design

### Architecture

**Pure Function Pattern:**
All physics calculations are pure functions with no side effects.

```typescript
// Input → Calculation → Output (no state mutation)
function calculateCornerSpeed(
  banking: number,
  radius: number,
  tireGrip: number
): number {
  // Pure physics calculation
}
```

**Benefits:**
- Easily testable
- Predictable behavior
- No hidden dependencies
- Can run in parallel

### Key Components

1. **src/engine/physics/speed.ts**
   - Corner speed calculations
   - Straight speed calculations
   - Banking physics

2. **src/engine/physics/tires.ts**
   - Tire grip calculation
   - Wear rate formulas
   - Track-specific degradation

3. **src/engine/physics/fuel.ts**
   - Fuel consumption by track type
   - Weight penalty calculation
   - Draft fuel savings

4. **src/engine/physics/aerodynamics.ts**
   - Draft speed boost
   - Downforce calculations
   - Side-by-side penalties

5. **src/engine/physics/laptime.ts**
   - Orchestrates all physics systems
   - Section-by-section lap simulation
   - Calibration factor application

### Key Interfaces

See `CONTRACTS.md` for detailed interface documentation.

**Primary Contracts:**
- `Track` - Track specifications (banking, sections, surface)
- `Car State` - Current car condition (tires, fuel)
- `PhysicsConstants` - NASCAR-specific constants

**Implementation:** `src/types.ts`

### Algorithms

**TODO:** Migrate from `docs/PHYSICS-REFERENCE.md` and `docs/SPEC.md` (Physics sections)

**Key Formulas:**
- Corner speed with banking
- Tire degradation curves
- Fuel consumption rates
- Draft effect distance function
- Lap time integration

---

## Dependencies

**None** - Physics is the bottom of the dependency stack.

**Used By:**
- `decisions/` - Decision outcomes affect physics state (tire wear, fuel)
- `game-modes/` - Orchestrates physics simulation in race loop
- `ui/` - Displays physics-derived data (lap times, positions)

---

## Validation

### Success Criteria

- [ ] All lap time targets met (Bristol, Charlotte, Daytona)
- [ ] Tire wear rates match NASCAR data
- [ ] Drafting provides realistic speed boost
- [ ] Fuel consumption accurate across track types
- [ ] 95%+ test pass rate for physics module

### Test Strategy

**Unit Tests:** Pure function validation
- `tests/unit/physics/speed.test.ts`
- `tests/unit/physics/tires.test.ts`
- `tests/unit/physics/fuel.test.ts`
- `tests/unit/physics/aerodynamics.test.ts`
- `tests/unit/physics/laptime.test.ts`

**Validation Tests:** Real NASCAR data comparison
- See `EXAMPLES.md` for scenarios
- See `VALIDATION.md` for targets

**Calibration Agent:** `nascar-physics-calibrator`
- Located: `.claude/agents/nascar-physics-calibrator.md`
- Use when physics tests fail or drift from targets

---

## Future Enhancements

**Phase 2:**
- Weather effects (rain, temperature impact)
- Track temperature variation
- Tire temperature modeling

**Phase 3:**
- Mechanical failures (probabilistic)
- Damage modeling (affecting downforce/drag)
- Pit stop time variations

**Phase 4:**
- Setup adjustments (downforce, gear ratios, spring rates)
- Advanced aerodynamics (dirty air zones)
- Multi-car aerodynamic interactions

---

## Migration Notes

**Phase 1:** Structure created, templates in place
**Phase 2:** Content migration planned
- Extract physics sections from `docs/SPEC.md`
- Move `docs/PHYSICS-REFERENCE.md` → `REFERENCE.md`
- Extract physics examples from `docs/EXAMPLES.md` → `EXAMPLES.md`
- Create physics-specific `TASKS.md` from `.claude/TASKS.md`
- Document physics ADRs in `DECISIONS.md`

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-16 | 1.0 | Initial spec structure created (Phase 1 - Foundation) |

---

**TODO for Phase 2:**
- [ ] Migrate physics content from `docs/SPEC.md`
- [ ] Move `docs/PHYSICS-REFERENCE.md` to this spec
- [ ] Extract physics examples to `EXAMPLES.md`
- [ ] Create physics-specific `TASKS.md`
- [ ] Document key physics decisions in `DECISIONS.md`
- [ ] Update all cross-references and links
