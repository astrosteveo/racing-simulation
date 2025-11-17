extends Node3D

var car_id: String
var car_number: int


func update_from_state(car_data: Dictionary) -> void:
	if car_data.has("coordinates"):
		var coords = car_data.coordinates
		position = Vector3(coords.x, coords.y, coords.z)
	
	if car_data.has("rotation"):
		var rot = car_data.rotation
		quaternion = Quaternion(rot.x, rot.y, rot.z, rot.w)
