class_name TrackGenerator
extends RefCounted

const FEET_TO_METERS = 0.3048
const POINTS_PER_METER = 0.1

class TrackPoint:
	var pos: Vector3
	var tangent: Vector3
	var banking: float
	var section_type: String
	var basis: Basis
	
	func calculate_basis() -> void:
		var up := Vector3.UP
		var right := tangent.cross(up).normalized()
		var normal := right.cross(tangent).normalized()
		
		var bank_rad := deg_to_rad(banking)
		right = right.rotated(tangent, bank_rad)
		normal = normal.rotated(tangent, bank_rad)
		
		basis = Basis(right, normal, tangent)


static func generate_centerline(track_data: Dictionary) -> Array[TrackPoint]:
	var points: Array[TrackPoint] = []
	var track_id: String = track_data.get("id", "bristol")
	
	# Dispatch to track-specific generators
	match track_id:
		"bristol":
			points = generate_bristol_centerline(track_data)
		"martinsville":
			points = generate_martinsville_centerline(track_data)
		_:
			push_error("Unknown track ID: " + track_id)
			return []
	
	calculate_tangents(points)
	return points


static func generate_bristol_centerline(track_data: Dictionary) -> Array[TrackPoint]:
	var points: Array[TrackPoint] = []
	var sections: Array = track_data.sections
	var banking_config: Dictionary = track_data.get("banking", {})

	# Use parametric generation for each section
	for i in range(sections.size()):
		var section: Dictionary = sections[i]
		var skip_first := i > 0  # Skip first point after initial section to avoid duplicates

		if section.type == "turn":
			generate_turn_section(points, section, banking_config, skip_first)
		elif section.type == "transition":
			generate_transition_section(points, section, banking_config, skip_first)
		elif section.type == "straight":
			# For straights, we need better logic than the default
			# Bristol straights connect turns tangentially
			if points.is_empty():
				push_error("Cannot start with a straight section")
				continue

			var length: float = section.get("length", 700.0) * FEET_TO_METERS
			var banking := get_section_banking(section, banking_config, "straight")
			var straight_steps := 15
			var start_idx := 1 if skip_first else 0

			# Get direction from last point's tangent (will be calculated later)
			# For now, use simplified straight generation
			var prev_point: TrackPoint = points[-1]
			var start_pos := prev_point.pos

			# Direction for Bristol: alternates +Z/-Z based on position
			var direction: Vector3
			if abs(start_pos.x) > abs(start_pos.z):
				# On sides: move along Z axis
				direction = Vector3(0, 0, 1) if start_pos.x > 0 else Vector3(0, 0, -1)
			else:
				# On top/bottom: move along X axis
				direction = Vector3(-1, 0, 0) if start_pos.z > 0 else Vector3(1, 0, 0)

			for j in range(start_idx, straight_steps + 1):
				var t := float(j) / straight_steps
				var point := TrackPoint.new()
				point.pos = start_pos + direction * (t * length)
				point.banking = banking
				point.section_type = "straight"
				points.append(point)

	return points


static func generate_martinsville_centerline(track_data: Dictionary) -> Array[TrackPoint]:
	var points: Array[TrackPoint] = []
	var sections: Array = track_data.sections
	var banking_config: Dictionary = track_data.get("banking", {})

	# Use same parametric generation as Bristol
	for i in range(sections.size()):
		var section: Dictionary = sections[i]
		var skip_first := i > 0

		if section.type == "turn":
			generate_turn_section(points, section, banking_config, skip_first)
		elif section.type == "transition":
			generate_transition_section(points, section, banking_config, skip_first)
		elif section.type == "straight":
			if points.is_empty():
				push_error("Cannot start with a straight section")
				continue

			var length: float = section.get("length", 1075.0) * FEET_TO_METERS
			var banking := get_section_banking(section, banking_config, "straight")
			var straight_steps := 15
			var start_idx := 1 if skip_first else 0

			var prev_point: TrackPoint = points[-1]
			var start_pos := prev_point.pos

			# Direction for Martinsville (same logic as Bristol)
			var direction: Vector3
			if abs(start_pos.x) > abs(start_pos.z):
				direction = Vector3(0, 0, 1) if start_pos.x > 0 else Vector3(0, 0, -1)
			else:
				direction = Vector3(-1, 0, 0) if start_pos.z > 0 else Vector3(1, 0, 0)

			for j in range(start_idx, straight_steps + 1):
				var t := float(j) / straight_steps
				var point := TrackPoint.new()
				point.pos = start_pos + direction * (t * length)
				point.banking = banking
				point.section_type = "straight"
				points.append(point)

	return points


static func generate_turn_section(points: Array[TrackPoint], section: Dictionary, banking_config: Dictionary, skip_first: bool) -> void:
	var radius: float = section.get("radius", 250.0) * FEET_TO_METERS
	var center_x: float = section.get("centerPoint", {}).get("x", 0.0) * FEET_TO_METERS
	var center_z: float = section.get("centerPoint", {}).get("y", 0.0) * FEET_TO_METERS
	var start_angle: float = section.get("startAngle", 0.0)
	var end_angle: float = section.get("endAngle", 180.0)
	
	var banking := get_section_banking(section, banking_config, "turn")
	
	var turn_steps := 20
	var start_idx := 1 if skip_first else 0
	
	for i in range(start_idx, turn_steps + 1):
		var t := float(i) / turn_steps
		var angle_deg: float = start_angle + (end_angle - start_angle) * t
		var angle_rad: float = deg_to_rad(angle_deg)
		
		var point := TrackPoint.new()
		point.pos = Vector3(
			center_x + radius * cos(angle_rad),
			0,
			center_z + radius * sin(angle_rad)
		)
		point.banking = banking
		point.section_type = "turn"
		points.append(point)


