# NASCAR RPG Racing Simulation - Development Guide

This document contains the development principles, workflow, and best practices for building this project with LLM assistance (Claude Code).

## Project Philosophy

**Core Principle:** Build a real physics simulation with RPG progression mechanics, not a fake number generator.

**Key Goals:**
- Real NASCAR racing physics that CALCULATE outcomes (not predetermined)
- RPG character stats that meaningfully affect performance
- Mental state system that creates dynamic, emergent gameplay
- Modular architecture that can evolve without requiring restarts

## Development Workflow

### The 4-Phase Approach

1. **Explore** - Research domain, gather context, understand requirements
2. **Plan** - Design architecture, define contracts, write specs
3. **Execute** - Implement following TDD principles
4. **Review** - Validate, test, refine

**Critical Rule:** Never skip Explore and Plan phases. They determine success.

## Architectural Principles

### Separation of Concerns

The codebase is organized into independent layers that can change without affecting each other:

```
Engine Layer (Pure simulation logic)
├── No UI dependencies
├── No data format dependencies
├── Outputs state via defined interfaces
└── Can run headless for testing

Data Layer (Content)
├── JSON files conforming to TypeScript interfaces
├── Track specs, car parameters, driver data
├── Swappable from mock → realistic → real NASCAR data

UI Layer (Presentation)
├── Consumes engine state via interfaces
├── Completely replaceable (console → web → 3D game)
└── Zero business logic
```

**Why this matters:** You can refine physics, swap data sources, or completely change UI without rewriting other layers.

### Contract-First Development

All systems communicate through TypeScript interfaces defined in `src/types.ts`.

**Rules:**
- Define interfaces BEFORE implementation
- All data structures must conform to interfaces
- If you need to change an interface, update all implementations
- Interfaces are the stable foundation; implementations are flexible

## Test-Driven Development (TDD)

**Mandatory approach for this project.**

### The TDD Cycle

1. Write test first (defines success criteria)
2. Run test (it should fail)
3. Implement minimal code to pass test
4. Run test (should now pass)
5. Refactor if needed
6. Commit

### Why TDD is Non-Negotiable

- Prevents "looks right but doesn't work" situations
- Provides rollback points when things break
- LLMs excel at implementing to pass tests
- Tests document expected behavior
- Catches regressions during refactoring

### Test Organization

```
tests/
├── unit/           # Pure functions (physics calculations)
├── integration/    # System interactions (race simulation)
└── e2e/           # Full race scenarios
```

## Git Strategy

### Commit Frequency: Small & Often

Commit after every small working piece:

**Good commits:**
- ✅ "Add Driver interface to types.ts"
- ✅ "Implement tire wear calculation"
- ✅ "Add test for tire wear affecting lap time"

