# Current Tasks & Status

**Last Updated:** 2025-11-16
**Current Phase:** Phase 7 - Polish & Extensions

---

## Current Work

None - Ready to start on "Next Up" tasks.

---

## Test Status

**Overall:** 250/269 passing (93.0%)

### Failing Tests (19 total)

**Physics Lap Time Tests (17 failures):**
- Bristol clean lap: ~15.9s (target: 15.4-15.6s)
- Charlotte lap: ~32s (target: ~28.5s)
- Daytona lap time with draft calculations
- Tire wear integration tests (various scenarios)
- Fuel weight integration tests
- Driver skill variation tests
- Average speed validations (Bristol, Charlotte)

**Physics Speed Test (1 failure):**
- Charlotte lap time validation: 34.5s (expected <34s)

**Decision Evaluator Test (1 failure):**
- Skill-based outcomes (randomness issue: flaky test)

### Root Causes
1. ~~**Tire wear not integrated properly**~~ - ✅ **FIXED!** (commit 37d73be)
2. ~~**Corner speed formula**~~ - ✅ **FIXED!** (commit 261fb5c) Realistic speeds achieved
3. **Lap time calibration** - systematic offset from targets, needs overall recalibration
4. **Test flakiness** - decision evaluator has random element (low priority)

---

## Blocked Items

None currently.

---

## Next Up (Priority Order)

### 1. ~~Fix tire wear integration~~ ✅ **COMPLETED**

**Status:** Fixed in commit 37d73be
**Result:** 7 tests now passing, test pass rate improved to 95.9%

---

### 2. ~~Calibrate corner speed formula~~ ✅ **COMPLETED**

**Status:** Fixed in commit 261fb5c
**Result:** 3 corner speed tests now passing, realistic speeds achieved
- Bristol: 116.6 mph (was 143 mph, target ~120 mph) ✓
- Charlotte: 151.3 mph (target 150-190 mph) ✓
- Daytona: 213.1 mph (was 271 mph, target 175-240 mph) ✓
- Tire wear impact: ~10% reduction at 50% grip ✓

---

### 3. Calibrate lap time targets (MEDIUM PRIORITY)

**Problem:** Systematic lap time offset
**Impact:** Bristol 16.16s (target: 15.5s), Charlotte 32.11s (target: 28.5s)
**Files:**
- `src/engine/physics/laptime.ts` (lap time calculation logic)
- `tests/unit/physics/laptime.test.ts` (lap time validation tests)
- May auto-resolve after tasks #1 and #2

**Action:**
1. First complete tasks #1 and #2 (tire wear + corner speed)
2. Re-run: `npm run test:run` to see if lap times self-correct
3. If still off, analyze `calculateLapTime` function
4. Adjust section time calculations or add calibration factor

**Success Criteria:** Lap times within ±0.5s of EXAMPLES.md targets

---

### 4. Fix decision evaluator test flakiness (LOW PRIORITY)

**Problem:** Test occasionally fails due to randomness in skill checks
**Impact:** 1 intermittent test failure
**Files:**
- `tests/unit/events/decision-evaluator.test.ts` (line 104)
- `src/events/decision-evaluator.ts` (skill check logic)

**Action:**
1. Open test file, find flaky test at line ~104
2. Option A: Increase sample size (run 1000 iterations instead of 100)
3. Option B: Use seeded random number generator for deterministic tests
4. Option C: Test statistical properties instead of exact outcomes

**Success Criteria:** Test passes consistently (10 runs in a row)

---

### 5. Additional tracks/features (FUTURE)

**Scope:** Per SPEC.md Phase 7
**Features:** Career mode, additional tracks, enhanced AI
**Status:** Deferred until core physics calibrated

---

## Recent Changes (Last 5 Commits)

1. `51105d6` - Update test status: 250/269 passing (93.0%)
2. `fa21fff` - Update TASKS.md: Mark corner speed calibration as completed
3. `261fb5c` - **Fix: Calibrate corner speed formula to realistic NASCAR speeds** (3 tests fixed)
4. `37d73be` - **Fix: Tire wear integration in calculateSectionSpeed** (7 tests fixed)
5. `0bbf29c` - Reorganize feature design docs to .claude/design/ (Claude Code best practices)

