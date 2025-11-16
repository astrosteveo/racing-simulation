# User Interface Quick Reference

**Version:** 1.0
**Last Updated:** 2025-11-16

---

## Overview

Quick reference guide for UI components, formatters, and testing utilities. Use this for fast lookups during development.

---

## Formatter Functions

### Time Formatters (`src/ui/console/formatters/time-formatter.ts`)

| Function | Signature | Example Input | Example Output |
|----------|-----------|---------------|----------------|
| `formatLapTime` | `(seconds: number) => string` | `15.234` | `"15.234s"` |
| | | `91.567` | `"1:31.567"` |
| `formatGap` | `(seconds: number) => string` | `0` | `"Leader"` |
| | | `1.234` | `"+1.234s"` |
| `formatDuration` | `(seconds: number) => string` | `8134` | `"2h 15m 34s"` |

---

### Progress Bar Formatters (`src/ui/console/formatters/progress-bar.ts`)

| Function | Signature | Example Input | Example Output |
|----------|-----------|---------------|----------------|
| `renderProgressBar` | `(value: number, max: number, width: number) => string` | `75, 100, 16` | `"████████████░░░░ 75%"` |
| `renderLapProgressBar` | `(progress: number, width: number) => string` | `0.65, 40` | `"[====================>..........]"` |
| `renderLapProgressWithPercentage` | `(progress: number, width: number) => string` | `0.65, 40` | `"[====================>..........]  65%"` |

**Bar Characters:**
- Filled: `█` (U+2588)
- Empty: `░` (U+2591)
- Track filled: `=`
- Track pointer: `>`
- Track empty: `.`
- Track brackets: `[` `]`

---

### Table Formatters (`src/ui/console/formatters/table-formatter.ts`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `formatTable` | `(headers: string[], rows: string[][], alignments: Alignment[]) => string` | Render full ASCII table |
| `padString` | `(str: string, length: number, align: 'left' \| 'right' \| 'center') => string` | Pad string to fixed width |

**Table Format:**
```
Header1 | Header2 | Header3
--------+---------+--------
Row1Col1| Row1Col2| Row1Col3
Row2Col1| Row2Col2| Row2Col3
```

---

## Core Components

### ConsoleRenderer (`src/ui/console/ConsoleRenderer.ts`)

**Implements:** `UIRenderer`

**Methods:**

| Method | Parameters | Returns | Purpose |
|--------|------------|---------|---------|
| `render` | `state: RaceState` | `void` | Render live race display |
| `showResults` | `results: RaceResults` | `void` | Show post-race summary |
| `promptDecision` | `decision: Decision` | `Promise<string>` | Interactive decision prompt |
| `showMenu` | `options: MenuOption[]` | `Promise<string>` | Menu selection |
| `clear` | - | `void` | Clear screen |

---

### LiveRaceDisplay (`src/ui/console/components/LiveRaceDisplay.ts`)

**Purpose:** Real-time race state display

**Key Features:**
- Track name and lap counter
- Leader info
- Player status with gaps
- Top 10 standings table
- Car status (tires, fuel)
- Mental state bars
- Real-time lap progress indicator

**Update Frequency:** Every 500ms (configurable)

---

### RaceResultsDisplay (`src/ui/console/components/RaceResultsDisplay.ts`)

**Purpose:** Post-race summary

**Displays:**
- Final position vs start
- Race statistics
- XP breakdown
- Performance rating

---

### DecisionPrompt (TBD - planned component)

**Purpose:** Interactive decision with countdown

**Features:**
- Situation description
- 1-4 numbered options
- Risk indicators
- Countdown timer
- Input validation

---

## Component Responsibilities Matrix

| Component | Data Display | User Input | State Mutation | Business Logic |
|-----------|--------------|------------|----------------|----------------|
| ConsoleRenderer | ✅ Orchestrates | ✅ Coordinates | ❌ Never | ❌ Never |
| LiveRaceDisplay | ✅ Formats | ❌ No | ❌ Never | ❌ Never |
| RaceResultsDisplay | ✅ Formats | ❌ No | ❌ Never | ❌ Never |
| MenuHandler | ✅ Shows options | ✅ Gets input | ❌ Never | ❌ Never |
| Formatters | ✅ Pure functions | ❌ No | ❌ Never | ❌ Never |

**Rules:**
- ✅ UI components **display** data
- ✅ UI components **collect** user input
- ❌ UI components **never mutate** state
- ❌ UI components **never contain** business logic

---

## Testing Quick Reference

### Unit Test Examples

```typescript
// Time formatter
expect(formatLapTime(15.234)).toBe('15.234s');

// Progress bar
expect(renderProgressBar(75, 100, 16)).toBe('████████████░░░░ 75%');

// Gap formatter
expect(formatGap(0)).toBe('Leader');
expect(formatGap(1.234)).toBe('+1.234s');
```

---

### Snapshot Test Pattern

