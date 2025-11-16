# Physics Engine Specification

**Version:** 1.1
**Last Updated:** 2025-11-16
**Status:** Active - Phase 2 (Content Migrated, Ready for Use)
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

#### 1. Vehicle Dynamics

**Speed Calculation:**
```typescript
max_speed = f(horsepower, drag_coefficient, weight, altitude)
corner_speed = f(banking, radius, tire_grip, downforce, driver_skill)
acceleration = f(horsepower, weight, tire_grip, driver_skill)
```

**Tire Physics:**
- Grip level: 100% (fresh) → 50% (worn out)
- Degradation rate: f(aggression, track_surface, temperature, compound)
- Effect on performance:
  - Corner speed: Linear reduction with wear
  - Acceleration: Affected below 70% grip
  - Braking: Affected below 80% grip

**Tire Grip Calculation:**
```typescript
function calculateTireGrip(
  lapsOnTires: number,
  trackType: 'short' | 'intermediate' | 'superspeedway'
): number {
  const tireLife = trackType === 'short' ? 100 :
                   trackType === 'intermediate' ? 120 : 140;

  const gripRemaining = Math.max(0.5, 1.0 - (lapsOnTires / tireLife) * 0.5);
  return gripRemaining; // 1.0 (fresh) to 0.5 (worn out)
}
```

**Fuel System:**
- Tank capacity: ~18 gallons (NASCAR spec)
- Consumption rate: f(throttle_position, draft_status, track_type)
- Weight effect: -0.03s per lap per gallon (fuel weight impacts speed)
- Empty tank warning: Last 5 laps worth of fuel

**Fuel Weight Penalty:**
```typescript
function calculateFuelWeightPenalty(gallonsRemaining: number): number {
  return gallonsRemaining * 0.03; // seconds added to lap time
}
```

#### 2. Aerodynamics

**Drafting:**
- Draft zone: 2-3 car lengths behind leader
- Speed boost: +3-5 mph in draft zone
- Fuel saving: -10% consumption in draft
- Distance calculation: Updated per track section

**Draft Speed Boost:**
```typescript
function calculateDraftSpeedBoost(distanceBehindCarLengths: number): number {
  const maxDraftBoost = 4; // mph
  const optimalDistance = 1.5; // car lengths

  if (distanceBehindCarLengths > 2.5) return 0;

  const boost = maxDraftBoost * (1 - Math.abs(distanceBehindCarLengths - optimalDistance) / optimalDistance);
  return Math.max(0, boost);
}
```

**Side-by-Side Racing:**
- Reduced aerodynamic efficiency: -2% speed for both cars
- Increased tire wear: +10% for both cars
- Affects corner entry and exit speeds

**Clean Air:**
- Full aerodynamic efficiency
- Normal tire wear
- Base speed calculations apply

**Downforce Scaling:**
```typescript
function calculateDownforce(
  velocity: number,
  baseDownforce: number
): number {
  const referenceVelocity = 200; // mph
  const normalizedVelocity = velocity / referenceVelocity;
  return baseDownforce * Math.pow(normalizedVelocity, 2);
}
```

#### 3. Track Physics

**Banking:**
```typescript
corner_speed = base_speed * (1 + banking_angle / 45°)
```
Higher banking allows higher corner speeds.

**Corner Speed Formula:**
```typescript
function calculateMaxCornerSpeed(
  bankingAngleDegrees: number,
  cornerRadiusFeet: number,
  tireGripCoefficient: number
): number {
  const bankingRad = bankingAngleDegrees * (Math.PI / 180);
  const g = 32.174; // ft/s²

  const numerator = Math.sin(bankingRad) + tireGripCoefficient * Math.cos(bankingRad);
  const denominator = Math.cos(bankingRad) - tireGripCoefficient * Math.sin(bankingRad);

  const vSquared = cornerRadiusFeet * g * (numerator / denominator);
  const velocityFtPerSec = Math.sqrt(vSquared);

  return velocityFtPerSec * 0.681818; // Convert to mph
}
```

**Track Surface:**
- Grip multiplier: 0.8 (old surface) → 1.0 (new surface)
- Affects tire wear rate and corner speeds
- Can vary by track section

**Track Length:**
- Determines lap count for race distance
- Affects fuel and tire strategy windows

#### 4. Lap Time Calculation

Each lap is broken into track sections:

```typescript
for each section in track:
  entry_speed = calculate_entry_speed(prior_section, current_section, tire_grip, fuel_weight)

  if (section.type === 'turn'):
    section_speed = corner_speed(banking, radius, tire_grip, driver_skill, confidence)
  else:
    section_speed = straight_speed(horsepower, draft_status, fuel_weight)

  section_time = section_length / section_speed
  lap_time += section_time
```

