# Game Modes & Flow Quick Reference

**Version:** 1.0
**Last Updated:** 2025-11-16

---

## Overview

Quick reference guide for game modes, race configuration, championship points, and career progression. Use this for fast lookups during development.

---

## Game Modes Summary

| Mode | Purpose | Progression | Duration | Use Case |
|------|---------|-------------|----------|----------|
| **Single Race** | Standalone race | None (optional practice XP) | 15-30 min | Practice, quick play |
| **Career Mode** | Season championship | Full XP & unlocks | 3-5 hours/season | Main game mode |
| **Time Trial** | Lap time challenge | None | 5-10 min | Skill testing (future) |

---

## Race Configuration

### RaceConfig Quick Build

```typescript
// Quick race
const config: RaceConfig = {
  track: tracks.bristol,
  laps: 100,
  playerDriver: myDriver,
  aiDrivers: generateAIField(39, 'mixed'),
  startingPosition: 15 // or undefined for random
};
```

### Default Values

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| `laps` | Track-dependent | 10-500 | Short: 500, Inter: 250, Super: 200 |
| `aiDrivers.length` | 39 | 1-39 | Full field = 40 total |
| `startingPosition` | random | 1-40 | undefined = random |

---

## Championship Points Table

| Position | Points | Position | Points | Position | Points |
|----------|--------|----------|--------|----------|--------|
| 1st | 40 | 11th | 30 | 21st | 20 |
| 2nd | 35 | 12th | 29 | 22nd | 19 |
| 3rd | 34 | 13th | 28 | 23rd | 18 |
| 4th | 33 | 14th | 27 | 24th | 17 |
| 5th | 38 | 15th | 26 | 25th | 16 |
| 6th | 37 | 16th | 25 | ... | ... (decreasing) |
| 7th | 36 | 17th | 24 | 40th | 1 |
| 8th | 35 | 18th | 23 | | |
| 9th | 34 | 19th | 22 | | |
| 10th | 31 | 20th | 21 | | |

**Bonus Points:**
- Led a lap: +5
- Most laps led: +5
- **Maximum points per race:** 50 (win + both bonuses)
- **Minimum points per race:** 1 (40th place, no bonuses)

---

## Points Calculation Formula

```typescript
function calculateRacePoints(results: RaceResults, allDrivers: Driver[]): number {
  const basePoints = POINTS_TABLE[results.finishPosition];
  const lapsLedBonus = results.lapsLed > 0 ? 5 : 0;

  // Check if led most laps
  const mostLapsLed = Math.max(...allDrivers.map(d => d.lapsLed));
  const mostLapsLedBonus = results.lapsLed === mostLapsLed ? 5 : 0;

  return basePoints + lapsLedBonus + mostLapsLedBonus;
}
```

---

## AI Field Generation

### Difficulty Distribution

**Mixed Field (default):**
```
Rookie (40-50):     ~10 drivers (25%)
Amateur (50-65):    ~15 drivers (37%)
Professional (65-80): ~10 drivers (25%)
Elite (80-95):      ~5 drivers  (13%)
```

**Easy Field:**
```
Rookie:     ~20 drivers (50%)
Amateur:    ~15 drivers (37%)
Professional: ~5 drivers  (13%)
Elite:      ~0 drivers  (0%)
```

**Hard Field:**
```
Rookie:     ~0 drivers  (0%)
Amateur:    ~10 drivers (25%)
Professional: ~15 drivers (38%)
Elite:      ~15 drivers (37%)
```

### Generation Function

```typescript
function generateAIField(
  count: number,
  mix: 'easy' | 'mixed' | 'hard'
): AIDriver[]
```

---

## Track Unlock System

### Unlock Criteria

| Track | Unlock Condition | Required Performance |
|-------|------------------|---------------------|
| Bristol | Start | Available |
| Charlotte | Start | Available |
| Daytona | Start | Available |
| Richmond | Top 20 | Bristol or Charlotte |
| Atlanta | Top 20 | Bristol or Charlotte |
| Talladega | Top 10 | Daytona |
| ... | Progressive | Based on performance |

### Unlock Check Logic

```typescript
function checkTrackUnlock(
  results: RaceResults,
  currentUnlocks: string[]
): string[] {
  const newUnlocks = [...currentUnlocks];

  if (results.finishPosition <= 20 && !newUnlocks.includes('richmond')) {
    newUnlocks.push('richmond');
  }

  // ... check other unlock conditions

  return newUnlocks;
}
```

---

