# Track Builder Specification

**Version:** 1.0
**Status:** 🟡 In Progress (Phase 1 - Foundation)
**Last Updated:** 2025-11-17

---

## Overview

The Track Builder system enables creation and editing of NASCAR racing tracks for the 3D Godot racing client. It provides parametric track generation, visual editing tools, and validation systems to ensure accurate track geometry, banking, and physics integration.

**Core Responsibilities:**
- Procedural generation of track geometry from parametric definitions
- Visual track editing via Godot Editor plugin
- Track data validation and testing tools
- NASCAR-specific features (progressive banking, pit roads, surface zones)
- Integration with physics engine for realistic racing simulation

**Related Specs:**
- `client/` - Primary owner (3D client needs track building capabilities)
- `physics/` - Track surfaces affect tire grip, position calculations
- `game-modes/` - Track selection, unlocking, progression

---

## Design Principles

### 1. Parametric Over Hardcoded

**All track geometry is generated from data**, never hardcoded coordinates.

**Why:** Enables easy modification, multiple track variants, and procedural generation without code changes.

**Example:**
```gdscript
# BAD - Hardcoded
var point = Vector3(250.0, 0.0, 0.0)

# GOOD - Parametric
var radius = track_data["sections"][0]["radius"]
var angle = track_data["sections"][0]["arcAngle"]
var point = calculate_arc_point(radius, angle, progress)
```

### 2. Data-Driven Track Definition

**Track characteristics defined in JSON**, converted to GDScript Resources for type safety.

**Why:** Separation of data and code, easy to create new tracks, validation at load time.

**Example:**
```json
{
  "id": "bristol",
  "name": "Bristol Motor Speedway",
  "type": "short_oval",
  "sections": [
    {"type": "turn", "radius": 250, "banking": {"inner": 24, "outer": 30}}
  ]
}
```

### 3. Real-Time Visual Feedback

**Track changes preview immediately in editor**, not after export/reload.

**Why:** Rapid iteration, immediate error detection, better UX for track designers.

**Implementation:** Use Godot's `@tool` scripts for in-editor execution.

### 4. Progressive Enhancement

**Build on existing working code**, don't rebuild from scratch.

**Why:** Bristol geometry generation already works - enhance it, don't replace it.

**Strategy:**
1. Remove hardcoding from existing code (Phase 1)
2. Add editor tools (Phase 2)
3. Add advanced features (Phase 3)

---

## Architecture

### System Boundaries

**What This Spec Covers:**
- Track geometry generation (centerline, surface mesh, banking)
- Track data schema (JSON structure, validation)
- Track editor plugin (visual editing tools)
- Track validation and testing
- Pit road, markers, surface zones
- NASCAR-specific track features

**What This Spec Does NOT Cover:**
- Car physics (handled by physics spec)
- Track position calculations for race simulation (physics spec)
- Track selection UI for career mode (game-modes spec)
- Network communication (client spec handles WebSocket)

### Dependencies

**Depends On:**
- Godot 4.x engine (SurfaceTool, EditorPlugin, Resource system)
- JSON for track data format
- GDScript for track generation and editor tools

**Depended On By:**
- `client/` spec - Uses generated track geometry for racing
- `physics/` spec - Needs track surface properties for grip calculations
- `game-modes/` spec - Needs track metadata for unlocking and selection

---

## Components

### 1. Track Data Layer

**Purpose:** Define track characteristics in structured data format

**Location:**
- JSON files: `client/data/tracks/*.json`
- GDScript Resource: `client/scripts/resources/track_resource.gd`

**Key Responsibilities:**
- Store track metadata (name, length, type, difficulty)
- Define track sections (turns, straights, transitions)
- Specify banking (constant, progressive, variable)
- Define pit road layout
- Define surface zones (racing groove, apron, marbles)

**Interfaces:** (See CONTRACTS.md for full details)
- `TrackData` (JSON schema)
- `TrackResource` (GDScript Resource)
- `SectionData`, `BankingData`, `PitRoadData`

### 2. Track Generator

**Purpose:** Convert parametric track data to 3D geometry

**Location:**
- `client/scripts/track_generator.gd` (EXISTS - needs enhancement)
- `client/scripts/track_mesh_builder.gd` (EXISTS - needs enhancement)

