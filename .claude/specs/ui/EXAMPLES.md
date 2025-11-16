# User Interface Examples

**Version:** 1.0
**Last Updated:** 2025-11-16

---

## Overview

This document provides concrete examples of UI displays, formatting utilities, and interactive components. All examples use real data structures from the NASCAR RPG Racing Simulation.

---

## Live Race Display Examples

### Example 1: Mid-Race Display (Bristol)

**Context:** Lap 45 of 500, player in 5th place, clean race

```
════════════════════════════════════════════════════════════
                    BRISTOL MOTOR SPEEDWAY
                        Lap 45 / 500
════════════════════════════════════════════════════════════

LEADER: #3 Dale Earnhardt      Last Lap: 15.412s

YOUR STATUS:
Position: P5 (+2 from start)
Gap to Leader: +1.24s  |  Gap Ahead: +0.31s

Lap Progress: [=========================>...............]  62%

STANDINGS:
Pos | Car# | Driver              | Last Lap  | Gap
----+------+---------------------+-----------+--------
 1  | #3   | Dale Earnhardt      |  15.412s  | Leader
 2  | #24  | Jeff Gordon         |  15.438s  | +0.15s
 3  | #48  | Jimmie Johnson      |  15.501s  | +0.67s
 4  | #88  | Dale Earnhardt Jr.  |  15.521s  | +0.93s
 5  | #42  | YOU                 |  15.543s  | +1.24s
 6  | #11  | Denny Hamlin        |  15.567s  | +1.58s
 7  | #18  | Kyle Busch          |  15.589s  | +1.89s
 8  | #22  | Joey Logano         |  15.612s  | +2.23s
 9  | #4   | Kevin Harvick       |  15.634s  | +2.58s
10  | #19  | Carl Edwards        |  15.657s  | +2.94s

CAR STATUS:
Tires: ████████████░░░░ 75%  (17 laps since pit)
Fuel:  ██████████████░░ 88%

MENTAL STATE:
Confidence: ████████████████ 82%  ↑
Focus:      ██████████████░░ 78%  ↓
Frustration: ████░░░░░░░░░░░ 23%  →
```

**Data Used:**
```typescript
{
  currentLap: 45,
  totalLaps: 500,
  track: { name: "Bristol Motor Speedway" },
  leaderLapTime: 15.412,
  playerPosition: 5,
  playerCar: { tireGrip: 0.75, fuelRemaining: 8.8 },
  lapProgress: [{ driverId: "player", progress: 0.62 }]
}
```

---

### Example 2: Late Race Pressure (Charlotte)

**Context:** Lap 234 of 250, player in 3rd, worn tires, leaders pitted

```
════════════════════════════════════════════════════════════
                 CHARLOTTE MOTOR SPEEDWAY
                       Lap 234 / 250
════════════════════════════════════════════════════════════

LEADER: #24 Jeff Gordon         Last Lap: 29.234s

YOUR STATUS:
Position: P3 (+5 from start)
Gap to Leader: +3.42s  |  Gap Ahead: +1.18s

Lap Progress: [=====>...................................]  12%

STANDINGS:
Pos | Car# | Driver              | Last Lap  | Gap
----+------+---------------------+-----------+--------
 1  | #24  | Jeff Gordon         |  29.234s  | Leader
 2  | #48  | Jimmie Johnson      |  29.401s  | +2.24s
 3  | #42  | YOU                 |  30.123s  | +3.42s ⚠
 4  | #3   | Dale Earnhardt      |  29.567s  | +4.28s
 5  | #88  | Dale Earnhardt Jr.  |  29.612s  | +5.15s

CAR STATUS:
Tires: ████░░░░░░░░░░░░ 32%  (42 laps since pit) ⚠
Fuel:  ██████████████░░ 85%

MENTAL STATE:
Confidence: ██████████████░░ 76%  ↓
Focus:      ████████████████ 85%  ↑
Frustration: ████████░░░░░░░ 45%  ↑
```

**Notes:**
- ⚠ Warning indicator for low tire grip
- Player's lap time slower due to tire wear (30.123s vs leader 29.234s)
- High frustration due to losing time

---

### Example 3: Superspeedway Pack Racing (Daytona)

**Context:** Lap 78 of 200, tight pack, drafting

