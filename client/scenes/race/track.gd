extends Node3D

@export var track_data_path := "res://data/tracks/bristol.json"

var track_resource: TrackResource


func _ready() -> void:
	build_track_from_resource()


func build_track_from_resource() -> void:
	# Load track using TrackResource
	track_resource = TrackResource.from_json(track_data_path)
	if track_resource == null:
		push_error("Failed to load track resource")
		return
	
	print("Building track: ", track_resource.track_name)
	
	# Generate centerline from track data
	var track_data := resource_to_dict(track_resource)
	var centerline := TrackGenerator.generate_centerline(track_data)
	
	if centerline.is_empty():
		push_error("Failed to generate centerline")
		return
	
	# Build track surface with progressive banking
	var banking_config := track_resource.banking_config
	var surface_mesh := TrackMeshBuilder.build_surface_mesh(centerline, track_resource.track_width, banking_config)
	var surface := MeshInstance3D.new()
	surface.name = "TrackSurface"
	surface.mesh = surface_mesh
	surface.material_override = create_track_material()
	add_child(surface)
	
	# Build collision
	var collision_shape := surface_mesh.create_trimesh_shape()
	var collision_body := StaticBody3D.new()
	collision_body.name = "TrackCollision"
	var collision := CollisionShape3D.new()
	collision.shape = collision_shape
	collision_body.add_child(collision)
	add_child(collision_body)
	
	# Build walls with progressive banking
	var wall_height := track_resource.get_wall_height()
	
	var inner_edge := TrackMeshBuilder.extract_edge_points(centerline, track_resource.track_width, true, banking_config)
	var inner_wall_mesh := TrackMeshBuilder.build_wall_mesh(inner_edge, wall_height)
	var inner_wall := MeshInstance3D.new()
	inner_wall.name = "InnerWall"
	inner_wall.mesh = inner_wall_mesh
	inner_wall.material_override = create_wall_material()
	add_child(inner_wall)
	
	var outer_edge := TrackMeshBuilder.extract_edge_points(centerline, track_resource.track_width, false, banking_config)
	var outer_wall_mesh := TrackMeshBuilder.build_wall_mesh(outer_edge, wall_height)
	var outer_wall := MeshInstance3D.new()
	outer_wall.name = "OuterWall"
	outer_wall.mesh = outer_wall_mesh
	outer_wall.material_override = create_wall_material()
	add_child(outer_wall)
	
	print("Track built: ", track_resource.track_name, " - ", centerline.size(), " centerline points")


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


func create_track_material() -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.25, 0.25, 0.25)
	mat.roughness = 0.8
	mat.metallic = 0.0
	return mat


func create_wall_material() -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.6, 0.6, 0.6)
	mat.roughness = 0.7
	mat.metallic = 0.1
	return mat
