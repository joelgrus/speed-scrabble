import { describe, it, expect } from 'vitest';
import { LETTER_VALUES } from '../letterValues';
// Expected Scrabble point values for validation
const EXPECTED_VALUES = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
    N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};
describe('LETTER_VALUES', () => {
    it('should contain values for all 26 letters', () => {
        const letters = Object.keys(LETTER_VALUES);
        expect(letters).toHaveLength(26);
        // Check all letters A-Z are present
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i); // A=65, B=66, etc.
            expect(LETTER_VALUES).toHaveProperty(letter);
        }
    });
    it('should have correct Scrabble point values', () => {
        Object.entries(EXPECTED_VALUES).forEach(([letter, expectedValue]) => {
            expect(LETTER_VALUES[letter]).toBe(expectedValue);
        });
    });
    it('should have only positive point values', () => {
        Object.values(LETTER_VALUES).forEach(value => {
            expect(value).toBeGreaterThan(0);
            expect(Number.isInteger(value)).toBe(true);
        });
    });
    it('should have the correct distribution of point values', () => {
        const valueDistribution = {};
        Object.values(LETTER_VALUES).forEach(value => {
            valueDistribution[value] = (valueDistribution[value] || 0) + 1;
        });
        // Expected distribution based on standard Scrabble
        expect(valueDistribution[1]).toBe(10); // A,E,I,O,U,L,N,S,T,R
        expect(valueDistribution[2]).toBe(2); // D,G
        expect(valueDistribution[3]).toBe(4); // B,C,M,P
        expect(valueDistribution[4]).toBe(5); // F,H,V,W,Y
        expect(valueDistribution[5]).toBe(1); // K
        expect(valueDistribution[8]).toBe(2); // J,X
        expect(valueDistribution[10]).toBe(2); // Q,Z
    });
    it('should have vowels with low point values', () => {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        vowels.forEach(vowel => {
            expect(LETTER_VALUES[vowel]).toBe(1);
        });
    });
    it('should have high-value letters for rare letters', () => {
        const rareLetters = ['Q', 'Z'];
        rareLetters.forEach(letter => {
            expect(LETTER_VALUES[letter]).toBe(10);
        });
        const uncommonLetters = ['J', 'X'];
        uncommonLetters.forEach(letter => {
            expect(LETTER_VALUES[letter]).toBe(8);
        });
    });
    it('should be immutable', () => {
        expect(Object.isFrozen(LETTER_VALUES)).toBe(true);
        // Try to modify - should fail silently or throw in strict mode
        const originalValue = LETTER_VALUES.A;
        expect(originalValue).toBe(1);
        try {
            // @ts-expect-error - Testing immutability
            LETTER_VALUES.A = 999;
        }
        catch {
            // Expected in strict mode
        }
        // Value should remain unchanged
        expect(LETTER_VALUES.A).toBe(originalValue);
    });
    it('should handle all valid Letter type values', () => {
        // Test that all entries match the Letter type
        Object.keys(LETTER_VALUES).forEach(key => {
            expect(key).toMatch(/^[A-Z]$/);
            expect(key.length).toBe(1);
        });
    });
    it('should have consistent type structure', () => {
        Object.entries(LETTER_VALUES).forEach(([letter, value]) => {
            expect(typeof letter).toBe('string');
            expect(typeof value).toBe('number');
            expect(letter).toMatch(/^[A-Z]$/);
            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThan(0);
            expect(value).toBeLessThanOrEqual(10); // Max Scrabble value is 10
        });
    });
    it('should match expected total point distribution', () => {
        // Calculate total points for all letters (useful for game balance)
        const totalPoints = Object.values(LETTER_VALUES).reduce((sum, value) => sum + value, 0);
        // Expected total: 10×1 + 2×2 + 4×3 + 5×4 + 1×5 + 2×8 + 2×10 = 87
        expect(totalPoints).toBe(87);
    });
    it('should allow lookup by Letter type', () => {
        // Test type compatibility
        const letter = 'A';
        const value = LETTER_VALUES[letter];
        expect(value).toBe(1);
        // Test with all letters
        const allLetters = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ];
        allLetters.forEach(letter => {
            expect(typeof LETTER_VALUES[letter]).toBe('number');
            expect(LETTER_VALUES[letter]).toBeGreaterThan(0);
        });
    });
});
