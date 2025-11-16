# Game Modes Tasks

**Last Updated:** 2025-11-16
**Test Status:** 151/151 passing (100%)
**Phase:** Career Mode MVP Implementation

---

## Current Work

None - Ready to begin Career Mode MVP!

**Foundation Complete:**
- ✅ ChampionshipPoints calculator (+21 tests)
- ✅ SeasonSchedule manager (+25 tests)
- ✅ CareerManager orchestration (+26 tests)
- ✅ Interactive demo (demo-career.ts)

**Next:** Complete career orchestration flow

---

## Blocked Items

None currently.

---

## Next Up (Priority Order)

### 1. Implement save/load system (HIGH PRIORITY)

**Problem:** CareerManager.save/load methods stubbed, need persistence
**Impact:** Career progression not persistent across sessions
**Files:**
- `src/modes/career/CareerManager.ts:89-120` (save/load methods)
- `tests/unit/modes/career-manager.test.ts` (add persistence tests)

**Action:**
1. Create `saves/` directory structure in project root
2. Implement JSON serialization in `CareerManager.save()` method
   - Serialize complete CareerState to JSON
   - Include driver state, season, race, points, unlocks, history
3. Implement deserialization in `CareerManager.load()` method
   - Load JSON and reconstruct CareerState
   - Validate loaded data integrity
4. Add backup mechanism (career-{id}-backup.json)
   - Write backup before overwriting existing save
5. Write tests for save/load roundtrip
   - Test: save → load → state matches exactly
   - Test: corrupted save file handling
   - Test: backup restoration
6. Test with demo-career.ts
   - Add save points after each race
   - Test career continuity across runs

**Success Criteria:**
- Save career state to JSON file
- Load restores exact state (all properties match)
- Backup created before save operations
- All tests pass (6+ new tests)
- demo-career.ts can save and resume mid-season

---

### 2. Create career menu flow (HIGH PRIORITY)

**Problem:** Need menu system to navigate career mode
**Impact:** Users can't interact with career mode beyond demo script
**Files:**
- `src/ui/console/input/MenuHandler.ts` (existing menu handler)
- New: `src/ui/console/components/CareerMenu.ts` (career-specific menu)
- New: `src/ui/console/components/MainMenu.ts` (main game menu)

**Action:**
1. Create MainMenu component
   - Options: Quick Race, Career Mode, Settings, Quit
   - Reuse existing MenuHandler for input
   - Route to appropriate mode
2. Create CareerMenu component
   - Display: Driver stats, season info, current standings
   - Options: Next Race, View Standings, Driver Profile, Season Schedule, Save & Exit
   - Load career state on entry
   - Save state on exit
3. Integrate with demo-career.ts pattern
   - Replace hardcoded 5-race loop with menu-driven flow
   - Add pre-race menu (before each race)
   - Add post-race menu (after results screen)
4. Write tests for menu navigation
   - Test menu option selection
   - Test state preservation across menu transitions
5. Create entry point: `src/index.ts`
   - Launch main menu on startup
   - Handle mode routing

**Success Criteria:**
- Main menu displays and accepts input
- Career menu shows driver info and season status
- Menu navigation works end-to-end
- Can navigate: Main → Career → Race → Results → Career → Exit
- Tests pass (8+ new tests)

---

### 3. Build multi-race season loop (MEDIUM PRIORITY)

**Problem:** Need full season orchestration, not just 5-race demo
**Impact:** Can't complete full 10-race season with proper flow
**Files:**
- `src/modes/career/CareerManager.ts` (extend processRaceCompletion)
- `demo-career.ts` (refactor into proper career mode runner)

**Action:**
1. Extend CareerManager with season loop logic
   - Method: `runSeason()` - orchestrate full season
   - Check if season complete (10 races done)
   - Handle season end → new season transition
2. Create pre-race flow
   - Show next race info (track, opponents)
   - Display current standings
   - Optional: Set strategy (future)
   - Prompt to start race or return to menu
3. Create post-race flow
   - Show race results
   - Award XP and update driver
   - Award championship points
   - Update standings
   - Check for unlocks
   - Save career state
   - Prompt to continue or exit
4. Handle season completion
   - Display final championship standings
   - Show season summary (wins, top-5s, etc.)
   - Award season-end rewards (future)
   - Option to start next season
5. Integrate with menu system from Task #2
6. Write tests for season loop
   - Test full season completion
   - Test multi-season progression
   - Test standings calculation

**Success Criteria:**
- Can complete full 10-race season
- Season transitions to next season
- Championship standings update correctly
- Career state persists properly
- Tests pass (10+ new tests)

---

### 4. Add track unlocking system (MEDIUM PRIORITY)

**Problem:** All tracks currently available, need progression
**Impact:** Less sense of achievement and progression
**Files:**
- `src/modes/career/CareerManager.ts` (add unlock logic)
- `src/data/tracks/` (add more track JSON files)

**Action:**
1. Define unlock criteria in CareerManager
   - Initial tracks: Bristol, Charlotte, Daytona (unlocked by default)
   - Unlock rule: Top 10 finish → unlock next track
   - Alternative: Complete season → unlock all
2. Implement unlock checking in `processRaceCompletion()`
   - Check finish position
   - If top 10, unlock next track in sequence
   - Update unlockedTracks array in career state