**Bad commits:**
- ❌ "Implement race engine" (too large, can't rollback granularly)
- ❌ "WIP" (not descriptive)

### Commit Message Format

```
<action> <what>

<optional: why or context>
```

Examples:
- `Add drafting physics calculation`
- `Implement mental state decay system`
- `Fix: Tire wear not affecting cornering speed`

### Branch Strategy

For initial development:
- Work on `main` branch with frequent commits
- Tag stable milestones (v0.1-planning, v0.2-core-engine, etc.)

Later:
- Feature branches for major additions
- PR process for review

## Implementation Order (Layered Bottom-Up)

Build in this specific order:

1. **Types/Interfaces** (`src/types.ts`)
   - All contracts defined
   - No implementation yet

2. **Pure Functions** (physics calculations)
   - Testable, no side effects
   - Lives in `src/engine/physics/`

3. **Data Structures** (classes that hold state)
   - Driver, Track, Car, Race classes
   - Lives in respective directories

4. **Orchestration** (race loop, event system)
   - Ties everything together
   - Lives in `src/engine/`

5. **UI** (console output)
   - Last layer, depends on everything else
   - Lives in `src/ui/`

**Rule:** Test each layer before building the next.

## Mock Data vs Real Physics

**Important distinction:**

### Mock Data (ACCEPTABLE)
- Simplified track parameters (4 equal turns instead of detailed geometry)
- Approximate car specs (close enough values)
- Fictional driver names

**Why it's safe:** The physics formulas are still real. You're just using ballpark input values.

### Fake Physics (UNACCEPTABLE)
- Predetermined lap times
- Random number generation pretending to be simulation
- Hard-coded outcomes

**Why it's wrong:** It's not a simulation, it's theater. You can't refine it later.

### Migration Path

Start with simplified realistic data → Refine to accurate data → Add real NASCAR data

The physics engine code never changes. Only the JSON data files change.

## Anti-Patterns to Avoid

These are why previous attempts failed:

❌ **Building everything before testing anything**
- Solution: TDD, validate each piece

❌ **No clear success criteria**
- Solution: Write tests and examples first

❌ **Unclear system boundaries**
- Solution: Contract-first development

❌ **Massive commits with no rollback points**
- Solution: Commit every small win

❌ **Scope creep without referring to spec**
- Solution: Check `docs/SPEC.md` before adding features

❌ **Tightly coupled code**
- Solution: Layer separation, interface-based communication

## Validation Checkpoints

After each major piece:

1. **Write it** - Implement to pass tests
2. **Run it** - Execute the code, see actual output
3. **Verify it** - Check it does what you expect
4. **Commit it** - Save the working state
5. **Move on** - Build the next piece

Never build 5 systems then test. Build 1 system, verify, move to next.

## Example-Driven Design

Define concrete examples BEFORE implementing:

```markdown
## Scenario: Clean Lap at Bristol
**Given:**
- Driver: skill=70, confidence=high, fresh tires, full fuel
- Track: Bristol (0.533mi, 26° banking)

**Expected:**
- Lap time: ~15.5 seconds
- Mental state: confidence +1 (successful lap)

**Calculation:**
- Turn speed = f(banking, tire_grip, driver_skill)
- Straight speed = f(horsepower, drag, fuel_weight)
- Total time = sum of all sections
```

These become tests AND documentation.

## Development Tools

- **TypeScript** - Type safety prevents whole classes of bugs
- **Vitest** - Fast, modern testing with great TS support
- **tsx** - Run TypeScript directly without build step (development)
- **ESLint** - Catch errors and enforce consistency

## Claude Code Hooks Configuration

**IMPORTANT:** Hooks are configured in `.claude/settings.json`, NOT as separate hook files.

According to the [official documentation](https://code.claude.com/docs/en/hooks), hooks should be defined in your settings file using JSON configuration. Legacy hook script files in `.claude/hooks/` should be migrated to the settings format.

### Current Hook Setup

This project has legacy hook scripts in `.claude/hooks/`:
- `post-edit-hook` - Type checking and linting after edits
- `post-write-hook` - Similar validations for new files
- `pre-bash-hook` - Safety checks before bash commands

### Migration to Settings.json (Recommended)

To use the current hooks system, create `.claude/settings.json`:

```json
{
  "hooks": {
    "Edit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "npm run type-check 2>&1 | head -10",
            "timeout": 30
          }
        ]
      }
    ],
    "Write": [
      {
        "matcher": "*.ts",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint:fix $FILE_PATH",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

**Benefits of settings.json approach:**
- Centralized configuration
- Supports regex matchers and wildcards
- Better IDE integration
- Can reference project scripts with `$CLAUDE_PROJECT_DIR`

See [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks) for complete configuration options.

## Working with Claude Code

### Best Practices

1. **Be specific** - "Implement tire wear affecting lap time" not "make tires work"
2. **Reference specs** - "According to SPEC.md section 3.2..."
3. **Ask for tests first** - "Write a test for drafting, then implement it"
4. **Request validation** - "Run this and verify the lap times look reasonable"

### When Things Go Wrong

1. Check git log - find last working commit
2. `git diff` - see what changed
3. Review test output - what's actually failing?
4. Refer to ARCHITECTURE.md - did we violate a boundary?
5. Check EXAMPLES.md - what should this actually do?

## Working with Claude Code Subagents

### Built-in Subagents

This project leverages Claude Code's built-in subagents for specialized tasks:

**@explore** - Research and discovery
- NASCAR physics research (drag coefficients, drafting formulas)
- Algorithm investigation (how other sims handle tire wear)
- Data source discovery (finding official track specifications)
- Use when: Need domain knowledge or external research

**@plan** - Architecture and design decisions
- Feature planning that respects existing architecture
- Refactoring strategies that maintain contracts
- Integration point identification
- Use when: Making structural decisions or adding major features

**@general-purpose** - Complex multi-step implementation
- TDD feature implementation (test → code → verify)
- Bug investigation and fixing
- Multi-file refactoring
- Use when: Task requires multiple coordinated steps

### When to Recommend Custom Subagents

**Claude should proactively suggest creating a custom subagent when:**

1. **Repetitive Validation Pattern Detected**
   - Example: Repeatedly validating NASCAR data against specs
   - Suggest: `@nascar-data-validator` subagent
   - Trigger: 3+ instances of manual data validation

2. **Complex Domain-Specific Workflow**
   - Example: Always following TDD cycle but sometimes forgetting steps
   - Suggest: `@tdd-assistant` subagent that enforces workflow
   - Trigger: TDD violations or "write test later" patterns

3. **Frequent Cross-Reference Checking**
   - Example: Constantly comparing simulation output to EXAMPLES.md
   - Suggest: `@physics-tester` subagent that automates validation
   - Trigger: 5+ manual example validations

4. **Specialized Quality Checks**
   - Example: Checking if types.ts changes break implementations
   - Suggest: `@contract-guardian` subagent
   - Trigger: Breaking changes detected multiple times

5. **Research-Heavy Tasks**
   - Example: Repeatedly searching for NASCAR technical specifications
   - Suggest: `@nascar-researcher` subagent with curated sources
   - Trigger: Multiple @explore calls for similar NASCAR data

### Custom Subagent Template

When recommending a custom subagent, suggest this structure:

```yaml
# .claude/subagents/[name].yml
name: subagent-name
description: What this subagent does and when to use it
tools: [Read, Write, Bash, WebSearch, etc.]
prompt: |
  Clear instructions for the subagent's task

  Steps:
  1. Specific step
  2. Another step
  3. Success criteria

  Focus on: What matters most
```

### Subagent Recommendations Log

**Format for suggesting new subagent:**

```
💡 SUBAGENT OPPORTUNITY DETECTED

Pattern: [Describe what's being repeated]
Occurrences: [How many times seen]
Suggested Subagent: @subagent-name
Purpose: [What it would automate]
Value: [Time saved / errors prevented]

Would you like me to create this subagent?
```

### Example Subagent Opportunities

**Pattern:** Manual validation of lap times against EXAMPLES.md
- **Suggested:** `@example-validator`
- **Purpose:** Automatically run simulation and compare to documented examples
- **Value:** Catches simulation drift from spec immediately

**Pattern:** Searching for and formatting NASCAR data from multiple sources
- **Suggested:** `@nascar-data-collector`
- **Purpose:** Gather track/car specs from reliable sources, format as JSON
- **Value:** Ensures data accuracy and saves research time

**Pattern:** Reviewing code changes for contract violations
- **Suggested:** `@contract-reviewer`
- **Purpose:** Check if implementation changes break interface contracts
- **Value:** Prevents architectural violations before commit

## Project Status Reference

**IMPORTANT: This section and README.md are living documents. Update both after each major milestone.**

### Current Status (Updated: 2025-11-16)

**Overall Progress:** Phase 5 - Console UI (✅ COMPLETE!)
**Test Pass Rate:** 215/233 tests passing (92.3%)

### Completed Systems ✅

1. **Planning & Architecture** (Phase 1 ✅)
   - Complete specifications (SPEC.md, ARCHITECTURE.md, EXAMPLES.md)
   - TypeScript interfaces defined (src/types.ts)
   - Development workflow documented

2. **Project Setup** (Phase 2 ✅)
   - TypeScript + Vitest configuration
   - ESLint + Git hooks
   - Project structure established

3. **Physics Engine** (Phase 3 ✅)
   - ✅ Tire physics (17/17 tests passing)
   - ✅ Fuel consumption (30/30 tests passing)
   - ✅ Speed calculation (27/34 tests passing - 79.4%)
   - ✅ Lap time calculation (28/39 tests passing - 71.8%)
   - ⏳ Aerodynamics/drafting (deferred to future extensions)

4. **Character System** (Phase 3 ✅)
   - ✅ Driver class with 10 skill categories (28/28 tests)
   - ✅ Mental state system (27/27 tests)
   - ✅ XP and progression mechanics (11/11 integration tests)
   - ✅ Physics integration working

5. **Race Simulation Engine** (Phase 3 ✅)
   - ✅ Race loop orchestration (21/21 integration tests)
   - ✅ Lap-by-lap state management
   - ✅ Position tracking with gap calculations
   - ✅ Race results generation with XP rewards
   - ⏳ Event generation (Phase 4)

6. **Console UI Layer** (Phase 5 ✅)
   - ✅ Live race display with standings table (47 tests)
   - ✅ Real-time car status visualization (tires, fuel)
   - ✅ Mental state display with progress bars
   - ✅ Race results screen with XP breakdown
   - ✅ Driver status panel (skills, career stats)
   - ✅ Menu/input handling system
   - ✅ Working demo script (demo-race.ts)
   - ✅ Clean architecture (UIRenderer interface implementation)

### In Progress 🚧

**Next Up:** Phase 4 - Decision System

### Not Started ⏳

7. **Decision System** (Phase 4 - Next)
   - Pit strategy decisions
   - Passing opportunity decisions
   - Mental state management decisions
   - Decision prompts in UI (stub already exists)

8. **Demo Polish** (Phase 6)
   - Complete playable race with all systems integrated
   - Realistic NASCAR track data (Bristol, Charlotte, Daytona)
   - Enhanced AI competitor field
   - Career progression features

### Known Issues & Deferred Items

- Physics calibration at 79-90% (deferred until more context)
  - Bristol lap times ~0.5s off target
  - Tire wear penalty slightly high
  - Charlotte speeds need adjustment
- Aerodynamics/drafting module not yet implemented

### Phase Checklist

- [x] Phase 1: Planning (docs written, types defined)
- [x] Phase 2: Setup (project initialized, structure created)
- [x] Phase 3: Core Engine (physics ✅, character ✅, race loop ✅)
- [ ] Phase 4: Events & Decisions (timed decision system) ← NEXT
- [x] Phase 5: UI (console interface ✅)
- [ ] Phase 6: Demo (full playable race with all systems)

## Success Criteria

The project is successful when:

1. ✅ You can run a complete race simulation
2. ✅ Lap times are CALCULATED from physics, not faked
3. ✅ Driver stats meaningfully affect race outcomes
4. ✅ Mental state creates dynamic gameplay (confidence, frustration)
5. ✅ Timed decisions impact race results
6. ✅ Tests validate all core mechanics
7. ✅ Code is modular enough to add new tracks/drivers easily
8. ✅ You can swap the UI without touching engine code

## Future Extension Points

The architecture supports these future additions without major refactoring:

- Real NASCAR data integration (tracks, drivers, teams)
- Weather system affecting tire grip
- Damage modeling (mechanical failures)
- Pit crew skill system
- Multi-race season/career mode
- Multiplayer/AI competition
- 3D visualization / game client
- Telemetry data export

## Remember

**Code before plan = failure**
**Test before implementation = success**
**Commit frequently = safety**
**Refer to specs = stay on track**
**Keep documentation current = maintainability**

### Living Documentation

**CLAUDE.md and README.md are living documents**

After each major milestone:
1. Update "Project Status Reference" section in CLAUDE.md
2. Update "Project Status" section in README.md
3. Update "Roadmap" checkboxes in README.md
4. Keep both files in sync

Both documents should accurately reflect:
- Current phase and progress
- Completed systems with test pass rates
- Known issues and deferred items
- Next steps

**Outdated documentation is worse than no documentation** - it misleads and wastes time.

This project is about building something sustainable that won't require the 6th restart.
