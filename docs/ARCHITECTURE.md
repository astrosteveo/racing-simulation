# Technical Architecture - NASCAR RPG Racing Simulation

## Overview

This document defines the technical architecture, system boundaries, data flow, and contracts that enable the game to evolve without requiring rewrites.

## Architectural Principles

### 1. Separation of Concerns

The codebase is organized into **independent layers** that can change without affecting each other:

```
┌─────────────────────────────────────────┐
│              UI Layer                   │
│  (Console, Web, 3D Client - Swappable)  │
└────────────────┬────────────────────────┘
                 │ Consumes RaceState
                 │ Emits Decisions
┌────────────────▼────────────────────────┐
│          Orchestration Layer            │
│     (Race Loop, Event System)           │
└─────┬──────────────────────────┬────────┘
      │                          │
      │ Uses Contracts           │ Uses Contracts
      │                          │
┌─────▼──────────┐      ┌────────▼─────────┐
│  Engine Layer  │      │  Character Layer │
│   (Physics,    │      │  (Stats, Mental  │
│   Simulation)  │      │   State, XP)     │
└────────┬───────┘      └──────────────────┘
         │
         │ Reads Specs
         │
┌────────▼──────────────────────────────────┐
│            Data Layer                     │
│  (JSON: Tracks, Cars, AI Drivers)         │
└───────────────────────────────────────────┘
```

### 2. Dependency Rules

**Allowed dependencies (top to bottom):**
- UI → Orchestration → Engine/Character → Data
- Higher layers can depend on lower layers
- Lower layers NEVER depend on higher layers

**Forbidden dependencies:**
- Engine → UI ❌
- Data → Character ❌
- Physics → Orchestration ❌

**Communication:** Lower layers expose interfaces. Higher layers consume them.

### 3. Contract-First Design

All system boundaries are defined by TypeScript interfaces in `src/types.ts`.

**Benefits:**
- Implementation can change without breaking dependents
- Multiple implementations of same interface (mock vs real)
- Clear documentation of system expectations
- Type safety prevents integration errors

## System Layers

### Data Layer (`src/data/`)

**Purpose:** Provides game content (tracks, cars, AI drivers)

**Structure:**
```
src/data/
├── tracks/
│   ├── bristol.json
│   ├── charlotte.json
│   └── daytona.json
├── cars/
│   └── nascar-cup-spec.json
├── ai-drivers/
│   └── field.json
└── loader.ts  # Loads and validates JSON against interfaces
```

**Interfaces:**
```typescript
interface Track { ... }
interface Car { ... }
interface AIDriver { ... }
```

**Rules:**
- Data files are pure JSON
- `loader.ts` validates against TypeScript interfaces
- Invalid data throws errors at load time, not runtime
- Data can be swapped without code changes

**Extension point:** Add new tracks by creating JSON files conforming to `Track` interface

### Engine Layer (`src/engine/`)

**Purpose:** Core racing physics simulation

**Structure:**
```
src/engine/
├── physics/
│   ├── aerodynamics.ts    # Draft calculations, air resistance
│   ├── tires.ts           # Wear, grip calculations
│   ├── fuel.ts            # Consumption, weight effects
│   ├── speed.ts           # Top speed, acceleration, braking
│   └── laptime.ts         # Section-by-section lap calculation
├── simulation/
│   ├── race.ts            # Main race simulation loop
│   ├── ai.ts              # AI driver behavior
│   └── passing.ts         # Overtake mechanics
└── index.ts               # Public API exports
```

**Key Interfaces:**
```typescript
interface PhysicsEngine {
  calculateLapTime(driver: Driver, track: Track, car: Car): number;
  calculateTireWear(laps: number, aggression: number): number;
  calculateFuelConsumption(laps: number, draft: boolean): number;
  calculateDraftEffect(distance: number): number;
  calculatePassProbability(attacker: Driver, defender: Driver): number;
}

interface RaceSimulation {
  initialize(track: Track, drivers: Driver[]): void;
  simulateLap(): RaceState;
  getCurrentState(): RaceState;
  applyDecision(decision: Decision): void;
}
```

