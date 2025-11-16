# Game Modes Plans

**Version:** 1.0
**Status:** In Progress - Career Mode MVP
**Last Updated:** 2025-11-16

---

## Current Status

**Phase:** Foundation complete, orchestration in progress
**Test Coverage:** 151/151 tests passing (100%)
**Completed:** Single race mode, career mode foundation
**Next:** Career mode MVP (save/load, menu, season loop)

---

## Completed Milestones

### Phase 1: Single Race Mode (Complete)
- ✅ Race configuration system
- ✅ Real-time race loop (tick-based simulation)
- ✅ Pause/resume capability
- ✅ Race results generation
- ✅ Full integration (physics, character, decisions, UI)
- ✅ Working demo (demo-race.ts)

### Phase 2: Career Mode Foundation (Complete)
- ✅ ChampionshipPoints calculator (NASCAR-style)
- ✅ SeasonSchedule manager (10-race seasons)
- ✅ CareerManager orchestration
- ✅ Driver progression tracking
- ✅ Race history system
- ✅ Interactive demo (demo-career.ts)

---

## Future Roadmap

### Phase 3: Career Mode MVP (Current - HIGH PRIORITY)

**Goal:** Fully playable career mode with persistence

**Deliverables:**
- [ ] **Save/Load System**
  - JSON file persistence
  - Career state serialization
  - Backup mechanism
  - See: `specs/game-modes/TASKS.md` - Task #1

- [ ] **Career Menu Flow**
  - Main menu (Quick Race, Career, Quit)
  - Career menu (Next Race, Standings, Driver Profile, Exit)
  - Menu navigation integration
  - See: `specs/game-modes/TASKS.md` - Task #2

- [ ] **Multi-Race Season Loop**
  - Full 10-race season orchestration
  - Pre-race → Race → Post-race flow
  - Season completion and next season
  - See: `specs/game-modes/TASKS.md` - Task #3

- [ ] **Track Unlocking**
  - Progressive track unlocking (top 10 = unlock next)
  - 3-5 additional NASCAR tracks
  - Unlock persistence
  - See: `specs/game-modes/TASKS.md` - Task #4

**Target Completion:** Next 3-4 sessions
**Success Criteria:** Can complete full career season, save/resume mid-season

---

### Phase 4: Career Mode Enhancements (Planned)

**Goal:** Add depth to career progression

**Features:**
- [ ] **Qualifying System**
  - Time trial to set starting position
  - Qualifying affects race start
  - Qualifying skill progression

- [ ] **AI Difficulty Progression**
  - AI skills increase through season
  - Early races easier, late races harder
  - Matches player progression curve
  - See: `specs/game-modes/TASKS.md` - Task #5

- [ ] **Milestones & Achievements**
  - First win, first top-5, first top-10
  - Career milestones (100 races, championships)
  - Celebration messages and rewards

- [ ] **Championship Depth**
  - Multi-season championships
  - Season-end rewards
  - Historical season tracking

**Priority:** Medium
**Dependencies:** Career Mode MVP (Phase 3)

---

### Phase 5: Time Trial Mode (Deferred)

**Goal:** Solo lap time challenges

**Features:**
- [ ] Time trial configuration
- [ ] Solo lap simulation (no AI, no tire wear, no fuel)
- [ ] Best lap tracking
- [ ] Local leaderboard
- [ ] Ghost laps (future)

**Priority:** Low (career mode more important)
**Dependencies:** None (parallel to career mode)

---

### Phase 6: Advanced Career Features (Long-Term)

**Goal:** Full NASCAR career simulation

**Features:**
- [ ] **Team Management**
  - Hire crew chief
  - Manage pit crew
  - Team relationships affect performance

- [ ] **Sponsorship System**
  - Attract sponsors based on performance
  - Sponsorship bonuses (money, upgrades)
  - Sponsor objectives (finish top-10, etc.)

- [ ] **Car Upgrades**
  - Engine, suspension, aerodynamics
  - Purchase with winnings
  - Tradeoffs (speed vs reliability)

- [ ] **Historical Content**
  - Classic NASCAR seasons (1990s, 2000s)
  - Legendary drivers as AI opponents
  - Historical tracks

**Priority:** Very Low (distant future)
**Dependencies:** Career MVP, extensive content creation

---

### Phase 7: Multiplayer (Far Future)

**Goal:** Online racing and leagues

**Architecture:**
```
Game Server
├── Lobby System
├── Race Matching
├── Race Simulation (server-side)
└── Result Sync

Clients
├── Player Input
├── Display Updates
└── Race State Sync
```

