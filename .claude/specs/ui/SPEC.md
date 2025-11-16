# User Interface Specification

**Version:** 1.0 (Content Migrated)
**Status:** 🟢 Active (90% complete)
**Last Updated:** 2025-11-16

---

## Overview

The console UI provides a terminal-based racing interface that displays real-time race state, driver information, and handles user interaction through menus and decision prompts.

**Key Features:**
- Real-time race display with lap-by-lap updates
- Live lap progress visualization
- Comprehensive driver and car status
- Race results with XP breakdown
- Decision prompts with countdown timers
- Menu system for game navigation

---

## Design Principles

### 1. Contract-First Development
- Implements `UIRenderer` interface from `types.ts`
- All components consume standardized data structures
- UI layer has zero business logic

### 2. Separation of Concerns
- Display components only format and render data
- No state management in UI layer
- Pure functions for all formatters

### 3. Testable Architecture
- Pure formatting functions that can be unit tested
- Snapshot tests for complete displays
- Mock data for integration tests

### 4. Progressive Enhancement
- Works with basic terminal (80x24 minimum)
- Enhanced with colors if ANSI codes supported
- Degrades gracefully without advanced features

---

## Architecture

```
ConsoleRenderer (implements UIRenderer)
├── LiveRaceDisplay (formats RaceState with real-time lap progress)
├── RaceResultsDisplay (formats RaceResults)
├── DriverStatusPanel (formats driver info)
├── DecisionPrompt (formats Decision with timer)
├── PositionTable (reusable standings formatter)
└── MenuHandler (handles input)
```

**Utility Modules:**
- `time-formatter.ts` - Lap times, gaps, durations
- `table-formatter.ts` - ASCII table rendering
- `progress-bar.ts` - Visual progress indicators
- `color-helpers.ts` - ANSI color codes (optional)

---

## Core Components

### ConsoleRenderer (Main Class)

**Purpose:** Implements `UIRenderer` interface and orchestrates all display components.

**Interface:**
```typescript
class ConsoleRenderer implements UIRenderer {
  render(state: RaceState): void
  showResults(results: RaceResults): void
  promptDecision(decision: Decision): Promise<string>
  showMenu(options: MenuOption[]): Promise<string>
  clear(): void
}
```

**Responsibilities:**
- Route display calls to appropriate components
- Manage screen clearing and updates
- Handle user input via MenuHandler
- Coordinate real-time display updates

---

### LiveRaceDisplay

**Purpose:** Renders current race state during live racing.

**Data Displayed:**
- Track name and lap counter (Lap X / Y)
- Leader information (name, last lap time)
- Player status (position, gap to leader, gap ahead)
- Top 10 standings table
- Player car status (tire wear, fuel level)
- Player mental state (confidence, focus, frustration)
- Real-time lap progress indicator

**Update Frequency:** Every 100-500ms during racing

**See:** `LAYOUTS.md` for full screen layout

---

### RaceResultsDisplay

**Purpose:** Shows final race summary and XP breakdown.

**Data Displayed:**
- Finishing position vs starting position
- Race statistics (laps led, fastest lap, average lap)
- Clean laps percentage
- XP gained breakdown by skill
- Performance highlights

**See:** `LAYOUTS.md` for full screen layout

---

### DriverStatusPanel

**Purpose:** Detailed driver information screen (career mode).

**Data Displayed:**
- All 10 driver skills with visual bars
- Current mental state
- Career statistics
- Level/XP progress

**Usage Context:** Pre-race setup, career mode menus

---

### DecisionPrompt

**Purpose:** Interactive decision prompt with countdown timer.

**Data Displayed:**
- Decision context (lap, position, situation)
- Available options (1-4 choices)
- Option details (risk level, relevant skills)
- Countdown timer (visual + numeric)
- Input prompt

**Interaction:** User selects option by number (1-4)

**See:** `LAYOUTS.md` for decision prompt layout

---

### PositionTable

**Purpose:** Reusable standings table formatter.

**Columns:**
- Position
- Car number
- Driver name
- Last lap time
- Gap to leader/ahead

**Features:**
- Highlights player row
- Configurable row count (top 5, top 10, full field)
- Dynamic column widths

---

### MenuHandler

**Purpose:** Handles user input for menu selections.

**Interface:**
```typescript
async showMenu(options: MenuOption[]): Promise<string>
```

**Input Method:** readline for interactive terminal input

**Features:**
- Numbered options (1-N)
- Disabled option indication
- Input validation
- Repeat prompt on invalid input

---

## Formatting Utilities

### time-formatter.ts

Pure functions for time display:

```typescript
formatLapTime(seconds: number): string
// Example: 91.234 → "1:31.234"

formatGap(seconds: number): string
// Example: 0 → "Leader", 1.24 → "+1.24s"

formatDuration(seconds: number): string
// Example: 8134 → "2h 15m 34s"
```

---

### table-formatter.ts

ASCII table rendering:

```typescript
formatTable(headers: string[], rows: string[][], alignments: Alignment[]): string

padString(str: string, length: number, align: 'left' | 'right' | 'center'): string
```

**Features:**
- Configurable column alignment
- Automatic column width calculation
- Header/separator rows
- Unicode box-drawing characters (optional)

