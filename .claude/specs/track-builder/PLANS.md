# Track Builder Plans & Roadmap

**Last Updated:** 2025-11-17
**Current Phase:** Phase 1 - Foundation (Week 1)

---

## Overview

Long-term roadmap and milestones for the Track Builder system. This system will enable creation and editing of NASCAR racing tracks with parametric generation, visual editing tools, and validation systems.

**Roadmap Horizon:** 4 weeks MVP + 6 months advanced features

---

## Phases

### Phase 1: Foundation - Generalize Existing System (🟡 In Progress)

**Timeline:** Week 1 (5 days)
**Status:** 🟡 In Progress - Spec complete, implementation pending

**Goals:**
- Remove hardcoded Bristol geometry
- Support multiple track types parametrically
- Implement progressive banking (Bristol 24-30°)
- Create second track (Martinsville) to prove generalization

**Deliverables:**
- TrackResource GDScript class (type-safe track data)
- Parametric track generation (no hardcoded coordinates)
- Bristol with progressive banking
- Martinsville track JSON and generation
- Multi-track loading system

**Success Criteria:**
- Bristol generates from JSON (no hardcoding)
- Track length accuracy within 1% of specification
- Progressive banking works (24° inside, 30° outside)
- Martinsville renders correctly (flat 12° banking, tight 100' radius turns)
- Can switch between Bristol and Martinsville without issues
- All validation tests pass

**Dependencies:**
- Existing Bristol track generation (already working)
- GDScript Resource system (Godot 4.x)
- JSON parsing (Godot built-in)

**Tasks:** 6 tasks (see TASKS.md #1-6)

---

### Phase 2: Track Editor Plugin (🔴 Planned)

**Timeline:** Weeks 2-3 (10 days)
**Status:** 🔴 Planned - Dependent on Phase 1 completion

**Goals:**
- Visual track editing in Godot Editor
- Real-time 3D preview with immediate parameter feedback
- Save/load track JSON from editor
- User-friendly track creation workflow

**Deliverables:**
- Godot EditorPlugin (track_editor addon)
- Bottom panel UI with track controls
- Real-time 3D preview viewport
- Parameter controls (name, length, sections, banking)
- Track validation UI with error reporting

**Success Criteria:**
- Plugin appears in Godot Editor
- Can create new track from scratch via UI
- All track parameters adjustable (name, length, sections, banking)
- Preview updates < 100ms after parameter change
- Can save track to JSON file
- Can load existing track JSON
- Validation errors displayed clearly
- Undo/redo works (Godot's built-in)

**Dependencies:**
- Phase 1 complete (parametric generation working)
- Godot EditorPlugin API
- UI controls (OptionButton, SpinBox, Tree, etc.)

**Tasks:** 3 tasks (see TASKS.md #7-9)

---

### Phase 3: Advanced Features (🔴 Planned)

**Timeline:** Week 4 (5 days)
**Status:** 🔴 Planned - Dependent on Phase 2 completion

**Goals:**
- NASCAR-specific features (pit roads, surface zones)
- Track validation and testing tools
- Performance optimization
- Third track (Daytona tri-oval)

**Deliverables:**
- Pit road system (entry, exit, stalls)
- Surface zones (racing groove, apron, marbles with different grip)
- Track validator (geometry, banking, length checks)
- Track testing tools (test car drives laps, validation)
- Daytona tri-oval track
- Performance optimization (LOD system, mesh optimization)

**Success Criteria:**
- Pit road renders and is accessible by cars
- Surface zones have different physics properties
- Validation catches invalid track data
- Test car completes laps without issues
- Daytona tri-oval renders correctly
- Performance: 60+ FPS with 40-car race field

**Dependencies:**
- Phase 2 complete (editor working)
- Physics integration (grip zones)
- Collision system (pit road accessible)

**Tasks:** 6 tasks (see TASKS.md #10-15)

---

### Phase 4: Road Courses & Complex Tracks (🔴 Future)

**Timeline:** TBD (3-4 weeks)
**Status:** 🔴 Future - Post-MVP

**Goals:**
- Support road courses (left AND right turns)
- Elevation changes (hills, dips, banking transitions)
- Hybrid layouts (rovals - oval + infield road course)
- Advanced track features (tire barriers, runoff areas, chicanes)

**Deliverables:**
- Road course track type support
- Elevation profile system (vertical geometry)
- Spline-based curve editing (visual curve adjustment)
- Watkins Glen or COTA track example
- Charlotte Roval (oval + infield) example

**Success Criteria:**
- Can create Watkins Glen road course
- Elevation changes work correctly (physics + visuals)
- Rovals combine oval and road course sections seamlessly
- All NASCAR road courses supportable

**Dependencies:**
- Phase 3 complete (validation, performance working)
- Elevation system (vertical coordinates in track data)
- Spline editing tools (more complex than arcs/straights)

---

## Milestones

### M1: Multi-Track Support

**Target:** End of Week 1
**Status:** 🔴 Not Started

**Achievements:**
- Bristol and Martinsville both work from JSON
- No hardcoded track geometry
- Progressive banking implemented
- Multi-track switching functional

**Metrics:**
- Track count: 2 (Bristol, Martinsville)
- Length accuracy: Within 1% for both tracks
- Banking accuracy: Progressive (Bristol 24-30°), Flat (Martinsville 12°)
- Generation time: < 200ms per track

---

### M2: Visual Track Editor

**Target:** End of Week 3
**Status:** 🔴 Not Started

**Achievements:**
- Track editor plugin functional
- Can create track entirely via UI (no JSON editing)
- Real-time preview working
- Save/load functional

**Metrics:**
- UI responsiveness: < 100ms preview update
- Usability: Can create simple oval in < 5 minutes
- Workflow: No crashes, clear error messages
- Feature completeness: All track parameters editable

---

### M3: Production-Ready MVP

**Target:** End of Week 4
**Status:** 🔴 Not Started

**Achievements:**
- 3+ tracks functional (Bristol, Martinsville, Daytona)
- Pit roads working
- Validation system complete
- Performance optimized (60 FPS)

**Metrics:**
- Track count: 3+ (oval, flat oval, tri-oval)
- Feature completeness: Pit roads, surface zones, validation
- Performance: 60 FPS with 40 cars
- Quality: All validation tests pass

---

## Feature Backlog

Features under consideration but not yet planned:

### Dynamic Track Conditions (Priority: Medium)

**Problem:** Real NASCAR races have changing track conditions (rubber buildup, temperature, weather)
**Proposed Solution:**
- Time-based grip changes (track "rubbers in" over race)
- Temperature simulation (hot track = different grip)
- Weather effects (rain, wet patches, drying line)
**Estimated Effort:** Large (3-4 weeks)
**Depends On:** Phase 3 complete, surface zones working
**Nice to Have:** ⭐⭐⭐⭐☆ (4/5 importance - adds strategic depth)

---

### Track Deterioration (Priority: Low)

**Problem:** Real NASCAR tracks deteriorate during races (surface breaks down, bumps appear)
**Proposed Solution:**
- Lap-based surface degradation
- Bump generation in high-wear areas
- Physics effects (bumps affect car handling)
**Estimated Effort:** Medium (2 weeks)
**Depends On:** Phase 3 complete, surface physics working
**Nice to Have:** ⭐⭐⭐☆☆ (3/5 importance - realism feature)

---

### Track Lighting System (Priority: Medium)

**Problem:** NASCAR races at night (Daytona, Charlotte)
**Proposed Solution:**
- Day/night time-of-day system
- Light towers and shadows
- Headlights on cars
**Estimated Effort:** Medium (2-3 weeks)
**Depends On:** Phase 3 complete, visual polish
**Nice to Have:** ⭐⭐⭐⭐☆ (4/5 importance - immersion)

---

### Scenery Placement Tools (Priority: Low)

**Problem:** Tracks need grandstands, signs, trees, buildings for realism
**Proposed Solution:**
- Scenery editor (place objects along track)
- Library of NASCAR scenery assets
- Billboard/sign system
**Estimated Effort:** Large (4-5 weeks)
**Depends On:** Phase 2 complete (editor plugin exists)
**Nice to Have:** ⭐⭐☆☆☆ (2/5 importance - visual polish only)

---

### AI-Assisted Track Generation (Priority: Low)

**Problem:** Creating tracks manually is time-consuming
**Proposed Solution:**
- Template-based generation (input: length, banking, type → output: complete track)
- "Make it like Bristol but longer" natural language
- Auto-adjust sections to match target length
**Estimated Effort:** Large (4-6 weeks)
**Depends On:** Phase 3 complete, many tracks exist as examples
**Nice to Have:** ⭐⭐⭐☆☆ (3/5 importance - productivity tool)

---

### Track Import from Real Data (Priority: Medium)

**Problem:** Would be cool to import real track GPS/elevation data
**Proposed Solution:**
- Import GPS racing line data (CSV, GPX formats)
- Convert to track sections automatically
- Elevation data from SRTM or similar
**Estimated Effort:** Large (3-4 weeks)
**Depends On:** Phase 4 complete (elevation system exists)
**Nice to Have:** ⭐⭐⭐⭐☆ (4/5 importance - enables accurate recreations)

---

### Procedural Track Variants (Priority: Low)

**Problem:** Want multiple configurations of same track (Bristol day vs night, different layouts)
**Proposed Solution:**
- Track variants system (base track + modifications)
- Day/night variants
- Configuration variants (roval vs oval, different pit entry)
**Estimated Effort:** Medium (2 weeks)
**Depends On:** Phase 3 complete
**Nice to Have:** ⭐⭐⭐☆☆ (3/5 importance - adds variety)

---

## Research & Spikes

### Spike 1: Godot Terrain3D Integration

**Question:** Can we use Terrain3D addon for elevation changes in road courses?
**Why:** Road courses have significant elevation changes (COTA has 133' elevation delta)
**Approach:**
1. Install Terrain3D addon
2. Test elevation profile integration with track generator
3. Evaluate performance impact
4. Decide: Use Terrain3D vs custom elevation system

**Estimated Time:** 1-2 days
**Priority:** Medium (needed for Phase 4)

---

### Spike 2: Banking Transition Optimization

**Question:** What's the optimal transition distance for banking changes?
**Why:** Sudden banking changes cause visual/physics artifacts
**Approach:**
1. Test various transition distances (25', 50', 100', 150')
2. Visual evaluation (smooth gradient)
3. Physics testing (no jolts or speed spikes)
4. NASCAR research (what do real tracks use?)

**Estimated Time:** 1 day
**Priority:** High (affects Phase 1 quality)

---

### Spike 3: LOD System Performance

**Question:** How much performance gain from LOD (Level of Detail) system?
**Why:** Large tracks like Daytona may impact performance
**Approach:**
1. Profile baseline (Daytona full detail with 40 cars)
2. Implement simple LOD (3 levels: high, medium, low)
3. Profile with LOD enabled
4. Measure FPS gain vs visual quality loss

**Estimated Time:** 2 days
**Priority:** Medium (Phase 3 optimization)

---

## Version History

### v1.0 - Track Builder MVP (Week 4)

**Features:**
- Parametric track generation (oval, tri-oval)
- Progressive banking support
- Track editor plugin (visual editing)
- Multi-track support (3+ tracks)
- Pit road system
- Track validation
- Performance: 60 FPS target

**Tracks:**
- Bristol Motor Speedway (progressive banking short track)
- Martinsville Speedway (flat paper-clip track)
- Daytona International Speedway (tri-oval superspeedway)

---

### v1.1 - Advanced Features (Future)

**Features:**
- Surface zones (racing groove, apron, marbles)
- Track testing tools
- Advanced validation
- Performance optimization (LOD)

---

### v2.0 - Road Courses (Future)

**Features:**
- Road course support (left + right turns)
- Elevation changes
- Roval layouts (oval + infield)
- Complex track geometries

**Tracks:**
- Watkins Glen (classic road course)
- COTA (modern road course with elevation)
- Charlotte Roval (oval + infield hybrid)

---

## Risk Assessment

### High Risk

**Track Generation Complexity:**
- Risk: Complex track types (tri-ovals, rovals) may be difficult to parametrize
- Mitigation: Start with simple ovals (Phase 1), build complexity incrementally
- Status: Mitigated (Phase 1 focuses on simple ovals)

**Editor Plugin Instability:**
- Risk: Godot EditorPlugin API may have limitations or bugs
- Mitigation: Research EditorPlugin capabilities during Phase 1, prototype early
- Status: Monitoring (will discover in Phase 2)

### Medium Risk

**Performance Scaling:**
- Risk: Large tracks + 40 cars may not hit 60 FPS target
- Mitigation: LOD system, mesh optimization, profiling early and often
- Status: Planned (Phase 3 optimization)

**Banking Physics Integration:**
- Risk: Progressive banking may not integrate cleanly with physics engine
- Mitigation: Test with physics early (Phase 1), validate with car behavior
- Status: Mitigated (physics already handles banking)

### Low Risk

**Multi-Track Switching:**
- Risk: Memory leaks or crashes when switching tracks
- Mitigation: Proper mesh cleanup, test thoroughly
- Status: Low risk (Godot handles resource management well)

---

## Success Metrics

### MVP Success (End of Week 4)

**Functional Metrics:**
- ✅ 3+ tracks working (Bristol, Martinsville, Daytona)
- ✅ Track editor functional (can create track without JSON editing)
- ✅ Multi-track switching works (no crashes/leaks)
- ✅ Validation catches invalid tracks

**Quality Metrics:**
- ✅ Length accuracy within 1% for all tracks
- ✅ Banking accuracy (progressive and flat both work)
- ✅ No visual artifacts (gaps, overlaps, sudden transitions)
- ✅ Physics integration correct (banking affects car behavior)

**Performance Metrics:**
- ✅ Track generation < 500ms
- ✅ 60 FPS with 40-car race field
- ✅ Memory usage < 50MB per track
- ✅ Editor preview updates < 100ms

**Usability Metrics:**
- ✅ Can create simple oval in < 5 minutes
- ✅ Clear error messages (validation feedback)
- ✅ No crashes during normal use
- ✅ Save/load preserves all data (lossless round-trip)

---

## Maintenance Plan

**Regular Updates:**
- Track data schema updates (as NASCAR specs change)
- New track additions (as NASCAR schedule changes)
- Bug fixes (reported issues)
- Performance improvements (profiling feedback)

**Long-Term Evolution:**
- Road course support (v2.0)
- Dynamic track conditions (v2.1)
- Advanced scenery (v2.2)
- AI-assisted generation (v3.0)

---

**Last Reviewed:** 2025-11-17
**Next Review:** End of Phase 1 (reassess Phase 2-3 plans based on learnings)