**Integration of Effects:**
1. Calculate base section speed (corner or straight formula)
2. Apply tire wear modifier (grip degradation)
3. Apply fuel weight modifier (lap time penalty)
4. Apply draft bonus (if applicable)
5. Apply driver skill modifier (racecraft)
6. Calculate section time = distance / speed
7. Sum all section times = total lap time

**Validation Points:**
- Bristol: 15.0-15.2 seconds typical
- Charlotte: 30-31 seconds typical
- Daytona: 49-51 seconds typical

#### 5. Passing Mechanics

**Overtake Probability:**
```typescript
pass_chance = base_probability *
              (attacker_skill / defender_skill) *
              (attacker_speed / defender_speed) *
              confidence_modifier *
              (1 - frustration_penalty)
```

**Factors:**
- Speed differential (draft, tire condition, mental state)
- Driver skill (Racecraft, Aggression)
- Track section (straights easier than corners)
- Mental state (confidence increases chance, frustration decreases)

**Outcomes:**
- Success: Position swap, +confidence, -frustration
- Failure (no opening): No position change, +frustration
- Failure (contact/spin): Positions lost, damage, mental state penalties

---

### Implementation Guidelines

**Calculation Order for Lap Time:**

1. Load track configuration (sections, banking, radius)
2. For each track section:
   - Calculate base section speed
   - Apply tire wear modifier
   - Apply fuel weight modifier
   - Apply draft bonus (if applicable)
   - Apply downforce benefit (corners)
   - Apply driver skill modifier
   - Calculate section time = distance / speed
3. Sum all section times = total lap time
4. Validate against known lap times

**Testing Validation Points:**

Use these relationships to verify physics accuracy:

1. **Bristol lap times:** 15.0-15.2 seconds typical
2. **Tire wear penalty:** ~0.5 seconds per 50 laps
3. **Fuel weight:** ~0.54 seconds full vs empty tank
4. **Draft benefit:** ~3-4 seconds per lap at Daytona
5. **Charlotte lap times:** 30-31 seconds typical
6. **Fresh tire advantage:** 0.3-0.5 seconds at Charlotte

**Simplifications Acceptable:**

For simulation purposes, these simplifications are acceptable:

1. **Track sections:** Can model turns as uniform (don't need to model progressive banking)
2. **Tire temperature:** Can be omitted initially (affects ~5-10% grip)
3. **Aerodynamic dirty air:** Simplified to draft zone vs clean air
4. **Brake/throttle input:** Can assume optimal inputs based on driver skill
5. **Setup variations:** All cars can use same baseline specs initially

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

**Phase 1:** ✅ Complete (2025-11-16)
- Created spec directory structure
- Added template files with placeholders

**Phase 2:** ✅ Complete (2025-11-16)
- ✅ Migrated physics algorithms from `docs/SPEC.md` → `SPEC.md`
- ✅ Moved `docs/PHYSICS-REFERENCE.md` → `REFERENCE.md` (preserving git history)
- ✅ Extracted physics examples from `docs/EXAMPLES.md` → `EXAMPLES.md`
- ✅ Enhanced with additional examples and validation tables
- ⏳ Physics-specific `TASKS.md` (will populate as needed)
- ⏳ Physics ADRs in `DECISIONS.md` (already populated from Phase 1)

**Benefits Achieved:**
- **Token efficiency:** ~75% reduction for physics-only work (500 tokens vs 2000+)
- **Clear scope:** Physics spec isolated from decision/UI systems
- **Focused reference:** All NASCAR formulas in REFERENCE.md
- **Validation targets:** EXAMPLES.md provides test scenarios and targets

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-16 | 1.1 | Phase 2 - Content migrated from monolithic docs |
| 2025-11-16 | 1.0 | Phase 1 - Initial spec structure created |

---

## Cross-References

**Within Physics Spec:**
- `REFERENCE.md` - NASCAR physics constants and formulas
- `EXAMPLES.md` - Test scenarios and validation targets
- `CONTRACTS.md` - Interface documentation
- `VALIDATION.md` - Test status and calibration tracking
- `DECISIONS.md` - Physics ADRs and calibration history

**External References:**
- `src/engine/physics/` - Implementation code
- `tests/unit/physics/` - Unit tests
- `.claude/agents/nascar-physics-calibrator.md` - Physics calibration agent
- `.claude/specs/decisions/` - Decision system (uses physics for outcomes)
