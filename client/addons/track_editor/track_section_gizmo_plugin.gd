@tool
extends EditorNode3DGizmoPlugin

## Gizmo plugin for editing track sections with 3D handles

const TrackSectionNode3D = preload("res://scripts/editor/track_section_node.gd")

# Note: We can't preload the gizmo script here because it extends EditorNode3DGizmo
# which causes circular dependencies. We'll use load() in _create_gizmo() instead.


func _init() -> void:
	create_material("turn_center", Color(0.3, 0.7, 1.0))
	create_material("turn_radius", Color(0.3, 1.0, 0.7))
	create_material("banking", Color(1.0, 0.7, 0.3))
	create_material("selected", Color(1.0, 1.0, 0.3))

	create_handle_material("handles")
	create_handle_material("handles_billboard", true)


func _get_gizmo_name() -> String:
	return "TrackSection"


func _has_gizmo(node: Node3D) -> bool:
	# Check if node is a TrackSectionNode3D by checking class name
	return node.get_script() == TrackSectionNode3D


func _create_gizmo(node: Node3D) -> EditorNode3DGizmo:
	# Load gizmo script dynamically to avoid circular dependency
	var gizmo_script := load("res://addons/track_editor/track_section_gizmo.gd")
	if gizmo_script and node.get_script() == TrackSectionNode3D:
		var gizmo = gizmo_script.new()
		return gizmo
	return null


## Handle types for different section editing modes
enum HandleType {
	TURN_CENTER,      # Drag to move turn center (X/Z plane)
	TURN_RADIUS,      # Drag to change turn radius
	STRAIGHT_LENGTH,  # Drag to extend/shorten straight
	BANKING_ANGLE     # Rotate to change banking
}
