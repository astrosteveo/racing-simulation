@tool
extends EditorNode3DGizmoPlugin

## Gizmo plugin for editing track sections with 3D handles

const TrackSectionGizmo = preload("res://addons/track_editor/track_section_gizmo.gd")


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
	return node is TrackSectionNode3D


func _create_gizmo(node: Node3D) -> EditorNode3DGizmo:
	if node is TrackSectionNode3D:
		return TrackSectionGizmo.new()
	return null


## Handle types for different section editing modes
enum HandleType {
	TURN_CENTER,      # Drag to move turn center (X/Z plane)
	TURN_RADIUS,      # Drag to change turn radius
	STRAIGHT_LENGTH,  # Drag to extend/shorten straight
	BANKING_ANGLE     # Rotate to change banking
}