```
════════════════════════════════════════════════════════════
                DAYTONA INTERNATIONAL SPEEDWAY
                        Lap 78 / 200
════════════════════════════════════════════════════════════

LEADER: #3 Dale Earnhardt      Last Lap: 49.823s

YOUR STATUS:
Position: P8 (-3 from start)
Gap to Leader: +0.42s  |  Gap Ahead: +0.05s  [DRAFTING]

Lap Progress: [==================================>.........]  87%

STANDINGS:
Pos | Car# | Driver              | Last Lap  | Gap
----+------+---------------------+-----------+--------
 1  | #3   | Dale Earnhardt      |  49.823s  | Leader
 2  | #24  | Jeff Gordon         |  49.834s  | +0.08s
 3  | #48  | Jimmie Johnson      |  49.845s  | +0.15s
 4  | #88  | Dale Earnhardt Jr.  |  49.856s  | +0.23s
 5  | #11  | Denny Hamlin        |  49.867s  | +0.30s
 6  | #18  | Kyle Busch          |  49.878s  | +0.35s
 7  | #22  | Joey Logano         |  49.889s  | +0.38s
 8  | #42  | YOU                 |  49.901s  | +0.42s
 9  | #4   | Kevin Harvick       |  49.912s  | +0.47s
10  | #19  | Carl Edwards        |  49.923s  | +0.52s

CAR STATUS:
Tires: ██████████████░░ 82%  (12 laps since pit)
Fuel:  ████████████░░░░ 71%

MENTAL STATE:
Confidence: ██████████████░░ 78%  →
Focus:      ████████████████ 88%  ↑
Frustration: ██░░░░░░░░░░░░░ 15%  →
```

**Notes:**
- Tight gaps (all within 0.5s)
- [DRAFTING] indicator shows aerodynamic effect
- High focus due to pack racing intensity

---

## Race Results Display Examples

### Example 4: Solid Finish (5th Place)

```
════════════════════════════════════════════════════════════
                      RACE RESULTS
                Bristol Motor Speedway - 500 Laps
════════════════════════════════════════════════════════════

FINISHING POSITION: 5th  (+2 from start)

RACE STATS:
Started:      P7
Finished:     P5
Laps Led:     12
Fastest Lap:  15.287s (Lap 156)
Average Lap:  15.512s
Clean Laps:   487 / 500  (97.4%)

XP GAINED:
Racecraft:      +125 ████████████░░░░  (Good positioning)
Consistency:    +89  ████████░░░░░░░░  (Clean driving)
Focus:          +67  ██████░░░░░░░░░░  (Maintained concentration)
Tire Mgmt:      +45  ████░░░░░░░░░░░░  (Effective tire saving)

TOTAL XP: +326

Performance Rating: B+

════════════════════════════════════════════════════════════
Press Enter to continue...
```

**Data Used:**
```typescript
{
  finishPosition: 5,
  startPosition: 7,
  lapsLed: 12,
  fastestLap: 15.287,
  averageLap: 15.512,
  xpGained: [
    { skill: 'racecraft', amount: 125, reason: 'Good positioning' },
    { skill: 'consistency', amount: 89, reason: 'Clean driving' },
    { skill: 'focus', amount: 67, reason: 'Maintained concentration' },
    { skill: 'tireMgmt', amount: 45, reason: 'Effective tire saving' }
  ],
  raceStats: {
    cleanLaps: 487,
    successfulPasses: 18,
    failedPasses: 4,
    decisionsCorrect: 10,
    decisionsTotal: 12
  }
}
```

---

### Example 5: Victory! (1st Place)

```
════════════════════════════════════════════════════════════
                      RACE RESULTS
                Charlotte Motor Speedway - 250 Laps
════════════════════════════════════════════════════════════

               🏆 WINNER! 🏆

FINISHING POSITION: 1st  (+7 from start)

RACE STATS:
Started:      P8
Finished:     P1
Laps Led:     67
Fastest Lap:  29.124s (Lap 198)
Average Lap:  29.387s
Clean Laps:   249 / 250  (99.6%)

XP GAINED:
Racecraft:      +250 ████████████████  (Victory bonus)
Consistency:    +180 ██████████████░░  (Fastest lap)
Focus:          +150 ████████████░░░░  (Clutch finish)
Tire Mgmt:      +120 ██████████░░░░░░  (Perfect strategy)
Composure:      +100 ████████░░░░░░░░  (Led final 30 laps)

TOTAL XP: +800

Performance Rating: S

════════════════════════════════════════════════════════════
"Great drive! That's how it's done!"
Press Enter to continue...
```

**Notes:**
- Victory bonus applied to XP
- S-rank performance rating
- Congratulatory message

---

## Decision Prompt Examples

### Example 6: Pit Stop Decision

**Context:** Mid-race, tire wear increasing, caution flag

