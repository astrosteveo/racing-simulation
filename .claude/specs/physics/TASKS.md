# Physics Tasks

**Last Updated:** 2025-11-16
**Test Status:** 95/100 passing (95%)
**Phase:** Phase 1 - Foundation (Template Created)

---

## Current Work

None - Phase 1 structure creation only.

**TODO for Phase 2:** Migrate physics-specific tasks from `.claude/TASKS.md`

---

## Blocked Items

None currently.

---

## Next Up (Priority Order)

**TODO for Phase 2:** Extract physics tasks from main TASKS.md

### Example Task Format:

```markdown
### 1. Fix tire wear edge case comparison (LOW PRIORITY)

**Problem:** Tire wear delta test compares Bristol vs Daytona but expects specific ordering
**Impact:** 1 test failure (edge case, not critical)
**Files:**
- `tests/unit/physics/laptime.test.ts` (tire impact comparison test)
- `src/engine/physics/laptime.ts` (calculation logic)

**Action:**
1. Review test expectations in laptime.test.ts
2. Determine if test is too strict or calculation is off
3. Either adjust test tolerance or fix calculation
4. Verify doesn't break other tests

**Success Criteria:** Test passes consistently
```

---

## Completed

### Recently Completed

**TODO for Phase 2:** Migrate completed physics tasks from main TASKS.md

Examples:
- [x] Calibrate Bristol lap times (2025-11-10)
- [x] Fix tire wear integration (2025-11-14)
- [x] Calibrate corner speed formula (2025-11-15)

### Backlog

Future enhancements (see PLANS.md):
- [ ] Add weather physics
- [ ] Implement tire temperature
- [ ] Add mechanical failures
- [ ] Advanced aerodynamics

---

## Task Template

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

---

**Phase 1 Status:** Template created, awaiting Phase 2 content migration