3. Update SeasonSchedule to respect unlocks
   - Filter available tracks by unlocked status
   - Generate schedule from unlocked tracks only
4. Add 3-5 more NASCAR tracks
   - Create JSON files in `src/data/tracks/`
   - Example: Richmond, Atlanta, Talladega, Martinsville, Texas
   - Use existing track template, adjust specs
5. Update career menu to show unlock progress
   - Display locked tracks with unlock criteria
   - Celebrate unlocks with message
6. Write tests for unlock system
   - Test unlock conditions
   - Test track filtering
   - Test unlock persistence

**Success Criteria:**
- Start with 3 tracks unlocked
- Top 10 finish unlocks new track
- Unlocked tracks persist in save file
- Career menu shows locked/unlocked status
- 5+ additional tracks added
- Tests pass (6+ new tests)

---

### 5. AI difficulty progression (LOW PRIORITY)

**Problem:** AI skill distribution static across season
**Impact:** Early races too hard for rookie, late races too easy for developed driver
**Files:**
- `src/data/ai-drivers/default-field.json` (AI driver definitions)
- New: `src/modes/career/AIScaling.ts` (difficulty scaling logic)

**Action:**
1. Define difficulty progression curves
   - Early season (races 1-3): AI skills 40-65
   - Mid season (races 4-7): AI skills 50-75
   - Late season (races 8-10): AI skills 60-85
2. Create AIScaling module
   - Function: `scaleAIDrivers(raceNumber: number, baseDrivers: Driver[]): Driver[]`
   - Adjust AI driver skills based on race number
   - Maintain skill distribution (some weak, some strong)
3. Integrate with CareerManager
   - Call AIScaling before each race
   - Pass race number and default AI field
   - Use scaled drivers for that race
4. Add difficulty setting (future)
   - Easy: AI skills -10 across the board
   - Normal: As defined above
   - Hard: AI skills +10 across the board
5. Write tests for AI scaling
   - Test early/mid/late season skill ranges
   - Test skill distribution preserved
   - Test difficulty multipliers

**Success Criteria:**
- AI difficulty increases through season
- Player has progression path (easier → harder)
- Tests pass (5+ new tests)

---

## Completed This Session

- ✅ **Career Mode Foundation** (2025-11-16)
  - ChampionshipPoints calculator (+21 tests)
    - NASCAR-style points (1st: 40, 2nd: 35, decreasing)
    - Bonus points: +5 lead a lap, +5 most laps led
    - Pure function implementation
  - SeasonSchedule manager (+25 tests)
    - 10-race season structure (Bristol, Charlotte, Daytona rotation)
    - Helper functions: getNextRace, getRaceByNumber, isSeasonComplete
    - Pure data structure
  - CareerManager orchestrator (+26 tests)
    - Create new careers (rookie driver, skills 30-40)
    - Load/save career state (in-memory, persistence stubbed)
    - Process race completions (points, XP, stats, history)
    - Multi-season progression support
    - Driver stat tracking (races, wins, top5, top10, avg finish, laps led)
  - Interactive demo (demo-career.ts)
    - 5-race progression showcase
    - Points accumulation display
    - Driver skill growth visualization
    - Season standings after each race
    - Milestone celebrations
  - **Result:** 72 new tests, all passing (100% coverage)

---

## Future Enhancements

See [SPEC.md](SPEC.md) for complete vision:

- [ ] Time Trial mode (solo lap challenges)
- [ ] Qualifying system (set starting position)
- [ ] Multi-season careers (continue across years)
- [ ] Team management (crew chief, pit crew)
- [ ] Sponsorship deals and rewards
- [ ] Car upgrades system
- [ ] Historical NASCAR seasons
- [ ] Achievements and challenges
- [ ] Local leaderboards

---

## Notes

- **Career foundation is solid** - ChampionshipPoints, SeasonSchedule, CareerManager all tested
- **Demo works great** - `npm run career` shows full progression flow
- **Save/load is next critical path** - Enables persistent careers
- **Menu system bridges demo → full game** - Reuse existing MenuHandler
- **Track unlocking adds progression** - Easy to implement with current structure

---

## Quick Commands (Game Modes-Specific)

```bash
# Run career mode demo
npm run career

# Run single race demo
npm run play

# Run only game modes tests
npm run test:run -- tests/unit/modes/
npm run test:run -- tests/integration/

# Run specific test file
npm run test:run -- tests/unit/modes/career-manager.test.ts
npm run test:run -- tests/unit/modes/championship-points.test.ts
npm run test:run -- tests/unit/modes/season-schedule.test.ts

# Check game modes implementation
cat src/modes/career/CareerManager.ts
cat src/modes/career/ChampionshipPoints.ts
cat src/modes/career/SeasonSchedule.ts
cat demo-career.ts
cat demo-race.ts

# Review game modes spec
cat .claude/specs/game-modes/SPEC.md
cat .claude/specs/game-modes/EXAMPLES.md
cat .claude/specs/game-modes/REFERENCE.md
```

---

**Phase Status:** Foundation Complete - Ready for MVP implementation
**Next Review:** After Career Mode MVP completion (save/load + menu flow + season loop)
