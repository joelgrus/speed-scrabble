import { describe, it, expect } from 'vitest'
import { key, get, set, del, isConnected, extractWords } from '../board'
import type { Board, PlacedTile, Letter } from '../types'

const createTile = (id: string, letter: Letter, x: number, y: number): PlacedTile => ({
  id, letter, x, y
})

describe('key', () => {
  it('should create coordinate keys in correct format', () => {
    expect(key(0, 0)).toBe('0,0')
    expect(key(5, 10)).toBe('5,10')
    expect(key(-3, 7)).toBe('-3,7')
    expect(key(100, -50)).toBe('100,-50')
  })
})

describe('get', () => {
  it('should retrieve tiles from board by coordinates', () => {
    const board: Board = {}
    const tile = createTile('t1', 'A', 3, 4)
    board['3,4'] = tile
    
    expect(get(board, 3, 4)).toBe(tile)
    expect(get(board, 0, 0)).toBeUndefined()
  })
})

describe('set', () => {
  it('should place tiles on board using their coordinates', () => {
    const board: Board = {}
    const tile = createTile('t1', 'A', 3, 4)
    
    set(board, tile)
    
    expect(board['3,4']).toBe(tile)
    expect(get(board, 3, 4)).toBe(tile)
  })

  it('should overwrite existing tiles at same position', () => {
    const board: Board = {}
    const tile1 = createTile('t1', 'A', 3, 4)
    const tile2 = createTile('t2', 'B', 3, 4)
    
    set(board, tile1)
    set(board, tile2)
    
    expect(get(board, 3, 4)).toBe(tile2)
  })
})

describe('del', () => {
  it('should remove tiles from board', () => {
    const board: Board = {}
    const tile = createTile('t1', 'A', 3, 4)
    board['3,4'] = tile
    
    del(board, 3, 4)
    
    expect(get(board, 3, 4)).toBeUndefined()
    expect('3,4' in board).toBe(false)
  })

  it('should handle deletion of non-existent tiles', () => {
    const board: Board = {}
    
    expect(() => del(board, 0, 0)).not.toThrow()
    expect(get(board, 0, 0)).toBeUndefined()
  })
})

describe('isConnected', () => {
  it('should return true for empty board', () => {
    const board: Board = {}
    expect(isConnected(board)).toBe(true)
  })

  it('should return true for single tile', () => {
    const board: Board = {}
    set(board, createTile('t1', 'A', 0, 0))
    
    expect(isConnected(board)).toBe(true)
  })

  it('should return true for horizontally connected tiles', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 1, 0))
    set(board, createTile('t3', 'T', 2, 0))
    
    expect(isConnected(board)).toBe(true)
  })

  it('should return true for vertically connected tiles', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 0, 1))
    set(board, createTile('t3', 'T', 0, 2))
    
    expect(isConnected(board)).toBe(true)
  })

  it('should return true for complex connected grid', () => {
    const board: Board = {}
    // Create a cross pattern
    set(board, createTile('t1', 'C', 1, 0)) // top
    set(board, createTile('t2', 'A', 0, 1)) // left
    set(board, createTile('t3', 'T', 1, 1)) // center
    set(board, createTile('t4', 'S', 2, 1)) // right
    set(board, createTile('t5', 'E', 1, 2)) // bottom
    
    expect(isConnected(board)).toBe(true)
  })

  it('should return false for disconnected tiles', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 0, 1))
    set(board, createTile('t3', 'T', 5, 5)) // disconnected
    
    expect(isConnected(board)).toBe(false)
  })

  it('should return false for multiple separate groups', () => {
    const board: Board = {}
    // Group 1
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 1, 0))
    
    // Group 2 (disconnected)
    set(board, createTile('t3', 'D', 3, 3))
    set(board, createTile('t4', 'O', 4, 3))
    set(board, createTile('t5', 'G', 5, 3))
    
    expect(isConnected(board)).toBe(false)
  })

  it('should handle diagonally adjacent tiles (should not be connected)', () => {
    const board: Board = {}
    set(board, createTile('t1', 'A', 0, 0))
    set(board, createTile('t2', 'B', 1, 1)) // diagonal
    
    expect(isConnected(board)).toBe(false)
  })
})

