@tool
extends EditorPlugin

var editor_panel: Control


func _enter_tree() -> void:
	# Load the editor panel scene
	var panel_scene := preload("res://addons/track_editor/track_editor_panel.tscn")
	editor_panel = panel_scene.instantiate()

	# Add the panel as a bottom panel
	add_control_to_bottom_panel(editor_panel, "Track Editor")

	print("Track Editor plugin loaded")


func _exit_tree() -> void:
	# Clean up the panel when plugin is disabled
	if editor_panel:
		remove_control_from_bottom_panel(editor_panel)
		editor_panel.queue_free()

	print("Track Editor plugin unloaded")