## Career Progression

### Starting State

```typescript
{
  skills: 30-40 (rookie range),
  mentalState: neutral (50% confidence),
  season: 1,
  race: 1,
  points: 0,
  unlockedTracks: ["bristol", "charlotte", "daytona"]
}
```

### Progression Milestones

| Milestone | Typical Race # | Skill Range | Achievement |
|-----------|----------------|-------------|-------------|
| **First race** | 1 | 30-40 | Complete race |
| **First top 20** | 1-3 | 35-45 | Points finish |
| **First top 10** | 3-7 | 45-55 | Competitive |
| **First top 5** | 5-12 | 55-65 | Contender |
| **First win** | 10-20 | 65-75 | Champion material |
| **Season 1 end** | 10 | 60-70 | Improved rookie |
| **Season 2 mid** | 15 | 70-80 | Strong driver |
| **Season 2 end** | 20 | 80-90 | Elite driver |

---

## Race Loop State Machine

### State Transitions

```
INITIALIZED
  ↓ start()
RUNNING
  ↓ pause() or decision triggered
PAUSED
  ↓ resume()
RUNNING
  ↓ race complete
COMPLETED
```

### State Methods

| Method | From State | To State | Purpose |
|--------|------------|----------|---------|
| `initialize(config)` | - | INITIALIZED | Load race config |
| `start()` | INITIALIZED | RUNNING | Begin race |
| `pause()` | RUNNING | PAUSED | Pause simulation |
| `resume()` | PAUSED | RUNNING | Resume simulation |
| `simulateTick(ms)` | RUNNING | RUNNING | Advance simulation |
| `isComplete()` | ANY | - | Check if finished |
| `getResults()` | COMPLETED | - | Get race results |

---

## Tick-Based Simulation

### Timing Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Simulation tick** | 100ms | 10 FPS |
| **Display refresh** | 500ms | 2 FPS (every 5 ticks) |
| **Lap progress update** | Every tick | Smooth progress bars |
| **Decision timeout** | 10 seconds | Configurable per decision |

### Simulation Loop

```typescript
// Every 100ms
setInterval(() => {
  engine.simulateTick(100);
}, 100);

// Every 500ms
setInterval(() => {
  const state = engine.getCurrentState();
  renderer.render(state);
}, 500);
```

---

## Career Save Structure

### File Locations

```
saves/
├── career-{driverId}.json       # Primary save
├── career-{driverId}-backup.json # Backup before modification
└── autosave.json                 # Auto-save slot
```

### Save Triggers

| Trigger | Frequency | Action |
|---------|-----------|--------|
| **After race** | Every race | Save career state |
| **Manual save** | User request | Save to slot (future) |
| **Auto-save** | Every 5 min | Save to autosave.json (future) |
| **Before quit** | Exit career | Save current state |

### Save/Load Functions

```typescript
function saveCareer(save: CareerSave, driverId: string): void
function loadCareer(driverId: string): CareerSave
function validateSave(save: CareerSave): boolean
```

---

## Win Conditions

### Race Win Conditions

| Condition | Description | Points |
|-----------|-------------|--------|
| **1st place** | Win | 40-50 |
| **Top 5** | Strong finish | 34-38 |
| **Top 10** | Points finish | 30-33 |
| **Top 20** | Mid-pack | 21-29 |
| **Finish** | Complete race | 1-20 |
| **DNF** | Did not finish | 0 (future) |

### Championship Win Condition

```typescript
// Highest points at season end (10 races)
const champion = standings[0]; // Top of standings

// Tie-breaker:
if (standings[0].points === standings[1].points) {
  // 1. Most wins
  // 2. Most top-5s
  // 3. Most top-10s
  // 4. Best average finish
}
```

---

## XP Awards (Career Mode)

### Per-Race XP Ranges

| Performance | Total XP | Distribution |
|-------------|----------|--------------|
| **Win** | 600-800 | Heavy on racecraft, consistency |
| **Top 5** | 400-600 | Balanced distribution |
| **Top 10** | 300-500 | Focus on completion skills |
| **Top 20** | 200-400 | Basic completion XP |
| **Finish** | 100-300 | Minimal XP |

### XP Bonuses

| Bonus | Condition | XP |
|-------|-----------|-----|
| **First win** | Career milestone | +200 |
| **Clean race** | 100% clean laps | +100 |
| **Comeback** | Gain 10+ positions | +150 |
| **Endurance** | 500-lap race | +100 |
| **Season complete** | Finish 10 races | +500 |

