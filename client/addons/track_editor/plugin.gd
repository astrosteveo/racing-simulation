@tool
extends EditorPlugin

const TrackSectionGizmoPlugin = preload("res://addons/track_editor/track_section_gizmo_plugin.gd")

var editor_panel: Control
var gizmo_plugin: EditorNode3DGizmoPlugin


func _enter_tree() -> void:
	# Load the editor panel scene
	var panel_scene := preload("res://addons/track_editor/track_editor_panel.tscn")
	editor_panel = panel_scene.instantiate()

	# Add the panel as a bottom panel
	add_control_to_bottom_panel(editor_panel, "Track Editor")

	# Register gizmo plugin for track section editing
	gizmo_plugin = TrackSectionGizmoPlugin.new()
	add_node_3d_gizmo_plugin(gizmo_plugin)

	print("Track Editor plugin loaded (with gizmo plugin)")


func _exit_tree() -> void:
	# Remove gizmo plugin
	if gizmo_plugin:
		remove_node_3d_gizmo_plugin(gizmo_plugin)
		gizmo_plugin = null

	# Clean up the panel when plugin is disabled
	if editor_panel:
		remove_control_from_bottom_panel(editor_panel)
		editor_panel.queue_free()

	print("Track Editor plugin unloaded")