static func generate_transition_section(points: Array[TrackPoint], section: Dictionary, banking_config: Dictionary, skip_first: bool) -> void:
	var length: float = section.get("length", 75.0) * FEET_TO_METERS
	var from_banking: float = section.get("fromBanking", 0.0)
	var to_banking: float = section.get("toBanking", 0.0)
	var curvature_type: String = section.get("curvature", "linear")

	var transition_steps := 15
	var start_idx := 1 if skip_first else 0

	# Get start position from previous point
	var prev_point: TrackPoint = points[-1] if not points.is_empty() else null
	if prev_point == null:
		push_error("Cannot generate transition section without previous point")
		return

	var start_pos := prev_point.pos

	# Calculate direction from previous tangent
	# For now, use simplified direction calculation
	var direction: Vector3
	if abs(start_pos.x) > abs(start_pos.z):
		# On sides: move along Z axis
		direction = Vector3(0, 0, 1) if start_pos.x > 0 else Vector3(0, 0, -1)
	else:
		# On top/bottom: move along X axis
		direction = Vector3(-1, 0, 0) if start_pos.z > 0 else Vector3(1, 0, 0)

	for i in range(start_idx, transition_steps + 1):
		var t := float(i) / transition_steps

		var point := TrackPoint.new()

		# Position along transition (linear for now)
		point.pos = start_pos + direction * (t * length)

		# Banking interpolation
		# Use ease-in-out for smoother transitions (S-curve)
		var ease_t := t * t * (3.0 - 2.0 * t)  # smoothstep
		point.banking = from_banking + (to_banking - from_banking) * ease_t

		point.section_type = "transition"
		points.append(point)


static func generate_straight_section(points: Array[TrackPoint], section: Dictionary, banking_config: Dictionary, skip_first: bool) -> void:
	var length: float = section.get("length", 700.0) * FEET_TO_METERS
	var banking := get_section_banking(section, banking_config, "straight")
	
	var straight_steps := 15
	var start_idx := 1 if skip_first else 0
	
	# Get start position from previous point
	var prev_point: TrackPoint = points[-1] if not points.is_empty() else null
	if prev_point == null:
		push_error("Cannot generate straight section without previous point")
		return
	
	var start_pos := prev_point.pos
	
	# Calculate direction: straights connect tangentially from previous point
	# Use the tangent direction from the last point (perpendicular to radius at turn exit)
	# For simplicity, calculate direction as normalized vector in XZ plane
	
	# Simple heuristic: direction is perpendicular to line from track center to current position
	# For Bristol: alternates between +X and -X movement with +Z or -Z component
	var to_prev := start_pos - Vector3.ZERO  # Vector from origin to previous point
	var direction := Vector3(to_prev.z, 0, -to_prev.x).normalized()  # Perpendicular in XZ plane
	
	# If direction is near zero, use fallback based on position
	if direction.length_squared() < 0.01:
		if abs(start_pos.x) > abs(start_pos.z):
			direction = Vector3(0, 0, 1) if start_pos.x > 0 else Vector3(0, 0, -1)
		else:
			direction = Vector3(-1, 0, 0) if start_pos.z > 0 else Vector3(1, 0, 0)
	
	for i in range(start_idx, straight_steps + 1):
		var t := float(i) / straight_steps
		
		var point := TrackPoint.new()
		point.pos = start_pos + direction * (t * length)
		point.banking = banking
		point.section_type = "straight"
		points.append(point)


static func get_section_banking(section: Dictionary, banking_config: Dictionary, section_type: String) -> float:
	# Check if section has explicit banking first
	if section.has("banking"):
		return section.banking
	
	# Otherwise use banking_config
	var banking_type: String = banking_config.get("type", "constant")
	
	match banking_type:
		"progressive":
			# For now, use middle value of progressive banking
			# TODO: Implement per-vertex progressive banking in mesh builder
			var config_section: Variant = banking_config.get("turns" if section_type == "turn" else "straights", {})
			if config_section is Dictionary:
				var inner: float = config_section.get("inner", 0.0)
				var outer: float = config_section.get("outer", 0.0)
				return (inner + outer) / 2.0  # Average for centerline
			return 0.0
		"constant":
			var config_section: Variant = banking_config.get("turns" if section_type == "turn" else "straights", {})
			if config_section is Dictionary:
				return float(config_section.get("angle", 0.0))
			return 0.0
		_:
			return 0.0


static func calculate_tangents(points: Array[TrackPoint]) -> void:
	for i in range(points.size()):
		var prev_idx := (i - 1 + points.size()) % points.size()
		var next_idx := (i + 1) % points.size()
		
		var prev: TrackPoint = points[prev_idx]
		var next: TrackPoint = points[next_idx]
		
		points[i].tangent = (next.pos - prev.pos).normalized()
		points[i].calculate_basis()


## Calculate banking angle at specific lateral position
## lateral_position: 0.0 = inside edge, 1.0 = outside edge
## point: TrackPoint with section_type and base banking
## banking_config: Track banking configuration from JSON
static func calculate_progressive_banking(lateral_position: float, point: TrackPoint, banking_config: Dictionary) -> float:
	var banking_type: String = banking_config.get("type", "constant")
	
	if banking_type != "progressive":
		return point.banking  # Use centerline banking for non-progressive
	
	# Get inner and outer banking values based on section type
	var section_key := "turns" if point.section_type == "turn" else "straights"
	var config_section: Variant = banking_config.get(section_key, {})
	
	if not config_section is Dictionary:
		return point.banking
	
	var inner_banking: float = config_section.get("inner", point.banking)
	var outer_banking: float = config_section.get("outer", point.banking)
	
	# Linear interpolation from inner to outer
	return inner_banking + (outer_banking - inner_banking) * lateral_position
