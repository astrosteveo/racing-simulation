# Client Contracts

**Sync Status:** ✅ Defined (Phase 1 - Planning)
**Last Checked:** 2025-11-16
**Source of Truth:** This document defines NEW interfaces for 3D client integration

---

## Overview

This document defines the TypeScript interfaces and contracts that govern communication between the 3D Racing Client and the existing Game Engine. These contracts ensure clean separation between visual representation (client) and game logic (engine).

---

## Communication Architecture

```
┌──────────────────┐          ┌──────────────────┐
│   3D Client      │◄────────►│   Game Engine    │
│  (Visual Layer)  │ WebSocket│  (Logic Layer)   │
└──────────────────┘   /IPC   └──────────────────┘

Client → Engine: PlayerDecision, CameraRequest, ConfigUpdate
Engine → Client: RaceStateUpdate, DecisionPrompt, RaceEvent
```

---

## Engine → Client Messages

### RaceStateUpdate

**Purpose:** Real-time race state broadcast for visual synchronization

**Frequency:** Every 100ms (10Hz) during active race

```typescript
interface RaceStateUpdate {
  // Timing
  tick: number;                    // Current simulation tick
  raceTime: number;                // Elapsed race time (seconds)
  currentLap: number;              // Current lap for race leader

  // Player Car State
  playerCar: {
    position: number;              // Race position (1-40)
    lapProgress: number;           // Progress around current lap (0.0-1.0)
    speed: number;                 // Current speed (MPH)
    coordinates: Vector3;          // 3D world position
    rotation: Quaternion;          // Car orientation

    // Car Systems
    tireWear: number;              // Tire condition (0-100%)
    fuelLevel: number;             // Fuel remaining (0-100%)
    tireGrip: number;              // Current grip level (0-100%)

    // Mental/Physical State
    mentalState: MentalState;      // Confidence, frustration, focus, distraction
    stamina: number;               // Driver stamina (0-100%)
  };

  // All Cars on Track
  cars: CarVisualState[];          // All 40 cars (includes player)

  // Race Info
  leaderboard: LeaderboardEntry[]; // Top 10 + cars within 5 positions of player

  // Track Conditions
  trackState: {
    temperature: number;           // Track temp (°F)
    grip: number;                  // Overall track grip (0.8-1.0)
  };
}
```

### CarVisualState

**Purpose:** Minimal data needed to render each car

```typescript
interface CarVisualState {
  id: string;                      // Car identifier
  driverName: string;              // Driver name
  number: string;                  // Car number

  // Position & Movement
  position: Vector3;               // 3D coordinates on track
  rotation: Quaternion;            // Car orientation
  speed: number;                   // Current speed (MPH)

  // Visual Feedback
  tireWear: number;                // For smoke effects (0-100%)
  inPit: boolean;                  // Currently in pit lane

  // Race Status
  racePosition: number;            // Current position (1-40)
  lapsCompleted: number;           // Laps completed
  gapToLeader: number;             // Seconds behind leader
}
```

### Vector3 & Quaternion

**Purpose:** Standard 3D math types

```typescript
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}
```

### LeaderboardEntry

**Purpose:** Race standings for HUD display

```typescript
interface LeaderboardEntry {
  position: number;                // 1-40
  driverName: string;
  number: string;
  gap: string;                     // "LEADER" or "+2.5s" or "+1 LAP"
  lapsBehind: number;              // 0 for same lap
  lastLapTime: number;             // Seconds
  isPlayer: boolean;               // Highlight player
}
```

---

### DecisionPrompt

**Purpose:** Present strategic choice to player

**Frequency:** Event-driven (when race conditions trigger decision)

