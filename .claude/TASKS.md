# Current Tasks & Status

**Last Updated:** 2025-11-16
**Current Phase:** Phase 7 - Polish & Extensions

---

## Current Work

None - Ready to start on "Next Up" tasks.

---

## Test Status

**Overall:** 255/269 passing (94.8%)

### Failing Tests (14 total)

**Physics Speed Tests (7 failures):**
- `calculateCornerSpeed` - Bristol corner speed: 143 mph (expected <140)
- `calculateCornerSpeed` - Daytona corner speed: 271 mph (expected <240)
- `calculateSectionSpeed` - Tire wear not affecting turn sections (120 == 120)
- `calculateSectionSpeed` - Severe tire wear not impacting speed (120 == 120)
- Integration - Tire grip not reducing speed
- Validation - Bristol lap time 13.4s (expected 14-16.5s)
- Validation - Tire wear penalty only 0.02s (expected >0.3s)

**Physics Lap Time Tests (6 failures):**
- Bristol clean lap: 16.16s (target: 15.4-15.6s)
- Charlotte lap: 32.11s (target: ~28.5s)
- Tire impact comparison incorrect
- Max skill driver: 15.93s (expected <15.3s)
- Top speed too low: 128 mph (expected >130)
- Daytona avg speed wrong: 158 < 168 mph

**Decision Evaluator Test (1 failure):**
- Mental state affecting outcomes (randomness issue: 50 > 53)

### Root Causes
1. **Tire wear not integrated properly** - grip calculation not affecting section speed
2. **Corner speed formula** - producing unrealistic high speeds
3. **Lap time calibration** - systematic offset from targets
4. **Test flakiness** - decision evaluator has random element

---

## Blocked Items

None currently.

---

## Next Up (Priority Order)

1. **Fix tire wear integration** (HIGH PRIORITY)
   - Issue: `calculateSectionSpeed` not using tire grip
   - Affects 7 failing tests
   - Location: `src/engine/physics/speed.ts`

2. **Calibrate corner speed formula** (HIGH PRIORITY)
   - Banking coefficient too high
   - Bristol: 143 → ~130 mph
   - Daytona: 271 → ~190 mph
   - Location: `src/engine/physics/speed.ts:calculateCornerSpeed`

3. **Calibrate lap time targets** (MEDIUM PRIORITY)
   - Bristol: 16.16s → 15.5s (0.66s too slow)
   - Charlotte: 32.11s → 28.5s (3.6s too slow)
   - May resolve after tire/corner speed fixes
   - Location: `src/engine/physics/laptime.ts`

4. **Fix decision evaluator test flakiness** (LOW PRIORITY)
   - Test relies on randomness, occasionally fails
   - Consider increasing sample size or using seed
   - Location: `tests/unit/events/decision-evaluator.test.ts:104`

5. **Additional tracks/features** (FUTURE)
   - Per SPEC.md Phase 7
   - Career mode, additional tracks, enhanced AI

---

## Recent Changes (Last 5 Commits)

1. `bf4fe14` - Establish continuous TASKS.md update workflow
2. `d0aebfb` - Refactor CLAUDE.md and establish TASKS.md for session continuity
3. `0e65fca` - Establish testing command principles (added `test:run`)
4. `aa64822` - Phase 5.1: Calibrate physics to match EXAMPLES.md
5. `eb14b8c` - Update documentation: Phase 4 Complete!

---

## Completed This Session

- ✅ Identified test command blocking issue (`npm test` watch mode)
- ✅ Added `npm run test:run` for non-blocking tests
- ✅ Updated CLAUDE.md testing principles
- ✅ Refactored CLAUDE.md (591 → 144 lines, 75.6% reduction)
- ✅ Created TASKS.md for session continuity
- ✅ Analyzed current test failures (14 failing, all physics calibration)
- ✅ Established TASKS.md update workflow in CLAUDE.md
- ✅ Added continuous task tracking principles
- ✅ Documented task completion workflow (complete → update → commit → next)

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

# Run demo
npx tsx demo-race.ts      # Full interactive race

# Type checking
npm run type-check        # Verify no TS errors

# Development
npm run lint:fix          # Auto-fix linting issues
```

---

**Session Resume Instructions:**
1. Check this file first
2. Run `npm run test:run` to verify test status
3. Check "Next Up" section for priorities
4. Review "Recent Changes" for context
5. Update this file before ending session
