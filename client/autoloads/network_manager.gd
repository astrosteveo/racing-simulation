extends Node

signal connected_to_server()
signal connection_closed()
signal race_state_updated(state: Dictionary)
signal decision_prompt_received(prompt: Dictionary)
signal race_event_received(event: Dictionary)

var socket := WebSocketPeer.new()
var _is_connected := false
var url := "ws://localhost:8080"

var reconnect_attempts := 0
var max_reconnect_attempts := 5
var reconnect_delay := 1.0


func _ready() -> void:
	connect_to_server()


func connect_to_server() -> void:
	print("Connecting to engine at ", url, "...")
	var err := socket.connect_to_url(url)
	
	if err != OK:
		print("Unable to connect to server")
		attempt_reconnect()
		return


func _process(_delta: float) -> void:
	socket.poll()
	
	var state := socket.get_ready_state()
	
	if state == WebSocketPeer.STATE_OPEN:
		if not _is_connected:
			_on_connection_opened()
		
		while socket.get_available_packet_count() > 0:
			var packet := socket.get_packet()
			var message := packet.get_string_from_utf8()
			_handle_message(message)
	
	elif state == WebSocketPeer.STATE_CLOSED:
		if _is_connected:
			_on_connection_closed()


func _on_connection_opened() -> void:
	print("✅ Connected to game engine")
	_is_connected = true
	reconnect_attempts = 0
	connected_to_server.emit()


func _on_connection_closed() -> void:
	print("Disconnected from engine")
	_is_connected = false
	connection_closed.emit()
	attempt_reconnect()


func _handle_message(raw_data: String) -> void:
	var json := JSON.new()
	var parse_result := json.parse(raw_data)
	
	if parse_result != OK:
		print("Failed to parse JSON: ", json.get_error_message())
		return
	
	var message: Variant = json.data
	
	if not message.has("type") or not message.has("data"):
		print("Invalid message format: ", message)
		return
	
	match message.type:
		"RaceStateUpdate":
			race_state_updated.emit(message.data)
		"DecisionPrompt":
			decision_prompt_received.emit(message.data)
		"RaceEvent":
			race_event_received.emit(message.data)
		_:
			print("Unknown message type: ", message.type)


func send_decision(prompt_id: String, option_id: String) -> void:
	if not _is_connected:
		print("Cannot send decision: not connected")
		return
	
	var decision := {
		"type": "PlayerDecision",
		"data": {
			"promptId": prompt_id,
			"optionId": option_id,
			"timestamp": Time.get_ticks_msec()
		}
	}
	
	var json_string := JSON.stringify(decision)
	socket.send_text(json_string)


func attempt_reconnect() -> void:
	if reconnect_attempts >= max_reconnect_attempts:
		print("Max reconnect attempts reached")
		return
	
	reconnect_attempts += 1
	var delay: float = reconnect_delay * reconnect_attempts
	
	print("Reconnecting in ", delay, "s (attempt ", reconnect_attempts, "/", max_reconnect_attempts, ")...")
	
	await get_tree().create_timer(delay).timeout
	connect_to_server()


func disconnect_from_server() -> void:
	if _is_connected:
		socket.close()
		_is_connected = false
