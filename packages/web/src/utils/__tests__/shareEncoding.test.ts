import { describe, it, expect } from 'vitest';
import {
  encodeGameResult,
  decodeGameResult,
  createShareUrl,
  parseShareUrl,
  type GameResult,
} from '@ss/shared';

describe('shareEncoding', () => {
  describe('encodeGameResult and decodeGameResult', () => {
    it('should encode and decode a simple game result', () => {
      const original: GameResult = {
        username: 'WebTester',
        date: '2024-01-15',
        width: 5,
        height: 5,
        grid: 'HELLO.O....R....L....D...', // 5x5 = 25 chars
        time: 143,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle single character grids', () => {
      const original: GameResult = {
        username: 'Single',
        date: '2024-02-01',
        width: 1,
        height: 1,
        grid: 'A',
        time: 30,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle large grids', () => {
      const width = 25;
      const height = 25;
      const grid = 'A'.repeat(width * height);
      const original: GameResult = {
        username: 'BigGrid',
        date: '2024-03-15',
        width,
        height,
        grid,
        time: 3600, // 1 hour
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle grids with dots and letters', () => {
      const original: GameResult = {
        username: 'DotTest',
        date: '2024-04-10',
        width: 3,
        height: 3,
        grid: 'A.B.C.D.E',
        time: 90,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should reject invalid dimensions', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 256,
        height: 1,
        grid: 'A',
        time: 100,
      })).toThrow('Width and height must be between 1 and 255');
    });

    it('should reject mismatched grid length', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 3,
        height: 3,
        grid: 'ABCD', // Should be 9 characters
        time: 100,
      })).toThrow("Grid length 4 doesn't match dimensions 3x3");
    });

    it('should create and parse share URLs', () => {
      const original: GameResult = {
        username: 'URLTest',
        date: '2024-07-15',
        width: 4,
        height: 2,
        grid: 'TEST.ing',
        time: 180,
      };

      const baseUrl = 'https://speed-scrabble.com';
      const url = createShareUrl(original, baseUrl);
      
      expect(url).toMatch(/^https:\/\/speed-scrabble\.com\/share\?game=/);
      
      const parsed = parseShareUrl(url);
      expect(parsed).toEqual(original);
    });

    it('should handle typical Speed Scrabble result', () => {
      const original: GameResult = {
        username: 'TypicalWeb',
        date: '2024-12-15',
        width: 15,
        height: 8,
        grid: '.'.repeat(120), // 15x8 = 120 chars
        time: 245, // 4:05
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
      
      // Check that encoding is reasonably compact  
      expect(encoded.length).toBeLessThan(80); // Mostly empty grid should compress very well
    });
  });
});