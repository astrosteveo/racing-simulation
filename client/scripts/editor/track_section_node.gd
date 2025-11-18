class_name TrackSectionNode3D
extends Node3D

## Represents a single editable track section in the 3D viewport
## Used for selection and visual feedback in the Track Editor

signal selection_changed(selected: bool)

## Section data
var section_index: int = -1
var section_type: String = ""  # "turn", "straight", "transition"
var section_data: Dictionary = {}

## Visual state
var is_selected: bool = false
var is_hovered: bool = false

## Child nodes (created in _ready)
var collision_area: Area3D
var collision_shape: CollisionShape3D
var mesh_instance: MeshInstance3D

## Materials for visual feedback
var normal_material: StandardMaterial3D
var selected_material: StandardMaterial3D
var hovered_material: StandardMaterial3D


func _ready() -> void:
	_setup_collision()
	_setup_materials()

	# Request gizmo update for editor plugin
	if Engine.is_editor_hint():
		call_deferred("update_gizmo")


func _setup_collision() -> void:
	# Create Area3D for mouse raycasting
	collision_area = Area3D.new()
	collision_area.name = "CollisionArea"
	collision_area.input_ray_pickable = true
	add_child(collision_area)

	# Create CollisionShape3D
	collision_shape = CollisionShape3D.new()
	collision_shape.name = "CollisionShape"
	collision_area.add_child(collision_shape)

	# Shape will be set based on section type in set_section_data()


func _setup_materials() -> void:
	# Normal material (gray)
	normal_material = StandardMaterial3D.new()
	normal_material.albedo_color = Color(0.7, 0.7, 0.7)
	normal_material.metallic = 0.2
	normal_material.roughness = 0.8

	# Selected material (bright blue with outline)
	selected_material = StandardMaterial3D.new()
	selected_material.albedo_color = Color(0.3, 0.7, 1.0)
	selected_material.emission_enabled = true
	selected_material.emission = Color(0.3, 0.7, 1.0)
	selected_material.emission_energy_multiplier = 0.5
	selected_material.metallic = 0.3
	selected_material.roughness = 0.6

	# Hovered material (light blue)
	hovered_material = StandardMaterial3D.new()
	hovered_material.albedo_color = Color(0.5, 0.8, 1.0)
	hovered_material.emission_enabled = true
	hovered_material.emission = Color(0.5, 0.8, 1.0)
	hovered_material.emission_energy_multiplier = 0.3
	hovered_material.metallic = 0.25
	hovered_material.roughness = 0.7


## Initialize section with data
func set_section_data(index: int, type: String, data: Dictionary) -> void:
	section_index = index
	section_type = type
	section_data = data

	# Update collision shape based on section type
	_update_collision_shape()


func _update_collision_shape() -> void:
	if not collision_shape:
		return

	# Create appropriate collision shape based on section type
	match section_type:
		"turn":
			# Use cylinder for turn sections
			var shape = CylinderShape3D.new()
			shape.radius = section_data.get("radius", 250.0) * 0.3048  # feet to meters
			shape.height = 10.0  # Tall enough to click easily
			collision_shape.shape = shape

		"straight", "transition":
			# Use box for straight/transition sections
			var shape = BoxShape3D.new()
			var length = section_data.get("length", 100.0) * 0.3048  # feet to meters
			shape.size = Vector3(length, 10.0, 40.0)  # length x height x width
			collision_shape.shape = shape


## Set visual selection state
func set_selected(selected: bool) -> void:
	if is_selected == selected:
		return

	is_selected = selected
	_update_visual_state()
	selection_changed.emit(is_selected)


## Set hover state
func set_hovered(hovered: bool) -> void:
	if is_hovered == hovered:
		return

	is_hovered = hovered
	_update_visual_state()


## Update visual appearance based on state
func _update_visual_state() -> void:
	# Visual feedback will be added via mesh highlighting or outline shader
	# For now, just track the state
	pass


## Get section bounds for camera focus
func get_bounds() -> AABB:
	if mesh_instance and mesh_instance.mesh:
		return mesh_instance.get_aabb()
	return AABB(global_position, Vector3.ONE)
