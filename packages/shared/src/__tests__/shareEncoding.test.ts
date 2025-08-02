import { describe, it, expect } from 'vitest';
import {
  encodeGameResult,
  decodeGameResult,
  createShareUrl,
  parseShareUrl,
  type GameResult,
} from '../shareEncoding';

describe('shareEncoding', () => {
  describe('encodeGameResult and decodeGameResult', () => {
    it('should encode and decode a simple game result', () => {
      const original: GameResult = {
        username: 'TestUser',
        date: '2024-01-15',
        width: 5,
        height: 3,
        grid: 'HELLO.O....R...', // 5x3 = 15 chars
        time: 143,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle single character grids', () => {
      const original: GameResult = {
        username: 'Player1',
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
        username: 'PowerUser',
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
        username: 'Puzzle123',
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

    it('should handle maximum time value', () => {
      const original: GameResult = {
        username: 'SlowPlayer',
        date: '2024-05-20',
        width: 2,
        height: 2,
        grid: 'ABCD',
        time: 0xFFFFFFFF, // Maximum 32-bit unsigned int
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle zero time', () => {
      const original: GameResult = {
        username: 'FastPlayer',
        date: '2024-06-01',
        width: 2,
        height: 2,
        grid: 'ABCD',
        time: 0,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });
  });

  describe('validation', () => {
    it('should reject invalid dimensions - width too large', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 256,
        height: 1,
        grid: 'A',
        time: 100,
      })).toThrow('Width and height must be between 1 and 255');
    });

    it('should reject invalid dimensions - height too large', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 1,
        height: 256,
        grid: 'A',
        time: 100,
      })).toThrow('Width and height must be between 1 and 255');
    });

    it('should reject invalid dimensions - zero width', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 0,
        height: 1,
        grid: '',
        time: 100,
      })).toThrow('Width and height must be between 1 and 255');
    });

    it('should reject invalid time - negative', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 1,
        height: 1,
        grid: 'A',
        time: -1,
      })).toThrow('Time must be between 0 and 4294967295 seconds');
    });

    it('should reject invalid time - too large', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024-01-01',
        width: 1,
        height: 1,
        grid: 'A',
        time: 0x100000000, // Larger than 32-bit
      })).toThrow('Time must be between 0 and 4294967295 seconds');
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

    it('should reject empty username', () => {
      expect(() => encodeGameResult({
        username: '',
        date: '2024-01-01',
        width: 1,
        height: 1,
        grid: 'A',
        time: 100,
      })).toThrow('Username must be between 1 and 255 characters');
    });

    it('should reject invalid date format', () => {
      expect(() => encodeGameResult({
        username: 'Test',
        date: '2024/01/01', // Wrong format
        width: 1,
        height: 1,
        grid: 'A',
        time: 100,
      })).toThrow('Date must be in YYYY-MM-DD format');
    });

    it('should reject too long username', () => {
      expect(() => encodeGameResult({
        username: 'A'.repeat(256),
        date: '2024-01-01',
        width: 1,
        height: 1,
        grid: 'A',
        time: 100,
      })).toThrow('Username must be between 1 and 255 characters');
    });
  });

  describe('decoding validation', () => {
    it('should reject invalid base64', () => {
      expect(() => decodeGameResult('invalid-base64!')).toThrow('Failed to decode game result');
    });

    it('should reject too short encoding', () => {
      // Create valid base64 but too short (less than 12 bytes minimum)
      const shortBytes = new Uint8Array([1, 2, 3]);
      const shortEncoding = btoa(String.fromCharCode(...shortBytes));
      
      expect(() => decodeGameResult(shortEncoding)).toThrow('Invalid encoding: too short');
    });

    it('should reject corrupted dimensions', () => {
      // Create encoding with invalid dimensions (width = 0)
      // Format: [usernameLen:1][username][dateLen:1][date][width:2][height:2][time:4][grid]
      const username = 'Test';
      const date = '2024-01-01';
      const usernameBytes = new TextEncoder().encode(username);
      const dateBytes = new TextEncoder().encode(date);
      
      const buffer = new ArrayBuffer(1 + usernameBytes.length + 1 + dateBytes.length + 8 + 1);
      const view = new DataView(buffer);
      const bytes = new Uint8Array(buffer);
      
      let offset = 0;
      // Write username
      view.setUint8(offset, usernameBytes.length);
      offset += 1;
      bytes.set(usernameBytes, offset);
      offset += usernameBytes.length;
      
      // Write date
      view.setUint8(offset, dateBytes.length);
      offset += 1;
      bytes.set(dateBytes, offset);
      offset += dateBytes.length;
      
      // Write invalid dimensions
      view.setUint16(offset, 0, false); // Invalid width
      offset += 2;
      view.setUint16(offset, 1, false);
      offset += 2;
      view.setUint32(offset, 100, false);
      offset += 4;
      
      // Add minimal grid
      bytes[offset] = 65; // 'A'
      
      const invalidEncoding = btoa(String.fromCharCode(...bytes));
      
      expect(() => decodeGameResult(invalidEncoding)).toThrow('Invalid dimensions in encoding');
    });

    it('should reject grid length mismatch', () => {
      // Create encoding where grid length doesn't match dimensions
      const username = 'Test';
      const date = '2024-01-01';
      const usernameBytes = new TextEncoder().encode(username);
      const dateBytes = new TextEncoder().encode(date);
      
      const buffer = new ArrayBuffer(1 + usernameBytes.length + 1 + dateBytes.length + 8 + 2); // 2 grid bytes instead of 9
      const view = new DataView(buffer);
      const bytes = new Uint8Array(buffer);
      
      let offset = 0;
      // Write username
      view.setUint8(offset, usernameBytes.length);
      offset += 1;
      bytes.set(usernameBytes, offset);
      offset += usernameBytes.length;
      
      // Write date
      view.setUint8(offset, dateBytes.length);
      offset += 1;
      bytes.set(dateBytes, offset);
      offset += dateBytes.length;
      
      // Write dimensions that expect 9 grid bytes
      view.setUint16(offset, 3, false); // width = 3
      offset += 2;
      view.setUint16(offset, 3, false); // height = 3 (expects 9 grid bytes)
      offset += 2;
      view.setUint32(offset, 100, false);
      offset += 4;
      
      // Only providing 2 grid bytes instead of 9
      bytes[offset] = 65; // 'A'
      bytes[offset + 1] = 66; // 'B'
      
      const invalidEncoding = btoa(String.fromCharCode(...bytes));
      
      expect(() => decodeGameResult(invalidEncoding)).toThrow('Decompressed grid length mismatch');
    });
  });

  describe('URL functions', () => {
    it('should create and parse share URLs', () => {
      const original: GameResult = {
        username: 'URLTester',
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

    it('should handle URLs without base URL', () => {
      const original: GameResult = {
        username: 'NoBase',
        date: '2024-08-01',
        width: 2,
        height: 2,
        grid: 'ABCD',
        time: 60,
      };

      const url = createShareUrl(original);
      expect(url).toMatch(/^\/share\?game=/);
      
      // Create full URL for parsing
      const fullUrl = 'https://example.com' + url;
      const parsed = parseShareUrl(fullUrl);
      expect(parsed).toEqual(original);
    });

    it('should handle URL encoding/decoding', () => {
      const original: GameResult = {
        username: 'Special+User',
        date: '2024-09-01',
        width: 3,
        height: 1,
        grid: 'A+B', // Characters that need URL encoding
        time: 123,
      };

      const url = createShareUrl(original, 'https://test.com');
      const parsed = parseShareUrl(url);
      expect(parsed).toEqual(original);
    });

    it('should reject URLs without game parameter', () => {
      expect(() => parseShareUrl('https://test.com/share')).toThrow('No game parameter found in URL');
    });

    it('should reject URLs with invalid game parameter', () => {
      expect(() => parseShareUrl('https://test.com/share?game=invalid')).toThrow('Failed to decode game result');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in grid', () => {
      const original: GameResult = {
        username: 'Special123',
        date: '2024-10-01',
        width: 4,
        height: 1,
        grid: 'A.?!', // Mix of letters, dots, and special chars
        time: 75,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle maximum dimensions', () => {
      const original: GameResult = {
        username: 'MaxDims',
        date: '2024-11-01',
        width: 255,
        height: 255,
        grid: '.'.repeat(255 * 255),
        time: 7200,
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should produce consistent encoding', () => {
      const result: GameResult = {
        username: 'Consistent',
        date: '2024-12-01',
        width: 3,
        height: 2,
        grid: 'ABCDEF',
        time: 100,
      };

      const encoded1 = encodeGameResult(result);
      const encoded2 = encodeGameResult(result);

      expect(encoded1).toBe(encoded2);
    });
  });

  describe('real world scenarios', () => {
    it('should handle typical Speed Scrabble result', () => {
      const original: GameResult = {
        username: 'TypicalPlayer',
        date: '2024-12-15',
        width: 15,
        height: 8,
        grid: 'HELLO..........WORLD.QUICK.....BROWN.FOX.JUMPS.OVER.LAZY..DOG.THE.....END.....' + '.'.repeat(42), // 15x8 = 120 chars
        time: 245, // 4:05
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
      
      // Check that encoding is reasonably compact (this test has a lot of letters)
      expect(encoded.length).toBeLessThan(200); // Should be much smaller with compression
    });

    it('should handle very fast completion', () => {
      const original: GameResult = {
        username: 'SpeedDemon',
        date: '2024-12-20',
        width: 8,
        height: 3,
        grid: 'SPEED...SCRABBLE....GAME', // 8x3 = 24 chars
        time: 45, // 45 seconds - very fast!
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle slow completion with many empty spaces', () => {
      const original: GameResult = {
        username: 'SlowAndSteady',
        date: '2024-12-25',
        width: 20,
        height: 10,
        grid: 'A' + '.'.repeat(198) + 'Z', // Sparse grid
        time: 1800, // 30 minutes - very slow
      };

      const encoded = encodeGameResult(original);
      const decoded = decodeGameResult(encoded);

      expect(decoded).toEqual(original);
    });
  });
});