```
════════════════════════════════════════════════════════════
                    DECISION REQUIRED
════════════════════════════════════════════════════════════
Lap 234 - You're in P3 with 25 laps to go. Your tires are
at 32% and falling off. The leaders pitted 5 laps ago.

Caution flag is out. Do you pit now?

 1. Pit now - fresh tires, lose track position
    Risk: MEDIUM | Skills: Pit Strategy, Racecraft
    Impact: Lose 2-3 positions, gain ~0.5s/lap pace

 2. Stay out - maintain track position, hope for caution
    Risk: HIGH | Skills: Tire Management, Focus
    Impact: Keep P3, risk tire failure, lose ~0.3s/lap

 3. Conserve tires - slow down, preserve what's left
    Risk: LOW | Skills: Tire Management, Consistency
    Impact: Lose ~0.2s/lap, extend tire life ~5 laps

Time remaining: [████████░░] 8 seconds...

Your choice [1-3]: _
```

**Data Used:**
```typescript
{
  id: "pit-234",
  type: "pit-stop",
  description: "Lap 234 - You're in P3 with 25 laps to go...",
  timeLimit: 10,
  options: [
    {
      id: "pit-now",
      label: "Pit now",
      description: "fresh tires, lose track position",
      risk: "medium",
      relevantSkills: ["pitStrategy", "racecraft"],
      estimatedImpact: {
        position: "Lose 2-3 positions",
        time: "gain ~0.5s/lap pace"
      }
    },
    // ... other options
  ]
}
```

---

### Example 7: Passing Attempt Decision

**Context:** Late race, battling for position

```
════════════════════════════════════════════════════════════
                    DECISION REQUIRED
════════════════════════════════════════════════════════════
Lap 189 - You're running P4, closing on P3 (Dale Earnhardt).
He's struggling with worn tires. You have fresh rubber.

Attempt to pass on the inside?

 1. Go for it now - aggressive inside dive
    Risk: HIGH | Skills: Aggression, Racecraft, Confidence
    Impact: Could gain position, risk contact/spin

 2. Set up pass - wait for better opportunity (2-3 laps)
    Risk: MEDIUM | Skills: Racecraft, Focus, Patience
    Impact: Higher success rate, might lose momentum

 3. Stay patient - follow until he makes mistake
    Risk: LOW | Skills: Patience, Consistency, Focus
    Impact: Safe but slow, might not pass before finish

Time remaining: [██████████] 10 seconds...

Your choice [1-3]: _
```

---

### Example 8: Mental State Decision

**Context:** High frustration after incident

```
════════════════════════════════════════════════════════════
                    DECISION REQUIRED
════════════════════════════════════════════════════════════
Lap 123 - You just got spun by another driver and dropped
from P2 to P12. Your frustration is at 85%.

How do you respond?

 1. Retaliate - payback on next lap
    Risk: CRITICAL | Skills: Aggression
    Impact: Likely wreck both cars, severe frustration spike

 2. Focus on recovery - forget it, race your race
    Risk: LOW | Skills: Composure, Focus
    Impact: Frustration drops -20%, clean race continues

 3. Radio crew - vent frustration, get advice
    Risk: MEDIUM | Skills: Composure, Communication
    Impact: Frustration drops -10%, crew morale impact

Time remaining: [████░░░░░░] 4 seconds...

Your choice [1-3]: _
```

**Notes:**
- Critical risk shown in red (if colors enabled)
- Composure skill heavily weighted
- Decision affects mental state significantly

---

## Formatter Function Examples

### Example 9: Time Formatting

**Function:** `formatLapTime(seconds: number): string`

```typescript
formatLapTime(15.234)    → "15.234s"
formatLapTime(91.567)    → "1:31.567"
formatLapTime(3665.123)  → "1:01:05.123"
```

---

### Example 10: Gap Formatting

**Function:** `formatGap(seconds: number): string`

```typescript
formatGap(0)       → "Leader"
formatGap(1.234)   → "+1.234s"
formatGap(12.567)  → "+12.567s"
formatGap(-0.5)    → "-0.500s"  // Ahead by 0.5s
```

---

### Example 11: Progress Bar Rendering

**Function:** `renderProgressBar(value: number, max: number, width: number): string`

```typescript
renderProgressBar(75, 100, 16)   → "████████████░░░░ 75%"
renderProgressBar(50, 100, 16)   → "████████░░░░░░░░ 50%"
renderProgressBar(100, 100, 16)  → "████████████████ 100%"
renderProgressBar(0, 100, 16)    → "░░░░░░░░░░░░░░░░ 0%"
```

