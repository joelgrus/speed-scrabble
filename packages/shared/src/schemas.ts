import { z } from "zod";

// Basic coordinate and orientation schemas
export const CoordZ = z.object({ x: z.number().int(), y: z.number().int() });
export const OrientationZ = z.union([z.literal("H"), z.literal("V")]);

// Letter schema - all valid Scrabble letters
export const LetterZ = z.enum([
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]);

// Tile schemas
export const TileZ = z.object({
  id: z.string(),
  letter: LetterZ,
});

export const PlacedTileZ = z.object({
  id: z.string(),
  letter: LetterZ,
  x: z.number().int(),
  y: z.number().int(),
});

export const BoardZ = z.record(z.string(), PlacedTileZ);

// Game mode schema
export const GameModeZ = z.enum(['classic', 'timed', 'custom']);

// Rules schemas
export const BaseRulesZ = z.object({
  startDraw: z.number().int().min(1).max(15),
  drawAmount: z.number().int().min(1).max(3),
  dumpEnabled: z.boolean(),
});

export const TimedGameRulesZ = BaseRulesZ.extend({
  gameDuration: z.number().int().min(60).max(3600), // 1 minute to 1 hour
  dumpTimePenalty: z.number().int().min(0).max(300), // 0 to 5 minutes penalty
  maxDumps: z.number().int().min(0).max(20),
  timeBonus: z.number().int().min(0).max(100), // points per second
});

export const GameRulesZ = z.object({
  mode: GameModeZ,
  base: BaseRulesZ,
  timed: TimedGameRulesZ.optional(),
});

// Legacy Rules schema for backward compatibility
export const RulesZ = BaseRulesZ;

// Cursor schema
export const CursorZ = z.object({
  pos: CoordZ,
  orient: OrientationZ,
});

// Validation schemas
export const ValidationIssueZ = z.object({
  word: z.string(),
  cells: z.array(CoordZ),
});

export const ValidationResultZ = z.object({
  ok: z.boolean(),
  issues: z.array(ValidationIssueZ),
  connected: z.boolean(),
});
