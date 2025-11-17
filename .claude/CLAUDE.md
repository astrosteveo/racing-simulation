# NASCAR RPG Racing Simulation - Development Guide

**Core Principle:** Build a real physics simulation with RPG progression, not a fake number generator.

This project maintains sustainable development through disciplined practices and spec-centric architecture. See [specs/INDEX.md](specs/INDEX.md) for the complete specification architecture with focused documentation for each system. Legacy monolithic docs are available at [SPEC.md](../docs/SPEC.md), [ARCHITECTURE.md](../docs/ARCHITECTURE.md), and [EXAMPLES.md](../docs/EXAMPLES.md).

## Development Workflow

**The 5-Phase Gated Approach:**

```
┌─────────────────────────────────────────────────┐
│ DEVELOPMENT GATE: No code without approval      │
└─────────────────────────────────────────────────┘

Phase 1: EXPLORE
├── Read relevant specs (SPEC.md, CONTRACTS.md, EXAMPLES.md)
├── Research domain/context
└── Understand requirements fully

Phase 2: PLAN
├── Update specs/*/SPEC.md (if requirements changed)
├── Update specs/*/PLANS.md (design decisions)
├── Document in specs/*/DECISIONS.md (if architectural choice)
└── ⚠️  CHECKPOINT: Review plan, ensure it's sound

Phase 3: TASK
├── Create actionable tasks in specs/*/TASKS.md
├── Break down into TDD-friendly steps
├── Specify files, functions, success criteria
└── ⚠️  CHECKPOINT: Approve tasks before coding

Phase 4: EXECUTE (TDD Micro-Cycles)
└── FOR EACH unit of work, run TDD cycles:
    ├── 1. Write failing test (defines success criteria)
    ├── 2. Run test (verify RED - test fails as expected)
    ├── 3. Implement minimal code (make test pass)
    ├── 4. Run test (verify GREEN - test now passes)
    ├── 5. Refactor if needed (while keeping tests green)
    ├── 6. ⚠️ COMMIT CHECKPOINT (mandatory - tests pass, atomic change)
    ├── Update specs/*/TASKS.md as you complete units
    └── Update STATUS.md after significant milestones

Phase 5: REVIEW
├── Validate all tests pass
├── Update STATUS.md (project-level summary)
├── Run npm run verify-docs
└── Mark spec tasks complete
```

**Critical Rules:**
1. **Never skip Explore and Plan** - They determine success
2. **No code without approved task** - Tasks must exist in spec TASKS.md
3. **Approval can be implicit** - If task clearly follows existing patterns, proceed
4. **Update docs continuously** - Don't batch documentation updates

**Enforcement:** This gate prevents premature implementation and ensures thoughtful design.

---

## Before Each Commit Checklist

**Every commit must pass this checklist** (enforced by git hooks):

```
⚠️  COMMIT CHECKPOINT CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TDD Discipline:
□ Tests written FIRST (test-driven, not test-after)
□ Tests failed initially (saw RED output)
□ Tests pass now (saw GREEN output)
□ Tests validate the change (not just code coverage)

Quality Gates:
□ All tests passing (npm run test:run)
□ No TypeScript errors (npm run type-check)
□ No lint errors (npm run lint)

Commit Hygiene:
□ Atomic change (one logical unit, easily reversible)
□ Clear commit message (format: "Action: description")
□ Valid action: Add|Fix|Update|Remove|Refactor|Test|Docs

Documentation (if applicable):
□ Updated relevant specs/*/TASKS.md
□ Updated STATUS.md if milestone reached
□ Updated contracts if types.ts changed
```

**Git hooks enforce these checks automatically.** You can:
- Run manual check: `npm run commit-checklist`
- Bypass hooks (emergency only): `git commit --no-verify`

**Why commit checkpoints matter:**
- Small commits = easy rollback if something breaks
- Atomic changes = clear history, bisectable bugs
- Test-first proof = RED→GREEN cycle evidence
- Frequent commits = continuous safety net

---

## Template System

**All specification documents follow standard templates** to ensure consistency.

