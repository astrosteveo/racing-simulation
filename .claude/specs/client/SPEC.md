# 3D Racing Client Specification

**Version:** 1.0
**Status:** 🔴 Planning (Not Started)
**Last Updated:** 2025-11-16

---

## Overview

The 3D Racing Client is the primary game interface for the NASCAR RPG Racing Simulation. It removes the manual input precision of traditional sim racing and replaces it with **skill-based strategic decision-making**, creating an RPG/management experience where players watch the race unfold in 3D and make critical choices based on their driver's skills, mental state, and race conditions.

**Core Concept:**
Players don't control steering/braking inputs. Instead, they guide their driver through strategic decisions that emerge naturally from race situations - when to push for a pass, how to manage tire wear, when to pit, how to respond to pressure. The driver's skills and mental state determine what options are available and their probability of success.

---

## Vision Statement

### What This Game IS

- **Visual Sim Racing Experience** - See the race unfold from standard sim racing camera angles (cockpit, roof cam, chase cam, TV broadcast)
- **RPG Progression** - Driver skills and mental state evolve over time, affecting available decisions and success rates
- **Strategic Management** - Focus on decision-making, not manual dexterity
- **Immersive Watching** - Experience the tension of racing through visual representation and consequence

###What This Game IS NOT

- **Manual Control Sim** - No steering wheels, pedals, or precise input timing required
- **Pure Automation** - Player decisions significantly impact race outcomes
- **Stats-Only Management** - Need to see cars moving, positions changing, conditions developing
- **Arcade Racer** - Real NASCAR physics drive outcomes, not power-ups or rubber-banding

---

## Core Gameplay Loop

### The Experience Flow

```
Race Start
    ↓
Player watches race unfold in 3D (real physics simulation)
    ↓
Race conditions develop (car ahead pulls away, patience declining, good run off turn)
    ↓
Decision opportunity emerges based on conditions + driver skills
    ↓
Game presents choices with skill-based probabilities
    ↓
Player chooses strategy (aggressive pass vs patient vs different line)
    ↓
Outcome determined by skill check + race physics
    ↓
Visual feedback (position change, mental state update, tire wear impact)
    ↓
Race continues → Loop back to watching
    ↓
Race End → Results screen → XP/Progression
```

### Decision Emergence System

Decisions are **NOT** random or timer-based. They emerge organically from race conditions:

**Example 1: Passing Opportunity**
- **Conditions:** Within 0.3s of car ahead + good exit from Turn 2 + straight ahead
- **Skill Check:** Racecraft 65+ AND Aggression 50+
- **Decision Prompt:** "You've got a run on the #42! Go for it?"
  - Option A: Look inside (Aggressive, high risk/reward)
  - Option B: Use draft and wait (Patient, safer)
  - Option C: Try outside line (Moderate risk)
- **Outcome:** Success probability based on racecraft + aggression + car positioning + tire wear

**Example 2: Mental State Management**
- **Conditions:** Stuck behind #22 for 15 laps + frustration >70 + leaders pulling away
- **Skill Check:** Composure < 60 (low composure triggers this)
- **Decision Prompt:** "You're getting frustrated. Getting stuck behind this guy is killing your race!"
  - Option A: Stay calm, wait for opportunity (Composure test)
  - Option B: Push hard and force the issue (Aggression + Racecraft test)
  - Option C: Change strategy, pit early (Pit Strategy test)
- **Outcome:** Mental state change + potential position gain/loss

**Example 3: Pit Strategy**
- **Conditions:** Lap 45/100 + tire wear 30% + fuel 40% + currently P8
- **Skill Check:** Always available, but options depend on Pit Strategy skill
- **Decision Prompt:** "Pit window opening soon. What's the call?"
  - Option A: Pit now (beat traffic, lose track position)
  - Option B: Stay out 5 more laps (gamble on caution)
  - Option C: Fuel only (faster stop, stretch tires)
- **Outcome:** Track position + tire/fuel status + cycle impact

### Visual Representation

Players experience the race through **standard sim racing camera angles**:

1. **Cockpit View**
   - First-person from driver's seat
   - Dashboard visible (RPM, speed, gear)
   - HUD overlay (position, lap time, tire/fuel status)
   - Minimal visibility (realistic)

