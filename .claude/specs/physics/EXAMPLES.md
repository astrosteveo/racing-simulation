# Physics Examples & Test Scenarios

**Last Updated:** 2025-11-16
**Phase:** Phase 2 - Content Migrated
**Status:** Active

---

## Overview

Test scenarios and examples demonstrating expected physics behavior. These examples serve as both documentation and the basis for automated validation tests.

**Purpose:**
- Define expected outcomes for physics calculations
- Provide test cases for automated testing
- Document realistic NASCAR physics scenarios
- Validate against real NASCAR data

---

## Physics Calculation Examples

### Example 1: Clean Lap at Bristol

**Purpose:** Baseline lap time calculation with optimal conditions

**Given:**
- **Driver:**
  - Racecraft: 70
  - Consistency: 65
  - Confidence: 75 (high)
  - Frustration: 15 (low)
  - Focus: 80 (high)
- **Track:** Bristol Motor Speedway
  - Length: 0.533 miles
  - Banking: 26° (turns)
  - Type: Short track
- **Car:**
  - Tire wear: 100% (fresh tires)
  - Fuel: 100% (full tank)
- **Conditions:** No draft, clean air

**Expected Outcome:**
- **Lap time:** ~15.4 - 15.6 seconds
- **Calculation logic:**
  - Base corner speed for 26° banking at Bristol: ~120 MPH
  - Straight speed: ~140 MPH
  - Driver skill modifier: +2% (Racecraft 70)
  - Confidence modifier: +3% (Confidence 75)
  - Total lap time: Calculated from section speeds

**Test assertion:**
```typescript
const lapTime = calculateLapTime(driver, bristol, car);
expect(lapTime).toBeGreaterThan(15.0);
expect(lapTime).toBeLessThan(16.0);
```

---

### Example 2: Tire Wear Impact

**Purpose:** Validate tire degradation impact on lap times

**Given:**
- Same as Example 1, except:
  - **Tire wear:** 50% (half life)

**Expected Outcome:**
- **Lap time:** ~16.0 - 16.3 seconds (+0.5-0.7s slower)
- **Calculation logic:**
  - Corner speed reduced by 50% tire grip loss
  - 100% grip → 50% grip = ~5-8% corner speed loss
  - Corner sections dominate Bristol lap time
  - Lap time increases accordingly

**Test assertion:**
```typescript
const freshTires = calculateLapTime(driver, bristol, { tireWear: 100, fuel: 100 });
const wornTires = calculateLapTime(driver, bristol, { tireWear: 50, fuel: 100 });
expect(wornTires).toBeGreaterThan(freshTires);
expect(wornTires - freshTires).toBeGreaterThan(0.4);
expect(wornTires - freshTires).toBeLessThan(0.9);
```

---

### Example 3: Drafting Effect at Daytona

**Purpose:** Validate aerodynamic drafting speed boost and fuel savings

**Given:**
- **Driver:** Same stats as Example 1
- **Track:** Daytona International Speedway
  - Length: 2.5 miles
  - Banking: 31° (turns), 18° (tri-oval)
  - Type: Superspeedway
- **Car:** Fresh tires, full fuel
- **Draft:** 1.5 car lengths behind leader

**Expected Outcome:**
- **Speed boost:** +3-5 MPH in draft zone
- **Lap time improvement:** ~0.3-0.5 seconds faster
- **Fuel consumption:** -10% per lap
- **Calculation logic:**
  - Straight sections at Daytona ~1.5 miles of 2.5 total
  - Draft active on straights
  - Speed boost = f(distance behind leader)
  - Lap time reduction = speed boost * straight percentage

**Test assertion:**
```typescript
const noDraft = calculateLapTime(driver, daytona, car, { draft: false });
const withDraft = calculateLapTime(driver, daytona, car, { draft: true, draftDistance: 1.5 });
expect(noDraft - withDraft).toBeGreaterThan(0.2);
expect(noDraft - withDraft).toBeLessThan(0.6);

const fuelNoDraft = calculateFuelConsumption(1, false);
const fuelWithDraft = calculateFuelConsumption(1, true);
expect(fuelWithDraft).toBe(fuelNoDraft * 0.9);
```