**Pure Functions:**
All physics calculations are pure functions (no side effects):
```typescript
// Input → Calculation → Output (no state mutation)
function calculateCornerSpeed(
  banking: number,
  radius: number,
  tireGrip: number,
  driverSkill: number
): number {
  // Pure calculation
}
```

**Benefits:**
- Easy to test
- Predictable behavior
- No hidden dependencies
- Can run in parallel

**Rules:**
- Physics functions are pure (no side effects)
- No UI dependencies
- No direct data access (receive data via parameters)
- Return calculated values, don't mutate state

### Character Layer (`src/character/`)

**Purpose:** Driver stats, skills, mental state, progression

**Structure:**
```
src/character/
├── driver.ts          # Driver class, skill management
├── mental-state.ts    # Confidence, frustration, focus, distraction
├── progression.ts     # XP calculation, skill leveling
└── index.ts          # Public API exports
```

**Key Interfaces:**
```typescript
interface Driver {
  id: string;
  name: string;
  skills: DriverSkills;
  mentalState: MentalState;
  stats: CareerStats;
  applyXP(xp: XPGain): void;
  updateMentalState(event: RaceEvent): void;
}

interface MentalState {
  confidence: number;     // 0-100
  frustration: number;    // 0-100
  focus: number;          // 0-100
  distraction: number;    // 0-100
  getPerformanceModifier(): number;
}

interface DriverSkills {
  racecraft: number;      // 0-100
  consistency: number;
  aggression: number;
  focus: number;
  stamina: number;
  composure: number;
  draftSense: number;
  tireManagement: number;
  fuelManagement: number;
  pitStrategy: number;
}
```

**Rules:**
- Character state is mutable (skills improve, mental state changes)
- Exposes methods for state updates
- No direct UI dependencies
- Emits events for significant changes (level up, mental state shift)

### Events Layer (`src/events/`)

**Purpose:** Timed decision system and race events

**Structure:**
```
src/events/
├── decision-manager.ts    # Handles decision prompts and responses
├── event-generator.ts     # Creates race events (incidents, opportunities)
├── decision-types.ts      # Specific decision implementations
└── index.ts              # Public API exports
```

**Key Interfaces:**
```typescript
interface Decision {
  id: string;
  type: DecisionType;
  prompt: string;
  options: DecisionOption[];
  timeLimit: number;        // Seconds
  defaultOption: string;    // Option ID if timeout
  context: RaceContext;     // Current race state
}

interface DecisionOption {
  id: string;
  label: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  skillRequirements?: Partial<DriverSkills>;
}

interface DecisionResult {
  optionChosen: string;
  outcome: 'success' | 'neutral' | 'failure';
  effects: {
    positionChange?: number;
    mentalStateChange?: Partial<MentalState>;
    tireWearChange?: number;
    fuelChange?: number;
  };
  xpGained: XPGain;
}

interface DecisionManager {
  shouldTriggerDecision(state: RaceState): Decision | null;
  evaluateDecision(decision: Decision, choice: string, driver: Driver): DecisionResult;
}
```

**Rules:**
- Decisions are stateless (generated from current race state)
- Decision evaluation is deterministic given inputs
- Mental state and skills affect decision outcomes
- Timeout always returns default option

### Orchestration Layer (`src/`)

**Purpose:** Coordinates all systems, runs the race loop

**Structure:**
```
src/
├── race-manager.ts       # Main race loop orchestration
├── game-state.ts         # Overall game state management
└── types.ts              # All TypeScript interfaces
```

**Key Interfaces:**
```typescript
interface RaceManager {
  initialize(config: RaceConfig): void;
  start(): void;
  pause(): void;
  resume(): void;
  simulateLap(): void;
  handleDecision(decision: Decision, choice: string): void;
  getCurrentState(): RaceState;
}

interface RaceState {
  currentLap: number;
  totalLaps: number;
  positions: Position[];
  leaderLapTime: number;
  playerPosition: number;
  playerDriver: Driver;
  playerCar: CarState;
  track: Track;
  activelDecision: Decision | null;
  raceEvents: RaceEvent[];
}

interface Position {
  position: number;
  driverId: string;
  driverName: string;
  lapTime: number;
  gapToLeader: number;
  gapToNext: number;
  lapsLed: number;
}

interface CarState {
  tireWear: number;       // 0-100%
  fuelLevel: number;      // 0-100%
  damage: number;         // 0-100%
  inPit: boolean;
}
```

