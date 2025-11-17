# 3D Racing Client

**Status:** 🔴 Planning Phase
**Technology:** Three.js (MVP) → Unity (Future)
**Timeline:** 16 weeks to production-ready MVP

## What Is This?

The 3D Racing Client is the visual game interface for NASCAR RPG Racing Simulation. It removes manual sim racing controls and replaces them with skill-based strategic decisions while providing an immersive 3D racing experience.

## Vision

Watch races unfold in 3D with standard sim racing camera angles (cockpit, roof cam, chase cam, TV cam). Make strategic decisions based on race conditions, driver skills, and mental state. Skills determine available options and success probability.

## Key Features

- **3D Race Visualization** - Real physics simulation rendered in 3D
- **Skill-Based Decisions** - Choices emerge from race conditions + driver stats
- **Multiple Camera Angles** - Cockpit, roof, chase, TV broadcast views
- **Real-Time HUD** - Position, lap times, tire/fuel status, mental state
- **Decision Prompts** - Context-aware choices with timers and skill checks

## Architecture

```
3D Client (Three.js)
    ↓ WebSocket
Game Engine (Node.js) ← Already Complete
```

Client handles visuals only. Engine handles all physics, logic, progression.

## Documentation

- **[SPEC.md](SPEC.md)** - Complete vision and technical spec
- **[CONTRACTS.md](CONTRACTS.md)** - Client ↔ Engine interfaces
- **[TASKS.md](TASKS.md)** - 16-week development roadmap
- **[EXAMPLES.md](EXAMPLES.md)** - Visual mockups and user flows

## Development Phases

1. **Phase 1** (4 weeks) - Basic 3D visualization, Bristol track, chase cam
2. **Phase 2** (4 weeks) - Decisions, all cameras, enhanced HUD
3. **Phase 3** (6 weeks) - All 8 tracks, visual polish
4. **Phase 4** (4 weeks) - Menus, sound, optimization, tutorial

## Current Status

✅ Specification complete
🔴 Development not started

**Next:** Begin Phase 1 - Project setup and track geometry

## Quick Links

- Game Engine: `../` (root directory)
- Physics Spec: `../physics/`
- Decisions Spec: `../decisions/`
- Game Modes Spec: `../game-modes/`
