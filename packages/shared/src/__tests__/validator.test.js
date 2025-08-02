import { describe, it, expect } from 'vitest';
import { validateBoard } from '../validator';
import { set } from '../board';
const createTile = (id, letter, x, y) => ({
    id, letter, x, y
});
const createDictionary = (words) => new Set(words.map(w => w.toUpperCase()));
describe('validateBoard', () => {
    it('should validate empty board as ok', () => {
        const board = {};
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(true);
        expect(result.issues).toEqual([]);
        expect(result.connected).toBe(true);
    });
    it('should validate single tile as ok (no words to check)', () => {
        const board = {};
        set(board, createTile('t1', 'A', 0, 0));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(true);
        expect(result.issues).toEqual([]);
        expect(result.connected).toBe(true);
    });
    it('should validate valid word as ok', () => {
        const board = {};
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(true);
        expect(result.issues).toEqual([]);
        expect(result.connected).toBe(true);
    });
    it('should identify invalid word', () => {
        const board = {};
        set(board, createTile('t1', 'X', 0, 0));
        set(board, createTile('t2', 'Y', 1, 0));
        set(board, createTile('t3', 'Z', 2, 0));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].word).toBe('XYZ');
        expect(result.issues[0].cells).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 }
        ]);
        expect(result.connected).toBe(true);
    });
    it('should identify multiple invalid words', () => {
        const board = {};
        // Invalid horizontal word: XYZ
        set(board, createTile('t1', 'X', 0, 0));
        set(board, createTile('t2', 'Y', 1, 0));
        set(board, createTile('t3', 'Z', 2, 0));
        // Invalid vertical word: ABC
        set(board, createTile('t4', 'A', 1, 1));
        set(board, createTile('t5', 'B', 1, 2));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false);
        expect(result.issues).toHaveLength(2);
        const words = result.issues.map(issue => issue.word).sort();
        expect(words).toEqual(['XYZ', 'YAB']);
    });
    it('should validate mixed valid and invalid words', () => {
        const board = {};
        // Valid word: CAT
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        // Invalid word connected to valid word
        set(board, createTile('t4', 'X', 1, 1));
        set(board, createTile('t5', 'Y', 1, 2));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].word).toBe('AXY');
    });
    it('should handle disconnected tiles', () => {
        const board = {};
        // Valid word: CAT
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        // Disconnected valid word: DOG
        set(board, createTile('t4', 'D', 5, 5));
        set(board, createTile('t5', 'O', 6, 5));
        set(board, createTile('t6', 'G', 7, 5));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false);
        expect(result.issues).toEqual([]); // Both words are valid
        expect(result.connected).toBe(false); // But board is disconnected
    });
    it('should be case insensitive with dictionary', () => {
        const board = {};
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        // Dictionary with lowercase
        const dict = new Set(['cat', 'dog']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false); // Should fail because dict has lowercase
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].word).toBe('CAT');
    });
    it('should handle uppercase dictionary correctly', () => {
        const board = {};
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        const dict = createDictionary(['cat', 'dog']); // Will be converted to uppercase
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(true);
        expect(result.issues).toEqual([]);
    });
    it('should validate complex crossword pattern', () => {
        const board = {};
        /*
         * Create pattern:
         *   D
         *   O
         * CATS
         *   G
         */
        set(board, createTile('t1', 'D', 1, -1));
        set(board, createTile('t2', 'O', 1, 0));
        set(board, createTile('t3', 'C', 0, 1));
        set(board, createTile('t4', 'A', 1, 1)); // shared
        set(board, createTile('t5', 'T', 2, 1));
        set(board, createTile('t6', 'S', 3, 1));
        set(board, createTile('t7', 'G', 1, 2));
        const dict = createDictionary(['CATS', 'DOAG']); // DOAG is the vertical word
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(true);
        expect(result.issues).toEqual([]);
        expect(result.connected).toBe(true);
    });
    it('should handle board with only invalid words', () => {
        const board = {};
        set(board, createTile('t1', 'Q', 0, 0));
        set(board, createTile('t2', 'X', 1, 0));
        set(board, createTile('t3', 'Z', 2, 0));
        const dict = createDictionary(['CAT', 'DOG']);
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].word).toBe('QXZ');
        expect(result.connected).toBe(true);
    });
    it('should handle empty dictionary', () => {
        const board = {};
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        const dict = new Set();
        const result = validateBoard(board, dict);
        expect(result.ok).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].word).toBe('CAT');
    });
    it('should handle very large dictionary efficiently', () => {
        const board = {};
        set(board, createTile('t1', 'C', 0, 0));
        set(board, createTile('t2', 'A', 1, 0));
        set(board, createTile('t3', 'T', 2, 0));
        // Create large dictionary
        const largeDict = new Set();
        for (let i = 0; i < 10000; i++) {
            largeDict.add(`WORD${i}`);
        }
        largeDict.add('CAT');
        const startTime = Date.now();
        const result = validateBoard(board, largeDict);
        const endTime = Date.now();
        expect(result.ok).toBe(true);
        expect(endTime - startTime).toBeLessThan(100); // Should be fast with Set lookup
    });
    it('should preserve cell coordinates in issues', () => {
        const board = {};
        set(board, createTile('t1', 'X', 10, 20));
        set(board, createTile('t2', 'Y', 11, 20));
        set(board, createTile('t3', 'Z', 12, 20));
        const dict = createDictionary(['CAT']);
        const result = validateBoard(board, dict);
        expect(result.issues[0].cells).toEqual([
            { x: 10, y: 20 },
            { x: 11, y: 20 },
            { x: 12, y: 20 }
        ]);
    });
});
