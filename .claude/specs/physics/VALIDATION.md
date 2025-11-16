# Physics Validation Targets

**Last Updated:** 2025-11-16
**Current Status:** 95/100 tests passing (95%)

---

## Validation Methodology

**Approach:** Compare calculated lap times and physics values against real NASCAR data.

**Sources:**
- NASCAR official qualifying times
- Race telemetry data
- BuildingSpeed.org physics analysis
- Track specifications

**Tolerance Levels:**
- ±0.2s for short tracks (Bristol)
- ±0.3s for intermediates (Charlotte)
- ±0.5s for superspeedways (Daytona)

---

## Lap Time Validation

| Track | Type | Target | Tolerance | Current | Status | Last Checked |
|-------|------|--------|-----------|---------|--------|--------------|
| Bristol | Short | 15.5s | ±0.2s | 15.4s | ✅ Pass | 2025-11-15 |
| Charlotte | Intermediate | 29.5s | ±0.3s | 29.6s | ✅ Pass | 2025-11-15 |
| Daytona | Superspeedway | 50.0s | ±0.5s | 50.2s | ✅ Pass | 2025-11-15 |

---

## Tire Wear Validation

| Scenario | Expected | Current | Status |
|----------|----------|---------|--------|
| Fresh tires | Baseline (15.5s) | 15.4s | ✅ |
| 50 laps wear | +0.5-0.7s slower | TBD | ⏳ |
| Worn out (80+ laps) | +1.0-1.5s slower | TBD | ⏳ |

---

## Aerodynamics Validation

| Effect | Expected | Current | Status |
|--------|----------|---------|--------|
| Draft speed boost | +3-5 mph | TBD | ⏳ |
| Optimal draft distance | 1.5 car lengths | TBD | ⏳ |
| Side-by-side penalty | -2% speed | TBD | ⏳ |

---

## Fuel Validation

| Scenario | Expected | Current | Status |
|----------|----------|---------|--------|
| Full tank penalty | +0.54s/lap | TBD | ⏳ |
| Empty vs full | ~0.5s difference | TBD | ⏳ |
| Draft fuel savings | -10% consumption | TBD | ⏳ |

---

## Calibration Agent

**Agent:** `nascar-physics-calibrator`
**Location:** `.claude/agents/nascar-physics-calibrator.md`

**Usage:**
When physics tests fail or values drift from targets, invoke the calibrator agent to calculate exact coefficient adjustments needed.

**Example:**
```
Bristol lap time is 16.2s but should be 15.5s ± 0.2s

Agent calculates:
- Current calibration factor: 0.970
- Required adjustment: +4.3%
- New calibration factor: 0.928
```

---

## Validation Test Suite

**Location:** `tests/unit/physics/`

**Key Tests:**
- `laptime.test.ts` - Lap time validation
- `speed.test.ts` - Corner/straight speed validation
- `tires.test.ts` - Tire wear validation
- `fuel.test.ts` - Fuel consumption validation
- `aerodynamics.test.ts` - Draft/downforce validation

**Run Physics Tests:**
```bash
npm run test:run -- tests/unit/physics/
```

---

## Calibration History

| Date | Track | Issue | Before | After | Method |
|------|-------|-------|--------|-------|--------|
| 2025-11-10 | Bristol | Too slow | 18.1s | 15.5s | Adjusted calibration factors |
| 2025-11-12 | Charlotte | Too slow | 35.6s | 29.5s | Turn/straight factor tuning |
| 2025-11-14 | Daytona | Too slow | 62.1s | 50.0s | Superspeedway package calibration |
| 2025-11-15 | All | Tire wear not applied | N/A | N/A | Fixed tire grip integration |

---

## Future Validation Additions

**Phase 2:** Weather physics
- Rain grip reduction targets
- Temperature effects on tire wear

**Phase 3:** Mechanical systems
- Failure probability curves
- Damage impact on lap times

**Phase 4:** Advanced aero
- Multi-car draft pack dynamics
- Dirty air grip loss

---

**Phase 1 Status:** Template created with current validation data
**Next Update:** After Phase 2 migration (add more detailed scenarios from EXAMPLES.md)