**Race Loop (Pseudocode):**
```typescript
while (currentLap <= totalLaps) {
  // 1. Check for decision opportunities
  const decision = decisionManager.shouldTriggerDecision(raceState);
  if (decision) {
    await promptPlayerDecision(decision);
  }

  // 2. Simulate lap for all drivers
  for (const driver of drivers) {
    const lapTime = physicsEngine.calculateLapTime(driver, track, carStates[driver.id]);
    driver.updateMentalState(lapResults);
  }

  // 3. Update positions
  sortDriversByLapTime();
  updateGaps();

  // 4. Update car states
  updateTireWear();
  updateFuelLevels();

  // 5. Generate events
  generateRaceEvents();

  // 6. Emit state update
  emitRaceState();

  currentLap++;
}

// Race complete
calculateResults();
awardXP();
```

**Rules:**
- Orchestrates calls to lower layers
- Does not implement physics or game logic (delegates)
- Manages race state and timing
- Emits state updates for UI

### UI Layer (`src/ui/`)

**Purpose:** Presents race state and captures user input

**Structure:**
```
src/ui/
├── console/
│   ├── race-display.ts      # Renders race state to console
│   ├── decision-prompt.ts   # Prompts player for decisions
│   ├── menus.ts             # Main menu, options
│   └── post-race.ts         # Results screen
└── index.ts                 # UI entry point
```

**Key Interfaces:**
```typescript
interface UIRenderer {
  render(state: RaceState): void;
  promptDecision(decision: Decision): Promise<string>;
  showResults(results: RaceResults): void;
  showMenu(options: MenuOption[]): Promise<string>;
}
```

**Rules:**
- UI only reads state (via RaceState interface)
- UI never directly modifies game state
- All user inputs go through RaceManager
- UI can be completely replaced without touching engine

**Console UI Example:**
```typescript
class ConsoleRenderer implements UIRenderer {
  render(state: RaceState): void {
    console.clear();
    this.renderHeader(state);
    this.renderPositions(state);
    this.renderDriverState(state.playerDriver);
    this.renderCarState(state.playerCar);
    if (state.activeDecision) {
      this.renderDecision(state.activeDecision);
    }
  }

  async promptDecision(decision: Decision): Promise<string> {
    // Display options, start timer, capture input
  }
}
```

## Data Flow

### Race Simulation Flow

```
1. User starts race
   ↓
2. RaceManager.initialize(config)
   ├─→ Load track data
   ├─→ Load AI drivers
   ├─→ Initialize player driver
   └─→ Set up car states

3. RaceManager.start()
   ↓
4. Race Loop:
   ┌─────────────────────────────────┐
   │ Check for decision opportunity  │
   │  ↓                              │
   │ Prompt player (if needed)       │
   │  ↓                              │
   │ Simulate lap (all drivers)      │
   │  ├─→ Calculate lap times        │
   │  ├─→ Update positions           │
   │  ├─→ Update car states          │
   │  └─→ Update mental states       │
   │  ↓                              │
   │ Generate race events            │
   │  ↓                              │
   │ Emit RaceState                  │
   │  ↓                              │
   │ UI renders state                │
   │  ↓                              │
   │ Next lap                        │
   └─────────────────────────────────┘
   ↓
5. Race complete
   ↓
6. Calculate results, award XP
   ↓
7. UI shows post-race summary
```

### Decision Flow

```
1. Race event triggers decision
   ↓
2. DecisionManager.shouldTriggerDecision(raceState)
   ↓
3. Returns Decision object
   ↓
4. RaceManager passes to UI
   ↓
5. UI prompts player (with timer)
   ↓
6. Player selects option (or timeout → default)
   ↓
7. RaceManager.handleDecision(decision, choice)
   ↓
8. DecisionManager.evaluateDecision(decision, choice, driver)
   ├─→ Check skill requirements
   ├─→ Calculate outcome probability
   ├─→ Apply effects to race state
   └─→ Return DecisionResult
   ↓
9. Update driver mental state
   ↓
10. Award XP
   ↓
11. Continue race loop
```

