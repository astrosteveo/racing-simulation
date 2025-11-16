# Character/RPG System Plans

**Version:** 1.0
**Status:** Complete - Maintenance Mode
**Last Updated:** 2025-11-16

---

## Current Status

**Phase:** Character system is feature-complete and stable.
**Test Coverage:** 66/66 tests passing (100%)
**Integration:** Fully integrated with physics, decisions, and UI systems

---

## Completed Milestones

### Phase 1: Foundation (Complete)
- ✅ Driver class with 10 skill categories
- ✅ Skill ranges (0-100 scale)
- ✅ Driver stats tracking
- ✅ XP progression system
- ✅ Mental state dynamics

### Phase 2: Mental State (Complete)
- ✅ 4 mental state categories (confidence, frustration, focus, distraction)
- ✅ Dynamic state updates based on events
- ✅ Decay/regression to baseline
- ✅ Effects mapping to performance

### Phase 3: Progression (Complete)
- ✅ XP award calculation
- ✅ Skill point conversion (100 XP = 1 point)
- ✅ Skill caps and validation
- ✅ Multiple XP gain sources

### Phase 4: Integration (Complete)
- ✅ Physics integration (skills affect lap times)
- ✅ Decision integration (skills affect outcomes)
- ✅ UI integration (display character state)
- ✅ Career mode integration (persistent progression)

---

## Future Roadmap

### Phase 5: Advanced Progression (Planned)

**Goal:** Add depth to character progression

**Features:**
- [ ] Skill specialization trees
  - Choose focus areas (racecraft vs technical vs mental)
  - Unlock specialized abilities
  - Tradeoffs (can't max everything)

- [ ] Trait system
  - Permanent modifiers ("Aggressive", "Smooth", "Technical")
  - Chosen at career start or unlocked through achievements
  - Affect baseline stats and mental state tendencies

- [ ] Mentor/Rivalry system
  - Learn from elite AI drivers
  - Rivalries affect mental state more (higher stakes)
  - Teammate relationships (future)

**Priority:** Low (current system complete)
**Dependencies:** None (additive features)

---

### Phase 6: Additional Skills (Deferred)

**Goal:** Expand skill categories for more depth

**Potential Skills:**
- [ ] Tire Management (separate from racecraft)
- [ ] Fuel Strategy (separate from consistency)
- [ ] Setup Knowledge (car tuning, future)
- [ ] Weather Adaptation (future)
- [ ] Communication (crew chief interaction, future)

**Priority:** Very Low (10 skills sufficient for now)
**Dependencies:** Requires corresponding game mechanics

---

## Design Decisions

### ADR-001: 10 Skill Categories vs More

**Decision:** Use 10 distinct skill categories (not more, not less)

**Rationale:**
- More than 5: Enough variety for meaningful builds
- Less than 15: Not overwhelming, each skill meaningful
- 10 is manageable and comprehensible

**Status:** Approved, implemented

---

### ADR-002: 0-100 Scale for Skills

**Decision:** Use 0-100 integer scale for all skills

**Rationale:**
- Intuitive (percentage-like)
- Precise enough without decimals
- Easy to display in UI
- Common in RPGs

**Alternatives Considered:**
- 1-10 scale (too coarse)
- 1-20 scale (like D&D, less intuitive)
- Decimal values (unnecessary precision)

**Status:** Approved, implemented

---

### ADR-003: XP Conversion Rate (100 XP = 1 Skill Point)

**Decision:** 100 XP converts to 1 skill point

**Rationale:**
- Not too fast (preserves progression feeling)
- Not too slow (visible progress each race)
- Good race pacing (1-3 skill points per race for good performance)

**Validation:**
- Rookie (skill 30) → Professional (skill 70) takes ~40 races
- Feels right for season length

**Status:** Approved, validated through testing

---

### ADR-004: Mental State Decay

**Decision:** Mental state regresses to baseline over time (not permanent)

**Rationale:**
- Prevents permanent mental state damage
- Requires active management
- More realistic (emotions fade)
- Better gameplay (can recover from bad state)

**Status:** Approved, implemented

---

## Open Questions

**Q:** Should there be negative mental state effects that persist?
**A:** Deferred. Current system allows full recovery, which feels better for gameplay.

**Q:** Should skill progression be faster early, slower late (diminishing returns)?
**A:** Current system is linear. Works well. Consider for future if progression feels wrong.

**Q:** Should mental state affect XP gain?
**A:** Not currently. XP based on performance, which mental state already affects.

---

## Integration Points

### With Physics System
- Skills multiply physics performance modifiers
- See: `specs/physics/SPEC.md` - "Skill Effects on Physics"

### With Decision System
- Skills determine decision success probabilities
- See: `specs/decisions/SPEC.md` - "Skill-Based Outcomes"

### With UI System
- Driver status displayed in multiple components
- See: `specs/ui/SPEC.md` - "Driver Status Panel"

### With Game Modes
- Career mode uses XP progression
- See: `specs/game-modes/SPEC.md` - "Skill Progression"

---

## Success Metrics

**Character System Goals:**
- ✅ Progression feels rewarding (not too fast, not too slow)
- ✅ Skills meaningfully affect gameplay
- ✅ Mental state adds strategic depth
- ✅ XP rewards motivate good decisions
- ✅ 100% test coverage

**All goals achieved!**

---

**Last Reviewed:** 2025-11-16
**Next Review:** When adding new character features or mechanics
