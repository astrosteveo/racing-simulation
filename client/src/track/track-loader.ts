/**
 * Track Loader
 * Loads track data and generates 3D geometry
 */

import type { Track } from '../../../src/types';
import { GeometryGenerator } from './geometry-generator';
import type { TrackGeometry } from './types';

export class TrackLoader {
  private generator: GeometryGenerator;
  private loadedTracks: Map<string, TrackGeometry> = new Map();

  constructor() {
    this.generator = new GeometryGenerator({
      pointsPerSection: 30, // Higher resolution for smoother curves
      trackWidth: 60,
      verticalScale: 1.0,
    });
  }

  /**
   * Load track data and generate geometry
   */
  async load(trackData: Track): Promise<TrackGeometry> {
    // Check cache
    if (this.loadedTracks.has(trackData.id)) {
      return this.loadedTracks.get(trackData.id)!;
    }

    // Generate geometry
    const geometry = this.generator.generate(trackData);

    // Cache it
    this.loadedTracks.set(trackData.id, geometry);

    return geometry;
  }

  /**
   * Load track from JSON file (browser fetch)
   */
  async loadFromFile(trackId: string): Promise<TrackGeometry> {
    const response = await fetch(`/data/tracks/${trackId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load track: ${trackId}`);
    }

    const trackData: Track = await response.json();
    return this.load(trackData);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.loadedTracks.clear();
  }
}