**Features:**
- [ ] Online lobbies
- [ ] Competitive racing
- [ ] Leagues and seasons
- [ ] Rankings and leaderboards

**Priority:** Distant Future
**Dependencies:**
- Networking layer
- Server infrastructure
- Anti-cheat measures
- Player accounts system

---

## Design Decisions

### ADR-001: Career Mode Before Time Trial

**Decision:** Build full career mode before time trial mode

**Rationale:**
- Career mode is the main progression system
- Time trial is simpler, can be added later
- Better to polish one mode than have two half-finished modes

**Status:** Approved

---

### ADR-002: 10-Race Seasons (Not Full 36-Race NASCAR Schedule)

**Decision:** Use 10-race seasons, not full 36-race NASCAR schedule

**Rationale:**
- 10 races = manageable session length
- Less overwhelming for players
- Faster iteration on seasons
- Can extend to 36 later if desired

**Validation:**
- 10 races with variety (short, intermediate, superspeedway tracks)
- Feels like complete season arc

**Status:** Approved, implemented

---

### ADR-003: NASCAR Points System

**Decision:** Use NASCAR-style points (1st: 40pts, 2nd: 35pts, etc.)

**Rationale:**
- Authentic to NASCAR theme
- Rewards consistency (all positions get points)
- Bonus points for leading laps (strategic depth)
- Well-balanced from decades of NASCAR use

**Status:** Approved, implemented

---

### ADR-004: JSON File Save System (Not Database)

**Decision:** Use JSON files for save/load, not database

**Rationale:**
- Simpler implementation
- Human-readable save files
- Easy backup (copy file)
- No database dependencies
- Sufficient for single-player game

**Alternatives Considered:**
- SQLite (overkill for single-player)
- Cloud saves (requires auth, servers)

**Status:** Approved

---

### ADR-005: Track Unlocking via Top-10 Finishes

**Decision:** Unlock tracks by finishing top-10 (not wins)

**Rationale:**
- Accessible progression (top-10 easier than wins)
- Rewards consistent performance
- Still requires skill growth
- Ensures variety (won't get stuck on one track)

**Alternatives Considered:**
- Win-only unlocks (too hard)
- Complete race (too easy)
- Points threshold (less clear)

**Status:** Approved

---

## Open Questions

**Q:** Should qualifying be required or optional?
**A:** Make it optional initially. Players can do quick start (random grid) or qualify.

**Q:** Should AI drivers have persistent progression too?
**A:** No. Adds complexity. AI reset each season. Player is the star.

**Q:** Should there be difficulty settings (Easy/Normal/Hard)?
**A:** Yes, but implement after career MVP. Adjust AI skill ranges ±10.

**Q:** Should seasons ever end (retirement)?
**A:** No forced retirement. Player can play indefinitely. Later: add "Legacy Mode" achievements.

---

## Integration Points

### With Physics System
- Race engine uses physics for simulation
- See: `specs/physics/SPEC.md`

### With Character System
- Career uses driver progression and XP
- See: `specs/character/SPEC.md`

### With Decision System
- Career races include decisions
- See: `specs/decisions/SPEC.md`

### With UI System
- Menus and displays for career flow
- See: `specs/ui/SPEC.md`

---

## Success Metrics

**Career Mode MVP Goals:**
- [ ] Can create new career
- [ ] Can save and load career mid-season
- [ ] Can complete 10-race season
- [ ] Can progress through multiple seasons
- [ ] Tracks unlock based on performance
- [ ] Championship points tracked correctly
- [ ] Driver skills improve over time
- [ ] Menu flow is intuitive

**Target:** All goals achieved by end of Phase 3

---

## Content Roadmap

### Tracks (Current: 3, Target: 10+)

**Phase 3 Additions (Priority):**
- [ ] Richmond Raceway (short track)
- [ ] Atlanta Motor Speedway (intermediate)
- [ ] Talladega Superspeedway (superspeedway)
- [ ] Martinsville Speedway (short track)
- [ ] Texas Motor Speedway (intermediate)

**Phase 4 Additions:**
- [ ] Phoenix Raceway
- [ ] Darlington Raceway
- [ ] Road America (road course!)
- [ ] Watkins Glen (road course!)
- [ ] Indianapolis Motor Speedway

**Phase 5+ (Future):**
- Full 36-track NASCAR schedule
- Historical tracks (North Wilkesboro, Rockingham)
- Fantasy tracks

---

**Last Reviewed:** 2025-11-16
**Next Review:** After Career Mode MVP completion