### XP and Progression Flow

```
1. Race/decision completed
   ↓
2. Calculate XP based on:
   ├─→ Race finish position
   ├─→ Positions gained
   ├─→ Clean laps
   ├─→ Successful passes
   └─→ Good decisions
   ↓
3. Driver.applyXP(xpGain)
   ↓
4. Progression system checks for level ups
   ├─→ If skill threshold reached → level up
   └─→ Emit level up event
   ↓
5. Save updated driver stats
   ↓
6. UI shows progression summary
```

## Interface Contracts

All interfaces are defined in `src/types.ts`. See that file for the complete contract definitions.

**Key contracts:**
- `Driver` - Character stats and state
- `Track` - Track specifications
- `Car` / `CarState` - Vehicle properties and condition
- `RaceState` - Current race status
- `Decision` / `DecisionResult` - Decision system
- `MentalState` - Psychological state
- `PhysicsEngine` - Physics calculations API
- `RaceSimulation` - Simulation API
- `UIRenderer` - UI rendering API

## Extension Points

The architecture supports these extensions without major refactoring:

### Adding New Tracks
1. Create JSON file in `src/data/tracks/`
2. Conform to `Track` interface
3. Loader validates and loads automatically

### Adding New Decision Types
1. Add decision type to `DecisionType` enum
2. Implement decision generator in `decision-types.ts`
3. Implement outcome evaluator
4. No changes to other systems needed

### Swapping UI
1. Implement `UIRenderer` interface
2. Inject new renderer into RaceManager
3. Engine code unchanged

### Adding Physics Features
1. Add pure function to appropriate physics module
2. Update `PhysicsEngine` interface if needed
3. Call from race simulation loop
4. UI automatically displays updated state

### Adding New Skills
1. Add skill to `DriverSkills` interface
2. Add XP tracking to progression system
3. Add skill effects to relevant physics calculations
4. UI displays new skill automatically

## Testing Strategy

### Unit Tests

**Pure Functions (Physics):**
```typescript
describe('calculateCornerSpeed', () => {
  it('should increase speed with higher banking', () => {
    const lowBanking = calculateCornerSpeed(10, 500, 1.0, 70);
    const highBanking = calculateCornerSpeed(30, 500, 1.0, 70);
    expect(highBanking).toBeGreaterThan(lowBanking);
  });
});
```

**Character System:**
```typescript
describe('Driver.applyXP', () => {
  it('should level up skill when threshold reached', () => {
    const driver = new Driver(baseStats);
    driver.applyXP({ racecraft: 100 });
    expect(driver.skills.racecraft).toBeGreaterThan(baseStats.racecraft);
  });
});
```

### Integration Tests

**Race Simulation:**
```typescript
describe('RaceSimulation', () => {
  it('should complete a full race and produce valid results', () => {
    const sim = new RaceSimulation(track, drivers);
    sim.initialize();
    while (!sim.isComplete()) {
      sim.simulateLap();
    }
    const results = sim.getResults();
    expect(results.positions).toHaveLength(drivers.length);
    expect(results.winner).toBeDefined();
  });
});
```

### End-to-End Tests

**Full Race Scenario:**
```typescript
describe('Race scenario: Bristol 500 laps', () => {
  it('should simulate complete race with realistic outcomes', async () => {
    const config = loadRaceConfig('bristol-500');
    const manager = new RaceManager(config);
    const results = await manager.runRace({ headless: true });

    expect(results.lapsCompleted).toBe(500);
    expect(results.playerPosition).toBeGreaterThan(0);
    expect(results.playerPosition).toBeLessThanOrEqual(40);
    // Lap times should be within realistic range
    expect(results.fastestLap).toBeGreaterThan(15.0);
    expect(results.fastestLap).toBeLessThan(16.5);
  });
});
```

## File Organization