---

## Completed This Session

- ✅ **CALIBRATED corner speed formula (HIGH PRIORITY):**
  - Reduced grip coefficient from 0.880 max to 0.620 max
  - Bristol: 143 mph → 116.6 mph (target ~120 mph) ✓
  - Charlotte: too high → 151.3 mph (target 150-190 mph) ✓
  - Daytona: 271 mph → 213.1 mph (target 175-240 mph) ✓
  - Tire wear impact: increased to ~10% speed reduction at 50% grip ✓
  - Result: 3 corner speed tests now passing
  - File: src/engine/physics/speed.ts:118
  - Commit: 261fb5c

- ✅ **FIXED tire wear integration (previous session):**
  - Implemented piecewise tire grip formula in calculateSectionSpeed
  - Moderate wear (>60% grip): gentle degradation (0.15 power)
  - Severe wear (≤60% grip): harsh degradation (0.7 power)
  - Result: 7 tire wear tests now passing
  - File: src/engine/physics/speed.ts:203-215
  - Commit: 37d73be

---

## Notes

- **Demo works!** `npx tsx demo-race.ts` runs full interactive race
- Physics issues don't break playability, just accuracy to NASCAR reality
- All 14 test failures are physics calibration (not architectural bugs)
- Core systems (TDD, contracts, layers) working as designed

---

## Quick Commands

```bash
# Test suite
npm run test:run          # Run all tests once
npm test                  # Watch mode (manual dev)
npm run test:ui           # Interactive test UI
npm run test:coverage     # Coverage report

# Documentation (NEW - Automated sync!)
npm run verify-docs       # Check if living docs are in sync (7 checks)
npm run test:status       # Auto-update test counts in TASKS.md + README.md
npm run sync-readme       # Sync README.md with TASKS.md (semi-automated)
npm run validate-tasks    # Check that tasks follow actionable format

# Run demo
npx tsx demo-race.ts      # Full interactive race

# Type checking & linting
npm run type-check        # Verify no TS errors
npm run lint              # Check code style
npm run lint:fix          # Auto-fix linting issues
```

---

## Task Description Template

**Use this format for "Next Up" tasks to ensure they are actionable:**

```markdown
### N. Task Title (PRIORITY)

**Problem:** Clear description of what's wrong or what needs building
**Impact:** What this affects (test count, features, users)
**Files:**
- `path/to/file.ts` (lines X-Y, function/class name)
- `path/to/test.ts` (relevant test descriptions)

**Action:**
1. Specific step with exact location
2. What to change (not just what's broken)
3. How to verify (command to run)
4. Expected outcome (tests passing, feature working)

**Success Criteria:** Measurable definition of done
```

**Good Example:**
```markdown
### 1. Fix tire wear integration (HIGH PRIORITY)

**Problem:** `calculateSectionSpeed` not using tire grip calculation
**Impact:** 7 failing tests
**Files:**
- `src/engine/physics/speed.ts` (lines ~65-95, `calculateSectionSpeed` function)
- `tests/unit/physics/speed.test.ts` (tests expecting tire wear to affect speed)

**Action:**
1. In `calculateSectionSpeed`, ensure `tireGrip` parameter affects turn sections
2. Multiply corner speed by grip factor (e.g., `baseSpeed * tireGrip`)
3. Run: `npm test speed.test.ts` to verify fix
4. Expected: 7 tests change from failing → passing

**Success Criteria:** Tire wear reduces turn section speed appropriately
```

**Bad Example (too vague):**
```markdown
1. Fix physics stuff
   - Tests are failing
   - Location: somewhere in physics folder
```

---

**Session Resume Instructions:**
1. Check this file first
2. Run `npm run test:run` to verify test status
3. Check "Next Up" section for priorities (now with actionable steps!)
4. Review "Recent Changes" for context
5. Update this file before ending session
