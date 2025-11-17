class_name TrackResource
extends Resource

## Track metadata
@export var id: String
@export var track_name: String
@export var nickname: String
@export var length: float
@export var track_type: String
@export var track_width: float
@export var surface: String
@export var base_grip: float
@export var difficulty: int
@export var race_laps: int

## Banking configuration
@export var banking_config: Dictionary

## Track sections
@export var sections: Array

## Optional features
@export var safety_features: Dictionary


## Factory method to load track from JSON
static func from_json(json_path: String) -> TrackResource:
	if not FileAccess.file_exists(json_path):
		push_error("Track file not found: ", json_path)
		return null
	
	var file := FileAccess.open(json_path, FileAccess.READ)
	if file == null:
		push_error("Failed to open track file: ", json_path)
		return null
	
	var json_text := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	var error := json.parse(json_text)
	
	if error != OK:
		push_error("Failed to parse track JSON: ", json.get_error_message())
		return null
	
	var data: Dictionary = json.data
	var resource := TrackResource.new()
	
	# Map JSON to resource properties
	resource.id = data.get("id", "")
	resource.track_name = data.get("name", "")
	resource.nickname = data.get("nickname", "")
	resource.length = data.get("length", 0.0)
	resource.track_type = data.get("type", "")
	resource.track_width = data.get("trackWidth", 40.0)
	resource.surface = data.get("surface", "asphalt")
	resource.base_grip = data.get("baseGrip", 0.9)
	resource.difficulty = data.get("difficulty", 5)
	resource.race_laps = data.get("raceLaps", 100)
	
	resource.banking_config = data.get("banking", {})
	resource.sections = data.get("sections", [])
	resource.safety_features = data.get("safetyFeatures", {})
	
	if not resource.validate():
		push_error("Track validation failed for: ", resource.id)
		return null
	
	return resource


## Validate track data integrity
func validate() -> bool:
	if id.is_empty() or track_name.is_empty():
		push_error("Track missing id or name")
		return false
	
	if length <= 0.0 or track_width <= 0.0:
		push_error("Track has invalid dimensions")
		return false
	
	if sections.is_empty():
		push_error("Track has no sections")
		return false
	
	return true


## Calculate total centerline length in feet
func get_total_centerline_length() -> float:
	var total := 0.0
	for section in sections:
		if section.has("length"):
			total += section.length
	return total


## Get section at specific distance along centerline
func get_section_at_distance(distance: float) -> Dictionary:
	var accumulated := 0.0
	for section in sections:
		var section_length: float = section.get("length", 0.0)
		if distance < accumulated + section_length:
			return section
		accumulated += section_length
	return sections[-1] if not sections.is_empty() else {}


## Get section at specific lap progress (0.0 - 1.0)
func get_section_at_progress(progress: float) -> Dictionary:
	var total_length := get_total_centerline_length()
	var distance := progress * total_length
	return get_section_at_distance(distance)


## Get wall height in feet
func get_wall_height() -> float:
	if safety_features.has("walls") and safety_features.walls.has("height"):
		return safety_features.walls.height
	return 15.0  # Default
