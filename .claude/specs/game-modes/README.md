# Game Modes & Flow Specification

**Status:** Phase 1 - Structure Created (Templates Pending)
**Phase 2 Migration:** Extract from `docs/SPEC.md` and existing implementation

## Files to Create in Phase 2

- `SPEC.md` - Game modes specification (career, single race, time trial)
- `CONTRACTS.md` - RaceManager, RaceState, GameState interfaces
- `PLANS.md` - Game mode roadmap (multiplayer, historical seasons)
- `DECISIONS.md` - ADRs for game flow, save/load system
- `TASKS.md` - Game mode tasks
- `EXAMPLES.md` - Game flow scenarios, mode transitions

## Migration Sources

**From `docs/SPEC.md`:**
- Game Loop section
- Race Types and Game Modes section
- Win Conditions and Objectives
- Progression and Unlocks

**From `docs/ARCHITECTURE.md`:**
- Orchestration Layer section
- Race Loop (Pseudocode)
- Data Flow (Race Simulation Flow)

**From `src/types.ts`:**
- RaceManager interface
- RaceState interface
- GameState interface (if exists)
- RaceConfig interface
- RaceResults interface
