# User Interface Contracts

**Version:** 1.0
**Last Updated:** 2025-11-16
**Source:** `src/types.ts`

---

## Overview

This document defines all TypeScript interfaces used by the UI system. These contracts ensure consistent communication between the UI layer and the rest of the application.

**Key Principle:** UI components consume data, never modify it. All state changes happen in the engine layer.

---

## Core UI Interface

### UIRenderer

**Purpose:** Main contract that all UI implementations must follow (console, web, 3D).

**Definition:**
```typescript
export interface UIRenderer {
  /**
   * Render current race state
   */
  render(state: RaceState): void;

  /**
   * Prompt player for decision
   * Returns chosen option ID
   */
  promptDecision(decision: Decision): Promise<string>;

  /**
   * Show race results
   */
  showResults(results: RaceResults): void;

  /**
   * Show menu and get selection
   * Returns selected option ID
   */
  showMenu(options: MenuOption[]): Promise<string>;

  /**
   * Clear display
   */
  clear(): void;
}
```

**Implementations:**
- `ConsoleRenderer` - Terminal-based UI (current)
- `WebRenderer` - Browser-based UI (future)
- `ThreeDRenderer` - 3D visualization UI (future)

---

## Display Data Structures

### RaceState

**Purpose:** Complete snapshot of current race state for rendering.

**Definition:**
```typescript
export interface RaceState {
  currentLap: number;       // Current lap number
  totalLaps: number;        // Total laps in race
  positions: Position[];    // Current race order
  leaderLapTime: number;    // Leader's last lap time
  playerPosition: number;   // Player's current position
  playerDriver: Driver;     // Player driver state
  playerCar: CarState;      // Player car state
  track: Track;             // Track being raced on
  activeDecision: Decision | null; // Pending decision (if any)
  raceEvents: RaceEvent[];  // Recent race events
  caution: boolean;         // Caution flag status
  lapProgress: LapProgress[]; // Real-time lap progress for all drivers
}
```

**Usage:** Passed to `UIRenderer.render(state)` every display update cycle.

---

### Position

**Purpose:** Individual driver position and timing data.

**Definition:**
```typescript
export interface Position {
  position: number;         // Current position (1-40)
  driverId: string;         // Driver ID
  driverName: string;       // Driver name
  lapTime: number;          // Last lap time in seconds
  gapToLeader: number;      // Gap to leader in seconds
  gapToNext: number;        // Gap to car ahead in seconds
  lapsLed: number;          // Laps led this race
}
```

**Usage:** Array of positions in `RaceState.positions` for standings table.

---

### LapProgress

**Purpose:** Real-time lap completion data for live progress visualization.

**Definition:**
```typescript
export interface LapProgress {
  driverId: string;         // Driver ID
  progress: number;         // Lap completion (0.0 to 1.0)
}
```

**Usage:**
- `RaceState.lapProgress` contains all drivers' current lap progress
- UI renders progress bars showing lap completion
- Updated every simulation tick (10 FPS)

**Example Values:**
- `0.0` - Starting lap
- `0.5` - Halfway through lap
- `0.95` - Almost complete
- `1.0` - Lap complete (resets to 0.0)

---

### RaceEvent

**Purpose:** Track incidents, milestones, and noteworthy moments.

**Definition:**
```typescript
export interface RaceEvent {
  lap: number;              // Lap number when occurred
  type: string;             // Event type
  description: string;      // Human-readable description
  driversInvolved: string[]; // Driver IDs involved
  severity?: 'minor' | 'major' | 'critical';
}
```

**Event Types:**
- `pass` - Successful pass
- `incident` - Collision or spin
- `milestone` - Laps led, position gained
- `caution` - Yellow flag
- `pit` - Pit stop

**Usage:** Display recent events in race feed or scrolling ticker.

---

## Race Results Display

### RaceResults

**Purpose:** Complete race summary data for post-race display.

**Definition:**
```typescript
export interface RaceResults {
  trackId: string;          // Track identifier
  trackName: string;        // Track display name
  totalLaps: number;        // Laps in race
  finishPosition: number;   // Final position
  startPosition: number;    // Starting position
  lapsLed: number;          // Laps led
  fastestLap: number;       // Fastest lap time (seconds)
  averageLap: number;       // Average lap time (seconds)
  xpGained: XPGain[];       // XP breakdown by skill
  raceStats: {
    cleanLaps: number;      // Laps without incidents
    successfulPasses: number;
    failedPasses: number;
    decisionsCorrect: number;
    decisionsTotal: number;
  };
}
```

**Usage:** Passed to `UIRenderer.showResults(results)` after race completion.

---

### XPGain

**Purpose:** XP earned for a specific skill.

**Definition:**
```typescript
export interface XPGain {
  skill: keyof DriverSkills; // Skill category
  amount: number;            // XP earned
  reason: string;            // Why earned
}
```

**Usage:** Array in `RaceResults.xpGained` to show XP breakdown.

---

## Decision System

### Decision

**Purpose:** Strategic decision prompt with options and context.

**Definition:**
```typescript
export interface Decision {
  id: string;               // Decision ID
  type: DecisionType;       // Decision category
  description: string;      // Situation description
  options: DecisionOption[]; // Available choices
  timeLimit: number;        // Seconds to decide
  context: {
    lap: number;
    position: number;
    [key: string]: any;     // Additional context
  };
}
```

