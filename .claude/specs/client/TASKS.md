# 3D Client Development Tasks

**Last Updated:** 2025-11-16
**Test Status:** N/A (not yet implemented)
**Phase:** Planning & Specification

---

## Current Work

None - specification phase complete, awaiting development start.

---

## Blocked Items

None currently.

---

## Next Up (Priority Order)

### Phase 1: Foundation & Prototype (4 weeks)

**Goal:** Prove the concept with basic 3D visualization

---

#### 1.1: Project Setup & Architecture (Week 1)

**Files to Create:**
- `client/` (new directory at project root)
- `client/package.json` (Three.js dependencies)
- `client/tsconfig.json` (TypeScript config for client)
- `client/src/main.ts` (entry point)
- `client/src/engine-bridge.ts` (WebSocket/IPC to game engine)

**Action:**
1. Initialize Three.js + TypeScript project
2. Set up build pipeline (Vite or Webpack)
3. Create WebSocket connection to game engine
   - Message serialization/deserialization
   - Contract validation
   - Reconnection logic
4. Implement basic HTML shell
   - Canvas for 3D rendering
   - HUD overlay divs
   - CSS layout

**Success Criteria:**
- Client connects to running game engine
- Can receive RaceStateUpdate messages
- Basic 3D scene renders (empty for now)
- No TypeScript errors
- Tests: Connection, message parsing

---

#### 1.2: Track Geometry System (Week 1-2)

**Files to Create:**
- `client/src/track/track-loader.ts`
- `client/src/track/geometry-generator.ts`
- `client/src/track/bristol-geometry.ts` (first track data)
- `src/data/tracks/bristol.json` (UPDATE with 3D geometry)

**Action:**
1. Design track geometry data format
   - Centerline points from section data
   - Banking visualization
   - Track width/walls
2. Implement Bristol track geometry
   - Use existing bristol.json section data
   - Generate 3D centerline from 4 sections
   - Create track mesh (surface, walls)
3. Three.js track rendering
   - Track surface material (asphalt texture)
   - Banking representation (angled geometry)
   - Start/finish line marker
   - Pit lane (basic)

**Success Criteria:**
- Bristol track loads and renders in 3D
- Track dimensions match specification (0.533 miles)
- Banking is visually apparent
- Camera can orbit track
- Tests: Geometry generation, bounds checking

---

#### 1.3: Car Rendering & Position Sync (Week 2)

**Files to Create:**
- `client/src/cars/car-model.ts`
- `client/src/cars/car-manager.ts`
- `client/src/position/track-position-calculator.ts`

**Action:**
1. Create simple car 3D model
   - Box geometry (NASCAR proportions)
   - Different colors for 40 cars
   - Number plates (texture with car number)
2. Implement position synchronization
   - Listen to RaceStateUpdate from engine
   - Convert lap progress to 3D coordinates
   - Update car positions in 3D scene
3. Test with actual race simulation
   - Connect to running RaceEngine
   - 40 cars moving around Bristol
   - Positions update in real-time

**Success Criteria:**
- 40 cars visible on track
- Positions match game engine state
- Cars follow track geometry
- Smooth movement (interpolation)
- Player car is distinguishable
- Tests: Position calculation, car tracking

---

#### 1.4: Basic Camera System (Week 3)

**Files to Create:**
- `client/src/camera/camera-manager.ts`
- `client/src/camera/chase-camera.ts`
- `client/src/camera/camera-controls.ts`

**Action:**
1. Implement chase camera
   - Follow player car at fixed distance
   - Smooth tracking (no jitter)
   - Auto-rotation based on car movement
2. Add camera switching
   - Keyboard input (C key to cycle)
   - Smooth transitions between cameras
3. Basic camera controls
   - Mouse wheel for zoom
   - Optional: Manual rotation with mouse drag

**Success Criteria:**
- Chase camera follows player smoothly
- Can zoom in/out
- No clipping through track geometry
- Frame rate stays above 30 FPS
- Tests: Camera positioning, transitions

---

