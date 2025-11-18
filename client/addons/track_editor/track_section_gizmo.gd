@tool
extends EditorNode3DGizmo

## Gizmo for individual track section with draggable handles

const FEET_TO_METERS = 0.3048
const METERS_TO_FEET = 1.0 / FEET_TO_METERS

# Handle IDs
enum Handle {
	TURN_CENTER = 0,
	TURN_RADIUS = 1,
	STRAIGHT_END = 2
}


func _init() -> void:
	pass


## Called when gizmo should be redrawn
func _redraw() -> void:
	clear()

	var section_node := get_node_3d() as TrackSectionNode3D
	if not section_node:
		return

	# Draw appropriate handles based on section type
	match section_node.section_type:
		"turn":
			_draw_turn_handles(section_node)
		"straight":
			_draw_straight_handles(section_node)
		"transition":
			_draw_transition_handles(section_node)


## Draw handles for turn section
func _draw_turn_handles(section_node: TrackSectionNode3D) -> void:
	var section_data := section_node.section_data
	var radius: float = section_data.get("radius", 250.0) * FEET_TO_METERS
	var start_angle: float = section_data.get("startAngle", 0.0)
	var end_angle: float = section_data.get("endAngle", 180.0)

	# Calculate handle positions
	var handles := PackedVector3Array()

	# Handle 0: Turn center (at section node position)
	handles.append(Vector3.ZERO)

	# Handle 1: Radius control (on the arc at midpoint)
	var mid_angle := deg_to_rad((start_angle + end_angle) / 2.0)
	var radius_handle_pos := Vector3(
		radius * cos(mid_angle),
		0,
		radius * sin(mid_angle)
	)
	handles.append(radius_handle_pos)

	# Create handle material
	var material := get_plugin().get_material("handles", self)

	# Add handles
	add_handles(handles, material, [])

	# Draw visual aids
	_draw_turn_arc(section_node, radius, start_angle, end_angle)


## Draw arc visualization for turn
func _draw_turn_arc(section_node: TrackSectionNode3D, radius: float, start_angle: float, end_angle: float) -> void:
	var points := PackedVector3Array()
	var num_segments := 32

	# Generate arc points
	for i in range(num_segments + 1):
		var t := float(i) / num_segments
		var angle := deg_to_rad(start_angle + (end_angle - start_angle) * t)
		var point := Vector3(
			radius * cos(angle),
			0,
			radius * sin(angle)
		)
		points.append(point)

	# Draw arc line
	var material := get_plugin().get_material("turn_radius", self)
	add_lines(points, material, false)


## Draw handles for straight section
func _draw_straight_handles(section_node: TrackSectionNode3D) -> void:
	var section_data := section_node.section_data
	var length: float = section_data.get("length", 700.0) * FEET_TO_METERS

	# For now, simple visualization
	# TODO: Add proper straight section handles
	pass


## Draw handles for transition section
func _draw_transition_handles(section_node: TrackSectionNode3D) -> void:
	# TODO: Add transition handles
	pass


## Get name of handle for display
func _get_handle_name(handle_id: int, secondary: bool) -> String:
	match handle_id:
		Handle.TURN_CENTER:
			return "Turn Center"
		Handle.TURN_RADIUS:
			return "Turn Radius"
		Handle.STRAIGHT_END:
			return "Straight End"
		_:
			return "Handle %d" % handle_id


## Get current value of handle
func _get_handle_value(handle_id: int, secondary: bool) -> Variant:
	var section_node := get_node_3d() as TrackSectionNode3D
	if not section_node:
		return null

	var section_data := section_node.section_data

	match handle_id:
		Handle.TURN_CENTER:
			# Return center point in feet
			return Vector2(
				section_data.get("centerPoint", {}).get("x", 0.0),
				section_data.get("centerPoint", {}).get("y", 0.0)
			)
		Handle.TURN_RADIUS:
			# Return radius in feet
			return section_data.get("radius", 250.0)
		_:
			return null


## Handle drag operation
func _set_handle(handle_id: int, secondary: bool, camera: Camera3D, screen_pos: Vector2) -> void:
	var section_node := get_node_3d() as TrackSectionNode3D
	if not section_node:
		return

	var section_data := section_node.section_data

	match handle_id:
		Handle.TURN_CENTER:
			_drag_turn_center(section_node, camera, screen_pos)
		Handle.TURN_RADIUS:
			_drag_turn_radius(section_node, camera, screen_pos)


## Drag turn center in XZ plane
func _drag_turn_center(section_node: TrackSectionNode3D, camera: Camera3D, screen_pos: Vector2) -> void:
	# Project screen position to XZ plane
	var from := camera.project_ray_origin(screen_pos)
	var normal := camera.project_ray_normal(screen_pos)

	# Intersect with XZ plane (y = 0)
	var plane := Plane(Vector3.UP, 0)
	var intersection := plane.intersects_ray(from, normal)

	if intersection:
		# Convert to global position, then to section local position
		var global_pos: Vector3 = intersection
		var local_pos := section_node.to_local(global_pos)

		# Update section data (convert meters to feet)
		section_node.section_data["centerPoint"] = {
			"x": local_pos.x * METERS_TO_FEET,
			"y": local_pos.z * METERS_TO_FEET
		}

		# Update visual position
		section_node.global_position = global_pos

		# Trigger track regeneration
		_notify_track_changed(section_node)


## Drag turn radius
func _drag_turn_radius(section_node: TrackSectionNode3D, camera: Camera3D, screen_pos: Vector2) -> void:
	# Project screen position to XZ plane
	var from := camera.project_ray_origin(screen_pos)
	var normal := camera.project_ray_normal(screen_pos)

	var plane := Plane(Vector3.UP, 0)
	var intersection := plane.intersects_ray(from, normal)

	if intersection:
		# Calculate distance from turn center to intersection point
		var global_pos: Vector3 = intersection
		var center_pos := section_node.global_position
		var radius_meters := (global_pos - center_pos).length()

		# Clamp to reasonable values (100ft to 1000ft)
		var radius_feet := radius_meters * METERS_TO_FEET
		radius_feet = clamp(radius_feet, 100.0, 1000.0)

		# Update section data
		section_node.section_data["radius"] = radius_feet

		# Trigger track regeneration
		_notify_track_changed(section_node)


## Notify that track needs regeneration
func _notify_track_changed(section_node: TrackSectionNode3D) -> void:
	# Signal that section data has changed
	# The track preview should listen for this and regenerate the mesh
	print("Track section ", section_node.section_index, " modified - regeneration needed")


## Commit handle drag (called when mouse released)
func _commit_handle(handle_id: int, secondary: bool, restore: Variant, cancel: bool) -> void:
	if cancel:
		# Restore original value
		# TODO: Implement undo/redo
		return

	var section_node := get_node_3d() as TrackSectionNode3D
	if section_node:
		print("Committed handle ", handle_id, " for section ", section_node.section_index)
		# Final track regeneration and undo checkpoint
		_notify_track_changed(section_node)