2. **Roof Cam**
   - Mounted on car roof, looking forward
   - Better visibility than cockpit
   - Still connected to car movement
   - Popular in NASCAR broadcasts

3. **Chase Cam**
   - Third-person view following car
   - Classic racing game perspective
   - Good for seeing track ahead and cars nearby
   - Slightly elevated

4. **TV/Broadcast Cam**
   - Cinematic camera angles
   - Trackside cameras, helicopter views
   - Good for seeing full field and race flow
   - Dramatic presentation

**Players can switch cameras at any time** during the race to get different perspectives on their situation.

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────┐
│          3D Racing Client                   │
│  (Unity/Godot/Three.js - TBD)               │
│                                             │
│  - 3D Track Renderer                        │
│  - Car Models & Physics Sync                │
│  - Camera System (4 views)                  │
│  - HUD Overlays                             │
│  - Decision Prompt UI                       │
└────────────────┬────────────────────────────┘
                 │
                 │ WebSocket / IPC / API
                 │
┌────────────────▼────────────────────────────┐
│       Game Engine (Node.js/TypeScript)      │
│         (EXISTING - Already Complete)       │
│                                             │
│  - RaceEngine (physics simulation)          │
│  - DecisionManager (trigger decisions)      │
│  - Character System (skills, XP, mental)    │
│  - CareerManager (progression)              │
└─────────────────────────────────────────────┘
```

### Communication Protocol

**Real-Time Race State Updates (Client ← Engine)**

```typescript
interface RaceStateUpdate {
  tick: number;                    // Current simulation tick
  raceTime: number;                // Elapsed race time (seconds)
  currentLap: number;              // Current lap for leader

  cars: CarVisualState[];          // All 40 cars' positions

  playerState: {
    position: number;              // Current race position
    lapProgress: number;           // 0.0-1.0 around track
    speed: number;                 // Current speed (MPH)
    tireWear: number;              // 0-100%
    fuelLevel: number;             // 0-100%
    mentalState: MentalState;      // Current mental state
  };

  leaderboard: {
    position: number;
    driverName: string;
    gap: string;                   // "+2.5s" or "LEADER"
    lapsBehind: number;
  }[];
}

interface CarVisualState {
  id: string;
  position: Vector3;               // 3D coordinates on track
  rotation: Quaternion;            // Car orientation
  speed: number;
  tireWear: number;                // For visual tire smoke, etc.
}
```

**Decision Prompts (Client ← Engine)**

```typescript
interface DecisionPrompt {
  id: string;
  type: 'passing' | 'pit-strategy' | 'mental' | 'tire' | 'incident';

  context: {
    situation: string;             // "You've got a run on the #42!"
    conditions: string[];          // ["Within 0.3s", "Good exit Turn 2"]
    urgency: 'low' | 'medium' | 'high';
  };

  options: DecisionOption[];
  timeLimit: number;               // Seconds to decide (5-15s typical)