describe('extractWords', () => {
  it('should return empty array for empty board', () => {
    const board: Board = {}
    expect(extractWords(board)).toEqual([])
  })

  it('should return empty array for single tile', () => {
    const board: Board = {}
    set(board, createTile('t1', 'A', 0, 0))
    
    expect(extractWords(board)).toEqual([])
  })

  it('should extract simple horizontal word', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 1, 0))
    set(board, createTile('t3', 'T', 2, 0))
    
    const words = extractWords(board)
    expect(words).toHaveLength(1)
    expect(words[0].word).toBe('CAT')
    expect(words[0].cells).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ])
  })

  it('should extract simple vertical word', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 0, 1))
    set(board, createTile('t3', 'T', 0, 2))
    
    const words = extractWords(board)
    expect(words).toHaveLength(1)
    expect(words[0].word).toBe('CAT')
    expect(words[0].cells).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }
    ])
  })

  it('should extract multiple words from cross pattern', () => {
    const board: Board = {}
    // Create words: CAT (horizontal) and ATE (vertical)
    set(board, createTile('t1', 'C', 0, 1))
    set(board, createTile('t2', 'A', 1, 1)) // shared
    set(board, createTile('t3', 'T', 2, 1))
    set(board, createTile('t4', 'T', 1, 0)) // T above A
    set(board, createTile('t5', 'E', 1, 2)) // E below A
    
    const words = extractWords(board)
    expect(words).toHaveLength(2)
    
    const wordTexts = words.map(w => w.word).sort()
    expect(wordTexts).toEqual(['CAT', 'TAE'])
  })

  it('should not extract single-letter "words"', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 2, 2)) // isolated
    
    expect(extractWords(board)).toEqual([])
  })

  it('should handle gaps in potential words', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', 0, 0))
    set(board, createTile('t2', 'A', 1, 0))
    // gap at (2, 0)
    set(board, createTile('t3', 'T', 3, 0))
    
    const words = extractWords(board)
    expect(words).toHaveLength(1)
    expect(words[0].word).toBe('CA')
  })

  it('should extract words with negative coordinates', () => {
    const board: Board = {}
    set(board, createTile('t1', 'C', -2, -1))
    set(board, createTile('t2', 'A', -1, -1))
    set(board, createTile('t3', 'T', 0, -1))
    
    const words = extractWords(board)
    expect(words).toHaveLength(1)
    expect(words[0].word).toBe('CAT')
    expect(words[0].cells).toEqual([
      { x: -2, y: -1 },
      { x: -1, y: -1 },
      { x: 0, y: -1 }
    ])
  })

  it('should not duplicate words', () => {
    const board: Board = {}
    set(board, createTile('t1', 'A', 0, 0))
    set(board, createTile('t2', 'B', 1, 0))
    set(board, createTile('t3', 'C', 2, 0))
    
    const words = extractWords(board)
    expect(words).toHaveLength(1)
    expect(words[0].word).toBe('ABC')
  })

  it('should extract longer words correctly', () => {
    const board: Board = {}
    const letters: Letter[] = ['S', 'C', 'R', 'A', 'B', 'B', 'L', 'E']
    letters.forEach((letter, i) => {
      set(board, createTile(`t${i}`, letter, i, 0))
    })
    
    const words = extractWords(board)
    expect(words).toHaveLength(1)
    expect(words[0].word).toBe('SCRABBLE')
  })

  it('should handle complex grid with multiple intersecting words', () => {
    const board: Board = {}
    /*
     * Create grid:
     *   B
     *   A
     * CATS
     *   T
     */
    set(board, createTile('t1', 'B', 1, -1))
    set(board, createTile('t2', 'A', 1, 0))
    set(board, createTile('t3', 'C', 0, 1))
    set(board, createTile('t4', 'A', 1, 1)) // shared with BAT
    set(board, createTile('t5', 'T', 2, 1))
    set(board, createTile('t6', 'S', 3, 1))
    set(board, createTile('t7', 'T', 1, 2))
    
    const words = extractWords(board)
    expect(words).toHaveLength(2)
    
    const wordTexts = words.map(w => w.word).sort()
    expect(wordTexts).toEqual(['BAAT', 'CATS'])
  })
})