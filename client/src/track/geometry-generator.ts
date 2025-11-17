/**
 * Track Geometry Generator
 * Converts track section data into 3D centerline points
 */

import * as THREE from 'three';
import type { Track, TrackSection } from '../../../src/types';
import type { TrackGeometry, TrackPoint, Vector3, GeometryGeneratorOptions } from './types';

const DEFAULT_OPTIONS: GeometryGeneratorOptions = {
  pointsPerSection: 20,
  trackWidth: 60, // NASCAR standard
  verticalScale: 1.0,
};

export class GeometryGenerator {
  private options: GeometryGeneratorOptions;

  constructor(options: Partial<GeometryGeneratorOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate 3D geometry from track data
   */
  generate(track: Track): TrackGeometry {
    const centerline = this.generateCenterline(track);
    const { innerEdge, outerEdge } = this.generateEdges(centerline, this.options.trackWidth);

    return {
      ...track,
      geometry: {
        centerline,
        width: this.options.trackWidth,
        innerEdge,
        outerEdge,
        startFinish: {
          position: centerline[0].position,
          direction: centerline[0].tangent,
        },
      },
      units: 'feet',
      origin: 'track-center',
    };
  }

  /**
   * Generate centerline points from track sections
   */
  private generateCenterline(track: Track): TrackPoint[] {
    const points: TrackPoint[] = [];
    const totalLength = this.calculateTotalLength(track.sections);

    let currentDistance = 0;
    let currentPosition: Vector3 = { x: 0, y: 0, z: 0 };
    let currentAngle = 0; // Radians, 0 = +Z direction

    for (const section of track.sections) {
      const sectionPoints = this.generateSectionPoints(
        section,
        currentPosition,
        currentAngle,
        currentDistance,
        totalLength
      );

      points.push(...sectionPoints);

      // Update position and angle for next section
      if (sectionPoints.length > 0) {
        const lastPoint = sectionPoints[sectionPoints.length - 1];
        currentPosition = lastPoint.position;

        // Calculate new angle based on section type
        if (section.type === 'turn' && section.radius) {
          const arcAngle = section.length / section.radius;
          currentAngle += arcAngle;
        }
      }

      currentDistance += section.length;
    }

    return points;
  }

  /**
   * Generate points for a single track section
   */
  private generateSectionPoints(
    section: TrackSection,
    startPos: Vector3,
    startAngle: number,
    sectionStartDistance: number,
    totalTrackLength: number
  ): TrackPoint[] {
    const points: TrackPoint[] = [];
    const numPoints = this.options.pointsPerSection;

    if (section.type === 'straight') {
      // Straight section: points along a line
      for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const distance = t * section.length;

        const position: Vector3 = {
          x: startPos.x + Math.sin(startAngle) * distance,
          y: startPos.y,
          z: startPos.z + Math.cos(startAngle) * distance,
        };

        const tangent: Vector3 = {
          x: Math.sin(startAngle),
          y: 0,
          z: Math.cos(startAngle),
        };

        const normal: Vector3 = { x: 0, y: 1, z: 0 }; // Flat surface

        points.push({
          position,
          normal,
          tangent,
          banking: 0,
          lapProgress: (sectionStartDistance + distance) / totalTrackLength,
        });
      }
    } else if (section.type === 'turn' && section.radius && section.banking !== undefined) {
      // Turn section: points along an arc
      const radius = section.radius;
      const arcAngle = section.length / radius;
      const bankingRad = (section.banking * Math.PI) / 180;

      // Center of turn (perpendicular LEFT of current heading direction)
      // For a right turn, center is to the left; for left turn, to the right
      const centerX = startPos.x - Math.sin(startAngle) * radius;
      const centerZ = startPos.z + Math.cos(startAngle) * radius;

      for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const angle = startAngle + t * arcAngle;
        const distance = t * section.length;

        // Position on arc (centerline stays flat, banking affects surface)
        const position: Vector3 = {
          x: centerX - Math.cos(angle) * radius,
          y: startPos.y,
          z: centerZ + Math.sin(angle) * radius,
        };

        // Tangent (direction of travel)
        const tangent: Vector3 = {
          x: Math.sin(angle),
          y: 0,
          z: Math.cos(angle),
        };

        // Normal (tilted by banking)
        const normal: Vector3 = {
          x: -Math.cos(angle) * Math.sin(bankingRad),
          y: Math.cos(bankingRad),
          z: Math.sin(angle) * Math.sin(bankingRad),
        };

        points.push({
          position,
          normal,
          tangent,
          banking: section.banking,
          lapProgress: (sectionStartDistance + distance) / totalTrackLength,
        });
      }
    }

    return points;
  }

  /**
   * Generate inner and outer track edges from centerline
   * Applies proper banking by rotating the perpendicular vector around the tangent
   */
  private generateEdges(
    centerline: TrackPoint[],
    trackWidth: number
  ): { innerEdge: Vector3[]; outerEdge: Vector3[] } {
    const halfWidth = trackWidth / 2;
    const innerEdge: Vector3[] = [];
    const outerEdge: Vector3[] = [];

    for (const point of centerline) {
      // Create perpendicular vector (points to the right of tangent)
      const perpVec = new THREE.Vector3(-point.tangent.z, 0, point.tangent.x);

      // Create tangent vector
      const tangentVec = new THREE.Vector3(point.tangent.x, point.tangent.y, point.tangent.z);

      // Apply banking by rotating perpendicular around tangent
      const bankingRad = (point.banking * Math.PI) / 180;
      if (point.banking !== 0) {
        perpVec.applyAxisAngle(tangentVec, -bankingRad);
      }

      // Calculate inner edge (left side when facing forward)
      const innerPos = perpVec.clone().multiplyScalar(-halfWidth);
      innerEdge.push({
        x: point.position.x + innerPos.x,
        y: point.position.y + innerPos.y,
        z: point.position.z + innerPos.z,
      });

      // Calculate outer edge (right side when facing forward)
      const outerPos = perpVec.clone().multiplyScalar(halfWidth);
      outerEdge.push({
        x: point.position.x + outerPos.x,
        y: point.position.y + outerPos.y,
        z: point.position.z + outerPos.z,
      });
    }

    return { innerEdge, outerEdge };
  }

  /**
   * Calculate total track length
   */
  private calculateTotalLength(sections: TrackSection[]): number {
    return sections.reduce((sum, section) => sum + section.length, 0);
  }
}
