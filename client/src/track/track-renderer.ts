/**
 * Track Renderer
 * Renders track geometry using Three.js
 */

import * as THREE from 'three';
import type { TrackGeometry, Vector3 } from './types';

export class TrackRenderer {
  private scene: THREE.Scene;
  private trackMesh: THREE.Group | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Render track geometry
   */
  render(trackGeometry: TrackGeometry): THREE.Group {
    // Remove existing track if any
    if (this.trackMesh) {
      this.scene.remove(this.trackMesh);
      this.disposeTrackMesh(this.trackMesh);
    }

    // Create track group
    const trackGroup = new THREE.Group();
    trackGroup.name = `track-${trackGeometry.id}`;

    // Render track surface
    const surface = this.createTrackSurface(trackGeometry);
    trackGroup.add(surface);

    // Render walls
    const innerWall = this.createWall(trackGeometry.geometry.innerEdge, 'inner');
    const outerWall = this.createWall(trackGeometry.geometry.outerEdge, 'outer');
    trackGroup.add(innerWall);
    trackGroup.add(outerWall);

    // Render start/finish line
    const startFinish = this.createStartFinishLine(trackGeometry);
    trackGroup.add(startFinish);

    // Add to scene
    this.scene.add(trackGroup);
    this.trackMesh = trackGroup;

    return trackGroup;
  }

  /**
   * Create track surface mesh
   */
  private createTrackSurface(trackGeometry: TrackGeometry): THREE.Mesh {
    const centerline = trackGeometry.geometry.centerline;
    const width = trackGeometry.geometry.width;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    // Generate vertices (create a ribbon along the centerline)
    for (let i = 0; i < centerline.length; i++) {
      const point = centerline[i];

      // Calculate perpendicular vector
      const perpX = -point.tangent.z;
      const perpZ = point.tangent.x;

      // Banking tilt
      const bankingRad = (point.banking * Math.PI) / 180;
      const verticalOffset = Math.sin(bankingRad) * (width / 2);

      // Inner edge vertex
      positions.push(
        point.position.x - perpX * (width / 2),
        point.position.y + verticalOffset,
        point.position.z - perpZ * (width / 2)
      );
      normals.push(point.normal.x, point.normal.y, point.normal.z);
      uvs.push(0, point.lapProgress);

      // Outer edge vertex
      positions.push(
        point.position.x + perpX * (width / 2),
        point.position.y + verticalOffset,
        point.position.z + perpZ * (width / 2)
      );
      normals.push(point.normal.x, point.normal.y, point.normal.z);
      uvs.push(1, point.lapProgress);
    }

    // Generate faces (triangles)
    for (let i = 0; i < centerline.length - 1; i++) {
      const base = i * 2;

      // Triangle 1
      indices.push(base, base + 1, base + 2);

      // Triangle 2
      indices.push(base + 1, base + 3, base + 2);
    }

    // Close the loop (connect last segment to first)
    const lastBase = (centerline.length - 1) * 2;
    indices.push(lastBase, lastBase + 1, 0);
    indices.push(lastBase + 1, 1, 0);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Create material
    const material = new THREE.MeshPhongMaterial({
      color: trackGeometry.surface === 'concrete' ? 0x808080 : 0x2a2a2a,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Create track wall
   */
  private createWall(edgePoints: Vector3[], type: 'inner' | 'outer'): THREE.Mesh {
    const wallHeight = 15; // feet
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];

    // Generate wall vertices
    for (const point of edgePoints) {
      // Bottom vertex
      positions.push(point.x, point.y, point.z);

      // Top vertex
      positions.push(point.x, point.y + wallHeight, point.z);
    }

    // Generate faces
    for (let i = 0; i < edgePoints.length - 1; i++) {
      const base = i * 2;

      if (type === 'inner') {
        // Inner wall faces inward
        indices.push(base, base + 2, base + 1);
        indices.push(base + 1, base + 2, base + 3);
      } else {
        // Outer wall faces outward
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    // Close the wall loop
    const lastBase = (edgePoints.length - 1) * 2;
    if (type === 'inner') {
      indices.push(lastBase, 0, lastBase + 1);
      indices.push(lastBase + 1, 0, 1);
    } else {
      indices.push(lastBase, lastBase + 1, 0);
      indices.push(lastBase + 1, 1, 0);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: type === 'inner' ? 0x444444 : 0x666666,
      side: THREE.DoubleSide,
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Create start/finish line marker
   */
  private createStartFinishLine(trackGeometry: TrackGeometry): THREE.Mesh {
    const width = trackGeometry.geometry.width;
    const sf = trackGeometry.geometry.startFinish;

    // Create a simple plane at the start/finish
    const geometry = new THREE.PlaneGeometry(width, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(sf.position.x, sf.position.y + 0.1, sf.position.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.atan2(sf.direction.x, sf.direction.z);

    return mesh;
  }

  /**
   * Dispose of track mesh resources
   */
  private disposeTrackMesh(trackMesh: THREE.Group): void {
    trackMesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }

  /**
   * Remove track from scene
   */
  dispose(): void {
    if (this.trackMesh) {
      this.scene.remove(this.trackMesh);
      this.disposeTrackMesh(this.trackMesh);
      this.trackMesh = null;
    }
  }
}