**Key Responsibilities:**
- Generate centerline points from section definitions
- Calculate banking angles (progressive, variable)
- Create track surface mesh with proper normals and UVs
- Generate collision shapes
- Create walls, pit road, markers

**Key Methods:**
```gdscript
func generate_centerline(track_data: Dictionary) -> Array[Vector3]
func calculate_banking(section: Dictionary, lateral_pos: float) -> float
func build_track_mesh(centerline: Array, track_data: Dictionary) -> Mesh
```

### 3. Track Mesh Builder

**Purpose:** Generate meshes from geometry data

**Location:** `client/scripts/track_mesh_builder.gd` (EXISTS)

**Key Responsibilities:**
- Create track surface mesh with banking
- Generate wall meshes (inner, outer)
- Apply UV mapping for textures
- Create collision trimesh

**Current Status:** Working for Bristol, needs enhancement for:
- Progressive banking (variable angle across track width)
- Multiple surface zones (different materials)
- Pit road geometry

### 4. Track Editor Plugin (NEW)

**Purpose:** Visual track editing in Godot Editor

**Location:** `client/addons/track_editor/` (NEW)

**Key Responsibilities:**
- Bottom panel UI for track selection and creation
- Parameter controls (name, length, sections, banking)
- Real-time 3D preview of track
- Save/load track JSON files
- Track validation and error reporting

**Key Classes:**
- `TrackEditorPlugin` - Main EditorPlugin
- `TrackEditorPanel` - UI panel with controls
- `TrackPreview3D` - 3D preview viewport

### 5. Track Validator (NEW)

**Purpose:** Validate track data and geometry

**Location:** `client/scripts/track_validator.gd` (NEW)

**Key Responsibilities:**
- Check geometry continuity (no gaps/overlaps)
- Validate banking angles (0-35° range)
- Verify total length accuracy
- Check pit road placement
- Detect physics issues

**Validation Methods:**
```gdscript
func validate_geometry(track_data: Dictionary) -> ValidationResult
func validate_banking(sections: Array) -> ValidationResult
func validate_length(centerline: Array, expected: float) -> ValidationResult
```

### 6. Track Position Calculator (NEW)

**Purpose:** Convert lap progress to 3D coordinates

**Location:** `client/scripts/track_position_calculator.gd` (NEW)

**Key Responsibilities:**
- Calculate position from lap progress (0.0 - 1.0)
- Determine which section contains a given progress value
- Return Transform3D (position + rotation) for car placement
- Handle lateral offset (racing line, inside/outside)

**Integration Point:** Shared with physics spec for consistent position calculations

---

## Data Flow

### Track Creation Flow

```
[Track Editor UI]
    ↓ (parameter changes)
[Track Data (JSON)]
    ↓ (load + parse)
[TrackResource]
    ↓ (generate)
[TrackGenerator.generate_centerline()]
    ↓ (centerline points)
[TrackMeshBuilder.build_track_mesh()]
    ↓ (Mesh + Collision)
[Track Scene (MeshInstance3D + StaticBody3D)]
```

### Runtime Track Loading Flow

```
[Race Scene Starts]
    ↓ (load track)
[Track JSON File]
    ↓ (parse)
[track.gd._ready()]
    ↓ (generate geometry)
[TrackGenerator + TrackMeshBuilder]
    ↓ (create meshes)
[Scene Tree (visible track)]
```

### Position Calculation Flow

```
[Car Lap Progress: 0.35]
    ↓ (calculate position)
[TrackPositionCalculator.get_position_at_progress()]
    ↓ (find section, local progress)
[Section Geometry Calculation]
    ↓ (return)
[Transform3D (position, rotation)]
    ↓ (apply to car)
[Car Positioned on Track]
```

---

## Track Type Support

### Oval Tracks

**Characteristics:**
- 2 turns (180° each)
- 2 straights
- Constant or progressive banking
- Symmetric geometry

**Examples:** Bristol (short track), Martinsville (flat)

**Implementation Status:** ✅ Bristol working, needs generalization

### Tri-Oval Tracks

**Characteristics:**
- 3 distinct turns
- Asymmetric frontstretch with peak banking
- Different radii per turn

**Examples:** Daytona, Charlotte