**Decision Types:**
```typescript
type DecisionType =
  | 'pit-stop'
  | 'passing-attempt'
  | 'traffic-navigation'
  | 'incident-reaction'
  | 'tire-management'
  | 'mental-state';
```

**Usage:** Passed to `UIRenderer.promptDecision(decision)` when decision needed.

---

### DecisionOption

**Purpose:** Individual choice in a decision prompt.

**Definition:**
```typescript
export interface DecisionOption {
  id: string;               // Option ID (returned when selected)
  label: string;            // Short label ("Pit now")
  description: string;      // Detailed explanation
  risk: 'low' | 'medium' | 'high';
  relevantSkills: (keyof DriverSkills)[]; // Skills that affect outcome
  estimatedImpact?: {
    position?: string;      // "Lose 2-3 positions"
    time?: string;          // "Cost 25 seconds"
    confidence?: string;    // "Slight boost"
  };
}
```

**Usage:** Array in `Decision.options` to show all choices.

---

## Menu System

### MenuOption

**Purpose:** Menu item with label and metadata.

**Definition:**
```typescript
export interface MenuOption {
  id: string;               // Option ID (returned when selected)
  label: string;            // Display text
  description?: string;     // Optional description
  disabled?: boolean;       // Whether option is available
}
```

**Usage:** Array passed to `UIRenderer.showMenu(options)`.

**Example:**
```typescript
const mainMenu: MenuOption[] = [
  { id: 'race', label: 'Quick Race', description: 'Single race' },
  { id: 'career', label: 'Career Mode', description: 'Season championship' },
  { id: 'settings', label: 'Settings' },
  { id: 'quit', label: 'Quit' }
];
```

---

## Related Data Structures (From Other Specs)

### Driver

**Spec:** `specs/character/`

**UI Usage:**
- Display skill levels
- Show mental state
- Render driver info panel

**Key Fields for UI:**
```typescript
{
  name: string;
  skills: DriverSkills;    // 10 skill categories
  mentalState: MentalState; // confidence, focus, frustration
  stats: DriverStats;       // career statistics
}
```

---

### CarState

**Spec:** `specs/physics/`

**UI Usage:**
- Display tire wear
- Show fuel level
- Render car status

**Key Fields for UI:**
```typescript
{
  tireGrip: number;         // 0-1 (100% = new)
  fuelRemaining: number;    // Gallons
  damage: number;           // 0-100
}
```

---

### Track

**Spec:** `specs/physics/`

**UI Usage:**
- Display track name
- Show track characteristics

**Key Fields for UI:**
```typescript
{
  id: string;
  name: string;
  length: number;           // Miles
  type: TrackType;          // short, intermediate, superspeedway
  bankedCorners: boolean;
}
```

---

## Contract Synchronization

**Validation:**
```bash
npm run sync-contracts  # Check CONTRACTS.md vs src/types.ts
```

**Process:**
1. When interfaces change in `src/types.ts`, update this file
2. Run `sync-contracts` to verify synchronization
3. Update UI implementations to match new contracts
4. Update tests to cover new interface fields

**Last Sync:** 2025-11-16

---

## Design Rules

### 1. Read-Only Data

UI components **must not** modify data structures. All mutations happen in engine layer.

**Good:**
```typescript
function renderPosition(pos: Position): string {
  return `P${pos.position} - ${pos.driverName}`;
}
```

**Bad:**
```typescript
function renderPosition(pos: Position): string {
  pos.position++; // ❌ NEVER modify input data
  return `P${pos.position} - ${pos.driverName}`;
}
```

---

### 2. Pure Rendering Functions

All formatters should be pure functions (same input → same output).

**Good:**
```typescript
function formatLapTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return minutes > 0 ? `${minutes}:${secs}` : `${secs}s`;
}
```

**Bad:**
```typescript
let lastLapTime = 0; // ❌ Global state
function formatLapTime(seconds: number): string {
  const delta = seconds - lastLapTime;
  lastLapTime = seconds; // ❌ Side effects
  return `${seconds}s (${delta > 0 ? '+' : ''}${delta})`;
}
```

---

### 3. Optional Fields Handling

Always check for optional/nullable fields:

**Good:**
```typescript
function renderDecision(state: RaceState): string {
  if (state.activeDecision === null) {
    return ''; // No decision to render
  }
  return formatDecisionPrompt(state.activeDecision);
}
```

**Bad:**
```typescript
function renderDecision(state: RaceState): string {
  return formatDecisionPrompt(state.activeDecision); // ❌ Might be null
}
```

---

## Testing Contracts

### Type Safety

All UI code must pass TypeScript type checking:

```bash
npm run type-check
```

### Interface Compliance

```typescript
// Verify ConsoleRenderer implements UIRenderer
const renderer: UIRenderer = new ConsoleRenderer();
// TypeScript ensures all methods exist
```

### Mock Data

Use type-safe mock data in tests:

```typescript
const mockState: RaceState = {
  currentLap: 45,
  totalLaps: 500,
  positions: [/* ... */],
  // All required fields must be present
};
```

---

**Related Documents:**
- `SPEC.md` - UI system overview
- `EXAMPLES.md` - Display layout examples
- `LAYOUTS.md` - Screen mockups
- `src/types.ts` - Source of truth for interfaces
