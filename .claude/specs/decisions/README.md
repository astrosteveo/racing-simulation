# Decision/Event System Specification

**Status:** Phase 1 - Structure Created (Templates Pending)
**Phase 2 Migration:** Migrate from `.claude/design/decision-system.md` and `docs/SPEC.md`

## Files to Create in Phase 2

- `SPEC.md` - Decision system specification
- `CONTRACTS.md` - Decision, DecisionOption, DecisionResult interfaces
- `PLANS.md` - Decision types roadmap
- `DECISIONS.md` - ADRs for outcome calculation, skill-based probabilities
- `TASKS.md` - Decision system tasks
- `EXAMPLES.md` - Decision scenarios (pit strategy, passing, mental state)

## Migration Sources

**From `.claude/design/decision-system.md`:**
- Complete design document (migrate to SPEC.md)
- Decision types and architecture
- Outcome calculation formulas

**From `docs/SPEC.md`:**
- Decision System section
- Decision Types (pit, passing, traffic, incident, tire, mental)
- Decision Timing section

**From `docs/EXAMPLES.md`:**
- Example 5: Pit strategy decision
- Example 6: Passing decision
- Example 7: Mental state management

**From `src/types.ts`:**
- Decision interface
- DecisionOption interface
- DecisionResult interface
- DecisionManager interface