```typescript
import { renderLiveRace } from './LiveRaceDisplay';

describe('LiveRaceDisplay', () => {
  it('renders race state correctly', () => {
    const state = mockRaceState();
    const output = renderLiveRace(state);
    expect(output).toMatchSnapshot();
  });
});
```

---

### Mock Data Utilities

```typescript
// Create mock RaceState
function mockRaceState(overrides?: Partial<RaceState>): RaceState {
  return {
    currentLap: 45,
    totalLaps: 500,
    positions: mockPositions(),
    // ... defaults
    ...overrides
  };
}
```

**Location:** `tests/helpers/ui-mocks.ts` (create when needed)

---

## File Organization

```
src/ui/console/
├── ConsoleRenderer.ts           # Main UIRenderer implementation
├── components/
│   ├── LiveRaceDisplay.ts       # Real-time race display
│   ├── RaceResultsDisplay.ts    # Post-race summary
│   ├── DriverStatusPanel.ts     # Driver details (future)
│   └── MenuHandler.ts           # Input handling
└── formatters/
    ├── time-formatter.ts        # Lap times, gaps, durations
    ├── table-formatter.ts       # ASCII tables
    ├── progress-bar.ts          # Visual progress bars
    └── color-helpers.ts         # ANSI colors (optional)

tests/unit/ui/
├── console-renderer.test.ts     # Main renderer tests
├── live-race-display.test.ts    # Live display tests
├── race-results.test.ts         # Results display tests
├── time-formatter.test.ts       # Time formatter unit tests
├── table-formatter.test.ts      # Table formatter unit tests
└── progress-bar.test.ts         # Progress bar tests (+12 tests)
```

---

## Terminal Requirements

### Minimum Specifications

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Columns | 80 | 100 |
| Rows | 24 | 30 |
| ANSI Colors | Not required | Supported |
| Unicode | Basic ASCII works | UTF-8 for bars |

---

### Terminal Compatibility

| Terminal | Status | Notes |
|----------|--------|-------|
| macOS Terminal | ✅ Tested | Full support |
| iTerm2 | ✅ Tested | Full support |
| Windows Terminal | ✅ Tested | Full support |
| WSL2 | ✅ Tested | Full support |
| VS Code Terminal | ✅ Tested | Full support |

---

## Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Render time | < 16ms | ~5ms | ✅ Pass |
| Display refresh | 10 FPS | 2 FPS (500ms) | ✅ Acceptable |
| Simulation tick | 100ms | 100ms | ✅ Pass |
| Input latency | < 100ms | ~50ms | ✅ Pass |

**Note:** 2 FPS display refresh is intentional - provides smooth visual updates without overwhelming the terminal.

---

## Common Patterns

### Rendering Pipeline

```
RaceEngine.getCurrentState()
  ↓
RaceState (snapshot)
  ↓
UIRenderer.render(state)
  ↓
LiveRaceDisplay.render(state)
  ↓
Formatters (pure functions)
  ↓
console.log(output)
```

---

### Decision Flow

```
RaceEngine detects decision needed
  ↓
RaceEngine.pause()
  ↓
UIRenderer.promptDecision(decision)
  ↓
MenuHandler.getInput()
  ↓
Return option ID
  ↓
RaceEngine.handleDecision(optionId)
  ↓
RaceEngine.resume()
```

---

### Real-Time Update Loop

```typescript
// demo-race.ts pattern
setInterval(() => {
  engine.simulateTick(100); // Tick simulation
}, 100);

setInterval(() => {
  const state = engine.getCurrentState();
  renderer.render(state); // Update display
}, 500);
```

---

## Validation Checklist

### Before Committing UI Changes

- [ ] All formatters are pure functions (no side effects)
- [ ] No business logic in UI components
- [ ] No state mutation in display code
- [ ] TypeScript type checks pass (`npm run type-check`)
- [ ] Unit tests pass for formatters (`npm run test:run`)
- [ ] Snapshot tests updated if layout changed
- [ ] Terminal compatibility tested (at least one terminal)
- [ ] 80x24 minimum terminal size tested

---

## npm Scripts

```bash
# Testing
npm run test:run              # Run all tests once
npm test                      # Watch mode
npm run test:ui               # Interactive test UI

# Type checking
npm run type-check            # Verify TypeScript

# Validation
npm run verify-specs          # Validate spec structure
npm run sync-contracts        # Check contracts vs types.ts

# Demo
npx tsx demo-race.ts          # Run interactive demo
```

---

## Related Documentation

- **SPEC.md** - Complete UI specification
- **CONTRACTS.md** - Interface documentation
- **EXAMPLES.md** - Display examples and use cases
- **LAYOUTS.md** - Detailed screen mockups
- `src/types.ts` - Source of truth for interfaces

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Layout broken | Terminal too small | Resize to 80x24 minimum |
| Colors not showing | ANSI not supported | Normal - fallback works |
| Progress bars garbled | Unicode issues | Use ASCII mode |
| Flickering display | Too fast refresh | Increase refresh interval |

---

**Last Updated:** 2025-11-16
**Next Review:** After UI enhancements in Phase 7
