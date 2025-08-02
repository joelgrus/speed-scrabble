/**
 * Optimized board implementation using Map with coordinate hashing
 * Replaces object-based board with Map for better performance and memory usage
 */

import type { PlacedTile, Coord } from "./types";
import { hashCoord, unhashCoord } from "./coordinateHash";

/**
 * High-performance board using Map with coordinate hashing
 */
export class OptimizedBoard {
  private tiles = new Map<number, PlacedTile>();
  
  /**
   * Get tile at coordinates
   */
  get(x: number, y: number): PlacedTile | undefined {
    return this.tiles.get(hashCoord(x, y));
  }
  
  /**
   * Set tile at coordinates
   */
  set(x: number, y: number, tile: PlacedTile): void {
    this.tiles.set(hashCoord(x, y), tile);
  }
  
  /**
   * Remove tile at coordinates
   */
  delete(x: number, y: number): boolean {
    return this.tiles.delete(hashCoord(x, y));
  }
  
  /**
   * Check if coordinates have a tile
   */
  has(x: number, y: number): boolean {
    return this.tiles.has(hashCoord(x, y));
  }
  
  /**
   * Get all tiles as array
   */
  getAllTiles(): PlacedTile[] {
    return Array.from(this.tiles.values());
  }
  
  /**
   * Get all coordinates that have tiles
   */
  getAllCoords(): Coord[] {
    return Array.from(this.tiles.keys()).map(hash => {
      const { x, y } = unhashCoord(hash);
      return { x, y };
    });
  }
  
  /**
   * Iterate over all tiles
   */
  forEach(callback: (tile: PlacedTile, x: number, y: number) => void): void {
    this.tiles.forEach((tile, hash) => {
      const { x, y } = unhashCoord(hash);
      callback(tile, x, y);
    });
  }
  
  /**
   * Get bounding box of all tiles
   */
  getBounds(): { minX: number; maxX: number; minY: number; maxY: number } | null {
    if (this.tiles.size === 0) return null;
    
    const coords = this.getAllCoords();
    return {
      minX: Math.min(...coords.map(c => c.x)),
      maxX: Math.max(...coords.map(c => c.x)),
      minY: Math.min(...coords.map(c => c.y)),
      maxY: Math.max(...coords.map(c => c.y)),
    };
  }
  
  /**
   * Clear all tiles
   */
  clear(): void {
    this.tiles.clear();
  }
  
  /**
   * Get number of tiles on board
   */
  get size(): number {
    return this.tiles.size;
  }
  
  /**
   * Convert to legacy object format for compatibility
   */
  toLegacyFormat(): Record<string, PlacedTile> {
    const result: Record<string, PlacedTile> = {};
    this.tiles.forEach((tile, hash) => {
      const { x, y } = unhashCoord(hash);
      result[`${x},${y}`] = tile;
    });
    return result;
  }
  
  /**
   * Create from legacy object format
   */
  static fromLegacyFormat(board: Record<string, PlacedTile>): OptimizedBoard {
    const optimized = new OptimizedBoard();
    Object.entries(board).forEach(([key, tile]) => {
      const [x, y] = key.split(',').map(Number);
      optimized.set(x, y, tile);
    });
    return optimized;
  }
  
  /**
   * Clone this board
   */
  clone(): OptimizedBoard {
    const cloned = new OptimizedBoard();
    this.tiles.forEach((tile, hash) => {
      cloned.tiles.set(hash, { ...tile });
    });
    return cloned;
  }
  
  /**
   * Get performance statistics
   */
  getStats(): {
    size: number;
    memoryUsage: number;
    hashCollisions: number;
  } {
    const hashes = Array.from(this.tiles.keys());
    const uniqueHashes = new Set(hashes);
    
    return {
      size: this.tiles.size,
      memoryUsage: this.tiles.size * 64, // Rough estimate in bytes
      hashCollisions: hashes.length - uniqueHashes.size,
    };
  }
}