@tool
extends Node3D

@onready var camera: Camera3D = $Camera3D

var track_mesh_instance: MeshInstance3D
var current_track_id := ""

# Camera orbit controls
var camera_distance := 200.0
var camera_angle_h := 0.0  # Horizontal angle (yaw)
var camera_angle_v := 45.0  # Vertical angle (pitch)
var camera_target := Vector3.ZERO
var is_orbiting := false
var is_panning := false
var last_mouse_pos := Vector2.ZERO


func _ready() -> void:
	update_camera_position()


func load_track(track_id: String) -> void:
	if track_id == current_track_id:
		return

	current_track_id = track_id
	clear_track()

	var track_path := "res://data/tracks/%s.json" % track_id
	var track_resource := TrackResource.from_json(track_path)

	if track_resource == null:
		push_error("Failed to load track: " + track_id)
		return

	print("Track Editor Preview: Loading ", track_resource.track_name)

	# Generate track geometry
	var track_data := resource_to_dict(track_resource)
	var centerline := TrackGenerator.generate_centerline(track_data)

	if centerline.is_empty():
		push_error("Failed to generate centerline for: " + track_id)
		return

	# Build track surface mesh
	var banking_config := track_resource.banking_config
	var surface_mesh := TrackMeshBuilder.build_surface_mesh(centerline, track_resource.track_width, banking_config)

	# Create mesh instance
	track_mesh_instance = MeshInstance3D.new()
	track_mesh_instance.name = "TrackSurface"
	track_mesh_instance.mesh = surface_mesh
	track_mesh_instance.material_override = create_preview_material()
	add_child(track_mesh_instance)

	# Focus camera on track
	focus_on_track(centerline)

	print("Track Editor Preview: ", track_resource.track_name, " loaded - ", centerline.size(), " points")


func clear_track() -> void:
	if track_mesh_instance:
		track_mesh_instance.queue_free()
		track_mesh_instance = null


func resource_to_dict(resource: TrackResource) -> Dictionary:
	return {
		"id": resource.id,
		"name": resource.track_name,
		"nickname": resource.nickname,
		"length": resource.length,
		"type": resource.track_type,
		"trackWidth": resource.track_width,
		"surface": resource.surface,
		"baseGrip": resource.base_grip,
		"banking": resource.banking_config,
		"sections": resource.sections,
		"safetyFeatures": resource.safety_features
	}


func create_preview_material() -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.3, 0.3, 0.3)
	mat.roughness = 0.7
	mat.metallic = 0.0
	return mat


func focus_on_track(centerline: Array) -> void:
	if centerline.is_empty():
		return

	# Calculate track bounds
	var min_pos := Vector3(INF, INF, INF)
	var max_pos := Vector3(-INF, -INF, -INF)

	for point in centerline:
		var pos: Vector3 = point.pos
		min_pos.x = min(min_pos.x, pos.x)
		min_pos.y = min(min_pos.y, pos.y)
		min_pos.z = min(min_pos.z, pos.z)
		max_pos.x = max(max_pos.x, pos.x)
		max_pos.y = max(max_pos.y, pos.y)
		max_pos.z = max(max_pos.z, pos.z)

	# Set camera target to center of track
	camera_target = (min_pos + max_pos) / 2.0

	# Set camera distance based on track size
	var track_size := (max_pos - min_pos).length()
	camera_distance = track_size * 0.8

	# Reset camera angles for good default view
	camera_angle_h = 45.0
	camera_angle_v = 45.0

	update_camera_position()


func update_camera_position() -> void:
	if not camera:
		return

	# Convert spherical coordinates to Cartesian
	var h_rad := deg_to_rad(camera_angle_h)
	var v_rad := deg_to_rad(camera_angle_v)

	var offset := Vector3(
		cos(v_rad) * sin(h_rad),
		sin(v_rad),
		cos(v_rad) * cos(h_rad)
	) * camera_distance

	camera.position = camera_target + offset
	camera.look_at(camera_target, Vector3.UP)


func _input(event: InputEvent) -> void:
	# Handle camera controls
	if event is InputEventMouseButton:
		var mouse_event := event as InputEventMouseButton

		# Right click for orbit
		if mouse_event.button_index == MOUSE_BUTTON_RIGHT:
			is_orbiting = mouse_event.pressed
			if mouse_event.pressed:
				last_mouse_pos = mouse_event.position

		# Middle click for pan
		elif mouse_event.button_index == MOUSE_BUTTON_MIDDLE:
			is_panning = mouse_event.pressed
			if mouse_event.pressed:
				last_mouse_pos = mouse_event.position

		# Scroll wheel for zoom
		elif mouse_event.button_index == MOUSE_BUTTON_WHEEL_UP:
			camera_distance = max(50.0, camera_distance - 20.0)
			update_camera_position()
		elif mouse_event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			camera_distance = min(1000.0, camera_distance + 20.0)
			update_camera_position()

	elif event is InputEventMouseMotion and (is_orbiting or is_panning):
		var mouse_event := event as InputEventMouseMotion
		var delta := mouse_event.position - last_mouse_pos
		last_mouse_pos = mouse_event.position

		if is_orbiting:
			# Orbit camera
			camera_angle_h -= delta.x * 0.5
			camera_angle_v = clamp(camera_angle_v - delta.y * 0.5, -89.0, 89.0)
			update_camera_position()

		elif is_panning:
			# Pan camera
			var right := camera.global_transform.basis.x
			var up := camera.global_transform.basis.y
			camera_target -= right * delta.x * 0.5
			camera_target += up * delta.y * 0.5
			update_camera_position()

	elif event is InputEventKey:
		var key_event := event as InputEventKey

		# F key to focus on track
		if key_event.pressed and key_event.keycode == KEY_F:
			if track_mesh_instance:
				# Refocus camera (recalculates bounds)
				var track_data := resource_to_dict(TrackResource.from_json("res://data/tracks/%s.json" % current_track_id))
				var centerline := TrackGenerator.generate_centerline(track_data)
				focus_on_track(centerline)
