/**
 * Tests for Track Geometry Generator
 */

import { describe, it, expect } from 'vitest';
import { GeometryGenerator } from './geometry-generator';
import type { Track } from '../../../src/types';

// Bristol track data (simplified)
const bristolTrack: Track = {
  id: 'bristol',
  name: 'Bristol Motor Speedway',
  length: 0.533,
  type: 'short',
  banking: { turns: 26, straights: 0 },
  surface: 'concrete',
  surfaceGrip: 0.95,
  sections: [
    { type: 'turn', length: 440, banking: 26, radius: 250, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 700, idealLine: 140, surfaceGrip: 0.95 },
    { type: 'turn', length: 440, banking: 26, radius: 250, idealLine: 120, surfaceGrip: 0.95 },
    { type: 'straight', length: 700, idealLine: 140, surfaceGrip: 0.95 },
  ],
  difficulty: 8,
  raceLaps: 500,
};

describe('GeometryGenerator', () => {
  it('creates generator with default options', () => {
    const generator = new GeometryGenerator();
    expect(generator).toBeDefined();
  });

  it('generates track geometry from track data', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    expect(geometry).toBeDefined();
    expect(geometry.geometry).toBeDefined();
    expect(geometry.geometry.centerline).toBeDefined();
    expect(geometry.geometry.centerline.length).toBeGreaterThan(0);
  });

  it('generates correct number of centerline points', () => {
    const generator = new GeometryGenerator({ pointsPerSection: 20 });
    const geometry = generator.generate(bristolTrack);

    // 4 sections * 20 points per section = 80 points
    expect(geometry.geometry.centerline.length).toBe(80);
  });

  it('ensures all centerline points have lap progress between 0 and 1', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    for (const point of geometry.geometry.centerline) {
      expect(point.lapProgress).toBeGreaterThanOrEqual(0);
      expect(point.lapProgress).toBeLessThanOrEqual(1);
    }
  });

  it('starts at origin', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    const firstPoint = geometry.geometry.centerline[0];
    expect(firstPoint.position.x).toBe(0);
    expect(firstPoint.position.y).toBe(0);
    expect(firstPoint.position.z).toBe(0);
  });

  it('applies banking to turn sections', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    // Find points in turn sections (first 20 points)
    const turnPoints = geometry.geometry.centerline.slice(0, 20);

    for (const point of turnPoints) {
      expect(point.banking).toBe(26); // Bristol turn banking
    }
  });

  it('has zero banking on straight sections', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    // Find points in straight section (points 20-39)
    const straightPoints = geometry.geometry.centerline.slice(20, 40);

    for (const point of straightPoints) {
      expect(point.banking).toBe(0);
    }
  });

  it('generates inner and outer edges', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    expect(geometry.geometry.innerEdge).toBeDefined();
    expect(geometry.geometry.outerEdge).toBeDefined();
    expect(geometry.geometry.innerEdge.length).toBe(geometry.geometry.centerline.length);
    expect(geometry.geometry.outerEdge.length).toBe(geometry.geometry.centerline.length);
  });

  it('generates start/finish line', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    expect(geometry.geometry.startFinish).toBeDefined();
    expect(geometry.geometry.startFinish.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(geometry.geometry.startFinish.direction).toBeDefined();
  });

  it('respects track width option', () => {
    const customWidth = 80;
    const generator = new GeometryGenerator({ trackWidth: customWidth });
    const geometry = generator.generate(bristolTrack);

    expect(geometry.geometry.width).toBe(customWidth);
  });

  it('generates points with valid normals', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    for (const point of geometry.geometry.centerline) {
      // Normal vector should be roughly unit length
      const length = Math.sqrt(
        point.normal.x ** 2 + point.normal.y ** 2 + point.normal.z ** 2
      );
      expect(length).toBeCloseTo(1.0, 1); // Within 0.1
    }
  });

  it('generates points with valid tangents', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    for (const point of geometry.geometry.centerline) {
      // Tangent vector should be roughly unit length
      const length = Math.sqrt(
        point.tangent.x ** 2 + point.tangent.y ** 2 + point.tangent.z ** 2
      );
      expect(length).toBeCloseTo(1.0, 1); // Within 0.1
    }
  });

  it('generates reasonable track dimensions', () => {
    const generator = new GeometryGenerator();
    const geometry = generator.generate(bristolTrack);

    // Track should have reasonable bounds (not infinitely large)
    const centerline = geometry.geometry.centerline;
    const maxX = Math.max(...centerline.map((p) => Math.abs(p.position.x)));
    const maxZ = Math.max(...centerline.map((p) => Math.abs(p.position.z)));

    // Bristol is a short track (0.533 miles = 2814 ft), diameter should be ~1000ft
    expect(maxX).toBeLessThan(2000);
    expect(maxZ).toBeLessThan(2000);
    expect(maxX).toBeGreaterThan(200); // Should have some width
    expect(maxZ).toBeGreaterThan(200); // Should have some length
  });
});