#### 1.5: Minimal HUD (Week 3-4)

**Files to Create:**
- `client/src/hud/hud-manager.ts`
- `client/src/hud/position-widget.ts`
- `client/src/hud/lap-counter.ts`
- `client/public/styles/hud.css`

**Action:**
1. Create HTML overlay HUD elements
   - Race position (P8 / 40)
   - Current lap (Lap 45 / 100)
   - Lap time (Last, Best)
   - Gap to leader
2. Style HUD (CSS)
   - Transparent backgrounds
   - Racing-style fonts
   - High contrast for readability
3. Update HUD from RaceStateUpdate
   - Real-time data binding
   - Smooth animations for position changes

**Success Criteria:**
- HUD displays accurate race data
- Updates in real-time
- Readable against 3D scene
- No performance impact
- Tests: Data binding, formatters

---

#### Phase 1 Milestone: **Watch a Simulated Race**

**Deliverable:** Run `npm run play` in game engine, connect 3D client, watch Bristol race unfold in 3D with chase camera and basic HUD. No decisions yet, just watching.

---

### Phase 2: Core Gameplay Integration (4 weeks)

**Goal:** Add decision system and full camera suite

---

#### 2.1: Decision Prompt UI (Week 5)

**Files to Create:**
- `client/src/ui/decision-prompt.ts`
- `client/src/ui/decision-overlay.ts`
- `client/public/styles/decisions.css`

**Action:**
1. Create decision prompt modal
   - Semi-transparent overlay
   - Countdown timer visualization
   - 3-4 option buttons
   - Clear typography
2. Display decision from engine
   - Listen for DecisionPrompt messages
   - Pause/slow race rendering (50% speed)
   - Show prompt with context
3. Handle player input
   - Button clicks → PlayerDecision message
   - Keyboard shortcuts (1-4 keys)
   - Timeout auto-select
   - Visual feedback on selection

**Success Criteria:**
- Decision prompts appear correctly
- Timer countdown works
- Can select options
- Race resumes after decision
- Tests: Prompt rendering, timeout, selection

---

#### 2.2: Full Camera Suite (Week 5-6)

**Files to Create:**
- `client/src/camera/cockpit-camera.ts`
- `client/src/camera/roof-camera.ts`
- `client/src/camera/tv-camera.ts`

**Action:**
1. Implement cockpit camera
   - First-person from driver seat
   - Dashboard overlay (virtual instrument panel)
   - Limited field of view (realistic)
2. Implement roof camera
   - Mounted on car roof, forward view
   - Slight elevation over cockpit
   - Car visible in frame
3. Implement TV/broadcast camera
   - Trackside static cameras
   - Smooth panning to follow cars
   - Wide field of view
4. Refine camera switching
   - Smooth transitions
   - Remember last view per session
   - UI indicator for current camera

**Success Criteria:**
- All 4 cameras functional
- Smooth switching between views
- Each camera feels distinct
- Frame rate maintained
- Tests: Camera positioning, FOV calculations

---

#### 2.3: Enhanced HUD (Week 6)

**Files to Create:**
- `client/src/hud/tire-fuel-widget.ts`
- `client/src/hud/mental-state-widget.ts`
- `client/src/hud/leaderboard-widget.ts`

**Action:**
1. Add tire/fuel gauges
   - Visual bars (0-100%)
   - Color coding (green → yellow → red)
   - Percentage labels
2. Add mental state indicators
   - Subtle confidence/frustration displays
   - Icon-based or small bars
   - Not overwhelming
3. Add mini leaderboard
   - Top 5 + nearby cars
   - Gaps to leader
   - Position change arrows
4. Make HUD camera-specific
   - Cockpit: Full instrumentation
   - Chase: Minimal overlay
   - TV: Broadcast-style graphics

**Success Criteria:**
- All critical info visible
- Not cluttering the view
- Updates in real-time
- Camera-adaptive
- Tests: Widget rendering, updates

---

#### 2.4: Visual Feedback System (Week 7)

