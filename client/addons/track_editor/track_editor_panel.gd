@tool
extends Control

@onready var track_selector: OptionButton = %TrackSelector
@onready var status_label: Label = %StatusLabel
@onready var viewport_container: SubViewportContainer = $MarginContainer/HSplitContainer/PreviewContainer/SubViewportContainer

var track_preview: Node3D

var available_tracks := [
	{"id": "bristol", "name": "Bristol Motor Speedway"},
	{"id": "martinsville", "name": "Martinsville Speedway"}
]

var current_track_id := ""


func _ready() -> void:
	# Connect to preview after everything is ready
	call_deferred("_connect_preview")
	populate_track_selector()


func _connect_preview() -> void:
	# Get the SubViewport from the container
	if viewport_container and viewport_container.get_child_count() > 0:
		var viewport := viewport_container.get_child(0) as SubViewport
		if viewport and viewport.get_child_count() > 0:
			track_preview = viewport.get_child(0) as Node3D

			if track_preview:
				print("Track Editor: Preview connected successfully")
				update_status("Ready - Select a track to edit")
				# Load the initially selected track
				if current_track_id:
					track_preview.load_track(current_track_id)
				return

	push_error("Track Editor: Failed to connect preview")
	update_status("Error: Preview not available")


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
