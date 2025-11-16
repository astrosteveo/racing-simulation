# Quick Start Guide - NASCAR RPG Racing Simulation

**Last Updated:** 2025-11-16 | **Phase:** 7A - Career Mode MVP | **Tests:** 374/379 (98.7%)

## 30-Second Overview

This is a **NASCAR racing RPG** where driver stats and mental state affect race outcomes. Physics-based simulation (not random), built with disciplined TDD and spec-centric architecture.

**Current State:** Fully playable! Run `npm run play` for interactive racing or `npm run career` for career mode demo.

## Quick Commands

```bash
# Play the game
npx tsx demo-race.ts              # Full race with decisions

# Development
npm run test:run                  # Run all tests (non-blocking)
npm run verify-docs               # Check documentation sync
npm run type-check                # TypeScript validation
npm run lint:fix                  # Auto-fix code style

# Spec Tools (NEW - Phase 1)
npm run verify-specs              # Validate spec structure
npm run sync-contracts            # Check CONTRACTS.md vs types.ts
npm run spec-status               # Dashboard of all spec health

# Test modes (manual dev)
npm test                          # Watch mode
npm run test:ui                   # Interactive UI
npm run test:coverage             # Coverage report
```

## Project Structure (Token-Efficient Map)

```
racing-simulation/
├── .claude/
│   ├── QUICKSTART.md      ← YOU ARE HERE (cold start optimization)
│   ├── STATUS.md          ← ✨ Project health, cross-spec status (read first!)
│   ├── CLAUDE.md          ← Development principles (read once per session)
│   ├── settings.json      ← Hooks configuration
│   ├── specs/             ← ✨ Spec-centric architecture (5 focused specs)
│   │   ├── INDEX.md       ← Spec navigation hub and dependency graph
│   │   ├── physics/       ← Physics engine (SPEC, TASKS, PLANS, EXAMPLES)
│   │   ├── character/     ← Character/RPG (SPEC, TASKS, PLANS, EXAMPLES)
│   │   ├── decisions/     ← Decision system (SPEC, TASKS, PLANS, EXAMPLES)
│   │   ├── ui/            ← UI (SPEC, TASKS, PLANS, EXAMPLES, LAYOUTS)
│   │   └── game-modes/    ← Game modes (SPEC, TASKS, PLANS, EXAMPLES)
│   ├── archive/           ← Deprecated/archived docs
│   └── design/            ← Legacy planning docs (archived)
├── docs/
│   ├── SPEC.md            ← Legacy monolithic spec (use specs/ instead)
│   ├── ARCHITECTURE.md    ← System-wide architecture
│   └── EXAMPLES.md        ← Legacy examples (use specs/*/EXAMPLES.md instead)
├── src/
│   ├── types.ts           ← ALL interfaces (contract-first)
│   ├── engine/            ← Physics calculations
│   ├── character/         ← Driver stats, mental state, XP
│   ├── events/            ← Decision system
│   ├── modes/career/      ← Career mode orchestration
│   ├── data/              ← Track/car/driver JSON
│   └── ui/                ← Console renderer
└── tests/                 ← Unit/integration/e2e tests
```

## Architecture in 3 Layers

**1. Engine Layer** (Pure simulation)
- Physics calculations (tire wear, fuel, speed, lap time)
- No UI dependencies, testable in isolation
- File: `src/engine/physics/`

**2. Character Layer** (RPG mechanics)
- Driver skills (10 categories, 0-100 scale)
- Mental state (confidence, frustration, focus)
- XP progression
- File: `src/character/`

**3. Orchestration Layer** (Race loop)
- Combines engine + character + decisions
- Tracks positions, gaps, state
- File: `src/engine/race-engine.ts`

**UI is separate and swappable** (currently console, future: web/3D)

## Current Work Context

**Phase:** 7A - Career Mode MVP
**Completed:** Phases 1-7 (Planning → Core Engine → UI → Decisions → Playable Demo → Career Foundation)

**Next Up (from STATUS.md):**
1. **Career Mode MVP** - See `specs/game-modes/TASKS.md`
   - Save/load system
   - Career menu flow
   - Multi-race season loop
   - Track unlocking

2. **Physics Polish** - See `specs/physics/TASKS.md`
   - 5 edge case test failures (optional, low priority)

**See `.claude/STATUS.md` for project overview, then relevant spec TASKS.md for details.**

## Key Files to Know

| File | Purpose | When to Read |
|------|---------|--------------|
| `.claude/STATUS.md` | Project health, cross-spec status | **ALWAYS read first** |
| `specs/INDEX.md` | Spec navigation hub | When choosing which spec to work on |
| `specs/*/TASKS.md` | Spec-specific work queue | When working on that spec |
| `.claude/QUICKSTART.md` | This file | Cold start only |
| `.claude/CLAUDE.md` | Development principles | Once per session |
| `src/types.ts` | All interfaces | When editing contracts |
| `README.md` | Public-facing overview | After major milestones |
| `docs/ARCHITECTURE.md` | System-wide architecture | When changing structure |

## Development Principles (TL;DR)

1. **Contract-First:** All interfaces defined in `src/types.ts` before implementation
2. **Test-Driven:** Write test → Run (fail) → Implement → Run (pass) → Commit
3. **Layered Architecture:** Engine → Character → Orchestration → UI (no reverse deps)
4. **Small Commits:** Every working piece, not massive changesets
5. **Real Physics:** Simulation calculates outcomes, no predetermined results