---

### Example 12: Lap Progress Bar

**Function:** `renderLapProgressBar(progress: number, width: number): string`

```typescript
renderLapProgressBar(0.0, 40)   → "[..........................................]  0%"
renderLapProgressBar(0.25, 40)  → "[=========>................................]  25%"
renderLapProgressBar(0.5, 40)   → "[====================>.....................]  50%"
renderLapProgressBar(0.75, 40)  → "[==============================>...........]  75%"
renderLapProgressBar(0.95, 40)  → "[======================================>...]  95%"
```

---

## Menu Display Examples

### Example 13: Main Menu

```
════════════════════════════════════════════════════════════
            NASCAR RPG RACING SIMULATION
════════════════════════════════════════════════════════════

MAIN MENU:

 1. Quick Race
    Jump into a single race

 2. Career Mode
    Season championship with progression

 3. Settings
    Configure game options

 4. Quit

Your choice [1-4]: _
```

**Data Used:**
```typescript
const mainMenu: MenuOption[] = [
  { id: 'quick-race', label: 'Quick Race', description: 'Jump into a single race' },
  { id: 'career', label: 'Career Mode', description: 'Season championship with progression' },
  { id: 'settings', label: 'Settings', description: 'Configure game options' },
  { id: 'quit', label: 'Quit' }
];
```

---

### Example 14: Track Selection Menu

```
════════════════════════════════════════════════════════════
                    SELECT TRACK
════════════════════════════════════════════════════════════

Available Tracks:

 1. Bristol Motor Speedway
    Short track - 0.533 miles - 500 laps

 2. Charlotte Motor Speedway
    Intermediate - 1.5 miles - 250 laps

 3. Daytona International Speedway
    Superspeedway - 2.5 miles - 200 laps

 4. [LOCKED] Talladega Superspeedway
    Win at Daytona to unlock

 5. Back to Main Menu

Your choice [1-5]: _
```

**Notes:**
- Locked tracks shown with [LOCKED] prefix
- Description includes track type and race length
- Back option always available

---

## Driver Status Panel Example

### Example 15: Career Driver Profile

```
════════════════════════════════════════════════════════════
                    DRIVER PROFILE
════════════════════════════════════════════════════════════
Name: Your Name (#42)
Level: 15  |  XP: 8,450 / 10,000 to next level

SKILLS:
Racecraft:      72  ████████████████░░░░░░░░░░░░
Consistency:    68  ██████████████░░░░░░░░░░░░░░
Aggression:     55  ████████████░░░░░░░░░░░░░░░░
Focus:          64  █████████████░░░░░░░░░░░░░░░
Stamina:        58  ████████████░░░░░░░░░░░░░░░░
Composure:      61  █████████████░░░░░░░░░░░░░░░
Pit Strategy:   45  ██████████░░░░░░░░░░░░░░░░░░
Tire Mgmt:      52  ███████████░░░░░░░░░░░░░░░░░
Fuel Mgmt:      48  ██████████░░░░░░░░░░░░░░░░░░
Adaptability:   50  ███████████░░░░░░░░░░░░░░░░░

MENTAL STATE:
Confidence:     82%  ████████████████░░░░
Focus:          78%  ████████████████░░░░
Frustration:    23%  █████░░░░░░░░░░░░░░░

CAREER STATS:
Races:          24
Wins:           3
Top 5s:         12
Top 10s:        18
Avg Finish:     7.2
DNFs:           1

════════════════════════════════════════════════════════════
Press Enter to continue...
```

---

## Validation Targets

### Display Update Performance

**Target:** 60 FPS rendering (not required, but smooth updates)
**Actual:** 10 FPS simulation tick rate, 2 FPS display refresh (500ms)
**Result:** Smooth enough for turn-based racing decisions

---

### Terminal Compatibility

**Minimum:** 80 columns x 24 rows
**Recommended:** 100 columns x 30 rows
**Tested On:**
- ✅ macOS Terminal
- ✅ iTerm2
- ✅ Windows Terminal
- ✅ WSL2 terminal
- ✅ VS Code integrated terminal

---

### ANSI Color Support

**Graceful Degradation:**
- Colors enabled: Enhanced visual hierarchy
- Colors disabled: Still fully functional, readable layout

---

## Related Documents

- `SPEC.md` - UI system overview
- `CONTRACTS.md` - Interface documentation
- `LAYOUTS.md` - Detailed screen mockups
- `REFERENCE.md` - Quick reference for formatters
