/**
 * Optimized coordinate hashing for board operations
 * Replaces string-based coordinate keys with numeric hashing for O(1) lookups
 */

/**
 * Hash function for 2D coordinates
 * Uses a simple but effective hash that avoids collisions for typical board sizes
 * Supports coordinates from -10000 to +10000 (configurable via COORD_OFFSET)
 */
const COORD_OFFSET = 10000; // Offset to handle negative coordinates
const COORD_MULTIPLIER = 20001; // Prime number > 2 * COORD_OFFSET

export function hashCoord(x: number, y: number): number {
  // Shift coordinates to positive range and create unique hash
  const shiftedX = x + COORD_OFFSET;
  const shiftedY = y + COORD_OFFSET;
  return shiftedX * COORD_MULTIPLIER + shiftedY;
}

/**
 * Reverse hash function to get coordinates from hash
 * Used for debugging and iteration over board coordinates
 */
export function unhashCoord(hash: number): { x: number; y: number } {
  const shiftedY = hash % COORD_MULTIPLIER;
  const shiftedX = Math.floor(hash / COORD_MULTIPLIER);
  return {
    x: shiftedX - COORD_OFFSET,
    y: shiftedY - COORD_OFFSET
  };
}

/**
 * Coordinate cache for parsing string coordinates
 * Caches the results of coordinate parsing to avoid repeated string operations
 */
const coordParseCache = new Map<string, { x: number; y: number }>();
const CACHE_SIZE_LIMIT = 1000; // Prevent memory leaks

export function parseCoordKey(key: string): { x: number; y: number } {
  // Check cache first
  const cached = coordParseCache.get(key);
  if (cached) {
    return cached;
  }
  
  // Parse coordinate string
  const [xStr, yStr] = key.split(',');
  const result = {
    x: parseInt(xStr, 10),
    y: parseInt(yStr, 10)
  };
  
  // Add to cache with size limit
  if (coordParseCache.size < CACHE_SIZE_LIMIT) {
    coordParseCache.set(key, result);
  }
  
  return result;
}

/**
 * Clear the coordinate parsing cache
 * Useful for testing or memory management
 */
export function clearCoordCache(): void {
  coordParseCache.clear();
}

/**
 * Statistics about coordinate hash distribution
 * Useful for performance analysis and debugging
 */
export function getHashStats(hashes: number[]): {
  collisions: number;
  distribution: number;
  maxGap: number;
} {
  if (hashes.length === 0) {
    return { collisions: 0, distribution: 0, maxGap: 0 };
  }
  
  const sorted = [...hashes].sort((a, b) => a - b);
  const unique = new Set(sorted);
  const collisions = sorted.length - unique.size;
  
  // Calculate distribution quality (lower is better)
  let totalGap = 0;
  let maxGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    totalGap += gap;
    maxGap = Math.max(maxGap, gap);
  }
  
  const avgGap = totalGap / (sorted.length - 1);
  const distribution = maxGap / avgGap; // Ideal is 1.0
  
  return { collisions, distribution, maxGap };
}