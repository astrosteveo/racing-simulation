# Specifications Index

**Last Updated:** 2025-11-16
**Total Specs:** 5
**Status:** Phase 1 - Foundation (Structure Created)

---

## Overview

This directory contains the **spec-centric documentation architecture** for the NASCAR RPG Racing Simulation. Each major system component has its own specification directory with dedicated contracts, plans, architectural decisions, tasks, and examples.

**Purpose:** Enable focused, parallel development by organizing documentation around distinct system specifications rather than monolithic documents.

---

## Active Specifications

### 1. Physics Engine (`physics/`)
**Status:** 🟢 Active (98% complete)
**Owner:** Physics Team
**Dependencies:** None (bottom of stack)

**Scope:** Core racing physics simulation
- Tire wear and grip degradation
- Fuel consumption and weight impact
- Aerodynamics (drafting, downforce)
- Lap time calculations
- Corner speed formulas

**Key Interfaces:** `Track`, `CarState`, `PhysicsConstants`

**Quick Start:**
```bash
cd .claude/specs/physics/
cat SPEC.md          # Full specification
cat TASKS.md         # Current physics tasks
```

---

### 2. Character/RPG System (`character/`)
**Status:** 🟢 Active (95% complete)
**Owner:** RPG Team
**Dependencies:** None (parallel to physics)

**Scope:** Driver progression and mental state
- Driver skills (10 categories, 0-100 scale)
- Mental state dynamics (confidence, frustration, focus)
- XP progression and leveling
- Career stats tracking

**Key Interfaces:** `Driver`, `DriverSkills`, `MentalState`, `XPGain`

**Quick Start:**
```bash
cd .claude/specs/character/
cat SPEC.md          # Full specification
cat TASKS.md         # Current character tasks
```

---

### 3. Decision/Event System (`decisions/`)
**Status:** 🟡 In Progress (80% complete)
**Owner:** Gameplay Team
**Dependencies:** Physics, Character

**Scope:** Timed strategic decisions
- Decision types (pit, passing, mental state, tire mgmt)
- Event generation and triggering
- Outcome calculation (skill-based)
- Effect application to game state

**Key Interfaces:** `Decision`, `DecisionOption`, `DecisionResult`, `DecisionManager`

**Quick Start:**
```bash
cd .claude/specs/decisions/
cat SPEC.md          # Full specification
cat TASKS.md         # Current decision tasks
```

---

### 4. User Interface (`ui/`)
**Status:** 🟢 Active (90% complete)
**Owner:** UI Team
**Dependencies:** Physics, Character, Decisions (displays their state)

**Scope:** Console-based user interface
- Live race display
- Race results screen
- Decision prompts
- Menu system
- Formatting utilities

**Key Interfaces:** `UIRenderer`, `RaceDisplay`, `MenuHandler`

**Quick Start:**
```bash
cd .claude/specs/ui/
cat SPEC.md          # Full specification
cat TASKS.md         # Current UI tasks
```

---

### 5. Game Modes & Flow (`game-modes/`)
**Status:** 🔴 Planned (10% complete)
**Owner:** Core Team
**Dependencies:** All (orchestrates entire game)

**Scope:** Game loop and mode management
- Career mode
- Single race
- Time trial
- Save/load system
- Season structure

**Key Interfaces:** `RaceManager`, `RaceState`, `GameState`, `RaceConfig`

**Quick Start:**
```bash
cd .claude/specs/game-modes/
cat SPEC.md          # Full specification
cat TASKS.md         # Current game mode tasks
```

---

## Dependency Graph

```mermaid
graph TD
    Physics[Physics Engine<br/>physics/]
    Character[Character/RPG<br/>character/]
    Decisions[Decision System<br/>decisions/]
    UI[User Interface<br/>ui/]
    GameModes[Game Modes<br/>game-modes/]

    GameModes --> UI
    GameModes --> Decisions
    GameModes --> Character
    GameModes --> Physics

    UI --> Decisions
    UI --> Character
    UI --> Physics

    Decisions --> Character
    Decisions --> Physics

    Character -.optional.-> Physics
    Physics

    style Physics fill:#90EE90
    style Character fill:#90EE90
    style Decisions fill:#FFD700
    style UI fill:#90EE90
    style GameModes fill:#FFB6C1
```

**Legend:**
- 🟢 Green: Active/Stable
- 🟡 Yellow: In Progress
- 🔴 Red: Planned/Early Stage
- Solid arrow: Hard dependency (required)
- Dashed arrow: Optional dependency

---

## Spec Structure

Each spec directory contains:

| File | Purpose |
|------|---------|
| `SPEC.md` | Complete specification with requirements, design, scope |
| `CONTRACTS.md` | Interface documentation (synced with src/types.ts) |
| `PLANS.md` | Versioned roadmap, milestones, feature plans |
| `DECISIONS.md` | Architectural Decision Records (ADRs) |
| `TASKS.md` | Spec-specific actionable tasks |
| `EXAMPLES.md` | Test scenarios, validation targets |
| `REFERENCE.md` | Domain-specific reference data (e.g., NASCAR physics) |

---

## Working with Specs

### Single-Spec Workflow

**1. Choose your spec:**
```bash
# Working on tire wear calibration?
cd .claude/specs/physics/

# Working on XP progression?
cd .claude/specs/character/

# Working on decision outcomes?
cd .claude/specs/decisions/
```

**2. Understand current state:**
```bash
cat TASKS.md         # What needs doing?
cat SPEC.md          # What is this spec?
cat CONTRACTS.md     # What interfaces exist?
```

