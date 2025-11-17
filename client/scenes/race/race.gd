extends Node3D

const Car := preload("res://scenes/car/car.tscn")

var cars := {}


func _ready() -> void:
	NetworkManager.connected_to_server.connect(_on_connected)
	NetworkManager.race_state_updated.connect(_on_race_state_updated)
	NetworkManager.connection_closed.connect(_on_disconnected)


func _on_connected() -> void:
	print("Race scene: Connected to engine")


func _on_disconnected() -> void:
	print("Race scene: Disconnected from engine")


func _on_race_state_updated(state: Dictionary) -> void:
	if not state.has("cars"):
		return
	
	for car_data in state.cars:
		var car_id: String = car_data.id
		
		if not cars.has(car_id):
			spawn_car(car_id, car_data)
		else:
			update_car(car_id, car_data)


func spawn_car(car_id: String, car_data: Dictionary) -> void:
	var car_instance := Car.instantiate()
	car_instance.car_id = car_id
	car_instance.car_number = car_data.get("number", 0)
	car_instance.name = "Car_" + str(car_data.get("number", car_id))
	
	add_child(car_instance)
	cars[car_id] = car_instance
	
	car_instance.update_from_state(car_data)


func update_car(car_id: String, car_data: Dictionary) -> void:
	var car_instance = cars[car_id]
	car_instance.update_from_state(car_data)
