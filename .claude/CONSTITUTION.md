# Development Constitution

**Version:** 1.0
**Purpose:** Systematic checklist ensuring consistent practices and catching edge cases
**Last Updated:** 2025-11-17

---

## Guiding Principle

**Every decision, task, and edge case must be captured in the spec-centric system.**

If it's not documented, it doesn't exist. If it's discovered mid-work, pause and document it.

---

## On Every Architectural Decision

When you make a design choice (simulation speed, data structure, algorithm):

- [ ] **Document in SPEC.md** - Add to relevant spec's Design Principles or Architecture section
- [ ] **Create task if needed** - Add implementation task to spec's TASKS.md
- [ ] **Update PLANS.md** - If it affects roadmap or future features
- [ ] **Cross-reference** - If multi-spec impact, document in all affected specs
- [ ] **Example:** Today's simulation speed toggle was documented in both SPEC.md and TASKS.md

---

## Before Starting Work

- [ ] **Read STATUS.md** - Understand current project state
- [ ] **Check spec's TASKS.md** - Verify approved task exists in "Next Up"
- [ ] **Review blockers** - Check spec's "Blocked Items" section
- [ ] **Move task** - From "Next Up" to "Current Work"
- [ ] **No task exists?** Follow Process Gate (Explore → Plan → Task → Approve → Execute)

---

## During Implementation

- [ ] **Update TASKS.md continuously** - Mark tasks as in_progress/completed in real-time
- [ ] **No batching** - Complete task → mark complete immediately
- [ ] **Document discoveries** - Edge cases go to spec's SPEC.md or new task in TASKS.md
- [ ] **Follow TDD micro-cycles** - For each unit of work:
  1. Write test first (define success criteria)
  2. Run test (verify RED - test fails)
  3. Implement minimal code (make test pass)
  4. Run test (verify GREEN - test passes)
  5. Refactor if needed (keep tests green)
  6. **Commit checkpoint** (see "Before Each Commit" below)

---

## Before Each Commit

**Mandatory checklist for every commit** (enforced by git hooks):

### TDD Discipline
- [ ] **Tests written FIRST** - Test-driven, not test-after
- [ ] **Saw RED** - Tests failed initially (proves test works)
- [ ] **Saw GREEN** - Tests pass now (proves implementation works)
- [ ] **Tests validate change** - Not just code coverage, but meaningful validation

### Quality Gates (Automated)
- [ ] **Tests pass** - `npm run test:run` (git hook enforces)
- [ ] **No TypeScript errors** - `npm run type-check` (git hook enforces)
- [ ] **No lint errors** - `npm run lint` (git hook enforces)

### Commit Hygiene
- [ ] **Atomic change** - One logical unit, easily reversible
- [ ] **Clear message** - Format: `Action: description`
- [ ] **Valid action** - Add|Fix|Update|Remove|Refactor|Test|Docs (git hook enforces)

### Documentation (If Applicable)
- [ ] **Updated TASKS.md** - If task status changed
- [ ] **Updated STATUS.md** - If milestone reached
- [ ] **Updated CONTRACTS.md** - If types.ts changed

**Bypass (emergency only):** `git commit --no-verify`

**Why this matters:**
- Small commits = easy rollback
- Atomic changes = clear history
- Test-first proof = RED→GREEN evidence
- Frequent commits = continuous safety net

---

## After Completing Work

- [ ] **Run tests** - `npm run test:run` (must pass)
- [ ] **Update TASKS.md** - Mark complete, move to "Recently Completed"
- [ ] **Update STATUS.md** - If significant milestone
- [ ] **Update test status** - `npm run test:status` (auto-updates STATUS.md + README.md)
- [ ] **Commit changes** - Small, focused commit with clear message
- [ ] **Cross-reference** - Link commit in TASKS.md if documenting completion

---

## On Edge Cases / Discoveries

When you discover something unexpected (performance issue, design constraint, new requirement):

- [ ] **Pause implementation** - Don't continue blindly
- [ ] **Document discovery** - Add to appropriate spec's SPEC.md (Design Principles or Notes)
- [ ] **Create future task** - Add to spec's TASKS.md "Next Up" if action needed
- [ ] **Update CONSTITUTION** - If it's a new edge case pattern, add it here
- [ ] **Resume** - Continue current task with documentation complete

**Example:** Today we discovered simulation speed should be user preference, not mode-specific. We paused, documented in SPEC.md, added task to TASKS.md, then resumed.

---

## Session End Checklist

Before ending work session:

- [ ] **Clear "Current Work"** - In all active spec TASKS.md files
- [ ] **Prioritize "Next Up"** - Order tasks for easy resume
- [ ] **Update STATUS.md** - Session summary and current state
- [ ] **Verify docs sync** - `npm run verify-docs` must pass
- [ ] **Commit docs** - Documentation changes committed
- [ ] **Update timestamps** - "Last Updated" fields in modified specs

---

## Creating New Documents

When you need to create a new document type:

- [ ] **Check for template** - Look in `.claude/templates/`
- [ ] **Template exists?** - Copy and fill in sections
- [ ] **No template?**
  1. Create template first in `.claude/templates/`
  2. Update `.claude/templates/README.md` with new template
  3. Update this CONSTITUTION.md if new workflow needed
  4. Then create your actual document

---

## Template System Reference

**Available Templates:** (See `.claude/templates/`)
- `SPEC-TEMPLATE.md` - Main specification
- `TASKS-TEMPLATE.md` - Task tracking
- `CONTRACTS-TEMPLATE.md` - Interface documentation
- `PLANS-TEMPLATE.md` - Roadmap and milestones
- `EXAMPLES-TEMPLATE.md` - Test scenarios and validation
- `REFERENCE-TEMPLATE.md` - Domain knowledge

**Need a new template?** Create it first, then use it.

---

## Enforcement

This constitution is enforced through:
1. **Git hooks** - Automated blocking (pre-commit, commit-msg, pre-push)
2. **Claude hooks** - Context-aware reminders (`.claude/settings.json`)
3. **Scripts** - `npm run verify-docs` checks compliance
4. **Manual adherence** - Read before starting work
5. **Code review** - Self-review against checklist

**Git hooks are installed automatically** via `npm run prepare` (runs on `npm install`)

---

## Living Document

This constitution evolves:
- Add new edge cases as discovered
- Refine workflows as patterns emerge
- Remove outdated practices
- Version and date all changes

**If you find yourself repeatedly doing something not captured here, add it.**

---

**Last Updated:** 2025-11-17
**Next Review:** After next major phase completion
