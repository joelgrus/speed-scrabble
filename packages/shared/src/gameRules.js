/**
 * Game rules validation and management utilities
 */
import { DEFAULT_GAME_RULES, TIMED_GAME_CONFIG } from './config';
/**
 * Validates base game rules
 */
export function validateBaseRules(rules) {
    if (typeof rules.startDraw !== 'number' || rules.startDraw < 1 || rules.startDraw > 15) {
        return null;
    }
    if (typeof rules.drawAmount !== 'number' || rules.drawAmount < 1 || rules.drawAmount > 10) {
        return null;
    }
    if (typeof rules.dumpEnabled !== 'boolean') {
        return null;
    }
    return {
        startDraw: rules.startDraw,
        drawAmount: rules.drawAmount,
        dumpEnabled: rules.dumpEnabled,
    };
}
/**
 * Validates timed game rules
 */
export function validateTimedRules(rules) {
    const baseRules = validateBaseRules(rules);
    if (!baseRules)
        return null;
    if (typeof rules.gameDuration !== 'number' || rules.gameDuration < 30 || rules.gameDuration > 3600) {
        return null;
    }
    if (typeof rules.dumpTimePenalty !== 'number' || rules.dumpTimePenalty < 0 || rules.dumpTimePenalty > 60) {
        return null;
    }
    if (typeof rules.maxDumps !== 'number' || rules.maxDumps < 0 || rules.maxDumps > 10) {
        return null;
    }
    if (typeof rules.timeBonus !== 'number' || rules.timeBonus < 0 || rules.timeBonus > 10) {
        return null;
    }
    return {
        ...baseRules,
        gameDuration: rules.gameDuration,
        dumpTimePenalty: rules.dumpTimePenalty,
        maxDumps: rules.maxDumps,
        timeBonus: rules.timeBonus,
    };
}
/**
 * Creates a complete GameRules object with validation
 */
export function createGameRules(mode, customRules) {
    switch (mode) {
        case 'classic': {
            const base = validateBaseRules(customRules || DEFAULT_GAME_RULES);
            if (!base)
                return null;
            return {
                mode: 'classic',
                base,
            };
        }
        case 'timed': {
            const defaultTimedRules = {
                ...DEFAULT_GAME_RULES,
                gameDuration: TIMED_GAME_CONFIG.defaultDuration,
                dumpTimePenalty: TIMED_GAME_CONFIG.dumpTimePenalty,
                maxDumps: TIMED_GAME_CONFIG.maxDumpsPerGame,
                timeBonus: TIMED_GAME_CONFIG.timeBonus,
            };
            const timed = validateTimedRules(customRules || defaultTimedRules);
            if (!timed)
                return null;
            return {
                mode: 'timed',
                base: {
                    startDraw: timed.startDraw,
                    drawAmount: timed.drawAmount,
                    dumpEnabled: timed.dumpEnabled,
                },
                timed,
            };
        }
        case 'custom': {
            // For custom mode, allow any valid base rules
            const base = validateBaseRules(customRules || DEFAULT_GAME_RULES);
            if (!base)
                return null;
            return {
                mode: 'custom',
                base,
            };
        }
        default:
            return null;
    }
}
/**
 * Gets the effective rules for the current game mode
 */
export function getEffectiveRules(gameRules) {
    return gameRules.base;
}
/**
 * Checks if the current game mode supports timed features
 */
export function isTimedMode(gameRules) {
    return gameRules.mode === 'timed' && gameRules.timed !== undefined;
}
/**
 * Gets timed rules if available
 */
export function getTimedRules(gameRules) {
    return isTimedMode(gameRules) ? gameRules.timed : null;
}
/**
 * Creates default classic game rules
 */
export function createClassicRules() {
    return {
        mode: 'classic',
        base: DEFAULT_GAME_RULES,
    };
}
/**
 * Creates default timed game rules
 */
export function createTimedRules() {
    const timedRules = createGameRules('timed');
    if (!timedRules) {
        throw new Error('Failed to create default timed rules');
    }
    return timedRules;
}
/**
 * Migrates legacy Rules to new GameRules format
 */
export function migrateFromLegacyRules(legacyRules) {
    return {
        mode: 'classic',
        base: legacyRules,
    };
}
