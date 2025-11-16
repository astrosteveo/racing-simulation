# Game Modes & Flow Specification

**Version:** 1.0 (Content Migrated)
**Status:** 🟡 In Progress (Core modes defined, advanced features planned)
**Last Updated:** 2025-11-16

---

## Overview

The game modes system orchestrates the overall game flow, coordinates all subsystems (physics, character, decisions, UI), and manages player progression across different play modes.

**Available Modes:**
- **Single Race** - Quick standalone race for practice or fun
- **Career Mode** - Multi-race season with progression and unlocks
- **Time Trial** - Solo lap time challenges (future)

**Core Responsibilities:**
- Race configuration and setup
- Race loop orchestration (pre-race → race → post-race)
- Career progression tracking
- Save/load management
- Win condition evaluation
- Track/content unlocking

---

## Design Principles

### 1. Mode Independence

Each game mode is self-contained:
- Single Race doesn't affect career progression
- Career Mode maintains separate save state
- Modes share same core systems but different flows

### 2. Orchestration Over Implementation

Game modes coordinate existing systems, don't reimplement:
- Physics engine calculates lap times
- Character system handles XP/skills
- Decision system triggers events
- UI renders state

**Game modes just orchestrate the flow.**

### 3. Deterministic State

All game state is serializable and reproducible:
- Save files contain complete state
- No hidden state in closures/globals
- Load game = exact same state restored

---

## Game Modes

### Single Race

**Purpose:** Quick standalone race without progression.

**Flow:**
1. **Setup**
   - Select track
   - Configure driver (set skills or use preset)
   - Choose starting position (or random)
   - Set race length (laps)

2. **Pre-Race**
   - Display track info
   - Show starting grid
   - Review driver stats
   - Ready prompt

3. **Race**
   - Run race simulation
   - Present decisions as they arise
   - Real-time display updates
   - Pause/resume support

4. **Post-Race**
   - Show race results
   - Display final statistics
   - Option to race again or return to menu

**Characteristics:**
- No XP awarded (or optional practice XP)
- No career progression
- No unlocks
- Fastest mode to get racing

**Use Cases:**
- Practice new tracks
- Test driver builds
- Quick gaming sessions
- Learning game mechanics

---

### Career Mode

**Purpose:** Long-term progression through seasons with skill development and unlocks.

**Flow:**
1. **Career Start**
   - Create driver (name, number)
   - Set initial skills (rookie range: 30-40)
   - Start at first track
   - Introduce career objectives

2. **Season Loop**
   - View season schedule (10 races initially)
   - Current standings
   - Next race preparation
   - Continue/exit career

3. **Pre-Race** (per race)
   - Review track
   - Check current driver form
   - Set strategy (fuel, tires)
   - View grid/opponents

4. **Race**
   - Full race simulation
   - Decisions affect results
   - Mental state carries forward
   - Earn XP based on performance

5. **Post-Race** (per race)
   - Race results
   - XP awarded and skills updated
   - Championship points awarded
   - Next track unlocked (if applicable)
   - Career stats updated

6. **Season End**
   - Championship standings
   - Season summary
   - Rewards based on finish
   - Option to start next season

**Progression Systems:**

**Track Unlocking:**
- Start: 2-3 tracks available
- Unlock: Finish top 10 in previous track
- Milestone: Win at certain tracks unlocks special tracks
- Goal: Unlock all tracks by championship end

**Skill Progression:**
- XP earned each race (see character spec)
- Skills level up independently
- Visual feedback on progression
- Milestones celebrated (first win, max skill)

**Championship Points:**
- NASCAR-style points system
- 1st place: 40 points
- 2nd place: 35 points
- 3rd place: 34 points
- ... (decreasing scale)
- 40th place: 1 point
- Bonus: +5 points for leading a lap
- Bonus: +5 points for most laps led

**Career Objectives:**

*Short-term (per race):*
- Finish in top 10/5/3
- Complete race without incidents
- Execute successful pit strategy
- Build specific skills

*Long-term (season):*
- Win races
- Win championship
- Max out specific skills
- Beat elite AI drivers
- Complete challenges (future)

---

### Time Trial (Future)

**Purpose:** Solo lap time challenges without race variables.

**Flow:**
1. Select track
2. Configure driver
3. Run timed laps (no tire wear, no fuel consumption)
4. Display best lap time
5. Local leaderboard

**Characteristics:**
- Pure skill test
- No AI opponents
- No resource management
- Fastest lap competition

**Use Cases:**
- Lap time optimization
- Track learning
- Skill validation
- Competitive comparisons (local)

---

## Race Configuration

### RaceConfig Structure

```typescript
{
  track: Track;             // Track to race on
  laps: number;             // Number of laps
  playerDriver: Driver;     // Player's driver
  aiDrivers: Driver[];      // AI competitor drivers (39 for full field)
  startingPosition?: number; // Player start position (random if omitted)
}
```

**Default Field Size:** 40 drivers (1 player + 39 AI)

