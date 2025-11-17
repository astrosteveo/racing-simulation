# Track Builder Examples

**Version:** 1.0
**Last Updated:** 2025-11-17
**Purpose:** Validation targets, test scenarios, and expected outcomes for track builder system

---

## Overview

This document provides concrete examples for validating the track builder system. Each example includes expected inputs, outputs, and acceptance criteria based on real NASCAR track data.

**Use Cases:**
- Validate track generation accuracy
- Test track editor functionality
- Verify physics integration
- Benchmark performance

---

## Example 1: Bristol Motor Speedway (Simple Oval)

### Track Specifications

**Real-World Data:**
- Length: 0.533 miles (2814 feet)
- Type: Short track oval
- Banking: 24-30° progressive in turns, 6-10° in straights
- Width: 40 feet
- Surface: Concrete
- Turn Radius: ~250 feet
- Straight Length: ~700 feet each

### Expected JSON Structure

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
      "surfaceGrip": 0.95
    },
    {
      "type": "straight",
      "name": "Backstretch",
      "length": 700,
      "surfaceGrip": 0.95
    },
    {
      "type": "turn",
      "name": "Turn 3-4",
      "radius": 250,
      "arcAngle": 180,
      "centerPoint": {"x": 0, "y": -500},
      "surfaceGrip": 0.95
    },
    {
      "type": "straight",
      "name": "Frontstretch",
      "length": 700,
      "surfaceGrip": 0.95
    }
  ]
}
```

### Expected Generated Geometry

**Centerline Points:**
- Total Points: 60-80 (sufficient for smooth curves)
- Point Spacing: ~35-47 feet between points
- Closure Error: < 1 foot (start and end points nearly coincident)

**Turn Geometry:**
- Turn 1-2: 180° arc, radius 250', center at (0, 0)
- Turn 3-4: 180° arc, radius 250', center at (0, -500)
- Arc length per turn: π × 250 = ~785 feet each

**Straight Geometry:**
- Backstretch: 700' connecting turn 1-2 exit to turn 3-4 entry
- Frontstretch: 700' connecting turn 3-4 exit to turn 1-2 entry
- Total straight length: 1400 feet

**Total Calculated Length:**
- Turn arc lengths: 2 × 785' = 1570 feet
- Straight lengths: 1400 feet
- Total: 2970 feet = 0.563 miles
- **ERROR:** 5.6% over specification!

**Issue Identified:** Simple calculation overestimates. Need to account for:
- Banking reduces effective length
- Turns may not be full 180° arcs (transitions exist)
- Centerline vs racing line

**Corrected Calculation:**
- Target: 0.533 miles = 2814 feet
- Turn arcs (adjusted): 2 × 660 feet = 1320 feet
- Straights: 2 × 747 feet = 1494 feet
- Total: 2814 feet ✓

### Validation Tests

#### Test 1.1: Track Length Accuracy
```gdscript
func test_bristol_length_accuracy():
    var track = TrackResource.from_json("res://data/tracks/bristol.json")
    var centerline = TrackGenerator.generate_centerline(track.sections)

    var total_length = 0.0
    for i in range(centerline.size() - 1):
        total_length += centerline[i].distance_to(centerline[i + 1])

    var expected_feet = 0.533 * 5280  # 2814 feet
    var tolerance = expected_feet * 0.01  # 1% tolerance
    var error = abs(total_length - expected_feet)

    assert(error < tolerance, "Bristol length error: %.2f feet (%.2f%%)" % [error, (error / expected_feet) * 100])
```

**Expected Result:** ✅ Pass (error < 28 feet)

#### Test 1.2: Progressive Banking
```gdscript
func test_bristol_progressive_banking():
    var track = TrackResource.from_json("res://data/tracks/bristol.json")
    var turn_section = track.sections[0]  # Turn 1-2

    var inner_banking = TrackGenerator.calculate_banking(turn_section, 0.0, 0.5)
    var mid_banking = TrackGenerator.calculate_banking(turn_section, 0.5, 0.5)
    var outer_banking = TrackGenerator.calculate_banking(turn_section, 1.0, 0.5)

    assert(abs(inner_banking - 24.0) < 0.1, "Inner banking should be 24°")
    assert(abs(mid_banking - 27.0) < 0.5, "Mid banking should be ~27°")
    assert(abs(outer_banking - 30.0) < 0.1, "Outer banking should be 30°")
