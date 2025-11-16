# Game Modes & Flow Specification

**Status:** ✅ Phase 6 Complete - Migration Complete (2025-11-16)
**Migration:** Completed from `docs/SPEC.md`, `docs/ARCHITECTURE.md`, and `src/types.ts`

## Files Created in Phase 6 ✅

- ✅ `SPEC.md` - Complete game modes specification (single race, career mode, time trial, orchestration)
- ✅ `CONTRACTS.md` - All game mode interfaces (RaceConfig, RaceState, CareerSave, championship points)
- ✅ `EXAMPLES.md` - 11 comprehensive game flow scenarios (career progression, race loop, decisions, saves)
- ✅ `REFERENCE.md` - Quick reference (championship points table, unlocks, AI field generation)

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
