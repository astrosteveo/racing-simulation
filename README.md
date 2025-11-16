# NASCAR RPG Racing Simulation

An RPG-style NASCAR racing simulation where skill progression and mental state affect race performance. Unlike traditional racing games that require expensive peripherals and manual dexterity, this game focuses on strategic decision-making and character development.

## Core Features

- **Real Physics Simulation** - Lap times calculated from actual NASCAR racing mechanics
- **RPG Progression** - Driver skills improve through experience and XP
- **Mental State System** - Confidence, frustration, and focus dynamically affect performance
- **Strategic Decisions** - Time-pressured choices that impact race outcomes
- **No Hardware Required** - Console-based interface (with future UI options)

## Game Concept

You start as a low-skill rookie driver. As you race, your skills increase. Pass cars, and your confidence grows. Make mistakes, and frustration builds, affecting your performance. Every decision matters - from pit strategy to passing attempts to mental state management.

The simulation calculates outcomes based on:
- Driver skills (racecraft, consistency, aggression, focus, etc.)
- Mental state (confidence, frustration, focus, distraction)
- Car condition (tire wear, fuel level)
- Track characteristics (banking, length, surface)
- Real NASCAR physics (drafting, tire degradation, fuel consumption)

## Project Status

🚧 **Currently in Planning Phase** 🚧

This project is being built following a strict methodology to ensure sustainable development:

1. ✅ **Planning Complete** - Specs, architecture, and examples documented
2. ✅ **Project Setup Complete** - TypeScript, testing framework configured
3. ⏳ **Implementation** - TDD approach, building incrementally
4. ⏳ **Demo** - Playable race simulation

See [docs/SPEC.md](docs/SPEC.md) for complete game design.

## Documentation

- **[SPEC.md](docs/SPEC.md)** - Complete game design specification
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and system design
- **[EXAMPLES.md](docs/EXAMPLES.md)** - Test scenarios and expected behaviors
- **[CLAUDE.md](.claude/CLAUDE.md)** - Development workflow and principles

## Prerequisites

- Node.js >= 18.0.0
- npm (comes with Node.js)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd racing-simulation

# Install dependencies
npm install
```

## Development

```bash
# Run in development mode (with tsx - no build step)
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Run compiled version
npm start
```

## Project Structure

```
racing-simulation/
├── .claude/                # Claude Code project context
│   └── CLAUDE.md          # Development principles
├── docs/                  # Planning and design documents
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   └── EXAMPLES.md
├── src/                   # Source code
│   ├── types.ts          # TypeScript interfaces (contracts)
│   ├── engine/           # Physics simulation
│   ├── character/        # Driver stats, mental state, XP
│   ├── events/           # Decision system
│   ├── data/             # Track/car/driver data (JSON)
│   └── ui/               # User interface
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── package.json
```

## Architecture Highlights

**Layered Design:**
- **Data Layer** - JSON files with track/car/driver specs
- **Engine Layer** - Pure physics calculations
- **Character Layer** - RPG stats and progression
- **Events Layer** - Decision system
- **Orchestration Layer** - Race loop and state management
- **UI Layer** - Presentation (swappable)

**Key Principles:**
- Contract-first development (TypeScript interfaces)
- Test-driven development (TDD)
- Separation of concerns (layers don't depend on higher layers)
- Real simulation (not predetermined outcomes)

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Roadmap

### Phase 1: Core Engine ⏳
- [ ] Physics calculations (tire wear, fuel, drafting, lap times)
- [ ] Character system (skills, mental state, XP)
- [ ] Race simulation loop

### Phase 2: Decisions & Events
- [ ] Decision system framework
- [ ] Pit strategy decisions
- [ ] Passing opportunity decisions
- [ ] Mental state management decisions

### Phase 3: UI
- [ ] Console race display
- [ ] Decision prompts
- [ ] Post-race results

### Phase 4: Demo
- [ ] Complete playable race
- [ ] 2-3 NASCAR tracks (short, intermediate, superspeedway)
- [ ] AI competitor field
- [ ] Career progression

### Future
- Web-based UI
- Full NASCAR schedule (36+ races)
- Career mode with seasons
- 3D visualization / game client
- Multiplayer

## Contributing

This is currently a personal learning project, but suggestions and feedback are welcome via issues.

## Development Philosophy

This project follows a disciplined approach to avoid the "restart trap":

1. **Spec-first** - Design documented before implementation
2. **Contract-first** - TypeScript interfaces defined before code
3. **Test-first** - Tests written before implementation (TDD)
4. **Commit-frequently** - Small, working increments with git checkpoints
5. **Layer-separation** - Clear boundaries prevent coupling

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for full development guidelines.

## License

MIT

## Acknowledgments

- NASCAR for inspiring the simulation mechanics
- The racing sim community for physics research
- Claude Code for development assistance
