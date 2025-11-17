@tool
extends Control

@onready var track_selector: OptionButton = %TrackSelector
@onready var status_label: Label = %StatusLabel

var available_tracks := [
	{"id": "bristol", "name": "Bristol Motor Speedway"},
	{"id": "martinsville", "name": "Martinsville Speedway"}
]

var current_track_id := ""


func _ready() -> void:
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

	update_status("Selected: %s" % track.name)
	print("Track selected: ", track.name, " (", track.id, ")")


func update_status(message: String) -> void:
	if status_label:
		status_label.text = message
