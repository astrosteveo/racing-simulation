# Track Builder Contracts

**Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** 🟡 In Progress

---

## Overview

This document defines all interfaces, data schemas, and contracts for the Track Builder system. These schemas define how track data is structured in JSON files and how it's processed by the track generation system.

**Related Files:**
- `client/data/tracks/*.json` - Track data files using these schemas
- `client/scripts/resources/track_resource.gd` - GDScript Resource implementation
- `client/scripts/track_generator.gd` - Consumes track data
- `client/scripts/track_mesh_builder.gd` - Generates meshes from data

---

## Track Data Schema (JSON)

### Root Track Object

The top-level structure for all track definition files.

```json
{
  "id": "string",
  "name": "string",
  "nickname": "string (optional)",
  "length": number,
  "type": "short_oval" | "intermediate_oval" | "superspeedway" | "tri_oval" | "quad_oval" | "road_course",
  "trackWidth": number,
  "surface": "asphalt" | "concrete" | "dirt",
  "baseGrip": number,
  "difficulty": number,
  "raceLaps": number,

  "banking": BankingConfig,
  "sections": [SectionData, ...],
  "surfaceZones": [SurfaceZone, ...] (optional),
  "pitRoad": PitRoadData (optional),
  "markers": MarkersData (optional),
  "safetyFeatures": SafetyFeatures (optional)
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique track identifier (lowercase, no spaces) |
| `name` | string | ✅ | Full track name (e.g., "Bristol Motor Speedway") |
| `nickname` | string | ❌ | Track nickname (e.g., "The Last Great Colosseum") |
| `length` | number | ✅ | Track length in miles |
| `type` | enum | ✅ | Track type classification |
| `trackWidth` | number | ✅ | Racing surface width in feet |
| `surface` | enum | ✅ | Primary surface material |
| `baseGrip` | number | ✅ | Base grip coefficient (0.0 - 1.0) |
| `difficulty` | number | ✅ | Difficulty rating (1-10) for career progression |
| `raceLaps` | number | ✅ | Standard race length in laps |

**Validation Rules:**
- `id`: Must be lowercase alphanumeric + hyphens only
- `length`: Must be > 0.0 (typically 0.5 - 3.0 miles)
- `trackWidth`: Must be 30-70 feet (NASCAR standard)
- `baseGrip`: Must be 0.0 - 1.0
- `difficulty`: Must be 1-10 integer
- `raceLaps`: Must be > 0

---

### BankingConfig

Defines how banking is applied to track sections.

```json
{
  "type": "constant" | "progressive" | "variable",

  // For constant banking (single angle everywhere)
  "angle": number,

  // For progressive banking (varies across track width)
  "turns": {
    "inner": number,
    "outer": number,
    "transitionType": "linear" | "cubic" | "ease_in_out"
  },
  "straights": {
    "inner": number,
    "outer": number
  }
}
```

**Banking Types:**

#### Constant Banking
```json
{"type": "constant", "angle": 12.0}
```
- Single banking angle for all track positions
- Use case: Simple tracks (Martinsville: 12°)

#### Progressive Banking
```json
{
  "type": "progressive",
  "turns": {"inner": 24.0, "outer": 30.0, "transitionType": "linear"},
  "straights": {"inner": 6.0, "outer": 10.0}
}
```
- Banking varies across track width (higher on outside)
- Use case: Most modern NASCAR tracks (Bristol: 24-30°)
- `transitionType` determines interpolation curve

**Validation Rules:**
- Banking angles: 0° - 35° (NASCAR maximum)
- `outer` must be >= `inner`
- Transition type must match implementation

---

### SectionData

Defines a single section of track geometry.

```json
{
  "type": "turn" | "straight" | "tri_oval_transition" | "tri_oval_peak",
  "name": "string",
  "length": number (for straights, in feet),
  "radius": number (for turns, in feet),
  "arcAngle": number (for turns, in degrees),
  "centerPoint": {"x": number, "y": number} (for turns),
  "startAngle": number (optional),
  "endAngle": number (optional),
  "banking": BankingOverride (optional),
  "transitionIn": TransitionData (optional),
  "transitionOut": TransitionData (optional),
  "surfaceGrip": number (optional)
}
```

**Section Types:**

#### Turn Section
```json
{
  "type": "turn",
  "name": "Turn 1-2",
  "radius": 250,
  "arcAngle": 180,
  "centerPoint": {"x": 0, "y": 0},
  "startAngle": 0,
  "endAngle": 180,
  "banking": {"type": "progressive", "inner": 24, "outer": 30},
  "surfaceGrip": 0.95
}
```

#### Straight Section
```json
{
  "type": "straight",
  "name": "Backstretch",
  "length": 700,
  "banking": {"type": "constant", "angle": 8.0},
  "transitionIn": {"type": "linear", "distance": 50},
  "transitionOut": {"type": "linear", "distance": 50},
  "surfaceGrip": 0.95
}
```

**Validation Rules:**
- Turn sections: `radius` > 0, `arcAngle` 0-360°
- Straight sections: `length` > 0
- Total section arc angles should sum to ~360° for closed loop
- Banking overrides must match BankingConfig schema

---

### TransitionData

Defines how banking transitions between sections.

```json
{
  "type": "linear" | "cubic" | "ease_in" | "ease_out" | "ease_in_out",
  "distance": number
}
```

**Fields:**
- `type`: Interpolation curve for banking transition
- `distance`: Length of transition zone in feet

**Use Case:** Smooth banking changes from straight (8°) to turn (28°)

---

### SurfaceZone

Defines different surface types across track width.

```json
{
  "name": "string",
  "lateralPosition": number,
  "width": number,
  "grip": number,
  "texture": "string"
}
```

**Example:**
```json
{
  "name": "racing_groove",
  "lateralPosition": 0.5,
  "width": 15.0,
  "grip": 0.95,
  "texture": "asphalt_worn"
}
```

**Common Zones:**
- **Racing Groove**: `grip: 0.95`, mid-track, high rubber buildup
- **Apron**: `grip: 0.85`, inside, lower banking
- **Marbles**: `grip: 0.70`, outside, debris and dust

**Validation Rules:**
- `lateralPosition`: 0.0 (inside) to 1.0 (outside)
- `width`: > 0, sum of widths should not exceed `trackWidth`
- `grip`: 0.0 - 1.0

---

### PitRoadData

Defines pit road layout and characteristics.

```json
{
  "entryPoint": {"section": number, "distance": number},
  "exitPoint": {"section": number, "distance": number},
  "length": number,
  "width": number,
  "stallCount": number,
  "stallLength": number,
  "speedLimit": number,
  "surface": "asphalt" | "concrete",
  "grip": number
}
```

**Example:**
```json
{
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
```

**Field Descriptions:**
- `entryPoint`/`exitPoint`: Location on track where pit road begins/ends
  - `section`: Index in sections array
  - `distance`: Feet along that section
- `length`: Total pit road length in feet
- `width`: Pit road width in feet
- `stallCount`: Number of pit stalls (typically 40-43)
- `stallLength`: Length of each pit box in feet
- `speedLimit`: Pit road speed limit in mph
- `surface`: Material type
- `grip`: Grip coefficient for pit road surface

**Validation Rules:**
- Entry/exit points must reference valid sections
- `stallCount * stallLength` should be <= `length`
- `speedLimit`: 35-55 mph (NASCAR typical)

---

### MarkersData

Defines track markers for timing and navigation.

```json
{
  "startFinish": {"section": number, "distance": number},
  "sectors": [
    {"name": "string", "section": number, "distance": number},
    ...
  ]
}
```

**Example:**
```json
{
  "startFinish": {"section": 1, "distance": 350},
  "sectors": [
    {"name": "Sector 1", "section": 0, "distance": 220},
    {"name": "Sector 2", "section": 1, "distance": 350},
    {"name": "Sector 3", "section": 2, "distance": 220}
  ]
}
```

**Use Case:**
- Start/finish line for lap counting
- Sector splits for timing comparison

---

### SafetyFeatures

Defines walls, barriers, and safety equipment.

```json
{
  "walls": {
    "height": number,
    "type": "concrete" | "safer_barrier" | "steel"
  },
  "catchFence": {
    "height": number,
    "sections": ["string", ...]
  }
}
```

**Example:**
```json
{
  "walls": {
    "height": 15.0,
    "type": "safer_barrier"
  },
  "catchFence": {
    "height": 22.0,
    "sections": ["turn1", "turn2", "frontstretch"]
  }
}
```

---

## GDScript Resource Contract

### TrackResource Class

GDScript Resource class for type-safe track data handling.

**File:** `client/scripts/resources/track_resource.gd`

```gdscript
class_name TrackResource
extends Resource

## Track metadata
@export var id: String
@export var track_name: String
@export var nickname: String
@export var length: float
@export var track_type: String
@export var track_width: float
@export var surface: String
@export var base_grip: float
@export var difficulty: int
@export var race_laps: int

## Banking configuration
@export var banking_config: Dictionary

## Track sections
@export var sections: Array[Dictionary]

## Optional features
@export var surface_zones: Array[Dictionary]
@export var pit_road: Dictionary
@export var markers: Dictionary
@export var safety_features: Dictionary

## Validation
func validate() -> bool:
    """Validate track data integrity"""
    if id.is_empty() or track_name.is_empty():
        return false
    if length <= 0.0 or track_width <= 0.0:
        return false
    if sections.is_empty():
        return false
    return true

## Helper methods
func get_total_centerline_length() -> float:
    """Calculate total centerline length in feet"""
    pass

func get_section_at_distance(distance: float) -> Dictionary:
    """Find which section contains a given distance along centerline"""
    pass

func get_section_at_progress(progress: float) -> Dictionary:
    """Find which section contains a given lap progress (0.0 - 1.0)"""
    pass
```

**Factory Method:**
```gdscript
static func from_json(json_path: String) -> TrackResource:
    """Load track data from JSON file"""
    var file = FileAccess.open(json_path, FileAccess.READ)
    if not file:
        return null

    var json_string = file.get_as_text()
    var json = JSON.new()
    var parse_result = json.parse(json_string)

    if parse_result != OK:
        return null

    var data = json.get_data()
    var resource = TrackResource.new()

    # Map JSON to resource properties
    resource.id = data.get("id", "")
    resource.track_name = data.get("name", "")
    resource.nickname = data.get("nickname", "")
    resource.length = data.get("length", 0.0)
    resource.track_type = data.get("type", "")
    resource.track_width = data.get("trackWidth", 40.0)
    resource.surface = data.get("surface", "asphalt")
    resource.base_grip = data.get("baseGrip", 0.9)
    resource.difficulty = data.get("difficulty", 5)
    resource.race_laps = data.get("raceLaps", 100)

    resource.banking_config = data.get("banking", {})
    resource.sections = data.get("sections", [])
    resource.surface_zones = data.get("surfaceZones", [])
    resource.pit_road = data.get("pitRoad", {})
    resource.markers = data.get("markers", {})
    resource.safety_features = data.get("safetyFeatures", {})

    return resource
```

---

## Track Generator Interface

### TrackGenerator Class

**File:** `client/scripts/track_generator.gd`

```gdscript
class_name TrackGenerator
extends RefCounted

## Generate centerline points from track data
static func generate_centerline(track_data: Dictionary) -> Array[Vector3]:
    """
    Converts track section data into 3D centerline points.

    Parameters:
        track_data: Dictionary containing 'sections' array

    Returns:
        Array of Vector3 points forming track centerline
    """
    pass

## Generate track geometry for a section
static func generate_section_geometry(section: Dictionary, start_progress: float) -> Array:
    """
    Generate geometry for a single track section.

    Parameters:
        section: Section data dictionary
        start_progress: Starting lap progress (0.0 - 1.0)

    Returns:
        Array of {position: Vector3, tangent: Vector3, normal: Vector3, progress: float}
    """
    pass

## Calculate banking angle at position
static func calculate_banking(
    section: Dictionary,
    lateral_position: float,
    longitudinal_progress: float
) -> float:
    """
    Calculate banking angle for a specific position.

    Parameters:
        section: Section data with banking config
        lateral_position: Position across track width (0.0 = inside, 1.0 = outside)
        longitudinal_progress: Progress along section (0.0 - 1.0)

    Returns:
        Banking angle in degrees
    """
    pass
```

**Track Type Generators:**
```gdscript
## Generate simple oval (2 turns, 2 straights)
static func generate_oval(
    radius: float,
    straight_length: float,
    turn_banking: float,
    straight_banking: float
) -> Dictionary:
    """Returns track data dictionary for simple oval"""
    pass

## Generate tri-oval (Daytona-style)
static func generate_tri_oval(
    turn_radius: float,
    backstretch_length: float,
    tri_oval_height: float,
    banking_config: Dictionary
) -> Dictionary:
    """Returns track data dictionary for tri-oval"""
    pass
```

---

## Track Mesh Builder Interface

### TrackMeshBuilder Class

**File:** `client/scripts/track_mesh_builder.gd`

```gdscript
class_name TrackMeshBuilder
extends RefCounted

## Build complete track mesh from centerline
static func build_track_mesh(
    centerline: Array[Vector3],
    track_data: Dictionary
) -> Mesh:
    """
    Create track surface mesh with proper banking and UVs.

    Parameters:
        centerline: Array of centerline points
        track_data: Track configuration

    Returns:
        ArrayMesh with track surface geometry
    """
    pass

## Build wall meshes
static func build_walls(
    centerline: Array[Vector3],
    track_width: float,
    wall_height: float
) -> Array[Mesh]:
    """
    Create inner and outer wall meshes.

    Returns:
        [inner_wall_mesh, outer_wall_mesh]
    """
    pass

## Build collision shape
static func build_collision_shape(
    centerline: Array[Vector3],
    track_data: Dictionary
) -> ConcavePolygonShape3D:
    """
    Create trimesh collision shape for track surface.
    """
    pass

## Build pit road mesh
static func build_pit_road(
    centerline: Array[Vector3],
    pit_data: Dictionary
) -> Mesh:
    """
    Create pit road geometry parallel to track.
    """
    pass
```

---

## Track Position Calculator Interface

### TrackPositionCalculator Class

**File:** `client/scripts/track_position_calculator.gd`

```gdscript
class_name TrackPositionCalculator
extends RefCounted

## Get 3D position from lap progress
static func get_position_at_progress(
    progress: float,
    track_data: Dictionary,
    lateral_offset: float = 0.0
) -> Transform3D:
    """
    Calculate car position and rotation from lap progress.

    Parameters:
        progress: Lap progress (0.0 - 1.0)
        track_data: Track definition
        lateral_offset: Offset from centerline in feet (-trackWidth/2 to +trackWidth/2)

    Returns:
        Transform3D with position and rotation for car placement
    """
    pass

## Get progress from 3D position (reverse calculation)
static func get_progress_from_position(
    position: Vector3,
    track_data: Dictionary
) -> float:
    """
    Find lap progress for a given 3D position (nearest point on centerline).

    Returns:
        Lap progress (0.0 - 1.0)
    """
    pass

## Get track surface normal at position
static func get_surface_normal(
    progress: float,
    lateral_offset: float,
    track_data: Dictionary
) -> Vector3:
    """
    Calculate surface normal vector for banking.
    """
    pass
```

---

## Track Validator Interface

### TrackValidator Class

**File:** `client/scripts/track_validator.gd`

```gdscript
class_name TrackValidator
extends RefCounted

class ValidationResult:
    var is_valid: bool
    var errors: Array[String]
    var warnings: Array[String]

## Validate complete track data
static func validate_track(track_data: Dictionary) -> ValidationResult:
    """
    Perform all validation checks on track data.
    """
    var result = ValidationResult.new()
    result.is_valid = true
    result.errors = []
    result.warnings = []

    # Run all validation checks
    _validate_metadata(track_data, result)
    _validate_sections(track_data, result)
    _validate_banking(track_data, result)
    _validate_geometry_continuity(track_data, result)
    _validate_length_accuracy(track_data, result)

    return result

## Validate geometry has no gaps
static func validate_geometry_continuity(
    centerline: Array[Vector3]
) -> ValidationResult:
    """Check that centerline forms a continuous closed loop"""
    pass

## Validate banking angles are in valid range
static func validate_banking(track_data: Dictionary) -> ValidationResult:
    """Check all banking angles are 0-35 degrees"""
    pass

## Validate calculated length matches specification
static func validate_length_accuracy(
    centerline: Array[Vector3],
    expected_length: float,
    tolerance: float = 0.01
) -> ValidationResult:
    """Check that generated track length matches spec within tolerance"""
    pass
```

---

## Example Track Data Files

### Bristol Motor Speedway (Complete)

**File:** `client/data/tracks/bristol.json`

```json
{
  "id": "bristol",
  "name": "Bristol Motor Speedway",
  "nickname": "The Last Great Colosseum",
  "length": 0.533,
  "type": "short_oval",
  "trackWidth": 40.0,
  "surface": "concrete",
  "baseGrip": 0.95,
  "difficulty": 8,
  "raceLaps": 500,

  "banking": {
    "type": "progressive",
    "turns": {
      "inner": 24.0,
      "outer": 30.0,
      "transitionType": "linear"
    },
    "straights": {
      "inner": 6.0,
      "outer": 10.0
    }
  },

  "sections": [
    {
      "type": "turn",
      "name": "Turn 1-2",
      "radius": 250,
      "arcAngle": 180,
      "centerPoint": {"x": 0, "y": 0},
      "startAngle": 0,
      "endAngle": 180,
      "surfaceGrip": 0.95
    },
    {
      "type": "straight",
      "name": "Backstretch",
      "length": 700,
      "transitionIn": {"type": "linear", "distance": 50},
      "transitionOut": {"type": "linear", "distance": 50},
      "surfaceGrip": 0.95
    },
    {
      "type": "turn",
      "name": "Turn 3-4",
      "radius": 250,
      "arcAngle": 180,
      "centerPoint": {"x": 0, "y": -500},
      "startAngle": 180,
      "endAngle": 360,
      "surfaceGrip": 0.95
    },
    {
      "type": "straight",
      "name": "Frontstretch",
      "length": 700,
      "transitionIn": {"type": "linear", "distance": 50},
      "transitionOut": {"type": "linear", "distance": 50},
      "surfaceGrip": 0.95
    }
  ],

  "surfaceZones": [
    {
      "name": "racing_groove",
      "lateralPosition": 0.5,
      "width": 15.0,
      "grip": 0.95,
      "texture": "concrete_worn"
    },
    {
      "name": "apron",
      "lateralPosition": 0.0,
      "width": 10.0,
      "grip": 0.85,
      "texture": "concrete_clean"
    }
  ],

  "pitRoad": {
    "entryPoint": {"section": 1, "distance": 600},
    "exitPoint": {"section": 3, "distance": 100},
    "length": 800,
    "width": 45.0,
    "stallCount": 40,
    "stallLength": 18.0,
    "speedLimit": 45.0,
    "surface": "concrete",
    "grip": 0.9
  },

  "markers": {
    "startFinish": {"section": 3, "distance": 350},
    "sectors": [
      {"name": "Sector 1", "section": 0, "distance": 220},
      {"name": "Sector 2", "section": 1, "distance": 350},
      {"name": "Sector 3", "section": 2, "distance": 220}
    ]
  },

  "safetyFeatures": {
    "walls": {
      "height": 15.0,
      "type": "safer_barrier"
    },
    "catchFence": {
      "height": 22.0,
      "sections": ["turn1", "turn2", "frontstretch"]
    }
  }
}
```

---

## Validation Rules Summary

| Rule | Check | Valid Range | Error Type |
|------|-------|-------------|------------|
| Track ID | Unique, lowercase, alphanumeric + hyphens | - | Error |
| Track Length | Positive number | 0.25 - 5.0 miles | Error |
| Track Width | NASCAR standard | 30 - 70 feet | Warning |
| Banking Angle | NASCAR maximum | 0 - 35 degrees | Error |
| Section Count | Closed loop | >= 2 sections | Error |
| Geometry Continuity | No gaps | < 1 foot gap tolerance | Error |
| Length Accuracy | Matches spec | Within 1% of specified length | Warning |
| Pit Road | Valid placement | Entry/exit reference valid sections | Error |

---

## Change Log

### Version 1.0 (2025-11-17)
- Initial schema definition
- Bristol track example
- Complete interface definitions
- Validation rules established

---

**Maintenance:** Update when new track types, banking modes, or features are added
**Review Schedule:** After each phase completion
