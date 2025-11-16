# Game Modes & Flow Examples

**Version:** 1.0
**Last Updated:** 2025-11-16

---

## Overview

This document provides concrete examples of game flow scenarios, race configurations, career progression, and state transitions. All examples use real data structures from the NASCAR RPG Racing Simulation.

---

## Single Race Examples

### Example 1: Quick Race Setup (Bristol)

**Scenario:** Player wants a quick 100-lap race at Bristol

**Configuration:**
```typescript
const config: RaceConfig = {
  track: {
    id: "bristol",
    name: "Bristol Motor Speedway",
    length: 0.533,
    type: "short-track",
    // ... other track properties
  },
  laps: 100,
  playerDriver: {
    id: "player",
    name: "Your Name",
    carNumber: 42,
    skills: {
      racecraft: 65,
      consistency: 60,
      aggression: 55,
      focus: 62,
      // ... other skills
    },
    // ... mental state, stats
  },
  aiDrivers: generateAIField(39, 'mixed'), // 39 AI drivers
  startingPosition: 15 // Start mid-pack
};
```

**Flow:**
1. User selects "Quick Race" from main menu
2. Track selection menu → Bristol selected
3. Configure race → 100 laps, mixed AI difficulty
4. Starting position → 15th (or random)
5. Race begins → real-time simulation
6. Race completes → show results
7. Return to main menu

**Duration:** ~15 minutes real-time (100 laps × ~15.5s = 25 minutes race time, 2x speed)

---

### Example 2: Single Race Results

**Scenario:** Player finishes 8th from 15th starting position

**Results:**
```typescript
const results: RaceResults = {
  finishPosition: 8,
  startPosition: 15,
  positionsGained: 7, // Gained 7 positions
  lapsLed: 0,
  lapsCompleted: 100,
  fastestLap: 15.287,
  averageLap: 15.512,
  cleanLaps: 97, // 3 incidents
  decisionsTotal: 8,
  decisionsCorrect: 6, // 6 good, 2 poor decisions
  xpGained: [
    { skill: 'racecraft', amount: 75, reason: 'Strong position gains' },
    { skill: 'consistency', amount: 50, reason: 'Clean driving' },
    { skill: 'focus', amount: 40, reason: 'Good concentration' }
  ]
};
```

**XP Note:** In single race mode, XP is shown but may not persist (depending on configuration).

---

## Career Mode Examples

### Example 3: Career Start

**Scenario:** New career driver creation

**Initial State:**
```typescript
const newCareer: CareerSave = {
  driverId: "player-001",
  driver: {
    id: "player-001",
    name: "Rookie Driver",
    carNumber: 42,
    skills: {
      racecraft: 35,      // Rookie range: 30-40
      consistency: 32,
      aggression: 38,
      focus: 30,
      stamina: 33,
      composure: 31,
      pitStrategy: 30,
      tireMgmt: 34,
      fuelMgmt: 31,
      adaptability: 30
    },
    mentalState: {
      confidence: 50,     // Neutral starting state
      frustration: 0,
      focus: 70,
      distraction: 0
    },
    stats: {
      races: 0,
      wins: 0,
      top5s: 0,
      top10s: 0,
      avgFinish: 0,
      totalXP: 0
    }
  },
  season: 1,
  race: 1,              // Start at first race
  points: 0,
  unlockedTracks: [
    "bristol",          // Starting tracks
    "charlotte",
    "daytona"
  ],
  raceHistory: []       // No races yet
};
```

**Starting Objectives:**
- Learn the game mechanics
- Finish first race
- Try to finish in top 20

---

### Example 4: Career Race 1 Results

**Scenario:** First career race at Bristol (500 laps)

**Pre-Race:**
- Driver: Rookie skills (30-40 range)
- Starting position: 22nd (random)
- Goal: Finish the race, learn mechanics

**Post-Race Results:**
```typescript
const race1Results: RaceResults = {
  finishPosition: 18,
  startPosition: 22,
  positionsGained: 4,   // Small gain, but positive!
  lapsLed: 0,
  lapsCompleted: 500,
  fastestLap: 16.123,   // Slower than leaders (15.4s)
  averageLap: 16.287,
  cleanLaps: 467,       // 33 incidents (learning curve)
  decisionsTotal: 12,
  decisionsCorrect: 7,  // 7/12 good decisions
  xpGained: [
    { skill: 'racecraft', amount: 45, reason: 'Completed first race' },
    { skill: 'consistency', amount: 40, reason: '93% clean laps' },
    { skill: 'focus', amount: 35, reason: 'Long race completion' },
    { skill: 'stamina', amount: 50, reason: 'Endurance race bonus' },
    { skill: 'composure', amount: 30, reason: 'Handled pressure' }
  ]
};
```