**AI Difficulty Mix:**
- Rookie: ~10 drivers (skills 40-50)
- Amateur: ~15 drivers (skills 50-65)
- Professional: ~10 drivers (skills 65-80)
- Elite: ~5 drivers (skills 80-95)

**Starting Position:**
- Single Race: Configurable or random
- Career Mode: Based on qualifying (future) or random initially

---

## Win Conditions & Objectives

### Race Win Conditions

**Primary:** Finish with highest position (lowest cumulative time)

**Success Tiers:**
- 1st place: Win
- Top 5: Strong finish
- Top 10: Points finish
- Top 20: Mid-pack
- Finish: Completion
- DNF: Did not finish (future - mechanical failure)

**Failure States (Future):**
- Run out of fuel (race ends)
- Mechanical failure (engine, transmission)
- Too much damage to continue
- Disqualification (rule violations)

**Current:** Only fuel exhaustion is implemented as failure state.

---

### Career Win Conditions

**Primary:** Highest championship points at season end

**Championship Calculation:**
```typescript
totalPoints = sum(racePoints) + bonusPoints
```

**Bonus Points:**
- Laps led: +5 per race if led any laps
- Most laps led: +5 per race

**Tie-breaker:** Most wins, then most top-5s, then most top-10s

---

## Game Loop Architecture

### Orchestration Layer

**Responsibility:** Coordinate all systems without duplicating logic.

```
RaceManager (Orchestrator)
├── RaceEngine (Physics simulation)
├── DecisionManager (Event system)
├── CharacterSystem (XP, skills, mental state)
├── UIRenderer (Display)
└── SaveManager (Persistence)
```

**Flow:**
1. RaceManager configures race (RaceConfig)
2. RaceEngine initializes simulation state
3. Race loop runs (lap by lap or tick by tick)
4. DecisionManager checks for decision triggers
5. UIRenderer updates display
6. Race completes → RaceResults
7. CharacterSystem awards XP
8. SaveManager persists state (career mode)

---

### Race Loop (Real-Time Mode)

**Current Implementation:** Tick-based real-time simulation

```
Initialize race:
  - Load track, drivers, cars
  - Set starting positions
  - Initialize race state

Loop (every 100ms tick):
  1. Simulate tick (advance lap progress)
  2. Update car states (tires, fuel)
  3. Check for decisions
  4. If decision: pause, prompt, resume
  5. Render display (every 500ms = 5 ticks)
  6. Check for race completion

On race complete:
  - Calculate final positions
  - Generate race results
  - Award XP (career mode)
  - Display results screen
```

**Tick Rate:** 100ms (10 FPS simulation)
**Display Rate:** 500ms (2 FPS, smooth enough for strategy game)

---

### Race Loop (Accelerated Mode - Future)

**Purpose:** Fast simulation without real-time display.

```
Loop (by lap):
  1. Calculate lap times for all drivers
  2. Update positions
  3. Trigger decisions (if any)
  4. Update car states
  5. Check for lap milestones (10, 50, 100, etc.)
  6. Brief display update on milestones
  7. Continue to next lap

On race complete:
  - Same as real-time mode
```

**Speed:** ~1000 laps/second simulation rate

---

## Save/Load System

### Career Save Structure

```typescript
{
  driverId: string;         // Player driver ID
  driver: Driver;           // Complete driver state (skills, mental state, stats)
  season: number;           // Current season (1, 2, 3, ...)
  race: number;             // Current race in season (1-10)
  points: number;           // Championship points this season
  unlockedTracks: string[]; // Track IDs unlocked
  raceHistory: RaceResults[]; // Past race results (all seasons)
}
```

**Save Triggers:**
- After each race (career mode)
- Manual save option (future)
- Auto-save before quitting

**Save Location:**
```
saves/
├── career-{driverId}.json
├── career-{driverId}-backup.json
└── autosave.json
```

**Load Behavior:**
- Restore complete driver state
- Restore career progress
- Rebuild championship standings from history
- Resume at next race in schedule

---

## Progression & Unlocks

### Track Unlocking

**Initial Tracks (2-3):**
- Bristol Motor Speedway (short track)
- Charlotte Motor Speedway (intermediate)
- Daytona International Speedway (superspeedway)

**Unlock Criteria:**
- Finish top 10 at previous track → unlock next track
- Win at milestone tracks → unlock special tracks (future)
- Complete season → unlock all tracks (alternative path)

**Unlock Sequence (Example):**
1. Bristol (available)
2. Charlotte (available)
3. Daytona (available)
4. Richmond (unlock: top 10 at Bristol)
5. Atlanta (unlock: top 10 at Charlotte)
6. Talladega (unlock: top 10 at Daytona)
7. ... (continue pattern)

---

### Difficulty Progression

**Early Season (Races 1-3):**
- AI skill range: 40-65 (easier field)
- Player starting skills: 30-40
- Goal: Learn mechanics, finish races

**Mid Season (Races 4-7):**
- AI skill range: 50-75 (moderate field)
- Player skills improving: 45-60
- Goal: Compete for top 10

**Late Season (Races 8-10):**
- AI skill range: 60-85 (challenging field)
- Player skills developed: 60-75
- Goal: Compete for wins, championship