**Available Templates:** (See `.claude/templates/README.md` for details)
- `SPEC-TEMPLATE.md` - Main specification structure
- `TASKS-TEMPLATE.md` - Task tracking format
- `CONTRACTS-TEMPLATE.md` - Interface documentation
- `PLANS-TEMPLATE.md` - Roadmap and milestones
- `EXAMPLES-TEMPLATE.md` - Test scenarios and validation
- `REFERENCE-TEMPLATE.md` - Domain knowledge

**Creating New Specs:**
1. Check if template exists in `.claude/templates/`
2. Copy template to new spec directory
3. Fill in TODO sections
4. Remove N/A sections or mark as "Not Applicable"

**Creating New Document Types:**
1. Create template first in `.claude/templates/`
2. Update `.claude/templates/README.md`
3. Update `.claude/CONSTITUTION.md` if workflow changes
4. Then create actual document from template

**Why Templates:**
- Ensures consistency across all specs
- Makes navigation predictable
- Enables automated validation
- Reduces cognitive load (same structure everywhere)

**See:** `.claude/CONSTITUTION.md` for development checklists and edge case handling.

---

## Core Principles

### 1. Contract-First Development

All systems communicate through TypeScript interfaces (`src/types.ts`).

- Define interfaces BEFORE implementation
- All data structures conform to interfaces
- Interfaces are stable; implementations are flexible
- Changing an interface requires updating all implementations

### 2. Test-Driven Development (TDD)

**Mandatory. Non-negotiable.**

1. Write test first (defines success criteria)
2. Run test (should fail)
3. Implement minimal code to pass
4. Run test (should pass)
5. Refactor if needed
6. Commit

**Why:** Prevents "looks right but doesn't work", provides rollback points, catches regressions.

### 3. Layered Architecture (Bottom-Up)

Build in order: Interfaces → Pure Functions → State Classes → Orchestration → UI

```
Engine (physics, race logic) - No UI dependencies
    ↓
Data (JSON configs) - Swappable content
    ↓
UI (presentation) - Completely replaceable
```

**Why:** Refine physics, swap data, or change UI without rewriting other layers.

### 4. Spec-Centric Organization

Each major system has its own specification directory:

```
.claude/specs/
├── physics/      - Physics engine (tire wear, fuel, lap times)
├── character/    - RPG system (skills, XP, mental state)
├── decisions/    - Decision system (pit strategy, passing)
├── ui/           - User interface (console renderer)
└── game-modes/   - Game orchestration (single race, career)
```

**Each spec contains:**
- `SPEC.md` - Requirements and design
- `CONTRACTS.md` - Interface documentation
- `TASKS.md` - Actionable work queue
- `PLANS.md` - Roadmap and milestones
- `EXAMPLES.md` - Test scenarios
- `REFERENCE.md` - Domain knowledge

**Why:** Focus on one system at a time, parallel development, token efficiency (~70% reduction).

### 5. Small, Frequent Commits

Commit after every small working piece.

**Good:** "Add tire wear calculation", "Fix: Bristol lap time off by 0.5s"
**Bad:** "Implement race engine", "WIP"

Format: `<action> <what>` with optional context.

### 6. Real Physics vs Mock Data

**ACCEPTABLE:** Simplified but realistic data (approximate track specs, fictional drivers)
**UNACCEPTABLE:** Fake physics (predetermined outcomes, random number theater)

**Why:** Real formulas with approximate inputs can be refined. Fake physics is unfixable.

---

## Development Tools & Commands

**TypeScript** - Type safety
**Vitest** - Testing
**tsx** - Run TS without build
**ESLint** - Linting

### Testing Commands (CRITICAL)

For automation/Claude Code workflows:
```bash
npm run test:run    # Run tests once and exit
```

For manual development:
```bash
npm test            # Watch mode
npm run test:ui     # Interactive UI
npm run test:coverage
```

**Never use `npm test` in automated workflows** - it runs in watch mode and blocks indefinitely.

### Git Hooks (Automated Enforcement)