```typescript
interface DecisionPrompt {
  id: string;                      // Unique prompt ID
  type: DecisionType;              // Category of decision

  // Context
  situation: string;               // "You've got a run on the #42!"
  description: string;             // Detailed explanation
  conditions: string[];            // ["Within 0.3s", "Good exit Turn 2"]
  urgency: 'low' | 'medium' | 'high'; // Visual urgency indicator

  // Options
  options: DecisionOption[];       // 2-4 choices

  // Timing
  timeLimit: number;               // Seconds to decide (5-20s)
  defaultOption: string;           // Auto-select if timeout

  // Skill Context
  skillCheck: {
    required: SkillRequirement[];  // Skills needed for any option
    recommended: SkillRequirement[]; // Skills that help
  };

  // Visual Context
  visualHints: {
    highlightCar?: string;         // Car ID to highlight
    cameraAngle?: 'cockpit' | 'chase' | 'tv'; // Suggested view
    trackLocation?: number;        // Where on track (lap progress)
  };
}

type DecisionType =
  | 'passing'            // Overtaking opportunity
  | 'pit-strategy'       // Pit stop timing/type
  | 'mental-state'       // Emotional management
  | 'tire-management'    // Tire preservation
  | 'traffic'            // Navigating lapped cars
  | 'incident';          // Crash avoidance/response

interface DecisionOption {
  id: string;
  label: string;                   // "Go for the inside"
  description: string;             // Detailed explanation

  // Requirements
  skillRequirement?: SkillRequirement;

  // Outcome Hints
  riskLevel: 'low' | 'medium' | 'high';
  rewardPotential: 'low' | 'medium' | 'high';
  successProbability?: number;     // 0-100, shown if skill is high enough

  // Effects Preview
  effects: {
    position?: string;             // "Likely +2 positions"
    tires?: string;                // "Heavy wear"
    mental?: string;               // "+Confidence, -Frustration"
    fuel?: string;                 // "No impact"
  };
}

interface SkillRequirement {
  skill: keyof DriverSkills;       // 'racecraft', 'aggression', etc.
  minimum: number;                 // Required level
  recommended?: number;            // For better success rate
}
```

---

### RaceEvent

**Purpose:** Notify client of significant race events

**Frequency:** Event-driven (when events occur)

```typescript
interface RaceEvent {
  type: RaceEventType;
  timestamp: number;               // Race time when occurred
  message: string;                 // Display message

  // Event-specific data
  data?: {
    carId?: string;                // Involved car
    position?: number;             // Position change
    xpGained?: number;             // XP reward
    milestone?: string;            // Achievement unlocked
  };
}

type RaceEventType =
  | 'race-start'                   // Green flag
  | 'lap-complete'                 // Player completed lap
  | 'position-change'              // Player gained/lost position
  | 'pit-in'                       // Player entered pit
  | 'pit-out'                      // Player exited pit
  | 'caution'                      // Yellow flag (future)
  | 'incident'                     // Crash/contact (future)
  | 'milestone'                    // Achievement
  | 'race-end';                    // Checkered flag
```

---

## Client → Engine Messages

### PlayerDecision

**Purpose:** Player's choice in response to DecisionPrompt

```typescript
interface PlayerDecision {
  promptId: string;                // Which prompt this responds to
  optionId: string;                // Which option chosen
  timestamp: number;               // When decision made (for logging)
}
```

---

### CameraRequest

**Purpose:** Request camera angle change

```typescript
interface CameraRequest {
  view: 'cockpit' | 'roof' | 'chase' | 'tv';
  targetCarId?: string;            // For spectating (future)
}
```

---

### ConfigUpdate

**Purpose:** Update client configuration

```typescript
interface ConfigUpdate {
  type: 'graphics' | 'controls' | 'audio';
  settings: {
    [key: string]: any;            // Flexible config structure
  };
}
```

---

## Track Data Contracts

### TrackGeometry

**Purpose:** Provide track layout data for 3D rendering

**Source:** Extended from existing `Track` interface

```typescript
interface TrackGeometry extends Track {
  // Existing Track fields (from types.ts)
  id: string;
  name: string;
  length: number;
  type: TrackType;
  banking: { turns: number; straights: number };
  sections: TrackSection[];

  // NEW: 3D Rendering Data
  geometry: {
    centerline: Vector3[];         // Track centerline points
    width: number;                 // Track width (feet)
    pitLane: {
      entry: Vector3;
      exit: Vector3;
      centerline: Vector3[];
    };

    // Visual References
    startFinish: Vector3;          // Start/finish line position
    pitWall: Vector3[];            // Pit wall edge points
    outerWall: Vector3[];          // Outer track wall points
  };

  // Camera Positions
  cameras: {
    tv: CameraPosition[];          // TV camera locations
    helicopter?: Vector3;          // Aerial view position
  };
}

interface CameraPosition {
  position: Vector3;
  lookAt: Vector3;
  fieldOfView: number;
}
```

