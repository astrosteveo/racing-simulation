# Quick Start Guide - NASCAR RPG Racing Simulation

**Last Updated:** 2025-11-16 | **Phase:** 7 - Polish & Extensions | **Tests:** 255/269 (94.8%)

## 30-Second Overview

This is a **NASCAR racing RPG** where driver stats and mental state affect race outcomes. Physics-based simulation (not random), built with TDD principles and layered architecture.

**Current State:** Fully playable! Run `npx tsx demo-race.ts` for a complete interactive race.

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
│   ├── TASKS.md           ← Current work, test status, next steps
│   ├── CLAUDE.md          ← Development principles (read once)
│   ├── settings.json      ← Hooks configuration
│   ├── specs/             ← ✨ NEW: Spec-centric architecture (Phase 1)
│   │   ├── INDEX.md       ← Spec overview and dependency graph
│   │   ├── physics/       ← Physics engine spec
│   │   ├── character/     ← Character/RPG spec
│   │   ├── decisions/     ← Decision system spec
│   │   ├── ui/            ← UI spec
│   │   └── game-modes/    ← Game modes spec
│   └── design/            ← Feature design docs (migrating to specs/)
│       ├── decision-system.md   ← Decision system implementation details
│       └── console-ui.md        ← Console UI implementation details
├── docs/
│   ├── SPEC.md            ← Game design (11 sections, 634 lines)
│   ├── ARCHITECTURE.md    ← System design (7 sections, 563 lines)
│   ├── EXAMPLES.md        ← Test scenarios (NASCAR reference data)
│   └── PHYSICS-REFERENCE.md  ← NASCAR formulas
├── src/
│   ├── types.ts           ← ALL interfaces (contract-first)
│   ├── engine/            ← Physics calculations
│   ├── character/         ← Driver stats, mental state, XP
│   ├── events/            ← Decision system
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

**Phase:** 7 - Polish & Extensions
**Completed:** Phases 1-6 (Planning → Core Engine → UI → Decisions → Playable Demo)

**Next Up (from TASKS.md):**
1. Fix tire wear integration (7 failing tests) - HIGH PRIORITY
2. Calibrate corner speed formula (Bristol/Daytona speeds off)
3. Calibrate lap time targets (0.66s slow at Bristol)
4. Polish and additional content (tracks, career mode)

**See `.claude/TASKS.md` for detailed task descriptions and line numbers.**

## Key Files to Know

| File | Purpose | When to Read |
|------|---------|--------------|
| `.claude/TASKS.md` | Session state, next steps | **ALWAYS read first** |
| `.claude/QUICKSTART.md` | This file | Cold start only |
| `.claude/CLAUDE.md` | Development principles | Once per project |
| `src/types.ts` | All interfaces | When editing contracts |
| `README.md` | Public-facing overview | After major milestones |
| `docs/SPEC.md` | Game design | When adding features |
| `docs/ARCHITECTURE.md` | System design | When changing structure |
| `docs/EXAMPLES.md` | NASCAR benchmarks | When calibrating physics |

## Development Principles (TL;DR)

1. **Contract-First:** All interfaces defined in `src/types.ts` before implementation
2. **Test-Driven:** Write test → Run (fail) → Implement → Run (pass) → Commit
3. **Layered Architecture:** Engine → Character → Orchestration → UI (no reverse deps)
4. **Small Commits:** Every working piece, not massive changesets
5. **Real Physics:** Simulation calculates outcomes, no predetermined results

## Common Workflows

### Resume Work After /new

1. Read `.claude/TASKS.md` (current state, next steps)
2. Read this file if needed (architecture context)
3. Start on highest priority "Next Up" task
4. Update TASKS.md continuously during work

### Add New Feature

1. Check `docs/SPEC.md` - is it in scope?
2. Design interface in `src/types.ts`
3. Write test in `tests/`
4. Implement in appropriate layer
5. Update TASKS.md with progress

### Fix Failing Test

1. Check `.claude/TASKS.md` "Test Status" section
2. Find root cause listed there (or investigate)
3. Fix in appropriate file (path in TASKS.md)
4. Run `npm run test:run` to verify
5. Update TASKS.md test status

### Before Ending Session

1. Clear "Current Work" in TASKS.md
2. Update "Next Up" priorities
3. Update timestamp in TASKS.md
4. Run `npm run verify-docs` (must pass)
5. Commit TASKS.md changes

## Token Efficiency Tips

**Avoid re-reading these unnecessarily:**
- `docs/SPEC.md` (634 lines) - Only when adding features
- `docs/ARCHITECTURE.md` (563 lines) - Only when changing structure
- `docs/EXAMPLES.md` (401 lines) - Only when calibrating physics
- `README.md` (250 lines) - Only after major milestones

**Always read these (small, high-value):**
- `.claude/TASKS.md` (149 lines) - Current state
- `.claude/QUICKSTART.md` (this file) - Cold start context

**Read once per session max:**
- `.claude/CLAUDE.md` (184 lines) - Principles don't change often

## Test Status Snapshot

**Overall:** 255/269 passing (94.8%)

**Failing Tests:** 14 total
- 7 speed calculation tests (tire wear integration)
- 6 lap time tests (calibration offset)
- 1 decision evaluator test (randomness flakiness)

**All failures are physics calibration, not architectural bugs.**

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
4. `docs/ARCHITECTURE.md` - Did we violate boundaries?
5. `docs/EXAMPLES.md` - What should this do?
6. `.claude/TASKS.md` - What were we working on?

## Documentation Sync Rules

**Update immediately:**
- `.claude/TASKS.md` - After every task, test run, or commit

**Update after milestones:**
- `README.md` - After completing phases (use sync script)
- `.claude/CLAUDE.md` - Only when principles change

**Never manual sync:**
- Test pass rates (use `scripts/update-test-status.sh`)
- Project structure (use `scripts/sync-readme.sh`)

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
- ✅ Current phase and status (Phase 7, 94.8% tests passing)
- ✅ Where to find next tasks (`.claude/TASKS.md`)
- ✅ How to run/test the code (quick commands)
- ✅ Architecture pattern (3 layers, contract-first)
- ✅ Development principles (TDD, small commits, real physics)
- ✅ Common workflows (resume work, add feature, fix test)

**Total tokens to read this file: ~2,000**
**Time to resume productive work: <2 minutes**

Now go to `.claude/TASKS.md` for specific next steps!