---

### progress-bar.ts

Visual progress indicators:

```typescript
renderProgressBar(value: number, max: number, width: number): string
// Example: renderProgressBar(75, 100, 16) → "████████████░░░░ 75%"

renderLapProgressBar(progress: number, width: number): string
// Example: renderLapProgressBar(0.65, 40) → "[====================>....................]"
```

**Bar Styles:**
- Filled blocks: `████░░░░` (tire wear, fuel level)
- Track progress: `[====>......]` (lap completion)
- Percentage text: Optional suffix

---

### color-helpers.ts (Optional)

ANSI color codes for enhanced display:

```typescript
colorize(text: string, color: Color): string

Colors:
- Player: Green/Cyan
- Leader: Yellow
- Warnings: Red
- Status: White/Gray
```

**Fallback:** Plain text if colors not supported

---

## Display Flow

### Race Start → Finish

1. **Pre-Race:** Menu selection (track, difficulty, etc.)
2. **Race Start:** Clear screen, show initial LiveRaceDisplay
3. **During Race:**
   - Update LiveRaceDisplay every 500ms
   - Pause for decisions when triggered
   - Show decision prompt, wait for input
   - Resume racing after decision
4. **Race End:** Show RaceResultsDisplay
5. **Post-Race:** Return to menu or continue career

---

### Real-Time Racing Loop

```
Loop (every 100ms):
  1. Simulate tick (elapsedMs)
  2. Update race state
  3. Check for decisions
  4. Render display (every 5 ticks = 500ms)
  5. Handle pause/resume
```

**Key Feature:** Lap times match actual physics calculations (~15.5s at Bristol)

---

## Testing Strategy

### 1. Unit Tests

Test pure formatting functions in isolation:

```typescript
describe('formatLapTime', () => {
  it('formats seconds under 60', () => {
    expect(formatLapTime(15.234)).toBe('15.234s')
  })

  it('formats minutes:seconds', () => {
    expect(formatLapTime(91.234)).toBe('1:31.234')
  })
})
```

**Coverage:** All formatter functions, progress bars, table rendering

---

### 2. Snapshot Tests

Capture full display output:

```typescript
describe('LiveRaceDisplay', () => {
  it('renders race state correctly', () => {
    const state = mockRaceState()
    const output = renderLiveRace(state)
    expect(output).toMatchSnapshot()
  })
})
```

**Purpose:** Catch unintended layout changes

---

### 3. Integration Tests

Test ConsoleRenderer with mock data:

```typescript
describe('ConsoleRenderer', () => {
  it('renders race state and updates display', () => {
    const renderer = new ConsoleRenderer()
    const state = mockRaceState()
    renderer.render(state)
    // Verify output contains expected elements
  })
})
```

---

## Dependencies

**Built-in:**
- `readline` - Interactive terminal input (Node.js built-in)
- `process.stdout` - Terminal output

**Optional:**
- `chalk` - ANSI colors (can add later for enhancement)
- `cli-table3` - Advanced table rendering (alternative to custom formatter)

**Current:** No external dependencies required for core functionality

---

## Implementation Status

**Completed:**
- ✅ Time formatters (`time-formatter.ts`)
- ✅ Table formatters (`table-formatter.ts`)
- ✅ Progress bar formatters (`progress-bar.ts`)
- ✅ LiveRaceDisplay component
- ✅ RaceResultsDisplay component
- ✅ ConsoleRenderer main class
- ✅ Real-time lap progress visualization
- ✅ Demo script (`demo-race.ts`)

**In Progress:**
- 🟡 Decision prompt display (basic implementation exists)
- 🟡 Menu handler enhancements

**Planned:**
- 🔴 DriverStatusPanel (career mode feature)
- 🔴 Enhanced color support
- 🔴 Configurable display themes

---

## Success Criteria

- ✅ Implements `UIRenderer` interface completely
- ✅ Displays race state in readable format
- ✅ Shows race results with XP breakdown
- ✅ Updates display as race progresses in real-time
- ✅ Works in any standard terminal (80x24 minimum)
- ✅ Pure functions are testable and tested
- ✅ No business logic in UI layer
- ✅ Lap times match physics calculations

---

## Future Enhancements

### Phase 7+ Features

1. **Web UI Version**
   - Implement `UIRenderer` for browser
   - HTML/CSS rendering instead of ASCII
   - Real-time updates via WebSocket

2. **3D Visual Client**
   - 3D track visualization
   - Camera angles (cockpit, trackside, broadcast)
   - Still uses same `UIRenderer` interface

3. **Enhanced Console Features**
   - Configurable color schemes
   - Layout customization
   - Keyboard shortcuts
   - Replay mode

4. **Accessibility**
   - Screen reader support
   - High contrast mode
   - Adjustable text size

---

## Related Specifications

- **Physics Spec** (`specs/physics/`) - Provides lap times, speeds for display
- **Character Spec** (`specs/character/`) - Provides mental state, skills for display
- **Decisions Spec** (`specs/decisions/`) - Provides decision prompts to render
- **Game Modes Spec** (`specs/game-modes/`) - Orchestrates UI flow

---

**Last Reviewed:** 2025-11-16
**Next Review:** After Phase 7 (Career Mode) implementation
