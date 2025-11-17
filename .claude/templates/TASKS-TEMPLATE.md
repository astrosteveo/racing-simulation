# [Spec Name] Tasks

**Last Updated:** YYYY-MM-DD
**Test Status:** X/Y passing (Z%)
**Phase:** [Current phase description]

---

## Current Work

TODO: List tasks currently being worked on. Format:

✅ **[Task Name]** - STATUS
- [x] Completed subtask
- [ ] In-progress subtask
- [ ] Pending subtask

**Next:** TODO: What's next after current work completes

---

## Blocked Items

TODO: List anything blocking progress

**[Blocker Name]:**
- **Problem:** TODO: What's blocked
- **Blocking:** TODO: What tasks are affected
- **Unblock Condition:** TODO: What's needed to unblock
- **Workaround:** TODO: Temporary solution if any

*If none:* None currently.

---

## Next Up (Priority Order)

### 1. [Task Name] (HIGH/MEDIUM/LOW PRIORITY)

**Problem:** TODO: What problem does this solve?
**Impact:** TODO: Why is this important?
**Files:**
- `TODO: path/to/file.ts` (what changes)
- `TODO: path/to/test.ts` (tests)

**Action:**
1. TODO: Step 1 with concrete details
2. TODO: Step 2 with concrete details
3. TODO: Step 3 - write tests
   - Test scenario A
   - Test scenario B
4. TODO: Validation criteria

**TDD Breakdown:**
*(Break down implementation into test-first cycles)*
1. [ ] Write test for [feature A] (expect RED)
2. [ ] Run test - verify fails (RED output)
3. [ ] Implement [feature A] - minimal code
4. [ ] Run test - verify passes (GREEN output)
5. [ ] Commit: "Add: [feature A]"
6. [ ] Write test for [feature B] (expect RED)
7. [ ] Run test - verify fails (RED output)
8. [ ] Implement [feature B] - minimal code
9. [ ] Run test - verify passes (GREEN output)
10. [ ] Commit: "Add: [feature B]"
11. [ ] Refactor if needed (tests stay GREEN)
12. [ ] Commit: "Refactor: [what was refactored]"

**Success Criteria:**
- TODO: Measurable outcome 1
- TODO: Measurable outcome 2
- Tests pass (N+ new tests)
- Each feature has test written BEFORE implementation
- All commits have passing tests

**Dependencies:**
- TODO: Must complete X first
- TODO: Requires Y from other spec

---

### 2. [Another Task] (PRIORITY)

TODO: Repeat structure above

---

## Recently Completed

✅ **[Completed Task Name]** (YYYY-MM-DD)
- TODO: What was accomplished
- TODO: Key outcomes
- TODO: Test results (N/N passing)
- **Result:** TODO: Impact statement

✅ **[Another Completed Task]** (YYYY-MM-DD)
- TODO: Details

---

## Completed This Session

Move items from "Recently Completed" here during active session, then merge to "Recently Completed" at session end.

TODO: Remove this section if not in active session

---

## Future Enhancements

See [SPEC.md](SPEC.md) for complete vision. Notable future work:

- [ ] TODO: Future enhancement 1
- [ ] TODO: Future enhancement 2
- [ ] TODO: Future enhancement 3

*These are NOT immediate tasks - just documented possibilities.*

---

## Notes

**Patterns:**
- TODO: Common patterns observed
- TODO: Best practices for this spec

**Gotchas:**
- TODO: Things to watch out for
- TODO: Common mistakes

**Dependencies:**
- TODO: External dependencies to track
- TODO: Breaking changes to coordinate

---

## Quick Commands ([Spec]-Specific)

```bash
# TODO: Add spec-specific commands
npm run test:run -- tests/path/to/spec/
npm run demo:thing

# View spec documentation
cat .claude/specs/[spec-name]/SPEC.md
```

---

**Phase Status:** TODO: Current phase and completion %
**Next Review:** After [milestone]
