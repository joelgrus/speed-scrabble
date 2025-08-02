import { describe, it, expect, beforeEach } from 'vitest';
import { OptimizedBoard } from '../optimizedBoard';
import type { PlacedTile } from '../types';

describe('OptimizedBoard', () => {
  let board: OptimizedBoard;
  
  const createTile = (letter: string, x: number, y: number): PlacedTile => ({
    id: `tile-${letter}-${x}-${y}`,
    letter: letter as any, // Type assertion for test simplicity
    x,
    y
  });

  beforeEach(() => {
    board = new OptimizedBoard();
  });

  describe('basic operations', () => {
    it('should set and get tiles', () => {
      const tile = createTile('A', 5, 10);
      
      board.set(5, 10, tile);
      const retrieved = board.get(5, 10);
      
      expect(retrieved).toEqual(tile);
    });

    it('should return undefined for empty positions', () => {
      const retrieved = board.get(0, 0);
      expect(retrieved).toBeUndefined();
    });

    it('should check if position has tile', () => {
      const tile = createTile('B', 3, 7);
      
      expect(board.has(3, 7)).toBe(false);
      
      board.set(3, 7, tile);
      expect(board.has(3, 7)).toBe(true);
    });

    it('should delete tiles', () => {
      const tile = createTile('C', 1, 2);
      
      board.set(1, 2, tile);
      expect(board.has(1, 2)).toBe(true);
      
      const deleted = board.delete(1, 2);
      expect(deleted).toBe(true);
      expect(board.has(1, 2)).toBe(false);
    });

    it('should return false when deleting non-existent tile', () => {
      const deleted = board.delete(999, 999);
      expect(deleted).toBe(false);
    });
  });

  describe('bulk operations', () => {
    beforeEach(() => {
      // Set up a small board
      board.set(0, 0, createTile('H', 0, 0));
      board.set(1, 0, createTile('E', 1, 0));
      board.set(2, 0, createTile('L', 2, 0));
      board.set(3, 0, createTile('L', 3, 0));
      board.set(4, 0, createTile('O', 4, 0));
    });

    it('should get all tiles', () => {
      const tiles = board.getAllTiles();
      expect(tiles).toHaveLength(5);
      
      const letters = tiles.map(t => t.letter).sort();
      expect(letters).toEqual(['E', 'H', 'L', 'L', 'O']);
    });

    it('should get all coordinates', () => {
      const coords = board.getAllCoords();
      expect(coords).toHaveLength(5);
      
      const sortedCoords = coords.sort((a, b) => a.x - b.x);
      expect(sortedCoords).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 }
      ]);
    });

    it('should iterate over all tiles', () => {
      const iterations: Array<{ tile: PlacedTile; x: number; y: number }> = [];
      
      board.forEach((tile, x, y) => {
        iterations.push({ tile, x, y });
      });
      
      expect(iterations).toHaveLength(5);
      
      // Check that coordinates match tile positions
      iterations.forEach(({ tile, x, y }) => {
        expect(tile.x).toBe(x);
        expect(tile.y).toBe(y);
      });
    });

    it('should calculate bounding box', () => {
      const bounds = board.getBounds();
      expect(bounds).toEqual({
        minX: 0,
        maxX: 4,
        minY: 0,
        maxY: 0
      });
    });

    it('should return null bounds for empty board', () => {
      const emptyBoard = new OptimizedBoard();
      const bounds = emptyBoard.getBounds();
      expect(bounds).toBeNull();
    });

    it('should clear all tiles', () => {
      expect(board.size).toBe(5);
      
      board.clear();
      expect(board.size).toBe(0);
      expect(board.getAllTiles()).toHaveLength(0);
    });

    it('should report correct size', () => {
      expect(board.size).toBe(5);
      
      board.set(10, 10, createTile('X', 10, 10));
      expect(board.size).toBe(6);
      
      board.delete(0, 0);
      expect(board.size).toBe(5);
    });
  });

  describe('compatibility with legacy format', () => {
    it('should convert to legacy object format', () => {
      board.set(5, 3, createTile('A', 5, 3));
      board.set(-2, 7, createTile('B', -2, 7));
      
      const legacy = board.toLegacyFormat();
      
      expect(legacy['5,3']).toEqual(createTile('A', 5, 3));
      expect(legacy['-2,7']).toEqual(createTile('B', -2, 7));
      expect(Object.keys(legacy)).toHaveLength(2);
    });

    it('should create from legacy object format', () => {
      const legacy = {
        '10,20': createTile('X', 10, 20),
        '-5,15': createTile('Y', -5, 15),
        '0,0': createTile('Z', 0, 0)
      };
      
      const optimized = OptimizedBoard.fromLegacyFormat(legacy);
      
      expect(optimized.get(10, 20)).toEqual(createTile('X', 10, 20));
      expect(optimized.get(-5, 15)).toEqual(createTile('Y', -5, 15));
      expect(optimized.get(0, 0)).toEqual(createTile('Z', 0, 0));
      expect(optimized.size).toBe(3);
    });

    it('should maintain consistency between formats', () => {
      // Start with legacy format
      const legacy = {
        '1,1': createTile('A', 1, 1),
        '2,2': createTile('B', 2, 2)
      };
      
      // Convert to optimized
      const optimized = OptimizedBoard.fromLegacyFormat(legacy);
      
      // Convert back to legacy
      const backToLegacy = optimized.toLegacyFormat();
      
      expect(backToLegacy).toEqual(legacy);
    });
  });

  describe('cloning', () => {
    it('should create independent clone', () => {
      board.set(1, 1, createTile('A', 1, 1));
      board.set(2, 2, createTile('B', 2, 2));
      
      const cloned = board.clone();
      
      // Should have same content
      expect(cloned.size).toBe(board.size);
      expect(cloned.get(1, 1)).toEqual(board.get(1, 1));
      expect(cloned.get(2, 2)).toEqual(board.get(2, 2));
      
      // Should be independent
      board.set(3, 3, createTile('C', 3, 3));
      expect(cloned.has(3, 3)).toBe(false);
      expect(cloned.size).toBe(2);
      
      cloned.set(4, 4, createTile('D', 4, 4));
      expect(board.has(4, 4)).toBe(false);
    });

    it('should create deep clone of tiles', () => {
      const originalTile = createTile('A', 1, 1);
      board.set(1, 1, originalTile);
      
      const cloned = board.clone();
      const clonedTile = cloned.get(1, 1)!;
      
      // Should be equal but not same reference
      expect(clonedTile).toEqual(originalTile);
      expect(clonedTile).not.toBe(originalTile);
      
      // Modifying clone shouldn't affect original
      clonedTile.letter = 'Z' as any;
      expect(board.get(1, 1)!.letter).toBe('A');
    });
  });

  describe('performance and statistics', () => {
    it('should provide performance statistics', () => {
      board.set(1, 1, createTile('A', 1, 1));
      board.set(2, 2, createTile('B', 2, 2));
      board.set(3, 3, createTile('C', 3, 3));
      
      const stats = board.getStats();
      
      expect(stats.size).toBe(3);
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.hashCollisions).toBe(0); // Should be no collisions
    });

    it('should handle large boards efficiently', () => {
      const startTime = performance.now();
      
      // Add 1000 tiles
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 10; j++) {
          board.set(i, j, createTile('X', i, j));
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly
      expect(duration).toBeLessThan(100);
      expect(board.size).toBe(1000);
      
      // All tiles should be accessible
      expect(board.get(50, 5)).toBeDefined();
      expect(board.get(99, 9)).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle negative coordinates', () => {
      board.set(-100, -50, createTile('A', -100, -50));
      board.set(-1, -1, createTile('B', -1, -1));
      
      expect(board.get(-100, -50)).toEqual(createTile('A', -100, -50));
      expect(board.get(-1, -1)).toEqual(createTile('B', -1, -1));
    });

    it('should handle zero coordinates', () => {
      board.set(0, 0, createTile('Z', 0, 0));
      
      expect(board.get(0, 0)).toEqual(createTile('Z', 0, 0));
      expect(board.has(0, 0)).toBe(true);
    });

    it('should handle large coordinate values', () => {
      board.set(9999, 9999, createTile('MAX', 9999, 9999));
      board.set(-9999, -9999, createTile('MIN', -9999, -9999));
      
      expect(board.get(9999, 9999)).toEqual(createTile('MAX', 9999, 9999));
      expect(board.get(-9999, -9999)).toEqual(createTile('MIN', -9999, -9999));
    });
  });
});