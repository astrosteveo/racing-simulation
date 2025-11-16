# NASCAR RPG Racing Simulation - Development Guide

**Core Principle:** Build a real physics simulation with RPG progression, not a fake number generator.

This project avoids the "restart trap" through disciplined development practices. See [specs/INDEX.md](specs/INDEX.md) for the spec-centric documentation architecture with focused specifications for each system. Legacy monolithic docs are available at [SPEC.md](../docs/SPEC.md), [ARCHITECTURE.md](../docs/ARCHITECTURE.md), and [EXAMPLES.md](../docs/EXAMPLES.md).

## Development Workflow

**The 4-Phase Approach:**

1. **Explore** - Research domain, gather context, understand requirements
2. **Plan** - Design architecture, define contracts, write specs
3. **Execute** - Implement following TDD principles
4. **Review** - Validate, test, refine

**Critical Rule:** Never skip Explore and Plan. They determine success.

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

### 4. Small, Frequent Commits

Commit after every small working piece.

**Good:** "Add tire wear calculation", "Fix: Bristol lap time off by 0.5s"
**Bad:** "Implement race engine", "WIP"

Format: `<action> <what>` with optional context.

### 5. Real Physics vs Mock Data

**ACCEPTABLE:** Simplified but realistic data (approximate track specs, fictional drivers)
**UNACCEPTABLE:** Fake physics (predetermined outcomes, random number theater)

**Why:** Real formulas with approximate inputs can be refined. Fake physics is unfixable.

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

### Documentation Verification

```bash
npm run verify-docs    # Check if living docs are in sync
```

**Run this periodically during work to catch documentation drift:**
- Checks if TASKS.md Recent Changes includes latest commits
- Verifies TASKS.md timestamp is current
- Detects uncommitted changes to living documents
- Validates Current Work section is properly maintained

**Hooks will remind you**, but the verification script provides deterministic checks.

## Session Continuity

### Documentation Hierarchy (Token Efficiency)

**ALWAYS read first (high value, low tokens):**
- `.claude/TASKS.md` (149 lines) - Current state, next steps, test status
- `.claude/QUICKSTART.md` (new sessions only) - Cold start optimization

**Read once per project/session:**
- `.claude/CLAUDE.md` (this file, 184 lines) - Development principles
- `README.md` (250 lines) - Public overview, features

**Read only when needed (large, specific use):**
- `docs/SPEC.md` (634 lines) - Only when adding features
- `docs/ARCHITECTURE.md` (563 lines) - Only when changing structure
- `docs/EXAMPLES.md` (401 lines) - Only when calibrating physics

**Read for feature-specific context (planning artifacts):**
- `.claude/design/decision-system.md` (210 lines) - Decision system implementation details
- `.claude/design/console-ui.md` (227 lines) - Console UI implementation details
- Read these when working on their specific features, not routinely

**Token efficiency tip:** Use Grep/search instead of reading entire large files.

### Task Tracking Document

**TASKS.md is a living document** for session-to-session continuity.

**Update TASKS.md continuously as work progresses:**

**When starting work:**
1. Read TASKS.md first to understand current state
2. Move appropriate task from "Next Up" to "Current Work"
3. Tasks are now actionable with specific files/lines/steps

**During work (update immediately):**
- ✅ Mark tasks complete in "Current Work" when finished
- ➡️ Move incomplete tasks back to "Next Up" with notes
- 🚫 Add new blockers to "Blocked Items" as discovered
- 📝 Add new tasks to "Next Up" as they emerge
- 🧪 Update "Test Status" after running test suite

**After completing any task:**
1. Update "Completed This Session" section
2. Run `npm run test:status` (auto-updates TASKS.md + README.md)
3. Update "Recent Changes" with latest commits
4. Review "Next Up" priorities - reorder if needed
5. Run `npm run verify-docs` to catch any drift

**Before ending session (mandatory):**
1. Clear "Current Work" section (move to completed or next up)
2. Ensure "Next Up" is prioritized for easy resume
3. Update timestamp at top of file
4. Run `npm run verify-docs` - must pass
5. Commit TASKS.md changes

**Why:** Keep context fresh. Eliminate "where was I?" when resuming. Track progress without losing momentum.

See [TASKS.md](TASKS.md) for current status.

### Living Documentation Sync

**Update immediately (automated):**
- Test pass rates: `npm run test:status` (updates TASKS.md + README.md)

**Update after milestones (semi-automated):**
- `README.md`: `npm run sync-readme` (syncs dates, test status, prompts for manual checks)

**Update continuously:**
- `.claude/TASKS.md` - During work, mandatory before session end
- `.claude/QUICKSTART.md` - After major phase completions

**Update rarely:**
- `.claude/CLAUDE.md` - Only when principles change
- `docs/SPEC.md` - Only when requirements change
- `docs/ARCHITECTURE.md` - Only when system design changes

**Verification:**
- `npm run verify-docs` - Automated checks for drift

**Outdated documentation is worse than no documentation.**

## Quick Reference

**When stuck:**
1. Check `git log` - find last working commit
2. Check `git diff` - what changed?
3. Check test output - what's failing?
4. Check ARCHITECTURE.md - did we violate boundaries?
5. Check EXAMPLES.md - what should this do?
6. Check TASKS.md - what were we working on?

**Anti-patterns to avoid:**
- Building without testing
- No clear success criteria
- Massive commits
- Scope creep (check SPEC.md)
- Tightly coupled code

**Development Rhythm:**
- Code before plan = failure
- Test before implementation = success
- Commit frequently = safety
- Refer to specs = stay on track
- **Update TASKS.md continuously = easy resumption**

**Task Completion Workflow:**
1. Complete task
2. Update TASKS.md (mark complete, update test status)
3. Commit changes
4. Move to next task
