/**
 * Track Geometry Types
 * 3D visualization data for racing tracks
 */

import type { Track } from '../../../src/types';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface TrackPoint {
  position: Vector3;      // 3D world position
  normal: Vector3;        // Surface normal (for banking)
  tangent: Vector3;       // Direction of travel
  banking: number;        // Banking angle (degrees)
  lapProgress: number;    // 0.0 - 1.0
}

export interface TrackGeometry extends Track {
  geometry: {
    centerline: TrackPoint[];     // Track centerline points
    width: number;                // Track width (feet)

    // Boundaries
    innerEdge: Vector3[];         // Inside wall
    outerEdge: Vector3[];         // Outside wall

    // Features
    startFinish: {
      position: Vector3;
      direction: Vector3;
    };

    pitLane?: {
      entry: Vector3;
      exit: Vector3;
      centerline: Vector3[];
    };
  };

  // Coordinate system metadata
  units: 'feet';
  origin: 'track-center';
}

export interface GeometryGeneratorOptions {
  pointsPerSection: number;     // Resolution
  trackWidth: number;           // Default: 60 feet (NASCAR standard)
  verticalScale: number;        // Exaggerate banking (default: 1.0)
}