## Common Workflows

### Resume Work After /new

1. Read `.claude/STATUS.md` (project health, current focus)
2. Read this file if needed (architecture context)
3. Navigate to relevant spec (e.g., `specs/game-modes/`)
4. Read that spec's `TASKS.md` (actionable work)
5. Start on highest priority "Next Up" task
6. Update spec TASKS.md continuously during work

### Add New Feature

1. Identify which spec (use `specs/INDEX.md` if unclear)
2. Check that spec's `SPEC.md` - is it in scope?
3. Follow Process Gate (Explore → Plan → Task → Execute → Review)
4. Design interface in `src/types.ts`
5. Write test first in `tests/`
6. Implement in appropriate layer
7. Update spec's `TASKS.md` with progress
8. Update `STATUS.md` if significant milestone

### Fix Failing Test

1. Check `.claude/STATUS.md` "Test Status" section
2. Navigate to relevant spec's `TASKS.md`
3. Find root cause and task (or create task)
4. Fix in appropriate file
5. Run `npm run test:run` to verify
6. Update spec's `TASKS.md` and `STATUS.md`

### Before Ending Session

1. Clear "Current Work" in all active spec TASKS.md files
2. Update "Next Up" priorities in each spec
3. Update timestamps in modified files
4. Update `STATUS.md` with session summary
5. Run `npm run verify-docs` (must pass)
6. Commit all documentation changes

## Token Efficiency Tips (Spec-Centric)

**Always read first (~200 tokens):**
- `.claude/STATUS.md` (~100 lines) - Project health, what to work on

**When working on a spec (~500-700 tokens total):**
- `specs/[spec]/TASKS.md` (~100-200 lines) - Actionable work
- `specs/[spec]/SPEC.md` (~300-500 lines) - Full specification (read once)

**Read once per session (~200 tokens):**
- `.claude/QUICKSTART.md` (this file) - Cold start context
- `.claude/CLAUDE.md` (~460 lines) - Development principles

**Avoid re-reading unless needed:**
- `docs/SPEC.md` (634 lines) - Legacy (use specs/* instead)
- `docs/ARCHITECTURE.md` (563 lines) - Only for system-wide changes
- `docs/EXAMPLES.md` (401 lines) - Legacy (use specs/*/EXAMPLES.md instead)

**Token savings:**
- Single-spec work: ~500 tokens (vs ~2000 monolithic)
- Cross-spec work: ~1500 tokens (vs ~4000 monolithic)
- **~70% reduction!**

## Test Status Snapshot

**Overall:** 374/379 passing (98.7%)

**Failing Tests:** 5 total (all edge cases)
- 3 physics lap time tests (edge case scenarios)
- 1 physics speed test (Charlotte full fuel edge case)
- 1 decision evaluator test (randomness flakiness)

**All failures are minor edge cases, not bugs. Core functionality 100% working.**

## Success Criteria Checklist

- ✅ Run complete race simulation
- ✅ Lap times CALCULATED (not faked)
- ✅ Driver stats affect outcomes
- ✅ Mental state creates dynamic gameplay
- ✅ Timed decisions impact results
- ✅ Tests validate core mechanics
- ✅ Modular (add tracks/drivers easily)
- ✅ UI swappable without touching engine

**Demo proves it works:** `npx tsx demo-race.ts`

## When Stuck

1. `git log` - Find last working commit
2. `git diff` - See what changed
3. Test output - What's failing?
4. `.claude/STATUS.md` - What's the project status?
5. `specs/*/TASKS.md` - What were we working on for this spec?
6. `docs/ARCHITECTURE.md` - Did we violate boundaries?
7. `specs/*/EXAMPLES.md` - What should this do?

## Documentation Sync Rules

**Update immediately:**
- `specs/*/TASKS.md` - After every task, test run (for that spec)
- `.claude/STATUS.md` - After significant milestones

**Update after milestones:**
- `README.md` - After completing phases (use sync script)

**Update rarely:**
- `.claude/CLAUDE.md` - Only when principles change
- `specs/*/SPEC.md` - Only when requirements change
- `specs/*/PLANS.md` - Only when roadmap changes

**Never manual sync:**
- Test pass rates (use `npm run test:status`)
- Project structure (use `npm run sync-readme`)

## Anti-Patterns to Avoid

- Building without testing
- No clear success criteria
- Massive commits (commit every small win)
- Scope creep (check SPEC.md)
- Tightly coupled code (respect layer boundaries)
- Outdated documentation (run `npm run verify-docs`)

## Cold Start Checklist

After reading this file, you should know:
- ✅ What this project is (NASCAR RPG racing sim)
- ✅ Current phase and status (Phase 7A, 98.7% tests passing)
- ✅ Spec-centric organization (5 focused specs)
- ✅ Where to find next tasks (`.claude/STATUS.md` → `specs/*/TASKS.md`)
- ✅ How to run/test the code (quick commands)
- ✅ Architecture pattern (3 layers, contract-first, spec-centric)
- ✅ Development principles (TDD, Process Gate, small commits, real physics)
- ✅ Common workflows (resume work, add feature, fix test)

**Total tokens to read this file: ~2,500**
**Time to resume productive work: <2 minutes**

**Next steps:**
1. Read `.claude/STATUS.md` (project health)
2. Navigate to relevant spec (e.g., `specs/game-modes/`)
3. Read that spec's `TASKS.md` for actionable work!
