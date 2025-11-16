# Decision System Plans

**Version:** 1.0
**Status:** Complete - Maintenance Mode
**Last Updated:** 2025-11-16

---

## Current Status

**Phase:** Decision system is feature-complete with 5 decision types.
**Test Coverage:** 15/15 tests passing (100%)
**Integration:** Fully integrated with race loop, skills, mental state, and UI

---

## Completed Milestones

### Phase 1: Framework (Complete)
- ✅ DecisionManager orchestration
- ✅ Decision interface and data structure
- ✅ Skill-based outcome evaluation
- ✅ Effect application system

### Phase 2: Core Decisions (Complete)
- ✅ Pit strategy decisions
- ✅ Passing opportunity decisions
- ✅ Mental state management decisions
- ✅ Tire management decisions
- ✅ Traffic management decisions

### Phase 3: Integration (Complete)
- ✅ Race loop integration (pause/resume)
- ✅ UI prompts (clear decision display)
- ✅ XP rewards for decisions
- ✅ Mental state updates from decisions
- ✅ Car state updates (tires, fuel) from decisions

---

## Future Roadmap

### Phase 4: Additional Decision Types (Planned)

**Goal:** Add more strategic variety

**New Decision Types:**
- [ ] **Incident Response**
  - When: Near crash or debris on track
  - Options: Brake hard, Swerve, Hold line
  - Effects: Position loss vs damage risk vs mental state

- [ ] **Setup Changes**
  - When: During pit stop
  - Options: Tighten, Loosen, No change
  - Effects: Handling for different track conditions

- [ ] **Caution Flag Strategy**
  - When: Yellow flag deployed
  - Options: Pit now, Stay out, Pit on next lap
  - Effects: Track position vs fresh tires

- [ ] **Weather Response**
  - When: Rain starts (future - requires weather system)
  - Options: Pit for rain tires, Stay on slicks, Adjust driving style
  - Effects: Speed vs risk vs tire wear

- [ ] **Team Radio**
  - When: Crew chief gives advice
  - Options: Follow advice, Ignore advice, Compromise
  - Effects: Mental state vs strategy effectiveness

**Priority:** Low (5 decision types provide good variety)
**Dependencies:**
- Incident response: Requires incident generation system
- Caution flags: Requires caution flag system
- Weather: Requires weather physics system
- Team radio: Requires crew chief AI

---

### Phase 5: Decision Complexity (Deferred)

**Goal:** Add more nuance to decisions

**Features:**
- [ ] Multi-stage decisions (decision trees)
- [ ] Time-limited decisions (faster choice = bonus/penalty)
- [ ] Context-aware decision generation (track-specific)
- [ ] Learning system (AI adapts to player style)

**Priority:** Very Low (current system works well)
**Dependencies:** None (enhancements to existing system)

---

## Design Decisions

### ADR-001: Skill-Based Outcomes (Not Random)

**Decision:** Decision outcomes based on skill calculations, not pure randomness

**Rationale:**
- Rewards skill progression
- Feels fair (not lucky/unlucky)
- Predictable with known formulas
- RPG-like (stats matter)

**Implementation:**
```typescript
successProbability = (relevantSkill + driverConfidence - difficulty) / 100
random() < successProbability → success : failure
```

**Status:** Approved, implemented

---

### ADR-002: XP Rewards for Good Decisions

**Decision:** Award XP for successful decisions, not just race results

**Rationale:**
- Rewards active engagement (not just simulation)
- Incentivizes learning decision system
- Multiple progression paths
- 5-15 XP per good decision (vs 50-150 per race)

**Status:** Approved, implemented

---

### ADR-003: Pause/Resume Race for Decisions

**Decision:** Pause race simulation when decision prompts appear

**Rationale:**
- Player has time to read and consider
- No pressure to choose quickly (for now)
- Better for console UI (not real-time action)
- Can add time limits later if desired

**Status:** Approved, implemented

---

### ADR-004: 5 Decision Types for MVP

**Decision:** Ship with 5 decision types, not more

**Rationale:**
- Covers main strategic areas (pit, passing, mental, tires, traffic)
- Enough variety without overwhelming
- Can add more based on feedback
- Quality over quantity

**Status:** Approved, implemented

---

## Open Questions

**Q:** Should decisions have time limits (faster choice = better outcome)?
**A:** Deferred. Current system gives unlimited time. Consider for "Hard Mode" later.

**Q:** Should AI drivers make visible decisions (show their choices)?
**A:** Interesting for strategy. Deferred until AI difficulty system enhanced.

**Q:** Should there be "wrong" decisions that always hurt (traps)?
**A:** No. All decisions should have valid use cases. Current approach: tradeoffs.

---

## Integration Points

### With Character System
- Driver skills determine decision success
- Mental state affects probabilities
- See: `specs/character/SPEC.md`

### With Physics System
- Decision effects modify car state
- See: `specs/physics/SPEC.md`

### With UI System
- Decision prompts displayed in race
- See: `specs/ui/SPEC.md` - "Decision Prompts"

### With Game Modes
- Decisions integrated into race loop
- See: `specs/game-modes/SPEC.md` - "Race Loop"

---

## Success Metrics

**Decision System Goals:**
- ✅ Decisions feel meaningful (not cosmetic)
- ✅ Skill-based outcomes feel fair
- ✅ XP rewards motivate good choices
- ✅ 5 decision types provide variety
- ✅ Integration with race loop seamless
- ✅ 100% test coverage

**All goals achieved!**

---

**Last Reviewed:** 2025-11-16
**Next Review:** When adding new decision types or game mechanics
