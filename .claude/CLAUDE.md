# NASCAR RPG Racing Simulation - Development Guide

**Core Principle:** Build a real physics simulation with RPG progression, not a fake number generator.

This project avoids the "restart trap" through disciplined development practices. See [SPEC.md](../docs/SPEC.md), [ARCHITECTURE.md](../docs/ARCHITECTURE.md), and [EXAMPLES.md](../docs/EXAMPLES.md) for complete design documentation.

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

### Task Tracking Document

**TASKS.md is a living document** for session-to-session continuity.

**Update TASKS.md continuously as work progresses:**

**When starting work:**
1. Read TASKS.md first to understand current state
2. Move appropriate task from "Next Up" to "Current Work"
3. Note any blockers or context needed

**During work (update immediately):**
- ✅ Mark tasks complete in "Current Work" when finished
- ➡️ Move incomplete tasks back to "Next Up" with notes
- 🚫 Add new blockers to "Blocked Items" as discovered
- 📝 Add new tasks to "Next Up" as they emerge
- 🧪 Update "Test Status" after running test suite

**After completing any task:**
1. Update "Completed This Session" section
2. Run `npm run test:run` and update test status
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

### Living Documentation

**Update frequency:**
- `.claude/TASKS.md` - Continuously during work, mandatory before session end
- `README.md` - After completing major phases or milestones
- This file (CLAUDE.md) - Only when principles change

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
