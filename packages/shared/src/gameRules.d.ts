/**
 * Game rules validation and management utilities
 */
import type { GameMode, BaseRules, TimedGameRules, GameRules } from './types';
/**
 * Validates base game rules
 */
export declare function validateBaseRules(rules: Partial<BaseRules>): BaseRules | null;
/**
 * Validates timed game rules
 */
export declare function validateTimedRules(rules: Partial<TimedGameRules>): TimedGameRules | null;
/**
 * Creates a complete GameRules object with validation
 */
export declare function createGameRules(mode: GameMode, customRules?: Partial<BaseRules | TimedGameRules>): GameRules | null;
/**
 * Gets the effective rules for the current game mode
 */
export declare function getEffectiveRules(gameRules: GameRules): BaseRules;
/**
 * Checks if the current game mode supports timed features
 */
export declare function isTimedMode(gameRules: GameRules): gameRules is GameRules & {
    timed: TimedGameRules;
};
/**
 * Gets timed rules if available
 */
export declare function getTimedRules(gameRules: GameRules): TimedGameRules | null;
/**
 * Creates default classic game rules
 */
export declare function createClassicRules(): GameRules;
/**
 * Creates default timed game rules
 */
export declare function createTimedRules(): GameRules;
/**
 * Migrates legacy Rules to new GameRules format
 */
export declare function migrateFromLegacyRules(legacyRules: BaseRules): GameRules;
//# sourceMappingURL=gameRules.d.ts.map