---

## Integration Points

### Physics System

**Used By Game Modes:**
```typescript
calculateLapTime(driver, car, track): number
calculateFuelConsumption(track, laps): number
calculateTireGrip(initialGrip, laps): number
```

**Ownership:** Physics spec (`specs/physics/`)

---

### Character System

**Used By Game Modes:**
```typescript
awardXP(results, driver): XPGain[]
updateMentalState(event, driver): MentalState
applySkillEffects(skills): { lapTimeModifier: number }
```

**Ownership:** Character spec (`specs/character/`)

---

### Decision System

**Used By Game Modes:**
```typescript
shouldTriggerDecision(state): Decision | null
evaluateDecision(decision, choice, driver): DecisionResult
applyEffects(result, state): RaceState
```

**Ownership:** Decisions spec (`specs/decisions/`)

---

### UI System

**Used By Game Modes:**
```typescript
render(state): void
showResults(results): void
promptDecision(decision): Promise<string>
showMenu(options): Promise<string>
```

**Ownership:** UI spec (`specs/ui/`)

---

## Testing Quick Reference

### Mock Data

```typescript
// Mock race config
const mockConfig: RaceConfig = {
  track: mockTrack(),
  laps: 100,
  playerDriver: mockDriver(),
  aiDrivers: mockAIField(39),
  startingPosition: 15
};

// Mock career save
const mockSave: CareerSave = {
  driverId: "test-001",
  driver: mockDriver({ skills: { racecraft: 65 } }),
  season: 1,
  race: 5,
  points: 142,
  unlockedTracks: ["bristol", "charlotte"],
  raceHistory: []
};
```

### Test Scenarios

| Scenario | Test Type | Validation |
|----------|-----------|------------|
| **Race completion** | Integration | Results generated correctly |
| **Points calculation** | Unit | Points match formula |
| **Track unlock** | Unit | Unlocks trigger correctly |
| **Save/load** | Integration | State restored exactly |
| **Championship standings** | Unit | Sorted by points correctly |

---

## File Organization

```
src/
├── modes/
│   ├── SingleRace.ts         # Single race mode
│   ├── CareerMode.ts         # Career mode orchestration
│   └── TimeTrialMode.ts      # Time trial (future)
├── engine/
│   └── simulation/
│       └── race.ts           # RaceEngine implementation
└── managers/
    ├── SaveManager.ts        # Save/load logic
    └── ChampionshipManager.ts # Points, standings

tests/unit/modes/
├── single-race.test.ts
├── career-mode.test.ts
└── championship.test.ts
```

---

## npm Scripts

```bash
# Testing
npm run test:run              # Run all tests once
npm run test:modes            # Test game modes only (future)

# Demo
npx tsx demo-race.ts          # Run interactive race demo

# Validation
npm run verify-specs          # Validate spec structure
```

---

## Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Lap simulation | < 10ms | ~5ms | ✅ Pass |
| Tick rate | 100ms | 100ms | ✅ Pass |
| Display refresh | 500ms | 500ms | ✅ Pass |
| Save file size | < 100KB | ~20KB | ✅ Pass |
| Load time | < 500ms | ~100ms | ✅ Pass |

---

## Common Patterns

### Race Initialization

```typescript
const engine = new RaceEngine();
engine.initialize(config);
engine.start();
```

### Career State Update

```typescript
// After race
const results = engine.getResults();
const newCareer = {
  ...currentCareer,
  race: currentCareer.race + 1,
  points: currentCareer.points + calculatePoints(results),
  raceHistory: [...currentCareer.raceHistory, results]
};
saveCareer(newCareer);
```

### Decision Handling

```typescript
// Race loop
const decision = decisionManager.shouldTriggerDecision(state);
if (decision) {
  engine.pause();
  const choice = await ui.promptDecision(decision);
  const result = decisionManager.evaluateDecision(decision, choice, driver);
  applyEffects(result);
  engine.resume();
}
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Race doesn't end | Laps not incrementing | Check tick simulation |
| Points incorrect | Wrong formula | Use championship points table |
| Save fails | Invalid state | Validate CareerSave structure |
| Unlocks not working | Wrong criteria | Check finish position logic |

---

## Related Documentation

- **SPEC.md** - Complete game modes specification
- **CONTRACTS.md** - Interface documentation
- **EXAMPLES.md** - Game flow scenarios
- `src/types.ts` - Source of truth for interfaces

---

**Last Updated:** 2025-11-16
**Next Review:** After career mode implementation
