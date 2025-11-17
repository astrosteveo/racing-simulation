# NASCAR RPG Racing Simulation - 3D Client

**Status:** Phase 1.1 Complete ✅
**Technology:** Three.js + TypeScript + Vite
**Test Coverage:** 7/7 tests passing (100%)

## What Is This?

The 3D Racing Client is the visual interface for the NASCAR RPG Racing Simulation. It provides an immersive 3D racing experience where players make strategic skill-based decisions rather than manual steering/throttle inputs.

## Current Features (Phase 1.1)

✅ **Project Infrastructure**
- Three.js + TypeScript + Vite build pipeline
- Vitest test framework
- Basic 3D scene with lighting
- Responsive HTML5 canvas

✅ **Engine Bridge**
- WebSocket connection to game engine (ws://localhost:8080)
- Real-time race state updates
- Decision prompt handling
- Automatic reconnection logic
- Full test coverage (7/7 tests)

✅ **Basic HUD**
- Race position (P8 / 40)
- Lap counter
- Tire wear percentage
- Fuel level percentage
- Gap to leader (placeholder)

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The client will start at `http://localhost:3000`

### Scripts

```bash
npm run dev            # Start Vite dev server (http://localhost:3000)
npm run build          # Build for production
npm run preview        # Preview production build
npm run test           # Run tests once
npm run test:watch     # Run tests in watch mode
npm run type-check     # Verify TypeScript compilation
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode (auto-rerun on changes)
npm run test:watch
```

**Current Test Status:** 7/7 passing (100%)

## Connecting to Game Engine

The client expects a WebSocket server at `ws://localhost:8080`.

**Note:** The game engine server is not yet implemented. The client will fail to connect gracefully and run in standalone mode with the test scene.

## Project Structure

```
client/
├── src/
│   ├── main.ts                 # Entry point
│   ├── engine-bridge.ts        # WebSocket connection to engine
│   ├── engine-bridge.test.ts   # Engine bridge tests
│   ├── track/                  # Track geometry (Phase 1.2)
│   ├── cars/                   # Car models (Phase 1.3)
│   ├── camera/                 # Camera system (Phase 1.4)
│   ├── hud/                    # HUD widgets (Phase 1.5)
│   ├── ui/                     # Decision prompts, menus
│   ├── effects/                # Visual effects
│   └── position/               # Position calculation
├── index.html                  # HTML shell
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md (this file)
```

## Roadmap

### ✅ Phase 1.1: Project Setup & Architecture (COMPLETE)
- Three.js + TypeScript + Vite
- WebSocket bridge to game engine
- Basic HTML shell & HUD
- Test framework

### 🔄 Phase 1.2: Track Geometry System (NEXT)
- Bristol track 3D model
- Track surface rendering
- Banking visualization

### 🔜 Phase 1.3: Car Rendering & Position Sync
- 40 car models
- Real-time position synchronization
- Smooth interpolation

### 🔜 Phase 1.4: Basic Camera System
- Chase camera
- Camera controls

### 🔜 Phase 1.5: Minimal HUD
- Enhanced HUD widgets
- Real-time data binding

**Phase 1 Milestone:** Watch a simulated race in 3D

See `.claude/specs/client/TASKS.md` for complete 16-week roadmap.

## Technical Details

### Coordinate System

- **Origin:** Center of track at ground level
- **Units:** Feet (matching NASCAR specifications)
- **Axes:**
  - +X: East
  - +Y: Up (altitude)
  - +Z: North

### Message Contracts

See `.claude/specs/client/CONTRACTS.md` for complete interface definitions:

- **Engine → Client:**
  - `RaceStateUpdate` (10Hz) - Real-time race state
  - `DecisionPrompt` - Strategic choice required
  - `RaceEvent` - Race notifications

- **Client → Engine:**
  - `PlayerDecision` - Decision response
  - `CameraRequest` - Change camera view
  - `ConfigUpdate` - Settings changes

## Contributing

Follow TDD workflow:
1. Write test first
2. Run test (should fail)
3. Implement feature
4. Run test (should pass)
5. Commit

See `.claude/CLAUDE.md` for development principles and workflow.

---

**Last Updated:** 2025-11-16
**Next Milestone:** Phase 1.2 - Track Geometry System
