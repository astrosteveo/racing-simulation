# Console UI Architecture

## Overview

The console UI implements the `UIRenderer` interface from `types.ts` to provide a terminal-based racing display.

## Design Principles

1. **Contract-First**: Implements `UIRenderer` interface exactly
2. **Separation of Concerns**: Display components don't contain business logic
3. **Testable**: Pure formatting functions that can be unit tested
4. **Progressive Enhancement**: Works with basic terminal, enhanced with colors if available

## Architecture

```
ConsoleRenderer (implements UIRenderer)
├── LiveRaceDisplay (formats RaceState)
├── RaceResultsDisplay (formats RaceResults)
├── DriverStatusPanel (formats driver info)
├── PositionTable (formats standings)
└── MenuHandler (handles input)
```

## Components

### ConsoleRenderer (Main Class)

Implements `UIRenderer` interface and orchestrates all display components.

```typescript
class ConsoleRenderer implements UIRenderer {
  render(state: RaceState): void
  showResults(results: RaceResults): void
  promptDecision(decision: Decision): Promise<string>  // Phase 4
  showMenu(options: MenuOption[]): Promise<string>
  clear(): void
}
```

### LiveRaceDisplay

Renders current race state with:
- Lap counter (Lap X / Y)
- Leader info (name, last lap time)
- Player status (position, gap to leader, gap to next)
- Top 10 positions table
- Player car status (tires, fuel)
- Player mental state

**Layout Example:**
```
════════════════════════════════════════════════════════════
                    BRISTOL MOTOR SPEEDWAY
                        Lap 42 / 500
════════════════════════════════════════════════════════════

LEADER: #3 Dale Earnhardt      Last Lap: 15.412s

YOUR STATUS:
Position: P5 (+2 from start)
Gap to Leader: +1.24s  |  Gap Ahead: +0.31s

STANDINGS:
Pos | Car# | Driver              | Last Lap  | Gap
----+------+---------------------+-----------+--------
 1  | #3   | Dale Earnhardt      |  15.412s  | Leader
 2  | #24  | Jeff Gordon         |  15.438s  | +0.15s
 3  | #48  | Jimmie Johnson      |  15.501s  | +0.67s
 4  | #88  | Dale Earnhardt Jr.  |  15.521s  | +0.93s
 5  | #42  | YOU                 |  15.543s  | +1.24s
 6  | #11  | Denny Hamlin        |  15.567s  | +1.58s
...

CAR STATUS:
Tires: ████████████░░░░ 75%  (17 laps since pit)
Fuel:  ██████████████░░ 88%

MENTAL STATE:
Confidence: ████████████████ 82%  ↑
Focus:      ██████████████░░ 78%  ↓
Frustration: ████░░░░░░░░░░░ 23%  →
```

### RaceResultsDisplay

Shows final race summary:
- Finish position vs start position
- Laps led, fastest lap
- XP gained breakdown
- Performance stats

**Layout Example:**
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
Clean Laps:   487 / 500

XP GAINED:
Racecraft:      +125 ████████████░░░░
Consistency:    +89  ████████░░░░░░░░
Focus:          +67  ██████░░░░░░░░░░
Tire Mgmt:      +45  ████░░░░░░░░░░░░

TOTAL XP: +326
════════════════════════════════════════════════════════════
```

### DriverStatusPanel

Detailed driver information:
- All 10 skills with bars
- Mental state
- Career stats

### PositionTable

Reusable standings table formatter.

## Utility Modules

### time-formatter.ts
- `formatLapTime(seconds: number): string` → "15.412s"
- `formatGap(seconds: number): string` → "+1.24s" or "Leader"
- `formatDuration(seconds: number): string` → "2h 15m 34s"

### table-formatter.ts
- `formatTable(headers, rows, alignments): string` → ASCII table
- `padString(str, length, align): string`

### progress-bar.ts
- `renderProgressBar(value: number, max: number, width: number): string`
- Example: `████████░░░░░░░░ 75%`

### color-helpers.ts (optional)
- ANSI color codes for enhanced display
- Falls back to plain text if colors not supported

## Input Handling

### MenuHandler

Handles user input for menu selections:
```typescript
async showMenu(options: MenuOption[]): Promise<string>
```

Uses `readline` or similar for interactive input.

## Testing Strategy

1. **Unit Tests**: Test formatting functions in isolation
   - `formatLapTime(91.234)` → "1:31.234"
   - `renderProgressBar(75, 100, 16)` → "████████████░░░░"

2. **Snapshot Tests**: Capture full display output
   - Given a RaceState, verify the full rendered output

3. **Integration Tests**: Test ConsoleRenderer with mock data
   - Initialize, render, verify output contains expected elements

## Phase 4 Integration

Decision prompts (deferred to Phase 4):
```
════════════════════════════════════════════════════════════
                    DECISION REQUIRED
════════════════════════════════════════════════════════════
Lap 234 - You're in P3 with 25 laps to go. Your tires are
at 32% and falling off. The leaders pitted 5 laps ago.

Do you pit now?

 1. Pit now - lose track position but get fresh tires
    Risk: MEDIUM | Skills: Pit Strategy, Racecraft

 2. Stay out - maintain track position, hope for caution
    Risk: HIGH | Skills: Tire Management, Focus

 3. Conserve tires - slow down, preserve what's left
    Risk: LOW | Skills: Tire Management, Consistency

Time remaining: 10 seconds...

Your choice [1-3]:
```

## Implementation Order

1. ✅ Design document (this file)
2. Time/table formatters (pure functions)
3. PositionTable (reusable component)
4. LiveRaceDisplay (main race view)
5. RaceResultsDisplay (post-race summary)
6. DriverStatusPanel (driver details)
7. MenuHandler (user input)
8. ConsoleRenderer (orchestration)
9. Tests for all components
10. Demo script to test end-to-end

## Dependencies

- **readline**: For interactive input (built-in Node.js)
- **chalk** (optional): For colors (can add later)
- No other external dependencies

## Success Criteria

- ✅ Implements UIRenderer interface completely
- ✅ Displays race state in readable format
- ✅ Shows race results with XP breakdown
- ✅ Updates display as race progresses
- ✅ Works in any standard terminal
- ✅ Pure functions are testable
- ✅ No business logic in UI layer
