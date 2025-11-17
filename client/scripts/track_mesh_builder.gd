class_name TrackMeshBuilder
extends RefCounted


static func build_surface_mesh(centerline: Array, track_width_ft: float, banking_config: Dictionary = {}) -> ArrayMesh:
	var width := track_width_ft * 0.3048
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)

	var half_width := width / 2.0

	for i in range(centerline.size()):
		var point: TrackGenerator.TrackPoint = centerline[i]

		# Get horizontal right vector (perpendicular to tangent in XZ plane only)
		var tangent_xz := Vector3(point.tangent.x, 0, point.tangent.z).normalized()
		var right_flat := tangent_xz.cross(Vector3.UP).normalized()

		# Calculate flat edge positions
		var inner_flat := point.pos - right_flat * half_width
		var outer_flat := point.pos + right_flat * half_width

		# Calculate progressive banking (different for inner vs outer edges)
		var inner_banking := TrackGenerator.calculate_progressive_banking(0.0, point, banking_config)
		var outer_banking := TrackGenerator.calculate_progressive_banking(1.0, point, banking_config)
		
		# Apply banking: inner edge goes down, outer edge goes up
		var inner_bank_rad := deg_to_rad(inner_banking)
		var outer_bank_rad := deg_to_rad(outer_banking)
		
		var inner_bank_height := half_width * sin(inner_bank_rad)
		var outer_bank_height := half_width * sin(outer_bank_rad)

		var inner := inner_flat + Vector3.DOWN * inner_bank_height
		var outer := outer_flat + Vector3.UP * outer_bank_height

		# Calculate averaged normal for progressive banking
		var avg_bank_rad := deg_to_rad((inner_banking + outer_banking) / 2.0)
		var avg_right := right_flat.rotated(point.tangent.normalized(), avg_bank_rad)
		var avg_normal := avg_right.cross(point.tangent.normalized()).normalized()

		var u_dist := float(i) / centerline.size()

		st.set_normal(avg_normal)
		st.set_uv(Vector2(0, u_dist * 10.0))
		st.add_vertex(inner)

		st.set_normal(avg_normal)
		st.set_uv(Vector2(1, u_dist * 10.0))
		st.add_vertex(outer)
	
	for i in range(centerline.size()):
		var current := i * 2
		var next := ((i + 1) % centerline.size()) * 2
		
		st.add_index(current)
		st.add_index(next)
		st.add_index(current + 1)
		
		st.add_index(current + 1)
		st.add_index(next)
		st.add_index(next + 1)
	
	st.generate_tangents()
	return st.commit()


static func build_wall_mesh(edge_points: Array[Vector3], height_ft: float) -> ArrayMesh:
	var height := height_ft * 0.3048
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	
	for i in range(edge_points.size()):
		var point: Vector3 = edge_points[i]
		var u := float(i) / edge_points.size()
		
		st.set_normal(Vector3.UP)
		st.set_uv(Vector2(u * 20.0, 0))
		st.add_vertex(point)
		
		st.set_normal(Vector3.UP)
		st.set_uv(Vector2(u * 20.0, 1))
		st.add_vertex(point + Vector3.UP * height)
	
	for i in range(edge_points.size()):
		var current := i * 2
		var next := ((i + 1) % edge_points.size()) * 2
		
		st.add_index(current)
		st.add_index(next)
		st.add_index(current + 1)
		
		st.add_index(current + 1)
		st.add_index(next)
		st.add_index(next + 1)
	
	st.generate_tangents()
	return st.commit()


static func extract_edge_points(centerline: Array, track_width_ft: float, inner: bool, banking_config: Dictionary = {}) -> Array[Vector3]:
	var width := track_width_ft * 0.3048
	var half_width := width / 2.0
	var points: Array[Vector3] = []

	for i in range(centerline.size()):
		var point: TrackGenerator.TrackPoint = centerline[i]

		# Get horizontal right vector (perpendicular to tangent in XZ plane only)
		var tangent_xz := Vector3(point.tangent.x, 0, point.tangent.z).normalized()
		var right_flat := tangent_xz.cross(Vector3.UP).normalized()

		# Calculate flat edge position
		var offset := -half_width if inner else half_width
		var edge_flat := point.pos + right_flat * offset

		# Calculate progressive banking for this edge
		var lateral_position := 0.0 if inner else 1.0
		var edge_banking := TrackGenerator.calculate_progressive_banking(lateral_position, point, banking_config)
		
		# Apply banking: inner edge goes down, outer edge goes up
		var bank_rad := deg_to_rad(edge_banking)
		var bank_height := half_width * sin(bank_rad)
		var height_offset := Vector3.DOWN * bank_height if inner else Vector3.UP * bank_height

		points.append(edge_flat + height_offset)

	return points