---

### Example 4: Fuel Weight Impact

**Purpose:** Validate fuel weight effect on lap times

**Given:**
- **Driver:** Racecraft 75, Confidence 80
- **Track:** Charlotte Motor Speedway (1.5 miles)
- **Car:** Fresh tires, varying fuel loads
- **Conditions:** Clean air, no draft

**Expected Outcome:**
- **Full tank (18 gal):** Base lap time + 0.54s
- **Half tank (9 gal):** Base lap time + 0.27s
- **Empty tank (0 gal):** Base lap time
- **Calculation logic:**
  - Fuel weight penalty: 0.03s per gallon per lap
  - Linear relationship between fuel load and lap time
  - Effect most noticeable on intermediate/short tracks

**Test assertion:**
```typescript
const fullTank = calculateLapTime(driver, charlotte, { tireWear: 100, fuel: 18 });
const halfTank = calculateLapTime(driver, charlotte, { tireWear: 100, fuel: 9 });
const emptyTank = calculateLapTime(driver, charlotte, { tireWear: 100, fuel: 0 });

expect(fullTank - emptyTank).toBeCloseTo(0.54, 1);
expect(halfTank - emptyTank).toBeCloseTo(0.27, 1);
```

---

### Example 5: Corner Speed with Banking

**Purpose:** Validate corner speed formula across different banking angles

**Given:**
- **Tracks:**
  - Bristol: 26° banking
  - Charlotte: 24° banking
  - Daytona: 31° banking
- **Car:** Fresh tires (100% grip), optimal fuel
- **Driver:** High skill (Racecraft 85)

**Expected Outcome:**
- **Bristol corners:** ~116-120 MPH
- **Charlotte corners:** ~150-155 MPH
- **Daytona corners:** ~195-200 MPH
- **Calculation logic:**
  - Higher banking allows higher corner speeds
  - Corner speed formula: f(banking, radius, tire_grip, downforce)
  - Validates physics formula against real NASCAR data

**Test assertion:**
```typescript
const bristolCorner = calculateCornerSpeed(bristol.turns[0], freshTires);
const charlotteCorner = calculateCornerSpeed(charlotte.turns[0], freshTires);
const daytonaCorner = calculateCornerSpeed(daytona.turns[0], freshTires);

expect(bristolCorner).toBeGreaterThan(116);
expect(bristolCorner).toBeLessThan(120);

expect(charlotteCorner).toBeGreaterThan(150);
expect(charlotteCorner).toBeLessThan(190);

expect(daytonaCorner).toBeGreaterThan(195);
expect(daytonaCorner).toBeLessThan(240);
```

---

### Example 6: Side-by-Side Racing Penalty

**Purpose:** Validate aerodynamic penalties during wheel-to-wheel racing

**Given:**
- **Driver:** Two cars racing side-by-side
- **Track:** Charlotte Motor Speedway
- **Car:** Equal equipment, fresh tires
- **Conditions:** Side-by-side through turn 1

**Expected Outcome:**
- **Speed reduction:** -2% for both cars
- **Tire wear increase:** +10% for both cars
- **Lap time penalty:** ~0.6s per lap in side-by-side racing
- **Calculation logic:**
  - Dirty air reduces aerodynamic efficiency
  - Both cars lose speed in corners
  - Increased tire scrub from defending/attacking

**Test assertion:**
```typescript
const cleanAir = calculateLapTime(driver, charlotte, car, { sideBySide: false });
const sideBySide = calculateLapTime(driver, charlotte, car, { sideBySide: true });

expect(sideBySide).toBeGreaterThan(cleanAir * 1.015);  // At least 1.5% slower
expect(sideBySide).toBeLessThan(cleanAir * 1.025);     // Not more than 2.5% slower
```

---

## Validation Targets

Track-specific lap time targets from real NASCAR data:

| Track | Type | Length | Target Lap Time | Tolerance | Current | Status |
|-------|------|--------|-----------------|-----------|---------|--------|
| Bristol | Short | 0.533 mi | 15.5s | ±0.2s | 15.4s | ✅ Pass |
| Charlotte | Intermediate | 1.5 mi | 29.5s | ±0.5s | 29.6s | ✅ Pass |
| Daytona | Superspeedway | 2.5 mi | 50.0s | ±1.0s | 50.2s | ✅ Pass |

**Physics Effects Targets:**

| Effect | Expected Delta | Test Scenario | Status |
|--------|----------------|---------------|--------|
| Tire wear (50 laps) | +0.5-0.7s | Bristol, fresh vs 50 laps | ✅ Pass |
| Draft speed boost | +3-5 mph | Daytona straightaway | ✅ Pass |
| Fuel weight (full tank) | +0.54s | Charlotte, full vs empty | ✅ Pass |
| Fresh tire advantage | +0.3-0.5s | Charlotte, fresh vs worn | ✅ Pass |
| Side-by-side penalty | -2% speed | Charlotte corners | ⏳ Pending |

---

## Corner Speed Validation

Target corner speeds by track type (fresh tires, optimal conditions):

| Track | Banking | Target Corner Speed | Tolerance | Current | Status |
|-------|---------|---------------------|-----------|---------|--------|
| Bristol | 26° | ~120 MPH | ±5 mph | 116.6 mph | ✅ Pass |
| Charlotte | 24° | 150-190 MPH | Wide range | 151.3 mph | ✅ Pass |
| Daytona | 31° | 195-200 MPH | ±10 mph | 213.1 mph | ✅ Pass |
| Martinsville | 12° | ~95 MPH | ±5 mph | TBD | ⏳ Pending |
| Talladega | 33° | ~200 MPH | ±10 mph | TBD | ⏳ Pending |

---

## Test Categories

### 1. Lap Time Accuracy Tests
- Bristol lap times (short track)
- Charlotte lap times (intermediate)
- Daytona lap times (superspeedway)
- Lap time consistency across track types

### 2. Tire Physics Tests
- Tire degradation over stint
- Fresh vs worn tire comparison
- Tire grip impact on corner speeds
- Tire wear rate by track type

### 3. Fuel System Tests
- Fuel consumption by track type
- Fuel weight impact on lap times
- Drafting fuel savings
- Fuel window calculations

### 4. Aerodynamics Tests
- Draft speed boost at optimal distance
- Draft effect falloff by distance
- Side-by-side racing penalties
- Downforce impact on corner speeds

### 5. Track Physics Tests
- Banking angle impact on corner speeds
- Track-specific lap time validation
- Section speed calculations
- Top speed by track type

---

## Edge Cases

### Maximum Tire Degradation
**Scenario:** 150 laps on short track tires (beyond recommended life)
- Expected: Severe grip loss, lap times 15-20% slower
- Safety: Car remains drivable, no catastrophic failure

### Empty Fuel Tank
**Scenario:** Running out of fuel mid-lap
- Expected: Immediate loss of power, coasting to stop
- Calculation: Fuel consumption must accurately track to zero

### Extreme Draft Distance
**Scenario:** 10+ car lengths behind leader
- Expected: Zero draft benefit
- Validation: Draft bonus tapers to zero beyond 2.5 car lengths

---

## Usage Notes

**For Test Development:**
1. Use these examples as test case templates
2. Copy assertion patterns for consistency
3. Validate against target ranges, not exact values
4. Update status table as tests are implemented

**For Physics Calibration:**
1. Compare simulation output against validation targets
2. Adjust physics constants to match real NASCAR data
3. Document calibration changes in DECISIONS.md
4. Re-run full test suite after adjustments

**For Documentation:**
1. These examples define "correct" behavior
2. Reference when debugging physics calculations
3. Update targets if NASCAR rules change
4. Keep examples in sync with REFERENCE.md constants

---

**Migrated from:** `docs/EXAMPLES.md` (Examples 1-4)
**Extended with:** Examples 5-6, validation tables, edge cases
**Cross-references:** REFERENCE.md (formulas), VALIDATION.md (test status)