```

**Expected Result:** ✅ Pass (banking interpolates correctly)

#### Test 1.3: Geometry Continuity
```gdscript
func test_bristol_geometry_continuity():
    var track = TrackResource.from_json("res://data/tracks/bristol.json")
    var centerline = TrackGenerator.generate_centerline(track.sections)

    # Check closure (start and end points should be very close)
    var closure_gap = centerline[0].distance_to(centerline[centerline.size() - 1])
    assert(closure_gap < 1.0, "Track doesn't close: gap of %.2f feet" % closure_gap)

    # Check for large gaps between consecutive points
    for i in range(centerline.size() - 1):
        var segment_length = centerline[i].distance_to(centerline[i + 1])
        assert(segment_length < 100.0, "Large gap at segment %d: %.2f feet" % [i, segment_length])
        assert(segment_length > 1.0, "Duplicate point at segment %d" % i)
```

**Expected Result:** ✅ Pass (continuous closed loop)

### Performance Targets

| Metric | Target | Tolerance | Current |
|--------|--------|-----------|---------|
| Track Length | 0.533 miles | ± 1% | To be measured |
| Centerline Points | 60-80 | N/A | To be measured |
| Generation Time | < 200ms | N/A | To be measured |
| Mesh Triangles | < 5000 | N/A | To be measured |
| Memory Usage | < 10MB | N/A | To be measured |

---

## Example 2: Martinsville Speedway (Flat Paper-Clip Oval)

### Track Specifications

**Real-World Data:**
- Length: 0.526 miles (2777 feet)
- Type: Short track, paper-clip shape
- Banking: 12° in turns (flat by NASCAR standards), 0° in straights
- Width: 40 feet
- Surface: Asphalt
- Turn Radius: ~100 feet (very tight hairpins)
- Straight Length: ~800 feet each

**Unique Characteristics:**
- Flattest NASCAR track (only 12° banking)
- Tightest turns (100' radius vs Bristol's 250')
- Asymmetric layout (paper-clip shape)
- Longest straights relative to track size

### Expected JSON Structure

```json
{
  "id": "martinsville",
  "name": "Martinsville Speedway",
  "nickname": "The Paperclip",
  "length": 0.526,
  "type": "short_oval",
  "trackWidth": 40.0,
  "surface": "asphalt",
  "baseGrip": 0.90,
  "difficulty": 5,
  "raceLaps": 500,

  "banking": {
    "type": "constant",
    "turns": {"angle": 12.0},
    "straights": {"angle": 0.0}
  },

  "sections": [
    {
      "type": "turn",
      "name": "Turn 1",
      "radius": 100,
      "arcAngle": 90,
      "centerPoint": {"x": -400, "y": 0},
      "banking": {"type": "constant", "angle": 12.0},
      "surfaceGrip": 0.88
    },
    {
      "type": "straight",
      "name": "Backstretch",
      "length": 800,
      "banking": {"type": "constant", "angle": 0.0},
      "surfaceGrip": 0.90
    },
    {
      "type": "turn",
      "name": "Turn 2",
      "radius": 100,
      "arcAngle": 90,
      "centerPoint": {"x": 400, "y": 0},
      "banking": {"type": "constant", "angle": 12.0},
      "surfaceGrip": 0.88
    },
    {
      "type": "straight",
      "name": "Frontstretch",
      "length": 800,
      "banking": {"type": "constant", "angle": 0.0},
      "surfaceGrip": 0.90
    }
  ]
}
```

### Expected Generated Geometry

**Centerline Calculation:**
- Turn 1: 90° arc, radius 100', arc length = (90/360) × 2π × 100 = 157 feet
- Backstretch: 800 feet
- Turn 2: 90° arc, radius 100', arc length = 157 feet
- Frontstretch: 800 feet
- **Total:** 157 + 800 + 157 + 800 = 1914 feet = 0.363 miles

**Issue:** Way too short! Need to adjust.

**Corrected Geometry:**
- Target: 0.526 miles = 2777 feet
- Turn arcs: 2 × (180° at 100' radius) = 2 × 314 feet = 628 feet
- Straights: (2777 - 628) / 2 = 1075 feet each
- **Total:** 2777 feet ✓

**Updated Sections:**
- Turn 1: 180° hairpin (not 90°!)
- Turn 2: 180° hairpin
- Straights: 1075' each

### Validation Tests

#### Test 2.1: Tight Turns (Small Radius)
```gdscript
func test_martinsville_tight_turns():
    var track = TrackResource.from_json("res://data/tracks/martinsville.json")
    var turn = track.sections[0]

    assert(turn.radius == 100, "Turn radius should be 100 feet")
    assert(turn.arcAngle == 180, "Turn should be 180° hairpin")

    # Verify turn geometry is tighter than Bristol
    var bristol = TrackResource.from_json("res://data/tracks/bristol.json")
    assert(turn.radius < bristol.sections[0].radius, "Martinsville turns should be tighter")
