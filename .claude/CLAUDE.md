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

## Session Continuity

### Task Tracking Document

**TASKS.md is a living document** for session-to-session continuity.

Update `.claude/TASKS.md` after every work session:

1. **Current Work** - What you're actively doing right now
2. **Blocked Items** - What's waiting on decisions/research
3. **Next Up** - Prioritized upcoming tasks
4. **Recent Changes** - Last 3-5 commits for context
5. **Test Status** - Current pass rate and known failures

**Why:** Makes it trivial to resume work across sessions without re-exploring the entire codebase.

See [TASKS.md](TASKS.md) for current status.

### Living Documentation

Update these after major milestones:
- `.claude/TASKS.md` - After EVERY session
- `README.md` - Project status, roadmap checkboxes
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

**Remember:**
- Code before plan = failure
- Test before implementation = success
- Commit frequently = safety
- Refer to specs = stay on track
- Update TASKS.md = easy resumption
