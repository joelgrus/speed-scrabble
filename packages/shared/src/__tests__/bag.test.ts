import { describe, it, expect } from 'vitest'
import { buildBag } from '../bag'
import { mulberry32 } from '../rng'
import type { Letter } from '../types'

// Standard Scrabble distribution for validation
const EXPECTED_DISTRIBUTION: Record<Letter, number> = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1, L: 4, M: 2,
  N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1
}

const TOTAL_TILES = Object.values(EXPECTED_DISTRIBUTION).reduce((sum, count) => sum + count, 0)

describe('buildBag', () => {
  it('should create a bag with correct total number of tiles', () => {
    const rng = mulberry32(42)
    const bag = buildBag(rng)
    
    expect(bag).toHaveLength(TOTAL_TILES)
  })

  it('should contain correct distribution of letters', () => {
    const rng = mulberry32(42)
    const bag = buildBag(rng)
    
    // Count occurrences of each letter
    const distribution: Record<string, number> = {}
    bag.forEach(tile => {
      distribution[tile.letter] = (distribution[tile.letter] || 0) + 1
    })
    
    // Verify each letter appears the correct number of times
    Object.entries(EXPECTED_DISTRIBUTION).forEach(([letter, expectedCount]) => {
      expect(distribution[letter]).toBe(expectedCount)
    })
  })

  it('should assign unique IDs to all tiles', () => {
    const rng = mulberry32(42)
    const bag = buildBag(rng)
    
    const ids = bag.map(tile => tile.id)
    const uniqueIds = new Set(ids)
    
    expect(uniqueIds.size).toBe(bag.length)
  })

  it('should assign sequential IDs starting from t0', () => {
    const rng = mulberry32(42)
    const bag = buildBag(rng)
    
    // Sort by ID to check sequence
    const sortedByOriginalId = bag.sort((a, b) => {
      const aNum = parseInt(a.id.substring(1))
      const bNum = parseInt(b.id.substring(1))
      return aNum - bNum
    })
    
    sortedByOriginalId.forEach((tile, index) => {
      expect(tile.id).toBe(`t${index}`)
    })
  })

  it('should shuffle tiles based on RNG seed', () => {
    const bag1 = buildBag(mulberry32(42))
    const bag2 = buildBag(mulberry32(42))
    const bag3 = buildBag(mulberry32(123))
    
    // Same seed should produce identical order
    expect(bag1.map(t => t.id)).toEqual(bag2.map(t => t.id))
    expect(bag1.map(t => t.letter)).toEqual(bag2.map(t => t.letter))
    
    // Different seed should produce different order
    expect(bag1.map(t => t.id)).not.toEqual(bag3.map(t => t.id))
  })

  it('should shuffle tiles thoroughly', () => {
    const rng = mulberry32(12345)
    const bag = buildBag(rng)
    
    // Check that tiles are not in the original order
    // Original order would be: A,A,A,A,A,A,A,A,A,B,B,C,C,D,D,D,D,E,E,E...
    let inOriginalOrder = true
    let expectedLetter = 'A'
    let expectedCount = EXPECTED_DISTRIBUTION[expectedLetter as Letter]
    let currentCount = 0
    
    for (const tile of bag) {
      if (tile.letter !== expectedLetter) {
        inOriginalOrder = false
        break
      }
      currentCount++
      if (currentCount === expectedCount) {
        // Move to next letter
        const letters = Object.keys(EXPECTED_DISTRIBUTION) as Letter[]
        const nextIndex = letters.indexOf(expectedLetter as Letter) + 1
        if (nextIndex < letters.length) {
          expectedLetter = letters[nextIndex]
          expectedCount = EXPECTED_DISTRIBUTION[expectedLetter as Letter]
          currentCount = 0
        }
      }
    }
    
    expect(inOriginalOrder).toBe(false)
  })

  it('should contain only valid letters', () => {
    const rng = mulberry32(42)
    const bag = buildBag(rng)
    
    const validLetters = new Set(Object.keys(EXPECTED_DISTRIBUTION))
    
    bag.forEach(tile => {
      expect(validLetters.has(tile.letter)).toBe(true)
      expect(tile.letter).toMatch(/^[A-Z]$/)
    })
  })

  it('should handle multiple RNG calls consistently', () => {
    const rng = mulberry32(999)
    
    // Call RNG a few times before building bag
    rng()
    rng()
    rng()
    
    const bag1 = buildBag(rng)
    
    // Reset RNG and do the same
    const rng2 = mulberry32(999)
    rng2()
    rng2()
    rng2()
    
    const bag2 = buildBag(rng2)
    
    expect(bag1.map(t => t.letter)).toEqual(bag2.map(t => t.letter))
  })

  it('should create tiles with correct structure', () => {
    const rng = mulberry32(42)
    const bag = buildBag(rng)
    
    bag.forEach(tile => {
      expect(tile).toHaveProperty('id')
      expect(tile).toHaveProperty('letter')
      expect(typeof tile.id).toBe('string')
      expect(typeof tile.letter).toBe('string')
      expect(tile.id).toMatch(/^t\d+$/)
      expect(tile.letter).toMatch(/^[A-Z]$/)
    })
  })
})