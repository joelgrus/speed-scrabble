import { describe, it, expect } from 'vitest'
import {
  CoordZ,
  OrientationZ,
  LetterZ,
  TileZ,
  PlacedTileZ,
  BoardZ,
  GameModeZ,
  BaseRulesZ,
  TimedGameRulesZ,
  GameRulesZ,
  RulesZ,
  CursorZ,
  ValidationIssueZ,
  ValidationResultZ,
} from '../schemas'
import type {
  Coord,
  Orientation,
  Letter,
  Tile,
  PlacedTile,
  Board,
  GameMode,
  BaseRules,
  TimedGameRules,
  GameRules,
  Rules,
  Cursor,
  ValidationIssue,
  ValidationResult,
} from '../types'

describe('Schema Type Alignment', () => {
  describe('CoordZ', () => {
    it('should validate valid coordinates', () => {
      const validCoord: Coord = { x: 5, y: -3 }
      expect(CoordZ.parse(validCoord)).toEqual(validCoord)
    })

    it('should reject non-integer coordinates', () => {
      expect(() => CoordZ.parse({ x: 5.5, y: 3 })).toThrow()
      expect(() => CoordZ.parse({ x: 5, y: 3.7 })).toThrow()
    })
  })

  describe('LetterZ', () => {
    it('should validate all letter types', () => {
      const letters: Letter[] = ['A', 'B', 'Z']
      letters.forEach(letter => {
        expect(LetterZ.parse(letter)).toBe(letter)
      })
    })

    it('should reject invalid letters', () => {
      expect(() => LetterZ.parse('1')).toThrow()
      expect(() => LetterZ.parse('a')).toThrow()
      expect(() => LetterZ.parse('AA')).toThrow()
    })
  })

  describe('TileZ', () => {
    it('should validate valid tiles', () => {
      const validTile: Tile = { id: 't1', letter: 'A' }
      expect(TileZ.parse(validTile)).toEqual(validTile)
    })

    it('should reject invalid tile letters', () => {
      expect(() => TileZ.parse({ id: 't1', letter: '1' })).toThrow()
    })
  })

  describe('PlacedTileZ', () => {
    it('should validate valid placed tiles', () => {
      const validPlacedTile: PlacedTile = { id: 't1', letter: 'A', x: 5, y: -3 }
      expect(PlacedTileZ.parse(validPlacedTile)).toEqual(validPlacedTile)
    })

    it('should reject non-integer coordinates', () => {
      expect(() => PlacedTileZ.parse({ id: 't1', letter: 'A', x: 5.5, y: 3 })).toThrow()
    })
  })

  describe('GameModeZ', () => {
    it('should validate all game modes', () => {
      const modes: GameMode[] = ['classic', 'timed', 'custom']
      modes.forEach(mode => {
        expect(GameModeZ.parse(mode)).toBe(mode)
      })
    })

    it('should reject invalid game modes', () => {
      expect(() => GameModeZ.parse('invalid')).toThrow()
    })
  })

  describe('BaseRulesZ', () => {
    it('should validate valid base rules', () => {
      const validRules: BaseRules = {
        startDraw: 7,
        drawAmount: 2,
        dumpEnabled: true
      }
      expect(BaseRulesZ.parse(validRules)).toEqual(validRules)
    })

    it('should reject invalid values', () => {
      expect(() => BaseRulesZ.parse({ startDraw: 0, drawAmount: 2, dumpEnabled: true })).toThrow()
      expect(() => BaseRulesZ.parse({ startDraw: 7, drawAmount: 0, dumpEnabled: true })).toThrow()
      expect(() => BaseRulesZ.parse({ startDraw: 16, drawAmount: 2, dumpEnabled: true })).toThrow()
      expect(() => BaseRulesZ.parse({ startDraw: 7, drawAmount: 4, dumpEnabled: true })).toThrow()
    })
  })

  describe('TimedGameRulesZ', () => {
    it('should validate valid timed rules', () => {
      const validTimedRules: TimedGameRules = {
        startDraw: 7,
        drawAmount: 2,
        dumpEnabled: true,
        gameDuration: 300,
        dumpTimePenalty: 30,
        maxDumps: 5,
        timeBonus: 10
      }
      expect(TimedGameRulesZ.parse(validTimedRules)).toEqual(validTimedRules)
    })

    it('should reject invalid time values', () => {
      const baseRules = { startDraw: 7, drawAmount: 2, dumpEnabled: true }
      
      // Game duration too short
      expect(() => TimedGameRulesZ.parse({
        ...baseRules,
        gameDuration: 30,
        dumpTimePenalty: 30,
        maxDumps: 5,
        timeBonus: 10
      })).toThrow()

      // Penalty too long
      expect(() => TimedGameRulesZ.parse({
        ...baseRules,
        gameDuration: 300,
        dumpTimePenalty: 400,
        maxDumps: 5,
        timeBonus: 10
      })).toThrow()
    })
  })

  describe('GameRulesZ', () => {
    it('should validate classic game rules', () => {
      const classicRules: GameRules = {
        mode: 'classic',
        base: {
          startDraw: 7,
          drawAmount: 2,
          dumpEnabled: true
        }
      }
      expect(GameRulesZ.parse(classicRules)).toEqual(classicRules)
    })

    it('should validate timed game rules', () => {
      const timedRules: GameRules = {
        mode: 'timed',
        base: {
          startDraw: 7,
          drawAmount: 2,
          dumpEnabled: true
        },
        timed: {
          startDraw: 7,
          drawAmount: 2,
          dumpEnabled: true,
          gameDuration: 300,
          dumpTimePenalty: 30,
          maxDumps: 5,
          timeBonus: 10
        }
      }
      expect(GameRulesZ.parse(timedRules)).toEqual(timedRules)
    })
  })

  describe('RulesZ (Legacy)', () => {
    it('should validate legacy rules format', () => {
      const legacyRules: Rules = {
        startDraw: 7,
        drawAmount: 2,
        dumpEnabled: true
      }
      expect(RulesZ.parse(legacyRules)).toEqual(legacyRules)
    })
  })

  describe('CursorZ', () => {
    it('should validate valid cursor', () => {
      const validCursor: Cursor = {
        pos: { x: 5, y: -3 },
        orient: 'H'
      }
      expect(CursorZ.parse(validCursor)).toEqual(validCursor)
    })

    it('should reject invalid orientation', () => {
      expect(() => CursorZ.parse({
        pos: { x: 5, y: 3 },
        orient: 'X'
      })).toThrow()
    })
  })

  describe('ValidationResultZ', () => {
    it('should validate complete validation result', () => {
      const validResult: ValidationResult = {
        ok: false,
        issues: [
          {
            word: 'XYZ',
            cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]
          }
        ],
        connected: true
      }
      expect(ValidationResultZ.parse(validResult)).toEqual(validResult)
    })

    it('should validate empty issues array', () => {
      const validResult: ValidationResult = {
        ok: true,
        issues: [],
        connected: true
      }
      expect(ValidationResultZ.parse(validResult)).toEqual(validResult)
    })
  })

  describe('BoardZ', () => {
    it('should validate board with placed tiles', () => {
      const validBoard: Board = {
        '0,0': { id: 't1', letter: 'C', x: 0, y: 0 },
        '1,0': { id: 't2', letter: 'A', x: 1, y: 0 },
        '2,0': { id: 't3', letter: 'T', x: 2, y: 0 }
      }
      expect(BoardZ.parse(validBoard)).toEqual(validBoard)
    })

    it('should validate empty board', () => {
      const emptyBoard: Board = {}
      expect(BoardZ.parse(emptyBoard)).toEqual(emptyBoard)
    })
  })
})