---

### Milestones & Achievements (Future)

**Race Milestones:**
- First top 10
- First top 5
- First win
- First laps led
- Clean race (no incidents)

**Career Milestones:**
- 10 races completed
- 100 races completed
- First championship
- Multiple championships
- All skills maxed

**Challenges (Future):**
- "Comeback Kid" - Win from 20th+ starting position
- "Tire Whisperer" - Win with 1 less pit stop than field
- "Iron Man" - Win 3 consecutive races
- "Underdog" - Win with lower overall skill than top 5 AI

---

## Menu System Integration

### Main Menu Structure

```
NASCAR RPG RACING SIMULATION

1. Quick Race
   └─ Single race setup
2. Career Mode
   └─ Continue career / Start new career
3. Settings
   └─ Game options (future)
4. Quit
```

---

### Career Menu Structure

```
CAREER MODE - Season {X}, Race {Y}

Driver: {Name} (#{Number})
Current Position: {X} in points

1. Next Race
   └─ Go to pre-race setup
2. View Standings
   └─ Championship table
3. Driver Profile
   └─ Skills, stats, progression
4. Season Schedule
   └─ Track list, results so far
5. Save & Exit
```

---

## State Management

### Race State

**During Race:**
- Maintained by RaceEngine
- Snapshot provided via `getCurrentState()`
- Immutable from UI perspective
- Updated only by simulation tick

**State Transitions:**
```
INITIALIZED → RUNNING → PAUSED → RUNNING → COMPLETED
                  ↑          ↓
                  └──────────┘
```

---

### Career State

**During Career:**
- Loaded from save file at career start
- Updated after each race
- Persisted to disk after updates
- Backed up before modifications

**State Updates:**
```
Load Career Save
  ↓
Race Loop (multiple races)
  ↓ (after each race)
Update Career State
  - Increment race number
  - Add points
  - Update driver
  - Add race to history
  - Check unlocks
  ↓
Save Career State
```

---

## Integration with Other Specs

### Physics Spec (specs/physics/)

**Usage:**
- Race loop uses physics engine for lap time calculations
- Car state management (tires, fuel)
- Track specifications

**Interface:** `calculateLapTime()`, `calculateFuelConsumption()`, etc.

---

### Character Spec (specs/character/)

**Usage:**
- Driver skill progression
- XP awards after races
- Mental state tracking during race
- Career statistics

**Interface:** `Driver`, `DriverSkills`, `MentalState`, `XPGain`

---

### Decisions Spec (specs/decisions/)

**Usage:**
- Decision triggering during races
- Decision evaluation based on skills
- Effect application to race state

**Interface:** `Decision`, `DecisionManager`, `DecisionResult`

---

### UI Spec (specs/ui/)

**Usage:**
- Display race state (live racing)
- Show race results (post-race)
- Menu navigation
- Decision prompts

**Interface:** `UIRenderer`

---

## Implementation Status

**Completed:**
- ✅ Single Race mode (functional)
- ✅ Real-time race loop (tick-based)
- ✅ RaceEngine core simulation
- ✅ Pause/resume capability
- ✅ Race results generation
- ✅ Basic career structure (interfaces defined)

**In Progress:**
- 🟡 Career progression (partially implemented)
- 🟡 Save/load system (structure defined, implementation pending)
- 🟡 Championship points system (formula defined, implementation pending)

**Planned:**
- 🔴 Time Trial mode
- 🔴 Multi-season careers
- 🔴 Accelerated simulation mode
- 🔴 Track qualifying system
- 🔴 Advanced career features (sponsorships, teams)
- 🔴 Achievements/challenges system
- 🔴 Leaderboards

---

## Success Criteria

- ✅ Single Race mode playable end-to-end
- ✅ Race loop orchestrates all systems correctly
- ✅ No business logic duplication across systems
- ✅ State is serializable and reproducible
- 🟡 Career mode playable end-to-end (pending save/load)
- 🔴 Save/load preserves exact game state (pending)
- 🔴 Championship progression feels rewarding (pending)

---

## Future Enhancements

### Phase 7+ Features

1. **Multi-Season Careers**
   - Career spanning multiple years
   - Season-to-season progression
   - Historical season tracking

2. **Team Management**
   - Hire crew chief
   - Manage pit crew
   - Sponsorship deals
   - Car upgrades

3. **Multiplayer (Far Future)**
   - Online racing
   - Leagues and seasons
   - Competitive rankings

4. **Historical Content**
   - Classic NASCAR seasons
   - Legendary drivers as AI
   - Historical tracks

5. **Advanced Simulation**
   - Weather conditions
   - Track temperature effects
   - Qualifying sessions
   - Practice rounds

---

## Related Specifications

- **Physics Spec** (`specs/physics/`) - Simulation engine
- **Character Spec** (`specs/character/`) - Driver progression
- **Decisions Spec** (`specs/decisions/`) - Event system
- **UI Spec** (`specs/ui/`) - Display layer

---

**Last Reviewed:** 2025-11-16
**Next Review:** After career mode implementation
