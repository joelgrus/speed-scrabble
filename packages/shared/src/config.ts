/**
 * Centralized configuration for Speed Scrabble game
 * All magic numbers, constants, and configurable parameters should be defined here
 */

import type { Rules } from './types';

// =============================================================================
// UI & RENDERING CONSTANTS
// =============================================================================

/** Size of each board cell in pixels */
export const CELL_SIZE = 40;

/** Number of cells visible around the board origin */
export const GRID_SIZE = 25;

/** Canvas zoom constraints */
export const ZOOM_CONFIG = {
  /** Minimum zoom level */
  min: 0.3,
  /** Maximum zoom level */
  max: 3.0,
  /** Zoom increment factor per scroll step */
  step: 1.1,
} as const;

/** Tile interaction visual effects */
export const TILE_EFFECTS = {
  /** Hover scale multiplier */
  hoverScale: 1.05,
  /** Long press scale multiplier */
  longPressScale: 1.1,
  /** Hover lift offset in pixels */
  hoverLift: -1,
  /** Long press lift offset in pixels */
  longPressLift: -2,
  /** Long press duration in milliseconds */
  longPressDuration: 500,
  /** Tile scale offset for long press effect */
  scaleOffset: 0.05,
} as const;

/** Animation durations in milliseconds */
export const ANIMATION_DURATIONS = {
  /** Tile rack new tile animation */
  tileAnimation: 600,
  /** Draw notification display time */
  drawNotification: 1000,
  /** Victory screen entrance animation */
  victoryEntrance: 600,
  /** Fade in animation for overlays */
  fadeIn: 500,
} as const;

// =============================================================================
// GAME RULES & MECHANICS
// =============================================================================

/** Default game rules for classic mode */
export const DEFAULT_GAME_RULES: Rules = {
  /** Initial number of tiles drawn at game start */
  startDraw: 7,
  /** Number of tiles drawn when rack is empty and board is valid */
  drawAmount: 2,
  /** Whether tile dumping is enabled */
  dumpEnabled: true,
} as const;

/** Dumping mechanics configuration */
export const DUMP_CONFIG = {
  /** Number of tiles drawn after dumping one tile */
  tilesPerDump: 3,
  /** Minimum tiles required in bag to allow dumping */
  minimumBagSize: 3,
} as const;

// =============================================================================
// VALIDATION & PERFORMANCE
// =============================================================================

/** Input validation bounds */
export const VALIDATION_BOUNDS = {
  /** Maximum allowed coordinate value */
  maxCoordinate: 10000,
  /** Minimum allowed coordinate value */
  minCoordinate: -10000,
} as const;

/** Performance tuning parameters */
export const PERFORMANCE_CONFIG = {
  /** Debounce delay for board validation in milliseconds */
  validationDebounceMs: 100,
  /** Delay before auto-draw triggers in milliseconds */
  autoDrawDelayMs: 150,
} as const;

// =============================================================================
// FUTURE: TIMED GAMEPLAY CONFIGURATION
// =============================================================================

/** Timer and scoring configuration (for future timed mode) */
export const TIMED_GAME_CONFIG = {
  /** Default game duration in seconds */
  defaultDuration: 180, // 3 minutes
  /** Warning threshold in seconds (when timer turns red) */
  warningThreshold: 30,
  /** Time penalty per dump in seconds */
  dumpTimePenalty: 30,
  /** Maximum number of dumps allowed per game */
  maxDumpsPerGame: 3,
  /** Bonus points per second remaining */
  timeBonus: 1,
} as const;

/** Scoring configuration (for future timed mode) */
export const SCORING_CONFIG = {
  /** Base multiplier for word scoring */
  baseMultiplier: 1,
  /** Bonus multiplier for longer words */
  lengthBonusMultiplier: 0.1,
  /** Minimum word length for length bonus */
  lengthBonusThreshold: 5,
} as const;

// =============================================================================
// DEVELOPMENT & TESTING
// =============================================================================

/** Configuration for development and testing */
export const DEV_CONFIG = {
  /** Test seed values for deterministic behavior */
  testSeeds: {
    default: 42,
    alternative: 12345,
    stress: 999,
  },
  /** Debug logging flags */
  debug: {
    rng: false,
    validation: false,
    stateChanges: false,
  },
} as const;

// =============================================================================
// TYPE EXPORTS FOR CONFIGURATION
// =============================================================================

export type GameConfig = {
  ui: typeof CELL_SIZE & typeof GRID_SIZE & typeof ZOOM_CONFIG & typeof TILE_EFFECTS;
  rules: typeof DEFAULT_GAME_RULES & typeof DUMP_CONFIG;
  validation: typeof VALIDATION_BOUNDS;
  performance: typeof PERFORMANCE_CONFIG;
  timed: typeof TIMED_GAME_CONFIG & typeof SCORING_CONFIG;
};

/** Complete game configuration object */
export const GAME_CONFIG: GameConfig = {
  ui: {
    ...ZOOM_CONFIG,
    ...TILE_EFFECTS,
    CELL_SIZE,
    GRID_SIZE,
  },
  rules: {
    ...DEFAULT_GAME_RULES,
    ...DUMP_CONFIG,
  },
  validation: {
    ...VALIDATION_BOUNDS,
  },
  performance: {
    ...PERFORMANCE_CONFIG,
  },
  timed: {
    ...TIMED_GAME_CONFIG,
    ...SCORING_CONFIG,
  },
} as const;