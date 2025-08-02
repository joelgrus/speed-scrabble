import { describe, it, expect, beforeEach } from 'vitest';
import { 
  hashCoord, 
  unhashCoord, 
  parseCoordKey, 
  clearCoordCache, 
  getHashStats 
} from '../coordinateHash';

describe('coordinateHash', () => {
  beforeEach(() => {
    clearCoordCache();
  });

  describe('hashCoord', () => {
    it('should create unique hashes for different coordinates', () => {
      const hash1 = hashCoord(0, 0);
      const hash2 = hashCoord(1, 0);
      const hash3 = hashCoord(0, 1);
      const hash4 = hashCoord(1, 1);
      
      const hashes = [hash1, hash2, hash3, hash4];
      const uniqueHashes = new Set(hashes);
      
      expect(uniqueHashes.size).toBe(4);
    });

    it('should handle negative coordinates', () => {
      const hash1 = hashCoord(-5, -3);
      const hash2 = hashCoord(-5, 3);
      const hash3 = hashCoord(5, -3);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });

    it('should create same hash for same coordinates', () => {
      const hash1 = hashCoord(10, 20);
      const hash2 = hashCoord(10, 20);
      
      expect(hash1).toBe(hash2);
    });

    it('should handle boundary values', () => {
      const hash1 = hashCoord(-10000, -10000);
      const hash2 = hashCoord(10000, 10000);
      const hash3 = hashCoord(0, 0);
      
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash2).toBeGreaterThanOrEqual(0);
      expect(hash3).toBeGreaterThanOrEqual(0);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });
  });

  describe('unhashCoord', () => {
    it('should reverse hash correctly', () => {
      const coords = [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: -5, y: 15 },
        { x: -10, y: -20 },
        { x: 100, y: -50 }
      ];
      
      coords.forEach(coord => {
        const hash = hashCoord(coord.x, coord.y);
        const unhashed = unhashCoord(hash);
        
        expect(unhashed.x).toBe(coord.x);
        expect(unhashed.y).toBe(coord.y);
      });
    });
  });

  describe('parseCoordKey', () => {
    it('should parse coordinate strings correctly', () => {
      const result1 = parseCoordKey('10,20');
      expect(result1).toEqual({ x: 10, y: 20 });
      
      const result2 = parseCoordKey('-5,15');
      expect(result2).toEqual({ x: -5, y: 15 });
      
      const result3 = parseCoordKey('0,0');
      expect(result3).toEqual({ x: 0, y: 0 });
    });

    it('should cache parsing results', () => {
      const key = '25,30';
      
      // First call should parse
      const result1 = parseCoordKey(key);
      expect(result1).toEqual({ x: 25, y: 30 });
      
      // Second call should use cache (same object reference)
      const result2 = parseCoordKey(key);
      expect(result2).toBe(result1);
    });

    it('should handle cache size limit', () => {
      // Fill cache beyond limit
      for (let i = 0; i < 1500; i++) {
        parseCoordKey(`${i},${i}`);
      }
      
      // Should not crash and still work
      const result = parseCoordKey('1600,1600');
      expect(result).toEqual({ x: 1600, y: 1600 });
    });
  });

  describe('getHashStats', () => {
    it('should calculate stats for empty array', () => {
      const stats = getHashStats([]);
      expect(stats).toEqual({
        collisions: 0,
        distribution: 0,
        maxGap: 0
      });
    });

    it('should detect no collisions in unique hashes', () => {
      const hashes = [
        hashCoord(0, 0),
        hashCoord(1, 0),
        hashCoord(0, 1),
        hashCoord(1, 1)
      ];
      
      const stats = getHashStats(hashes);
      expect(stats.collisions).toBe(0);
    });

    it('should detect collisions if they exist', () => {
      const hashes = [1, 2, 2, 3, 3, 3]; // Simulated collisions
      
      const stats = getHashStats(hashes);
      expect(stats.collisions).toBe(3); // 3 duplicates
    });

    it('should calculate distribution metrics', () => {
      const hashes = [1, 2, 4, 8]; // Gaps: 1, 2, 4
      
      const stats = getHashStats(hashes);
      expect(stats.maxGap).toBe(4);
      expect(stats.distribution).toBeGreaterThan(1); // Not perfectly distributed
    });
  });

  describe('performance characteristics', () => {
    it('should handle large coordinate ranges efficiently', () => {
      const startTime = performance.now();
      
      // Hash 10,000 coordinate pairs
      const hashes = [];
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          hashes.push(hashCoord(i * 100, j * 100));
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (< 50ms on modern hardware)
      expect(duration).toBeLessThan(50);
      
      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(10000);
    });
  });
});