---

## Session Management Contracts

### SessionConfig

**Purpose:** Initialize a race session

```typescript
interface SessionConfig {
  mode: 'single-race' | 'career';

  // Track & Race
  trackId: string;
  laps: number;

  // Drivers
  playerDriver: Driver;
  aiDrivers: Driver[];

  // Client Preferences
  startingCamera: 'cockpit' | 'roof' | 'chase' | 'tv';
  graphics: GraphicsSettings;
}

interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  targetFPS: 30 | 60 | 120;
  resolution: { width: number; height: number };
  effects: {
    tireSmoke: boolean;
    motionBlur: boolean;
    shadows: boolean;
  };
}
```

---

### SessionState

**Purpose:** Current session status

```typescript
interface SessionState {
  status: 'loading' | 'ready' | 'racing' | 'paused' | 'finished';
  timeElapsed: number;
  lapsCompleted: number;
  totalLaps: number;
}
```

---

## Coordinate System Specification

### World Space

**Origin:** Center of track at ground level
**Units:** Feet (matching NASCAR specifications)
**Axes:**
- +X: East
- +Y: Up (altitude)
- +Z: North

### Track Progress to World Position

**Formula:** Convert lap progress (0.0-1.0) to 3D coordinates

```typescript
interface TrackPositionCalculator {
  /**
   * Convert lap progress to world coordinates
   *
   * @param lapProgress - Progress around track (0.0 = start/finish, 1.0 = complete lap)
   * @param laneOffset - Offset from centerline (-width/2 to +width/2, feet)
   * @returns 3D world position
   */
  progressToPosition(
    lapProgress: number,
    laneOffset: number
  ): Vector3;

  /**
   * Calculate car rotation based on track geometry
   *
   * @param lapProgress - Progress around track
   * @returns Quaternion representing car orientation
   */
  progressToRotation(lapProgress: number): Quaternion;
}
```

---

## Error Handling

### ClientError

**Purpose:** Report client-side errors to engine for logging

```typescript
interface ClientError {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  context?: {
    [key: string]: any;
  };
}
```

---

## Contract Validation

### Runtime Type Checking

All messages exchanged between client and engine MUST be validated:

1. **Engine → Client:** Validate before broadcasting
2. **Client → Engine:** Validate on receipt
3. **Validation Failures:** Log error, use fallback/default value

### Contract Tests

Each interface MUST have associated tests:

```typescript
// Example validation test
describe('RaceStateUpdate Contract', () => {
  it('validates complete race state structure', () => {
    const update: RaceStateUpdate = {
      tick: 1000,
      raceTime: 100.5,
      currentLap: 5,
      playerCar: { /* ... */ },
      cars: [ /* ... */ ],
      leaderboard: [ /* ... */ ],
      trackState: { /* ... */ }
    };

    expect(validateRaceStateUpdate(update)).toBe(true);
  });
});
```

---

## Future Contract Extensions

### Multiplayer Support (Future)

```typescript
interface MultiplayerState {
  players: {
    id: string;
    driverName: string;
    carId: string;
    isReady: boolean;
  }[];

  sessionHost: string;
  syncState: 'synced' | 'desynced' | 'catching-up';
}
```

### Weather System (Future)

```typescript
interface WeatherState {
  condition: 'clear' | 'cloudy' | 'rain' | 'heavy-rain';
  trackWetness: number;            // 0.0-1.0
  visibility: number;              // 0.0-1.0
  temperature: number;             // °F
}
```

---

## Related Specifications

- **Physics Spec** (`specs/physics/CONTRACTS.md`) - Core game data structures
- **Character Spec** (`specs/character/CONTRACTS.md`) - Driver and skill types
- **Decisions Spec** (`specs/decisions/CONTRACTS.md`) - Decision system types
- **UI Spec** (`specs/ui/CONTRACTS.md`) - Console UI contracts (patterns to reuse)

---

**Last Updated:** 2025-11-16
**Next Review:** After Phase 1 implementation begins
