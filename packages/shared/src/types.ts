export type Letter = 
  "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|
  "N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";

export type TileID = string;

export type Tile = {
  id: TileID;
  letter: Letter;
};

export type Coord = { x: number; y: number }; // integer grid cells

export type PlacedTile = {
  id: TileID;
  letter: Letter;
  x: number;
  y: number;
};

export type Board = Record<string /* `${x},${y}` */, PlacedTile>;

export type GameMode = 'classic' | 'timed' | 'custom';

export interface BaseRules {
  /** Number of tiles drawn at game start */
  startDraw: number;
  /** Number of tiles drawn when rack is empty and board is valid */
  drawAmount: number;
  /** Whether tile dumping is enabled */
  dumpEnabled: boolean;
}

export interface TimedGameRules extends BaseRules {
  /** Game duration in seconds */
  gameDuration: number;
  /** Time penalty per dump in seconds */
  dumpTimePenalty: number;
  /** Maximum dumps allowed per game */
  maxDumps: number;
  /** Bonus points per second remaining */
  timeBonus: number;
}

export interface GameRules {
  /** Current game mode */
  mode: GameMode;
  /** Base game rules */
  base: BaseRules;
  /** Timed mode specific rules (only when mode is 'timed') */
  timed?: TimedGameRules;
}

/** Legacy Rules interface for backward compatibility */
export interface Rules extends BaseRules {}

export type ValidationIssue = {
  word: string;
  cells: Coord[]; // coordinates composing the invalid word
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
  connected: boolean;
};

export type Orientation = "H"|"V";

export type Cursor = {
  pos: Coord;
  orient: Orientation;
};

export type RNG = () => number; // [0,1)