  skillCheck: {
    required: { skill: string, minimum: number }[];
    recommended: { skill: string, value: number }[];
  };
}
```

**Player Decision (Client → Engine)**

```typescript
interface PlayerDecision {
  promptId: string;
  optionId: string;
  timestamp: number;
}
```

### Integration Points

**What Already Exists (Game Engine):**
- ✅ Full physics simulation (`RaceEngine`)
- ✅ Decision system with 6 decision types (`DecisionManager`)
- ✅ Skill-based outcome calculation
- ✅ Mental state dynamics
- ✅ XP progression
- ✅ Career mode orchestration
- ✅ Save/load system
- ✅ 8 NASCAR tracks with realistic specifications

**What Needs to be Built (3D Client):**
- 🔴 3D track models (8 tracks)
- 🔴 NASCAR car 3D models
- 🔴 Camera system with 4 views
- 🔴 Real-time position synchronization
- 🔴 HUD overlay system
- 🔴 Decision prompt UI (modal overlays with timers)
- 🔴 Race start/end sequences
- 🔴 Results screen visualization
- 🔴 Menu system integration

**What Needs to be Extended (Game Engine):**
- 🟡 State broadcasting API (expose RaceState for real-time queries)
- 🟡 Position-to-coordinates mapping (lap progress → 3D world position)
- 🟡 Camera position calculator (where should cameras be on track?)
- 🟡 Decision trigger metadata (add visual context to decision prompts)

---

## Visual Requirements

### Track Representation

**Fidelity Level:** Simplified but recognizable

- Accurate track layout (length, banking, turns)
- Surface representation (asphalt vs concrete)
- Trackside barriers/walls
- Pit lane and pit boxes
- Start/finish line
- Distance markers (every 100 feet or lap segments)

**NOT Required:**
- Grandstands details
- Crowd rendering
- Detailed pit crews
- Track-specific branding (avoid licensing issues)

### Car Models

**40 NASCAR-spec cars on track simultaneously**

**Fidelity Level:** NASCAR Next Gen car silhouette

- Recognizable NASCAR shape
- Differentiated by number and color
- Tire smoke/wear visual feedback
- Damage representation (future)
- Draft visualization (optional)

**NOT Required:**
- Sponsor decals (avoid licensing)
- Detailed interior (cockpit view can use dashboard overlay)
- Perfect aerodynamic modeling (physics engine handles that)

### HUD Overlay

**Always Visible:**
- Current position (P8 / 40)
- Current lap (Lap 45 / 100)
- Lap time (Current, Last, Best)
- Gap to leader ("+3.5s" or "LEADER")
- Tire wear indicator (visual gauge, 0-100%)
- Fuel level indicator (visual gauge, 0-100%)

**Contextual:**
- Minimap (optional, toggle)
- Leaderboard (top 5 + nearby cars)
- Mental state indicators (subtle, not overwhelming)
- Speed/RPM (in cockpit view)

### Decision Prompt UI

**Visual Design:**
- Semi-transparent overlay (doesn't block view completely)
- Countdown timer (15s → 10s → 5s with urgency color change)
- 3-4 options with:
  - Clear description
  - Skill requirements highlighted
  - Success probability indicator (if high skill)
  - Risk/reward indication

**Behavior:**
- Race continues in background (slowed to 50% speed during prompt)
- Can switch cameras while deciding
- Auto-select safe option if timer expires
- Visual feedback on choice confirmation

---

## Technology Stack Options

### Option 1: Three.js (Web-Based)

**Pros:**
- Runs in browser (no installation)
- Node.js engine already browser-compatible
- WebGL performance good enough for 40 cars
- Easier integration with existing TS codebase
- Cross-platform by default
- Lower barrier to entry for players

**Cons:**
- Less powerful than game engines
- Have to build more from scratch (camera system, physics sync)
- Web performance varies by browser
- Limited access to native OS features

**Best For:** Quick prototype, web-first distribution, accessible to non-gamers

---

### Option 2: Unity

**Pros:**
- Full game engine with mature 3D capabilities
- Excellent car physics visualization tools
- Multi-platform export (Windows, Mac, Linux, WebGL)
- Asset store for car models, tracks
- Strong community and documentation
- Built-in camera system, UI tools

**Cons:**
- Requires C# for client code
- Heavier application (hundreds of MB)
- Need to bridge to Node.js engine (WebSocket/HTTP)
- Learning curve for non-Unity developers
- Licensing costs for commercial release

**Best For:** Professional polish, desktop game experience, long-term

---

### Option 3: Godot

**Pros:**
- Open-source (no licensing fees)
- GDScript similar to Python (easier than C#)
- Lightweight compared to Unity
- Good 3D capabilities
- Multi-platform export
- Growing community

**Cons:**
- Smaller ecosystem than Unity
- Fewer assets available
- Need to bridge to Node.js engine
- Less documentation than Unity

**Best For:** Open-source commitment, lightweight desktop game

---

### Recommendation: **Start with Three.js, Migrate to Unity Later**

**Rationale:**
1. **Prototype Quickly:** Three.js lets us validate the concept fast
2. **Reuse Engine:** Node.js engine works directly in browser
3. **Iterate Rapidly:** TS/JS throughout, easier to test
4. **Prove Value:** Get something playable before committing to Unity
5. **Migration Path:** If successful, Unity port will be straightforward (proven design)

**Development Phases:**
- Phase 1: Three.js prototype (8-12 weeks)
- Phase 2: Iterate based on feedback (4-6 weeks)
- Phase 3: Evaluate Unity migration (if needed for performance/features)

---

## Development Roadmap

### Phase 1: Foundation (4 weeks)

**Goal:** Basic 3D race visualization with one track

**Deliverables:**
1. Three.js setup with TypeScript
2. Single track 3D model (Bristol - short track, easier to model)
3. Basic car models (simple geometric shapes)
4. Single camera (chase cam - easiest to implement)
5. Real-time position synchronization
6. Basic HUD (position, lap, time)

**Milestone:** Watch a simulated race in 3D (no decisions yet)

---

### Phase 2: Core Gameplay (4 weeks)

**Goal:** Add decision system and full camera suite

**Deliverables:**
1. Decision prompt UI system
2. All 4 camera angles (cockpit, roof, chase, TV)
3. Camera switching
4. Enhanced HUD (tire wear, fuel, mental state)
5. Decision outcome visualization (position changes, etc.)
6. Menu system (start race, settings, quit)

**Milestone:** Play a complete race with decisions from start to finish

---

### Phase 3: Content Expansion (6 weeks)

**Goal:** Multiple tracks and polish

**Deliverables:**
1. Additional 7 track models (Charlotte, Daytona, Richmond, Atlanta, Martinsville, Texas, Watkins Glen)
2. Improved car models
3. Visual effects (tire smoke, draft indicators)
4. Enhanced decision UI (risk/reward meters, skill indicators)
5. Race results screen
6. Career mode integration

**Milestone:** Full 8-track career mode playable in 3D

---

### Phase 4: Polish & Refinement (4 weeks)

**Goal:** Production-ready experience

**Deliverables:**
1. Visual polish (lighting, materials, effects)
2. Performance optimization (maintain 60 FPS)
3. UI/UX refinement based on playtesting
4. Sound effects (engine, tires, impacts)
5. Tutorial system
6. Settings menu (graphics quality, camera preferences)

**Milestone:** Shippable MVP of 3D client

---

## Success Criteria

### Technical

- [ ] 60 FPS minimum with 40 cars on track
- [ ] <100ms latency between engine state and visual update
- [ ] Decision prompts appear within 1s of trigger
- [ ] Camera transitions are smooth (no jarring cuts)
- [ ] State synchronization is accurate (car positions match physics)

### Gameplay

- [ ] Players can complete a full race without confusion
- [ ] Decision moments feel natural and contextual
- [ ] Skill impact is visible and meaningful
- [ ] Racing "looks right" (cars behave believably)
- [ ] Mental state changes are apparent
- [ ] Career progression feels rewarding

### User Experience

- [ ] Controls are intuitive (camera switching, decision selection)
- [ ] HUD provides necessary info without overwhelming
- [ ] Decision prompts are clear and understandable
- [ ] Results screen shows meaningful progression
- [ ] Game is playable on mid-range hardware (2019+ laptop)

---

## Future Enhancements (Post-MVP)

### Visual Improvements
- Detailed car models with liveries
- Realistic track environments
- Weather effects (rain, track temperature)
- Damage visualization
- Pit stop animations

### Gameplay Features
- Multiplayer spectating
- Replay system
- Photo mode
- Custom livery editor
- VR support (cockpit view)

### Content Expansion
- Full NASCAR calendar (36 tracks)
- Historical seasons
- Legendary drivers as AI
- Championship scenarios

---

## Open Questions

1. **Distribution:** Web-hosted vs downloadable executable?
2. **Graphics Settings:** How low should minimum specs go?
3. **Network Requirements:** Can engine run client-side or needs server?
4. **Asset Creation:** Outsource 3D models or create in-house?
5. **Audio:** Essential for MVP or Phase 2?
6. **Tutorial:** In-race prompts or separate tutorial mode?

---

## Related Specifications

- **Physics Spec** (`specs/physics/`) - Race simulation engine
- **Character Spec** (`specs/character/`) - Skills and progression
- **Decisions Spec** (`specs/decisions/`) - Decision trigger logic
- **UI Spec** (`specs/ui/`) - Console UI reference (patterns to reuse)
- **Game Modes Spec** (`specs/game-modes/`) - Race/career orchestration

---

**Last Updated:** 2025-11-16
**Next Review:** After Phase 1 prototype completion