**Implementation Status:** 🔴 Not implemented, Phase 3

### Quad-Oval / Asymmetric Tracks

**Characteristics:**
- 4 turns with different radii
- Variable banking per corner
- Asymmetric layout

**Examples:** Dover, Phoenix (paper-clip shape)

**Implementation Status:** 🔴 Not implemented, Phase 3+

### Road Courses

**Characteristics:**
- Left AND right turns
- Elevation changes
- Complex braking zones

**Examples:** Watkins Glen, COTA

**Implementation Status:** 🔴 Future (out of initial scope)

---

## Banking System

### Banking Types

#### 1. Constant Banking
**Definition:** Single angle across entire track width and section length

```json
{"type": "constant", "angle": 12.0}
```

**Use Case:** Simple tracks like Martinsville (12° turns)

**Status:** ✅ Implemented

#### 2. Progressive Banking
**Definition:** Banking angle varies across track width (higher on outside)

```json
{
  "type": "progressive",
  "inner": 24.0,
  "outer": 30.0,
  "transitionType": "linear"
}
```

**Use Case:** Bristol (24-30°), most modern NASCAR tracks

**Status:** 🟡 Planned for Phase 1

**Implementation:**
```gdscript
func calculate_progressive_banking(lateral_position: float, inner: float, outer: float) -> float:
    # lateral_position: 0.0 = inside, 1.0 = outside
    return lerp(inner, outer, lateral_position)
```

#### 3. Variable Banking
**Definition:** Banking changes along track length (different at entry, apex, exit)

```json
{
  "type": "variable",
  "entry": 28.0,
  "apex": 30.0,
  "exit": 26.0
}
```

**Use Case:** Advanced tracks with strategic banking variation

**Status:** 🔴 Phase 3+ (future)

---

## NASCAR Track Specifications

### Track Dimensions

| Track Type | Length | Width | Banking | Examples |
|------------|--------|-------|---------|----------|
| Short Track | < 1 mile | 36-40 ft | 12-30° | Bristol, Martinsville |
| Intermediate | 1-2 miles | 40-55 ft | 8-24° | Charlotte, Atlanta |
| Superspeedway | > 2 miles | 40-48 ft | 31-33° | Daytona, Talladega |

### Banking Specifications

| Track | Turn Banking | Straight Banking | Type |
|-------|-------------|------------------|------|
| Bristol | 24-30° | 6-10° | Progressive |
| Martinsville | 12° | 0° | Constant |
| Daytona | 31° | 18° tri-oval | Constant |
| Talladega | 33° | 1-3° | Constant |

### Surface Zones

**Racing Groove:**
- Width: 10-20 feet
- Grip: 0.95 (high rubber buildup)
- Location: Mid-track to high line

**Apron:**
- Width: 5-15 feet (inside of racing surface)
- Grip: 0.85 (lower banking, less rubber)
- Purpose: Escape route, low line in some tracks

**Marbles (Off-Line):**
- Grip: 0.70 (debris, dust, less rubber)
- Location: Outside racing groove

---

## Pit Road System

### Pit Road Components

**Entry Blend Zone:**
- Length: 200-400 feet
- Transition from track banking to flat pit road
- Gradual merge with pit lane

**Pit Lane:**
- Width: 40-50 feet
- Length: 800-1200 feet
- Speed limit: 45-55 mph (enforced by game rules)
- Surface: Concrete (grip 0.90)

**Pit Stalls:**
- Count: 40-43 stalls
- Length: 18-20 feet per stall
- Numbered markers

**Exit Blend Zone:**
- Length: 200-400 feet
- Transition from flat pit road to track banking
- Merge with racing surface

### Pit Road Data Schema

```json
{
  "pitRoad": {
    "entryPoint": {"section": 1, "distance": 600},
    "exitPoint": {"section": 1, "distance": 100},
    "length": 800,
    "width": 45.0,
    "stallCount": 40,
    "stallLength": 18.0,
    "speedLimit": 45.0,
    "surface": "concrete",
    "grip": 0.9
  }
}
```

---

## Implementation Status

