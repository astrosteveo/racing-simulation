# Game Modes Tasks

**Last Updated:** 2025-11-17
**Test Status:** 404/409 passing (99.4%)
**Phase:** Career Mode MVP - Performance Optimization Complete

---

## Current Work

None - ready for next phase.

---

## Recently Completed

✅ **Multi-Season Progression** (2025-11-17)
- Season completion screen with full statistics
- Championship results display (final points)
- Season summary (wins, top 5, top 10, avg finish, laps led)
- Driver development summary (overall rating)
- Interactive "Start Next Season" prompt
- Automatic season advancement with save
- Points/race reset, skills/history preserved
- **Result:** Players can now progress through unlimited seasons!

✅ **Career Mode Performance Optimization** (2025-11-17)
- Switched CareerRaceRunner from `simulateTick()` to `simulateLap()`
- Both use identical physics (`calculateLapTime`), but lap-based avoids 750 iterations/lap
- **Performance:** 30+ min → 22ms (80,000x faster!)
- **Physics accuracy:** Fully maintained (tire wear, fuel, skills, track geometry)
- **Tests:** 6/6 CareerRaceRunner tests passing
- **Result:** Career mode races now execute nearly instantly while preserving simulation fidelity

✅ **Multi-Race Season Loop** (2025-11-16)
- CareerRaceRunner for race orchestration (+6 tests)
- Race integration with career menu
- Pre-race and post-race screens
- XP calculation and skill progression
- Milestone detection
- Season completion flow (partial - needs advancement UI)

**Foundation Complete:**
- ✅ ChampionshipPoints calculator (+21 tests)
- ✅ SeasonSchedule manager (+25 tests)
- ✅ CareerManager orchestration (+35 tests total)
- ✅ CareerRaceRunner (+6 integration tests)
- ✅ MainMenu & CareerMenu (+14 tests)
- ✅ Full game entry point (src/index.ts)
- ✅ Save/load system (+9 tests)

---

## Blocked Items

None currently.

---

## Next Up (Priority Order)

### 1. Build multi-race season loop (HIGH PRIORITY)

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

### 2. Add track unlocking system (MEDIUM PRIORITY)

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

### 3. AI difficulty progression (LOW PRIORITY)

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

### 4. Simulation Speed Toggle (FUTURE - v1.1)

**Problem:** Players need control over race simulation speed
**Impact:** QoL feature for different play styles and situations
**Files:**
- `src/engine/simulation/race.ts` (add speed control)
- `src/ui/` (add speed toggle UI)
- All race execution flows (single race, career)

**Action:**
1. Add simulation speed options to RaceEngine
   - Realtime (1x): Current `simulateTick()` behavior
   - 2x Speed: Double tick rate or skip frames
   - 4x Speed: Quadruple tick rate
   - Instant: Switch to `simulateLap()` for batch calculation
2. Create mid-race pause menu
   - Speed selector (1x / 2x / 4x / Instant)
   - "Sim to End" option (after wreck/incident)
   - Resume race at selected speed
3. Maintain physics accuracy across all speeds
   - Same formulas regardless of speed
   - Just different iteration methods
4. Update all race flows to support speed toggle
   - Single race mode
   - Career mode
   - Time trial (future)
5. Save speed preference per mode
   - Career default: 1x (full immersion)
   - Quick race default: User's last selection
6. Write tests
   - Test all speeds produce same results
   - Test mid-race speed changes
   - Test sim-to-end from any point

**Success Criteria:**
- All 4 speed modes functional
- Mid-race speed changes work seamlessly
- Physics accuracy maintained across speeds
- User preference saved/restored
- Tests pass (8+ new tests)

**Design Note:** See SPEC.md "Design Principle #4: Simulation Speed as User Preference" for full architectural details.

---

## Completed This Session

- ✅ **Multi-Race Season Loop** (2025-11-16)
  - CareerRaceRunner class (+6 integration tests)
    - Full race simulation for career mode
    - Simplified execution (auto-decisions, no real-time rendering)
    - Shortened races (50 laps short/intermediate, 100 superspeedway)
    - Skill-based starting positions
    - Complete XP calculation (7 skills, performance-based)
    - AI driver field generation
  - Race integration with career menu (src/index.ts)
    - runNextRace() function with pre/post-race screens
    - Championship points breakdown display
    - Skill improvement notifications
    - Milestone celebrations (first win, top-5, top-10)
    - Auto-save after each race
    - Season completion detection
  - Type fixes
    - Fixed XPGain interface ({skill: string, amount: number})
    - Fixed RaceResults.xpGained type (XPGain[])
  - **Result:** Full playable career mode with race execution!

- ✅ **Career Menu Flow** (2025-11-16)
  - MainMenu component (+6 tests)
    - Quick Race, Career Mode, Settings, Quit options
    - Clean UI/logic separation
  - CareerMenu component (+8 tests)
    - Context-aware with career state
    - Options: Next Race, Standings, Driver Profile, Schedule, Save & Exit
    - Disables Next Race when season complete
    - Formatted career summary display
  - Main game entry point (src/index.ts)
    - Full menu orchestration and routing
    - Save file listing and loading
    - New career creation flow
    - Career menu loop with navigation
    - Display screens: Standings, Profile, Schedule
    - Placeholders for Quick Race and Settings
  - **Result:** 14/14 new menu tests passing, full menu system operational

- ✅ **Save/Load System** (2025-11-16)
  - File persistence for CareerManager (+9 tests)
    - JSON serialization/deserialization to `saves/` directory
    - Automatic backup creation before overwrite
    - Graceful error handling for corrupted/missing saves
    - Roundtrip validation (save → load → exact state match)
  - Updated demo-career.ts with save/load
    - Auto-save after each race
    - Load existing career on startup
    - Save ID based on driver name
  - Added saves/ to .gitignore
  - **Result:** 36/36 CareerManager tests passing, save/load fully functional

- ✅ **Career Mode Foundation** (2025-11-16)
  - ChampionshipPoints calculator (+21 tests)
    - NASCAR-style points (1st: 40, 2nd: 35, decreasing)
    - Bonus points: +5 lead a lap, +5 most laps led
    - Pure function implementation
  - SeasonSchedule manager (+25 tests)
    - 10-race season structure (Bristol, Charlotte, Daytona rotation)
    - Helper functions: getNextRace, getRaceByNumber, isSeasonComplete
    - Pure data structure
  - CareerManager orchestrator (+26 tests initially, +9 for save/load = 35 total)
    - Create new careers (rookie driver, skills 30-40)
    - Load/save career state (file persistence implemented)
    - Process race completions (points, XP, stats, history)
    - Multi-season progression support
    - Driver stat tracking (races, wins, top5, top10, avg finish, laps led)
  - Interactive demo (demo-career.ts)
    - 5-race progression showcase
    - Points accumulation display
    - Driver skill growth visualization
    - Season standings after each race
    - Milestone celebrations
    - Save/load integration
  - **Result:** 81 total game modes tests, all passing

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