```

**Expected Result:** ✅ Pass (tight hairpins generated)

#### Test 2.2: Flat Banking
```gdscript
func test_martinsville_flat_banking():
    var track = TrackResource.from_json("res://data/tracks/martinsville.json")

    var turn_banking = TrackGenerator.calculate_banking(track.sections[0], 0.5, 0.5)
    var straight_banking = TrackGenerator.calculate_banking(track.sections[1], 0.5, 0.5)

    assert(abs(turn_banking - 12.0) < 0.1, "Turn banking should be 12°")
    assert(abs(straight_banking - 0.0) < 0.1, "Straight banking should be 0°")
```

**Expected Result:** ✅ Pass (flat banking)

---

## Example 3: Daytona International Speedway (Tri-Oval)

### Track Specifications

**Real-World Data:**
- Length: 2.5 miles (13,200 feet)
- Type: Superspeedway, tri-oval
- Banking: 31° in turns (very high), 18° in tri-oval peak
- Width: 40 feet
- Surface: Asphalt
- Turn Radius: ~1000 feet (large, sweeping turns)

**Unique Characteristics:**
- Tri-oval frontstretch (3 turns instead of 2)
- Highest banking at Turn 1 and Turn 4 (31°)
- Peak banking in tri-oval section (18°)
- Very high speeds (200+ mph)

### Expected JSON Structure (Simplified)

```json
{
  "id": "daytona",
  "name": "Daytona International Speedway",
  "nickname": "The World Center of Racing",
  "length": 2.5,
  "type": "superspeedway",
  "trackWidth": 40.0,
  "surface": "asphalt",
  "baseGrip": 0.92,
  "difficulty": 9,
  "raceLaps": 200,

  "banking": {
    "type": "constant"
  },

  "sections": [
    {
      "type": "turn",
      "name": "Turn 1",
      "radius": 1000,
      "arcAngle": 90,
      "banking": {"type": "constant", "angle": 31.0}
    },
    {
      "type": "straight",
      "name": "Backstretch",
      "length": 3000,
      "banking": {"type": "constant", "angle": 2.0}
    },
    {
      "type": "turn",
      "name": "Turn 2",
      "radius": 1000,
      "arcAngle": 90,
      "banking": {"type": "constant", "angle": 31.0}
    },
    {
      "type": "tri_oval_transition",
      "name": "Turn 3",
      "radius": 800,
      "arcAngle": 45,
      "banking": {"type": "constant", "angle": 31.0}
    },
    {
      "type": "tri_oval_peak",
      "name": "Tri-Oval Peak",
      "length": 2000,
      "banking": {"type": "constant", "angle": 18.0}
    },
    {
      "type": "tri_oval_transition",
      "name": "Turn 4",
      "radius": 800,
      "arcAngle": 45,
      "banking": {"type": "constant", "angle": 31.0}
    },
    {
      "type": "straight",
      "name": "Frontstretch",
      "length": 1500,
      "banking": {"type": "constant", "angle": 3.0}
    }
  ]
}
```

### Validation Tests

#### Test 3.1: High Banking
```gdscript
func test_daytona_high_banking():
    var track = TrackResource.from_json("res://data/tracks/daytona.json")
    var turn_banking = TrackGenerator.calculate_banking(track.sections[0], 0.5, 0.5)

    assert(abs(turn_banking - 31.0) < 0.1, "Turn banking should be 31°")
    # Highest banking in NASCAR (tied with Talladega 33°)
```

**Expected Result:** ✅ Pass (31° banking)

#### Test 3.2: Tri-Oval Geometry
```gdscript
func test_daytona_tri_oval():
    var track = TrackResource.from_json("res://data/tracks/daytona.json")

    # Should have 7 sections (not 4 like simple oval)
    assert(track.sections.size() == 7, "Tri-oval should have 7 sections")

    # Check for tri-oval peak section
    var has_tri_oval = false
    for section in track.sections:
        if section.type == "tri_oval_peak":
            has_tri_oval = true
            break
    assert(has_tri_oval, "Should have tri-oval peak section")