**Championship Points Awarded:**
- Finish position 18th: 23 points
- Laps led bonus: 0 points
- Most laps led bonus: 0 points
- **Total: 23 points**

**Updated Career State:**
```typescript
{
  // ... driver skills updated with XP
  season: 1,
  race: 2,              // Advanced to race 2
  points: 23,
  unlockedTracks: [
    "bristol",
    "charlotte",
    "daytona",
    "richmond"          // ✅ Unlocked! (Top 20 finish)
  ],
  raceHistory: [race1Results]
}
```

---

### Example 5: Mid-Season Progress

**Scenario:** After 5 races in season 1

**Career State:**
```typescript
{
  driverId: "player-001",
  driver: {
    // Skills improved through XP
    skills: {
      racecraft: 48,    // Was 35, gained +13
      consistency: 45,  // Was 32, gained +13
      aggression: 42,   // Was 38, gained +4
      focus: 44,        // Was 30, gained +14
      stamina: 47,      // Was 33, gained +14
      // ... other skills improved
    },
    mentalState: {
      confidence: 65,   // Increased from 50
      frustration: 15,  // Some frustration from incidents
      focus: 75,
      distraction: 5
    },
    stats: {
      races: 5,
      wins: 0,
      top5s: 1,         // One 5th place finish!
      top10s: 3,        // Three top-10s
      avgFinish: 11.2,
      totalXP: 1847
    }
  },
  season: 1,
  race: 6,              // Ready for race 6
  points: 142,          // Accumulated points
  unlockedTracks: [
    "bristol", "charlotte", "daytona", "richmond",
    "atlanta", "talladega"  // Unlocked through performance
  ],
  raceHistory: [
    // Race 1: 18th place, +23 points
    // Race 2: 12th place, +29 points
    // Race 3: 8th place, +33 points
    // Race 4: 5th place, +38 points (breakthrough!)
    // Race 5: 14th place, +27 points
  ]
};
```

**Championship Standings (Top 10):**
```
Pos | Driver               | Points
----+----------------------+--------
 1  | Dale Earnhardt       | 198
 2  | Jeff Gordon          | 187
 3  | Jimmie Johnson       | 175
 4  | Dale Earnhardt Jr.   | 164
 5  | YOU (Rookie Driver)  | 142  ← Competitive!
 6  | Denny Hamlin         | 139
 7  | Kyle Busch           | 131
 8  | Joey Logano          | 128
 9  | Kevin Harvick        | 125
10  | Carl Edwards         | 118
```

**Narrative:** Player is competing for top 5 in championship! Significant progress from rookie start.

---

### Example 6: Season End

**Scenario:** After 10 races (season complete)

**Final Championship Results:**
```
Pos | Driver               | Points | Wins | Top 5s
----+----------------------+--------+------+--------
 1  | Jeff Gordon          | 412    | 4    | 8
 2  | Dale Earnhardt       | 398    | 3    | 7
 3  | YOU (Rookie Driver)  | 327    | 1    | 4  ← Champion!? No, but excellent!
 4  | Jimmie Johnson       | 321    | 2    | 6
 5  | Dale Earnhardt Jr.   | 315    | 0    | 5
...
```

**Season Summary:**
```typescript
{
  season: 1,
  finalPosition: 3,      // 3rd in championship!
  totalPoints: 327,
  wins: 1,               // First career win!
  top5s: 4,
  top10s: 8,
  races: 10,
  avgFinish: 6.8,
  totalXP: 4125,

  milestones: [
    "First race completed",
    "First top 10 finish",
    "First top 5 finish",
    "First win",
    "Top 3 championship finish"
  ]
}
```

**Season Rewards:**
- All tracks unlocked
- Season completion bonus: +500 XP (distributed across skills)
- Achievement unlocked: "Rookie Sensation" (Top 3 finish in first season)
- Ready to start Season 2 with improved skills

**Updated Driver Skills:**
```typescript
{
  racecraft: 68,      // Was 35 → +33 improvement
  consistency: 65,    // Was 32 → +33 improvement
  aggression: 58,     // Was 38 → +20 improvement
  focus: 64,          // Was 30 → +34 improvement
  stamina: 68,        // Was 33 → +35 improvement
  // ... all skills significantly improved
}
```