**Files to Create:**
- `client/src/effects/position-change-effect.ts`
- `client/src/effects/tire-smoke.ts`
- `client/src/hud/notification-system.ts`

**Action:**
1. Position change visualization
   - Flash/highlight when gaining position
   - Arrow indicators
   - Sound effect (future)
2. Tire wear effects
   - Smoke from worn tires
   - Visual degradation
3. Event notifications
   - Toast-style messages
   - "Pit stop complete!"
   - "Passed #42 for P5!"
4. Mental state visual cues
   - Screen edge tint when frustrated
   - Subtle camera shake when low focus

**Success Criteria:**
- Position changes are obvious
- Tire wear is visible
- Events are communicated clearly
- Not distracting from race
- Tests: Effect triggers, animations

---

#### Phase 2 Milestone: **Complete Race with Decisions**

**Deliverable:** Play a full race from start to finish, making decisions, switching cameras, seeing all feedback in real-time.

---

### Phase 3: Content Expansion (6 weeks)

**Goal:** All 8 tracks and polish

---

#### 3.1-3.8: Remaining 7 Tracks (Week 8-12)

**One track per week:**
1. Charlotte Motor Speedway (intermediate, 1.5mi quad-oval)
2. Daytona International Speedway (superspeedway, 2.5mi tri-oval)
3. Richmond Raceway (short, 0.75mi D-shaped)
4. Atlanta Motor Speedway (intermediate, 1.54mi quad-oval)
5. Martinsville Speedway (short, 0.526mi paperclip)
6. Texas Motor Speedway (intermediate, 1.5mi quad-oval)
7. Watkins Glen International (road course, 2.45mi, 7 turns) **SPECIAL**

**Action per track:**
1. Create track geometry data
2. Generate centerline from sections
3. Create 3D mesh
4. Test racing and camera positions
5. Add track-specific details (pit lane layout)

**Success Criteria:**
- All 8 tracks render correctly
- Dimensions match specifications
- Banking is accurate
- Cars navigate properly
- Tests: Geometry validation

---

#### 3.9: Watkins Glen Road Course (Week 12-13)

**Special handling for first road course:**

**Action:**
1. Adapt track generator for road course
   - Left AND right turns
   - Elevation changes
   - More complex geometry
2. Camera positioning for road course
   - TV cameras at key corners
   - Different chase camera behavior
3. Visual markers
   - Corner apex markers
   - Braking zones
4. Test extensively (completely different from ovals)

**Success Criteria:**
- Road course renders correctly
- Cars navigate all 7 turns
- Camera handles elevation changes
- Track feels like Watkins Glen
- Tests: Road course geometry, navigation

---

#### 3.10: Visual Polish (Week 13)

**Action:**
1. Lighting improvements
   - Directional sunlight
   - Track surface reflections
   - Car body highlights
2. Material refinement
   - Realistic asphalt/concrete
   - Car paint shader
   - Tire rubber
3. Environmental details
   - Sky dome
   - Track boundaries/grass
   - Pit wall details

**Success Criteria:**
- Game looks visually appealing
- Maintains 60 FPS
- Professional presentation
- Tests: Performance benchmarks

---

#### Phase 3 Milestone: **Full 8-Track Career Mode in 3D**

**Deliverable:** Complete career mode playable end-to-end in 3D client with all tracks.

---

### Phase 4: Polish & Production (4 weeks)

**Goal:** Ship-ready experience

---

#### 4.1: Menu System (Week 14)

**Files to Create:**
- `client/src/ui/main-menu.ts`
- `client/src/ui/race-setup.ts`
- `client/src/ui/settings.ts`

**Action:**
1. Main menu UI
   - Start race
   - Career mode
   - Settings
   - Quit
2. Race setup screen
   - Track selection
   - Lap count
   - Difficulty
3. Settings menu
   - Graphics quality
   - Controls
   - Audio (future)
4. Integrate with game engine menus

**Success Criteria:**
- Menus are intuitive
- Can configure race
- Settings persist
- Tests: Navigation, state management

---

#### 4.2: Results Screen (Week 14)

