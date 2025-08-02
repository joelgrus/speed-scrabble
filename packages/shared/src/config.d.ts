/**
 * Centralized configuration for Speed Scrabble game
 * All magic numbers, constants, and configurable parameters should be defined here
 */
import type { Rules } from './types';
/** Size of each board cell in pixels */
export declare const CELL_SIZE = 40;
/** Number of cells visible around the board origin */
export declare const GRID_SIZE = 25;
/** Canvas zoom constraints */
export declare const ZOOM_CONFIG: {
    /** Minimum zoom level */
    readonly min: 0.3;
    /** Maximum zoom level */
    readonly max: 3;
    /** Zoom increment factor per scroll step */
    readonly step: 1.1;
};
/** Tile interaction visual effects */
export declare const TILE_EFFECTS: {
    /** Hover scale multiplier */
    readonly hoverScale: 1.05;
    /** Long press scale multiplier */
    readonly longPressScale: 1.1;
    /** Hover lift offset in pixels */
    readonly hoverLift: -1;
    /** Long press lift offset in pixels */
    readonly longPressLift: -2;
    /** Long press duration in milliseconds */
    readonly longPressDuration: 500;
    /** Tile scale offset for long press effect */
    readonly scaleOffset: 0.05;
};
/** Animation durations in milliseconds */
export declare const ANIMATION_DURATIONS: {
    /** Tile rack new tile animation */
    readonly tileAnimation: 600;
    /** Draw notification display time */
    readonly drawNotification: 1000;
    /** Victory screen entrance animation */
    readonly victoryEntrance: 600;
    /** Fade in animation for overlays */
    readonly fadeIn: 500;
};
/** Default game rules for classic mode */
export declare const DEFAULT_GAME_RULES: Rules;
/** Dumping mechanics configuration */
export declare const DUMP_CONFIG: {
    /** Number of tiles drawn after dumping one tile */
    readonly tilesPerDump: 3;
    /** Minimum tiles required in bag to allow dumping */
    readonly minimumBagSize: 3;
};
/** Input validation bounds */
export declare const VALIDATION_BOUNDS: {
    /** Maximum allowed coordinate value */
    readonly maxCoordinate: 10000;
    /** Minimum allowed coordinate value */
    readonly minCoordinate: -10000;
};
/** Performance tuning parameters */
export declare const PERFORMANCE_CONFIG: {
    /** Debounce delay for board validation in milliseconds */
    readonly validationDebounceMs: 100;
    /** Delay before auto-draw triggers in milliseconds */
    readonly autoDrawDelayMs: 150;
};
/** Timer and scoring configuration (for future timed mode) */
export declare const TIMED_GAME_CONFIG: {
    /** Default game duration in seconds */
    readonly defaultDuration: 180;
    /** Warning threshold in seconds (when timer turns red) */
    readonly warningThreshold: 30;
    /** Time penalty per dump in seconds */
    readonly dumpTimePenalty: 30;
    /** Maximum number of dumps allowed per game */
    readonly maxDumpsPerGame: 3;
    /** Bonus points per second remaining */
    readonly timeBonus: 1;
};
/** Scoring configuration (for future timed mode) */
export declare const SCORING_CONFIG: {
    /** Base multiplier for word scoring */
    readonly baseMultiplier: 1;
    /** Bonus multiplier for longer words */
    readonly lengthBonusMultiplier: 0.1;
    /** Minimum word length for length bonus */
    readonly lengthBonusThreshold: 5;
};
/** Configuration for development and testing */
export declare const DEV_CONFIG: {
    /** Test seed values for deterministic behavior */
    readonly testSeeds: {
        readonly default: 42;
        readonly alternative: 12345;
        readonly stress: 999;
    };
    /** Debug logging flags */
    readonly debug: {
        readonly rng: false;
        readonly validation: false;
        readonly stateChanges: false;
    };
};
export type GameConfig = {
    ui: {
        CELL_SIZE: typeof CELL_SIZE;
        GRID_SIZE: typeof GRID_SIZE;
    } & typeof ZOOM_CONFIG & typeof TILE_EFFECTS;
    rules: typeof DEFAULT_GAME_RULES & typeof DUMP_CONFIG;
    validation: typeof VALIDATION_BOUNDS;
    performance: typeof PERFORMANCE_CONFIG;
    timed: typeof TIMED_GAME_CONFIG & typeof SCORING_CONFIG;
};
/** Complete game configuration object */
export declare const GAME_CONFIG: GameConfig;
//# sourceMappingURL=config.d.ts.map