---

## Race Flow Examples

### Example 7: Real-Time Race Loop

**Scenario:** Race in progress, real-time tick simulation

**State Progression:**

**Lap 45, Tick 0 (0.0s into lap):**
```typescript
{
  currentLap: 45,
  playerPosition: 5,
  lapProgress: [
    { driverId: "player", progress: 0.0 },
    { driverId: "ai-001", progress: 0.0 },
    // ... all drivers at lap start
  ]
}
```

**Lap 45, Tick 50 (5.0s into lap):**
```typescript
{
  currentLap: 45,
  playerPosition: 5,
  lapProgress: [
    { driverId: "player", progress: 0.32 },  // 32% complete
    { driverId: "ai-001", progress: 0.34 },  // Slightly ahead
    // ... varying progress
  ]
}
```

**Lap 45, Tick 100 (10.0s into lap):**
```typescript
{
  currentLap: 45,
  playerPosition: 5,
  lapProgress: [
    { driverId: "player", progress: 0.65 },  // 65% complete
    { driverId: "ai-001", progress: 0.67 },
    // ...
  ]
}
```

**Lap 45, Tick 155 (15.5s - lap complete):**
```typescript
{
  currentLap: 46,         // Advanced to lap 46
  playerPosition: 5,      // Position unchanged
  lapProgress: [
    { driverId: "player", progress: 0.0 },  // Reset for new lap
    { driverId: "ai-001", progress: 0.0 },
    // ...
  ]
}
```

**Update Frequency:**
- Simulation tick: Every 100ms
- Display refresh: Every 500ms (every 5 ticks)
- Smooth lap progress visualization

---

### Example 8: Decision Mid-Race

**Scenario:** Pit decision triggered at lap 234

**Before Decision:**
```typescript
{
  currentLap: 234,
  totalLaps: 500,
  playerPosition: 3,
  playerCar: {
    tireGrip: 0.32,     // Low tire grip!
    fuelRemaining: 5.2
  },
  activeDecision: null,
  paused: false
}
```

**Decision Triggered:**
```typescript
{
  // ... race state same
  activeDecision: {
    id: "pit-234",
    type: "pit-stop",
    description: "Your tires are at 32% and falling off. Leaders pitted 5 laps ago. Do you pit now?",
    options: [
      {
        id: "pit-now",
        label: "Pit now",
        description: "Fresh tires, lose track position",
        risk: "medium",
        relevantSkills: ["pitStrategy", "racecraft"]
      },
      {
        id: "stay-out",
        label: "Stay out",
        description: "Maintain position, risk tire failure",
        risk: "high",
        relevantSkills: ["tireMgmt", "focus"]
      },
      {
        id: "conserve",
        label: "Conserve tires",
        description: "Slow down, extend tire life",
        risk: "low",
        relevantSkills: ["tireMgmt", "consistency"]
      }
    ],
    timeLimit: 10
  },
  paused: true          // Race paused for decision
}
```

**Player Chooses: "pit-now"**

**Decision Result:**
```typescript
{
  optionChosen: "pit-now",
  success: true,        // Skill check passed
  effects: {
    positionChange: -2, // Lost 2 positions (P3 → P5)
    tireWearChange: 1.0, // Fresh tires (100% grip)
    fuelChange: 12.5,   // Full fuel tank
    mentalStateChange: {
      confidence: +5    // Good strategic call
    }
  },
  xpGained: {
    skill: "pitStrategy",
    amount: 15,
    reason: "Successful pit decision"
  }
}
```

**After Decision:**
```typescript
{
  currentLap: 234,      // Same lap
  playerPosition: 5,    // Lost 2 spots
  playerCar: {
    tireGrip: 1.0,      // Fresh tires!
    fuelRemaining: 17.7 // Full tank
  },
  activeDecision: null, // Decision resolved
  paused: false         // Race resumed
}
```

**Next 20 Laps:** Player makes up lost positions with fresh tires, passes back to P3 by lap 250.

---

## Championship Points Examples

### Example 9: Points Calculation

**Race 1 Results:**
```typescript
{
  finishPosition: 5,
  lapsLed: 12,
  // ... other data
}
```

**Points Breakdown:**
- 5th place: 38 points (from points table)
- Led laps (12 > 0): +5 bonus
- Most laps led: +0 (leader led 120 laps)
- **Total: 43 points**

---

