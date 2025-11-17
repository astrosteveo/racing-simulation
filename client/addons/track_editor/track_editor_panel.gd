@tool
extends Control

@onready var track_selector: OptionButton = %TrackSelector
@onready var status_label: Label = %StatusLabel
@onready var track_preview: Node3D = $"../HSplitContainer/PreviewContainer/SubViewportContainer/SubViewport/TrackPreview3D"

var available_tracks := [
	{"id": "bristol", "name": "Bristol Motor Speedway"},
	{"id": "martinsville", "name": "Martinsville Speedway"}
]

var current_track_id := ""


func _ready() -> void:
	# Wait for the scene tree to be fully loaded
	await get_tree().process_frame

	# Get reference to preview (more reliable path)
	var viewport_container := get_node_or_null("../HSplitContainer/PreviewContainer/SubViewportContainer")
	if viewport_container:
		var viewport := viewport_container.get_child(0) as SubViewport
		if viewport:
			track_preview = viewport.get_child(0) as Node3D

	populate_track_selector()
	update_status("Ready - Select a track to edit")


func populate_track_selector() -> void:
	track_selector.clear()

	for track in available_tracks:
		track_selector.add_item(track.name)

	if track_selector.item_count > 0:
		track_selector.select(0)
		_on_track_selected(0)


func _on_track_selected(index: int) -> void:
	if index < 0 or index >= available_tracks.size():
		return

	var track = available_tracks[index]
	current_track_id = track.id

	update_status("Loading: %s..." % track.name)
	print("Track selected: ", track.name, " (", track.id, ")")

	# Load track in preview
	if track_preview:
		track_preview.load_track(current_track_id)
		update_status("Loaded: %s" % track.name)
	else:
		push_error("Track preview not available")
		update_status("Error: Preview not available")


func update_status(message: String) -> void:
	if status_label:
		status_label.text = message
