import { describe, it, expect } from 'vitest';
import { mulberry32, seedFromString } from '../rng';
describe('mulberry32', () => {
    it('should produce deterministic sequences with same seed', () => {
        const rng1 = mulberry32(12345);
        const rng2 = mulberry32(12345);
        // Generate same sequence
        const sequence1 = Array.from({ length: 10 }, () => rng1());
        const sequence2 = Array.from({ length: 10 }, () => rng2());
        expect(sequence1).toEqual(sequence2);
    });
    it('should produce different sequences with different seeds', () => {
        const rng1 = mulberry32(12345);
        const rng2 = mulberry32(54321);
        const sequence1 = Array.from({ length: 10 }, () => rng1());
        const sequence2 = Array.from({ length: 10 }, () => rng2());
        expect(sequence1).not.toEqual(sequence2);
    });
    it('should produce numbers in range [0, 1)', () => {
        const rng = mulberry32(42);
        for (let i = 0; i < 1000; i++) {
            const value = rng();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });
    it('should produce uniformly distributed values', () => {
        const rng = mulberry32(12345);
        const buckets = Array(10).fill(0);
        const samples = 10000;
        for (let i = 0; i < samples; i++) {
            const value = rng();
            const bucket = Math.floor(value * 10);
            buckets[bucket]++;
        }
        // Each bucket should have roughly 10% of samples (within reasonable variance)
        const expectedPerBucket = samples / 10;
        const tolerance = expectedPerBucket * 0.2; // 20% tolerance
        buckets.forEach(count => {
            expect(count).toBeGreaterThan(expectedPerBucket - tolerance);
            expect(count).toBeLessThan(expectedPerBucket + tolerance);
        });
    });
    it('should handle edge case seeds', () => {
        // Test with zero seed
        const rng0 = mulberry32(0);
        expect(typeof rng0()).toBe('number');
        // Test with maximum 32-bit unsigned integer
        const rngMax = mulberry32(0xFFFFFFFF);
        expect(typeof rngMax()).toBe('number');
        // Test with negative seed (should be converted to unsigned)
        const rngNeg = mulberry32(-1);
        expect(typeof rngNeg()).toBe('number');
    });
});
describe('seedFromString', () => {
    it('should produce same seed for same string', () => {
        const seed1 = seedFromString('hello world');
        const seed2 = seedFromString('hello world');
        expect(seed1).toBe(seed2);
    });
    it('should produce different seeds for different strings', () => {
        const seed1 = seedFromString('hello');
        const seed2 = seedFromString('world');
        expect(seed1).not.toBe(seed2);
    });
    it('should handle empty string', () => {
        const seed = seedFromString('');
        expect(typeof seed).toBe('number');
        expect(seed).toBeGreaterThanOrEqual(0);
    });
    it('should handle long strings', () => {
        const longString = 'a'.repeat(1000);
        const seed = seedFromString(longString);
        expect(typeof seed).toBe('number');
        expect(seed).toBeGreaterThanOrEqual(0);
    });
    it('should handle special characters', () => {
        const specialString = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const seed = seedFromString(specialString);
        expect(typeof seed).toBe('number');
        expect(seed).toBeGreaterThanOrEqual(0);
    });
    it('should produce different seeds for strings differing only in case', () => {
        const seed1 = seedFromString('Hello');
        const seed2 = seedFromString('hello');
        expect(seed1).not.toBe(seed2);
    });
    it('should be consistent with RNG integration', () => {
        const seedStr = 'test-seed-123';
        const seed = seedFromString(seedStr);
        const rng1 = mulberry32(seed);
        const rng2 = mulberry32(seedFromString(seedStr));
        // Should produce identical sequences
        for (let i = 0; i < 10; i++) {
            expect(rng1()).toBe(rng2());
        }
    });
});