**Files to Create:**
- `client/src/ui/race-results.ts`
- `client/src/ui/xp-breakdown.ts`

**Action:**
1. Results visualization
   - Final positions
   - Lap times
   - XP gained breakdown
   - Skill improvements
2. Career mode integration
   - Championship points
   - Track unlocks
   - Milestones
3. Visual presentation
   - Animated stats
   - Celebratory effects for wins
   - Smooth transitions

**Success Criteria:**
- Results are clear
- Progression is obvious
- Feels rewarding
- Tests: Data display, animations

---

#### 4.3: Performance Optimization (Week 15)

**Action:**
1. Profile rendering performance
   - Identify bottlenecks
   - Optimize draw calls
   - LOD (Level of Detail) for distant cars
2. Memory management
   - Dispose unused assets
   - Texture optimization
   - Garbage collection monitoring
3. Frame rate optimization
   - Target 60 FPS on mid-range hardware
   - Graceful degradation for low-end
4. Load time optimization
   - Asset preloading
   - Progressive loading

**Success Criteria:**
- 60 FPS on 2019+ laptop
- <5s initial load time
- <2s track switching
- No memory leaks
- Tests: Performance benchmarks

---

#### 4.4: Sound Effects (Week 15-16)

**Files to Create:**
- `client/src/audio/audio-manager.ts`
- `client/src/audio/engine-sounds.ts`

**Action:**
1. Core race sounds
   - Engine sounds (player car + nearby)
   - Tire squeal
   - Draft/slipstream whoosh
2. UI sounds
   - Decision prompt alert
   - Selection confirmation
   - Countdown beeps
3. Ambient
   - Track atmosphere
   - Crowd noise (future)
4. Audio controls
   - Volume mixing
   - Mute option
   - Sound settings

**Success Criteria:**
- Sounds enhance immersion
- Not overwhelming
- Performance unaffected
- Tests: Audio triggering, mixing

---

#### 4.5: Tutorial & Onboarding (Week 16)

**Action:**
1. First-time user experience
   - Explain controls
   - Camera switching tutorial
   - First decision walkthrough
2. Tooltips and hints
   - Context-sensitive help
   - Skill requirement explanations
   - HUD element descriptions
3. Practice mode
   - Low-pressure race
   - Guided decisions
4. Help system
   - In-game reference
   - Keyboard shortcuts

**Success Criteria:**
- New players understand mechanics
- Controls are discoverable
- Not intrusive for experienced players
- Tests: Tutorial flow

---

#### Phase 4 Milestone: **Shippable MVP**

**Deliverable:** Polished, performant, playable 3D racing RPG ready for release.

---

## Completed

None yet - specification phase only.

---

## Backlog (Post-MVP Features)

### Content
- [ ] Additional NASCAR tracks (full 36-race calendar)
- [ ] Detailed car models with liveries
- [ ] Realistic track environments
- [ ] Weather system (rain, temperature effects)

### Gameplay
- [ ] Multiplayer spectating
- [ ] Replay system
- [ ] Photo mode
- [ ] VR support (cockpit view)

### Technical
- [ ] Unity/Unreal migration (if needed)
- [ ] Mobile version (touch controls)
- [ ] Mod support (custom liveries, tracks)

---

## Notes

- **Iterative Development:** Each phase builds on previous, can deploy early
- **Technology Stack:** Starting with Three.js (web), may migrate to Unity later
- **Performance Target:** 60 FPS on 2019+ hardware
- **Testing:** Every component has unit tests + integration tests
- **Spec Compliance:** All features must match SPEC.md vision

---

## Quick Commands

```bash
# Development (future)
cd client && npm run dev          # Start dev server
cd client && npm run build        # Production build
cd client && npm run test         # Run tests

# Integration (future)
npm run start-engine              # Start game engine
npm run start-client              # Start 3D client
npm run play-3d                   # Start both (convenience)
```

---

**Phase Status:** Planning Complete - Ready to begin Phase 1
**Next Review:** After Phase 1 prototype completion