**3. Work on tasks:**
- Update implementation (src/)
- Update tests (tests/)
- Update spec docs as needed

**4. Update documentation:**
```bash
# Update spec-specific docs
vim TASKS.md         # Mark tasks complete, add new ones
vim CONTRACTS.md     # If interfaces changed
vim PLANS.md         # If roadmap changed
```

**5. Validate:**
```bash
npm run test:spec:physics      # Spec-specific tests (future)
npm run verify-specs           # Validate spec structure
```

---

### Cross-Spec Workflow

**When work spans multiple specs:**

1. Read `.claude/TASKS.md` (cross-spec coordination)
2. Identify all affected specs
3. Update each spec's TASKS.md
4. Update dependency graph if needed
5. Run integration tests

**Example:** Adding tire temperature affects:
- `physics/` - New temperature calculation
- `decisions/` - Tire management decisions need temp awareness
- `ui/` - Display tire temperature

---

## Navigation Tips

**Quick spec lookup:**
```bash
# List all specs
ls .claude/specs/

# Find spec by keyword
grep -r "tire wear" .claude/specs/*/SPEC.md

# Check spec status
cat .claude/specs/INDEX.md
```

**Token efficiency:**
- Single-spec work: Read only that spec's docs (~500 tokens)
- Cross-spec work: Read affected specs only (~1500 tokens)
- Full context: Read all specs (~3000 tokens vs 8000+ monolithic)

---

## Spec Health Dashboard

| Spec | Tests | Tasks | Status |
|------|-------|-------|--------|
| Physics | 95/100 (95%) | 2 remaining | 🟢 Healthy |
| Character | 18/18 (100%) | 0 remaining | 🟢 Healthy |
| Decisions | 12/20 (60%) | 5 remaining | 🟡 In Progress |
| UI | 45/45 (100%) | 3 enhancements | 🟢 Healthy |
| Game Modes | 0/0 (N/A) | Not started | 🔴 Planned |

**Overall:** 170/183 tests passing (93%)

*(Auto-updated by `scripts/spec-status.sh`)*

---

## Migration Status

**Phase 1: Foundation** ✅ Complete (2025-11-16)
- Directory structure created
- Template files added
- INDEX.md created
- Automation scripts (verify-specs, sync-contracts, spec-status)

**Phase 2: Physics Migration** ✅ Complete (2025-11-16)
- ✅ Migrated docs/PHYSICS-REFERENCE.md → specs/physics/REFERENCE.md
- ✅ Extracted physics algorithms from docs/SPEC.md → specs/physics/SPEC.md
- ✅ Extracted physics examples from docs/EXAMPLES.md → specs/physics/EXAMPLES.md
- ✅ Enhanced EXAMPLES.md with 6 comprehensive examples and validation tables
- ✅ Documented all physics interfaces in specs/physics/CONTRACTS.md
- ✅ Updated physics SPEC.md status to v1.1 (Content Migrated)

**Benefits Achieved:**
- **~75% token reduction** for physics-only work (500 tokens vs 2000+)
- **Clear separation** of physics from other systems
- **Comprehensive documentation** with examples, formulas, and validation targets
- **Ready for use** - Physics spec fully self-contained

**Phase 3: Character Migration** ✅ Complete (2025-11-16)
- ✅ Extracted character/RPG content from docs/SPEC.md → specs/character/SPEC.md
- ✅ Migrated character examples from docs/EXAMPLES.md → specs/character/EXAMPLES.md
- ✅ Documented all character interfaces in specs/character/CONTRACTS.md
- ✅ Created comprehensive REFERENCE.md with formulas and XP tables
- ✅ 4 complete files: SPEC, EXAMPLES, CONTRACTS, REFERENCE

**Benefits Achieved:**
- **~70% token reduction** for character-only work
- **Complete skill system** documented with formulas and effects
- **Mental state mechanics** fully specified
- **XP progression** tables and pacing validation

**Phase 4: Decisions Migration** 🔄 Next
- Extract decision/event content from docs/SPEC.md
- Migrate to specs/decisions/ directory

**Phases 5-6:** UI, Game Modes (pending)

**Phase 7:** Cleanup & consolidation (pending)

---

## Automation Tools

```bash
# Validate all specs have required files
npm run verify-specs

# Check CONTRACTS.md vs src/types.ts sync
npm run sync-contracts

# Generate spec status dashboard
npm run spec-status

# Run spec-specific tests (future)
npm run test:spec:physics
npm run test:spec:character
```

---

## Adding a New Spec

1. **Create directory:** `mkdir .claude/specs/[new-spec]/`
2. **Copy templates:** From existing spec or use templates below
3. **Define scope:** Clear boundaries, dependencies
4. **Extract contracts:** Relevant interfaces from src/types.ts
5. **Create tasks:** Actionable spec-specific tasks
6. **Update INDEX.md:** Add to list, dependency graph
7. **Validate:** Run `npm run verify-specs`

---

## Best Practices

1. **One spec, one concern** - Keep specs focused
2. **Document dependencies** - Update dependency graph
3. **Keep contracts synced** - Run `sync-contracts.sh` regularly
4. **Update tasks continuously** - Don't batch updates
5. **Link, don't duplicate** - Reference other specs instead of copying
6. **Validate before committing** - Run `verify-specs`

---

## Questions?

- **Workflow unclear?** See `.claude/QUICKSTART.md`
- **Development principles?** See `.claude/CLAUDE.md`
- **Architecture overview?** See `docs/ARCHITECTURE.md`
- **Spec-specific questions?** See that spec's SPEC.md

---

**Last Reviewed:** 2025-11-16
**Next Review:** After Phase 2 migration