```
racing-simulation/
├── .claude/
│   └── CLAUDE.md              # This project's development guide
├── docs/
│   ├── SPEC.md               # Game design specification
│   ├── ARCHITECTURE.md       # This file
│   └── EXAMPLES.md           # Test scenarios and examples
├── src/
│   ├── types.ts              # All TypeScript interfaces (contracts)
│   ├── engine/
│   │   ├── physics/
│   │   │   ├── aerodynamics.ts
│   │   │   ├── tires.ts
│   │   │   ├── fuel.ts
│   │   │   ├── speed.ts
│   │   │   └── laptime.ts
│   │   ├── simulation/
│   │   │   ├── race.ts
│   │   │   ├── ai.ts
│   │   │   └── passing.ts
│   │   └── index.ts
│   ├── character/
│   │   ├── driver.ts
│   │   ├── mental-state.ts
│   │   ├── progression.ts
│   │   └── index.ts
│   ├── events/
│   │   ├── decision-manager.ts
│   │   ├── event-generator.ts
│   │   ├── decision-types.ts
│   │   └── index.ts
│   ├── data/
│   │   ├── tracks/
│   │   ├── cars/
│   │   ├── ai-drivers/
│   │   └── loader.ts
│   ├── ui/
│   │   └── console/
│   │       ├── race-display.ts
│   │       ├── decision-prompt.ts
│   │       ├── menus.ts
│   │       └── post-race.ts
│   ├── race-manager.ts
│   ├── game-state.ts
│   └── index.ts              # Main entry point
├── tests/
│   ├── unit/
│   │   ├── physics/
│   │   ├── character/
│   │   └── events/
│   ├── integration/
│   │   └── race-simulation/
│   └── e2e/
│       └── scenarios/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Build and Run

### Development
```bash
npm run dev    # Run with tsx (no build step)
npm test       # Run Vitest tests
npm run lint   # Run ESLint
```

### Production
```bash
npm run build  # Compile TypeScript to JavaScript
npm start      # Run compiled version
```

## State Management

### Mutable vs Immutable State

**Immutable (Pure Functions):**
- Physics calculations
- Decision evaluation
- XP calculation

**Mutable (State Objects):**
- Driver stats and mental state
- Race state (positions, lap count)
- Car state (tire wear, fuel)

**Pattern:**
```typescript
// Pure function returns new value
const newSpeed = calculateSpeed(params);

// State object mutates internally
driver.updateMentalState(event);  // Mutates driver.mentalState

// Orchestration updates state
raceState.currentLap++;
raceState.positions = calculatePositions(drivers);
```

## Error Handling

### Data Validation
- All JSON data validated against interfaces at load time
- Invalid data throws errors before game starts
- Prevents runtime surprises

### Runtime Errors
- Physics calculations return safe defaults on invalid input
- Decision system handles timeout gracefully
- Race simulation handles edge cases (ties, crashes)

### Error Propagation
```typescript
try {
  const track = loadTrack('bristol');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid track data:', error.message);
  } else {
    throw error;  // Unexpected error, bubble up
  }
}
```

## Performance Considerations

### Optimization Priorities

1. **Race simulation loop** - Will run 500+ times per race
2. **Lap time calculation** - Called per driver per lap
3. **Mental state updates** - Frequent updates
4. **UI rendering** - Keep frame rate acceptable

### Strategies

**Caching:**
- Cache track section calculations
- Pre-calculate AI driver tendencies
- Memoize expensive physics formulas

**Batch Processing:**
- Update all drivers per lap (not one at a time)
- Batch UI updates (not per driver)

**Lazy Evaluation:**
- Don't calculate detailed stats until needed
- Generate decisions only when triggered
- Render only visible UI elements

**Simulation Speed:**
- Support headless mode (no UI) for fastest simulation
- Adjustable time scale (1x, 10x, 100x)

## Deployment Target

**Initial:** Node.js console application
**Future:**
- Web app (TypeScript → browser)
- Electron app (desktop with UI)
- Game client (engine as library)

The architecture supports all these targets without code rewrites.

---

This architecture ensures the project can grow and evolve without the dreaded restart. Stick to the layer boundaries, honor the contracts, and the codebase will remain flexible and maintainable.