| Component | Status | Tests | Notes |
|-----------|--------|-------|-------|
| Track Data Schema | 🟡 In Progress | 0/5 | Need enhanced JSON schema |
| TrackResource | 🔴 Not Started | 0/5 | Phase 1 |
| Track Generator | 🟡 Partial | 0/10 | Bristol works, needs generalization |
| Track Mesh Builder | 🟢 Working | 0/8 | Works for Bristol, needs progressive banking |
| Track Editor Plugin | 🔴 Not Started | 0/15 | Phase 2 |
| Track Validator | 🔴 Not Started | 0/10 | Phase 4 |
| Position Calculator | 🔴 Not Started | 0/8 | Phase 3 |
| **TOTAL** | **10% Complete** | **0/61** | Phase 1 starting |

---

## Success Criteria

### Phase 1 Success (Foundation)
- ✅ Can generate Bristol, Martinsville, Daytona from JSON (no hardcoding)
- ✅ Progressive banking works (Bristol 24-30°)
- ✅ Track length accuracy within 1%
- ✅ Tests validate geometry continuity
- ✅ TrackResource class implemented

### Phase 2 Success (Editor)
- ✅ Track editor plugin functional in Godot Editor
- ✅ Can adjust all track parameters via UI
- ✅ Real-time preview updates < 100ms
- ✅ Can save/load track JSON
- ✅ Basic validation (no crashes, valid geometry)

### Phase 3 Success (Features)
- ✅ Pit road renders and is accessible
- ✅ Surface zones have different physics properties
- ✅ Track validation catches all common errors
- ✅ Performance: 60+ FPS with full race field (40 cars)

### MVP Success (All Phases)
- ✅ 3+ tracks fully functional (Bristol, Martinsville, Daytona)
- ✅ Editor allows creating new tracks without code
- ✅ All NASCAR track types supported (oval, tri-oval)
- ✅ Physics integration works correctly
- ✅ Lap times match expected values (validation tests pass)

---

## Known Issues & Limitations

### Current Limitations

1. **Hardcoded Bristol Geometry** (🔴 Priority: HIGH)
   - `TrackGenerator.generate_centerline()` has hardcoded coordinates
   - **Blocker:** Cannot create other tracks until this is fixed
   - **Fix:** Phase 1 - Parametric generation

2. **No Progressive Banking** (🟡 Priority: MEDIUM)
   - Bristol should have 24-30° progressive banking
   - Currently uses constant 26°
   - **Fix:** Phase 1 - Progressive banking calculation

3. **Single Track Support** (🔴 Priority: HIGH)
   - Only Bristol implemented
   - No track selection system
   - **Fix:** Phase 1 - Multi-track loading

### Technical Debt

- No automated tests for track geometry
- No validation system for track data
- No documentation for track data schema
- Manual JSON editing required (no visual editor)

---

## Future Enhancements (Post-MVP)

### Phase 4+ Features

**Advanced Track Types:**
- Road courses (left + right turns, elevation)
- Rovals (oval + infield road course hybrid)
- Dirt tracks (different surface physics)

**Advanced Features:**
- Weather-affected surfaces (rain, wet patches)
- Track temperature variation (hot spots affect grip)
- Rubber buildup simulation (groove gets faster over race)
- Track deterioration (surface breaks down over race)

**Editor Enhancements:**
- Spline-based curve editing (visual curve adjustment)
- Elevation profile editor (road courses)
- Track lighting system (day/night racing)
- Scenery placement tools (grandstands, signs, trees)

**Testing Tools:**
- AI test car that drives full laps
- Lap time comparison (expected vs actual)
- Physics validation (no stuck points, consistent grip)
- Performance profiling (FPS, memory, draw calls)

---

## Related Documentation

- **CONTRACTS.md** - Track data interfaces and schema
- **TASKS.md** - Phase 1-3 implementation tasks
- **EXAMPLES.md** - Validation scenarios and test tracks
- **REFERENCE.md** - NASCAR track specifications and formulas

---

## Maintenance

**Update Triggers:**
- New track type added (update track type section)
- Banking calculation changed (update banking system section)
- Editor plugin features added (update components section)
- Physics integration changed (update integration section)

**Review Schedule:**
- After each phase completion
- When requirements change
- When NASCAR spec data updates

---

**Last Reviewed:** 2025-11-17
**Next Review:** After Phase 1 completion (generalized track generation)