**Pre-commit hooks** (blocks bad commits):
- Runs `npm run test:run` - All tests must pass
- Runs `npm run type-check` - No TypeScript errors
- Runs `npm run lint` - No linting errors
- **Location:** `.git/hooks/pre-commit` (installed automatically)

**Commit-msg hooks** (enforces format):
- Validates commit message format: `Action: description`
- Valid actions: Add, Fix, Update, Remove, Refactor, Test, Docs
- **Location:** `.git/hooks/commit-msg`

**Post-commit hooks** (reminders):
- Displays documentation sync checklist (non-blocking)
- Reminds about STATUS.md Recent Changes update
- **Location:** `.git/hooks/post-commit`

**Pre-push hooks** (blocks unsync'd pushes):
- Runs `npm run verify-docs` - Documentation must be synced
- Prevents pushing stale documentation to remote
- **Location:** `.git/hooks/pre-push`

**Hook Installation:**
```bash
npm run prepare           # Auto-installs hooks (runs on npm install)
bash scripts/install-hooks.sh  # Manual installation
```

**Bypass (emergency only):**
```bash
git commit --no-verify    # Skip pre-commit and commit-msg hooks
git push --no-verify      # Skip pre-push hooks
```

**Hook templates:** All hooks are version-controlled in `.claude/hooks/` and copied to `.git/hooks/` during installation.

**Claude hooks** (educational, non-blocking): See `.claude/settings.json` for context-aware reminders and automated documentation updates.

### Documentation Verification

```bash
npm run verify-docs    # Check if living docs are in sync
```

**Run this periodically during work to catch documentation drift:**
- Checks if STATUS.md Recent Changes includes latest commits
- Verifies STATUS.md timestamp is current
- Detects uncommitted changes to living documents
- Validates spec TASKS.md files are properly maintained

**Hooks will remind you**, but the verification script provides deterministic checks.

---

## Session Continuity

### Documentation Hierarchy (Token Efficiency)

**ALWAYS read first (high value, low tokens):**
- `.claude/STATUS.md` (~100 lines) - Project health, cross-spec status
- `.claude/QUICKSTART.md` (new sessions only) - Cold start optimization
- `specs/INDEX.md` (~200 lines) - Spec navigation hub

**When working on a specific spec:**
- `specs/[spec-name]/TASKS.md` (~100-200 lines) - Actionable work for that spec
- `specs/[spec-name]/SPEC.md` (~300-500 lines) - Full specification (read once)
- `specs/[spec-name]/EXAMPLES.md` (~200-300 lines) - Test scenarios (as needed)

**Read once per project/session:**
- `.claude/CLAUDE.md` (this file) - Development principles
- `README.md` (~280 lines) - Public overview, features

**Read only when needed (large, specific use):**
- `docs/SPEC.md` (634 lines) - Legacy monolithic spec (use spec-centric versions instead)
- `docs/ARCHITECTURE.md` (563 lines) - Only when changing system-wide structure
- `docs/EXAMPLES.md` (401 lines) - Legacy examples (use spec-centric versions instead)

**Token efficiency tip:**
- Single-spec work: ~500 tokens (STATUS.md + one spec's TASKS.md + SPEC.md)
- Cross-spec work: ~1500 tokens (STATUS.md + multiple specs)
- Full context: ~3000 tokens (all specs vs 8000+ monolithic)

---

### Spec-Specific Task Tracking

**Each spec has its own TASKS.md** - the source of truth for that spec's work.

**When starting work on a spec:**
1. Read `STATUS.md` to understand project status
2. Navigate to relevant spec (e.g., `specs/game-modes/`)
3. Read that spec's `TASKS.md` to see active work
4. Move appropriate task from "Next Up" to "Current Work"

**During work (update immediately):**
- ✅ Mark tasks complete in spec's `TASKS.md` when finished
- ➡️ Move incomplete tasks back to "Next Up" with notes
- 🚫 Add new blockers to "Blocked Items" as discovered
- 📝 Add new tasks to "Next Up" as they emerge
- 🧪 Update "Test Status" in spec's `TASKS.md` after running tests

**After completing any task:**
1. Update spec's "Completed" section in `TASKS.md`
2. Update project-level `STATUS.md` if it's a significant milestone
3. Run `npm run test:status` (auto-updates STATUS.md + README.md)
4. Update `STATUS.md` "Recent Changes" with latest commits
5. Run `npm run verify-docs` to catch any drift
6. Commit changes (include both spec TASKS.md and STATUS.md if both changed)

**Before ending session (mandatory):**
1. Clear "Current Work" in all active spec TASKS.md files
2. Ensure "Next Up" is prioritized for easy resume
3. Update timestamps in modified files
4. Update project `STATUS.md` with session summary
5. Run `npm run verify-docs` - must pass
6. Commit documentation changes

**Why:** Decentralized ownership, focused work, clear boundaries between systems.

---

### Living Documentation Sync

**Update immediately (automated):**
- Test pass rates: `npm run test:status` (updates STATUS.md + README.md)

**Update after milestones (semi-automated):**
- `README.md`: `npm run sync-readme` (syncs dates, test status, prompts for manual checks)

**Update continuously:**
- `.claude/STATUS.md` - After each session, after milestones
- `specs/*/TASKS.md` - During work on that spec
- `.claude/QUICKSTART.md` - After major phase completions

**Update rarely:**
- `.claude/CLAUDE.md` (this file) - Only when principles change
- `specs/*/SPEC.md` - Only when requirements change for that spec
- `specs/*/PLANS.md` - Only when roadmap changes for that spec
- `docs/ARCHITECTURE.md` - Only when system design changes

**Verification:**
- `npm run verify-docs` - Automated checks for drift

**Outdated documentation is worse than no documentation.**

---

## Spec-Centric Workflow

### Single-Spec Work (Most Common)

**Example: Working on career mode save/load**

1. Read `STATUS.md` (understand project state)
2. Navigate to `specs/game-modes/`
3. Read `TASKS.md` (see Task #1: Implement save/load system)
4. Read `SPEC.md` section on save/load (if needed for context)
5. Move task to "Current Work" in `game-modes/TASKS.md`
6. Implement (TDD: test → code → refactor → commit)
7. Mark task complete in `game-modes/TASKS.md`
8. Update `STATUS.md` if significant milestone
9. Commit both files

**Token cost:** ~500-700 tokens (very efficient!)

---

### Cross-Spec Work (Less Common)

**Example: Adding tire temperature affects physics, decisions, and UI**

1. Read `STATUS.md` (understand current state)
2. Document in `STATUS.md` "Cross-Spec Coordination" section
3. For each affected spec:
   - Read that spec's `TASKS.md`
   - Create task in that spec's `TASKS.md`
   - Link tasks together (reference other specs)
4. Work through tasks spec by spec
5. Update each spec's `TASKS.md` as you go
6. Update `STATUS.md` when cross-spec work complete
7. Commit all affected spec TASKS.md files + STATUS.md

**Token cost:** ~1500-2000 tokens (still better than monolithic)

---

## Quick Reference

**When stuck:**
1. Check `git log` - find last working commit
2. Check `git diff` - what changed?
3. Check test output - what's failing?
4. Check `docs/ARCHITECTURE.md` - did we violate boundaries?
5. Check spec's `EXAMPLES.md` - what should this do?
6. Check spec's `TASKS.md` - what were we working on?
7. Check `STATUS.md` - what's the project status?

**When starting new work:**
1. Identify which spec (use `specs/INDEX.md` if unclear)
2. Read that spec's `TASKS.md`
3. Verify task is approved (in "Next Up" section)
4. If no task exists, create one following Process Gate
5. Move to "Current Work" and begin

**Anti-patterns to avoid:**
- Coding without planning (violates Process Gate)
- Building without testing (violates TDD)
- No clear success criteria (violates task format)
- Massive commits (violates small commits principle)
- Scope creep (check spec's SPEC.md for boundaries)
- Tightly coupled code (violates layered architecture)
- Working without approved task (violates Process Gate)

**Development Rhythm:**
- Explore before planning = understand problem
- Plan before coding = design solution
- Task before executing = break down work
- Test before implementation = define success
- Commit frequently = safety net
- Refer to specs = stay on track
- Update TASKS.md continuously = easy resumption
- Review before next task = validate quality

**Task Completion Workflow:**
1. Complete task (tests pass, code works)
2. Update spec's TASKS.md (mark complete, update test status)
3. Update STATUS.md if significant milestone
4. Commit changes (small, focused commits)
5. Move to next task

---

## Process Gate Examples

### Example 1: Approved Task (Proceed)

**Scenario:** Task exists in `specs/game-modes/TASKS.md`:
```
### 1. Implement save/load system (HIGH PRIORITY)
[...detailed breakdown...]
```

**Action:** Move to "Current Work", begin implementation. No additional approval needed.

---

### Example 2: No Task Exists (Create First)

**Scenario:** Want to add tire temperature feature, but no task exists.

**Action:**
1. **Explore:** Read `specs/physics/SPEC.md`, research tire temperature formulas
2. **Plan:** Update `specs/physics/PLANS.md` with design decision
3. **Task:** Create detailed task in `specs/physics/TASKS.md`
4. **Approve:** Self-approve if following existing patterns, or ask user
5. **Execute:** Begin implementation

**Do NOT skip to execution!**

---

### Example 3: Cross-Spec Feature

**Scenario:** Adding qualifying system (affects game-modes, physics, ui).

**Action:**
1. **Explore:** Read all affected specs
2. **Plan:** Update `game-modes/PLANS.md` with qualifying design
3. **Task:** Create tasks in:
   - `specs/game-modes/TASKS.md` (qualifying flow)
   - `specs/physics/TASKS.md` (qualifying lap time calculation)
   - `specs/ui/TASKS.md` (qualifying results display)
4. **Coordinate:** Document in `STATUS.md` "Cross-Spec Coordination"
5. **Approve:** Review all tasks, ensure coherent plan
6. **Execute:** Work through tasks spec by spec

---

## Sustainable Development Philosophy

This project follows disciplined practices to prevent common pitfalls:

**Preventing False Starts:**
- ✅ Spec-first design (requirements before code)
- ✅ Contract-first interfaces (define boundaries)
- ✅ Test-first implementation (success criteria upfront)
- ✅ Process gate (no coding without planning)

**Preventing Technical Debt:**
- ✅ Layered architecture (clean separation)
- ✅ Small commits (easy rollback)
- ✅ Continuous testing (catch regressions early)
- ✅ Living documentation (specs stay current)

**Preventing Scope Creep:**
- ✅ Spec boundaries (each system has clear scope)
- ✅ PLANS.md roadmap (future features documented, not implemented)
- ✅ Phase gates (complete current before starting next)

**Preventing Documentation Drift:**
- ✅ Automated sync tools (`test:status`, `verify-docs`)
- ✅ Spec-centric docs (docs next to code conceptually)
- ✅ Living documents (update continuously, not in batch)
- ✅ Hooks (reminders to sync)

**Results:**
- 374/379 tests passing (98.7%)
- 0 TypeScript errors, 0 ESLint errors
- 5 focused specs, each self-contained
- Fully playable game (demo-race.ts, demo-career.ts)
- Clear path forward (career mode MVP)

---

## Quick Commands Reference

```bash
# Test suite
npm run test:run          # Run all tests once (automation-friendly)
npm test                  # Watch mode (manual dev)
npm run test:ui           # Interactive test UI
npm run test:coverage     # Coverage report

# Documentation (Automated sync)
npm run verify-docs       # Check if living docs are in sync
npm run test:status       # Auto-update test counts in STATUS.md + README.md
npm run sync-readme       # Sync README.md with STATUS.md
npm run validate-tasks    # Check that tasks follow actionable format
npm run verify-specs      # Validate all specs have required files

# Run demos
npm run play              # Interactive race (100 laps at Bristol)
npm run career            # Career mode demo (5-race progression)

# Type checking & linting
npm run type-check        # Verify no TS errors
npm run lint              # Check code style
npm run lint:fix          # Auto-fix linting issues
```

---

**Last Updated:** 2025-11-16
**Next Review:** When development principles evolve or new practices emerge