```

**Expected Result:** ✅ Pass (tri-oval shape)

---

## Example 4: Multi-Track Switching

### Test Scenario

**Objective:** Verify system can switch between tracks without issues

**Test Steps:**
1. Load Bristol track
2. Verify Bristol renders correctly
3. Load Martinsville track
4. Verify Martinsville renders correctly
5. Load Bristol again
6. Verify Bristol still renders correctly
7. Load Daytona track
8. Verify Daytona renders correctly

### Expected Behavior

**Memory Management:**
- Previous track mesh is freed from memory
- No memory leaks (check with Godot profiler)
- Total memory usage < 50MB for any single track

**Performance:**
- Track switch time < 500ms
- No frame drops during switch
- Physics continues to work after switch

### Validation Test

```gdscript
func test_multi_track_switching():
    var tracks = ["bristol", "martinsville", "daytona"]

    for track_id in tracks:
        var track = TrackResource.from_json("res://data/tracks/%s.json" % track_id)
        var centerline = TrackGenerator.generate_centerline(track.sections)
        var mesh = TrackMeshBuilder.build_track_mesh(centerline, track)

        # Verify track loaded
        assert(centerline.size() > 0, "%s: No centerline points" % track_id)
        assert(mesh != null, "%s: Mesh generation failed" % track_id)

        # Verify track length
        var length_miles = track.length
        var calculated_length = _calculate_centerline_length(centerline) / 5280.0
        var error = abs(length_miles - calculated_length) / length_miles
        assert(error < 0.01, "%s: Length error %.2f%%" % [track_id, error * 100])

    # Memory check (manual validation in profiler)
    print("Memory check: See Godot profiler for heap usage")
```

**Expected Result:** ✅ Pass (all tracks switch correctly)

---

## Example 5: Track Editor Workflow

### Test Scenario: Create New Track

**Objective:** Create a simple test track using the editor

**Steps:**
1. Open Track Editor plugin in Godot
2. Click "New Track" button
3. Set parameters:
   - Name: "Test Track"
   - Length: 1.0 miles
   - Type: "short_oval"
   - Width: 40 feet
4. Add 4 sections:
   - Turn: radius 300', arc 180°, banking 20°
   - Straight: length 1000', banking 5°
   - Turn: radius 300', arc 180°, banking 20°
   - Straight: length 1000', banking 5°
5. Preview updates in real-time
6. Save as "test_track.json"
7. Load saved track
8. Verify it matches original

### Expected Behavior

**Real-Time Preview:**
- Preview updates within 100ms of parameter change
- Centerline visible for debugging
- Banking gradient visible (color-coded)

**Save/Load:**
- JSON file is valid and readable
- Load preserves all parameters
- Round-trip save/load is lossless

### Validation

```gdscript
func test_track_editor_workflow():
    # Create track programmatically (simulates editor actions)
    var track_data = {
        "id": "test_track",
        "name": "Test Track",
        "length": 1.0,
        "type": "short_oval",
        "trackWidth": 40.0,
        "surface": "asphalt",
        "baseGrip": 0.90,
        "sections": [
            {"type": "turn", "radius": 300, "arcAngle": 180, "banking": {"type": "constant", "angle": 20}},
            {"type": "straight", "length": 1000, "banking": {"type": "constant", "angle": 5}},
            {"type": "turn", "radius": 300, "arcAngle": 180, "banking": {"type": "constant", "angle": 20}},
            {"type": "straight", "length": 1000, "banking": {"type": "constant", "angle": 5}}
        ]
    }

    # Save to JSON
    var json_string = JSON.stringify(track_data, "\t")
    var file = FileAccess.open("res://data/tracks/test_track.json", FileAccess.WRITE)
    file.store_string(json_string)
    file.close()

    # Load from JSON
    var loaded_track = TrackResource.from_json("res://data/tracks/test_track.json")

    # Verify round-trip
    assert(loaded_track.id == "test_track", "ID mismatch")
    assert(loaded_track.length == 1.0, "Length mismatch")
    assert(loaded_track.sections.size() == 4, "Section count mismatch")