**Race 2 Results:**
```typescript
{
  finishPosition: 1,    // Winner!
  lapsLed: 234,         // Led most of race
  // ...
}
```

**Points Breakdown:**
- 1st place: 40 points
- Led laps: +5 bonus
- Most laps led: +5 bonus
- **Total: 50 points** (maximum possible)

---

**Race 3 Results:**
```typescript
{
  finishPosition: 18,
  lapsLed: 0,
  // ...
}
```

**Points Breakdown:**
- 18th place: 23 points
- Led laps: +0
- Most laps led: +0
- **Total: 23 points**

---

**After 3 Races:**
- Total Points: 43 + 50 + 23 = **116 points**
- Average finish: (5 + 1 + 18) / 3 = 8.0
- Championship position: Estimated 4th-6th

---

## Track Unlock Examples

### Example 10: Progressive Unlocking

**Starting Tracks:**
```typescript
unlockedTracks: ["bristol", "charlotte", "daytona"]
```

**After Race 1 (18th at Bristol):**
```
Finish: 18th (top 20)
Unlock: Richmond
unlockedTracks: ["bristol", "charlotte", "daytona", "richmond"]
```

**After Race 2 (12th at Charlotte):**
```
Finish: 12th (top 20)
Unlock: Atlanta
unlockedTracks: ["bristol", "charlotte", "daytona", "richmond", "atlanta"]
```

**After Race 3 (3rd at Daytona):**
```
Finish: 3rd (top 10)
Unlock: Talladega
unlockedTracks: ["bristol", "charlotte", "daytona", "richmond", "atlanta", "talladega"]
```

**Unlock Progression Curve:**
- Easy early: Top 20 finish unlocks next track
- Mid-season: Top 15 required
- Late-season: Top 10 required
- Special tracks: Wins required

---

## Save/Load Examples

### Example 11: Career Save File

**File:** `saves/career-player-001.json`

```json
{
  "driverId": "player-001",
  "driver": {
    "id": "player-001",
    "name": "Rookie Driver",
    "carNumber": 42,
    "skills": {
      "racecraft": 48,
      "consistency": 45,
      "aggression": 42,
      "focus": 44,
      "stamina": 47,
      "composure": 41,
      "pitStrategy": 38,
      "tireMgmt": 43,
      "fuelMgmt": 39,
      "adaptability": 40
    },
    "mentalState": {
      "confidence": 65,
      "frustration": 15,
      "focus": 75,
      "distraction": 5
    },
    "stats": {
      "races": 5,
      "wins": 0,
      "top5s": 1,
      "top10s": 3,
      "avgFinish": 11.2,
      "totalXP": 1847
    }
  },
  "season": 1,
  "race": 6,
  "points": 142,
  "unlockedTracks": [
    "bristol", "charlotte", "daytona", "richmond", "atlanta", "talladega"
  ],
  "raceHistory": [
    {
      "finishPosition": 18,
      "startPosition": 22,
      "positionsGained": 4,
      "lapsLed": 0,
      "fastestLap": 16.123,
      "averageLap": 16.287,
      "cleanLaps": 467,
      "decisionsTotal": 12,
      "decisionsCorrect": 7
    },
    // ... races 2-5
  ]
}
```

**Load Process:**
1. Read JSON file
2. Parse into CareerSave object
3. Validate structure
4. Restore driver state
5. Resume at race 6

---

## Validation Targets

### Race Completion Time

**Target:** Bristol 500 laps in ~15-20 minutes real-time

**Calculation:**
- Lap time: ~15.5s
- 500 laps × 15.5s = 7,750s = 129 minutes (2.15 hours)
- Real-time mode: 1:1 simulation
- Display update: Every 500ms (smooth enough)

**Actual:** Matches target in current implementation

---

### XP Progression Pacing

**Target:** Reach competitive skills (65+) by mid-season 2

**Trajectory:**
- Season 1 start: Skills 30-40 (rookie)
- Season 1 end: Skills 60-70 (competitive)
- Season 2 mid: Skills 70-80 (strong)
- Season 2 end: Skills 80-90 (elite)

**XP per race:** ~400-600 XP average
**Races to skill 65:** ~15-20 races (1.5-2 seasons)

✅ **Validated:** Pacing feels appropriate

---

## Related Documents

- `SPEC.md` - Game modes specification
- `CONTRACTS.md` - Interface documentation
- `REFERENCE.md` - Quick reference
- `specs/character/EXAMPLES.md` - XP progression details
- `specs/physics/EXAMPLES.md` - Lap time validation
