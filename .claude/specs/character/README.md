# Character/RPG System Specification

**Status:** Phase 1 - Structure Created (Templates Pending)
**Phase 2 Migration:** Extract character/RPG content from `docs/SPEC.md`

## Files to Create in Phase 2

- `SPEC.md` - Character system specification (driver skills, mental state, XP)
- `CONTRACTS.md` - Driver, DriverSkills, MentalState, XPGain interfaces
- `PLANS.md` - Character progression roadmap
- `DECISIONS.md` - ADRs for XP formulas, skill balancing
- `TASKS.md` - Character-specific tasks
- `EXAMPLES.md` - Progression scenarios, mental state examples

## Migration Sources

**From `docs/SPEC.md`:**
- RPG Systems section (Character Stats, XP and Progression, Mental State System)
- Driver skill definitions
- Mental state dynamics

**From `docs/EXAMPLES.md`:**
- Example 4: Mental state performance impact
- Example 7: Mental state management decision
- Example 8-9: Progression examples

**From `src/types.ts`:**
- Driver interface
- DriverSkills interface
- MentalState interface
- XPGain interface