```

**Expected Result:** ✅ Pass (editor workflow functional)

---

## Example 6: Banking Visualization

### Test Scenario

**Objective:** Visualize banking angles with color-coded heatmap

**Color Scheme:**
- 0° (flat): Blue
- 15°: Green
- 25°: Yellow
- 30°+: Red

### Expected Visualization

**Bristol (Progressive Banking):**
- Turn 1-2:
  - Inside edge: Blue-green (24°)
  - Mid-track: Yellow (27°)
  - Outside edge: Orange-red (30°)
- Straights:
  - Inside: Blue (6°)
  - Outside: Green (10°)

**Martinsville (Flat Banking):**
- Turns: Green (12°)
- Straights: Blue (0°)
- Very little color variation

### Validation

```gdscript
func test_banking_visualization():
    var track = TrackResource.from_json("res://data/tracks/bristol.json")
    var centerline = TrackGenerator.generate_centerline(track.sections)

    # Generate banking heatmap (for visualization)
    for i in range(centerline.size()):
        var section_idx = _find_section_at_progress(i / float(centerline.size()))
        var section = track.sections[section_idx]

        # Check inside, middle, outside
        var inside_banking = TrackGenerator.calculate_banking(section, 0.0, 0.5)
        var mid_banking = TrackGenerator.calculate_banking(section, 0.5, 0.5)
        var outside_banking = TrackGenerator.calculate_banking(section, 1.0, 0.5)

        # For Bristol turns, should see progression
        if section.type == "turn":
            assert(inside_banking < mid_banking, "Inside should be less banked")
            assert(mid_banking < outside_banking, "Middle should be less than outside")
```

**Expected Result:** ✅ Pass (banking gradient visible)

---

## Performance Benchmarks

### Target Performance Metrics

| Track | Generation Time | Polygon Count | Memory Usage | FPS (40 cars) |
|-------|-----------------|---------------|--------------|---------------|
| Bristol | < 200ms | < 5,000 | < 10 MB | 60+ |
| Martinsville | < 200ms | < 5,000 | < 10 MB | 60+ |
| Daytona | < 300ms | < 8,000 | < 15 MB | 60+ |

### Measurement Method

```gdscript
func benchmark_track_generation(track_id: String):
    var start_time = Time.get_ticks_msec()

    var track = TrackResource.from_json("res://data/tracks/%s.json" % track_id)
    var centerline = TrackGenerator.generate_centerline(track.sections)
    var mesh = TrackMeshBuilder.build_track_mesh(centerline, track)

    var end_time = Time.get_ticks_msec()
    var duration_ms = end_time - start_time

    print("%s generation time: %d ms" % [track_id, duration_ms])
    print("%s polygon count: %d" % [track_id, mesh.get_surface_count()])
```

---

## Validation Summary

### Critical Success Criteria

| Test | Bristol | Martinsville | Daytona | Status |
|------|---------|--------------|---------|--------|
| Length Accuracy (± 1%) | ✅ | ✅ | ✅ | To validate |
| Banking Correct | ✅ | ✅ | ✅ | To validate |
| Geometry Continuous | ✅ | ✅ | ✅ | To validate |
| No Collisions | ✅ | ✅ | ✅ | To validate |
| Performance (< 500ms gen) | ✅ | ✅ | ✅ | To validate |
| Multi-Track Switching | ✅ | ✅ | ✅ | To validate |

### Test Coverage Goals

- **Phase 1:** 20 validation tests (geometry, banking, length)
- **Phase 2:** 25 editor tests (UI, save/load, preview)
- **Phase 3:** 16 advanced tests (pit road, validation, performance)
- **Total:** 61 validation checkpoints

---

## Known Edge Cases

### Edge Case 1: Very Tight Turns

**Problem:** Martinsville's 100' radius turns may create sharp angles
**Solution:** Increase point density in tight turns (more points = smoother)
**Validation:** Visual inspection + collision testing

### Edge Case 2: Banking Transitions

**Problem:** Sudden banking changes (0° to 30°) cause visual/physics issues
**Solution:** Add transition zones (50-100' gradual change)
**Validation:** Smooth visual gradient + no physics jolts

### Edge Case 3: Track Closure

**Problem:** Floating point errors may prevent perfect closure
**Solution:** Snap last point to first point if < 1 foot apart
**Validation:** Closure gap < 1 foot

---

**Last Updated:** 2025-11-17
**Next Review:** After Phase 1 implementation (validate against real Bristol data)
